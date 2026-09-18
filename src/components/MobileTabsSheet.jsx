import React, { useState } from 'react';
import { Plus, X, Globe, Search, EyeOff, Trash2, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
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
  const [tabFilter, setTabFilter] = useState('all'); // 'all' or 'incognito'
  if (!isOpen) return null;

  const themeAccent = currentTheme?.accent || '#38bdf8';

  const normalTabs = tabs.filter(t => !t.isIncognito);
  const incognitoTabs = tabs.filter(t => t.isIncognito);

  const displayedTabs = tabFilter === 'incognito' ? incognitoTabs : normalTabs;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-[#050712]/98 backdrop-blur-3xl text-white select-none animate-in fade-in duration-200">
      
      {/* 🌟 1. APPLE SAFARI ÜST KONTROL BAR */}
      <header className="w-full pt-[calc(0.8rem+env(safe-area-inset-top,0px))] pb-3 px-4 border-b border-white/10 flex items-center justify-between shrink-0">
        
        {/* Sol: Sekme Sayısı */}
        <div className="text-xs font-semibold text-slate-300">
          <span>{tabs.length} Sekme</span>
        </div>

        {/* Orta: Segmented Switcher (Normal vs Gizli/Ajan) */}
        <div className="flex items-center p-0.5 rounded-full bg-white/10 border border-white/15">
          <button
            onClick={() => {
              sound.playClick();
              setTabFilter('all');
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              tabFilter === 'all' 
                ? 'bg-white text-slate-950 shadow-md' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Normal ({normalTabs.length})
          </button>

          <button
            onClick={() => {
              sound.playIncognito();
              setTabFilter('incognito');
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
              tabFilter === 'incognito' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-purple-300 hover:text-purple-100'
            }`}
          >
            <EyeOff className="w-3 h-3" />
            <span>Gizli ({incognitoTabs.length})</span>
          </button>
        </div>

        {/* Sağ: Apple "Bitti" (Done) Butonu */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          style={{ color: themeAccent }}
          className="text-xs font-bold px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          Bitti
        </button>
      </header>

      {/* 🌟 2. APPLE SAFARI 3D SEKME KARTLARI IZGARASI (GRID VIEW) */}
      <main className="flex-1 overflow-y-auto p-3.5 grid grid-cols-2 gap-3 no-scrollbar">
        {displayedTabs.length === 0 ? (
          <div className="col-span-2 py-20 flex flex-col items-center justify-center text-center space-y-3 opacity-60">
            {tabFilter === 'incognito' ? (
              <>
                <EyeOff className="w-10 h-10 text-purple-400" />
                <p className="text-xs">Henüz açık bir Gizli (Ajan) sekme yok.</p>
                <button
                  onClick={() => {
                    sound.playIncognito();
                    if (onNewIncognitoTab) onNewIncognitoTab();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-2xl bg-purple-600 text-white text-xs font-bold"
                >
                  + Gizli Sekme Aç
                </button>
              </>
            ) : (
              <>
                <Globe className="w-10 h-10 text-sky-400" />
                <p className="text-xs">Açık normal sekme yok.</p>
              </>
            )}
          </div>
        ) : (
          displayedTabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const cleanTitle = unescapeHtml(tab.title || (tab.type === 'search' ? 'Yeni Sekme' : 'Web Sayfası'));
            let hostname = '';
            if (tab.url) {
              try { hostname = new URL(tab.url).hostname.replace(/^www\./, ''); } catch {}
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
                  borderColor: tab.isIncognito ? '#c084fc' : themeAccent,
                  boxShadow: isActive ? `0 10px 30px -5px ${themeAccent}40` : 'none'
                } : {}}
                className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-40 p-2.5 backdrop-blur-2xl select-none ${
                  tab.isIncognito
                    ? isActive
                      ? 'bg-purple-950/70 border-purple-400/80 shadow-lg'
                      : 'bg-purple-950/30 border-purple-500/25 hover:bg-purple-900/40'
                    : isActive
                      ? 'bg-white/[0.12] border-sky-400 shadow-lg'
                      : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                {/* Kart Üst Barı: İkon, Hostname ve Dairesel Kapatma Tuşu */}
                <div className="flex items-center justify-between gap-1 shrink-0 pb-1 border-b border-white/10">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {tab.isIncognito ? (
                      <EyeOff className="w-3 h-3 text-purple-400 shrink-0" />
                    ) : tab.type === 'search' ? (
                      <Search className="w-3 h-3 text-sky-400 shrink-0" />
                    ) : (
                      <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                    )}
                    <span className="text-[10px] font-mono text-slate-300 truncate">
                      {hostname || (tab.type === 'search' ? 'Arama' : 'Sayfa')}
                    </span>
                  </div>

                  {/* Kapatma Butonu */}
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        onCloseTab(tab.id);
                      }}
                      className="w-5 h-5 rounded-full bg-white/10 hover:bg-rose-500/80 text-slate-300 hover:text-white flex items-center justify-center transition-all shrink-0"
                      title="Sekmeyi Kapat"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Kart Ortası: Apple Safari Önizleme Minyatürü */}
                <div className="my-auto py-2 flex flex-col items-center justify-center text-center px-1">
                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-2 drop-shadow-sm">
                    {cleanTitle}
                  </h4>
                  {tab.query && (
                    <p className="text-[10px] text-sky-300/80 truncate mt-1">
                      "{tab.query}"
                    </p>
                  )}
                </div>

                {/* Kart Alt Çubuğu */}
                <div className="pt-1 flex items-center justify-between text-[9px] text-slate-400 border-t border-white/5">
                  <span className={isActive ? 'text-sky-400 font-bold' : ''}>
                    {isActive ? '● Aktif' : 'Aç'}
                  </span>
                  {tab.isIncognito && (
                    <span className="text-purple-300 font-bold">Gizli</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* 🌟 3. APPLE SAFARI ALT ARAÇ ÇUBUĞU */}
      <footer className="w-full pt-2.5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] px-5 border-t border-white/10 flex items-center justify-between shrink-0 bg-black/60 backdrop-blur-2xl">
        
        {/* Sol: Yeni Sekme Ekle */}
        <button
          onClick={() => {
            sound.playChime();
            if (tabFilter === 'incognito' && onNewIncognitoTab) {
              onNewIncognitoTab();
            } else if (onNewTab) {
              onNewTab();
            }
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          <span>Yeni Sekme</span>
        </button>

        {/* Sağ: Bitti */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          style={{
            backgroundColor: `${themeAccent}30`,
            borderColor: `${themeAccent}60`,
            color: themeAccent
          }}
          className="px-4 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-95 shadow-sm"
        >
          Bitti
        </button>
      </footer>

    </div>
  );
}
