// Kullanıcı hesapları: e-posta+şifre kaydı/girişi, oturum çerezi, hesaba bağlı ayarlar, Google ile giriş.
// Şifreler scrypt ile tuzlanıp saklanır; oturum jetonu yalnızca SHA-256 özeti olarak veritabanında durur.

import crypto from 'node:crypto';
import { rateLimit } from 'express-rate-limit';

const COOKIE = 'nt_session';
const SESSION_DAYS = 30;
const MAX_SETTINGS_BYTES = 8 * 1024;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

// Hesapla senkronlanabilecek ayar anahtarları (beyaz liste — rastgele veri saklanmaz)
const ALLOWED_SETTINGS = new Set(['themeId', 'isDark', 'privacyChoice', 'soundEnabled']);

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function verifyPassword(password, stored) {
  const [scheme, saltHex, hashHex] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// Kullanıcı yokken de aynı süreyi harcamak için (kullanıcı varlığı zamanlamadan sızmasın)
const DUMMY_HASH = hashPassword('nova-turk-dummy-password');

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

const isHttps = (req) => req.secure || req.get('x-forwarded-proto') === 'https';

function setCookie(res, req, name, value, maxAgeSec) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSec}`];
  if (isHttps(req)) parts.push('Secure');
  const prev = res.getHeader('Set-Cookie');
  const next = prev ? [].concat(prev, parts.join('; ')) : parts.join('; ');
  res.setHeader('Set-Cookie', next);
}

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, hasPassword: !!u.password_hash, google: !!u.google_id });

export function initAuthTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL DEFAULT '',
      password_hash TEXT,
      google_id TEXT UNIQUE,
      settings_json TEXT NOT NULL DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS user_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
  `);
  db.prepare('DELETE FROM user_sessions WHERE expires_at < ?').run(Date.now());
}

export function registerAuthRoutes(app, { db, express }) {
  initAuthTables(db);

  const json = express.json({ limit: '16kb' });
  const authLimiter = rateLimit({
    windowMs: 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
    message: { success: false, error: 'Çok fazla deneme. Bir dakika sonra tekrar deneyin.' }
  });

  function createSession(req, res, userId) {
    const token = crypto.randomBytes(32).toString('base64url');
    const expires = Date.now() + SESSION_DAYS * 86400 * 1000;
    db.prepare('INSERT INTO user_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(sha256(token), userId, expires);
    setCookie(res, req, COOKIE, token, SESSION_DAYS * 86400);
  }

  function currentUser(req) {
    const token = parseCookies(req.headers.cookie)[COOKIE];
    if (!token) return null;
    const row = db.prepare(`
      SELECT u.* FROM user_sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ?
    `).get(sha256(token), Date.now());
    return row || null;
  }

  // Yalnızca JSON gövdeli istekleri kabul et (form tabanlı CSRF denemelerini eler)
  const requireJson = (req, res, next) => (req.is('application/json') ? next() : res.status(415).json({ success: false, error: 'JSON bekleniyor' }));

  const cleanName = (n, email) => String(n || '').replace(/[<>]/g, '').trim().slice(0, 60) || email.split('@')[0];

  app.get('/api/account/config', (req, res) => {
    res.json({ success: true, googleEnabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) });
  });

  app.post('/api/account/register', authLimiter, json, requireJson, (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!EMAIL_RE.test(email)) return res.status(400).json({ success: false, error: 'Geçerli bir e-posta adresi girin.' });
    if (password.length < 8 || password.length > 128) return res.status(400).json({ success: false, error: 'Şifre 8-128 karakter olmalı.' });
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
      return res.status(409).json({ success: false, error: 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.' });
    }
    const info = db.prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)')
      .run(email, cleanName(req.body?.name, email), hashPassword(password));
    createSession(req, res, Number(info.lastInsertRowid));
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(info.lastInsertRowid));
    res.status(201).json({ success: true, user: publicUser(user) });
  });

  app.post('/api/account/login', authLimiter, json, requireJson, (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '').slice(0, 128);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    const ok = verifyPassword(password, user?.password_hash || DUMMY_HASH) && !!user?.password_hash;
    if (!ok) return res.status(401).json({ success: false, error: 'E-posta veya şifre hatalı.' });
    createSession(req, res, user.id);
    res.json({ success: true, user: publicUser(user) });
  });

  app.post('/api/account/logout', json, (req, res) => {
    const token = parseCookies(req.headers.cookie)[COOKIE];
    if (token) db.prepare('DELETE FROM user_sessions WHERE token_hash = ?').run(sha256(token));
    setCookie(res, req, COOKIE, '', 0);
    res.json({ success: true });
  });

  app.get('/api/account/me', (req, res) => {
    res.set('Cache-Control', 'no-store');
    const user = currentUser(req);
    res.json({ success: true, user: user ? publicUser(user) : null });
  });

  app.get('/api/account/settings', (req, res) => {
    res.set('Cache-Control', 'no-store');
    const user = currentUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Giriş gerekli' });
    let settings = {};
    try { settings = JSON.parse(user.settings_json || '{}'); } catch { settings = {}; }
    res.json({ success: true, settings });
  });

  app.put('/api/account/settings', json, requireJson, (req, res) => {
    const user = currentUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Giriş gerekli' });
    const incoming = req.body?.settings;
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return res.status(400).json({ success: false, error: 'Geçersiz ayar' });
    let current = {};
    try { current = JSON.parse(user.settings_json || '{}'); } catch { current = {}; }
    for (const [k, v] of Object.entries(incoming)) {
      if (ALLOWED_SETTINGS.has(k) && (typeof v === 'string' || typeof v === 'boolean') && String(v).length <= 64) current[k] = v;
    }
    const serialized = JSON.stringify(current);
    if (Buffer.byteLength(serialized) > MAX_SETTINGS_BYTES) return res.status(413).json({ success: false, error: 'Ayarlar çok büyük' });
    db.prepare('UPDATE users SET settings_json = ? WHERE id = ?').run(serialized, user.id);
    res.json({ success: true, settings: current });
  });

  // ---- Google ile giriş (yalnızca GOOGLE_CLIENT_ID/SECRET tanımlıysa) ----
  const googleRedirect = (req) => process.env.GOOGLE_ACCOUNT_REDIRECT_URI || `${isHttps(req) ? 'https' : req.protocol}://${req.get('host')}/api/account/google/callback`;

  app.get('/api/account/google/start', authLimiter, (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).send('Google ile giriş henüz yapılandırılmadı.');
    }
    const state = crypto.randomBytes(16).toString('base64url');
    setCookie(res, req, 'nt_oauth_state', state, 600);
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: googleRedirect(req),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account'
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  app.get('/api/account/google/callback', authLimiter, async (req, res) => {
    try {
      const expected = parseCookies(req.headers.cookie).nt_oauth_state;
      if (!req.query.code || !expected || req.query.state !== expected) throw new Error('Doğrulama başarısız (state).');
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: String(req.query.code),
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: googleRedirect(req),
          grant_type: 'authorization_code'
        }),
        signal: AbortSignal.timeout(8000)
      });
      const tokens = await tokenRes.json();
      if (!tokens.access_token) throw new Error('Google jetonu alınamadı.');
      const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }, signal: AbortSignal.timeout(8000)
      });
      const info = await infoRes.json();
      if (!info.sub || !info.email || info.email_verified === false) throw new Error('Google hesabı doğrulanamadı.');

      const email = String(info.email).toLowerCase();
      let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(info.sub) || db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (user) {
        if (!user.google_id) db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(info.sub, user.id);
      } else {
        const r = db.prepare('INSERT INTO users (email, name, google_id) VALUES (?, ?, ?)').run(email, cleanName(info.name, email), info.sub);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(r.lastInsertRowid));
      }
      createSession(req, res, user.id);
      setCookie(res, req, 'nt_oauth_state', '', 0);
      res.redirect('/');
    } catch (err) {
      res.status(400).send(`Giriş tamamlanamadı: ${String(err.message).replace(/[<>]/g, '')}. <a href="/">Ana sayfaya dön</a>`);
    }
  });
}
