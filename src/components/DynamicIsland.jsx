import React, { useState, useEffect } from 'react';
import { 
  Zap, Volume2, VolumeX, Camera, Eye, Columns, Copy, Check, 
  ShieldCheck, Sparkles, ChevronDown, ChevronUp, Clock, Flame, ArrowUp, RefreshCw
} from 'lucide-react';
import { sound } from '../services/soundService';

export default function DynamicIsland({ 
  query, 
  isSearching, 
  sadedeGel, 
  halkNeDiyor, 
  isDark, 
  currentTheme,
  onScrollToTop
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBionicActive, setIsBionicActive] = useState(false);
  const [isSplitActive, setIsSplitActive] = useState(false);

  // Arama yapıldığında adayı kısa süreliğine canlandır (Pulsing expansion)
  useEffect(() => {
    if (query) {
      setIsExpanded(true);
      const timer = setTimeout(() => setIsExpanded(false), 2800);
      return () => clearTimeout(timer);
    }
  }, [query]);

  // HybridResults durumlarını dinle (Çift yönlü senkronizasyon)
  useEffect(() => {
    const handleSpeakingChange = (e) => setIsSpeaking(!!e.detail?.isSpeaking);
    const handleBionicChange = (e) => setIsBionicActive(!!e.detail?.isBionic);
    const handleSplitChange = (e) => setIsSplitActive(!!e.detail?.isSplit);

    window.addEventListener('novaturk:speaking-change', handleSpeakingChange);
    window.addEventListener('novaturk:bionic-change', handleBionicChange);
    window.addEventListener('novaturk:split-change', handleSplitChange);

    return () => {
      window.removeEventListener('novaturk:speaking-change', handleSpeakingChange);
      window.removeEventListener('novaturk:bionic-change', handleBionicChange);
      window.removeEventListener('novaturk:split-change', handleSplitChange);
    };
  }, []);

  const handleToggleSpeak = (e) => {
    e.stopPropagation();
    sound.playClick();
    window.dispatchEvent(new CustomEvent('novaturk:toggle-speak'));
  };

  const handleDownloadNovaKart = (e) => {
    e.stopPropagation();
    sound.playClick();
    window.dispatchEvent(new CustomEvent('novaturk:download-novakart'));
  };

  const handleToggleBionic = (e) => {
    e.stopPropagation();
    sound.playClick();
    window.dispatchEvent(new CustomEvent('novaturk:toggle-bionic'));
  };

  const handleToggleSplit = (e) => {
    e.stopPropagation();
    sound.playClick();
    window.dispatchEvent(new CustomEvent('novaturk:toggle-split'));
  };

  const handleScrollTopClick = (e) => {
    e.stopPropagation();
    sound.playClick();
    if (onScrollToTop) {
      onScrollToTop();
    } else {
      const el = document.querySelector('.overflow-y-auto');
      if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const themeAccent = currentTheme?.accent || '#38bdf8';

  return (
    <div 
      className="fixed top-1.5 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out select-none"
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        onClick={() => {
          sound.playClick();
          setIsExpanded(!isExpanded);
        }}
        style={{
          boxShadow: isExpanded 
            ? `0 25px 80px -10px rgba(0,0,0,0.95), 0 0 35px ${themeAccent}40`
            : '0 8px 30px -5px rgba(0,0,0,0.7), 0 0 15px rgba(255,255,255,0.05)'
        }}
        className={`cursor-pointer transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) border backdrop-blur-2xl flex flex-col items-center overflow-hidden ${
          isExpanded 
            ? 'w-[94vw] sm:w-[480px] p-4 rounded-[28px] bg-[#000000]/95 border-white/25 text-white' 
            : 'h-8 px-3.5 rounded-full bg-[#000000]/95 border-white/20 text-white hover:border-sky-400/60 hover:scale-[1.03]'
        }`}
      >
        {/* ============================================================ */}
        {/* 1. KAPSÜL / KAPALI HAL (APPLE DYNAMIC ISLAND COMPACT NOTCH)  */}
        {/* ============================================================ */}
        <div className="w-full flex items-center justify-between gap-3 h-full">
          
          {/* Sol İkon & Canlı Durum */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-4 h-4 rounded-full bg-sky-500/20 border border-sky-400/50 flex items-center justify-center relative">
              <Zap className="w-2.5 h-2.5 text-sky-400 fill-current animate-pulse" />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            
            <span className="text-[11px] font-bold tracking-tight text-white/90 font-['Outfit',sans-serif] hidden sm:inline">
              NovaTürk Ada
            </span>
          </div>

          {/* Orta Kısım: Sorgu, Durum veya Karşılama */}
          <div className="flex items-center gap-2 min-w-0">
            {isSearching ? (
              <div className="flex items-center gap-1.5 text-xs text-sky-300 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" />
                <span className="truncate max-w-[150px] font-medium">Taranıyor...</span>
              </div>
            ) : query ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate max-w-[160px] font-semibold">"{query}"</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Apple Dynamic Ada Devrede</span>
              </div>
            )}
          </div>

          {/* Sağ Kısım: Ses Dalgası & Genişletme Oku */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isSpeaking ? (
              /* Canlı Apple Müzik Tarzı Ses Frekans Dalgaları */
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[9px] font-mono">
                <span className="w-1 h-3 bg-emerald-400 animate-pulse rounded-full" />
                <span className="w-1 h-2 bg-emerald-400 animate-pulse delay-75 rounded-full" />
                <span className="w-1 h-3.5 bg-emerald-400 animate-pulse delay-150 rounded-full" />
                <span className="ml-1 hidden sm:inline">Okunuyor</span>
              </div>
            ) : isBionicActive ? (
              <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[9px] font-mono">
                Biyonik
              </span>
            ) : null}

            <div className="p-0.5 rounded-full hover:bg-white/10 text-slate-400">
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* 2. GENİŞLETİLMİŞ HAL (EXPANDED APPLE ISLAND HUD)              */}
        {/* ============================================================ */}
        {isExpanded && (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-full pt-3 mt-2 border-t border-white/10 space-y-3 animate-in fade-in zoom-in-95 duration-200 text-left"
          >
            {/* Canlı İstatistik Çubuğu */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 50 Türk Kaynağı • Sıfır Reklam
              </span>
              <span className="font-mono text-slate-300">
                ⚡ 0.4s Işık Hızı
              </span>
            </div>

            {/* Sadede Gel Önizleme / Hap Bilgi */}
            {sadedeGel?.summary ? (
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 leading-relaxed line-clamp-3">
                <strong className="text-sky-300">Sadede Gel Özeti:</strong> {sadedeGel.summary}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 leading-relaxed">
                Türkiye'nin reklamsız, bağımsız arama motoru devrede. Ekşi Sözlük, Şikayetvar, DonanımHaber ve 50 seçkin Türk platformu anlık taranıyor.
              </div>
            )}

            {/* Hızlı Aksiyon Butonları (Grid) */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              
              {/* 1. Sesli Dinle */}
              <button
                onClick={handleToggleSpeak}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-all ${
                  isSpeaking 
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Sadede Gel Özeti Sesli Dinle"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? 'Durdur' : 'Sesli Dinle'}</span>
              </button>

              {/* 2. NovaKart İndir */}
              <button
                onClick={handleDownloadNovaKart}
                className="p-2 rounded-xl border bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-sky-300 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-all"
                title="Instagram Story ve X Kartı İndir (1200x680)"
              >
                <Camera className="w-4 h-4 text-sky-400" />
                <span>NovaKart</span>
              </button>

              {/* 3. Biyonik Okuma */}
              <button
                onClick={handleToggleBionic}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-all ${
                  isBionicActive 
                    ? 'bg-sky-500 text-white border-sky-400' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="İlk Yarısı Kalın Hızlı Biyonik Okuma Modu"
              >
                <Eye className="w-4 h-4" />
                <span>{isBionicActive ? 'Biyonik Açık' : 'Biyonik Oku'}</span>
              </button>

              {/* 4. Ekranı Böl (Split View) */}
              <button
                onClick={handleToggleSplit}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-all ${
                  isSplitActive 
                    ? 'bg-purple-500 text-white border-purple-400' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Arc Tarzı Ekranı İkiye Böl (Split View)"
              >
                <Columns className="w-4 h-4" />
                <span>{isSplitActive ? 'Bölmeyi Kapat' : 'Split View'}</span>
              </button>

            </div>

            {/* Alt Kısım: Başa Dön & Küçült */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-slate-400">
              <button 
                onClick={handleScrollTopClick}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <ArrowUp className="w-3 h-3" />
                <span>Sayfa Başına Çık</span>
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  setIsExpanded(false);
                }}
                className="px-2 py-0.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                Kapat ✕
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
