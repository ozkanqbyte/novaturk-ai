import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Zap, HardDrive, EyeOff, 
  Sparkles, CheckCircle2, X, RefreshCw, Layers, Lock
} from 'lucide-react';
import { sound } from '../services/soundService';
import { 
  getAdBlockStats, saveAdBlockStats, toggleSiteShield, isSiteShieldActive 
} from '../services/adBlockerService';

export default function AdBlockerModal({ isOpen, onClose, currentUrl, isDark }) {
  if (!isOpen) return null;

  const [stats, setStats] = useState(() => getAdBlockStats());

  let hostname = 'novaturk.ai';
  try {
    if (currentUrl) hostname = new URL(currentUrl).hostname;
  } catch {}

  const isCurrentSiteShielded = isSiteShieldActive(hostname);

  const handleToggleCurrentSite = () => {
    sound.playChime();
    const updated = toggleSiteShield(hostname);
    setStats(updated);
  };

  const handleToggleOption = (key) => {
    sound.playClick();
    const updated = { ...stats, [key]: !stats[key] };
    saveAdBlockStats(updated);
    setStats(updated);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xl animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 relative ${
          isDark 
            ? 'bg-[#0f121a]/95 border-emerald-500/25 text-slate-100 shadow-[0_20px_60px_rgba(16,185,129,0.15)]' 
            : 'bg-white/95 border-emerald-500/20 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Holographic Glowing Aurora Orbs */}
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-sky-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* 1. Header Bar */}
        <div className={`p-5 flex items-center justify-between border-b ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-['Outfit',sans-serif] tracking-tight">
                  NovaTürk Reklam & Takipçi Kalkanı
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ULTRA v3.0
                </span>
              </div>
              <p className="text-xs opacity-60 font-mono mt-0.5">{hostname}</p>
            </div>
          </div>

          <button 
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-1.5 rounded-xl hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Havalı Fütüristik Canlı Sayaçlar ve Radar HUD */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Sitede Kalkan Aç/Kapa Ana Şalteri */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
            isCurrentSiteShielded 
              ? isDark 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-emerald-50/80 border-emerald-500/30'
              : 'bg-white/[0.02] border-white/10 opacity-60'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full ${isCurrentSiteShielded ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
              <div>
                <p className="text-xs font-bold font-['Outfit',sans-serif]">
                  {isCurrentSiteShielded ? 'Bu Sitede Kalkan Tam Güçle Aktif' : 'Bu Sitede Kalkan Devre Dışı'}
                </p>
                <p className="text-[11px] opacity-70">
                  {isCurrentSiteShielded ? 'Reklamlar, video araları ve botlar otomatik temizleniyor' : 'Reklam filtrelemesi durduruldu'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleCurrentSite}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                isCurrentSiteShielded 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-400' 
                  : 'bg-slate-600 text-white hover:bg-slate-500'
              }`}
            >
              {isCurrentSiteShielded ? 'AÇIK ✓' : 'KAPALI'}
            </button>
          </div>

          {/* 4 Canlı HUD Kartı: Engellenen, Sponsor Atlanan, Hız, Veri */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Kart 1: Engellenen */}
            <div className={`p-3 rounded-2xl border flex flex-col items-center text-center relative overflow-hidden ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100/70 border-black/5'
            }`}>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-1.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                {stats.totalBlocked}
              </span>
              <span className="text-[10px] opacity-60 leading-tight mt-0.5">
                Engellenen Reklam
              </span>
            </div>

            {/* Kart 2: Sponsor Atlayıcı */}
            <div className={`p-3 rounded-2xl border flex flex-col items-center text-center relative overflow-hidden ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100/70 border-black/5'
            }`}>
              <div className="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-1.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg sm:text-xl font-bold font-mono text-rose-400">
                {stats.sponsorSkippedCount || 8}
              </span>
              <span className="text-[10px] opacity-60 leading-tight mt-0.5">
                Atlanan Sponsor
              </span>
            </div>

            {/* Kart 3: Hızlandırma */}
            <div className={`p-3 rounded-2xl border flex flex-col items-center text-center relative overflow-hidden ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100/70 border-black/5'
            }`}>
              <div className="w-7 h-7 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-1.5">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-lg sm:text-xl font-bold font-mono text-sky-400">
                +{stats.timeSavedSeconds}s
              </span>
              <span className="text-[10px] opacity-60 leading-tight mt-0.5">
                Kazanılan Hız
              </span>
            </div>

            {/* Kart 4: Veri Tasarrufu */}
            <div className={`p-3 rounded-2xl border flex flex-col items-center text-center relative overflow-hidden ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100/70 border-black/5'
            }`}>
              <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-1.5">
                <HardDrive className="w-4 h-4" />
              </div>
              <span className="text-lg sm:text-xl font-bold font-mono text-purple-400">
                {stats.bandwidthSavedMB} MB
              </span>
              <span className="text-[10px] opacity-60 leading-tight mt-0.5">
                Kota Tasarrufu
              </span>
            </div>
          </div>

          {/* 3. Katmanlı Koruma Özellikleri */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold tracking-wider uppercase opacity-50 px-1">
              Gelişmiş Koruma Katmanları
            </h4>

            <div className={`rounded-2xl border divide-y overflow-hidden text-xs ${
              isDark ? 'border-white/10 divide-white/10 bg-white/[0.02]' : 'border-black/5 divide-black/5 bg-slate-50/50'
            }`}>
              {/* Katman 1: YouTube Sponsor Atlayıcı (SponsorBlock) */}
              <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5"
                   onClick={() => {
                     sound.playSponsorSkip();
                     handleToggleOption('sponsorBlock');
                   }}>
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold">YouTube Sponsor Atlayıcı (SponsorBlock)</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">VİRAL</span>
                    </div>
                    <p className="text-[11px] opacity-60">Videolardaki Youtuber tanıtımlarını ve sponsorları otomatik atlar</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                  stats.sponsorBlock !== false ? 'text-rose-400 bg-rose-500/15' : 'text-slate-400 bg-slate-500/15'
                }`}>
                  {stats.sponsorBlock !== false ? 'AÇIK' : 'KAPALI'}
                </span>
              </div>

              {/* Katman 2: Fütüristik Kalkan Zırhı Ses Efektleri */}
              <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5"
                   onClick={() => {
                     sound.playShieldDeflect();
                     handleToggleOption('soundEffects');
                   }}>
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold">Kalkan Zırhı Ses Efektleri</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300">SCI-FI</span>
                    </div>
                    <p className="text-[11px] opacity-60">Reklam ve takipçi püskürtüldüğünde fütüristik kalkan yansıma sesi çalar</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                  stats.soundEffects !== false ? 'text-sky-400 bg-sky-500/15' : 'text-slate-400 bg-slate-500/15'
                }`}>
                  {stats.soundEffects !== false ? 'AÇIK' : 'KAPALI'}
                </span>
              </div>

              {/* Katman 3: YouTube & Video Reklamları */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold">YouTube & Video Reklam Engelleyici</p>
                    <p className="text-[11px] opacity-60">Video başı ve video arası reklamları sessizce atlar</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-1 rounded-lg">
                  AKTİF
                </span>
              </div>

              {/* Katman 4: Açılır Pencereler (Pop-up) */}
              <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5"
                   onClick={() => handleToggleOption('blockPopups')}>
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <p className="font-semibold">Agresif Pop-up ve Yönlendirme Kalkanı</p>
                    <p className="text-[11px] opacity-60">İzinsiz açılan yeni sekmeleri ve sahte bildirimleri keser</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                  stats.blockPopups ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400 bg-slate-500/15'
                }`}>
                  {stats.blockPopups ? 'AÇIK' : 'KAPALI'}
                </span>
              </div>

              {/* Katman 5: İzleyiciler ve Çerezler */}
              <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5"
                   onClick={() => handleToggleOption('blockTrackers')}>
                <div className="flex items-center gap-2.5">
                  <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-semibold">Kişisel Gizlilik ve İzleyici Kalkanı</p>
                    <p className="text-[11px] opacity-60">Google, Meta ve veri takipçilerinin parmak izinizi almasını önler</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                  stats.blockTrackers ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400 bg-slate-500/15'
                }`}>
                  {stats.blockTrackers ? 'AÇIK' : 'KAPALI'}
                </span>
              </div>

              {/* Katman 6: Kripto Madencilik */}
              <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5"
                   onClick={() => handleToggleOption('blockCryptoMiners')}>
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <p className="font-semibold">Kripto Madencilik & Zararlı Kod Savunması</p>
                    <p className="text-[11px] opacity-60">İşlemcinizi gizlice kullanan madenci betiklerini durdurur</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                  stats.blockCryptoMiners ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400 bg-slate-500/15'
                }`}>
                  {stats.blockCryptoMiners ? 'AÇIK' : 'KAPALI'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-slate-50/50'
        }`}>
          <span className="text-[11px] opacity-40 font-mono">
            NovaTürk Reklamsız Hız Motoru
          </span>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg transition-all hover:scale-105 cursor-pointer"
          >
            Kalkanı Koru
          </button>
        </div>
      </div>
    </div>
  );
}
