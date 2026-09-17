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
    <div className={`w-full border-b select-none transition-colors z-30 shrink-0 ${
      isDark ? 'bg-[#0a0c12] border-white/10' : 'bg-[#e3e6ed] border-black/10'
    }`}>
      <div className="w-full px-2 flex items-center justify-between gap-2 pt-1.5 pb-0">
        
        {/* Sol Taraf: NovaTürk Logo \u0026 Chrome Tarzı Sekmeler */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0 pr-2">
          
          {/* NovaTürk Brand Mark */}
          <button
            onClick={() => {
              sound.playClick();
              onHomeClick();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-colors shrink-0 text-xs font-bold tracking-tight mr-1"
            title="NovaTürk Ana Sayfa"
          >
            <div 
              style={{ backgroundColor: `${themeAccent}25`, color: themeAccent }}
              className="w-5 h-5 rounded-lg flex items-center justify-center border border-white/10"
            >
              <Compass className="w-3 h-3 animate-spin-slow" />
            </div>
            <span className="font-['Outfit',sans-serif] hidden sm:inline">NovaTürk</span>
          </button>

          {/* Sekmeler Listesi (Google Chrome Tarzı) */}
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
                style={isActive ? { borderColor: tab.isIncognito ? '#a855f7' : `${themeAccent}40` } : {}}
                className={`group relative flex items-center gap-2 pl-3 pr-2 py-2 rounded-t-xl text-xs font-medium cursor-pointer transition-all max-w-[240px] min-w-[130px] border-t border-x shrink-0 ${
                  tab.isIncognito
                    ? isActive
                      ? 'bg-[#181126] text-purple-200 font-semibold border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)] -mb-[1px] z-10'
                      : 'bg-purple-950/20 text-purple-300/70 border-purple-500/20 hover:bg-purple-900/30 hover:text-purple-200'
                    : isActive
                      ? isDark 
                        ? 'bg-[#151821] text-white font-semibold border-white/15 shadow-sm -mb-[1px] z-10' 
                        : 'bg-white text-slate-900 font-semibold border-black/15 shadow-sm -mb-[1px] z-10'
                      : isDark 
                        ? 'bg-white/[0.03] text-slate-400 border-transparent hover:bg-white/[0.07] hover:text-slate-200' 
                        : 'bg-black/[0.04] text-slate-600 border-transparent hover:bg-black/[0.08] hover:text-slate-900'
                }`}
              >
                {/* Active Glow Pill */}
                {isActive && (
                  <div 
                    style={{ backgroundColor: tab.isIncognito ? '#c084fc' : themeAccent }}
                    className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
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
                    className="w-3.5 h-3.5 object-contain rounded-sm shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5 shrink-0 opacity-60" />
                )}

                {/* Tab Title */}
                <span className="truncate flex-1 text-[11px] sm:text-xs tracking-tight">
                  {tab.isIncognito && !tab.url && tab.title === 'Yeni Sekme' ? '🕶️ Gizli Sekme' : cleanTitle}
                </span>

                {/* Close Tab Button (x) */}
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      onCloseTab(tab.id);
                    }}
                    className="p-1 rounded-md hover:bg-white/20 text-slate-400 hover:text-rose-400 transition-colors opacity-40 group-hover:opacity-100 shrink-0"
                    title="Sekmeyi Kapat (Ctrl+W)"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* 🌟 Google Chrome Tarzı "+" (Yeni Sekme Aç) Butonu */}
          <button
            onClick={() => {
              sound.playChime();
              onNewTab();
            }}
            className={`p-1.5 rounded-xl border transition-all flex items-center justify-center shrink-0 group ${
              isDark 
                ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/15 hover:text-white hover:border-white/20' 
                : 'border-black/10 bg-black/[0.04] text-slate-600 hover:bg-black/10 hover:text-slate-900 hover:border-black/20'
            }`}
            title="Yeni Sekme Aç (Ctrl+T)"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
          </button>

          {/* 🌟 Ajan / Gizli Sekme Aç Butonu (Ctrl + Shift + N) */}
          {onNewIncognitoTab && (
            <button
              onClick={() => {
                sound.playIncognito();
                onNewIncognitoTab();
              }}
              className="p-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:text-white hover:border-purple-400 transition-all flex items-center justify-center shrink-0 group shadow-[0_0_12px_rgba(168,85,247,0.2)] cursor-pointer"
              title="Ajan / Gizli Gezinti Sekmesi Aç (Ctrl+Shift+N)"
            >
              <EyeOff className="w-3.5 h-3.5 transition-transform group-hover:scale-110 duration-200" />
            </button>
          )}

        </div>

        {/* Sağ Taraf: Chrome Tarzı Araçlar (Tema, Koyu Mod, Admin, Ayarlar) */}
        <div className="flex items-center gap-1 shrink-0 pb-1.5">
          <button
            onClick={() => {
              sound.playClick();
              setIsDark(!isDark);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
            title={isDark ? "Açık Moda Geç" : "Koyu Moda Geç"}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenThemeSelector();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
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
              className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
                isVpnActive ? 'text-cyan-400 opacity-100 shadow-sm' : 'opacity-70 hover:opacity-100'
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
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
            title="Admin Masası & İndeks Durumu"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
            title="Sistem & Tarayıcı Ayarları"
          >
            <Settings className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>

      </div>
    </div>
  );
}
