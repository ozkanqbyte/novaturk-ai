import { db } from './db.js';

export async function crawlSite(siteUrl, siteId) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(siteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'NovaTurkBot/1.0 (+https://novaturk.ai; Turkiye Milli Yapay Zeka Arama Motoru)'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    // HTML Temizleme ve Başlık Çıkarma
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : siteUrl;

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Reklam, stil ve JS kodlarını temizle
    const cleanContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);

    const snippet = description || cleanContent.slice(0, 180) + '...';

    // Veritabanına kaydet
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO pages (site_id, title, url, snippet, content, indexed_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(siteId || 1, title, siteUrl, snippet, cleanContent);

    return {
      success: true,
      title,
      url: siteUrl,
      charsIndexed: cleanContent.length
    };
  } catch (err) {
    return {
      success: false,
      url: siteUrl,
      error: err.message
    };
  }
}
