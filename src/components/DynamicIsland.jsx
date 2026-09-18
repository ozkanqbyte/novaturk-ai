import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Volume2, VolumeX, Camera, Eye, Columns, Copy, Check, 
  ShieldCheck, Sparkles, ChevronDown, ChevronUp, Clock, Flame, 
  ArrowUp, RefreshCw, Move, EyeOff, Play, Pause, Music, 
  ExternalLink, Search, X, Compass, Globe
} from 'lucide-react';
import { sound } from '../services/soundService';

export default function DynamicIsland({ 
  query, 
  isSearching, 
  sadedeGel, 
  halkNeDiyor, 
  comparison,
  isDark, 
  currentTheme,
  tabs = [],
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onSearch,
  onScrollToTop
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBionicActive, setIsBionicActive] = useState(false);
  const [isSplitActive, setIsSplitActive] = useState(false);
  const [quickSearchText, setQuickSearchText] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // 🌟 Kullanıcı Kapatabilsin / Gizleyebilsin (Sekmeleri kapatmayı önlemek için)
  const [isHidden, setIsHidden] = useState(() => {
    try {
      return localStorage.getItem('novaturk_island_hidden') === 'true';
    } catch {
      return false;
    }
  });

  // 🌟 Sürüklenebilirlik (Draggable) State'i
  // Varsayılan: Ekranın ortasında, sekme çubuğunun hemen altında (top: 56px), sekmeleri kapatmayacak yükseklikte
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('novaturk_island_pos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { x: null, y: 56 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const islandRef = useRef(null);

  // Canlı Saat Güncellemesi
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // 🌟 Sürükleme Başlatıcı
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;

    setIsDragging(true);
    const rect = islandRef.current?.getBoundingClientRect();
    const currentX = rect ? rect.left : (window.innerWidth / 2 - 180);
    const currentY = rect ? rect.top : 56;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: currentX,
      posY: currentY
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      
      const newX = Math.max(10, Math.min(window.innerWidth - 300, dragStartRef.current.posX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        try {
          if (position.x !== null) {
            localStorage.setItem('novaturk_island_pos', JSON.stringify(position));
          }
        } catch {}
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

  const handleToggleHide = (e) => {
    e.stopPropagation();
    sound.playClick();
    const nextHidden = !isHidden;
    setIsHidden(nextHidden);
    try {
      localStorage.setItem('novaturk_island_hidden', String(nextHidden));
    } catch {}
  };

  const handleResetPosition = (e) => {
    e?.stopPropagation();
    sound.playClick();
    const defaultPos = { x: null, y: 56 };
    setPosition(defaultPos);
    try {
      localStorage.removeItem('novaturk_island_pos');
    } catch {}
  };

  // Açık Sekmeler Arasında YouTube veya Medya Çalan Sekmeyi Bul
  const activeMediaTab = tabs.find(t => 
    t.type === 'web' && 
    (t.url?.includes('youtube.com') || t.url?.includes('youtu.be') || t.url?.includes('spotify') || t.title?.toLowerCase().includes('youtube'))
  );

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

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    if (!quickSearchText.trim()) return;
    sound.playChime();
    if (onSearch) {
      onSearch(quickSearchText.trim());
    }
    setQuickSearchText('');
    setIsExpanded(false);
  };

  const themeAccent = currentTheme?.accent || '#38bdf8';

  // 🌟 GİZLENDİĞİNDE: MİNİMAL SAĞ ÜST CAM KAPSÜL
  if (isHidden) {
    return (
      <button
        onClick={handleToggleHide}
        style={{
          boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 15px ${themeAccent}30`
        }}
        className="fixed top-14 right-4 z-[90] flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-2xl bg-black/85 border border-white/20 text-white hover:border-sky-400 hover:scale-105 transition-all duration-300 group shadow-lg cursor-pointer select-none"
        title="Dinamik Adayı Göster"
      >
        <div 
          style={{ backgroundColor: `${themeAccent}25`, color: themeAccent }}
          className="w-4 h-4 rounded-full flex items-center justify-center border border-white/10"
        >
          <Zap className="w-2.5 h-2.5 animate-pulse" />
        </div>
        <span className="text-[11px] font-medium tracking-tight text-white/90">Dinamik Ada</span>
        {activeMediaTab && (
          <span className="flex items-center gap-0.5 ml-0.5">
            <span className="w-1 h-2.5 bg-red-400 animate-pulse rounded-full" />
            <span className="w-1 h-3.5 bg-red-400 animate-pulse delay-75 rounded-full" />
          </span>
        )}
      </button>
    );
  }

  const stylePos = position.x === null 
    ? { top: `${position.y}px`, left: '50%', transform: 'translateX(-50%)' }
    : { top: `${position.y}px`, left: `${position.x}px` };

  return (
    <div 
      ref={islandRef}
      onMouseDown={handleMouseDown}
      style={{ 
        ...stylePos,
        pointerEvents: 'auto',
        touchAction: 'none'
      }}
      className={`fixed z-[95] select-none transition-all ${
        isDragging ? 'cursor-grabbing opacity-90 scale-[1.02]' : 'duration-300'
      }`}
    >
      <div 
        onClick={() => {
          sound.playClick();
          setIsExpanded(!isExpanded);
        }}
        style={{
          boxShadow: isExpanded 
            ? `0 30px 90px -10px rgba(0,0,0,0.95), 0 0 40px ${themeAccent}40, inset 0 1px 1px rgba(255,255,255,0.25)`
            : `0 10px 35px -5px rgba(0,0,0,0.7), 0 0 20px rgba(255,255,255,0.06), inset 0 1px 1px rgba(255,255,255,0.2)`
        }}
        className={`cursor-pointer transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) border backdrop-blur-3xl flex flex-col items-center overflow-hidden ${
          isExpanded 
            ? 'w-[94vw] sm:w-[500px] p-4 rounded-[28px] bg-black/90 border-white/25 text-white' 
            : 'h-10 px-4 rounded-full bg-black/90 border-white/20 text-white hover:border-white/35 hover:scale-[1.02]'
        }`}
      >
        {/* ============================================================ */}
        {/* 1. KAPSÜL / KAPALI HAL (APPLE VISIONOS GLASS NOTCH)          */}
        {/* ============================================================ */}
        <div className="w-full flex items-center justify-between gap-3 h-full">
          
          {/* Sol İkon & Sürükleme Tutamacı */}
          <div className="flex items-center gap-2 shrink-0">
            <div 
              style={{ backgroundColor: `${themeAccent}25`, borderColor: `${themeAccent}50` }}
              className="w-5 h-5 rounded-full border flex items-center justify-center relative shadow-sm"
            >
              <Zap className="w-3 h-3 text-sky-400 fill-current animate-pulse" />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>

            {/* Sürükleme İkonu Göstergesi */}
            <span 
              className="p-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors cursor-grab" 
              title="Adayı Ekranda İstediğin Yere Sürükle"
            >
              <Move className="w-3 h-3" />
            </span>
            
            <span className="text-xs font-bold tracking-tight text-white/95 font-['Outfit',sans-serif] hidden sm:inline">
              NovaTürk
            </span>
          </div>

          {/* Orta Kısım: Sorgu, Durum, Medya veya Karşılama */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-center px-2">
            {activeMediaTab ? (
              <div className="flex items-center gap-2 text-xs font-medium text-red-300 truncate">
                <Music className="w-3.5 h-3.5 text-red-400 shrink-0 animate-bounce" />
                <span className="truncate max-w-[160px] text-white/90 font-medium">
                  {activeMediaTab.title || 'YouTube Çalıyor'}
                </span>
                {/* Canlı Equalizer */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <span className="w-1 h-3 bg-red-400 animate-pulse rounded-full" />
                  <span className="w-1 h-2 bg-red-400 animate-pulse delay-75 rounded-full" />
                  <span className="w-1 h-3.5 bg-red-400 animate-pulse delay-150 rounded-full" />
                </div>
              </div>
            ) : isSearching ? (
              <div className="flex items-center gap-1.5 text-xs text-sky-300 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" />
                <span className="truncate max-w-[160px] font-medium">Taranıyor...</span>
              </div>
            ) : comparison ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                <span className="truncate max-w-[170px]">⚔️ {comparison.entityA.name} vs {comparison.entityB.name}</span>
              </div>
            ) : query ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate max-w-[160px] font-semibold">"{query}"</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Apple VisionOS Ada</span>
              </div>
            )}
          </div>

          {/* Sağ Kısım: Durum, Genişletme & Gizleme Butonu */}
          <div className="flex items-center gap-1 shrink-0">
            {isSpeaking && (
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono">
                <span className="w-1 h-3 bg-emerald-400 animate-pulse rounded-full" />
                <span className="w-1 h-2 bg-emerald-400 animate-pulse delay-75 rounded-full" />
                <span className="w-1 h-3.5 bg-emerald-400 animate-pulse delay-150 rounded-full" />
                <span className="ml-1 hidden sm:inline">Okunuyor</span>
              </div>
            )}

            {/* Genişletme / Küçültme Oku */}
            <div className="p-1 rounded-full hover:bg-white/15 text-slate-300 transition-colors">
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>

            {/* 🌟 Kapatma / Gizleme Butonu (Sekmelerin üstünü asla kapatmasın) */}
            <button
              onClick={handleToggleHide}
              className="p-1 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors ml-0.5"
              title="Adayı Gizle (Sekmeleri Görmek İçin)"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* ============================================================ */}
        {/* 2. GENİŞLETİLMİŞ HAL (APPLE VISIONOS EXPANDED CONTROL CENTER)  */}
        {/* ============================================================ */}
        {isExpanded && (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-full pt-3.5 mt-2.5 border-t border-white/10 space-y-3.5 animate-in fade-in zoom-in-95 duration-200 text-left"
          >
            {/* 🎵 1. APPLE MUSIC & YOUTUBE CANLI MEDYA ÇALAR KARTI */}
            {activeMediaTab ? (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/40 via-red-900/20 to-black/60 border border-red-500/30 backdrop-blur-xl flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4 text-red-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-red-300 tracking-tight flex items-center gap-1.5">
                      <span>YouTube Canlı Müzik</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    </div>
                    <div className="text-xs font-semibold text-white/95 truncate max-w-[240px]">
                      {activeMediaTab.title || 'YouTube Arka Plan Oynatma'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (onSelectTab) onSelectTab(activeMediaTab.id);
                      setIsExpanded(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105"
                    title="Müziğin Çaldığı Sekmeye Git"
                  >
                    <span>Sekmeye Git</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  {onCloseTab && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onCloseTab(activeMediaTab.id);
                      }}
                      className="p-1.5 rounded-xl hover:bg-red-500/20 border border-transparent hover:border-red-500/30 text-slate-400 hover:text-red-300 transition-colors"
                      title="Müzik Sekmesini Kapat"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Hızlı YouTube Müzik Başlat:</span>
                </div>
                <button
                  onClick={() => {
                    sound.playChime();
                    if (onNewTab) onNewTab('https://www.youtube.com');
                    setIsExpanded(false);
                  }}
                  className="px-3 py-1 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
                >
                  ▶ YouTube'u Aç
                </button>
              </div>
            )}

            {/* 🔍 2. DİNAMİK ADA İÇİ HIZLI ARAMA GİRİŞİ */}
            <form onSubmit={handleQuickSearchSubmit} className="relative w-full">
              <input 
                type="text"
                value={quickSearchText}
                onChange={(e) => setQuickSearchText(e.target.value)}
                placeholder="Ada içinden hızlı arama yap..."
                className="w-full pl-9 pr-16 py-2 rounded-2xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-sky-400 focus:bg-white/[0.1] transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
              >
                Ara
              </button>
            </form>

            {/* ⚡ 3. Sadede Gel veya Kafa Kafaya Matris Özeti */}
            {comparison ? (
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200 leading-relaxed">
                <strong className="text-amber-300">⚔️ Kafa Kafaya Matris:</strong> {comparison.entityA.name} ({comparison.entityA.score}) vs {comparison.entityB.name} ({comparison.entityB.score}) • <strong>Öne Çıkan:</strong> {comparison.winnerName}
              </div>
            ) : sadedeGel?.summary ? (
              <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 leading-relaxed line-clamp-3">
                <strong className="text-sky-300">Sadede Gel Özeti:</strong> {sadedeGel.summary}
              </div>
            ) : null}

            {/* 🎛️ 4. HIZLI APPLE AKSİYON BUTONLARI */}
            <div className="grid grid-cols-4 gap-2 pt-0.5">
              
              {/* Sesli Oku */}
              <button
                onClick={handleToggleSpeak}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-[10px] font-medium transition-all ${
                  isSpeaking 
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' 
                    : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Sayfayı Sesli Dinle"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? 'Durdur' : 'Sesli Dinle'}</span>
              </button>

              {/* Biyonik Okuma */}
              <button
                onClick={handleToggleBionic}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-[10px] font-medium transition-all ${
                  isBionicActive 
                    ? 'bg-sky-500 text-white border-sky-400' 
                    : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Biyonik Hızlı Okuma Modu"
              >
                <Eye className="w-4 h-4" />
                <span>{isBionicActive ? 'Biyonik Açık' : 'Biyonik Oku'}</span>
              </button>

              {/* NovaKart */}
              <button
                onClick={handleDownloadNovaKart}
                className="p-2.5 rounded-2xl border bg-white/[0.04] hover:bg-white/[0.09] border-white/10 text-slate-300 hover:text-sky-300 flex flex-col items-center justify-center gap-1.5 text-[10px] font-medium transition-all"
                title="Sosyal Medya NovaKart İndir"
              >
                <Camera className="w-4 h-4 text-sky-400" />
                <span>NovaKart</span>
              </button>

              {/* Ekranı Böl (Split View) */}
              <button
                onClick={handleToggleSplit}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-[10px] font-medium transition-all ${
                  isSplitActive 
                    ? 'bg-purple-500 text-white border-purple-400' 
                    : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Ekranı Böl"
              >
                <Columns className="w-4 h-4" />
                <span>{isSplitActive ? 'Bölmeyi Kapat' : 'Split View'}</span>
              </button>

            </div>

            {/* 📊 5. SİSTEM BİLGİSİ, SAAT & ALT KONTROLLER */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-300 font-mono">
                  <Clock className="w-3 h-3 text-sky-400" /> {currentTime || '12:00'}
                </span>
                <span>•</span>
                <span className="text-slate-300 font-medium">
                  {tabs.length} Sekme Açık
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleResetPosition}
                  className="px-2 py-0.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors text-[10px]"
                  title="Adayı Ekranın Ortasına Geri Getir"
                >
                  Konumu Sıfırla
                </button>
                <button 
                  onClick={handleScrollTopClick}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Sayfa Başına Çık"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    setIsExpanded(false);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
                >
                  Kapat ✕
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
