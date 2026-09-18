import React, { useState } from 'react';
import { Compass, Sparkles, ShieldCheck } from 'lucide-react';
import { sound } from '../services/soundService';

export default function NovaTurkGoogleLogo({
  isDark = true,
  currentTheme,
  isMinimal = false,
  showSubtitle = false
}) {
  const [hoveredLetter, setHoveredLetter] = useState(null);
  const letters = ['N', 'o', 'v', 'a', 'T', 'ü', 'r', 'k'];

  const handleClick = () => {
    sound?.playChime?.();
  };

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  // 🍏 1. YENİ SEKME AÇILDIĞINDA: MİNİMALİST APPLE SAFARI LOGOSU
  if (isMinimal) {
    return (
      <div className="flex flex-col items-center justify-center select-none animate-in fade-in duration-300 group cursor-default">
        <div 
          onClick={handleClick}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer transition-transform duration-200 active:scale-95"
        >
          {/* Apple Squircle Glass Icon */}
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

  // 🌟 2. NORMAL HOME / ANA SAYFADA: BÜYÜK VE ASİL PRESTİJLİ LOGO
  return (
    <div className="flex flex-col items-center justify-center select-none animate-fadeIn mb-6 group cursor-default">
      <div className="relative flex items-center justify-center">
        {/* Asil monokrom ışıma */}
        <div
          className="absolute -inset-12 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-25 group-hover:opacity-40"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(56,189,248,0.08) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(15,23,42,0.08) 0%, transparent 70%)'
          }}
        />

        {/* 🌟 BÜYÜK NOVATÜRK BAŞLIĞI */}
        <div
          onClick={handleClick}
          className="flex items-center tracking-tight font-['Outfit',sans-serif] font-bold cursor-pointer transition-transform duration-300 group-hover:scale-[1.02] active:scale-[0.98] py-2"
          style={{
            fontSize: 'clamp(3.4rem, 7.5vw, 5.4rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.035em'
          }}
        >
          {letters.map((char, index) => {
            const isHovered = hoveredLetter === index;

            return (
              <span
                key={index}
                onMouseEnter={() => {
                  setHoveredLetter(index);
                  sound?.playClick?.();
                }}
                onMouseLeave={() => setHoveredLetter(null)}
                style={{
                  transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), text-shadow 0.22s'
                }}
                className={`inline-block relative transition-all duration-200 ${
                  isDark
                    ? isHovered
                      ? 'text-white drop-shadow-[0_0_28px_rgba(255,255,255,0.5)]'
                      : 'text-white drop-shadow-[0_2px_14px_rgba(255,255,255,0.15)]'
                    : isHovered
                      ? 'text-black drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]'
                      : 'text-slate-900'
                }`}
              >
                {char}
              </span>
            );
          })}

          {/* Minimalist AI Rozeti */}
          <span className="relative ml-2.5 sm:ml-3.5 -top-3 sm:-top-5">
            <span className={`relative z-10 px-2.5 sm:px-3 py-1 rounded-xl text-xs sm:text-sm font-black tracking-widest uppercase shadow-md border transition-all duration-300 hover:scale-105 flex items-center gap-1 ${
              isDark
                ? 'bg-white/10 text-white border-white/25 hover:bg-white/20 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]'
                : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
            }`}>
              <Sparkles className="w-3 h-3 text-sky-400" />
              AI
            </span>
          </span>
        </div>
      </div>

      {showSubtitle && (
        <p className={`text-xs sm:text-sm font-medium tracking-normal mt-2 ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Yapay Zeka Destekli Türk Arama & Web Gezgini
        </p>
      )}
    </div>
  );
}
