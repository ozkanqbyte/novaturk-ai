import { db } from './db.js';
import { checkThreat, assessSpam, SPAM_DROP_THRESHOLD } from './safety.js';

// Admin panelinden yasaklanmış bir domain mi? (blocked_domains tablosu)
export function isDomainBlocked(hostname) {
  return !!db.prepare('SELECT 1 FROM blocked_domains WHERE domain = ?').get(hostname);
}

// URL'nin gerçek hostname'ine göre doğru site_id'yi bulur, yoksa otomatik keşif olarak oluşturur.
// (Önceden her keşfedilen sayfa, hangi siteden geldiğine bakılmaksızın site_id=1'e yazılıyordu.)
// Yasaklı bir domain ise null döner — çağıran taraf bu sayfayı index'e eklememelidir.
export function getOrCreateSiteId(hostname) {
  if (isDomainBlocked(hostname)) return null;

  const existing = db.prepare('SELECT id FROM sites WHERE domain = ?').get(hostname);
  if (existing) return existing.id;

  db.prepare(`
    INSERT OR IGNORE INTO sites (domain, name, category, url, description, authority_score, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(hostname, hostname, 'Otomatik Keşif', `https://${hostname}`, `${hostname} - otomatik keşfedilen site`, 70);

  const created = db.prepare('SELECT id FROM sites WHERE domain = ?').get(hostname);
  return created ? created.id : null;
}

// İlerleme Durumu Takibi
export const crawlerState = {
  isRunning: false,
  totalIndexed: 0,
  targetMax: 0,
  currentUrl: '',
  successful: 0,
  errors: 0,
  startedAt: null
};

// Dosya Uzantısı Filtresi (Görsel, medya vb. atlanır)
const IGNORED_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|pdf|zip|tar|gz|mp4|mp3|avi|mov|exe|dmg|iso|css|js|woff|woff2|ttf|eot)$/i;

// robots.txt Önbelleği (origin -> { disallowed, fetchedAt })
const ROBOTS_CACHE = new Map();
const ROBOTS_TTL_MS = 30 * 60 * 1000; // 30 dakika

function parseRobotsTxt(text) {
  const lines = text.split('\n').map(l => l.trim());
  const disallowed = [];
  let appliesToUs = false;

  for (const line of lines) {
    if (/^user-agent:/i.test(line)) {
      const agent = line.split(':').slice(1).join(':').trim();
      appliesToUs = agent === '*' || agent.toLowerCase().includes('novaturkbot');
    } else if (appliesToUs && /^disallow:/i.test(line)) {
      const rulePath = line.split(':').slice(1).join(':').trim();
      if (rulePath) disallowed.push(rulePath);
    }
  }
  return disallowed;
}

async function getDisallowedPaths(origin) {
  const cached = ROBOTS_CACHE.get(origin);
  if (cached && Date.now() - cached.fetchedAt < ROBOTS_TTL_MS) {
    return cached.disallowed;
  }

  let disallowed = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${origin}/robots.txt`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'NovaTurkBot/2.0' }
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      disallowed = parseRobotsTxt(await res.text());
    }
  } catch {
    disallowed = []; // robots.txt okunamıyorsa varsayılan: tarama engellenmez
  }

  ROBOTS_CACHE.set(origin, { disallowed, fetchedAt: Date.now() });
  return disallowed;
}

function isPathAllowed(pathname, disallowed) {
  return !disallowed.some(rule => rule !== '' && pathname.startsWith(rule));
}

export function extractLinks(html, baseUrl) {
  const links = new Set();
  const linkRegex = /<a\b[^>]*\bhref=["']([^"'#\s]+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const rawHref = match[1].trim();
    if (!rawHref || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      continue;
    }

    try {
      const resolved = new URL(rawHref, baseUrl);
      // Sadece http ve https
      if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') continue;

      // Medya dosyalarını atla
      if (IGNORED_EXTENSIONS.test(resolved.pathname)) continue;

      // İzleme parametrelerini temizle
      resolved.searchParams.delete('utm_source');
      resolved.searchParams.delete('utm_medium');
      resolved.searchParams.delete('utm_campaign');
      resolved.searchParams.delete('fbclid');
      resolved.searchParams.delete('ref');

      // Türk alan adı veya güvenilir kaynak kontrolü
      const host = resolved.hostname.toLowerCase();
      const isTurkish = host.endsWith('.tr') || host.includes('tubitak') || host.includes('anadolu') || host.includes('eksisozluk') || host.includes('shiftdelete') || host.includes('webtekno');

      if (isTurkish) {
        links.add(resolved.href);
      }
    } catch {
      // Geçersiz URL atla
    }
  }

  return Array.from(links);
}

export async function crawlSite(siteUrl, explicitSiteId = null) {
  try {
    const parsedUrl = new URL(siteUrl);

    if (isDomainBlocked(parsedUrl.hostname)) {
      return { success: false, url: siteUrl, error: 'Bu domain admin panelinden yasaklanmış', links: [] };
    }

    const disallowed = await getDisallowedPaths(parsedUrl.origin);
    if (!isPathAllowed(parsedUrl.pathname, disallowed)) {
      return { success: false, url: siteUrl, error: 'robots.txt tarafından engellendi', links: [] };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(siteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'NovaTurkBot/2.0 (+https://novaturk-engine.vercel.app; Turkiye Milli Yapay Zeka Tarayicisi)',
        'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    // HTML Temizleme ve Başlık Çıkarma
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : siteUrl;

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const description = descMatch ? descMatch[1].replace(/\s+/g, ' ').trim() : '';

    // Kod ve gereksiz etiketleri temizle
    const cleanContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3500);

    const snippet = description || (cleanContent.slice(0, 180) + '...');

    // Sayfa içi bağlantıları topla (Link Discovery)
    const discoveredLinks = extractLinks(html, siteUrl);

    // Güvenlik: bilinen zararlı adres veya yüksek spam puanlı sayfa indekse girmez
    if (checkThreat(siteUrl)) {
      return { success: false, url: siteUrl, error: 'Bilinen zararlı adres (tehdit listesi)', links: [] };
    }
    const spam = assessSpam({ url: siteUrl, title, snippet: description, authorityScore: 0 });
    if (spam.score >= SPAM_DROP_THRESHOLD) {
      return { success: false, url: siteUrl, error: 'Spam olarak değerlendirildi: ' + spam.reasons.join(', '), links: [] };
    }

    // Veritabanına kaydet — site_id her zaman gerçek hostname'e göre çözülür
    const resolvedSiteId = explicitSiteId || getOrCreateSiteId(parsedUrl.hostname);

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO pages (site_id, title, url, snippet, content, indexed_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(resolvedSiteId, title, siteUrl, snippet, cleanContent);

    return {
      success: true,
      title,
      url: siteUrl,
      charsIndexed: cleanContent.length,
      linksDiscovered: discoveredLinks.length,
      links: discoveredLinks
    };
  } catch (err) {
    return {
      success: false,
      url: siteUrl,
      error: err.message,
      links: []
    };
  }
}

// 🌐 Otonom Kuyruklu Derin Tarama (Bellek Dostu & 512MB RAM Korumalı)
export async function runBatchCrawler(initialUrls, maxPages = 50, concurrency = 3) {
  if (crawlerState.isRunning) {
    return { status: 'already_running', progress: crawlerState };
  }

  crawlerState.isRunning = true;
  crawlerState.targetMax = maxPages;
  crawlerState.totalIndexed = 0;
  crawlerState.successful = 0;
  crawlerState.errors = 0;
  crawlerState.startedAt = new Date().toISOString();

  const queue = [...initialUrls];
  const visited = new Set();

  console.log(`[NovaTurk Crawler] Toplu tarama baslatildi. Hedef: ${maxPages} sayfa, Eszamanlilik: ${concurrency}`);

  async function worker() {
    while (queue.length > 0 && crawlerState.totalIndexed < maxPages && crawlerState.isRunning) {
      const url = queue.shift();
      if (!url || visited.has(url)) continue;
      visited.add(url);

      crawlerState.currentUrl = url;
      const res = await crawlSite(url);

      if (res.success) {
        crawlerState.totalIndexed++;
        crawlerState.successful++;
        // Yeni keşfedilen linkleri kuyruğa ekle (maksimum 300 link kuyrukta tutulur)
        if (res.links && queue.length < 300) {
          for (const link of res.links) {
            if (!visited.has(link) && !queue.includes(link)) {
              queue.push(link);
            }
          }
        }
      } else {
        crawlerState.errors++;
      }

      // Sunucuyu ve karşı sunucuları yormamak için kısa nefes (200ms)
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // Eşzamanlı iş parçacıklarını başlat
  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  // Arka planda çalışsın, UI'ı bloke etmesin
  Promise.all(workers).then(() => {
    crawlerState.isRunning = false;
    console.log(`[NovaTurk Crawler] Tarama tamamlandi. Toplam: ${crawlerState.totalIndexed}, Hata: ${crawlerState.errors}`);
  }).catch(err => {
    crawlerState.isRunning = false;
    console.error(`[NovaTurk Crawler] Tarama hatasi:`, err);
  });

  return { status: 'started', progress: crawlerState };
}
