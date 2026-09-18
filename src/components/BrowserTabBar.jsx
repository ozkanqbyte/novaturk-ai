import React from 'react';
import { 
  Plus, X, Search, Globe, Palette, Settings, 
  ShieldCheck, Moon, Sun, Compass, EyeOff, History
} from 'lucide-react';
import { unescapeHtml } from '../services/searchService';
import { sound } from '../services/soundService';

export default function BrowserTabBar({ 
  tabs, 
  activeTabId, 
  onSelectTab, 
  onCloseTab, 
  onNewTab, 
  onNewIncognitoTab,
  onHomeClick,
  onOpenSettings,
  onOpenAdmin,
  onOpenThemeSelector,
  onOpenVpnModal,
  onOpenHistory,
  isVpnActive = false,
  isDark,
  setIsDark,
  currentTheme 
}) {
  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  return (
    <div className={`w-full border-b select-none transition-all duration-300 z-30 shrink-0 backdrop-blur-2xl ${
      isDark 
        ? 'bg-[#06080d]/80 border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
        : 'bg-white/75 border-black/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.06)]'
    }`}>
      <div className="w-full px-3 flex items-center justify-between gap-2.5 pt-2 pb-1.5">
        
        {/* Sol Taraf: Apple Tarzı Glassmorphic Logo & Sekmeler */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 min-w-0 pr-2">
          
          {/* Apple VisionOS Brand Capsule */}
          <button
            onClick={() => {
              sound.playClick();
              onHomeClick();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl transition-all duration-200 shrink-0 text-xs font-bold tracking-tight border ${
              isDark
                ? 'bg-white/[0.04] hover:bg-white/[0.09] border-white/10 text-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]'
                : 'bg-black/[0.03] hover:bg-black/[0.07] border-black/10 text-slate-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]'
            }`}
            title="NovaTürk Ana Sayfa"
          >
            <div 
              style={{ backgroundColor: `${themeAccent}25`, color: themeAccent, borderColor: `${themeAccent}40` }}
              className="w-5 h-5 rounded-xl flex items-center justify-center border shadow-sm"
            >
              <Compass className="w-3 h-3 animate-spin-slow" />
            </div>
            <span className="font-['Outfit',sans-serif] tracking-tight hidden sm:inline">NovaTürk</span>
          </button>

          {/* Sekmeler Listesi (Apple VisionOS Glass Capsules) */}
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
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
                }}
                style={isActive ? { 
                  borderColor: tab.isIncognito ? 'rgba(168,85,247,0.45)' : `${themeAccent}50`,
                  boxShadow: isActive 
                    ? tab.isIncognito 
                      ? '0 8px 20px -4px rgba(168,85,247,0.3), inset 0 1px 1px rgba(255,255,255,0.2)' 
                      : `0 8px 20px -4px ${themeAccent}30, inset 0 1px 1px rgba(255,255,255,0.25)`
                    : 'none'
                } : {}}
                className={`group relative flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-2xl text-xs font-medium cursor-pointer transition-all duration-200 max-w-[240px] min-w-[130px] border shrink-0 backdrop-blur-xl ${
                  tab.isIncognito
                    ? isActive
                      ? 'bg-[#1e1335]/90 text-purple-100 font-semibold border-purple-500/40'
                      : 'bg-purple-950/20 text-purple-300/70 border-purple-500/20 hover:bg-purple-900/35 hover:text-purple-200'
                    : isActive
                      ? isDark 
                        ? 'bg-white/[0.12] text-white font-semibold border-white/25 text-shadow-sm' 
                        : 'bg-white/90 text-slate-900 font-semibold border-black/15 shadow-sm'
                      : isDark 
                        ? 'bg-white/[0.03] text-slate-400 border-white/[0.05] hover:bg-white/[0.08] hover:text-slate-200 hover:border-white/10' 
                        : 'bg-black/[0.03] text-slate-600 border-black/[0.05] hover:bg-black/[0.06] hover:text-slate-900 hover:border-black/10'
                }`}
              >
                {/* Active Apple Glow Indicator */}
                {isActive && (
                  <div 
                    style={{ backgroundColor: tab.isIncognito ? '#c084fc' : themeAccent }}
                    className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse shadow-[0_0_8px_currentColor]"
                  />
                )}

                {/* Favicon / Type Icon */}
                {tab.isIncognito ? (
                  <EyeOff className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                ) : tab.type === 'search' ? (
                  <Search className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-sky-400' : 'opacity-60'}`} />
                ) : hostname ? (
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`} 
                    alt="" 
                    className="w-3.5 h-3.5 object-contain rounded-md shrink-0 drop-shadow-sm"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5 shrink-0 opacity-60" />
                )}

                {/* Tab Title */}
                <span className="truncate flex-1 text-[11px] sm:text-xs tracking-tight">
                  {tab.isIncognito && !tab.url && tab.title === 'Yeni Sekme' ? '🕶️ Gizli Sekme' : cleanTitle}
                </span>

                {/* Apple Style Circular Glass Close Button (x) */}
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      onCloseTab(tab.id);
                    }}
                    className="p-1 rounded-full hover:bg-white/20 text-slate-400 hover:text-rose-400 transition-all opacity-40 group-hover:opacity-100 shrink-0 hover:scale-110"
                    title="Sekmeyi Kapat (Ctrl+W)"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* 🌟 Apple VisionOS Glass "+" (Yeni Sekme Aç) Butonu */}
          <button
            onClick={() => {
              sound.playChime();
              onNewTab();
            }}
            className={`p-2 rounded-2xl border transition-all duration-200 flex items-center justify-center shrink-0 group backdrop-blur-xl ${
              isDark 
                ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/15 hover:text-white hover:border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                : 'border-black/10 bg-black/[0.04] text-slate-600 hover:bg-black/10 hover:text-slate-900 hover:border-black/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]'
            }`}
            title="Yeni Sekme Aç (Ctrl+T)"
          >
            <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-300" />
          </button>

          {/* 🌟 Ajan / Gizli Sekme Aç Butonu (Ctrl + Shift + N) */}
          {onNewIncognitoTab && (
            <button
              onClick={() => {
                sound.playIncognito();
                onNewIncognitoTab();
              }}
              className="p-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/25 hover:text-white hover:border-purple-400/60 transition-all flex items-center justify-center shrink-0 group shadow-[0_0_15px_rgba(168,85,247,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)] cursor-pointer backdrop-blur-xl"
              title="Ajan / Gizli Gezinti Sekmesi Aç (Ctrl+Shift+N)"
            >
              <EyeOff className="w-3.5 h-3.5 transition-transform group-hover:scale-110 duration-200" />
            </button>
          )}

        </div>

        {/* Sağ Taraf: Apple Control Center Tarzı Cam Araçlar */}
        <div className={`flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-2xl border backdrop-blur-xl ${
          isDark 
            ? 'bg-white/[0.04] border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
            : 'bg-black/[0.03] border-black/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]'
        }`}>
          <button
            onClick={() => {
              sound.playClick();
              setIsDark(!isDark);
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors opacity-75 hover:opacity-100"
            title={isDark ? "Açık Moda Geç" : "Koyu Moda Geç"}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenThemeSelector();
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors opacity-75 hover:opacity-100"
            title="Cam Temaları (10 Renk)"
          >
            <Palette className="w-3.5 h-3.5 text-sky-400" />
          </button>

          {/* CyberVPN Butonu */}
          {onOpenVpnModal && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenVpnModal();
              }}
              className={`p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer ${
                isVpnActive ? 'text-cyan-400 opacity-100 shadow-sm' : 'opacity-75 hover:opacity-100'
              }`}
              title="NovaTürk CyberVPN & Gizlilik Tüneli"
            >
              <Globe className={`w-3.5 h-3.5 ${isVpnActive ? 'text-cyan-400 animate-spin-slow' : 'text-cyan-400/80'}`} />
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onOpenAdmin();
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors opacity-75 hover:opacity-100"
            title="Admin Masası & İndeks Durumu"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors opacity-75 hover:opacity-100"
            title="Sistem & Tarayıcı Ayarları"
          >
            <Settings className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>

      </div>
    </div>
  );
}
