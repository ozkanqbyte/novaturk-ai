import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Compass, Share2, Settings, Server, Check, ShieldCheck, Palette 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/soundService';

export default function Navbar({ onOpenSettings, onOpenAdmin, onOpenThemeSelector, onHomeClick, isDark, setIsDark, currentTheme }) {
  const [timeStr, setTimeStr] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleTheme = () => {
    sound.playClick();
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('novaturk_theme', next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const handleShare = () => {
    sound.playChime();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.2 },
      colors: isDark ? ['#ffffff', '#94a3b8', '#38bdf8'] : ['#0f172a', '#475569', '#0284c7']
    });

    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  return (
    <header className="w-full max-w-7xl mx-auto px-4 pt-4 pb-2 relative z-30">
      {/* Apple Floating Dynamic Frosted Glass Dock */}
      <div 
        style={{
          boxShadow: isDark 
            ? `0 16px 40px -10px rgba(0,0,0,0.5), 0 0 20px ${themeAccent}15`
            : `0 16px 40px -10px rgba(0,0,0,0.06), 0 0 20px ${themeAccent}10`
        }}
        className={`apple-glass rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300 ${
          isDark 
            ? 'border-white/10 hover:border-white/20' 
            : 'border-black/8 hover:border-black/15'
        }`}
      >
        
        {/* Brand Logo & Home */}
        <div 
          onClick={() => {
            sound.playClick();
            onHomeClick();
          }}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div 
            style={{
              backgroundColor: `${themeAccent}18`,
              borderColor: `${themeAccent}35`,
              color: isDark ? '#ffffff' : '#0f172a'
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 shadow-sm"
          >
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight font-['Outfit',sans-serif]">
              NovaTürk
            </span>
            <span 
              style={{
                borderColor: `${themeAccent}30`,
                color: themeAccent
              }}
              className="px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider rounded-full border bg-white/5"
            >
              AI
            </span>
          </div>
        </div>

        {/* Center Dynamic Status Indicator with Live Pulse Beacon */}
        <div className={`hidden md:flex items-center gap-2.5 px-3.5 py-1.2 rounded-full text-[11px] font-normal border transition-all ${
          isDark ? 'bg-white/[0.03] border-white/8 text-slate-300' : 'bg-black/[0.03] border-black/8 text-slate-700'
        }`}>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>50 Türk Sitesi İndeksi</span>
          </span>
          <span className="opacity-30">•</span>
          <span className="opacity-80">İstanbul {timeStr}</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5">
          {/* 10 Cam Teması Seçici Butonu (Canlı Renk Noktalı) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenThemeSelector();
            }}
            title="10 Cam & Gradient Teması Seç (Sağ Üst)"
            style={{
              borderColor: `${themeAccent}40`
            }}
            className={`apple-pill-btn flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
          >
            {/* Canlı Renk Noktası */}
            <span 
              style={{ backgroundColor: themeAccent }} 
              className="w-2.5 h-2.5 rounded-full shadow-sm ring-2 ring-white/20 animate-pulse" 
            />
            <span className="hidden sm:inline text-[11px] font-medium tracking-tight">
              {currentTheme?.name ? currentTheme.name.split(' ')[0] : 'Tema'}
            </span>
            <Palette className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Light / Dark Mode Switcher */}
          <button
            onClick={handleToggleTheme}
            title={isDark ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            className={`apple-pill-btn p-1.5 rounded-full text-xs transition-colors flex items-center justify-center ${
              isDark ? 'text-amber-300 hover:text-amber-200' : 'text-slate-700 hover:text-black'
            }`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Admin */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAdmin();
            }}
            title="Yönetim Masası"
            className="apple-pill-btn flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium"
          >
            <Server className="w-3 h-3" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            title="Paylaş"
            className="apple-pill-btn flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Share2 className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Kopyalandı' : 'Paylaş'}</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            title="API Ayarları"
            className="apple-pill-btn p-1.5 rounded-full text-xs transition-colors flex items-center justify-center"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
}
