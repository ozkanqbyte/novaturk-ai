import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { sound } from '../services/soundService';
import { loginAccount, registerAccount, googleLoginUrl } from '../services/accountService';

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}
const STRENGTH = [
  ['Çok zayıf', 'bg-rose-500'], ['Zayıf', 'bg-orange-500'], ['Orta', 'bg-amber-400'], ['İyi', 'bg-lime-400'], ['Güçlü', 'bg-emerald-400']
];

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1a6.2 6.2 0 010-12.4c2 0 3.3.9 4.1 1.6l2.8-2.7A10 10 0 0012 2a10 10 0 100 20c5.8 0 9.6-4 9.6-9.8 0-.7-.1-1.2-.2-2H12z" />
    </svg>
  );
}

export default function AuthModal({ isOpen, initialMode = 'login', googleEnabled, onClose, onSuccess, isDark = true }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const firstField = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setError('');
    setPassword('');
    const t = setTimeout(() => firstField.current?.focus(), 80);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey); };
  }, [isOpen, initialMode, onClose]);

  if (!isOpen) return null;

  const isRegister = mode === 'register';
  const strength = passwordStrength(password);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      const user = isRegister
        ? await registerAccount({ name, email, password })
        : await loginAccount({ email, password });
      sound.playChime();
      onSuccess(user);
    } catch (err) {
      setError(err.message || 'Bir sorun oluştu, tekrar deneyin.');
    } finally {
      setBusy(false);
    }
  };

  const field = `w-full pl-10 pr-3 py-3 rounded-2xl text-sm outline-none border transition-colors focus:border-sky-400/70 ${
    isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-black/5 border-black/10 text-slate-900 placeholder:text-slate-400'
  }`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isRegister ? 'Kayıt ol' : 'Giriş yap'}
        className={`relative w-full max-w-[420px] rounded-3xl border p-6 sm:p-7 shadow-2xl backdrop-blur-2xl ${
          isDark ? 'bg-[#0d1019]/90 border-white/15 text-white' : 'bg-white/95 border-black/10 text-slate-900'
        }`}
      >
        <button onClick={onClose} aria-label="Kapat" className="absolute top-4 right-4 p-1.5 rounded-full opacity-60 hover:opacity-100 hover:bg-white/10 transition">
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold font-['Outfit',sans-serif] tracking-tight">
            {isRegister ? 'NovaTürk hesabı oluştur' : 'NovaTürk’e giriş yap'}
          </h2>
          <p className="text-xs opacity-60 mt-1">Tema ve gizlilik ayarların hesabında saklanır, her cihazda seninle olur.</p>
        </div>

        {/* Sekmeler */}
        <div className={`grid grid-cols-2 p-1 rounded-2xl mb-4 text-sm font-semibold ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          {[['login', 'Giriş yap'], ['register', 'Kayıt ol']].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => { sound.playClick(); setMode(id); setError(''); }}
              className={`py-2 rounded-xl transition-all ${mode === id ? (isDark ? 'bg-white/15 shadow' : 'bg-white shadow') : 'opacity-60 hover:opacity-100'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Google */}
        {googleEnabled ? (
          <a
            href={googleLoginUrl()}
            className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl text-sm font-semibold border transition hover:scale-[1.01] ${
              isDark ? 'bg-white text-slate-900 border-white' : 'bg-white text-slate-900 border-black/15 shadow-sm'
            }`}
          >
            <GoogleMark /> Google ile devam et
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="Google girişi için sunucuda GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET tanımlanmalı"
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl text-sm font-semibold border border-white/10 opacity-40 cursor-not-allowed"
          >
            <GoogleMark /> Google ile devam et (yakında)
          </button>
        )}

        <div className="flex items-center gap-3 my-4 text-[11px] opacity-50">
          <span className="flex-1 h-px bg-current opacity-20" /> ya da e-posta ile <span className="flex-1 h-px bg-current opacity-20" />
        </div>

        <form onSubmit={submit} className="space-y-3" noValidate>
          {isRegister && (
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input ref={firstField} value={name} onChange={(e) => setName(e.target.value)} placeholder="Adın (isteğe bağlı)" autoComplete="name" maxLength={60} className={field} />
            </div>
          )}
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              ref={isRegister ? undefined : firstField}
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresin" autoComplete="email" required className={field}
            />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegister ? 'Şifre (en az 8 karakter)' : 'Şifren'}
              autoComplete={isRegister ? 'new-password' : 'current-password'} required maxLength={128}
              className={`${field} pr-10`}
            />
            <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {isRegister && password && (
            <div>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                  <span key={i} className={`h-1 flex-1 rounded-full ${i < strength ? STRENGTH[strength][1] : 'bg-white/10'}`} />
                ))}
              </div>
              <p className="text-[11px] opacity-60 mt-1">Şifre gücü: {STRENGTH[strength][0]}</p>
            </div>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-px" /> <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !email || !password}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-500 shadow-lg shadow-sky-500/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {isRegister ? 'Hesap oluştur' : 'Giriş yap'}
          </button>
        </form>

        <p className="text-[11px] opacity-50 text-center mt-4 leading-relaxed">
          Devam ederek <a href="/gizlilik" target="_blank" rel="noopener noreferrer" className="underline">Gizlilik Politikası</a>’nı kabul etmiş olursun.
          Şifren asla düz metin saklanmaz.
        </p>
      </div>
    </div>
  );
}
