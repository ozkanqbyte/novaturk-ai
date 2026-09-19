import { db } from './db.js';

// ============================================================================
// 🛡️ GÜVENLİK KATMANI — zararlı linkler + spam/SEO manipülasyonu
// ============================================================================

// Herkese açık, ücretsiz, anahtar gerektirmeyen tehdit listeleri
const THREAT_FEEDS = [
  { name: 'URLhaus (abuse.ch)', type: 'malware', url: 'https://urlhaus.abuse.ch/downloads/text_online/' },
  { name: 'OpenPhish', type: 'phishing', url: 'https://openphish.com/feed.txt' }
];

// Paylaşımlı barındırma servisleri: kötü amaçlı bir DOSYA buradaysa sadece o adres
// engellenir, tüm alan adı değil. (Yoksa tek bir kötü GitHub dosyası yüzünden
// github.com tamamen sonuçlardan silinirdi.)
const SHARED_HOSTS = new Set([
  'github.com', 'raw.githubusercontent.com', 'gist.github.com', 'gitlab.com', 'bitbucket.org',
  'drive.google.com', 'docs.google.com', 'sites.google.com', 'storage.googleapis.com',
  'dropbox.com', 'www.dropbox.com', 'dl.dropboxusercontent.com', 'onedrive.live.com', '1drv.ms',
  'cdn.discordapp.com', 'discord.com', 'mediafire.com', 'www.mediafire.com', 'mega.nz',
  'pastebin.com', 't.me', 'telegra.ph', 'bit.ly', 'tinyurl.com', 'archive.org', 'web.archive.org',
  'www.youtube.com', 'youtube.com', 'www.facebook.com', 'facebook.com', 'www.instagram.com',
  'twitter.com', 'x.com', 'linkedin.com', 'www.linkedin.com', 'firebasestorage.googleapis.com',
  'blogger.com', 'www.blogger.com', 'weebly.com', 'wix.com', 'wixsite.com', 'netlify.app', 'vercel.app',
  'pages.dev', 'workers.dev', 'herokuapp.com', 'glitch.me', 'repl.co', 'ipfs.io'
]);

export function initSafetyTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS threat_urls (
      url TEXT PRIMARY KEY,
      host TEXT NOT NULL,
      threat_type TEXT NOT NULL,
      source TEXT NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_threat_host ON threat_urls(host);

    CREATE TABLE IF NOT EXISTS safety_meta (key TEXT PRIMARY KEY, value TEXT);
  `);
}

function normalizeUrl(raw) {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    u.hash = '';
    return { url: u.href.replace(/\/+$/, ''), host: u.hostname.toLowerCase() };
  } catch {
    return null;
  }
}

// Tehdit listelerini indirir ve tabloyu atomik olarak yeniler
export async function refreshThreatFeeds() {
  const collected = [];
  const report = [];

  for (const feed of THREAT_FEEDS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(feed.url, { signal: controller.signal, headers: { 'User-Agent': 'NovaTurkBot/2.0 (threat-intel)' } });
      clearTimeout(timer);
      if (!res.ok) { report.push({ feed: feed.name, ok: false, error: `HTTP ${res.status}` }); continue; }

      const text = await res.text();
      let count = 0;
      for (const line of text.split('\n')) {
        if (!line || line.startsWith('#')) continue;
        const n = normalizeUrl(line);
        if (!n) continue;
        collected.push({ ...n, type: feed.type, source: feed.name });
        count++;
      }
      report.push({ feed: feed.name, ok: true, count });
    } catch (err) {
      report.push({ feed: feed.name, ok: false, error: err.message });
    }
  }

  // Hiçbir liste gelmediyse eski listeyi silme — ağ hatası korumayı kapatmasın
  if (collected.length === 0) {
    console.warn('[NovaTurk Güvenlik] Tehdit listeleri alınamadı, mevcut liste korunuyor.', report);
    return { updated: false, report };
  }

  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM threat_urls');
    const insert = db.prepare('INSERT OR IGNORE INTO threat_urls (url, host, threat_type, source) VALUES (?, ?, ?, ?)');
    for (const t of collected) insert.run(t.url, t.host, t.type, t.source);
    db.prepare("INSERT OR REPLACE INTO safety_meta (key, value) VALUES ('last_refresh', ?)").run(new Date().toISOString());
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // İndekste zaten bulunan tehditli sayfaları temizle
  const purged = purgeThreatPagesFromIndex();
  console.log(`[NovaTurk Güvenlik] Tehdit listesi güncellendi: ${collected.length} adres, indeksten ${purged} sayfa temizlendi.`);
  return { updated: true, total: collected.length, purged, report };
}

// Bir adres bilinen bir tehdit mi? (tam adres veya — paylaşımlı olmayan — alan adı)
export function checkThreat(rawUrl) {
  const n = normalizeUrl(rawUrl || '');
  if (!n) return null;
  try {
    const exact = db.prepare('SELECT threat_type, source FROM threat_urls WHERE url = ? LIMIT 1').get(n.url);
    if (exact) return exact;
    if (SHARED_HOSTS.has(n.host)) return null;
    return db.prepare('SELECT threat_type, source FROM threat_urls WHERE host = ? LIMIT 1').get(n.host) || null;
  } catch {
    return null;
  }
}

function purgeThreatPagesFromIndex() {
  let removed = 0;
  try {
    const pages = db.prepare('SELECT id, url FROM pages').all();
    const del = db.prepare('DELETE FROM pages WHERE id = ?');
    for (const p of pages) {
      if (checkThreat(p.url)) { del.run(p.id); removed++; }
    }
  } catch (err) {
    console.warn('[NovaTurk Güvenlik] İndeks temizliği hatası:', err.message);
  }
  return removed;
}

// ---------------------------------------------------------------------------
// Spam / SEO manipülasyonu değerlendirmesi
// Türkiye'deki en büyük arama spam sorunu yasadışı bahis/casino siteleri. Bu siteler
// sürekli alan adı değiştirir ("xbet312.com", "yeni giriş adresi") ve anahtar kelime
// doldurur. Ancak "yasadışı bahis operasyonu" gibi haberler MEŞRUDUR — bu yüzden
// güvenilir kaynaklar (resmi, eğitim, doğrulanmış haber) içerik kurallarından muaftır.
// ---------------------------------------------------------------------------
const STRONG_SPAM_PHRASES = [
  'deneme bonusu', 'bonus veren', 'freespin', 'free spin', 'canlı casino', 'casino siteleri',
  'kaçak bahis', 'bahis siteleri', 'güncel giriş', 'yeni giriş adresi', 'giriş adresi',
  'slot oyna', 'rulet oyna', 'bet giriş', 'escort', 'ücretsiz bonus'
];
const WEAK_SPAM_TERMS = ['casino', 'slot', 'bahis', 'jackpot', 'kumar'];
const SUSPICIOUS_TLDS = ['xyz', 'top', 'click', 'buzz', 'icu', 'bet', 'casino', 'win', 'loan', 'cfd', 'sbs', 'rest', 'mom'];

function isTrustedHost(host, authorityScore) {
  return /\.(gov|edu|k12|tsk|pol|bel)\.tr$/.test(host)
    || host.endsWith('.gov') || host.endsWith('.edu')
    || (authorityScore || 0) >= 90;
}

export function assessSpam({ url, title, snippet, authorityScore }) {
  let host = '';
  try { host = new URL(url).hostname.toLowerCase(); } catch { return { score: 0, reasons: [] }; }

  const reasons = [];
  let score = 0;
  const text = `${title || ''} ${snippet || ''}`.toLowerCase();
  const trusted = isTrustedHost(host, authorityScore);

  // 1) Alan adının kendisi — en güçlü sinyal, güvenilir kaynaklar dahil herkese uygulanır
  const hostBase = host.replace(/^www\./, '');
  if (/(bet|casino|slot|bahis|bonus)[a-z]*\d{2,}/.test(hostBase) || /\d{2,}(bet|casino|slot)/.test(hostBase)) {
    score += 60; reasons.push('bahis/casino tipi numaralı alan adı');
  } else if (/(casino|bahis|deneme-?bonus|bonusveren)/.test(hostBase)) {
    score += 45; reasons.push('alan adında bahis/casino');
  }
  const tld = hostBase.split('.').pop();
  if (SUSPICIOUS_TLDS.includes(tld)) { score += 15; reasons.push(`şüpheli uzantı (.${tld})`); }
  if ((hostBase.match(/-/g) || []).length >= 3) { score += 10; reasons.push('çok tireli alan adı'); }

  // 2) İçerik kuralları — güvenilir kaynaklar muaf (haberler bahis operasyonlarından bahsedebilir)
  if (!trusted) {
    const strongHits = STRONG_SPAM_PHRASES.filter(p => text.includes(p));
    if (strongHits.length) { score += Math.min(60, 35 * strongHits.length); reasons.push(`spam ifadesi: ${strongHits.slice(0, 3).join(', ')}`); }

    const weakHits = WEAK_SPAM_TERMS.filter(t => text.includes(t));
    if (weakHits.length >= 2) { score += 15; reasons.push(`kumar terimleri: ${weakHits.join(', ')}`); }

    // Anahtar kelime doldurma: başlıkta aynı kelime 3+ kez
    const words = (title || '').toLowerCase().split(/[^a-zçğıöşü0-9]+/).filter(w => w.length >= 4);
    const counts = {};
    for (const w of words) counts[w] = (counts[w] || 0) + 1;
    const stuffed = Object.entries(counts).find(([, c]) => c >= 3);
    if (stuffed) { score += 20; reasons.push(`anahtar kelime doldurma ("${stuffed[0]}" x${stuffed[1]})`); }
  }

  return { score: Math.min(100, score), reasons };
}

// Sonuç listesini filtreler: tehditler ve yüksek spam tamamen çıkar,
// orta spam cezalandırılır. Çıkarılanlar sayılır (admin paneli + şeffaflık için).
export const SPAM_DROP_THRESHOLD = 60;
export const safetyStats = { threatsBlocked: 0, spamDropped: 0, spamPenalized: 0 };

export function filterUnsafeResults(results, { getUrl = r => r.url || r.link, getTitle = r => r.title, getSnippet = r => r.snippet, getAuthority = r => r.authority_score } = {}) {
  const safe = [];
  let blocked = 0, dropped = 0;

  for (const r of results) {
    const url = getUrl(r);
    if (checkThreat(url)) { blocked++; continue; }

    const spam = assessSpam({ url, title: getTitle(r), snippet: getSnippet(r), authorityScore: getAuthority(r) });
    if (spam.score >= SPAM_DROP_THRESHOLD) { dropped++; continue; }
    if (spam.score > 0) {
      safetyStats.spamPenalized++;
      safe.push({ ...r, spamScore: spam.score, spamPenalty: spam.score });
    } else {
      safe.push(r);
    }
  }

  safetyStats.threatsBlocked += blocked;
  safetyStats.spamDropped += dropped;
  return { safe, blocked, dropped };
}

export function getSafetyOverview() {
  try {
    const byType = db.prepare('SELECT threat_type, source, COUNT(*) as count FROM threat_urls GROUP BY threat_type, source').all();
    const lastRefresh = db.prepare("SELECT value FROM safety_meta WHERE key = 'last_refresh'").get();
    return { feeds: byType, lastRefresh: lastRefresh?.value || null, runtime: { ...safetyStats } };
  } catch (err) {
    return { feeds: [], lastRefresh: null, runtime: { ...safetyStats }, error: err.message };
  }
}

// İndekste spam olarak değerlendirilen sayfaları listeler (admin incelemesi için)
export function scanIndexForSpam(limit = 50) {
  const rows = db.prepare(`
    SELECT p.id, p.url, p.title, p.snippet, s.authority_score
    FROM pages p LEFT JOIN sites s ON s.id = p.site_id
  `).all();

  return rows
    .map(r => ({ id: r.id, url: r.url, title: r.title, ...assessSpam({ url: r.url, title: r.title, snippet: r.snippet, authorityScore: r.authority_score }) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
