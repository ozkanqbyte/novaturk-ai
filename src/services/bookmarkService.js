/**
 * NovaTürk AI - Yer İmleri ve Hızlı Kısayollar Servisi
 */

export const DEFAULT_BOOKMARKS = [
  {
    id: 'bm_1',
    title: 'ShiftDelete.Net',
    url: 'https://shiftdelete.net',
    domain: 'shiftdelete.net',
    category: 'Teknoloji',
    isPreset: true
  },
  {
    id: 'bm_2',
    title: 'Webrazzi',
    url: 'https://webrazzi.com',
    domain: 'webrazzi.com',
    category: 'Girişim',
    isPreset: true
  },
  {
    id: 'bm_3',
    title: 'DonanımHaber',
    url: 'https://www.donanimhaber.com',
    domain: 'donanimhaber.com',
    category: 'Teknoloji',
    isPreset: true
  },
  {
    id: 'bm_4',
    title: 'ChatGPT',
    url: 'https://chatgpt.com',
    domain: 'chatgpt.com',
    category: 'Yapay Zekâ',
    isPreset: true
  },
  {
    id: 'bm_5',
    title: 'GitHub',
    url: 'https://github.com',
    domain: 'github.com',
    category: 'Yazılım',
    isPreset: true
  },
  {
    id: 'bm_6',
    title: 'E-Devlet Kapısı',
    url: 'https://www.turkiye.gov.tr',
    domain: 'turkiye.gov.tr',
    category: 'Resmî',
    isPreset: true
  },
  {
    id: 'bm_7',
    title: 'TÜBİTAK',
    url: 'https://www.tubitak.gov.tr',
    domain: 'tubitak.gov.tr',
    category: 'Bilim',
    isPreset: true
  },
  {
    id: 'bm_8',
    title: 'Vikipedi (TR)',
    url: 'https://tr.wikipedia.org',
    domain: 'tr.wikipedia.org',
    category: 'Ansiklopedi',
    isPreset: true
  },
  {
    id: 'bm_9',
    title: 'Borsa İstanbul',
    url: 'https://www.borsaistanbul.com',
    domain: 'borsaistanbul.com',
    category: 'Finans',
    isPreset: true
  },
  {
    id: 'bm_10',
    title: 'YouTube',
    url: 'https://www.youtube.com',
    domain: 'youtube.com',
    category: 'Medya',
    isPreset: true
  }
];

export const getBookmarks = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return DEFAULT_BOOKMARKS;
  }
  try {
    const raw = localStorage.getItem('novaturk_bookmarks');
    if (!raw) {
      localStorage.setItem('novaturk_bookmarks', JSON.stringify(DEFAULT_BOOKMARKS));
      return DEFAULT_BOOKMARKS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BOOKMARKS;
  }
};

export const saveBookmarks = (bookmarks) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem('novaturk_bookmarks', JSON.stringify(bookmarks));
  } catch (err) {
    console.error('Yer imleri kaydedilemedi:', err);
  }
};

export const addBookmark = ({ title, url, category = 'Genel' }) => {
  let domain = 'web';
  try {
    domain = new URL(url).hostname;
  } catch {}

  const current = getBookmarks();
  const exists = current.find(b => b.url.toLowerCase() === url.toLowerCase());
  if (exists) return current;

  const newBookmark = {
    id: `bm_${Date.now()}`,
    title: title || domain,
    url,
    domain,
    category,
    createdAt: new Date().toISOString()
  };

  const updated = [newBookmark, ...current];
  saveBookmarks(updated);
  return updated;
};

export const removeBookmark = (idOrUrl) => {
  const current = getBookmarks();
  const updated = current.filter(b => b.id !== idOrUrl && b.url !== idOrUrl);
  saveBookmarks(updated);
  return updated;
};

export const isBookmarked = (url) => {
  if (!url) return false;
  const current = getBookmarks();
  const cleanUrl = url.trim().toLowerCase().replace(/\/$/, '');
  return current.some(b => b.url.trim().toLowerCase().replace(/\/$/, '') === cleanUrl);
};
