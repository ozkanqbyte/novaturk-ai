/**
 * NovaTürk AI - 500 Gerçek Türk Sitesi ve Alt Sayfa Derin Tarama Motoru
 * Veritabanındaki seçkin 500 Türk sitesini sırayla ve derinlemesine tarar,
 * reklam ve çöplerden arındırarak SQLite ters dizinine kalıcı olarak kaydeder.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../database/novaturk.db');

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA cache_size = -64000;
`);

const TARGET_SITE_COUNT = 500;
const SUBPAGES_PER_SITE = 4; // Her siteden taranacak derin alt sayfa sayısı
const CONCURRENCY = 18;       // Paralel bot sayısı
const TIMEOUT_MS = 4500;      // Zaman aşımı

const insertPageStmt = db.prepare(`
  INSERT OR REPLACE INTO pages (site_id, title, url, snippet, content, indexed_at)
  VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`);

const updateSiteCrawledStmt = db.prepare(`
  UPDATE sites SET last_crawled_at = CURRENT_TIMESTAMP WHERE id = ?
`);

const IGNORED_EXT = /\.(jpg|jpeg|png|gif|webp|svg|ico|pdf|zip|rar|tar|gz|mp4|mp3|avi|mov|exe|dmg|iso|css|js|woff|woff2|ttf|eot|xml|json|docx?|xlsx?)$/i;

function cleanText(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePage(html, url) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1].trim() : '';
  title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ');

  const descMatch = html.match(/<meta[^>]*name=["'](?:description|twitter:description)["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*property=["'](?:og:description)["'][^>]*content=["']([^"']*)["']/i);
  let description = descMatch ? descMatch[1].trim() : '';

  const cleaned = cleanText(html);
  if (!title) {
    title = cleaned.slice(0, 60) || url;
  }

  const snippet = description || (cleaned.slice(0, 200) + '...');
  const content = cleaned.slice(0, 4500);

  return { title, snippet, content };
}

function extractDomainSublinks(html, baseUrl, baseDomain) {
  const links = new Set();
  const linkRegex = /<a\b[^>]*\bhref=["']([^"'#\s]+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw || raw.startsWith('javascript:') || raw.startsWith('mailto:') || raw.startsWith('tel:')) continue;

    try {
      const resolved = new URL(raw, baseUrl);
      if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') continue;
      if (IGNORED_EXT.test(resolved.pathname)) continue;

      // Sadece aynı alan adında kal (internal linkler)
      const host = resolved.hostname.toLowerCase();
      if (host !== baseDomain && !host.endsWith('.' + baseDomain)) continue;

      const pathLower = resolved.pathname.toLowerCase();
      if (pathLower.includes('/login') || pathLower.includes('/signin') || pathLower.includes('/auth') || pathLower.includes('/cart')) continue;

      resolved.searchParams.delete('utm_source');
      resolved.searchParams.delete('utm_medium');
      resolved.searchParams.delete('utm_campaign');
      resolved.searchParams.delete('fbclid');
      resolved.searchParams.delete('ref');
      resolved.hash = '';

      links.add(resolved.href);
      if (links.size >= 15) break;
    } catch {}
  }

  return Array.from(links);
}

async function fetchPage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 NovaTurkBot/2.5 (+https://novaturk-ai.onrender.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8'
      },
      redirect: 'follow'
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return null;

    const html = await res.text();
    if (!html || html.length < 250) return null;

    return html;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function startCrawl() {
  console.log('===============================================================');
  console.log(`🚀 NovaTürk AI: 500 Gerçek Türk Sitesi Taraması Başlatılıyor...`);
  console.log(`📊 Eşzamanlı Bot Sayısı: ${CONCURRENCY} Worker`);
  console.log(`⏱️ Zaman Aşımı: ${TIMEOUT_MS / 1000} saniye/site`);
  console.log('===============================================================\n');

  // Veritabanından 500 seçkin siteyi çek
  const siteRows = db.prepare(`SELECT id, domain, name, category, url FROM sites LIMIT ?`).all(TARGET_SITE_COUNT);
  console.log(`✅ Taranacak Site Havuzu: ${siteRows.length} seçkin Türk platformu yüklendi.\n`);

  let sitesCompleted = 0;
  let pagesIndexed = 0;
  let totalBytes = 0;
  let errors = 0;
  const startTime = Date.now();

  const queue = [...siteRows];

  async function worker(workerId) {
    while (queue.length > 0) {
      const site = queue.shift();
      if (!site) break;

      const targetUrl = site.url || `https://${site.domain}`;
      const baseDomain = site.domain.toLowerCase().replace(/^www\./, '');

      try {
        // 1. Ana Sayfayı Tara
        const mainHtml = await fetchPage(targetUrl);
        if (mainHtml) {
          const parsed = parsePage(mainHtml, targetUrl);
          insertPageStmt.run(site.id, parsed.title, targetUrl, parsed.snippet, parsed.content);
          updateSiteCrawledStmt.run(site.id);
          pagesIndexed++;
          totalBytes += parsed.content.length;

          // 2. Alt Sayfaları Keşfet ve İndeksle
          const sublinks = extractDomainSublinks(mainHtml, targetUrl, baseDomain);
          const toCrawl = sublinks.slice(0, SUBPAGES_PER_SITE);

          for (const sublink of toCrawl) {
            try {
              const subHtml = await fetchPage(sublink);
              if (subHtml) {
                const subParsed = parsePage(subHtml, sublink);
                insertPageStmt.run(site.id, subParsed.title, sublink, subParsed.snippet, subParsed.content);
                pagesIndexed++;
                totalBytes += subParsed.content.length;
              }
            } catch {}
          }
        } else {
          errors++;
        }
      } catch (err) {
        errors++;
      }

      sitesCompleted++;

      if (sitesCompleted % 25 === 0 || sitesCompleted === siteRows.length) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const speed = (pagesIndexed / (elapsed || 1)).toFixed(1);
        const mb = (totalBytes / (1024 * 1024)).toFixed(2);
        console.log(`[NovaTürk Bot] 🌐 ${sitesCompleted}/${siteRows.length} site tarandı | Toplam ${pagesIndexed} sayfa indekslendi (${mb} MB) | Hız: ${speed} sayfa/sn | Süre: ${elapsed}s`);
      }

      await new Promise(r => setTimeout(r, 50));
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker(i));
  }

  await Promise.all(workers);

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
  const totalPagesInDb = db.prepare('SELECT count(*) as count FROM pages').get().count;

  console.log('\n===============================================================');
  console.log(`🏆 500 TÜRK SİTESİ VE ALT SAYFA TARAMASI TAMAMLANDI!`);
  console.log(`✅ Başarıyla Taranan Site: ${sitesCompleted}`);
  console.log(`📑 Yeni İndekslenen Sayfa: ${pagesIndexed}`);
  console.log(`💾 Veritabanındaki Toplam Sayfa: ${totalPagesInDb}`);
  console.log(`📦 Arındırılmış Saf Metin: ${totalMb} MB`);
  console.log(`⏱️ Toplam Süre: ${totalTimeSec} saniye`);
  console.log(`⚡ SQLite Dosyası: ${DB_PATH}`);
  console.log('===============================================================\n');
}

startCrawl();
