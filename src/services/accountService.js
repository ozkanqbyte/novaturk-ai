import { API_BASE } from './searchService';

// Çerez tabanlı oturum: istekler credentials ile gider. Hesap sistemi, sayfayı sunan sunucuyla
// aynı origin'de çalışır (VPS). Vercel gibi ayrı bir statik adreste çerez çalışmaz.
async function call(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options
  });
  let data = null;
  try { data = await res.json(); } catch { /* boş yanıt */ }
  if (!res.ok || !data?.success) {
    const error = new Error(data?.error || `İstek başarısız (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}

export const fetchAccountConfig = () => call('/api/account/config').catch(() => ({ googleEnabled: false }));
export const fetchMe = () => call('/api/account/me').then(d => d.user).catch(() => null);
export const registerAccount = ({ name, email, password }) =>
  call('/api/account/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }).then(d => d.user);
export const loginAccount = ({ email, password }) =>
  call('/api/account/login', { method: 'POST', body: JSON.stringify({ email, password }) }).then(d => d.user);
export const logoutAccount = () => call('/api/account/logout', { method: 'POST', body: '{}' }).catch(() => null);
export const fetchAccountSettings = () => call('/api/account/settings').then(d => d.settings).catch(() => null);
export const saveAccountSettings = (settings) =>
  call('/api/account/settings', { method: 'PUT', body: JSON.stringify({ settings }) }).then(d => d.settings).catch(() => null);
export const googleLoginUrl = () => `${API_BASE}/api/account/google/start`;
