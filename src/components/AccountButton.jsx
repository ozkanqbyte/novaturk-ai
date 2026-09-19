import React, { useState, useEffect, useRef } from 'react';
import { LogIn, LogOut, Cloud } from 'lucide-react';
import { sound } from '../services/soundService';

const initials = (u) => (u.name || u.email || '?').trim().slice(0, 1).toUpperCase();

export default function AccountButton({ user, onOpenAuth, onLogout, isDark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const away = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('mousedown', away);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('mousedown', away); window.removeEventListener('keydown', esc); };
  }, [open]);

  if (!user) {
    return (
      <button
        onClick={() => { sound.playClick(); onOpenAuth('login'); }}
        title="Giriş yap veya kayıt ol"
        className="flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-500 shadow-md shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Giriş Yap</span>
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { sound.playClick(); setOpen(o => !o); }}
        aria-haspopup="menu"
        aria-expanded={open}
        title={user.email}
        className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-white/20 hover:scale-105 transition-transform"
      >
        {initials(user)}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 top-full mt-2 w-60 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-2xl z-[90] ${
            isDark ? 'bg-[#121520]/95 border-white/15 text-slate-100' : 'bg-white/95 border-black/10 text-slate-900'
          }`}
        >
          <div className="px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-bold flex items-center justify-center shrink-0">{initials(user)}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user.name || 'NovaTürk kullanıcısı'}</div>
              <div className="text-[11px] opacity-60 truncate">{user.email}</div>
            </div>
          </div>
          <div className="mx-2 mb-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5" /> Tema ve gizlilik ayarların hesabında
          </div>
          <button
            role="menuitem"
            onClick={() => { sound.playClick(); setOpen(false); onLogout(); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
          >
            <LogOut className="w-3.5 h-3.5 opacity-70" /> Çıkış yap
          </button>
        </div>
      )}
    </div>
  );
}

