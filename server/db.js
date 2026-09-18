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

  initFullTextIndex();

  // Sözlük tablosu yoksa veya boşsa kur (autocomplete + yazım düzeltme için)
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS search_vocab (term TEXT PRIMARY KEY, normalized TEXT NOT NULL, frequency INTEGER NOT NULL DEFAULT 1)`);
    const vocabCount = db.prepare('SELECT COUNT(*) as count FROM search_vocab').get().count;
    const pageCount = db.prepare('SELECT COUNT(*) as count FROM pages').get().count;
    if (pageCount > 0 && vocabCount === 0) rebuildSearchVocabulary();
  } catch (err) {
    console.warn('[NovaTurk Sözlük] Başlangıç kontrolü hatası:', err.message);
  }

  // İlk Kurulumda 50 Türk Sitesini Veritabanına Yükle
  seedInitialSites();
}

// FTS5 ters indeksi kullanılabilir mi? (node:sqlite FTS5 ile derlenmiş olmalı)
export let ftsAvailable = false;

// 🔍 Gerçek Ters İndeks (Inverted Index) — FTS5
// Önceden arama `LIKE '%kelime%'` ile TÜM tabloyu tarıyordu: 6.000 sayfada bile yavaş,
// 100.000 sayfada kullanılamaz hale gelirdi. FTS5 gerçek bir ters indeks kurar ve
// yerleşik BM25 sıralamasını sağlar.
// remove_diacritics 2 → "türkiye" ile "turkiye" aynı sayılır (Türkçe için kritik).
function initFullTextIndex() {
  try {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS pages_fts USING fts5(
        title, snippet, content,
        content='pages',
        content_rowid='id',
        tokenize='unicode61 remove_diacritics 2'
      );

      CREATE TRIGGER IF NOT EXISTS pages_fts_insert AFTER INSERT ON pages BEGIN
        INSERT INTO pages_fts(rowid, title, snippet, content)
        VALUES (new.id, new.title, new.snippet, new.content);
      END;

      CREATE TRIGGER IF NOT EXISTS pages_fts_delete AFTER DELETE ON pages BEGIN
        INSERT INTO pages_fts(pages_fts, rowid, title, snippet, content)
        VALUES ('delete', old.id, old.title, old.snippet, old.content);
      END;

      CREATE TRIGGER IF NOT EXISTS pages_fts_update AFTER UPDATE ON pages BEGIN
        INSERT INTO pages_fts(pages_fts, rowid, title, snippet, content)
        VALUES ('delete', old.id, old.title, old.snippet, old.content);
        INSERT INTO pages_fts(rowid, title, snippet, content)
        VALUES (new.id, new.title, new.snippet, new.content);
      END;
    `);

    // Mevcut sayfaların indekste olduğundan emin ol.
    // DİKKAT: dış-içerikli (content='pages') FTS5 tablosunda `SELECT COUNT(*) FROM pages_fts`
    // asıl tabloya yönlenir ve indeks bomboşken bile sayfa sayısını döndürür — doluluk
    // kontrolü için KULLANILAMAZ. FTS5'in integrity-check'i de boş indeksi hata saymıyor.
    // Bu yüzden kendi meta kaydımızı tutuyoruz: en son hangi sayfa sayısıyla indeks kuruldu.
    db.exec(`CREATE TABLE IF NOT EXISTS fts_meta (key TEXT PRIMARY KEY, value TEXT)`);

    const pageCount = db.prepare('SELECT COUNT(*) as count FROM pages').get().count;
    const marker = db.prepare("SELECT value FROM fts_meta WHERE key = 'indexed_pages'").get();

    // Marker yoksa indeks hiç doldurulmamıştır. Sayfa sayısı marker'ın çok altına/üstüne
    // kaydıysa (ör. veritabanı yedekten geri yüklendi) indeksi tazeliyoruz.
    const lastIndexed = marker ? parseInt(marker.value, 10) : -1;
    const needsRebuild = pageCount > 0 && (lastIndexed < 0 || Math.abs(pageCount - lastIndexed) > pageCount * 0.5);

    if (needsRebuild) {
      db.exec("INSERT INTO pages_fts(pages_fts) VALUES('rebuild')");
      db.prepare("INSERT OR REPLACE INTO fts_meta (key, value) VALUES ('indexed_pages', ?)").run(String(pageCount));
      console.log(`[NovaTurk FTS] Ters indeks kuruldu: ${pageCount} sayfa indekslendi.`);
      rebuildSearchVocabulary(); // sözlük de indeksle birlikte tazelensin
    }

    ftsAvailable = true;
    console.log('[NovaTurk FTS] FTS5 ters indeksi aktif (BM25 sıralama kullanılabilir).');
  } catch (err) {
    ftsAvailable = false;
    console.warn('[NovaTurk FTS] FTS5 kullanılamıyor, eski LIKE aramasına düşülüyor:', err.message);
  }
}

// ============================================================================
// 📖 ARAMA SÖZLÜĞÜ (Autocomplete + Yazım Düzeltme temeli)
// İndekslenmiş sayfa başlıklarından terim frekans sözlüğü çıkarır. Hem "yazarken
// öneri" hem de "bunu mu demek istediniz?" bu sözlüğün üstünde çalışır.
// ============================================================================

// Türkçe'de çok geçen ama arama için ayırt edici olmayan kelimeler
const TURKISH_STOPWORDS = new Set([
  've', 'ile', 'için', 'bir', 'bu', 'da', 'de', 'mi', 'mı', 'mu', 'mü', 'ne',
  'ya', 'ki', 'ise', 'gibi', 'daha', 'çok', 'olan', 'olarak', 'son', 'en',
  'the', 'and', 'for', 'com', 'www', 'http', 'https'
]);

// Türkçe harfleri ASCII karşılığına indirger — şapkasız yazımı eşleştirmek için.
export function normalizeTurkish(text) {
  return (text || '')
    .toLowerCase()
    .replace(/ı/g, 'i').replace(/İ/g, 'i')
    .replace(/ş/g, 's').replace(/Ş/g, 's')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/Ü/g, 'u')
    .replace(/ö/g, 'o').replace(/Ö/g, 'o')
    .replace(/ç/g, 'c').replace(/Ç/g, 'c');
}

export function rebuildSearchVocabulary() {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS search_vocab (
        term TEXT PRIMARY KEY,
        normalized TEXT NOT NULL,
        frequency INTEGER NOT NULL DEFAULT 1
      );
      CREATE INDEX IF NOT EXISTS idx_vocab_normalized ON search_vocab(normalized);
      CREATE INDEX IF NOT EXISTS idx_vocab_frequency ON search_vocab(frequency DESC);
    `);

    const rows = db.prepare('SELECT title FROM pages').all();
    const counts = new Map();

    for (const row of rows) {
      const words = (row.title || '')
        .toLowerCase()
        .split(/[^a-zçğıöşü0-9]+/i)
        .filter(w => w.length >= 3 && w.length <= 24 && !TURKISH_STOPWORDS.has(w) && !/^\d+$/.test(w));

      for (const word of words) {
        counts.set(word, (counts.get(word) || 0) + 1);
      }
    }

    db.exec('DELETE FROM search_vocab');
    const insert = db.prepare('INSERT OR REPLACE INTO search_vocab (term, normalized, frequency) VALUES (?, ?, ?)');
    let stored = 0;
    for (const [term, freq] of counts) {
      if (freq < 2) continue; // tek seferlik kelimeler (çoğu çöp) sözlüğe girmesin
      insert.run(term, normalizeTurkish(term), freq);
      stored++;
    }

    console.log(`[NovaTurk Sözlük] ${stored} terim indekslendi (${rows.length} başlıktan).`);
    return stored;
  } catch (err) {
    console.warn('[NovaTurk Sözlük] Kurulum hatası:', err.message);
    return 0;
  }
}

// Kelimenin ünsüz iskeleti ("durumu" → "drm"). Sesli harflerin atıldığı yazımları
// eşleştirmek için kullanılır.
function consonantSkeleton(normalizedWord) {
  return (normalizedWord || '').replace(/[aeiou]/g, '');
}

// Levenshtein mesafesi — erken çıkışlı (maxDistance aşılırsa hesabı bırakır)
function editDistance(a, b, maxDistance = 2) {
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
  if (a === b) return 0;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > maxDistance) return maxDistance + 1; // bu satırdan sonrası kesin daha kötü
    prev = curr;
  }
  return prev[b.length];
}

// "Bunu mu demek istediniz?" — sorgudaki her kelimeyi sözlükteki en yakın,
// daha sık geçen terimle değiştirmeyi dener. Hiçbir kelime düzeltilmezse null döner.
export function suggestSpellingCorrection(query) {
  try {
    const words = (query || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0 || words.length > 6) return null;

    let anyCorrection = false;
    const corrected = [];

    for (const word of words) {
      if (word.length < 4) { corrected.push(word); continue; }

      const normalized = normalizeTurkish(word);
      const exact = db.prepare('SELECT term FROM search_vocab WHERE normalized = ? LIMIT 1').get(normalized);
      if (exact) { corrected.push(word); continue; } // zaten doğru yazılmış

      // Aday havuzunu daraltmak için: aynı harfle başlayan ve uzunluğu yakın terimler
      const candidates = db.prepare(`
        SELECT term, normalized, frequency FROM search_vocab
        WHERE substr(normalized, 1, 1) = substr(?, 1, 1)
          AND length(normalized) BETWEEN ? AND ?
        ORDER BY frequency DESC LIMIT 400
      `).all(normalized, Math.max(3, normalized.length - 2), normalized.length + 2);

      let best = null;
      for (const candidate of candidates) {
        const distance = editDistance(normalized, candidate.normalized, 2);
        if (distance > 2) continue;
        if (!best || distance < best.distance || (distance === best.distance && candidate.frequency > best.frequency)) {
          best = { term: candidate.term, distance, frequency: candidate.frequency };
        }
      }

      // Sesli harfi atılmış kısaltmalar ("drm" → "durumu", "hbr" → "haber").
      // Türkçe'de çok yaygın bir yazım alışkanlığı; düzenleme mesafesi bunu yakalayamaz
      // çünkü 3+ harf eksiktir. Ünsüz iskeletini karşılaştırmak doğru sonucu verir.
      if (!best) {
        const skeleton = consonantSkeleton(normalized);
        if (skeleton.length >= 2) {
          const skeletonMatch = db.prepare(`
            SELECT term, normalized, frequency FROM search_vocab
            WHERE substr(normalized, 1, 1) = substr(?, 1, 1)
            ORDER BY frequency DESC LIMIT 600
          `).all(normalized).find(c => consonantSkeleton(c.normalized) === skeleton);

          if (skeletonMatch) best = { term: skeletonMatch.term, distance: 3, frequency: skeletonMatch.frequency };
        }
      }

      if (best) { corrected.push(best.term); anyCorrection = true; }
      else corrected.push(word);
    }

    if (!anyCorrection) return null;
    const suggestion = corrected.join(' ');
    return suggestion.toLowerCase() === (query || '').toLowerCase() ? null : suggestion;
  } catch (err) {
    console.warn('[NovaTurk Yazım] Öneri hatası:', err.message);
    return null;
  }
}

// Autocomplete — geçmiş aramalar (popülerlik) + sözlük terimleri + sayfa başlıkları
export function getSuggestions(prefix, limit = 8) {
  try {
    const raw = (prefix || '').trim().toLowerCase();
    if (raw.length < 2) return [];
    const normalized = normalizeTurkish(raw);
    const suggestions = [];
    const seen = new Set();

    const add = (text, source) => {
      const key = (text || '').toLowerCase().trim();
      if (!key || seen.has(key) || key === raw) return;
      seen.add(key);
      suggestions.push({ text: key, source });
    };

    // 1) Daha önce yapılmış aramalar — en güçlü sinyal
    db.prepare(`
      SELECT query, COUNT(*) as hits FROM search_logs
      WHERE lower(query) LIKE ? GROUP BY lower(query) ORDER BY hits DESC LIMIT ?
    `).all(raw + '%', limit).forEach(r => add(r.query, 'gecmis'));

    // 2) Sözlükteki popüler terimler (şapkasız yazıma da uyar)
    db.prepare(`
      SELECT term FROM search_vocab WHERE normalized LIKE ?
      ORDER BY frequency DESC LIMIT ?
    `).all(normalized + '%', limit).forEach(r => add(r.term, 'sozluk'));

    // 3) Eşleşen sayfa başlıkları — somut içerik önerisi
    if (suggestions.length < limit) {
      db.prepare(`
        SELECT title FROM pages WHERE lower(title) LIKE ? LIMIT ?
      `).all(raw + '%', limit - suggestions.length).forEach(r => add(r.title, 'baslik'));
    }

    return suggestions.slice(0, limit);
  } catch (err) {
    console.warn('[NovaTurk Öneri] Hata:', err.message);
    return [];
  }
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

// FTS5 MATCH sorgusu için güvenli ifade üretir.
// Kullanıcı girdisi doğrudan MATCH'e verilirse tırnak/yıldız gibi karakterler sözdizimi
// hatası verir (ve sorgu enjeksiyonuna benzer davranışa yol açar) — her terim tırnak
// içine alınıp kaçışlanır. Kök-terimler prefix (*) ile de aranır: "haberler" → "haber"*
function buildFtsMatchExpression(rawTerms, stemmedTerms) {
  const quote = (t) => '"' + t.replace(/"/g, '""') + '"';
  const parts = [];

  for (const term of rawTerms) {
    if (term.length >= 2) parts.push(quote(term));
  }
  for (const stem of stemmedTerms) {
    // FTS5'te önek operatörü tırnağın hemen ardına gelmeli: "haber"* (araya boşluk girerse sözdizimi bozulur)
    if (stem.length >= 3 && !rawTerms.includes(stem)) parts.push(quote(stem) + '*');
  }
  // Terimlerden herhangi biri eşleşsin (OR), sıralamayı BM25 yapacak
  return parts.length > 0 ? parts.join(' OR ') : null;
}

// Arama Sorgusu — FTS5 ters indeksi + yerleşik BM25 sıralaması
// (FTS5 yoksa eski LIKE tabanlı yönteme düşer)
export function searchLocalDb(query) {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return [];

  const rawTerms = cleanQ.split(/\s+/).filter(Boolean);
  const stemmedTerms = [...new Set(rawTerms.map(stemTurkish))];

  if (ftsAvailable) {
    const matchExpr = buildFtsMatchExpression(rawTerms, stemmedTerms);
    if (matchExpr) {
      try {
        // bm25(tablo, ağırlıklar...) — başlık içerikten 10 kat, özet 3 kat daha önemli.
        // bm25 NEGATİF döner (küçük = daha alakalı), bu yüzden ASC sıralıyoruz.
        const ftsRows = db.prepare(`
          SELECT p.id, p.title, p.url, p.snippet, s.name as sourceName,
                 s.domain as displayLink, s.category, s.authority_score,
                 bm25(pages_fts, 10.0, 3.0, 1.0) as bm25_score
          FROM pages_fts
          JOIN pages p ON p.id = pages_fts.rowid
          LEFT JOIN sites s ON p.site_id = s.id
          WHERE pages_fts MATCH ?
          ORDER BY bm25_score ASC
          LIMIT 40
        `).all(matchExpr);

        return ftsRows
          .map(row => {
            // BM25'i pozitif bir alaka puanına çevir, otorite bonusunu ekle
            const relevance = (-(row.bm25_score || 0)) * 10 + (row.authority_score || 50) / 10;
            const { bm25_score, ...rest } = row;
            return { ...rest, relevanceScore: Number(relevance.toFixed(2)) };
          })
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, 20);
      } catch (err) {
        console.warn('[NovaTurk FTS] BM25 sorgusu başarısız, LIKE yöntemine düşülüyor:', err.message);
      }
    }
  }

  // --- Geri dönüş (fallback): FTS5 yoksa eski LIKE tabanlı arama ---
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
