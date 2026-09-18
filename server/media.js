// Haber, görsel, indirme ve gündem uçları. Hepsi index.js'teki ortak SSRF korumasını
// (assertSafeCrawlUrl) ve genel rate limiter'ı kullanır.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const NEWS_WHEN = new Set(['1h', '1d', '7d', '30d', '1y']);
const NEWS_TOPICS = {
  gundem: 'NATION', dunya: 'WORLD', ekonomi: 'BUSINESS', teknoloji: 'TECHNOLOGY',
  spor: 'SPORTS', saglik: 'HEALTH', bilim: 'SCIENCE', magazin: 'ENTERTAINMENT'
};

const IMG_TIME = { day: 'Day', week: 'Week', month: 'Month', year: 'Year' };
const IMG_SIZE = new Set(['Small', 'Medium', 'Large', 'Wallpaper']);
const IMG_TYPE = { photo: 'photo', clipart: 'clipart', gif: 'gif', transparent: 'transparent' };
const IMG_LAYOUT = new Set(['Square', 'Tall', 'Wide']);

const SOURCE_DOMAINS = [
  ['hürriyet', 'hurriyet.com.tr'], ['hurriyet', 'hurriyet.com.tr'], ['sözcü', 'sozcu.com.tr'], ['sozcu', 'sozcu.com.tr'],
  ['ntv', 'ntv.com.tr'], ['habertürk', 'haberturk.com'], ['haberturk', 'haberturk.com'], ['milliyet', 'milliyet.com.tr'],
  ['cumhuriyet', 'cumhuriyet.com.tr'], ['sabah', 'sabah.com.tr'], ['trt', 'trthaber.com'], ['anadolu ajans', 'aa.com.tr'],
  ['webrazzi', 'webrazzi.com'], ['shiftdelete', 'shiftdelete.net'], ['donanım', 'donanimhaber.com'], ['donanimhaber', 'donanimhaber.com'],
  ['webtekno', 'webtekno.com'], ['ensonhaber', 'ensonhaber.com'], ['mynet', 'mynet.com'], ['t24', 't24.com.tr'],
  ['diken', 'diken.com.tr'], ['gazete duvar', 'gazeteduvar.com.tr'], ['bloomberg', 'bloomberght.com'], ['ekonomim', 'ekonomim.com'],
  ['bigpara', 'bigpara.hurriyet.com.tr'], ['cnn türk', 'cnnturk.com'], ['cnnturk', 'cnnturk.com'], ['a haber', 'ahaber.com.tr']
];

// Küçük bellek içi önbellek (TTL'li, sınırlı boyutlu)
function makeCache(ttlMs, max = 300) {
  const m = new Map();
  return {
    get(k) {
      const e = m.get(k);
      if (!e) return null;
      if (Date.now() - e.t > ttlMs) { m.delete(k); return null; }
      return e.v;
    },
    set(k, v) {
      if (m.size >= max) m.delete(m.keys().next().value);
      m.set(k, { t: Date.now(), v });
    }
  };
}

const newsCache = makeCache(2 * 60 * 1000);
const imageCache = makeCache(10 * 60 * 1000);
const vqdCache = makeCache(10 * 60 * 1000, 500);

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

function timeAgoTr(pubDate) {
  if (!pubDate) return 'Az önce';
  const mins = Math.floor((Date.now() - new Date(pubDate).getTime()) / 60000);
  if (!Number.isFinite(mins)) return 'Az önce';
  if (mins < 60) return `${Math.max(1, mins)} dakika önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

// Google News RSS <description>: aynı olayı veren diğer kaynakların listesi (<li><a>başlık</a> <font>kaynak</font>)
function parseRelated(descRaw) {
  const html = decode(descRaw);
  const out = [];
  const re = /<li>\s*<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>(?:&nbsp;|\s)*(?:<font[^>]*>([\s\S]*?)<\/font>)?/gi;
  let m;
  while ((m = re.exec(html)) !== null && out.length < 6) {
    out.push({ url: m[1], title: decode(m[2].replace(/<[^>]+>/g, '')).trim(), source: decode((m[3] || '').replace(/<[^>]+>/g, '')).trim() });
  }
  return out;
}

function parseNewsItem(it, idx, now) {
  const title = it.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
  const link = it.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
  const pubDate = it.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
  const desc = it.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
  const sm = it.match(/<source[^>]*url="([^"]+)"[^>]*>([\s\S]*?)<\/source>/);
  const source = sm ? decode(sm[2]).trim() : '';
  let domain = '';
  try { if (sm?.[1]) domain = new URL(sm[1]).hostname.replace(/^www\./, ''); } catch { /* alan adı çıkarılamadı */ }
  const sLower = source.toLowerCase();
  const known = SOURCE_DOMAINS.find(([k]) => sLower.includes(k));
  if (known) domain = known[1];

  const cleanTitle = decode(title).replace(/\s*-\s*[^-]+$/, '').trim() || decode(title);
  const related = parseRelated(desc).filter(r => r.title && r.title.toLowerCase() !== cleanTitle.toLowerCase());
  const ts = pubDate ? new Date(pubDate).getTime() : 0;
  return {
    id: `news_${idx}_${now}`,
    title: cleanTitle,
    url: link,
    link,
    pubDate,
    ts: Number.isFinite(ts) ? ts : 0,
    timeAgo: timeAgoTr(pubDate),
    time: timeAgoTr(pubDate),
    source: source || 'Türkiye Basını',
    domain,
    sourceDomain: domain,
    // Eskiden burada uydurma bir "son dakika gelişmesi" cümlesi üretiliyordu; artık yalnızca gerçek veri var.
    snippet: '',
    related
  };
}

async function fetchNews({ q, when, topic }) {
  const base = 'hl=tr&gl=TR&ceid=TR:tr';
  let url;
  if (q) {
    const term = when ? `${q} when:${when}` : q;
    url = `https://news.google.com/rss/search?q=${encodeURIComponent(term)}&${base}`;
  } else if (topic && topic !== 'gundem') {
    url = `https://news.google.com/rss/headlines/section/topic/${NEWS_TOPICS[topic]}?${base}`;
  } else {
    url = `https://news.google.com/rss?${base}`;
  }
  const cached = newsCache.get(url);
  if (cached) return cached;

  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Haber kaynağı HTTP ${res.status}`);
  const xml = await res.text();
  const now = Date.now();
  const items = xml.split('<item>').slice(1, 61).map((it, i) => parseNewsItem(it, i, now));
  newsCache.set(url, items);
  return items;
}

async function getVqd(query) {
  const cached = vqdCache.get(query);
  if (cached) return cached;
  const r = await fetch('https://duckduckgo.com/?q=' + encodeURIComponent(query), {
    headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(6000)
  });
  const html = await r.text();
  const m = html.match(/vqd=(["']?)([\d-]+)\1/) || html.match(/vqd=([\d-]+)/);
  const vqd = m ? (m[2] || m[1]) : null;
  if (vqd) vqdCache.set(query, vqd);
  return vqd;
}

async function fetchImages({ q, time, size, type, layout, page }) {
  const key = JSON.stringify([q, time, size, type, layout, page]);
  const cached = imageCache.get(key);
  if (cached) return cached;

  const vqd = await getVqd(q);
  if (!vqd) throw new Error('Görsel servisi yanıt vermedi');
  const f = [
    time ? `time:${time}` : '', size ? `size:${size}` : '', '',
    type ? `type:${type}` : '', layout ? `layout:${layout}` : '', ''
  ].join(',');
  // p=1: güvenli arama açık (herkese açık bir arama motoru için varsayılan)
  const url = `https://duckduckgo.com/i.js?l=tr-tr&o=json&q=${encodeURIComponent(q)}&vqd=${vqd}&f=${encodeURIComponent(f)}&p=1&s=${page * 100}`;
  const r = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://duckduckgo.com/' }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`Görsel servisi HTTP ${r.status}`);
  const data = await r.json();
  const stamp = Date.now();
  const results = (data.results || []).slice(0, 100).map((x, i) => {
    let host = 'web';
    try { host = new URL(x.url).hostname.replace(/^www\./, ''); } catch { /* host çıkarılamadı */ }
    return {
      id: `img_${page}_${i}_${stamp}`,
      title: x.title || q,
      thumb: x.thumbnail || x.image,
      fullImage: x.image,
      width: x.width,
      height: x.height,
      source: host,
      sourceUrl: x.url
    };
  });
  imageCache.set(key, results);
  return results;
}

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };
const MAX_DOWNLOAD_BYTES = 20 * 1024 * 1024;

export function registerMediaRoutes(app, { db, assertSafeCrawlUrl }) {
  app.get('/api/news', async (req, res) => {
    const q = String(req.query.q || '').trim().slice(0, 200);
    const when = NEWS_WHEN.has(String(req.query.when)) ? String(req.query.when) : '';
    const topic = NEWS_TOPICS[String(req.query.topic)] ? String(req.query.topic) : '';
    try {
      const news = await fetchNews({ q, when, topic });
      res.json({ success: true, count: news.length, query: q, when, topic, news });
    } catch (err) {
      res.json({ success: false, count: 0, error: err.message, news: [] });
    }
  });

  app.get('/api/live-images', async (req, res) => {
    const q = String(req.query.q || '').trim().slice(0, 200);
    if (!q) return res.json({ success: true, count: 0, results: [] });
    const page = Math.min(Math.max(parseInt(req.query.page, 10) || 0, 0), 5);
    try {
      const results = await fetchImages({
        q, page,
        time: IMG_TIME[String(req.query.time)] || '',
        size: IMG_SIZE.has(String(req.query.size)) ? String(req.query.size) : '',
        type: IMG_TYPE[String(req.query.type)] || '',
        layout: IMG_LAYOUT.has(String(req.query.layout)) ? String(req.query.layout) : ''
      });
      res.json({ success: true, count: results.length, page, results });
    } catch (err) {
      res.json({ success: false, count: 0, error: err.message, results: [] });
    }
  });

  // Görsel indirme: tarayıcı başka sitenin görselini CORS yüzünden doğrudan indiremez.
  // Yalnızca görsel içeriği, en çok 20 MB, her yönlendirme SSRF kontrolünden geçer.
  app.get('/api/download-image', async (req, res) => {
    try {
      let target = String(req.query.url || '');
      let response;
      for (let hop = 0; hop < 4; hop++) {
        await assertSafeCrawlUrl(target);
        response = await fetch(target, {
          redirect: 'manual', headers: { 'User-Agent': UA, Accept: 'image/*' }, signal: AbortSignal.timeout(10000)
        });
        if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
          target = new URL(response.headers.get('location'), target).href;
          continue;
        }
        break;
      }
      if (!response || !response.ok) return res.status(502).json({ error: 'Görsel alınamadı' });
      const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (!EXT[type]) return res.status(415).json({ error: 'Bu bir görsel dosyası değil' });
      const declared = Number(response.headers.get('content-length') || 0);
      if (declared > MAX_DOWNLOAD_BYTES) return res.status(413).json({ error: 'Görsel çok büyük' });
      const buf = Buffer.from(await response.arrayBuffer());
      if (buf.length > MAX_DOWNLOAD_BYTES) return res.status(413).json({ error: 'Görsel çok büyük' });

      const base = String(req.query.name || 'novaturk-gorsel').normalize('NFKD').replace(/[^\w\- ]+/g, '').trim().slice(0, 60).replace(/\s+/g, '-') || 'novaturk-gorsel';
      res.set({
        'Content-Type': type,
        'Content-Disposition': `attachment; filename="${base}.${EXT[type]}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, max-age=300'
      });
      res.send(buf);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Gündem: son 24 saatte en az 2 kez aranan sorgular. Yalnızca toplu sayım — kişi/IP bilgisi yok.
  app.get('/api/trending', (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT lower(query) AS q, COUNT(*) AS c FROM search_logs
        WHERE searched_at >= datetime('now', '-1 day') AND length(query) BETWEEN 3 AND 60
        GROUP BY lower(query) HAVING c >= 2 ORDER BY c DESC LIMIT 30
      `).all();
      const trending = rows
        .filter(r => !/[@\d]{5,}|https?:|www\./i.test(r.q))
        .slice(0, 10)
        .map(r => ({ query: r.q, count: r.c }));
      res.json({ success: true, trending });
    } catch {
      res.json({ success: true, trending: [] });
    }
  });
}
