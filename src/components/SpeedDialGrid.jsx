import React from 'react';
import { Plus, X, Globe, Star, ExternalLink, Sparkles } from 'lucide-react';
import { sound } from '../services/soundService';

export default function SpeedDialGrid({ 
  bookmarks, 
  onSelectBookmark, 
  onRemoveBookmark, 
  onAddBookmarkClick, 
  isDark, 
  currentTheme 
}) {
  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-10 animate-fadeIn select-none">
      
      {/* Bölüm Başlığı */}
      <div className="flex items-center justify-between mb-3 px-1 text-xs opacity-60">
        <div className="flex items-center gap-1.5 font-semibold">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Sık Ziyaret Edilenler & Kısayollar</span>
        </div>
        <button
          onClick={onAddBookmarkClick}
          className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-medium"
        >
          <Plus className="w-3 h-3" />
          <span>Yeni Kısayol Ekle</span>
        </button>
      </div>

      {/* Grid: Apple Safari / VisionOS Tarzı Cam Uygulama Simgeleri */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 sm:gap-4">
        {bookmarks.map((bm) => {
          let hostname = bm.domain || 'web';
          if (!hostname && bm.url) {
            try { hostname = new URL(bm.url).hostname; } catch {}
          }

          return (
            <div
              key={bm.id || bm.url}
              onClick={() => {
                sound.playClick();
                onSelectBookmark(bm);
              }}
              className="group relative flex flex-col items-center text-center cursor-pointer transition-all"
            >
              {/* VisionOS Frosted Glass Tile */}
              <div 
                style={{
                  boxShadow: isDark 
                    ? `0 8px 25px -5px rgba(0,0,0,0.5), 0 0 15px ${themeAccent}10` 
                    : `0 8px 25px -5px rgba(0,0,0,0.08)`
                }}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 relative overflow-hidden backdrop-blur-xl ${
                  isDark 
                    ? 'bg-white/[0.05] border-white/12 group-hover:border-white/30 group-hover:bg-white/[0.1]' 
                    : 'bg-white/80 border-black/10 group-hover:border-black/20 group-hover:bg-white shadow-sm'
                }`}
              >
                {/* Glow Hover Layer */}
                <div 
                  style={{ backgroundColor: `${themeAccent}25` }}
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-md"
                />

                {/* Favicon */}
                <img 
                  src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`} 
                  alt={bm.title} 
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg relative z-10 transition-transform group-hover:scale-105"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />

                {/* Silme Çarpısı (Hover'da Çıkar) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onRemoveBookmark(bm.id || bm.url);
                  }}
                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-rose-600"
                  title="Kısayolu Sil"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Title Text */}
              <span className={`text-[11px] font-medium mt-2 max-w-[80px] truncate tracking-tight transition-colors ${
                isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-950'
              }`}>
                {bm.title}
              </span>
            </div>
          );
        })}

        {/* 🌟 "+" Yeni Kısayol Kartı */}
        <div
          onClick={() => {
            sound.playChime();
            onAddBookmarkClick();
          }}
          className="group flex flex-col items-center text-center cursor-pointer transition-all"
        >
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border border-dashed transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 backdrop-blur-xl ${
            isDark 
              ? 'border-white/20 bg-white/[0.02] text-slate-400 group-hover:text-white group-hover:border-white/40 group-hover:bg-white/[0.05]' 
              : 'border-black/20 bg-black/[0.02] text-slate-500 group-hover:text-black group-hover:border-black/40 group-hover:bg-black/[0.05]'
          }`}>
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
          </div>
          <span className="text-[11px] font-medium mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
            Kısayol Ekle
          </span>
        </div>

      </div>
    </div>
  );
}
