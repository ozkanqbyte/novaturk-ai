import React, { useState } from 'react';
import { Plus, X, Globe, Star, Sparkles } from 'lucide-react';
import { sound } from '../services/soundService';

export default function BookmarksBar({ 
  bookmarks, 
  onSelectBookmark, 
  onRemoveBookmark, 
  onAddBookmarkClick, 
  isDark, 
  currentTheme 
}) {
  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  return (
    <div className={`hidden md:block w-full border-b select-none transition-colors z-20 shrink-0 ${
      isDark ? 'bg-[#0d1017]/80 border-white/5' : 'bg-[#edf0f7]/90 border-black/5'
    }`}>
      <div className="w-full px-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        
        {/* Yer İmleri Başlangıç Rozeti */}
        <div className="flex items-center gap-1 text-[10px] opacity-40 font-bold uppercase tracking-wider pr-1 border-r border-white/10 shrink-0">
          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          <span className="hidden sm:inline">Kısayollar</span>
        </div>

        {/* Yer İmleri Listesi */}
        {bookmarks.slice(0, 14).map((bm) => {
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
              className={`group relative flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-all border shrink-0 max-w-[170px] ${
                isDark 
                  ? 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.08] hover:text-white hover:border-white/15' 
                  : 'bg-black/[0.02] border-black/5 text-slate-700 hover:bg-black/[0.06] hover:text-slate-950 hover:border-black/15'
              }`}
              title={`${bm.title} (${bm.url})`}
            >
              {/* Favicon */}
              <img 
                src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`} 
                alt="" 
                className="w-3.5 h-3.5 object-contain rounded-sm shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />

              {/* Title */}
              <span className="truncate flex-1 tracking-tight text-[11px]">
                {bm.title}
              </span>

              {/* Silme Butonu (Hover'da Çıkar) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  onRemoveBookmark(bm.id || bm.url);
                }}
                className="w-3.5 h-3.5 rounded hover:bg-rose-500/20 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center shrink-0"
                title="Yer İmini Kaldır"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}

        {/* + Kısayol Ekle Butonu */}
        <button
          onClick={() => {
            sound.playChime();
            onAddBookmarkClick();
          }}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all shrink-0 border border-dashed ${
            isDark 
              ? 'border-white/15 text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/30' 
              : 'border-black/15 text-slate-600 hover:text-black hover:bg-black/5 hover:border-black/30'
          }`}
          title="Yeni Kısayol / Yer İmi Ekle"
        >
          <Plus className="w-3 h-3" />
          <span>Ekle</span>
        </button>

      </div>
    </div>
  );
}
