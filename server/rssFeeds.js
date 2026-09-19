import { db } from './db.js';
import { checkThreat, assessSpam, SPAM_DROP_THRESHOLD } from './safety.js';

// Not: Bu URL'ler curl ile canlı test edilip (HTTP 200 + geçerli RSS/Atom içerik)
// doğrulanmıştır. RSS akışları yayıncının kendi syndication amaçlı sunduğu
// resmi bir formattır; DuckDuckGo HTML scraping'in aksine ToS ihlali riski taşımaz.
export const NEWS_RSS_FEEDS = [
  { url: 'https://www.hurriyet.com.tr/rss/anasayfa', name: 'Hürriyet', domain: 'hurriyet.com.tr', category: 'Haber' },
  { url: 'https://www.trthaber.com/sondakika.rss', name: 'TRT Haber', domain: 'trthaber.com', category: 'Haber' },
  { url: 'https://www.cnnturk.com/feed/rss/turkiye/news', name: 'CNN Türk', domain: 'cnnturk.com', category: 'Haber' },
  { url: 'https://www.ntv.com.tr/turkiye.rss', name: 'NTV', domain: 'ntv.com.tr', category: 'Haber' },
  { url: 'https://www.sozcu.com.tr/rss.xml', name: 'Sözcü', domain: 'sozcu.com.tr', category: 'Haber' },
  { url: 'https://www.cumhuriyet.com.tr/rss/son_dakika.xml', name: 'Cumhuriyet', domain: 'cumhuriyet.com.tr', category: 'Haber' },
  // Haber dışı kategoriler (hepsi curl ile canlı doğrulandı)
  { url: 'https://www.webtekno.com/rss.xml', name: 'Webtekno', domain: 'webtekno.com', category: 'Teknoloji' },
  { url: 'https://shiftdelete.net/feed', name: 'ShiftDelete', domain: 'shiftdelete.net', category: 'Teknoloji' },
  { url: 'https://www.hurriyet.com.tr/rss/teknoloji', name: 'Hürriyet Teknoloji', domain: 'hurriyet.com.tr', category: 'Teknoloji' },
  { url: 'https://www.hurriyet.com.tr/rss/spor', name: 'Hürriyet Spor', domain: 'hurriyet.com.tr', category: 'Spor' },
  { url: 'https://www.hurriyet.com.tr/rss/egitim', name: 'Hürriyet Eğitim', domain: 'hurriyet.com.tr', category: 'Eğitim' },
  { url: 'https://www.sozcu.com.tr/rss/saglik.xml', name: 'Sözcü Sağlık', domain: 'sozcu.com.tr', category: 'Sağlık' }
  // Not: Milliyet RSS'i kasıtlı olarak çıkarıldı — <item> içinde <link> etiketi yok,
  // sadece isPermaLink="false" bir <guid> var; basit ayrıştırıcımızla kullanılabilir bir URL üretmiyor.
];

function decodeEntities(str) {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

function extractAtomLink(block) {
  const alt = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i);
  if (alt) return alt[1];
  const any = block.match(/<link[^>]*href=["']([^"']+)["']/i);
  return any ? any[1] : '';
}

// RSS 2.0 (<item>) ve Atom (<entry>) formatlarının ikisini de destekler (ör. NTV Atom kullanıyor)
export function parseFeed(xml) {
  const isAtom = /<entry[\s>]/i.test(xml);
  const blockRegex = isAtom ? /<entry[\s\S]*?<\/entry>/gi : /<item[\s\S]*?<\/item>/gi;
  const blocks = xml.match(blockRegex) || [];

  return blocks
    .map(block => {
      const title = extractTag(block, 'title');
      const link = isAtom ? extractAtomLink(block) : extractTag(block, 'link');
      const description = isAtom
        ? (extractTag(block, 'summary') || extractTag(block, 'content'))
        : (extractTag(block, 'description') || extractTag(block, 'content:encoded'));
      return { title, link, description };
    })
    .filter(item => item.title && item.link);
}

export async function ingestRssFeed(feed, maxItems = 15) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'NovaTurkBot/2.0 (+https://novaturk-engine.vercel.app; RSS Haber Toplama)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return { success: false, feed: feed.name, error: `HTTP ${res.status}`, inserted: 0 };

    const xml = await res.text();
    const items = parseFeed(xml).slice(0, maxItems);

    const insertSite = db.prepare(`
      INSERT OR IGNORE INTO sites (domain, name, category, url, description, authority_score, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    insertSite.run(feed.domain, feed.name, feed.category, `https://${feed.domain}`, `${feed.name} RSS haber kaynağı`, 90);

    const siteRow = db.prepare('SELECT id FROM sites WHERE domain = ?').get(feed.domain);
    const siteId = siteRow ? siteRow.id : null;

    const insertPage = db.prepare(`
      INSERT OR REPLACE INTO pages (site_id, title, url, snippet, content, indexed_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    let inserted = 0;
    for (const item of items) {
      if (!item.link || !item.title) continue;
      // Zararlı adres veya yüksek spam puanlı içerik indekse girmez
      if (checkThreat(item.link) || assessSpam({ url: item.link, title: item.title, snippet: item.description, authorityScore: 90 }).score >= SPAM_DROP_THRESHOLD) continue;
      const snippet = item.description ? item.description.slice(0, 220) : item.title;
      insertPage.run(siteId, item.title, item.link, snippet, item.description || item.title);
      inserted++;
    }

    return { success: true, feed: feed.name, inserted };
  } catch (err) {
    clearTimeout(timeoutId);
    return { success: false, feed: feed.name, error: err.message, inserted: 0 };
  }
}

// İlk çalıştırmada sabit listeyi rss_sources tablosuna aktarır (sadece tablo boşsa).
// Bundan sonra kaynak listesi admin panelinden yönetilebilir (DB'den okunur).
function seedRssSourcesIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as count FROM rss_sources').get().count;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT OR IGNORE INTO rss_sources (url, name, domain, category, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);
  for (const feed of NEWS_RSS_FEEDS) {
    insert.run(feed.url, feed.name, feed.domain, feed.category);
  }
}

export function getActiveRssSources() {
  seedRssSourcesIfEmpty();
  const blockedDomains = new Set(db.prepare('SELECT domain FROM blocked_domains').all().map(r => r.domain));
  return db.prepare('SELECT * FROM rss_sources WHERE is_active = 1').all()
    .filter(s => !blockedDomains.has(s.domain));
}

export async function ingestAllNewsFeeds() {
  const sources = getActiveRssSources();
  const results = [];
  for (const feed of sources) {
    results.push(await ingestRssFeed(feed));
    await new Promise(resolve => setTimeout(resolve, 300)); // kaynak sunucularını yormamak için kısa nefes
  }
  return results;
}
