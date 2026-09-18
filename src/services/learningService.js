import { API_BASE } from './searchService';

const CONSENT_KEY = 'novaturk_learning_consent_v1';
const CONSENT_EVENT = 'novaturk:learning-consent';
const VISIT_DEDUPE_MS = 10 * 60 * 1000;
const recentVisits = new Map();

const UNDECIDED = { decided: false, clicks: false, browse: false };

export function getLearningConsent() {
  try {
    const raw = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
    if (raw && typeof raw === 'object') {
      return { decided: true, clicks: raw.clicks === true, browse: raw.browse === true };
    }
  } catch {}
  return UNDECIDED;
}

export function setLearningConsent({ clicks, browse }) {
  const value = { clicks: !!clicks, browse: !!browse, decidedAt: new Date().toISOString() };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(value)); } catch {}
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
  return getLearningConsent();
}

export function onLearningConsentChange(callback) {
  window.addEventListener(CONSENT_EVENT, callback);
  return () => window.removeEventListener(CONSENT_EVENT, callback);
}

function isHttpUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

function post(path, body) {
  try {
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'omit'
    }).catch(() => {});
  } catch {}
}

// Gizli sekmede ve izin yokken ASLA veri gönderilmez. Kimlik/çerez gönderilmez (credentials: 'omit').
export function reportClick(query, url, { incognito = false } = {}) {
  if (incognito || !isHttpUrl(url) || !getLearningConsent().clicks) return;
  post('/api/learn/click', { query: String(query || '').slice(0, 200), url });
}

export function reportVisit(url, { incognito = false } = {}) {
  if (incognito || !isHttpUrl(url) || !getLearningConsent().browse) return;
  const now = Date.now();
  const last = recentVisits.get(url);
  if (last && now - last < VISIT_DEDUPE_MS) return;
  if (recentVisits.size > 500) recentVisits.clear();
  recentVisits.set(url, now);
  post('/api/learn/visit', { url });
}
