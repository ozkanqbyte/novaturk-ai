import React from 'react';
import { Clock, Globe, Search, ArrowUpRight, X, Trash2, Sparkles } from 'lucide-react';
import { sound } from '../services/soundService';

export default function OmnibarHistoryDropdown({
  isOpen,
  onClose,
  inputVal,
  history,
  onSelectSearch,
  onSelectVisit,
  onRemoveItem,
  onClearAll,
  isDark
}) {
  if (!isOpen) return null;

  const query = (inputVal || '').trim().toLowerCase();

  // Filtreleme: Arama ve ziyaret geçmişi
  const filtered = history.filter(item => {
    if (!query) return true;
    if (item.type === 'search') {
      return item.text.toLowerCase().includes(query);
    }
    if (item.type === 'visit') {
      return (item.title || '').toLowerCase().includes(query) || (item.url || '').toLowerCase().includes(query);
    }
    return false;
  }).slice(0, 8);

  const searches = filtered.filter(i => i.type === 'search');
  const visits = filtered.filter(i => i.type === 'visit');

  return (
    <div 
      onMouseDown={(e) => e.preventDefault()} // input'un onBlur tetiklemesini önle
      className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-2xl backdrop-blur-2xl overflow-hidden z-50 animate-fadeIn ${
        isDark 
          ? 'bg-[#151822]/95 border-white/15 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.7)]' 
          : 'bg-white/95 border-black/10 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)]'
      }`}
    >
      {/* 1. Anlık Arama Yap Seçeneği (Eğer metin yazıldıysa) */}
      {query && (
        <div 
          onClick={() => {
            sound.playClick();
            onSelectSearch(inputVal);
            onClose();
          }}
          className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors border-b ${
            isDark ? 'hover:bg-white/10 border-white/10' : 'hover:bg-slate-100 border-black/5'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Search className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-semibold text-xs text-sky-400 truncate">
              NovaTürk ile Ara: <span className="font-normal text-inherit underline">"{inputVal}"</span>
            </span>
          </div>
          <span className="text-[10px] opacity-40 font-mono">Enter ↵</span>
        </div>
      )}

      {/* 2. Son Aramalar Grubu */}
      {searches.length > 0 && (
        <div className="py-2">
          <div className="px-4 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider opacity-50">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Son Aramalar
            </span>
          </div>

          <div className="space-y-0.5">
            {searches.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onSelectSearch(item.text);
                  onClose();
                }}
                className={`group px-4 py-2 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Clock className="w-3.5 h-3.5 opacity-40 group-hover:text-sky-400 shrink-0" />
                  <span className="truncate group-hover:text-sky-400 font-medium">
                    {item.text}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onRemoveItem(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-70 hover:opacity-100 p-1 rounded hover:bg-rose-500/20 hover:text-rose-400 transition-all shrink-0"
                  title="Geçmişten Kaldır"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Son Ziyaret Edilen Siteler Grubu */}
      {visits.length > 0 && (
        <div className="py-2 border-t border-white/5">
          <div className="px-4 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider opacity-50">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Son Ziyaret Edilen Siteler
            </span>
          </div>

          <div className="space-y-0.5">
            {visits.map(item => {
              let domain = item.hostname || 'web';
              try { domain = new URL(item.url).hostname; } catch {}

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectVisit(item.url, item.title);
                    onClose();
                  }}
                  className={`group px-4 py-2 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} 
                      alt="" 
                      className="w-3.5 h-3.5 object-contain rounded-sm shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="flex items-baseline gap-2 min-w-0 truncate">
                      <span className="font-medium truncate group-hover:text-sky-400">
                        {item.title || domain}
                      </span>
                      <span className="text-[11px] opacity-40 font-mono truncate">
                        {item.url}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-80 shrink-0" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        onRemoveItem(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-70 hover:opacity-100 p-1 rounded hover:bg-rose-500/20 hover:text-rose-400 transition-all shrink-0 ml-1"
                      title="Geçmişten Kaldır"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Alt Bar: Geçmişi Temizle Butonu */}
      <div className={`p-2 px-4 border-t flex items-center justify-between text-[11px] ${
        isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-slate-50'
      }`}>
        <span className="opacity-40 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-400" /> NovaTürk Akıllı Öneri & Geçmiş
        </span>

        {history.length > 0 && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClearAll();
            }}
            className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 font-semibold"
          >
            <Trash2 className="w-3 h-3" />
            <span>Tüm Geçmişi Temizle</span>
          </button>
        )}
      </div>
    </div>
  );
}
