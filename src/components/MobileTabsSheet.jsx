import React from 'react';
import { Plus, X, Globe, Search, EyeOff, Trash2, ArrowLeft } from 'lucide-react';
import { unescapeHtml } from '../services/searchService';
import { sound } from '../services/soundService';

export default function MobileTabsSheet({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onNewIncognitoTab,
  isDark,
  currentTheme
}) {
  if (!isOpen) return null;

  const themeAccent = currentTheme?.accent || '#38bdf8';

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Arka plan tıklandığında kapat */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Alttan Açılan Apple Cam Kart Paneli */}
      <div 
        style={{
          maxHeight: '88vh',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.2)'
        }}
        className={`relative z-10 w-full flex flex-col rounded-t-[32px] border-t backdrop-blur-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 ${
          isDark 
            ? 'bg-[#080a12]/95 border-white/20 text-white' 
            : 'bg-white/95 border-black/15 text-slate-900'
        }`}
      >
        {/* Üst Tutamaç & Başlık */}
        <div className="w-full pt-3 pb-3 px-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>
            <h3 className="text-sm font-bold tracking-tight">
              Açık Sekmeler <span className="text-xs opacity-60 font-normal">({tabs.length})</span>
            </h3>
          </div>

          {/* Kısayol Butonları: Yeni Sekme, Gizli Sekme */}
          <div className="flex items-center gap-1.5">
            {onNewIncognitoTab && (
              <button
                onClick={() => {
                  sound.playIncognito();
                  onNewIncognitoTab();
                  onClose();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-semibold flex items-center gap-1 hover:bg-purple-500/25 transition-all"
                title="Yeni Gizli Sekme"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gizli</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playChime();
                onNewTab();
                onClose();
              }}
              style={{
                backgroundColor: `${themeAccent}25`,
                borderColor: `${themeAccent}50`,
                color: themeAccent
              }}
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 hover:scale-105 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Sekme</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-white/15 transition-colors ml-1"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Sekme Kartları Izgarası (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 no-scrollbar pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const cleanTitle = unescapeHtml(tab.title || (tab.type === 'search' ? 'Yeni Sekme' : 'Web Sayfası'));
            let hostname = '';
            if (tab.url) {
              try { hostname = new URL(tab.url).hostname; } catch {}
            }

            return (
              <div
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTab(tab.id);
                  onClose();
                }}
                style={isActive ? {
                  borderColor: tab.isIncognito ? 'rgba(168,85,247,0.7)' : themeAccent,
                  boxShadow: isActive ? `0 8px 25px -5px ${themeAccent}40` : 'none'
                } : {}}
                className={`relative rounded-2xl p-3 border transition-all duration-200 cursor-pointer flex flex-col justify-between h-32 group select-none ${
                  tab.isIncognito
                    ? isActive 
                      ? 'bg-purple-950/80 border-purple-500/60 text-white' 
                      : 'bg-purple-950/30 border-purple-500/20 text-purple-200 hover:bg-purple-900/40'
                    : isActive
                      ? isDark 
                        ? 'bg-white/[0.12] border-sky-400/70 text-white' 
                        : 'bg-white border-sky-500 shadow-md text-slate-900'
                      : isDark
                        ? 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                        : 'bg-black/[0.03] border-black/10 text-slate-700 hover:bg-black/[0.06]'
                }`}
              >
                {/* Üst Başlık & Kapatma Tuşu */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {tab.isIncognito ? (
                      <EyeOff className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    ) : tab.type === 'search' ? (
                      <Search className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="text-[10px] font-mono opacity-60 truncate">
                      {hostname || (tab.type === 'search' ? 'Arama' : 'Sayfa')}
                    </span>
                  </div>

                  {/* Kapat Butonu */}
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        onCloseTab(tab.id);
                      }}
                      className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                      title="Sekmeyi Kapat"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Kart İçi Başlık */}
                <div className="mt-2">
                  <h4 className="text-xs font-bold leading-snug line-clamp-2">
                    {cleanTitle}
                  </h4>
                </div>

                {/* Alt Durum Çubuğu */}
                <div className="mt-auto pt-1 flex items-center justify-between text-[9px] opacity-60">
                  <span>{isActive ? '● Açık Sekme' : 'Geçiş Yap'}</span>
                  {tab.isIncognito && <span className="text-purple-300 font-semibold">Gizli</span>}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
