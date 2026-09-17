import React, { useState } from 'react';
import { Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { sound } from '../services/soundService';

export default function NovaTurkGoogleLogo({
  isDark = true,
  currentTheme,
  showSubtitle = true,
  size = 'large'
}) {
  const [hoveredLetter, setHoveredLetter] = useState(null);

  // Sade, asil ve monokrom harf yapısı (Kesinlikle renkli değil, saf platin / titanyum ve obsidian)
  const letters = ['N', 'o', 'v', 'a', 'T', 'ü', 'r', 'k'];

  const handleClick = () => {
    sound?.playChime?.();
  };

  return (
    <div className="flex flex-col items-center justify-center select-none animate-fadeIn mb-7 group cursor-default">
      <div className="relative flex items-center justify-center">
        {/* Asil monokrom ışıma - Renksiz saf ışık */}
        <div
          className="absolute -inset-10 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20 group-hover:opacity-35"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(226,232,240,0.04) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(15,23,42,0.06) 0%, transparent 70%)'
          }}
        />

        {/* Minimalist üst etiket - Saf monokrom */}
        <div className={`absolute -top-7 flex items-center gap-1.5 px-3 py-0.5 rounded-full border backdrop-blur-md shadow-xs transition-transform duration-300 group-hover:-translate-y-0.5 ${
          isDark 
            ? 'bg-white/[0.04] border-white/10 text-slate-300' 
            : 'bg-slate-900/[0.04] border-slate-900/10 text-slate-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-white' : 'bg-slate-900'}`} />
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-85">
            YENİ NESİL ARAMA MOTORU
          </span>
          <Sparkles className={`w-2.5 h-2.5 opacity-70 ${isDark ? 'text-white' : 'text-slate-800'}`} />
        </div>

        {/* 🌟 ASİL & MONOKROM NOVATÜRK BAŞLIĞI (Google Font Karakteristiğinde, Sade & Renksiz) */}
        <div
          onClick={handleClick}
          className="flex items-center tracking-tight font-['Outfit',sans-serif] font-bold cursor-pointer transition-transform duration-300 group-hover:scale-[1.02] active:scale-[0.98] py-2"
          style={{
            fontSize: size === 'large' ? 'clamp(3.4rem, 7.5vw, 5.4rem)' : size === 'medium' ? '2.6rem' : '1.9rem',
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
                      ? 'text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.45)]'
                      : 'text-white drop-shadow-[0_2px_14px_rgba(255,255,255,0.12)]'
                    : isHovered
                      ? 'text-black drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]'
                      : 'text-slate-900'
                }`}
              >
                {char}
              </span>
            );
          })}

          {/* Minimalist & Asil AI Rozeti (Monokrom Titanyum/Obsidian - Asla Renkli Değil) */}
          <span className="relative ml-2.5 sm:ml-3.5 -top-2.5 sm:-top-4">
            <span className={`relative z-10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl text-[11px] sm:text-xs font-black tracking-widest uppercase shadow-sm border transition-all duration-300 hover:scale-105 flex items-center gap-1 ${
              isDark
                ? 'bg-white/10 text-white border-white/20 hover:bg-white/15 drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]'
                : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
            }`}>
              <Sparkles className="w-2.5 h-2.5 opacity-80" />
              AI
            </span>
          </span>
        </div>
      </div>

      {/* Alt Başlık & Özellik Rozetleri (Sade & Asil Monokrom) */}
      {showSubtitle && (
        <div className="space-y-2.5 mt-1 max-w-lg text-center animate-fadeIn">
          <p className={`text-xs sm:text-sm font-medium tracking-normal ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Yapay Zeka Destekli Türk Arama & Web Gezgini. <span className="opacity-60">Reklamsız Saf Bilgi.</span>
          </p>

          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-1 text-[11px] opacity-75">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-medium ${
              isDark ? 'bg-white/[0.04] border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 opacity-70" />
              50+ Yerli & Güvenilir Kaynak
            </span>
            <span className="opacity-30 hidden sm:inline">•</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-medium ${
              isDark ? 'bg-white/[0.04] border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <Sparkles className="w-3.5 h-3.5 opacity-70" />
              Sıfır Reklam Kalkanı
            </span>
            <span className="opacity-30 hidden sm:inline">•</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-medium ${
              isDark ? 'bg-white/[0.04] border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <Compass className="w-3.5 h-3.5 opacity-70" />
              Kişisel Veri Korumalı
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
