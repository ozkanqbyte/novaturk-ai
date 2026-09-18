import React, { useState } from 'react';
import { 
  Settings, Palette, Sun, Moon, Globe, ShieldCheck, 
  History, Lock, X, Sparkles, Compass
} from 'lucide-react';
import { sound } from '../services/soundService';

export default function MobileTopBar({
  onHomeClick,
  onOpenSettings,
  onOpenThemeSelector,
  onOpenVpnModal,
  onOpenAdmin,
  onOpenHistory,
  onOpenSecurityModal,
  isVpnActive,
  isDark,
  setIsDark,
  currentTheme
}) {
  const [isOpen, setIsOpen] = useState(false);
  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  return (
    <>
      {/* 🌟 Mobilde Ekranın Sağ Üstünde Yüzen Apple VisionOS Kontrol Kapsülü */}
      <div className="fixed top-2.5 right-3 left-3 z-30 md:hidden flex items-center justify-between pointer-events-none select-none mt-[env(safe-area-inset-top,0px)]">
        
        {/* Sol: Mini Apple VisionOS NovaTürk Marka Kapsülü */}
        <button
          onClick={() => {
            sound.playClick();
            if (onHomeClick) onHomeClick();
          }}
          style={{
            boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)'
          }}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 border border-white/20 backdrop-blur-2xl text-white active:scale-95 transition-all shadow-lg"
        >
          <div 
            style={{ backgroundColor: `${themeAccent}30`, color: themeAccent }}
            className="w-4 h-4 rounded-full flex items-center justify-center border border-white/15"
          >
            <Compass className="w-2.5 h-2.5 animate-spin-slow" />
          </div>
          <span className="text-[11px] font-bold tracking-tight font-['Outfit',sans-serif]">NovaTürk</span>
        </button>

        {/* Sağ: Ayarlar & Kontrol Merkezi Butonu */}
        <button
          onClick={() => {
            sound.playClick();
            setIsOpen(true);
          }}
          style={{
            boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)'
          }}
          className="pointer-events-auto p-2 rounded-full bg-black/75 border border-white/20 backdrop-blur-2xl text-white active:scale-95 transition-all shadow-lg flex items-center justify-center"
          title="Ayarlar ve Araçlar Menüsü"
        >
          <Settings className="w-4 h-4 text-sky-400 animate-spin-slow" />
        </button>
      </div>

      {/* 🌟 Açılır Apple VisionOS Mobil Kontrol Merkezi (Action Sheet) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/70 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <div 
            style={{
              boxShadow: '0 -20px 60px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.25)'
            }}
            className="relative z-10 w-full rounded-t-[32px] bg-[#0c0e18]/95 border-t border-white/20 backdrop-blur-3xl p-5 text-white animate-in slide-in-from-bottom duration-300 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
          >
            {/* Tutamaç ve Başlık */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div 
                  style={{ backgroundColor: `${themeAccent}25`, color: themeAccent }}
                  className="w-7 h-7 rounded-xl flex items-center justify-center border border-white/10"
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Hızlı Ayarlar & Araçlar</h3>
                  <p className="text-[10px] text-slate-400">NovaTürk Kontrol Merkezi</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Kontrol Butonları Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold">
              {/* Temalar */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  sound.playClick();
                  if (onOpenThemeSelector) onOpenThemeSelector();
                }}
                className="p-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center gap-3 transition-all active:scale-95"
              >
                <Palette className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="text-left">
                  <span className="block">Cam Temaları</span>
                  <span className="text-[10px] text-slate-400 font-normal">20 Renk & OLED</span>
                </div>
              </button>

              {/* Gece / Gündüz Modu */}
              <button
                onClick={() => {
                  sound.playClick();
                  setIsDark(!isDark);
                }}
                className="p-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center gap-3 transition-all active:scale-95"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div className="text-left">
                  <span className="block">{isDark ? 'Açık Mod' : 'Karanlık Mod'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">Görünüm</span>
                </div>
              </button>

              {/* CyberVPN */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  sound.playClick();
                  if (onOpenVpnModal) onOpenVpnModal();
                }}
                className="p-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center gap-3 transition-all active:scale-95"
              >
                <Globe className={`w-4 h-4 shrink-0 ${isVpnActive ? 'text-cyan-400 animate-spin-slow' : 'text-cyan-400/70'}`} />
                <div className="text-left">
                  <span className="block">CyberVPN</span>
                  <span className="text-[10px] text-slate-400 font-normal">{isVpnActive ? 'Aktif' : 'Tünel'}</span>
                </div>
              </button>

              {/* Tarayıcı Geçmişi */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  sound.playClick();
                  if (onOpenHistory) onOpenHistory();
                }}
                className="p-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center gap-3 transition-all active:scale-95"
              >
                <History className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="text-left">
                  <span className="block">Geçmiş</span>
                  <span className="text-[10px] text-slate-400 font-normal">Ziyaretler</span>
                </div>
              </button>

              {/* SSL ve Kalkan Bilgisi */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  sound.playClick();
                  if (onOpenSecurityModal) onOpenSecurityModal();
                }}
                className="p-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center gap-3 transition-all active:scale-95"
              >
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <span className="block">SSL Güvenlik</span>
                  <span className="text-[10px] text-slate-400 font-normal">256-Bit Kalkan</span>
                </div>
              </button>

              {/* Admin Masası */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  sound.playClick();
                  if (onOpenAdmin) onOpenAdmin();
                }}
                className="p-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center gap-3 transition-all active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-left">
                  <span className="block">Admin Masası</span>
                  <span className="text-[10px] text-slate-400 font-normal">Dizin İstatistik</span>
                </div>
              </button>
            </div>

            {/* Sistem Ayarları Tam Butonu */}
            <button
              onClick={() => {
                setIsOpen(false);
                sound.playClick();
                if (onOpenSettings) onOpenSettings();
              }}
              className="mt-3 w-full py-3 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 font-bold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Tüm Sistem & Tarayıcı Ayarları</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
