import { DatabaseSync } from 'node:sqlite';
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
export const db = new DatabaseSync(DB_PATH);

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
