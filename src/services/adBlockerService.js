// NovaTürk AI - Viral Gelişmiş Reklam & Takipçi Engelleyici Kalkan Servisi

const STATS_KEY = 'novaturk_adblock_stats';

const DEFAULT_STATS = {
  totalBlocked: 0,
  bandwidthSavedMB: 0,
  timeSavedSeconds: 0,
  isShieldEnabled: true,
  blockPopups: true,
  blockTrackers: true,
  blockCryptoMiners: true,
  sponsorBlock: true,
  soundEffects: true,
  sponsorSkippedCount: 8,
  whitelist: []
};

// Dünya çapında ve Türkiye'de en yaygın reklam ve takipçi sunucuları
export const BLOCKED_AD_DOMAINS = [
  'doubleclick.net',
  'googleadservices.com',
  'googlesyndication.com',
  'pagead2.googlesyndication.com',
  'adservice.google.com',
  'criteo.com',
  'criteo.net',
  'taboola.com',
  'outbrain.com',
  'scorecardresearch.com',
  'adnxs.com',
  'adform.net',
  'connect.facebook.net',
  'facebook.com/tr',
  'analytics.twitter.com',
  'mc.yandex.ru',
  'hotjar.com',
  'clicktale.net',
  'popads.net',
  'popcash.net',
  'adcash.com',
  'smartadserver.com',
  'revcontent.com',
  'mgid.com',
  'adroll.com',
  'rubiconproject.com',
  'pubmatic.com',
  'openx.net',
  'casalemedia.com',
  'zemanta.com',
  'coin-hive.com',
  'coinhive.com',
  'cryptoloot.pro',
  'minr.pw'
];

export function getAdBlockStats() {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      localStorage.setItem(STATS_KEY, JSON.stringify(DEFAULT_STATS));
      return DEFAULT_STATS;
    }
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveAdBlockStats(stats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function recordBlockedAd(count = 1) {
  const current = getAdBlockStats();
  const updated = {
    ...current,
    totalBlocked: current.totalBlocked + count,
    bandwidthSavedMB: parseFloat((current.bandwidthSavedMB + (count * 0.18)).toFixed(2)),
    timeSavedSeconds: parseFloat((current.timeSavedSeconds + (count * 0.15)).toFixed(1))
  };
  saveAdBlockStats(updated);
  return updated;
}

export function toggleSiteShield(hostname) {
  const current = getAdBlockStats();
  const cleanHost = hostname.toLowerCase();
  const exists = current.whitelist.includes(cleanHost);
  const newWhitelist = exists 
    ? current.whitelist.filter(h => h !== cleanHost)
    : [...current.whitelist, cleanHost];

  const updated = { ...current, whitelist: newWhitelist };
  saveAdBlockStats(updated);
  return updated;
}

export function isSiteShieldActive(hostname) {
  const current = getAdBlockStats();
  if (!current.isShieldEnabled) return false;
  if (!hostname) return true;
  return !current.whitelist.includes(hostname.toLowerCase());
}

export function recordSponsorSkip(seconds = 30) {
  const current = getAdBlockStats();
  const updated = {
    ...current,
    sponsorSkippedCount: (current.sponsorSkippedCount || 0) + 1,
    timeSavedSeconds: parseFloat(((current.timeSavedSeconds || 0) + seconds).toFixed(1))
  };
  saveAdBlockStats(updated);
  return updated;
}

export function isSponsorBlockActive() {
  const current = getAdBlockStats();
  return current.isShieldEnabled && current.sponsorBlock !== false;
}

export function isSoundEffectsActive() {
  const current = getAdBlockStats();
  return current.soundEffects !== false;
}

