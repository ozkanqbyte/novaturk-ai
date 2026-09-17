import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  console.log(`[NovaTurk DB] 🌐 Turso Cloud DB ortamı algılandı: ${process.env.TURSO_DATABASE_URL}`);
}

try {
  const sqliteModule = await import('node:sqlite');
  if (sqliteModule && sqliteModule.DatabaseSync) {
    dbInstance = new sqliteModule.DatabaseSync(DB_PATH);
    console.log('[NovaTurk DB] Native SQLite motoru aktif.');
  } else {
    throw new Error('DatabaseSync not found');
  }
} catch (err) {
  console.log('[NovaTurk DB] SQLite modülü bulunamadı, bellek içi ultra hızlı depolama aktif edildi:', err.message);
  dbInstance = new MemoryDbAdapter();
}

export const db = dbInstance;

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
  `);

  // İlk Kurulumda 50 Türk Sitesini Veritabanına Yükle
  seedInitialSites();
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

// Arama Sorgusu
export function searchLocalDb(query) {
  const cleanQ = query.trim().toLowerCase();
  const searchPattern = `%${cleanQ}%`;

  const stmt = db.prepare(`
    SELECT p.id, p.title, p.url, p.snippet, s.name as sourceName, s.domain as displayLink, s.category
    FROM pages p
    LEFT JOIN sites s ON p.site_id = s.id
    WHERE LOWER(p.title) LIKE ? OR LOWER(p.snippet) LIKE ? OR LOWER(p.content) LIKE ?
    LIMIT 20
  `);

  return stmt.all(searchPattern, searchPattern, searchPattern);
}

// Akıllı Önbellek Okuma (Tier 1 - 1ms, 7 Günlük TTL)
export function getCachedQuery(query) {
  try {
    const key = query.trim().toLowerCase();
    const row = db.prepare(`
      SELECT results_json, cached_at 
      FROM query_cache 
      WHERE query_key = ? AND datetime(cached_at, '+7 days') > datetime('now')
    `).get(key);
    if (row && row.results_json) {
      return JSON.parse(row.results_json);
    }
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
    db.prepare(`
      INSERT OR REPLACE INTO query_cache (query_key, results_json, cached_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(key, JSON.stringify(results));
  } catch (err) {
    console.warn('[Cache Write Error]:', err.message);
  }
}
