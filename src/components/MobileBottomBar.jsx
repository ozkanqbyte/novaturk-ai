import React from 'react';
import { 
  Compass, Search, Plus, Layers, Play, Pause, 
  Settings, Palette, Globe, ShieldCheck, Sun, Moon,
  Music, Sparkles
} from 'lucide-react';
import { sound } from '../services/soundService';

export default function MobileBottomBar({
  tabs,
  activeTabId,
  onHomeClick,
  onNewTab,
  onOpenTabsSheet,
  onOpenSettings,
  onOpenThemeSelector,
  onOpenVpnModal,
  onOpenAdmin,
  isDark,
  setIsDark,
  currentTheme,
  activeMediaTab,
  mediaState,
  onToggleMediaPlay,
  onExpandIsland
}) {
  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');
  const isMusicPlaying = activeMediaTab && mediaState && !mediaState.paused;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden select-none pointer-events-auto">
      {/* 🎵 1. Canlı Mini Müzik Kapsülü (Eğer şarkı çalıyorsa alt barın üstünde yüzer) */}
      {activeMediaTab && (
        <div className="px-3 pb-1.5 animate-in slide-in-from-bottom-3 duration-300">
          <div 
            onClick={() => {
              sound.playClick();
              if (onExpandIsland) onExpandIsland();
            }}
            style={{
              boxShadow: `0 8px 25px -4px rgba(0,0,0,0.7), 0 0 20px rgba(239,68,68,0.3)`
            }}
            className="w-full px-3 py-1.5 rounded-2xl bg-black/85 border border-red-500/40 backdrop-blur-2xl flex items-center justify-between gap-2.5 cursor-pointer text-white"
          >
            <div className="flex items-center gap-2 min-w-0">
              {/* Dönen Vinil Mini Görsel */}
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

              {/* Parça Adı & Sanatçı */}
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white truncate max-w-[200px]">
                  {mediaState?.title || activeMediaTab.title || 'YouTube Müzik'}
                </p>
                <p className="text-[9px] text-red-300/80 truncate">
                  {mediaState?.artist || 'Canlı Çalıyor'} • Adada Göster
                </p>
              </div>
            </div>

            {/* Oynat / Durdur Butonu */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                if (onToggleMediaPlay) onToggleMediaPlay();
              }}
              className="p-1.5 rounded-full bg-white text-slate-950 shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
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

      {/* 🌟 2. Apple / Google Hibrit Cam Dock (Bottom Navigation Bar) */}
      <nav 
        style={{
          boxShadow: isDark 
            ? '0 -10px 30px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)' 
            : '0 -8px 25px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.8)'
        }}
        className={`w-full border-t backdrop-blur-3xl px-4 pt-2 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] transition-colors ${
          isDark 
            ? 'bg-[#06080d]/90 border-white/10 text-white' 
            : 'bg-white/90 border-black/10 text-slate-900'
        }`}
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-1">
          
          {/* Ana Sayfa */}
          <button
            onClick={() => {
              sound.playClick();
              onHomeClick();
            }}
            className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl hover:bg-white/10 transition-all active:scale-90 text-slate-300 hover:text-white"
            title="Ana Sayfa"
          >
            <Compass className="w-5 h-5 text-sky-400" />
            <span className="text-[10px] font-medium">Ana Sayfa</span>
          </button>

          {/* Hızlı Yeni Sekme (+) */}
          <button
            onClick={() => {
              sound.playChime();
              onNewTab();
            }}
            style={{
              background: `linear-gradient(135deg, ${themeAccent}, #8b5cf6)`,
              boxShadow: `0 4px 15px ${themeAccent}50`
            }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold transition-all active:scale-90 cursor-pointer shadow-lg"
            title="Yeni Sekme Aç"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Sekme Yöneticisi (Kartlar ve Sayaç) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTabsSheet();
            }}
            className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl hover:bg-white/10 transition-all active:scale-90 text-slate-300 hover:text-white relative"
            title="Açık Sekmeler"
          >
            <div className="relative">
              <Layers className="w-5 h-5 text-purple-400" />
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-purple-500 text-white text-[9px] font-bold border border-black shadow-sm">
                {tabs.length}
              </span>
            </div>
            <span className="text-[10px] font-medium">Sekmeler</span>
          </button>

          {/* Temalar */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenThemeSelector();
            }}
            className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl hover:bg-white/10 transition-all active:scale-90 text-slate-300 hover:text-white"
            title="Cam Temaları"
          >
            <Palette className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-medium">Temalar</span>
          </button>

          {/* Gece / Gündüz Modu */}
          <button
            onClick={() => {
              sound.playClick();
              setIsDark(!isDark);
            }}
            className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl hover:bg-white/10 transition-all active:scale-90 text-slate-300 hover:text-white"
            title={isDark ? "Açık Moda Geç" : "Koyu Moda Geç"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
            <span className="text-[10px] font-medium">{isDark ? 'Açık' : 'Koyu'}</span>
          </button>

          {/* Sistem Ayarları */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl hover:bg-white/10 transition-all active:scale-90 text-slate-300 hover:text-white"
            title="Ayarlar"
          >
            <Settings className="w-5 h-5 text-slate-400" />
            <span className="text-[10px] font-medium">Ayarlar</span>
          </button>

        </div>
      </nav>
    </div>
  );
}
