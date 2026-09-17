// NovaTürk AI - Ultra Gelişmiş Tarayıcı & Arama Geçmişi Motoru (Google & Arc Tarzı)

const HISTORY_KEY = 'novaturk_browser_history_v2';
const MAX_HISTORY_ITEMS = 1000;

// Varsayılan ilk geçmiş (kullanıcıya zengin başlangıç)
const DEFAULT_HISTORY = [
  { 
    id: 'h_1', 
    type: 'search', 
    text: 'Yapay Zeka 2026 Gelişmeleri ve Geleceği', 
    timestamp: Date.now() - 1000 * 60 * 12,
    domain: 'novaturk.ai'
  },
  { 
    id: 'h_2', 
    type: 'visit', 
    title: 'ShiftDelete.Net - Teknoloji Haberleri', 
    url: 'https://shiftdelete.net', 
    hostname: 'shiftdelete.net',
    timestamp: Date.now() - 1000 * 60 * 25 
  },
  { 
    id: 'h_3', 
    type: 'search', 
    text: 'Borsa İstanbul BIST 100 hisse analizleri', 
    timestamp: Date.now() - 1000 * 60 * 55,
    domain: 'novaturk.ai'
  },
  { 
    id: 'h_4', 
    type: 'visit', 
    title: 'Webrazzi - Girişim & Dijital Teknoloji', 
    url: 'https://webrazzi.com', 
    hostname: 'webrazzi.com',
    timestamp: Date.now() - 1000 * 60 * 85 
  },
  { 
    id: 'h_5', 
    type: 'search', 
    text: 'CyberVPN ve DoH Gizlilik Kalkanı Nedir?', 
    timestamp: Date.now() - 1000 * 60 * 140,
    domain: 'novaturk.ai'
  },
  { 
    id: 'h_6', 
    type: 'visit', 
    title: 'DonanımHaber - Sıcak Fırsatlar ve Teknoloji', 
    url: 'https://donanimhaber.com', 
    hostname: 'donanimhaber.com',
    timestamp: Date.now() - 1000 * 60 * 210 
  },
  { 
    id: 'h_7', 
    type: 'visit', 
    title: 'GitHub - Dünyanın Açık Kaynak Merkezi', 
    url: 'https://github.com', 
    hostname: 'github.com',
    timestamp: Date.now() - 1000 * 60 * 60 * 28
  },
  { 
    id: 'h_8', 
    type: 'search', 
    text: 'React 19 ve Vite 5 Performans Optimizasyonu', 
    timestamp: Date.now() - 1000 * 60 * 60 * 30
  }
];

export function getHistory() {
  if (typeof window === 'undefined') return DEFAULT_HISTORY;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(DEFAULT_HISTORY));
      return DEFAULT_HISTORY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HISTORY;
  } catch {
    return DEFAULT_HISTORY;
  }
}

export function saveHistory(items) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS)));
  } catch {}
}

export function addSearchHistory(query) {
  if (!query || !query.trim()) return getHistory();
  const cleanQ = query.trim();
  const list = getHistory().filter(item => !(item.type === 'search' && item.text.toLowerCase() === cleanQ.toLowerCase()));
  
  const newItem = {
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: 'search',
    text: cleanQ,
    domain: 'novaturk.ai',
    timestamp: Date.now()
  };

  const updated = [newItem, ...list].slice(0, MAX_HISTORY_ITEMS);
  saveHistory(updated);
  return updated;
}

export function addVisitHistory(url, title) {
  if (!url || !url.trim()) return getHistory();
  const cleanUrl = url.trim();
  let host = cleanUrl;
  try { host = new URL(cleanUrl).hostname; } catch {}
  const cleanTitle = title || host;

  // Aynı URL varsa eskiyi sil ve başa al
  const list = getHistory().filter(item => !(item.type === 'visit' && item.url === cleanUrl));

  const newItem = {
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: 'visit',
    title: cleanTitle,
    url: cleanUrl,
    hostname: host,
    timestamp: Date.now()
  };

  const updated = [newItem, ...list].slice(0, MAX_HISTORY_ITEMS);
  saveHistory(updated);
  return updated;
}

export function removeHistoryItem(id) {
  const list = getHistory().filter(item => item.id !== id);
  saveHistory(list);
  return list;
}

export function removeHistoryItemsBatch(ids = []) {
  if (!ids.length) return getHistory();
  const idSet = new Set(ids);
  const list = getHistory().filter(item => !idSet.has(item.id));
  saveHistory(list);
  return list;
}

export function clearHistoryByTimeRange(range = 'all') {
  const now = Date.now();
  let threshold = 0;

  if (range === '1h') threshold = now - 1000 * 60 * 60;
  else if (range === '24h') threshold = now - 1000 * 60 * 60 * 24;
  else if (range === '7d') threshold = now - 1000 * 60 * 60 * 24 * 7;
  else if (range === 'all') {
    saveHistory([]);
    return [];
  }

  const list = getHistory().filter(item => (item.timestamp || 0) < threshold);
  saveHistory(list);
  return list;
}

export function clearAllHistory() {
  saveHistory([]);
  return [];
}

// İstatistikler: Toplam arama, site ziyareti, en çok girilen siteler
export function getHistoryStats() {
  const items = getHistory();
  let searchCount = 0;
  let visitCount = 0;
  const domainMap = {};

  items.forEach(item => {
    if (item.type === 'search') searchCount++;
    if (item.type === 'visit') {
      visitCount++;
      const host = item.hostname || 'Bilinmeyen';
      domainMap[host] = (domainMap[host] || 0) + 1;
    }
  });

  const topDomains = Object.entries(domainMap)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total: items.length,
    searchCount,
    visitCount,
    topDomains
  };
}

// Zaman Gösterimi Formatlayıcı (Göreceli Tarih)
export function formatHistoryTime(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days === 1) return 'Dün';
  if (days < 7) return `${days} gün önce`;

  const d = new Date(timestamp);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

// Tarihe Göre Gruplama
export function groupHistoryByDate(items) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: []
  };

  items.forEach(item => {
    const t = item.timestamp || 0;
    if (t >= todayStart) {
      groups.today.push(item);
    } else if (t >= yesterdayStart) {
      groups.yesterday.push(item);
    } else if (t >= weekStart) {
      groups.thisWeek.push(item);
    } else {
      groups.older.push(item);
    }
  });

  return groups;
}

// JSON Dışa Aktar (Yedekle)
export function exportHistoryJson() {
  const data = getHistory();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `novaturk_gecmis_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function applyHistoryPreferences(prefs) {
  return prefs;
}
