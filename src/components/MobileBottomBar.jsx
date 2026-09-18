import React, { useState, useRef, useEffect } from 'react';
import { 
  Lock, Search, Plus, ArrowLeft, ArrowRight, RotateCw, 
  Layers, X, Music, Play, Pause, ExternalLink, Globe, Sparkles
} from 'lucide-react';
import { sound } from '../services/soundService';

export default function MobileBottomBar({
  tabs,
  activeTabId,
  activeTab,
  onNavigate,
  onSearch,
  onNewTab,
  onOpenTabsSheet,
  onGoBack,
  onGoForward,
  canGoBack = true,
  canGoForward = false,
  onReload,
  isDark,
  currentTheme,
  activeMediaTab,
  mediaState,
  onToggleMediaPlay
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const inputRef = useRef(null);

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');
  const isMusicPlaying = activeMediaTab && mediaState && !mediaState.paused;

  // Aktif sekmenin URL veya Arama terimi
  const displayUrl = activeTab?.url || '';
  let hostname = '';
  if (displayUrl) {
    try {
      hostname = new URL(displayUrl).hostname.replace(/^www\./, '');
    } catch {}
  }
  const displayText = activeTab?.type === 'search' 
    ? (activeTab.query ? `"${activeTab.query}"` : 'NovaTürk Arama')
    : (hostname || activeTab?.title || 'Web Gezgini');

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBarClick = () => {
    sound.playClick();
    setQueryInput(activeTab?.type === 'search' ? (activeTab.query || '') : (activeTab?.url || ''));
    setIsEditing(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = queryInput.trim();
    if (!val) {
      setIsEditing(false);
      return;
    }

    sound.playChime();
    setIsEditing(false);

    // Eğer geçerli bir URL ise veya nokta içeriyorsa doğrudan git
    const isUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i.test(val) || val.startsWith('http://') || val.startsWith('https://');
    if (isUrl && onNavigate) {
      const finalUrl = val.startsWith('http') ? val : `https://${val}`;
      onNavigate(finalUrl);
    } else if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <div className="fixed bottom-2 left-2.5 right-2.5 z-40 md:hidden select-none pointer-events-auto mb-[env(safe-area-inset-bottom,0px)]">
      
      {/* 🎵 1. Mobilde Çalan Şarkı Varsa: Safari Barın Üstünde Yüzen Zarif Cam Müzik Kapsülü */}
      {activeMediaTab && (
        <div className="px-1 pb-1.5 animate-in slide-in-from-bottom-2 duration-300">
          <div 
            style={{
              boxShadow: '0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(239,68,68,0.35)'
            }}
            className="w-full px-3 py-1.5 rounded-2xl bg-black/85 border border-red-500/40 backdrop-blur-3xl flex items-center justify-between gap-2.5 text-white"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Dönen Vinil Plak */}
              <div className="w-6 h-6 rounded-full overflow-hidden border border-red-400/60 shrink-0 relative animate-spin-slow">
                {mediaState?.thumbnail ? (
                  <img src={mediaState.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-red-600 flex items-center justify-center">
                    <Music className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-black border border-white/60" />
              </div>

              {/* Şarkı Başlığı */}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-white truncate drop-shadow-sm">
                  {mediaState?.title || activeMediaTab.title || 'YouTube Çalıyor'}
                </p>
                <p className="text-[9px] text-red-300/80 truncate">
                  {mediaState?.artist || 'Canlı Müzik'}
                </p>
              </div>
            </div>

            {/* Oynat / Durdur */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                if (onToggleMediaPlay) onToggleMediaPlay();
              }}
              className="p-1.5 rounded-full bg-white text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
            >
              {isMusicPlaying ? (
                <Pause className="w-3 h-3 fill-current" />
              ) : (
                <Play className="w-3 h-3 fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* 🌟 2. APPLE SAFARI iOS FLOATING GLASS ADDRESS & SEARCH CAPSULE */}
      <div 
        style={{
          boxShadow: isDark 
            ? '0 12px 35px -5px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.25)' 
            : '0 12px 35px -5px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.8)'
        }}
        className={`w-full rounded-full border backdrop-blur-3xl px-2 py-1.5 flex items-center justify-between gap-1.5 transition-all duration-300 ${
          isDark 
            ? 'bg-[#080a12]/92 border-white/20 text-white' 
            : 'bg-white/92 border-black/15 text-slate-900'
        }`}
      >
        {/* Sol Buton: Geri Butonu (veya Yenile) */}
        {!isEditing && (
          <button
            onClick={() => {
              sound.playClick();
              if (canGoBack && onGoBack) onGoBack();
              else if (onReload) onReload();
            }}
            className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all text-slate-300 hover:text-white shrink-0"
            title="Geri Git"
          >
            {canGoBack ? <ArrowLeft className="w-4 h-4" /> : <RotateCw className="w-4 h-4 opacity-70" />}
          </button>
        )}

        {/* 🔍 Orta Kısım: Apple Safari Adres / Arama Kapsülü */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-1.5 w-full">
              <Search className="w-3.5 h-3.5 text-sky-400 shrink-0 ml-1.5" />
              <input
                ref={inputRef}
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Arayın veya web adresi yazın..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none py-1"
              />
              {queryInput && (
                <button
                  type="button"
                  onClick={() => setQueryInput('')}
                  className="p-1 rounded-full hover:bg-white/10 text-slate-400 shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                type="submit"
                className="px-2.5 py-1 rounded-full bg-sky-500 text-white text-[11px] font-bold shrink-0 shadow-sm"
              >
                Git
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 text-[11px] text-slate-400 hover:text-white shrink-0"
              >
                Vazgeç
              </button>
            </form>
          ) : (
            <div 
              onClick={handleBarClick}
              className="w-full py-1.5 px-3 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              {activeTab?.type === 'web' ? (
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <Search className="w-3 h-3 text-sky-400 shrink-0" />
              )}
              <span className="text-xs font-semibold tracking-tight truncate max-w-[190px]">
                {displayText}
              </span>
            </div>
          )}
        </div>

        {/* Sağ Butonlar: Safari Sekmeler Rozeti & Yeni Sekme */}
        {!isEditing && (
          <div className="flex items-center gap-0.5 shrink-0">
            {/* (+) Hızlı Yeni Sekme Butonu */}
            <button
              onClick={() => {
                sound.playChime();
                if (onNewTab) onNewTab();
              }}
              className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all text-slate-300 hover:text-white"
              title="Yeni Sekme Aç"
            >
              <Plus className="w-4 h-4 text-sky-400" />
            </button>

            {/* 📑 Apple Safari Sekme Switcher Butonu (Kare İçinde Sekme Sayısı) */}
            <button
              onClick={() => {
                sound.playClick();
                if (onOpenTabsSheet) onOpenTabsSheet();
              }}
              style={{
                borderColor: `${themeAccent}60`
              }}
              className="w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-bold text-white hover:scale-105 active:scale-90 transition-all bg-white/10 shadow-sm cursor-pointer ml-0.5"
              title="Açık Sekmeleri Yönet"
            >
              <span className="font-mono text-[11px] font-black">{tabs.length}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
