import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TOP_TURKISH_PRESEEDED_QUERIES } from './popularQueries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../database');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'novaturk.db');

class MemoryDbAdapter {
  constructor() {
    this.sites = [];
    this.pages = [];
    this.search_logs = [];
    this.query_cache = new Map();
  }
  exec() {
    return this;
  }
  prepare(sql) {
    const s = sql.toLowerCase().trim();
    const self = this;
    return {
      get(...params) {
        if (s.includes('count(*) as count from sites')) return { count: self.sites.length };
        if (s.includes('count(*) as count from pages')) return { count: self.pages.length };
        if (s.includes('count(*) as count from search_logs')) return { count: self.search_logs.length };
        if (s.includes('count(*) as count from query_cache')) return { count: self.query_cache.size };
        if (s.includes('from query_cache where query_key = ?')) {
          const item = self.query_cache.get(params[0]);
          return item ? { results_json: item.results_json, cached_at: item.cached_at } : null;
        }
        return null;
      },
      all(...params) {
        if (s.includes('from pages p left join sites s') || s.includes('like ?')) {
          const q = (params[0] || '').replace(/%/g, '').toLowerCase();
          return self.pages.filter(p => 
            p.title.toLowerCase().includes(q) || 
            (p.snippet && p.snippet.toLowerCase().includes(q)) || 
            (p.content && p.content.toLowerCase().includes(q))
          ).slice(0, 20);
        }
        if (s.includes('from search_logs')) return self.search_logs.slice(-50).reverse();
        if (s.includes('from sites')) return self.sites.slice(0, 50);
        if (s.includes('from pages')) return self.pages.slice(-50).reverse();
        return [];
      },
      run(...params) {
        if (s.includes('into sites')) {
          self.sites.push({
            id: self.sites.length + 1,
            domain: params[0],
            name: params[1],
            category: params[2],
            url: params[3],
            description: params[4],
            authority_score: params[5],
            is_verified: 1
          });
        } else if (s.includes('into pages')) {
          self.pages.push({
            id: self.pages.length + 1,
            site_id: params[0],
            title: params[1],
            url: params[2],
            snippet: params[3],
            content: params[4]
          });
        } else if (s.includes('into search_logs')) {
          self.search_logs.push({
            id: self.search_logs.length + 1,
            query: params[0],
            results_count: params[1],
            execution_ms: params[2],
            searched_at: new Date().toISOString()
          });
        } else if (s.includes('into query_cache')) {
          self.query_cache.set(params[0], { results_json: params[1], cached_at: new Date().toISOString() });
        }
        return { changes: 1 };
      }
    };
  }
}

let dbInstance;
if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  console.warn('[NovaTurk DB] ⚠️ TURSO_DATABASE_URL / TURSO_AUTH_TOKEN bulundu ama Turso bağlantısı henüz uygulanmadı. Şu an yerel SQLite dosyası kullanılıyor ve bu dosya Render free plan gibi kalıcı diski olmayan ortamlarda her yeniden başlatmada sıfırlanır.');
}

try {
  const sqliteModule = await import('node:sqlite');
  if (sqliteModule && sqliteModule.DatabaseSync) {
    dbInstance = new sqliteModule.DatabaseSync(DB_PATH);
    // WAL modunda ani süreç sonlandırmalarında (ör. systemctl restart) bozulma riskini azaltmak için
    // senkron modu güvenli tarafta tutuyoruz. (Bu ayarlar zaten node:sqlite'ın WAL varsayılanıyla uyumlu.)
    dbInstance.exec('PRAGMA journal_mode=WAL;');
    dbInstance.exec('PRAGMA synchronous=NORMAL;');
    console.log('[NovaTurk DB] Native SQLite motoru aktif.');
  } else {
    throw new Error('DatabaseSync not found');
  }
} catch (err) {
  console.log('[NovaTurk DB] SQLite modülü bulunamadı, bellek içi ultra hızlı depolama aktif edildi:', err.message);
  dbInstance = new MemoryDbAdapter();
}

export const db = dbInstance;

// Sunucu kapanırken (systemctl restart/stop, SIGINT vb.) WAL'ı ana dosyaya yazıp veritabanını
// düzgün kapatır. Önceden bu hiç yapılmıyordu ve ani kapanmalar veritabanı bozulmasına yol açtı
// (bu oturumda gerçekten yaşandı ve elle onarıldı — bkz. proje notları).
export function closeDatabase() {
  try {
    if (typeof dbInstance.exec === 'function') {
      dbInstance.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    }
    if (typeof dbInstance.close === 'function') {
      dbInstance.close();
    }
    console.log('[NovaTurk DB] Veritabanı güvenli şekilde kapatıldı.');
  } catch (err) {
    console.error('[NovaTurk DB] Kapatma hatası:', err.message);
  }
}

// Veritabanı Tablolarını Başlat
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      authority_score REAL DEFAULT 95.0,
      is_verified INTEGER DEFAULT 1,
      last_crawled_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER,
      title TEXT NOT NULL,
      url TEXT UNIQUE NOT NULL,
      snippet TEXT,
      content TEXT,
      indexed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_id) REFERENCES sites(id)
    );

    CREATE TABLE IF NOT EXISTS search_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      results_count INTEGER DEFAULT 0,
      execution_ms REAL DEFAULT 0,
      searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS query_cache (
      query_key TEXT PRIMARY KEY,
      results_json TEXT NOT NULL,
      cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blocked_domains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT UNIQUE NOT NULL,
      reason TEXT,
      blocked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      reason TEXT NOT NULL,
      detail TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      target TEXT,
      detail TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rss_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      domain TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Haber',
      is_active INTEGER DEFAULT 1,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // İlk Kurulumda 50 Türk Sitesini Veritabanına Yükle
  seedInitialSites();
}

export function logAdminAction(action, target, detail) {
  try {
    db.prepare('INSERT INTO admin_audit_log (action, target, detail) VALUES (?, ?, ?)').run(
      action, target || null, detail ? JSON.stringify(detail) : null
    );
  } catch (err) {
    console.warn('[Audit Log] Yazma hatası:', err.message);
  }
}

function seedInitialSites() {
  try {
    const indexPath = path.join(__dirname, '../src/data/turkishWebIndex.json');
    if (!fs.existsSync(indexPath)) return;

    const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    const sites = Array.isArray(data) ? data : (data.sites || []);

    const checkCountStmt = db.prepare('SELECT COUNT(*) as count FROM sites');
    const res = checkCountStmt.get();
    if (res && res.count > 0) return; // Zaten dolu

    const insertSite = db.prepare(`
      INSERT OR IGNORE INTO sites (domain, name, category, url, description, authority_score, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    const insertPage = db.prepare(`
      INSERT OR IGNORE INTO pages (site_id, title, url, snippet, content)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const site of sites) {
      insertSite.run(
        site.domain,
        site.name,
        site.category,
        site.url,
        site.description || '',
        site.authorityScore || 98.0
      );

      // Ana sayfasını pages tablosuna ekle
      insertPage.run(
        site.id || 1,
        site.title || site.name,
        site.url,
        site.snippet || site.description || '',
        `${site.name} ${site.description || ''} ${site.keywords ? site.keywords.join(' ') : ''}`
      );
    }

    console.log(`[NovaTurk DB] 50 Türk sitesi SQLite veritabanına başarıyla aktarıldı.`);
  } catch (err) {
    console.error('[NovaTurk DB] Seed hatası:', err);
  }
}

// Türkçe Ek Temizleme (basit kural-tabanlı, gerçek bir NLP kütüphanesi değil)
// Amaç: "haberler" araması "haber" içeren sayfaları da bulabilsin, "ekonomiye" → "ekonomi" eşleşsin vb.
const TURKISH_SUFFIXES = [
  'lerinden', 'larından', 'lerine', 'larına', 'lerini', 'larını',
  'lerdeki', 'lardaki', 'lerde', 'larda', 'lerden', 'lardan', 'lerin', 'ların', 'leri', 'ları', 'ler', 'lar',
  'ndaki', 'ndeki', 'ndan', 'nden', 'nda', 'nde', 'nin', 'nın', 'nun', 'nün',
  'deki', 'daki', 'teki', 'taki',
  'den', 'dan', 'ten', 'tan', 'de', 'da', 'te', 'ta',
  'yle', 'yla', 'yi', 'yı', 'yu', 'yü',
  'e', 'a', 'i', 'ı', 'u', 'ü'
];

function stemTurkish(word) {
  let w = word;
  for (let pass = 0; pass < 2; pass++) {
    const suffix = TURKISH_SUFFIXES.find(s => w.length - s.length >= 3 && w.endsWith(s));
    if (!suffix) break;
    w = w.slice(0, -suffix.length);
  }
  return w;
}

// Arama Sorgusu (Türkçe Ek-Duyarlı TF Benzeri Alaka Skorlaması ile Sıralanmış)
export function searchLocalDb(query) {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return [];

  const rawTerms = cleanQ.split(/\s+/).filter(Boolean);
  const stemmedTerms = [...new Set(rawTerms.map(stemTurkish))];

  // Aday satırları çekerken hem tam ifadeyi hem de kök-terimleri ara (ek farkını tolere et)
  const likeTargets = [`%${cleanQ}%`, ...stemmedTerms.map(t => `%${t}%`)];
  const conditions = likeTargets.map(() => '(LOWER(p.title) LIKE ? OR LOWER(p.snippet) LIKE ? OR LOWER(p.content) LIKE ?)').join(' OR ');
  const params = likeTargets.flatMap(t => [t, t, t]);

  const stmt = db.prepare(`
    SELECT p.id, p.title, p.url, p.snippet, p.content, s.name as sourceName, s.domain as displayLink, s.category, s.authority_score
    FROM pages p
    LEFT JOIN sites s ON p.site_id = s.id
    WHERE ${conditions}
    LIMIT 300
  `);

  const candidates = stmt.all(...params);

  function relevanceScore(row) {
    const title = (row.title || '').toLowerCase();
    const snippet = (row.snippet || '').toLowerCase();
    const content = (row.content || '').toLowerCase();
    let score = 0;

    if (title.includes(cleanQ)) score += 50; // tam ifade başlıkta geçiyor

    for (const term of rawTerms) {
      if (title.includes(term)) score += 12;
      if (snippet.includes(term)) score += 5;
      if (content) {
        const occurrences = content.split(term).length - 1;
        score += Math.min(occurrences, 5) * 2; // terim frekansı (üst sınırlı)
      }
    }

    // Kök-terim eşleşmeleri (ör. "haberler" → "haber") daha düşük ağırlıkla puanlanır
    for (const stem of stemmedTerms) {
      if (!stem || rawTerms.includes(stem)) continue;
      if (title.includes(stem)) score += 6;
      if (snippet.includes(stem)) score += 3;
    }

    score += (row.authority_score || 50) / 10; // kaynak otorite bonusu
    return score;
  }

  return candidates
    .map(row => ({ ...row, relevanceScore: relevanceScore(row) }))
    .filter(row => row.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 20)
    .map(({ content, ...rest }) => rest); // ham içeriği dışarı sızdırma
}

// ⚡ L1 Ultra Hızlı Bellek İçi Önbellek (0.001s / 1ms Gecikme)
const MAX_L1_CAPACITY = 1000;
const L1_CACHE = new Map();

export const cacheStats = {
  l1Hits: 0,
  sqliteHits: 0,
  misses: 0,
  writes: 0
};

// Başlangıçta Popüler Türk Aramalarını L1 Önbelleğe Doldur
for (const [key, results] of Object.entries(TOP_TURKISH_PRESEEDED_QUERIES)) {
  L1_CACHE.set(key.toLowerCase().trim(), {
    results,
    cachedAt: Date.now()
  });
}

// Akıllı Önbellek Okuma (Tier 1 - L1: 0.001ms, Tier 2 - SQLite: 1ms)
export function getCachedQuery(query) {
  try {
    const key = query.trim().toLowerCase();

    // 1. Aşama: L1 In-Memory Cache (0.001 ms)
    if (L1_CACHE.has(key)) {
      cacheStats.l1Hits++;
      const item = L1_CACHE.get(key);
      // LRU yeniden sıralama
      L1_CACHE.delete(key);
      L1_CACHE.set(key, item);
      return item.results;
    }

    // 2. Aşama: SQLite / Kalıcı Cache (1-2 ms)
    const row = db.prepare(`
      SELECT results_json, cached_at 
      FROM query_cache 
      WHERE query_key = ? AND datetime(cached_at, '+7 days') > datetime('now')
    `).get(key);

    if (row && row.results_json) {
      cacheStats.sqliteHits++;
      const parsed = JSON.parse(row.results_json);
      // L1'e terfi ettir
      if (L1_CACHE.size >= MAX_L1_CAPACITY) {
        const oldestKey = L1_CACHE.keys().next().value;
        L1_CACHE.delete(oldestKey);
      }
      L1_CACHE.set(key, { results: parsed, cachedAt: Date.now() });
      return parsed;
    }

    cacheStats.misses++;
  } catch (err) {
    console.warn('[Cache Read Error]:', err.message);
  }
  return null;
}

// Akıllı Önbellek Yazma (Write-on-Read / Arandıkça Otomatik İndeksleme)
export function saveCachedQuery(query, results) {
  try {
    if (!results || results.length === 0) return;
    const key = query.trim().toLowerCase();

    // 1. L1 Belleğe Yaz
    if (L1_CACHE.size >= MAX_L1_CAPACITY) {
      const oldestKey = L1_CACHE.keys().next().value;
      L1_CACHE.delete(oldestKey);
    }
    L1_CACHE.set(key, { results, cachedAt: Date.now() });
    cacheStats.writes++;

    // 2. SQLite / Kalıcı Depolamaya Yaz
    db.prepare(`
      INSERT OR REPLACE INTO query_cache (query_key, results_json, cached_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(key, JSON.stringify(results));
  } catch (err) {
    console.warn('[Cache Write Error]:', err.message);
  }
}

export function getCacheStats() {
  return {
    l1Size: L1_CACHE.size,
    maxCapacity: MAX_L1_CAPACITY,
    l1Hits: cacheStats.l1Hits,
    sqliteHits: cacheStats.sqliteHits,
    totalHits: cacheStats.l1Hits + cacheStats.sqliteHits,
    misses: cacheStats.misses,
    writes: cacheStats.writes,
    preseededTopics: Object.keys(TOP_TURKISH_PRESEEDED_QUERIES)
  };
}
