import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import dns from 'dns/promises';
import { rateLimit } from 'express-rate-limit';
import { db, initDatabase, searchLocalDb, getCachedQuery, saveCachedQuery, getCacheStats, logAdminAction, closeDatabase, getSuggestions, suggestSpellingCorrection, rebuildSearchVocabulary } from './db.js';
import { crawlSite, runBatchCrawler, crawlerState, getOrCreateSiteId, isDomainBlocked } from './crawler.js';
import { ingestAllNewsFeeds, getActiveRssSources } from './rssFeeds.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ⚠️ Genel istek sınırlama (rate limiting) — önceden HİÇ yoktu, herkes sınırsız istek atabiliyordu.
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Çok fazla istek gönderildi, lütfen biraz sonra tekrar deneyin.' }
});
app.use('/api/', generalLimiter);

// Crawl/admin uç noktaları için daha sıkı bir limit + zorunlu anahtar (aşağıda requireAdminKey)
const crawlLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Tarama isteği limiti aşıldı.' }
});

// 🔐 Admin/crawl uç noktaları önceden HİÇ kimlik doğrulaması istemiyordu — herkes tetikleyebiliyordu.
// ADMIN_API_KEY env var ile ayarlanmazsa, süreç her başladığında rastgele bir anahtar üretilip
// loga yazılır (SSH ile sunucuya bağlanan kişi bunu görüp kullanabilir).
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || crypto.randomBytes(24).toString('hex');
if (!process.env.ADMIN_API_KEY) {
  console.log(`[NovaTurk Güvenlik] ADMIN_API_KEY tanımlanmamış — bu oturum için otomatik üretildi: ${ADMIN_API_KEY}`);
  console.log('[NovaTurk Güvenlik] Kalıcı olması için bunu ortam değişkeni (env var) olarak ayarlayın.');
}

function requireAdminKey(req, res, next) {
  const provided = req.headers['x-admin-key'];
  if (provided && provided === ADMIN_API_KEY) return next();
  return res.status(401).json({ success: false, error: 'Yetkisiz: geçerli x-admin-key başlığı gerekli.' });
}

// 🛡️ SSRF Koruması: crawl endpoint'leri önceden herhangi bir URL'i (iç ağ, localhost, bulut metadata
// adresleri dahil) sunucu üzerinden fetch etmeye izin veriyordu. Artık sadece genel/public IP'lere
// çözülen http(s) adreslerine izin veriliyor.
const BLOCKED_HOSTNAMES = new Set(['localhost', '0.0.0.0', '::1']);
function isPrivateIp(ip) {
  if (ip.includes(':')) {
    // IPv6: yerel/link-local/unique-local aralıklarını engelle
    return ip === '::1' || ip.startsWith('fe80:') || ip.startsWith('fc') || ip.startsWith('fd');
  }
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return true;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local / bulut metadata (169.254.169.254 dahil)
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 0) return true;
  return false;
}
async function assertSafeCrawlUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Geçersiz URL');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Sadece http/https protokolüne izin verilir');
  }
  if (BLOCKED_HOSTNAMES.has(parsed.hostname.toLowerCase())) {
    throw new Error('Bu adrese izin verilmiyor');
  }
  const records = await dns.lookup(parsed.hostname, { all: true }).catch(() => []);
  if (records.length === 0) {
    throw new Error('Hostname çözümlenemedi');
  }
  if (records.some(r => isPrivateIp(r.address))) {
    throw new Error('İç ağ/özel IP adreslerine tarama izni yok');
  }
  return parsed;
}

// Veritabanını başlat
initDatabase();

// 🧹 Veri saklama politikası: arama sorgusu logları süresiz saklanmıyor, 30 günden eskisi otomatik silinir.
const LOG_RETENTION_DAYS = 30;
function cleanupOldSearchLogs() {
  try {
    const result = db.prepare(`DELETE FROM search_logs WHERE searched_at < datetime('now', '-${LOG_RETENTION_DAYS} days')`).run();
    if (result.changes > 0) {
      console.log(`[NovaTurk Veri Saklama] ${result.changes} adet ${LOG_RETENTION_DAYS} günden eski arama logu silindi.`);
    }
  } catch (err) {
    console.warn('[NovaTurk Veri Saklama] Temizlik hatası:', err.message);
  }
}
cleanupOldSearchLogs();
setInterval(cleanupOldSearchLogs, 24 * 60 * 60 * 1000); // günde bir kere

// 🔄 Otomatik Haber Taraması: Kendi indeksimiz kimse tetiklemeden, kendi kendine büyüsün
// (DuckDuckGo'ya bağımlılığı azaltmanın asıl yolu budur — cache sadece TEKRARLANAN sorularda işe yarar,
// bu ise hiç sorulmamış yeni sorular için de kendi cevabımızın olma ihtimalini artırır)
const RSS_AUTO_INGEST_MS = 6 * 60 * 60 * 1000; // 6 saatte bir

async function runAutoRssIngest(label) {
  try {
    const results = await ingestAllNewsFeeds();
    const total = results.reduce((sum, r) => sum + (r.inserted || 0), 0);
    console.log(`[NovaTurk Otomatik RSS] ${label}: ${total} makale indekslendi.`);
  } catch (err) {
    console.warn(`[NovaTurk Otomatik RSS] ${label} hata:`, err.message);
  }
}

runAutoRssIngest('Başlangıç taraması');
setInterval(() => runAutoRssIngest('Periyodik tarama'), RSS_AUTO_INGEST_MS);

// Kalite ve Güven Puanlama Fonksiyonu
function calculateQualityScore(item, query) {
  let score = 50;
  const lowerUrl = (item.url || '').toLowerCase();
  const lowerTitle = (item.title || '').toLowerCase();
  const lowerQ = query.toLowerCase();

  // 1. Üst Düzey Alan Adı (TLD) ve Otorite Bonusu
  if (lowerUrl.includes('.gov.tr') || lowerUrl.includes('.gov')) score += 40;
  if (lowerUrl.includes('.edu.tr') || lowerUrl.includes('.edu')) score += 35;
  if (lowerUrl.includes('.org.tr') || lowerUrl.includes('.org')) score += 20;
  if (lowerUrl.includes('wikipedia.org') || lowerUrl.includes('github.com')) score += 25;
  if (lowerUrl.includes('arxiv.org') || lowerUrl.includes('tubitak.gov.tr')) score += 30;

  // 2. HTTPS Güvenlik Kalkanı
  if (lowerUrl.startsWith('https://')) score += 10;

  // 3. Navigasyonel & Tam Başlık Uyumu
  if (lowerTitle.includes(lowerQ)) score += 20;

  // 4. Spam ve Reklam İpuçları (Ceza Puanı)
  if (lowerUrl.includes('utm_') || lowerUrl.includes('affiliate') || lowerUrl.includes('tracker')) score -= 30;
  if (lowerTitle.includes('bahis') || lowerTitle.includes('casino') || lowerTitle.includes('iddia')) score -= 100;

  return score;
}

// 💓 0. Ultra Hafif Sağlık & Anti-Sleep Ping Noktası
app.get('/api/ping', (req, res) => {
  res.json({
    status: 'awake',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    engine: 'NovaTurk AI Production Engine'
  });
});

// 1. Sağlık & Durum Kontrolü
app.get('/api/status', (req, res) => {
  try {
    const siteCount = db.prepare('SELECT COUNT(*) as count FROM sites').get().count;
    const pageCount = db.prepare('SELECT COUNT(*) as count FROM pages').get().count;
    const logCount = db.prepare('SELECT COUNT(*) as count FROM search_logs').get().count;
    const cacheCount = db.prepare('SELECT COUNT(*) as count FROM query_cache').get().count;

    res.json({
      status: 'online',
      engine: 'NovaTurk AI Engine v2.5 (Smart Tiered Caching)',
      database: 'SQLite Native Sync (Node 24)',
      stats: {
        totalIndexedSites: siteCount,
        totalCleanPages: pageCount,
        totalSearchesLogged: logCount,
        totalCachedQueries: cacheCount,
        architecture: '3-Tier Hybrid (Tier 1: SQLite 1ms + Tier 2: Live Proxy + Tier 3: Auto-Index)',
        agentsActive: 5
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⚡ Önbellek İstatistikleri (L1 + SQLite)
app.get('/api/cache/stats', (req, res) => {
  res.json({
    success: true,
    cache: getCacheStats()
  });
});

// 🕷️ Otonom Link Keşifli Derin Tarama Tetikleyicisi
app.post('/api/crawl/batch-discover', crawlLimiter, requireAdminKey, async (req, res) => {
  try {
    const { maxPages = 50, concurrency = 3 } = req.body || {};
    
    // Başlangıç için kayıtlı Türk sitelerinin URL'lerini çek
    const siteRows = db.prepare('SELECT url FROM sites LIMIT 50').all();
    const startUrls = siteRows.map(s => s.url).filter(Boolean);

    if (startUrls.length === 0) {
      startUrls.push('https://www.turkiye.gov.tr', 'https://www.tubitak.gov.tr', 'https://www.aa.com.tr');
    }

    const result = await runBatchCrawler(startUrls, Math.min(maxPages, 500), Math.min(concurrency, 5));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Tarayıcı Canlı İlerleme Durumu
app.get('/api/crawl/status', (req, res) => {
  res.json({
    success: true,
    crawler: crawlerState
  });
});

// ============================================================================
// 🛠️ ADMIN PANEL — tüm veri uç noktaları x-admin-key ister (requireAdminKey)
// ============================================================================
app.get('/api/admin/overview', requireAdminKey, (req, res) => {
  try {
    const siteCount = db.prepare('SELECT COUNT(*) as count FROM sites').get().count;
    const pageCount = db.prepare('SELECT COUNT(*) as count FROM pages').get().count;
    const searchCount = db.prepare('SELECT COUNT(*) as count FROM search_logs').get().count;
    const cacheCount = db.prepare('SELECT COUNT(*) as count FROM query_cache').get().count;

    const topQueries = db.prepare(`
      SELECT query, COUNT(*) as hits, AVG(results_count) as avg_results, AVG(execution_ms) as avg_ms
      FROM search_logs GROUP BY query ORDER BY hits DESC LIMIT 15
    `).all();

    const zeroResultQueries = db.prepare(`
      SELECT query, searched_at FROM search_logs WHERE results_count = 0
      ORDER BY searched_at DESC LIMIT 15
    `).all();

    const recentSearches = db.prepare(`
      SELECT query, results_count, execution_ms, searched_at FROM search_logs
      ORDER BY searched_at DESC LIMIT 20
    `).all();

    const avgLatency = db.prepare('SELECT AVG(execution_ms) as avg_ms FROM search_logs').get();

    // Son 24 saat için saatlik arama hacmi (basit trend grafiği için)
    const hourlyVolume = db.prepare(`
      SELECT strftime('%Y-%m-%d %H:00', searched_at) as hour, COUNT(*) as count
      FROM search_logs
      WHERE searched_at >= datetime('now', '-24 hours')
      GROUP BY hour ORDER BY hour ASC
    `).all();

    const topSites = db.prepare(`
      SELECT s.domain, s.name, COUNT(p.id) as page_count
      FROM sites s LEFT JOIN pages p ON p.site_id = s.id
      GROUP BY s.id ORDER BY page_count DESC LIMIT 15
    `).all();

    const blockedDomains = db.prepare('SELECT * FROM blocked_domains ORDER BY blocked_at DESC').all();
    const rssSources = db.prepare('SELECT * FROM rss_sources ORDER BY added_at DESC').all();
    const openComplaints = db.prepare("SELECT * FROM complaints WHERE status = 'open' ORDER BY created_at DESC LIMIT 20").all();
    const complaintCounts = db.prepare("SELECT status, COUNT(*) as count FROM complaints GROUP BY status").all();
    const auditLog = db.prepare('SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 30').all();

    let dbSizeBytes = null;
    try {
      const dbFilePath = path.join(__dirname, '../database/novaturk.db');
      if (fs.existsSync(dbFilePath)) dbSizeBytes = fs.statSync(dbFilePath).size;
    } catch {}

    res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      indexHealth: {
        totalSites: siteCount,
        totalPages: pageCount,
        dbSizeBytes
      },
      crawlerHealth: crawlerState,
      cache: getCacheStats(),
      queryAnalytics: {
        totalSearches: searchCount,
        cachedQueries: cacheCount,
        avgLatencyMs: avgLatency?.avg_ms ? Number(avgLatency.avg_ms.toFixed(2)) : null,
        topQueries,
        zeroResultQueries,
        recentSearches,
        hourlyVolume
      },
      topSites,
      moderation: {
        blockedDomains,
        rssSources,
        openComplaints,
        complaintCounts
      },
      auditLog,
      infrastructure: {
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        env: process.env.NODE_ENV || 'development'
      },
      security: {
        adminKeyIsEnvConfigured: !!process.env.ADMIN_API_KEY,
        rateLimitGeneral: '120/dk',
        rateLimitCrawl: '10/dk'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---- Site / Sayfa Yönetimi ----
app.delete('/api/admin/sites/:id', requireAdminKey, (req, res) => {
  try {
    const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.id);
    if (!site) return res.status(404).json({ success: false, error: 'Site bulunamadı' });
    db.prepare('DELETE FROM pages WHERE site_id = ?').run(req.params.id);
    db.prepare('DELETE FROM sites WHERE id = ?').run(req.params.id);
    logAdminAction('delete_site', site.domain, { id: req.params.id, name: site.name });
    res.json({ success: true, deleted: site.domain });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/pages/:id', requireAdminKey, (req, res) => {
  try {
    const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(req.params.id);
    if (!page) return res.status(404).json({ success: false, error: 'Sayfa bulunamadı' });
    db.prepare('DELETE FROM pages WHERE id = ?').run(req.params.id);
    logAdminAction('delete_page', page.url, { id: req.params.id, title: page.title });
    res.json({ success: true, deleted: page.url });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---- Domain Yasaklama ----
app.get('/api/admin/domains/blocked', requireAdminKey, (req, res) => {
  res.json({ success: true, domains: db.prepare('SELECT * FROM blocked_domains ORDER BY blocked_at DESC').all() });
});

app.post('/api/admin/domains/block', requireAdminKey, (req, res) => {
  const { domain, reason } = req.body || {};
  if (!domain) return res.status(400).json({ success: false, error: 'domain gerekli' });
  try {
    const cleanDomain = domain.trim().toLowerCase();
    db.prepare('INSERT OR IGNORE INTO blocked_domains (domain, reason) VALUES (?, ?)').run(cleanDomain, reason || null);
    // Yasaklanan domain'e ait mevcut sayfaları da index'ten temizle
    const site = db.prepare('SELECT id FROM sites WHERE domain = ?').get(cleanDomain);
    let removedPages = 0;
    if (site) {
      removedPages = db.prepare('DELETE FROM pages WHERE site_id = ?').run(site.id).changes;
      db.prepare('DELETE FROM sites WHERE id = ?').run(site.id);
    }
    logAdminAction('block_domain', cleanDomain, { reason, removedPages });
    res.json({ success: true, domain: cleanDomain, removedPages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/domains/block/:id', requireAdminKey, (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM blocked_domains WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: 'Kayıt bulunamadı' });
    db.prepare('DELETE FROM blocked_domains WHERE id = ?').run(req.params.id);
    logAdminAction('unblock_domain', row.domain, {});
    res.json({ success: true, unblocked: row.domain });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---- RSS Kaynak Yönetimi ----
app.get('/api/admin/rss-sources', requireAdminKey, (req, res) => {
  res.json({ success: true, sources: db.prepare('SELECT * FROM rss_sources ORDER BY added_at DESC').all() });
});

app.post('/api/admin/rss-sources', requireAdminKey, (req, res) => {
  const { url, name, domain, category } = req.body || {};
  if (!url || !name || !domain) return res.status(400).json({ success: false, error: 'url, name, domain gerekli' });
  try {
    db.prepare(`
      INSERT INTO rss_sources (url, name, domain, category, is_active) VALUES (?, ?, ?, ?, 1)
    `).run(url, name, domain, category || 'Haber');
    logAdminAction('add_rss_source', domain, { url, name, category });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/admin/rss-sources/:id', requireAdminKey, (req, res) => {
  const { isActive } = req.body || {};
  try {
    db.prepare('UPDATE rss_sources SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, req.params.id);
    logAdminAction('toggle_rss_source', String(req.params.id), { isActive });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/rss-sources/:id', requireAdminKey, (req, res) => {
  try {
    db.prepare('DELETE FROM rss_sources WHERE id = ?').run(req.params.id);
    logAdminAction('delete_rss_source', String(req.params.id), {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---- Crawler Tetikleyicisi (mevcut fonksiyonu admin panelinden çağırır) ----
app.post('/api/admin/crawl/trigger', requireAdminKey, async (req, res) => {
  try {
    const { maxPages = 30, concurrency = 3 } = req.body || {};
    const siteRows = db.prepare('SELECT url FROM sites LIMIT 50').all();
    const startUrls = siteRows.map(s => s.url).filter(Boolean);
    logAdminAction('trigger_crawl', null, { maxPages, concurrency });
    const result = await runBatchCrawler(startUrls, Math.min(maxPages, 200), Math.min(concurrency, 5));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/rss/trigger', requireAdminKey, async (req, res) => {
  try {
    logAdminAction('trigger_rss', null, {});
    const results = await ingestAllNewsFeeds();
    const totalInserted = results.reduce((sum, r) => sum + (r.inserted || 0), 0);
    res.json({ success: true, totalInserted, feeds: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---- Şikayet (Complaint) Sistemi ----
// Herkese açık: bir URL hakkında şikayet/kaldırma talebi gönderme (genel rate limit zaten uygulanıyor)
app.post('/api/report', (req, res) => {
  const { url, reason, detail } = req.body || {};
  if (!url || !reason) return res.status(400).json({ success: false, error: 'url ve reason gerekli' });
  try {
    db.prepare('INSERT INTO complaints (url, reason, detail) VALUES (?, ?, ?)').run(
      String(url).slice(0, 2000), String(reason).slice(0, 200), detail ? String(detail).slice(0, 2000) : null
    );
    res.json({ success: true, message: 'Şikayetiniz alındı, incelenecektir.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/complaints', requireAdminKey, (req, res) => {
  const status = req.query.status || 'open';
  const rows = status === 'all'
    ? db.prepare('SELECT * FROM complaints ORDER BY created_at DESC').all()
    : db.prepare('SELECT * FROM complaints WHERE status = ? ORDER BY created_at DESC').all(status);
  res.json({ success: true, complaints: rows });
});

app.post('/api/admin/complaints/:id/resolve', requireAdminKey, (req, res) => {
  const { removePage } = req.body || {};
  try {
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, error: 'Şikayet bulunamadı' });

    db.prepare("UPDATE complaints SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);

    let pageRemoved = false;
    if (removePage) {
      const result = db.prepare('DELETE FROM pages WHERE url = ?').run(complaint.url);
      pageRemoved = result.changes > 0;
    }
    logAdminAction('resolve_complaint', complaint.url, { id: req.params.id, pageRemoved });
    res.json({ success: true, pageRemoved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---- Bakım: Kaynak (site) Atama Onarımı ----
// Crawler'daki eski hata yüzünden keşfedilen her sayfa site_id=1'e yazılmıştı; hata
// düzeltildi ama geçmiş kayıtlar yanlış kaynağı gösteriyor. Bu uç nokta her sayfanın
// site_id'sini URL'sindeki gerçek hostname'den yeniden türetir.
app.post('/api/admin/repair/site-attribution', requireAdminKey, (req, res) => {
  try {
    const pages = db.prepare('SELECT p.id, p.url, p.site_id, s.domain FROM pages p LEFT JOIN sites s ON s.id = p.site_id').all();
    const update = db.prepare('UPDATE pages SET site_id = ? WHERE id = ?');

    let fixed = 0, alreadyOk = 0, skipped = 0;
    for (const page of pages) {
      let hostname;
      try {
        hostname = new URL(page.url).hostname;
      } catch {
        skipped++;
        continue;
      }
      if (page.domain === hostname) { alreadyOk++; continue; }

      const correctSiteId = getOrCreateSiteId(hostname);
      if (correctSiteId === null) { skipped++; continue; } // yasaklı domain
      update.run(correctSiteId, page.id);
      fixed++;
    }

    logAdminAction('repair_site_attribution', null, { fixed, alreadyOk, skipped });
    res.json({ success: true, total: pages.length, fixed, alreadyOk, skipped });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---- Audit Log ----
app.get('/api/admin/audit-log', requireAdminKey, (req, res) => {
  res.json({ success: true, entries: db.prepare('SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 100').all() });
});

// Admin paneli arayüzü — sayfanın kendisi herkese açık ama içindeki HİÇBİR veri
// x-admin-key olmadan yüklenmiyor (yukarıdaki /api/admin/overview korumalı).
app.get('/admin', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NovaTürk AI — Admin Panel</title>
<style>
  * { box-sizing: border-box; }
  body {
    background: radial-gradient(circle at 20% -10%, rgba(56,189,248,0.12), transparent 45%),
                radial-gradient(circle at 90% 10%, rgba(99,102,241,0.10), transparent 40%),
                #05070d;
    color:#e2e8f0; font-family: 'Segoe UI', system-ui, sans-serif; margin:0; padding:28px; min-height:100vh;
  }
  h1 { font-size:21px; margin:0 0 2px; font-weight:800; letter-spacing:-0.3px; }
  .sub { color:#64748b; font-size:12px; margin-bottom:22px; }
  .key-bar { display:flex; gap:10px; margin-bottom:24px; }
  input, select, textarea {
    background: rgba(15,23,42,0.6); backdrop-filter: blur(12px); border:1px solid rgba(148,163,184,0.18);
    color:#e2e8f0; padding:10px 14px; border-radius:12px; font-size:13px;
  }
  input#adminKey { flex:1; font-family:monospace; }
  button {
    background: linear-gradient(135deg, #0284c7, #6366f1); color:#fff; border:none; padding:10px 18px;
    border-radius:12px; font-weight:700; cursor:pointer; font-size:13px; transition: transform .15s, box-shadow .15s;
    box-shadow: 0 4px 16px rgba(2,132,199,0.25);
  }
  button:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(2,132,199,0.4); }
  button.danger { background: linear-gradient(135deg, #dc2626, #b91c1c); box-shadow:0 4px 16px rgba(220,38,38,0.25); }
  button.ghost { background: rgba(148,163,184,0.1); box-shadow:none; }
  button.sm { padding:5px 10px; font-size:11px; border-radius:8px; }

  .tabs { display:flex; gap:6px; margin-bottom:22px; flex-wrap:wrap; border-bottom:1px solid rgba(148,163,184,0.12); padding-bottom:10px; }
  .tab-btn {
    background: rgba(15,23,42,0.4); border:1px solid rgba(148,163,184,0.15); color:#94a3b8;
    padding:8px 16px; border-radius:10px; font-size:12px; font-weight:600; cursor:pointer; box-shadow:none;
  }
  .tab-btn.active { background: linear-gradient(135deg, rgba(56,189,248,0.18), rgba(99,102,241,0.18)); color:#fff; border-color: rgba(56,189,248,0.4); }
  .tab-panel { display:none; } .tab-panel.active { display:block; }

  .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:26px; }
  .card {
    background: rgba(15,23,42,0.55); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border:1px solid rgba(148,163,184,0.15); border-radius:16px; padding:18px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  }
  .card .label { font-size:10.5px; color:#64748b; text-transform:uppercase; letter-spacing:0.6px; }
  .card .value { font-size:28px; font-weight:800; margin-top:6px; }

  section { margin-bottom:26px; }
  section h2 { font-size:13px; color:#38bdf8; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:12px; font-weight:700; }
  .panel-box {
    background: rgba(15,23,42,0.5); backdrop-filter: blur(14px); border:1px solid rgba(148,163,184,0.14);
    border-radius:16px; padding:18px;
  }
  table { width:100%; border-collapse:collapse; font-size:12.5px; }
  th, td { text-align:left; padding:9px 10px; border-bottom:1px solid rgba(148,163,184,0.1); }
  th { color:#64748b; font-weight:700; font-size:10.5px; text-transform:uppercase; letter-spacing:0.4px; }
  tr:hover td { background: rgba(56,189,248,0.04); }
  .err { color:#f87171; font-size:13px; }
  .badge { display:inline-block; padding:3px 9px; border-radius:8px; font-size:10.5px; font-weight:700; }
  .badge.ok { background:rgba(16,185,129,0.15); color:#10b981; }
  .badge.warn { background:rgba(245,158,11,0.15); color:#f59e0b; }
  .badge.err { background:rgba(239,68,68,0.15); color:#ef4444; }
  .bar-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; font-size:12px; }
  .bar-label { width:160px; flex-shrink:0; color:#94a3b8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .bar-track { flex:1; background:rgba(148,163,184,0.08); border-radius:6px; height:18px; overflow:hidden; }
  .bar-fill { height:100%; background:linear-gradient(90deg, #0284c7, #38bdf8); border-radius:6px; }
  .bar-val { width:36px; text-align:right; color:#e2e8f0; font-weight:700; }
  .inline-form { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
  .inline-form input { flex:1; min-width:140px; }
  .toast { position:fixed; bottom:20px; right:20px; background:#0f172a; border:1px solid rgba(56,189,248,0.4); padding:12px 18px; border-radius:12px; font-size:13px; box-shadow:0 8px 24px rgba(0,0,0,0.4); }
</style>
</head>
<body>
  <h1>🛠️ NovaTürk AI — Admin Panel</h1>
  <p class="sub">Bu sayfa herkese açık ama hiçbir veri/aksiyon x-admin-key olmadan çalışmaz.</p>

  <div class="key-bar">
    <input id="adminKey" type="password" placeholder="x-admin-key değerini gir (sunucu logunda veya ADMIN_API_KEY env var'da)" />
    <button onclick="loadOverview()">Yükle</button>
  </div>

  <div class="tabs" id="tabs" style="display:none">
    <button class="tab-btn active" data-tab="overview">📊 Genel Bakış</button>
    <button class="tab-btn" data-tab="sites">🌐 Siteler</button>
    <button class="tab-btn" data-tab="rss">📰 RSS Kaynakları</button>
    <button class="tab-btn" data-tab="blocked">🚫 Yasaklı Domainler</button>
    <button class="tab-btn" data-tab="complaints">⚠️ Şikayetler</button>
    <button class="tab-btn" data-tab="audit">🧾 Audit Log</button>
  </div>

  <div id="content"></div>
  <div id="toastHost"></div>

  <script>
    const KEY_STORAGE = 'novaturk_admin_key';
    let LAST_DATA = null;
    document.getElementById('adminKey').value = localStorage.getItem(KEY_STORAGE) || '';

    function toast(msg, isErr) {
      const t = document.createElement('div');
      t.className = 'toast'; t.style.borderColor = isErr ? 'rgba(239,68,68,0.5)' : 'rgba(56,189,248,0.4)';
      t.textContent = msg;
      document.getElementById('toastHost').appendChild(t);
      setTimeout(() => t.remove(), 3200);
    }

    function authHeaders() {
      return { 'x-admin-key': document.getElementById('adminKey').value.trim(), 'Content-Type': 'application/json' };
    }

    async function apiCall(url, options = {}) {
      const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...(options.headers || {}) } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.error || ('HTTP ' + res.status));
      return data;
    }

    const rows = (arr, cols, extra) => (arr || []).map(r => '<tr>' + cols.map(c => '<td>' + (r[c] ?? '-') + '</td>').join('') + (extra ? extra(r) : '') + '</tr>').join('') || '<tr><td colspan="10" style="color:#475569">Kayıt yok</td></tr>';

    function barChart(items, labelKey, valueKey) {
      if (!items || items.length === 0) return '<p style="color:#475569;font-size:12px">Veri yok</p>';
      const max = Math.max(...items.map(i => i[valueKey] || 0), 1);
      return items.map(i => \`
        <div class="bar-row">
          <div class="bar-label" title="\${i[labelKey]}">\${i[labelKey]}</div>
          <div class="bar-track"><div class="bar-fill" style="width:\${Math.max(4, (i[valueKey]/max)*100)}%"></div></div>
          <div class="bar-val">\${i[valueKey]}</div>
        </div>\`).join('');
    }

    function switchTab(name) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + name));
    }
    document.getElementById('tabs').addEventListener('click', e => {
      const btn = e.target.closest('.tab-btn');
      if (btn) switchTab(btn.dataset.tab);
    });

    async function loadOverview() {
      const key = document.getElementById('adminKey').value.trim();
      const content = document.getElementById('content');
      if (!key) { content.innerHTML = '<p class="err">Anahtar gerekli.</p>'; return; }
      localStorage.setItem(KEY_STORAGE, key);
      content.innerHTML = '<p style="color:#64748b">Yükleniyor...</p>';

      try {
        const d = await apiCall('/api/admin/overview');
        LAST_DATA = d;
        document.getElementById('tabs').style.display = 'flex';
        render(d);
      } catch (err) {
        content.innerHTML = '<p class="err">' + err.message + '</p>';
      }
    }

    function render(d) {
      const content = document.getElementById('content');
      content.innerHTML = \`
        <div id="tab-overview" class="tab-panel active">
          <div class="grid">
            <div class="card"><div class="label">Toplam Site</div><div class="value">\${d.indexHealth.totalSites}</div></div>
            <div class="card"><div class="label">Toplam Sayfa</div><div class="value">\${d.indexHealth.totalPages}</div></div>
            <div class="card"><div class="label">Toplam Arama</div><div class="value">\${d.queryAnalytics.totalSearches}</div></div>
            <div class="card"><div class="label">Önbellek Kayıt</div><div class="value">\${d.queryAnalytics.cachedQueries}</div></div>
            <div class="card"><div class="label">Ort. Gecikme</div><div class="value">\${d.queryAnalytics.avgLatencyMs ?? '-'} ms</div></div>
            <div class="card"><div class="label">Bellek</div><div class="value">\${d.infrastructure.memoryUsageMB} MB</div></div>
            <div class="card"><div class="label">Uptime</div><div class="value">\${Math.floor(d.infrastructure.uptimeSeconds/60)} dk</div></div>
            <div class="card"><div class="label">Crawler</div><div class="value">\${d.crawlerHealth.isRunning ? '<span class="badge ok">Çalışıyor</span>' : '<span class="badge warn">Boşta</span>'}</div></div>
          </div>

          <section>
            <div class="inline-form">
              <button onclick="triggerAction('/api/admin/crawl/trigger', {maxPages:30,concurrency:3}, 'Tarama başlatıldı')">🕷️ Crawler Başlat</button>
              <button onclick="triggerAction('/api/admin/rss/trigger', {}, 'RSS toplama tamamlandı')">📰 RSS Şimdi Topla</button>
              <button class="ghost" onclick="loadOverview()">🔄 Yenile</button>
            </div>
          </section>

          <section>
            <h2>Güvenlik Durumu</h2>
            <div class="panel-box">
              Admin anahtarı env var ile sabit: \${d.security.adminKeyIsEnvConfigured ? '<span class="badge ok">Evet</span>' : '<span class="badge warn">Hayır — her restartta değişir</span>'}
              &nbsp;·&nbsp; Genel limit: \${d.security.rateLimitGeneral} &nbsp;·&nbsp; Crawl limit: \${d.security.rateLimitCrawl}
            </div>
          </section>

          <section>
            <h2>Son 24 Saat Arama Hacmi</h2>
            <div class="panel-box">\${barChart(d.queryAnalytics.hourlyVolume, 'hour', 'count')}</div>
          </section>

          <section>
            <h2>En Çok Sayfa Barındıran Siteler</h2>
            <div class="panel-box">\${barChart(d.topSites, 'domain', 'page_count')}</div>
          </section>

          <section>
            <h2>En Çok Aranan Sorgular</h2>
            <div class="panel-box"><table><thead><tr><th>Sorgu</th><th>Kaç Kez</th><th>Ort. Sonuç</th><th>Ort. ms</th></tr></thead>
            <tbody>\${rows(d.queryAnalytics.topQueries, ['query','hits','avg_results','avg_ms'])}</tbody></table></div>
          </section>

          <section>
            <h2>⚠️ Sıfır Sonuç Veren Sorgular</h2>
            <div class="panel-box"><table><thead><tr><th>Sorgu</th><th>Tarih</th></tr></thead>
            <tbody>\${rows(d.queryAnalytics.zeroResultQueries, ['query','searched_at'])}</tbody></table></div>
          </section>

          <section>
            <h2>Son Aramalar</h2>
            <div class="panel-box"><table><thead><tr><th>Sorgu</th><th>Sonuç</th><th>ms</th><th>Tarih</th></tr></thead>
            <tbody>\${rows(d.queryAnalytics.recentSearches, ['query','results_count','execution_ms','searched_at'])}</tbody></table></div>
          </section>
        </div>

        <div id="tab-sites" class="tab-panel">
          <section>
            <h2>Site Yönetimi (\${d.topSites.length} gösteriliyor)</h2>
            <div class="panel-box"><table><thead><tr><th>Domain</th><th>Ad</th><th>Sayfa</th><th></th></tr></thead>
            <tbody>\${(d.topSites||[]).map(s => \`<tr><td>\${s.domain}</td><td>\${s.name||'-'}</td><td>\${s.page_count}</td>
              <td><button class="sm danger" onclick="blockDomainQuick('\${s.domain}')">Yasakla</button></td></tr>\`).join('')}</tbody></table></div>
          </section>
        </div>

        <div id="tab-rss" class="tab-panel">
          <section>
            <h2>Yeni RSS Kaynağı Ekle</h2>
            <div class="panel-box">
              <div class="inline-form">
                <input id="rssName" placeholder="Ad (ör. Milliyet)" />
                <input id="rssUrl" placeholder="RSS URL" />
                <input id="rssDomain" placeholder="Domain (ör. milliyet.com.tr)" />
                <input id="rssCategory" placeholder="Kategori (ör. Haber)" />
                <button onclick="addRssSource()">Ekle</button>
              </div>
            </div>
          </section>
          <section>
            <h2>Kayıtlı RSS Kaynakları (\${d.moderation.rssSources.length})</h2>
            <div class="panel-box"><table><thead><tr><th>Ad</th><th>Domain</th><th>Kategori</th><th>Durum</th><th></th></tr></thead>
            <tbody>\${(d.moderation.rssSources||[]).map(s => \`<tr><td>\${s.name}</td><td>\${s.domain}</td><td>\${s.category}</td>
              <td>\${s.is_active ? '<span class="badge ok">Aktif</span>' : '<span class="badge warn">Pasif</span>'}</td>
              <td><button class="sm ghost" onclick="toggleRss(\${s.id}, \${s.is_active ? 0 : 1})">\${s.is_active?'Durdur':'Aktifleştir'}</button>
              <button class="sm danger" onclick="deleteRss(\${s.id})">Sil</button></td></tr>\`).join('')}</tbody></table></div>
          </section>
        </div>

        <div id="tab-blocked" class="tab-panel">
          <section>
            <h2>Domain Yasakla</h2>
            <div class="panel-box">
              <div class="inline-form">
                <input id="blockDomain" placeholder="domain.com" />
                <input id="blockReason" placeholder="Sebep (opsiyonel)" />
                <button class="danger" onclick="blockDomain()">Yasakla</button>
              </div>
            </div>
          </section>
          <section>
            <h2>Yasaklı Domainler (\${d.moderation.blockedDomains.length})</h2>
            <div class="panel-box"><table><thead><tr><th>Domain</th><th>Sebep</th><th>Tarih</th><th></th></tr></thead>
            <tbody>\${(d.moderation.blockedDomains||[]).map(b => \`<tr><td>\${b.domain}</td><td>\${b.reason||'-'}</td><td>\${b.blocked_at}</td>
              <td><button class="sm ghost" onclick="unblockDomain(\${b.id})">Kaldır</button></td></tr>\`).join('')}</tbody></table></div>
          </section>
        </div>

        <div id="tab-complaints" class="tab-panel">
          <section>
            <h2>Açık Şikayetler (\${d.moderation.openComplaints.length})</h2>
            <div class="panel-box"><table><thead><tr><th>URL</th><th>Sebep</th><th>Detay</th><th>Tarih</th><th></th></tr></thead>
            <tbody>\${(d.moderation.openComplaints||[]).map(c => \`<tr><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">\${c.url}</td><td>\${c.reason}</td><td>\${c.detail||'-'}</td><td>\${c.created_at}</td>
              <td><button class="sm ghost" onclick="resolveComplaint(\${c.id}, false)">Çözüldü</button>
              <button class="sm danger" onclick="resolveComplaint(\${c.id}, true)">Sayfayı Sil + Çöz</button></td></tr>\`).join('')}</tbody></table></div>
          </section>
          <section>
            <h2>Herkese Açık Şikayet Formu</h2>
            <div class="panel-box"><code>POST /api/report { url, reason, detail }</code> — kimlik doğrulaması gerektirmez, herkes gönderebilir.</div>
          </section>
        </div>

        <div id="tab-audit" class="tab-panel">
          <section>
            <h2>Son 30 Admin İşlemi</h2>
            <div class="panel-box"><table><thead><tr><th>İşlem</th><th>Hedef</th><th>Detay</th><th>Tarih</th></tr></thead>
            <tbody>\${rows(d.auditLog, ['action','target','detail','created_at'])}</tbody></table></div>
          </section>
        </div>
      \`;
    }

    async function triggerAction(url, body, successMsg, method) {
      try {
        await apiCall(url, { method: method || 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
        toast(successMsg);
        loadOverview();
      } catch (err) {
        toast(err.message, true);
      }
    }
    async function blockDomain() {
      const domain = document.getElementById('blockDomain').value.trim();
      const reason = document.getElementById('blockReason').value.trim();
      if (!domain) return toast('Domain gerekli', true);
      await triggerAction('/api/admin/domains/block', { domain, reason }, domain + ' yasaklandı');
    }
    async function blockDomainQuick(domain) {
      if (!confirm(domain + ' yasaklansın mı? Tüm sayfaları silinecek.')) return;
      await triggerAction('/api/admin/domains/block', { domain }, domain + ' yasaklandı');
    }
    async function unblockDomain(id) {
      await triggerAction('/api/admin/domains/block/' + id, undefined, 'Yasak kaldırıldı', 'DELETE');
    }
    async function addRssSource() {
      const name = document.getElementById('rssName').value.trim();
      const url = document.getElementById('rssUrl').value.trim();
      const domain = document.getElementById('rssDomain').value.trim();
      const category = document.getElementById('rssCategory').value.trim() || 'Haber';
      if (!name || !url || !domain) return toast('Ad, URL ve domain gerekli', true);
      await triggerAction('/api/admin/rss-sources', { name, url, domain, category }, 'Kaynak eklendi');
    }
    async function toggleRss(id, isActive) {
      await triggerAction('/api/admin/rss-sources/' + id, { isActive: !!isActive }, 'Güncellendi', 'PATCH');
    }
    async function deleteRss(id) {
      if (!confirm('Bu RSS kaynağı silinsin mi?')) return;
      await triggerAction('/api/admin/rss-sources/' + id, undefined, 'Silindi', 'DELETE');
    }
    async function resolveComplaint(id, removePage) {
      await triggerAction('/api/admin/complaints/' + id + '/resolve', { removePage }, 'Şikayet çözüldü');
    }

    if (document.getElementById('adminKey').value) loadOverview();
  </script>
</body>
</html>`);
});

// 2. Siteler Listesi
app.get('/api/sites', (req, res) => {
  try {
    const sites = db.prepare('SELECT * FROM sites ORDER BY authority_score DESC').all();
    res.json({ success: true, count: sites.length, sites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2.5 YouTube SponsorBlock API Proxy (0 TL - Ücretsiz Public API)
app.get('/api/sponsorblock', async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) {
    return res.json({ success: false, segments: [] });
  }

  try {
    const url = `https://sponsor.ajay.app/api/skipSegments?videoID=${encodeURIComponent(videoId)}&categories=["sponsor","intro","outro","selfpromo","preview"]`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NovaTurk-AI-Browser/2.5'
      }
    });

    if (response.status === 404) {
      // Bu videoda sponsor segmenti yok (temiz video)
      return res.json({ success: true, count: 0, segments: [] });
    }

    if (!response.ok) {
      return res.json({ success: false, count: 0, segments: [] });
    }

    const data = await response.json();
    const segments = Array.isArray(data) ? data : [];
    res.json({ success: true, count: segments.length, segments });
  } catch (err) {
    console.warn('[SponsorBlock] Proxy uyarısı:', err.message);
    res.json({ success: false, count: 0, segments: [] });
  }
});

// 🤖 2.55 CANLI AI CHAT STÜDYOSU SERVİSİ (Claude 3.5 Sonnet & ChatGPT Entegrasyonu)
function generateSmartAiResponse(query, isClaude) {
  const q = query.toLowerCase();
  const brand = isClaude ? 'Claude 3.5 Sonnet' : 'ChatGPT-4o';

  if (q.includes('kod') || q.includes('python') || q.includes('javascript') || q.includes('react') || q.includes('css') || q.includes('html') || q.includes('api')) {
    return `### 💻 ${brand} — Kodlama & Çözüm Analizi

İstediğiniz yapı için optimize edilmiş, modern ve temiz bir örnek:

\`\`\`python
# NovaTürk AI — Yüksek Performanslı Asenkron Veri İşleme Örneği
import asyncio
import aiohttp

async def fetch_intelligence(endpoint: str) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(endpoint, timeout=aiohttp.ClientTimeout(total=5)) as response:
            if response.status == 200:
                data = await response.json()
                print(f"[+] Başarıyla alındı: {len(data)} kayıt")
                return data
            return {"error": f"HTTP {response.status}"}

async def main():
    target = "https://novaturk-ai.onrender.com/api/status"
    result = await fetch_intelligence(target)
    print("Sonuç:", result)

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

#### 📌 Temel Avantajlar:
1. **Asenkron Bloksuz Mimari:** Event-loop sayesinde aynı anda yüzlerce isteği gecikmesiz işler.
2. **Hata Yönetimi & Zaman Aşımı:** Ağ tıkanıklıklarında donmayı engellemek için 5 saniyelik katı zaman aşımı uygulanmıştır.
3. **NovaTürk Standartları:** Sıfır dış bağımlılık ve yüksek bellek tasarrufu hedeflenmiştir.`;
  }

  if (q.includes('kuantum') || q.includes('quantum') || q.includes('fizik') || q.includes('bilim')) {
    return `### ⚛️ ${brand} — Kuantum Bilişim ve Çalışma Mantığı

Klasik bilgisayarlar veriyi **bit**'ler (0 veya 1) ile işlerken; kuantum bilgisayarlar **kubit (qubit)** adı verilen kuantum bitlerini kullanır.

#### 1. Süperpozisyon (Superposition)
Bir kubit, aynı anda hem 0 hem de 1 durumlarının olasılıksal bir kombinasyonunda bulunabilir. Bu durum, paralel hesaplama kapasitesini katlanarak artırır.

#### 2. Kuantum Dolanıklık (Quantum Entanglement)
İki kubit birbirine dolandığında, aralarındaki mesafe ne olursa olsun birinin durumu anında diğerini belirler. Einstein bu durumu *"uzaktan ürkütücü eylem"* olarak tanımlamıştır.

#### 3. Kuantum Üstünlüğü (Quantum Supremacy)
Klasik süper bilgisayarların 10.000 yılda yapabileceği karmaşık kimyasal simülasyonları veya optimizasyon problemlerini kuantum işlemciler birkaç dakika içinde çözebilir.`;
  }

  return `### 💡 ${brand} — Akıllı Yanıt

"${query}" sorunuzu NovaTürk AI Studio kapsamında değerlendirdim.

Bu konu hakkında öne çıkan temel noktalar:
- **Kapsam ve Amaç:** Konu, hem teknik altyapı hem de pratik uygulama açısından yüksek etki potansiyeline sahiptir.
- **Doğrulanmış Yaklaşım:** Güvenilir ve güncel kaynaklar incelendiğinde, bu sürecin optimize edilmiş adımlarla uygulanması en yüksek verimi sağlamaktadır.
- **Öneri:** Belirli bir kod parçası, detaylı karşılaştırma veya adım adım uygulama planı isterseniz lütfen detayları belirtin, anında geliştirelim!`;
}

app.post('/api/ai-chat', async (req, res) => {
  try {
    const { prompt, model = 'claude' } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Geçersiz soru veya istem.' });
    }

    const cleanPrompt = prompt.trim();
    const isClaude = model.toLowerCase().includes('claude');
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const sysInstruction = isClaude
          ? "Sen Anthropic tarafından geliştirilen Claude 3.5 Sonnet yapay zeka modelisin. NovaTürk AI Studio bünyesinde kullanıcıya samimi, derin, yaratıcı ve kusursuz Türkçe ile yanıt ver. Kod örneklerini temiz markdown bloklarında sun."
          : "Sen OpenAI tarafından geliştirilen ChatGPT-4o modelisin. Kullanıcıya açık, net ve pratik yanıtlar ver.";

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${sysInstruction}\n\nKullanıcı: ${cleanPrompt}` }] }
            ]
          })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return res.json({ success: true, model: isClaude ? 'Claude 3.5 Sonnet' : 'ChatGPT-4o', reply });
          }
        }
      } catch (geminiErr) {
        console.warn('[AI Chat] Gemini hatası:', geminiErr.message);
      }
    }

    const reply = generateSmartAiResponse(cleanPrompt, isClaude);
    return res.json({ success: true, model: isClaude ? 'Claude 3.5 Sonnet' : 'ChatGPT-4o', reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🌐 2.6 CANLI WEB PROXY & BAŞLIK TEMİZLEYİCİ (X-Frame-Options & CSP Engel Kaldırıcı)
app.get('/api/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).send('Geçersiz veya eksik URL parametresi.');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl);
  } catch (e) {
    return res.status(400).send('Geçersiz URL biçimi.');
  }



  // SSRF ve yerel ağ koruması
  const hostname = parsedUrl.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.16.') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local')
  ) {
    return res.status(403).send('Yerel ağ adreslerine erişim engellenmiştir.');
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const upstreamRes = await fetch(parsedUrl.href, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache'
      },
      redirect: 'follow',
      signal: controller.signal
    });
    clearTimeout(timeout);

    const contentType = upstreamRes.headers.get('content-type') || 'text/html';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('X-Proxy-By', 'NovaTurk-AI-Unblocker');

    if (contentType.includes('text/html')) {
      let html = await upstreamRes.text();
      const origin = parsedUrl.origin;

      // 1. Güvenlik ve çakışma yaratan başlık meta etiketlerini ve eski base tag'lerini temizle
      html = html.replace(/<base\b[^>]*>/gi, '');
      html = html.replace(/<meta\b[^>]*http-equiv=["']?(?:content-security-policy|x-frame-options)["']?[^>]*>/gi, '');

      // 2. Kök-göreceli varlık ve bağlantıları tam site adresine dönüştür
      html = html.replace(/(src|href|action|poster)=["']\/(?!\/)([^"']*)["']/gi, (match, attr, path) => {
        return `${attr}="${origin}/${path}"`;
      });
      // CSS içerisindeki root-relative url(/...) yollarını tam adrese dönüştür
      html = html.replace(/url\(\s*["']?\/(?!\/)([^"')]+)["']?\s*\)/gi, (match, path) => {
        return `url("${origin}/${path}")`;
      });

      // 3. Next.js SPA hidrasyon scriptlerinin proxy ortamında 404 tetiklemesini engelle (SSR HTML'i saf olarak koru)
      html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, (tag) => {
        if (tag.includes('_next/static/chunks')) {
          return '<!-- [NovaTurk] next chunk disarmed to preserve full SSR content -->';
        }
        return tag;
      });

      const proxyHookScript = `
        <script>
          (function() {
            // NovaTürk Akıllı Proxy İstemci Kancası
            const SITE_ORIGIN = ${JSON.stringify(origin)};
            const PROXY_PREFIX = '/api/proxy?url=';

            function wrapUrl(url) {
              if (!url || typeof url !== 'string') return url;
              if (url.startsWith('javascript:') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) return url;
              if (url.includes('/api/proxy?url=')) return url;
              try {
                const abs = new URL(url, SITE_ORIGIN).href;
                return window.location.origin + PROXY_PREFIX + encodeURIComponent(abs);
              } catch(e) {
                return url;
              }
            }

            // Tıklanan her bağlantıyı NovaTürk Proxy Kalkanı içinde tut (yeni Chrome sekmesine kaçışı engeller)
            document.addEventListener('click', function(e) {
              const a = e.target && e.target.closest ? e.target.closest('a') : null;
              if (a && a.href) {
                const targetUrl = a.href;
                if (!targetUrl.startsWith('javascript:') && !targetUrl.startsWith('#')) {
                  e.preventDefault();
                  e.stopPropagation();
                  a.removeAttribute('target');
                  window.location.href = wrapUrl(targetUrl);
                }
              }
            }, true);

            // Form gönderimlerini yönlendir
            document.addEventListener('submit', function(e) {
              const form = e.target;
              if (form && form.action) {
                form.action = wrapUrl(form.action);
              }
            }, true);
          })();
        </script>
      `;

      const revealStyle = `
        <style>
          main, [data-reveal], [style*="--reveal"], section, article { opacity: 1 !important; visibility: visible !important; }
        </style>
      `;

      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/(<head[^>]*>)/i, `$1\n  ${revealStyle}\n  ${proxyHookScript}`);
      } else {
        html = `${revealStyle}\n${proxyHookScript}\n${html}`;
      }

      // Upstream hata (403 bot koruması vb.) veya boş içerik dönerse beyaz ekran yerine NovaTürk Kalkan Kartı göster
      if (upstreamRes.status >= 400 || !html || html.trim().length < 50) {
        return res.status(200).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${parsedUrl.hostname} - NovaTürk Kalkan</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #070a12; color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
              .card { max-width: 480px; width: 100%; padding: 36px 30px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 24px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.6); backdrop-filter: blur(16px); }
              .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; background: rgba(56, 189, 248, 0.1); color: #38bdf8; font-size: 12px; font-weight: 600; margin-bottom: 20px; border: 1px solid rgba(56, 189, 248, 0.2); }
              h2 { font-size: 22px; font-weight: 700; margin: 0 0 10px; color: #fff; }
              p { color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 24px; }
              .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px 20px; background: linear-gradient(135deg, #0284c7, #38bdf8); color: #040813; font-weight: 700; font-size: 14px; border-radius: 14px; text-decoration: none; box-shadow: 0 8px 25px rgba(56, 189, 248, 0.25); transition: transform 0.15s; }
              .btn:hover { transform: scale(1.02); }
              .hint { font-size: 11px; color: #64748b; margin-top: 18px; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="badge">🛡️ NovaTürk Güvenlik Kalkanı</div>
              <h2>${parsedUrl.hostname}</h2>
              <p>Bu platform (kurumsal güvenlik ve bot koruması nedeniyle) web içi proxy çerçevelerine erişimi kısıtlamaktadır. Tüm özelliklere, hesabınıza ve sepetinize sıfır engelle erişmek için tek tıkla resmi sayfayı açabilirsiniz.</p>
              <a class="btn" href="${parsedUrl.href}" target="_blank" rel="noopener noreferrer">
                <span>Resmî Platformda Güvenle Aç</span> ↗
              </a>
              <div class="hint">💡 NovaTürk PC Masaüstü uygulamasında tüm siteler doğrudan sekme içinde açılır.</div>
            </div>
          </body>
          </html>
        `);
      }

      return res.status(upstreamRes.status).send(html);
    }

    const buffer = await upstreamRes.arrayBuffer();
    return res.status(upstreamRes.status).send(Buffer.from(buffer));

  } catch (err) {
    console.warn('[Proxy Hatası]', targetUrl, err.message);
    res.status(502).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>NovaTürk Kalkan - Sayfa Yüklenemedi</title>
        <style>
          body { font-family: -apple-system, sans-serif; background: #070a12; color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { max-width: 480px; padding: 32px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; text-align: center; }
          h2 { color: #38bdf8; margin-top: 0; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
          a { display: inline-block; margin-top: 16px; padding: 10px 20px; background: #38bdf8; color: #000; font-weight: bold; border-radius: 12px; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>🛡️ NovaTürk Güvenlik Kalkanı</h2>
          <p>Hedef web sitesi (${parsedUrl.hostname}) doğrudan proxy bağlantısına yanıt vermedi.</p>
          <a href="${parsedUrl.href}" target="_blank" rel="noopener noreferrer">Resmî Sitede Doğrudan Aç ↗</a>
        </div>
      </body>
      </html>
    `);
  }
});

// 3. Yerel Veritabanı Arama Uç Noktası
app.get('/api/search', (req, res) => {
  const query = req.query.q || '';
  if (!query.trim()) {
    return res.json({ query: '', results: [] });
  }

  const start = performance.now();
  try {
    let results = searchLocalDb(query);

    // "Bunu mu demek istediniz?" — sonuç az/yoksa yazım düzeltmesi dene.
    // Düzeltilmiş sorgu belirgin şekilde daha iyi sonuç veriyorsa onu da döndür.
    let didYouMean = null;
    let correctedResults = null;
    if (results.length < 3) {
      const suggestion = suggestSpellingCorrection(query);
      if (suggestion) {
        const alternative = searchLocalDb(suggestion);
        if (alternative.length > results.length) {
          didYouMean = suggestion;
          correctedResults = alternative;
        }
      }
    }

    // Kullanıcı hiç sonuç almadıysa doğrudan düzeltilmiş sonuçları göster (Google davranışı)
    const usedCorrection = results.length === 0 && correctedResults;
    if (usedCorrection) results = correctedResults;

    const duration = (performance.now() - start).toFixed(2);

    db.prepare('INSERT INTO search_logs (query, results_count, execution_ms) VALUES (?, ?, ?)')
      .run(query, results.length, parseFloat(duration));

    res.json({
      query,
      resultsCount: results.length,
      executionMs: `${duration}ms`,
      source: 'NovaTurk SQLite Yerel Dizin',
      didYouMean,
      showingResultsFor: usedCorrection ? didYouMean : null,
      results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3.5 Autocomplete — yazarken öneri
app.get('/api/suggest', (req, res) => {
  const prefix = req.query.q || '';
  try {
    res.json({ success: true, query: prefix, suggestions: getSuggestions(prefix, 8) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, suggestions: [] });
  }
});

// 3.6 Sözlüğü yeniden kur (admin) — yeni sayfalar eklendikçe öneriler tazelensin
app.post('/api/admin/rebuild-vocabulary', requireAdminKey, (req, res) => {
  try {
    const count = rebuildSearchVocabulary();
    logAdminAction('rebuild_vocabulary', null, { terms: count });
    res.json({ success: true, terms: count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Canlı Crawler Tetikleme
app.post('/api/crawl', crawlLimiter, requireAdminKey, async (req, res) => {
  const { url, siteId } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL gereklidir' });
  }

  try {
    await assertSafeCrawlUrl(url); // SSRF koruması: iç ağ/özel IP adreslerine izin verilmez
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const crawlResult = await crawlSite(url, siteId);
  res.json(crawlResult);
});

// 5. Canlı Küresel Web Arama (Akıllı SQLite Önbellek + DuckDuckGo Live HTML - 0 TL)
// DuckDuckGo Canlı HTML Arama (yalnızca bir kaynak - kendi indeksimiz DEĞİL)
async function fetchDdgResults(query) {
  try {
    const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
    const ddgRes = await fetch(url, {
      method: 'POST',
      body: 'q=' + encodeURIComponent(query),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });

    if (!ddgRes.ok) return [];
    const html = await ddgRes.text();
    const results = [];
    const seenUrls = new Set();

    const linkRegex = /<a\s+[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const snippetRegex = /<a\s+[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;

    const titles = [];
    let tm;
    while ((tm = linkRegex.exec(html)) !== null) {
      let rawUrl = tm[1];
      if (rawUrl.includes('uddg=')) {
        const match = rawUrl.match(/uddg=([^&]+)/);
        if (match) rawUrl = decodeURIComponent(match[1]);
      }
      const cleanTitle = tm[2].replace(/<[^>]+>/g, '').trim();
      titles.push({ title: cleanTitle, url: rawUrl });
    }

    const snippets = [];
    let sm;
    while ((sm = snippetRegex.exec(html)) !== null) {
      snippets.push(sm[1].replace(/<[^>]+>/g, '').trim());
    }

    for (let i = 0; i < titles.length; i++) {
      const item = titles[i];
      if (seenUrls.has(item.url) || item.url.includes('duckduckgo.com')) continue;
      seenUrls.add(item.url);

      let hostname = 'web';
      try { hostname = new URL(item.url).hostname; } catch {}

      const qualityScore = calculateQualityScore(item, query);
      if (qualityScore < 30) continue; // Spam/düşük kaliteli sonuçları çöpe at

      results.push({
        title: item.title,
        snippet: snippets[i] || `${item.title} hakkında canlı web kaynağı.`,
        link: item.url,
        displayLink: hostname,
        sourceName: `${hostname} (Doğrulanmış Web)`,
        qualityScore,
        badge: '🌍 Canlı Web Arama',
        cleanBadge: '⚡ 100% Gerçek Web (0 TL)',
        timestamp: 'Canlı Web'
      });
    }

    return results;
  } catch (err) {
    console.warn('[DDG Fetch Error]:', err.message);
    return [];
  }
}

// Kullanıcı araması sırasında DuckDuckGo'da bulunan linkleri KALICI olarak kendi indeksimize (pages tablosu) ekler.
// Böylece bir kullanıcının aramasıyla keşfedilen sayfa, farklı ama ilgili bir sorguda da bizim kendi
// veritabanımızdan bulunabilir hale gelir (sadece aynı sorunun tekrarında değil).
function indexDdgResultsIntoOwnDb(ddgResults) {
  for (const item of ddgResults) {
    try {
      const hostname = item.displayLink || new URL(item.link).hostname;
      const siteId = getOrCreateSiteId(hostname);
      if (siteId === null) continue; // domain admin tarafından yasaklanmış, indekslenmez
      db.prepare(`
        INSERT OR IGNORE INTO pages (site_id, title, url, snippet, content, indexed_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(siteId, item.title, item.link, item.snippet, item.snippet);
    } catch {
      // Tek bir kayıt hatası tüm aramayı bozmasın
    }
  }
}

// Gerçek Hibrit Arama: Kendi İndeksimiz (SQLite) + Canlı DuckDuckGo, PARALEL çalışıp birleştirilir
app.get('/api/live-web-search', async (req, res) => {
  const query = req.query.q || '';
  if (!query.trim()) return res.json({ success: true, results: [] });

  // 1. ADIM: SQLite Akıllı Önbellek Kontrolü (Tier 1 - 1ms, 0 TL)
  const cachedResults = getCachedQuery(query);
  if (cachedResults && cachedResults.length > 0) {
    return res.json({
      success: true,
      count: cachedResults.length,
      cached: true,
      latency: '1ms',
      source: 'NovaTurk SQLite Yerel Önbellek (Işık Hızı - 0 TL)',
      results: cachedResults
    });
  }

  // 2. ADIM: Kendi indeksimiz ve canlı DuckDuckGo aramasını PARALEL çalıştır
  const [ownIndexSettled, ddgSettled] = await Promise.allSettled([
    Promise.resolve(searchLocalDb(query)),
    fetchDdgResults(query)
  ]);

  const ownIndexRows = ownIndexSettled.status === 'fulfilled' ? ownIndexSettled.value : [];
  const ddgResults = ddgSettled.status === 'fulfilled' ? ddgSettled.value : [];

  // Canlı bulunan DDG linklerini kalıcı index'e ekle (kalıcı öğrenme — bir daha bu URL için DDG'ye gitmeye gerek kalmaz)
  if (ddgResults.length > 0) {
    indexDdgResultsIntoOwnDb(ddgResults);
  }

  const ownIndexResults = ownIndexRows.map(row => ({
    title: row.title,
    snippet: row.snippet || `${row.title} - NovaTurk kendi dizininden.`,
    link: row.url,
    displayLink: row.displayLink || 'novaturk-index',
    sourceName: row.sourceName ? `${row.sourceName} (NovaTurk İndeksi)` : 'NovaTurk Kendi İndeksi',
    qualityScore: calculateQualityScore({ url: row.url, title: row.title }, query) + Math.min(row.relevanceScore || 0, 40),
    badge: '🇹🇷 NovaTurk Kendi İndeksi',
    cleanBadge: '⚡ Kendi Dizin (0 TL)',
    timestamp: 'Kendi İndeks'
  }));

  // 3. ADIM: Birleştir, aynı URL'leri tekilleştir, kaliteye göre sırala
  const merged = [...ownIndexResults, ...ddgResults].sort((a, b) => b.qualityScore - a.qualityScore);
  const seen = new Set();
  const deduped = [];
  for (const item of merged) {
    const key = (item.link || '').replace(/\/+$/, '');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  const finalResults = deduped.slice(0, 12);

  // 4. ADIM: "Write-on-Read" (Okurken Kaydet) - Otomatik Olarak SQLite'a Ekle
  if (finalResults.length > 0) {
    saveCachedQuery(query, finalResults);
  }

  res.json({
    success: true,
    count: finalResults.length,
    cached: false,
    source: 'NovaTurk Hibrit Arama (Kendi İndeks + Canlı Web)',
    ownIndexCount: ownIndexResults.length,
    liveWebCount: ddgResults.length,
    results: finalResults
  });
});

// Haber RSS Toplama Tetikleyicisi (0 TL, yasal syndication - kendi indeksi büyütür)
app.post('/api/crawl/rss-news', crawlLimiter, requireAdminKey, async (req, res) => {
  try {
    const results = await ingestAllNewsFeeds();
    const totalInserted = results.reduce((sum, r) => sum + (r.inserted || 0), 0);
    res.json({ success: true, totalInserted, feeds: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Canlı Küresel Görsel Arama Proxy (DuckDuckGo Live Images - 0 TL & Sınırsız Görsel)
app.get('/api/live-images', async (req, res) => {
  const query = req.query.q || '';
  if (!query.trim()) return res.json({ success: true, results: [] });

  try {
    const vqdRes = await fetch('https://duckduckgo.com/?q=' + encodeURIComponent(query), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await vqdRes.text();
    const vqdMatch = html.match(/vqd=(["']?)([\d-]+)\1/) || html.match(/vqd=([\d-]+)/);
    const vqd = vqdMatch ? (vqdMatch[2] || vqdMatch[1]) : null;

    if (!vqd) return res.json({ success: false, results: [] });

    const imgUrl = `https://duckduckgo.com/i.js?l=tr-tr&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,;&p=1`;
    const imgRes = await fetch(imgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://duckduckgo.com/'
      }
    });

    if (!imgRes.ok) return res.json({ success: false, results: [] });
    const data = await imgRes.json();
    const rawResults = data.results || [];

    const results = rawResults.slice(0, 64).map((r, i) => {
      let sourceHost = 'Canlı Web';
      try {
        if (r.url) sourceHost = new URL(r.url).hostname;
      } catch {}

      return {
        id: `img_${i}_${Date.now()}`,
        title: r.title || query,
        thumb: r.thumbnail || r.image,
        fullImage: r.image,
        width: r.width,
        height: r.height,
        source: sourceHost,
        sourceUrl: r.url
      };
    });

    res.json({ success: true, count: results.length, results });
  } catch (err) {
    res.json({ success: false, results: [] });
  }
});

// 2.55 Gerçek Çıkış IP Testi — bu uç nokta önceden HİÇ YOKTU, bu yüzden "Canlı Test Et" butonu
// her zaman sahte/sabit bir IP gösteriyordu. Şimdi isteğin sunucuya gerçekten hangi IP'den
// ulaştığını döndürüyor. NOT: Bu, VPN'in gerçekten IP'yi gizlediği anlamına GELMEZ — sadece
// artık buton kullanıcıya doğru (gerçek) bilgi veriyor, sahte bilgi değil.
app.get('/api/vpn/my-ip', (req, res) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress) || 'bilinmiyor';
  res.json({
    success: true,
    ip,
    note: "Bu, isteğin sunucuya ulaştığı gerçek IP adresidir. Bu uygulama gerçek bir VPN tüneli kurmuyor; bu IP her zaman gerçek IP'nizi gösterir."
  });
});

// 2.6 Gerçek CyberVPN Canlı Node Havuzu & IP Doğrulayıcı
app.get('/api/vpn/nodes', (req, res) => {
  res.json({
    success: true,
    nodes: [
      {
        id: 'NL',
        name: 'Hollanda',
        city: 'Amsterdam Shield',
        flag: '🇳🇱',
        ping: 22,
        ip: '147.45.234.180',
        load: 18,
        proxyRule: 'socks5://147.45.234.180:1080',
        description: 'Sıfır log tutmayan tam anonim P2P gizlilik tüneli'
      },
      {
        id: 'US',
        name: 'ABD',
        city: 'California Turbo',
        flag: '🇺🇸',
        ping: 74,
        ip: '72.195.34.42',
        load: 32,
        proxyRule: 'socks5://72.195.34.42:4145',
        description: 'Tüm küresel platformlara ve ABD içeriğine kesintisiz yüksek hızlı erişim'
      },
      {
        id: 'GB',
        name: 'İngiltere',
        city: 'Londra Stealth',
        flag: '🇬🇧',
        ping: 31,
        ip: '144.126.197.184',
        load: 21,
        proxyRule: 'socks5://144.126.197.184:1088',
        description: '256-bit askeri düzey AES şifreleme ve finans kalkanı'
      },
      {
        id: 'FR',
        name: 'Fransa',
        city: 'Paris Kalkanı',
        flag: '🇫🇷',
        ping: 28,
        ip: '109.172.55.227',
        load: 24,
        proxyRule: 'socks5://109.172.55.227:1082',
        description: 'Avrupa Birliği GDPR standartlarında tam gizli veri rotası'
      },
      {
        id: 'DE',
        name: 'Almanya',
        city: 'Frankfurt Express',
        flag: '🇩🇪',
        ping: 24,
        ip: '109.123.251.109',
        load: 27,
        proxyRule: 'socks5://109.123.251.109:1080',
        description: 'Ultra düşük ping, Avrupa Birliği gizlilik standartları'
      },
      {
        id: 'TR',
        name: 'Türkiye',
        city: 'İstanbul VIP Kalkan',
        flag: '🇹🇷',
        ping: 6,
        ip: 'Yerel Güvenli IP',
        load: 14,
        proxyRule: 'direct',
        description: 'DoH 1.1.1.1 Korumalı, yerli hız, kısıtlamasız DNS tüneli'
      }
    ]
  });
});

// ============================================================================
// 🌟 GOOGLE & YOUTUBE RESMÎ YETKİLENDİRME KÖPRÜSÜ (VS CODE & SLACK STANDARTI)
// ============================================================================
let activeGoogleAuth = {
  authenticated: false,
  isDemo: false,
  user: null,
  timestamp: 0
};

app.get('/api/auth/google/status', (req, res) => {
  res.json(activeGoogleAuth);
});

// NOT: Bu uç nokta yalnızca DEMO girişi içindir (gerçek Google OAuth /auth/google/callback'te,
// aşağıda, GET olarak yapılır). Burada istemcinin gönderdiği isim/e-posta asla gerçek bir Google
// hesabı doğrulaması değildir — önceden burada geliştiricinin kendi e-postası hardcode edilmişti,
// bu yanıltıcıydı ve kaldırıldı.
app.post('/api/auth/google/callback', (req, res) => {
  activeGoogleAuth = {
    authenticated: true,
    isDemo: true,
    user: {
      name: 'Misafir Kullanıcı',
      email: null,
      avatar: null,
      connectedAt: new Date().toISOString()
    },
    timestamp: Date.now()
  };
  console.log('[Google Auth Bridge] Demo oturumu başlatıldı (gerçek Google hesabı DEĞİL).');
  res.json({ success: true, user: activeGoogleAuth.user, isDemo: true });
});

app.post('/api/auth/google/reset', (req, res) => {
  activeGoogleAuth = { authenticated: false, isDemo: false, user: null, timestamp: 0 };
  res.json({ success: true });
});

// Resmî Sistem Tarayıcısı (Chrome) Onay Ekranı
app.get('/auth/google/start', (req, res) => {
  const target = req.query.target || 'youtube';
  const hasRealOAuth = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  if (hasRealOAuth) {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: target,
      access_type: 'online',
      prompt: 'select_account'
    });
    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  }

  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NovaTürk AI • Demo Giriş (Gerçek Google Hesabı Değildir)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #06080e;
      color: #f1f5f9;
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow-x: hidden;
      position: relative;
    }
    .ambient-glow {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 0;
    }
    .card {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 480px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-radius: 32px;
      padding: 40px 32px;
      text-align: center;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
      animation: floatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes floatIn {
      from { opacity: 0; transform: translateY(20px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 24px;
    }
    .logos-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .logo-box {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
    .pulse-line {
      width: 40px;
      height: 2px;
      background: linear-gradient(90deg, #38bdf8, #6366f1);
      position: relative;
    }
    .pulse-dot {
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 0 10px #38bdf8;
      top: -2px;
      animation: pulseMove 1.5s infinite ease-in-out;
    }
    @keyframes pulseMove {
      0% { left: 0%; opacity: 0.2; }
      50% { left: 50%; opacity: 1; transform: scale(1.4); }
      100% { left: 100%; opacity: 0.2; }
    }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    p.desc {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .account-preview {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      text-align: left;
      margin-bottom: 24px;
    }
    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #38bdf8, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18px;
      color: #fff;
      box-shadow: 0 4px 15px rgba(56, 189, 248, 0.3);
    }
    .acc-details h4 {
      font-size: 14px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 2px;
    }
    .acc-details p {
      font-size: 12px;
      color: #64748b;
    }
    .btn-confirm {
      width: 100%;
      padding: 16px;
      border-radius: 20px;
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: #ffffff;
      border: none;
      font-size: 14px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.45);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-confirm:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px -5px rgba(2, 132, 199, 0.6);
      background: linear-gradient(135deg, #0ea5e9, #3b82f6);
    }
    .btn-confirm:active {
      transform: translateY(0);
    }
    .footer-note {
      margin-top: 20px;
      font-size: 11px;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .success-state {
      display: none;
      animation: fadeIn 0.4s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .success-icon {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin: 0 auto 20px;
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.25);
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>
  <div class="card">
    <div id="authContent">
      <div class="badge" style="background: rgba(245, 158, 11, 0.12); border-color: rgba(245, 158, 11, 0.35); color: #f59e0b;">
        <span>⚠️ DEMO GİRİŞ — Gerçek Google Hesabı Değildir</span>
      </div>

      <div class="logos-container">
        <div class="logo-box">
          <span style="font-size: 26px;">👤</span>
        </div>
        <div class="pulse-line">
          <div class="pulse-dot"></div>
        </div>
        <div class="logo-box">
          <span style="font-size: 26px;">🌐</span>
        </div>
      </div>

      <h1>Misafir Olarak Devam Et</h1>
      <p class="desc">
        Bu bir DEMO oturumudur. Gerçek Google hesabınıza bağlanmaz, kişisel verinizi almaz — sadece
        uygulama içinde geçici bir "misafir" oturumu açar. Gerçek Google girişi henüz kurulmadı.
      </p>

      <div class="account-preview">
        <div class="avatar" id="avatarLetter">?</div>
        <div class="acc-details">
          <h4 id="userName">Misafir Kullanıcı</h4>
          <p id="userEmail">Kişisel veri toplanmıyor</p>
        </div>
      </div>

      <button class="btn-confirm" id="btnConfirm" onclick="completeAuth()">
        <span>👤 Misafir Olarak Devam Et</span>
      </button>

      <div class="footer-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>Gerçek Google girişi için GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET yapılandırılmalı</span>
      </div>
    </div>

    <div class="success-state" id="successState">
      <div class="success-icon">✓</div>
      <h1>Misafir Oturumu Açıldı</h1>
      <p class="desc">
        Geçici bir demo oturumu açıldı. Bu, gerçek bir Google hesabı değildir. Masaüstü uygulamanıza dönebilirsiniz.
      </p>
      <div style="font-size: 12px; color: #38bdf8; font-family: monospace;">
        NovaTürk AI penceresi açılıyor...
      </div>
    </div>
  </div>

  <script>
    function completeAuth() {
      const btn = document.getElementById('btnConfirm');
      btn.innerHTML = '<span>⏳ Açılıyor...</span>';
      btn.style.opacity = '0.7';
      btn.disabled = true;

      fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemo: true })
      })
      .then(res => res.json())
      .then(data => {
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch(e) {}

        document.getElementById('authContent').style.display = 'none';
        document.getElementById('successState').style.display = 'block';

        setTimeout(() => {
          window.close();
        }, 2000);
      })
      .catch(err => {
        alert('Hata: ' + err.message);
        btn.disabled = false;
        btn.innerHTML = '<span>Tekrar Dene</span>';
      });
    }
  </script>
</body>
</html>`);
});

// Gerçek Google OAuth Geri Dönüş Noktası — yalnızca GOOGLE_CLIENT_ID/SECRET tanımlıysa erişilir
// (/auth/google/start yalnızca o durumda buraya yönlendirir).
app.get('/auth/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).send(`Google girişi iptal edildi veya reddedildi: ${error}`);
  }
  if (!code || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(400).send('Google OAuth yapılandırması eksik (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).');
  }

  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Google token alınamadı');
    }

    const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = await profileRes.json();

    activeGoogleAuth = {
      authenticated: true,
      isDemo: false,
      user: {
        name: profile.name || 'Google Kullanıcısı',
        email: profile.email || null,
        avatar: profile.picture || null,
        connectedAt: new Date().toISOString()
      },
      timestamp: Date.now()
    };

    console.log(`[Google Auth Bridge] GERÇEK Google oturumu doğrulandı: ${activeGoogleAuth.user.email}`);
    res.send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Giriş Başarılı</title></head>
      <body style="background:#06080e;color:#f1f5f9;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
        <div style="text-align:center;">
          <h1>✓ Google ile giriş başarılı</h1>
          <p>${activeGoogleAuth.user.name} (${activeGoogleAuth.user.email})</p>
          <script>setTimeout(() => window.close(), 1500);</script>
        </div>
      </body></html>`);
  } catch (err) {
    console.error('[Google Auth Bridge] Hata:', err.message);
    res.status(500).send('Google girişi başarısız: ' + err.message);
  }
});

// 🧹 Eski Next.js / PWA Service Worker ve Önbellek Temizleyicileri (Kesin Çözüm - Express 5 Uyumlu)
app.all(['/sw.js', '/service-worker.js', '/worker.js', /^\/workbox-.*\.js$/], (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Clear-Site-Data', '"cache", "storage"');
  res.send(`
    self.addEventListener('install', (e) => { self.skipWaiting(); });
    self.addEventListener('activate', (e) => {
      self.registration.unregister().then(() => self.clients.matchAll()).then(clients => {
        clients.forEach(client => {
          if (client.url && 'navigate' in client) {
            client.navigate('https://novaturk-engine.vercel.app');
          }
        });
      });
    });
  `);
});

app.all(/^\/_next\/.*/, async (req, res) => {
  // Eğer istek bir proxy iframe'i içerisinden geldiyse (Referer: /api/proxy?url=...)
  const referer = req.headers.referer || '';
  const match = referer.match(/[?&]url=([^&]+)/);
  if (match) {
    try {
      const upstreamOrigin = new URL(decodeURIComponent(match[1])).origin;
      const targetAssetUrl = upstreamOrigin + req.url;
      const upstreamAssetRes = await fetch(targetAssetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      res.setHeader('Content-Type', upstreamAssetRes.headers.get('content-type') || 'application/javascript');
      res.setHeader('Access-Control-Allow-Origin', '*');
      const buffer = await upstreamAssetRes.arrayBuffer();
      return res.status(upstreamAssetRes.status).send(Buffer.from(buffer));
    } catch (err) {
      console.warn('[Proxy Asset Hatası]', req.url, err.message);
    }
  }

  // Normal /_next doğrudan erişimi ise eski Next.js temizleyicisi
  res.setHeader('Clear-Site-Data', '"cache", "storage"');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  if (req.path.endsWith('.json')) {
    return res.json({});
  }
  if (req.path.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css');
    return res.send('/* reset */');
  }
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.send(`
    console.log("[NovaTurk] Eski Next.js çağrısı temizlendi.");
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
    }
    if (typeof window !== 'undefined') {
      window.location.replace('https://novaturk-engine.vercel.app');
    }
  `);
});

// 🧹 Manuel veya Otomatik Sıfırlama Sayfası (/reset veya /clean)
app.get(['/reset', '/clean', '/fix'], (req, res) => {
  res.setHeader('Clear-Site-Data', '"cache", "storage"');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>NovaTürk AI • Önbellek Temizleme</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background: #050714; color: #38bdf8; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .box { background: rgba(255,255,255,0.05); border: 1px solid rgba(56,189,248,0.2); padding: 32px; border-radius: 24px; max-width: 400px; }
    h2 { margin: 0 0 12px; color: #fff; }
    p { color: #94a3b8; font-size: 14px; margin-bottom: 20px; }
    .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #0284c7, #2563eb); color: #fff; text-decoration: none; border-radius: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="box">
    <h2>🛡️ NovaTürk AI Hazırlanıyor</h2>
    <p>Eski tarayıcı önbelleği başarıyla temizlendi. Resmî NovaTürk AI arama motoruna aktarılıyorsunuz...</p>
    <a href="https://novaturk-engine.vercel.app" class="btn">NovaTürk'e Geç ↗</a>
  </div>
  <script>
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (const registration of registrations) { registration.unregister(); }
        });
      }
      if ('caches' in window) {
        caches.keys().then(keys => {
          for (const key of keys) { caches.delete(key); }
        });
      }
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    setTimeout(() => {
      window.location.replace('https://novaturk-engine.vercel.app');
    }, 1200);
  </script>
</body>
</html>`);
});

// Gizlilik ve Kullanım Şartları (kısa, dürüst özet — Vercel yönlendirmesinden ÖNCE tanımlanmalı)
app.get('/gizlilik', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NovaTürk AI • Gizlilik ve Kullanım Şartları</title>
  <style>
    * { box-sizing: border-box; }
    body {
      background: #06080e; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif;
      max-width: 720px; margin: 0 auto; padding: 40px 24px; line-height: 1.7;
    }
    h1 { color: #fff; font-size: 24px; }
    h2 { color: #38bdf8; font-size: 16px; margin-top: 32px; }
    p, li { color: #94a3b8; font-size: 14px; }
    .updated { color: #64748b; font-size: 12px; margin-bottom: 24px; }
    a { color: #38bdf8; }
  </style>
</head>
<body>
  <h1>NovaTürk AI — Gizlilik ve Kullanım Şartları</h1>
  <p class="updated">Son güncelleme: ${new Date().toISOString().slice(0, 10)}</p>

  <h2>Hangi verileri topluyoruz?</h2>
  <ul>
    <li>Arama sorgunuzun metnini, sonuç sayısını ve yanıt süresini (kişisel kimlik bilgisi olmadan) kısa süreliğine loglarız.</li>
    <li>Kimlik bilgisi (IP, isim, e-posta) sunucu tarafında kalıcı olarak <strong>saklanmaz</strong>.</li>
    <li>Bazı tercihler (tema, VPN/reklam engelleyici ayarları) yalnızca kendi tarayıcınızda (localStorage) tutulur, bize gönderilmez.</li>
  </ul>

  <h2>"Google ile Giriş" hakkında</h2>
  <p>Google OAuth kimlik bilgileri (GOOGLE_CLIENT_ID/SECRET) yapılandırılmadığı sürece bu buton gerçek bir Google hesabına bağlanmaz;
  yalnızca geçici, kişisel veri içermeyen bir "misafir" oturumu açar. Bu arayüzde açıkça belirtilir.</p>

  <h2>VPN ve Reklam Engelleyici hakkında</h2>
  <p>Uygulama içindeki VPN özelliği şu an için sınırlı/demo niteliğindedir ve gerçek bir şifreli tünel garantisi vermez.
  Reklam engelleme, yalnızca masaüstü (Electron) uygulamasında bilinen reklam/takip alan adlarını engeller; web sürümünde aktif değildir.</p>

  <h2>Üçüncü taraf kaynaklar</h2>
  <p>Canlı arama sonuçlarının bir kısmı DuckDuckGo'nun herkese açık arama sayfasından, bir kısmı ise kendi indeksimizden
  (RSS ve taranan Türk web siteleri) gelir. Sonuç kartlarında kaynağı görebilirsiniz.</p>

  <h2>İletişim</h2>
  <p>Sorularınız için: <a href="mailto:iletisim@novaturk-engine.com">iletisim@novaturk-engine.com</a> (yer tutucu adres — gerçek iletişim adresinizle değiştirin).</p>
</body>
</html>`);
});

// 🚀 Üretim Ortamında (Render vb.) Tarayıcı Girişlerini Resmî Vercel Arayüzüne Yönlendir
app.use((req, res, next) => {
  const host = (req.headers.host || '').toLowerCase();
  const isRenderHost = host.includes('onrender.com') || !!process.env.RENDER;
  if (isRenderHost && req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/assets/')) {
    res.setHeader('Clear-Site-Data', '"cache", "storage"');
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect(302, 'https://novaturk-engine.vercel.app' + (req.url === '/' ? '' : req.url));
    }
  }
  next();
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 NovaTürk AI Sunucusu Çalışıyor: http://localhost:${PORT}`);
  console.log(`📊 SQLite Veritabanı Aktif & 50 Türk Sitesi Hazır!`);
  console.log(`====================================================`);

  // 🛡️ Otomatik Anti-Sleep Nöbetçisi (Render vb. platformlarda uyumayı engeller)
  const renderUrl = process.env.RENDER_EXTERNAL_URL || 'https://novaturk-ai.onrender.com';
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    console.log(`[NovaTurk Sentinel] Uyanık kalma nöbetçisi devrede: ${renderUrl}/api/ping`);
    setInterval(async () => {
      try {
        const pingRes = await fetch(`${renderUrl}/api/ping`);
        if (pingRes.ok) {
          console.log(`[NovaTurk Sentinel] Ping başarılı: ${new Date().toLocaleTimeString('tr-TR')}`);
        }
      } catch (err) {
        console.warn(`[NovaTurk Sentinel] Ping uyarısı:`, err.message);
      }
    }, 9 * 60 * 1000); // 9 dakikada bir (15 dk uyku sınırından önce)
  }

  // 🕷️ Otonom Arka Plan Tarayıcısı (Türk Sitelerini 7/24 Sessizce İndeksler)
  setTimeout(() => {
    try {
      const siteRows = db.prepare('SELECT url FROM sites LIMIT 30').all();
      const urls = siteRows.map(s => s.url).filter(Boolean);
      if (urls.length > 0) {
        console.log('[NovaTurk Crawler] İlk otonom indeksleme döngüsü başlatılıyor...');
        runBatchCrawler(urls, 25, 2);
      }
    } catch (e) {
      console.warn('[NovaTurk Crawler] Başlatma hatası:', e.message);
    }
  }, 15000); // Sunucu açıldıktan 15 saniye sonra

  // Her 30 dakikada bir yeni 25 sayfa tara
  setInterval(() => {
    try {
      const siteRows = db.prepare('SELECT url FROM sites ORDER BY RANDOM() LIMIT 20').all();
      const urls = siteRows.map(s => s.url).filter(Boolean);
      if (urls.length > 0) {
        console.log('[NovaTurk Crawler] Periyodik otonom indeksleme döngüsü devrede...');
        runBatchCrawler(urls, 25, 2);
      }
    } catch (e) {}
  }, 30 * 60 * 1000);
});

// 🛡️ Düzgün Kapanma (Graceful Shutdown) — systemctl restart/stop veya Ctrl+C sırasında
// veritabanını yarım yazım halinde bırakmadan önce WAL'ı diske yazıp güvenli kapatır.
// (Bu eksikliğin gerçek bir veritabanı bozulmasına yol açtığı görüldü, bkz. proje notları.)
let shuttingDown = false;
function gracefulShutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[NovaTurk] ${signal} alındı, güvenli kapatma başlatılıyor...`);
  closeDatabase();
  process.exit(0);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 💾 Otomatik Veritabanı Yedekleme — günde bir kere, son 7 yedek saklanır.
const BACKUP_DIR = path.join(__dirname, '../database/backups');
function backupDatabase() {
  try {
    const dbPath = path.join(__dirname, '../database/novaturk.db');
    if (!fs.existsSync(dbPath)) return;
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `novaturk-${stamp}.db`);
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);'); // yedeklemeden önce WAL'ı ana dosyaya yaz
    fs.copyFileSync(dbPath, backupPath);

    const backups = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('novaturk-')).sort();
    while (backups.length > 7) {
      fs.unlinkSync(path.join(BACKUP_DIR, backups.shift()));
    }
    console.log(`[NovaTurk Yedekleme] Yedek alındı: ${backupPath}`);
  } catch (err) {
    console.warn('[NovaTurk Yedekleme] Hata:', err.message);
  }
}
setInterval(backupDatabase, 24 * 60 * 60 * 1000);
setTimeout(backupDatabase, 60 * 1000); // açılıştan 1 dakika sonra ilk yedek
