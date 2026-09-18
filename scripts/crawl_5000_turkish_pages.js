/**
 * NovaTürk AI - 5,000 Türk Sayfası Yüksek Hızlı Otonom Web Crawler
 * 50 Seçkin Türk Tohumu üzerinden derin bağlantı analiziyle 5.000 gerçek Türk sayfasını
 * reklam ve çöplerden arındırarak SQLite ters dizinine kaydeder.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../database/novaturk.db');
const TARGET_PAGE_COUNT = 5000;
const CONCURRENCY = 16;
const TIMEOUT_MS = 6000;

// Veritabanı Bağlantısı ve WAL / Yüksek Hız Optimizasyonu
const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA cache_size = -64000;
`);

const insertPageStmt = db.prepare(`
  INSERT OR REPLACE INTO pages (site_id, title, url, snippet, content, indexed_at)
  VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`);

const countPagesStmt = db.prepare(`SELECT COUNT(*) as count FROM pages`);

// Başlangıç Tohum URL'leri (50+ Güvenilir Türk Platformu)
const INITIAL_SEEDS = [
  // Haber & Basın
  'https://www.aa.com.tr/tr',
  'https://www.aa.com.tr/tr/gundem',
  'https://www.aa.com.tr/tr/ekonomi',
  'https://www.aa.com.tr/tr/bilim-teknoloji',
  'https://www.trthaber.com',
  'https://www.trthaber.com/haber/gundem/',
  'https://www.trthaber.com/haber/ekonomi/',
  'https://www.ntv.com.tr',
  'https://www.ntv.com.tr/turkiye',
  'https://www.ntv.com.tr/teknoloji',
  'https://www.bbc.com/turkce',
  'https://www.haberturk.com',
  'https://www.sozcu.com.tr',
  'https://www.cumhuriyet.com.tr',
  'https://www.hurriyet.com.tr',
  'https://www.milliyet.com.tr',
  'https://www.cnnturk.com',

  // Teknoloji & Girişim
  'https://webrazzi.com',
  'https://webrazzi.com/kategori/yapay-zeka/',
  'https://webrazzi.com/kategori/girisimler/',
  'https://www.donanimhaber.com',
  'https://shiftdelete.net',
  'https://shiftdelete.net/kategori/yapay-zeka',
  'https://shiftdelete.net/kategori/otomobil',
  'https://www.webtekno.com',
  'https://www.webtekno.com/haberler',
  'https://www.chip.com.tr',
  'https://www.technopat.net',
  'https://www.technopat.net/kategori/haber/',
  'https://www.log.com.tr',
  'https://www.btk.gov.tr',
  'https://togg.com.tr',

  // Bilim, Eğitim & Akademi
  'https://tr.wikipedia.org/wiki/T%C3%BCrkiye',
  'https://tr.wikipedia.org/wiki/T%C3%BCrkiye_tarihi',
  'https://tr.wikipedia.org/wiki/Atat%C3%BCrk',
  'https://tr.wikipedia.org/wiki/Yapay_zek%C3%A2',
  'https://tr.wikipedia.org/wiki/T%C3%BCrk_dili',
  'https://tr.wikipedia.org/wiki/Anadolu',
  'https://tr.wikipedia.org/wiki/Bili%C5%9Fim',
  'https://www.tubitak.gov.tr',
  'https://evrimagaci.org',
  'https://evrimagaci.org/kategori/astronomi-ve-uzay-13',
  'https://evrimagaci.org/kategori/fizik-18',
  'https://arkeofili.com',
  'https://arkeofili.com/kategori/arkeoloji/',
  'https://dergipark.org.tr',
  'https://www.meb.gov.tr',
  'https://www.osym.gov.tr',
  'https://www.metu.edu.tr',
  'https://www.itu.edu.tr',
  'https://www.boun.edu.tr',
  'https://www.anadolu.edu.tr',

  // Ekonomi & Borsa
  'https://www.bloomberght.com',
  'https://www.dunya.com',
  'https://www.borsaistanbul.com',
  'https://www.tcmb.gov.tr',
  'https://bigpara.hurriyet.com.tr',
  'https://www.doviz.com',
  'https://paraajansi.com.tr',
  'https://www.finansgundem.com',

  // Topluluk, Rehber & Resmî
  'https://www.r10.net',
  'https://wmaraci.com',
  'https://www.akakce.com',
  'https://www.cimri.com',
  'https://www.memurlar.net',
  'https://forum.donanimhaber.com',
  'https://www.turkiye.gov.tr',
  'https://www.resmigazete.gov.tr'
];

const IGNORED_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|ico|pdf|zip|rar|7z|tar|gz|mp4|mp3|avi|mov|exe|dmg|iso|css|js|woff|woff2|ttf|eot|xml|json)$/i;

const TURKISH_DOMAINS_SUBSTR = [
  '.tr', 'anadolu', 'tubitak', 'shiftdelete', 'donanimhaber', 'webtekno',
  'webrazzi', 'technopat', 'evrimagaci', 'arkeofili', 'dergipark',
  'trthaber', 'ntv.com.tr', 'sozcu', 'haberturk', 'hurriyet', 'milliyet',
  'cumhuriyet', 'dunya.com', 'doviz.com', 'bigpara', 'borsaistanbul',
  'tcmb.gov', 'meb.gov', 'osym.gov', 'turkiye.gov', 'resmigazete',
  'wikipedia.org/wiki/', 'akakce', 'cimri', 'memurlar.net', 'r10.net'
];

function isAllowedTurkishUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (IGNORED_EXTENSIONS.test(parsed.pathname)) return false;

    const host = parsed.hostname.toLowerCase();
    const full = parsed.href.toLowerCase();

    // Özel engellenenler (login, üyelik formları, şifre sıfırlama)
    if (full.includes('/login') || full.includes('/signin') || full.includes('/uye-ol') || full.includes('/register') || full.includes('/auth/')) {
      return false;
    }

    return TURKISH_DOMAINS_SUBSTR.some(sub => host.endsWith(sub) || host.includes(sub) || full.includes(sub));
  } catch {
    return false;
  }
}

function extractLinks(html, baseUrl) {
  const discovered = new Set();
  const linkRegex = /<a\b[^>]*\bhref=["']([^"'#\s]+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw || raw.startsWith('javascript:') || raw.startsWith('mailto:') || raw.startsWith('tel:')) continue;

    try {
      const resolved = new URL(raw, baseUrl);
      resolved.searchParams.delete('utm_source');
      resolved.searchParams.delete('utm_medium');
      resolved.searchParams.delete('utm_campaign');
      resolved.searchParams.delete('fbclid');
      resolved.searchParams.delete('ref');
      resolved.hash = '';

      const cleaned = resolved.href;
      if (isAllowedTurkishUrl(cleaned)) {
        discovered.add(cleaned);
      }
    } catch {}
  }
  return Array.from(discovered);
}

function parsePage(html, url) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1].trim() : '';
  title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ');

  const descMatch = html.match(/<meta[^>]*name=["'](?:description|twitter:description)["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*property=["'](?:og:description)["'][^>]*content=["']([^"']*)["']/i);
  let description = descMatch ? descMatch[1].trim() : '';

  // H1, H2 ve Makale metinlerini zenginleştir
  let cleanContent = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!title) {
    try { title = new URL(url).hostname; } catch { title = 'Türkçe Web Kaynağı'; }
  }

  const snippet = description || (cleanContent.slice(0, 200) + '...');
  const indexedBody = cleanContent.slice(0, 3500);

  return { title, snippet, content: indexedBody };
}

async function startCrawler() {
  const initialCount = countPagesStmt.get().count;
  console.log('===========================================================');
  console.log(`🚀 NovaTürk 5.000 Türk Sayfası Derin Tarayıcısı Başlatıldı`);
  console.log(`📊 Mevcut Kayıtlı Sayfa: ${initialCount}`);
  console.log(`🎯 Hedef Sayfa Sayısı : ${TARGET_PAGE_COUNT}`);
  console.log(`⚡ Eşzamanlı İş Parçacığı: ${CONCURRENCY}`);
  console.log('===========================================================\n');

  const visited = new Set();
  const queue = [...INITIAL_SEEDS];
  let totalIndexed = initialCount;
  let successful = 0;
  let errors = 0;
  const startTime = Date.now();

  async function worker(id) {
    while (queue.length > 0 && totalIndexed < TARGET_PAGE_COUNT) {
      const currentUrl = queue.shift();
      if (!currentUrl || visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const res = await fetch(currentUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 NovaTurkBot/2.0 (+https://novaturk-engine.vercel.app)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8'
          },
          redirect: 'follow'
        });
        clearTimeout(timeout);

        if (!res.ok) {
          errors++;
          continue;
        }

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
          continue;
        }

        const html = await res.text();
        if (!html || html.length < 200) continue;

        const parsed = parsePage(html, currentUrl);

        // Veritabanına kaydet
        insertPageStmt.run(1, parsed.title, currentUrl, parsed.snippet, parsed.content);

        totalIndexed++;
        successful++;

        // Yeni linkleri kuyruğa ekle (kuyruk şişmesin diye max 25.000 link)
        if (queue.length < 25000) {
          const links = extractLinks(html, currentUrl);
          for (const l of links) {
            if (!visited.has(l)) queue.push(l);
          }
        }

        // İlerleme Durumu Raporu (Her 100 sayfada bir)
        if (totalIndexed % 100 === 0 || totalIndexed === TARGET_PAGE_COUNT) {
          const percent = ((totalIndexed / TARGET_PAGE_COUNT) * 100).toFixed(1);
          const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
          const speed = (successful / (elapsedSec || 1)).toFixed(1);
          console.log(`[NovaTurk İlerleme] 🚀 ${totalIndexed} / ${TARGET_PAGE_COUNT} sayfa (${percent}%) | Hız: ${speed} sayfa/sn | Kuyruk: ${queue.length} | Süre: ${elapsedSec}s`);
        }

      } catch (err) {
        errors++;
      }

      // Sunucuları boğmamak için mikrosaniye bekle
      await new Promise(r => setTimeout(r, 40));
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker(i));
  }

  await Promise.all(workers);

  const durationMin = ((Date.now() - startTime) / 60000).toFixed(2);
  const finalCount = countPagesStmt.get().count;

  console.log('\n===========================================================');
  console.log(`🎉 5.000 TÜRK SAYFASI TARAMASI BAŞARIYLA TAMAMLANDI!`);
  console.log(`📊 Toplam İndekslenen Sayfa: ${finalCount}`);
  console.log(`⏱️ Toplam Geçen Süre: ${durationMin} dakika`);
  console.log(`💾 Veritabanı Dosyası: ${DB_PATH}`);
  console.log('===========================================================');
}

startCrawler();
