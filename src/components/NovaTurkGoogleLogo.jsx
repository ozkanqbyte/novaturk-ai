import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { sound } from '../services/soundService';

export default function NovaTurkGoogleLogo({
  isDark = true,
  currentTheme,
  showSubtitle = false,
  size = 'medium'
}) {
  const handleClick = () => {
    sound?.playChime?.();
  };

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  return (
    <div className="flex flex-col items-center justify-center select-none animate-in fade-in duration-300 group cursor-default">
      {/* 🍏 APPLE TARZINDA MİNİMALİST LOGO VE İSİM */}
      <div 
        onClick={handleClick}
        className="flex items-center gap-2.5 sm:gap-3 cursor-pointer transition-transform duration-200 active:scale-95"
      >
        {/* Apple Squircle Icon */}
        <div 
          style={{
            boxShadow: isDark
              ? '0 8px 24px -4px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.2)'
              : '0 8px 24px -4px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.8)'
          }}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 backdrop-blur-2xl ${
            isDark 
              ? 'bg-white/[0.08] border-white/20 text-sky-400' 
              : 'bg-white/90 border-black/10 text-sky-600'
          }`}
        >
          <Compass className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform duration-500 group-hover:rotate-45" />
        </div>

        {/* Minimalist Apple Başlık */}
        <div className="flex items-center gap-1.5">
          <span className={`text-2xl sm:text-3xl font-bold tracking-tight font-['Outfit',sans-serif] transition-colors ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}>
            NovaTürk
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider border ${
            isDark 
              ? 'bg-white/10 text-sky-400 border-white/15' 
              : 'bg-sky-50 text-sky-600 border-sky-200'
          }`}>
            AI
          </span>
        </div>
      </div>
    </div>
  );
}
