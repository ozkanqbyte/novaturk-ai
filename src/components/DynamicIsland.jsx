import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Volume2, VolumeX, Camera, Eye, Columns, Copy, Check, 
  ShieldCheck, Sparkles, ChevronDown, ChevronUp, Clock, Flame, 
  ArrowUp, RefreshCw, Move, EyeOff, Play, Pause, Music, 
  ExternalLink, Search, X, Compass, Globe, RotateCcw, RotateCw,
  SkipBack, SkipForward
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

  // 🌟 Canlı YouTube Medya Durumu Dinleyicisi
  const [mediaState, setMediaState] = useState(null);

  useEffect(() => {
    const handleMediaUpdate = (e) => {
      if (e.detail) {
        setMediaState(e.detail);
      }
    };
    window.addEventListener('novaturk:media-status-update', handleMediaUpdate);
    return () => window.removeEventListener('novaturk:media-status-update', handleMediaUpdate);
  }, []);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 🌟 Şarkıya / Kapağa Göre Değişen Akışkan Apple Music Cam Mesh Gradienti
  const getMeshGradient = (title) => {
    if (!title) {
      return {
        gradient: 'radial-gradient(circle at 20% 30%, rgba(225, 29, 72, 0.45) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.4) 0%, transparent 65%), rgba(10, 10, 15, 0.95)',
        glowColor: 'rgba(225, 29, 72, 0.4)'
      };
    }
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
    const themes = [
      {
        gradient: 'radial-gradient(circle at 15% 25%, rgba(217, 119, 6, 0.55) 0%, transparent 60%), radial-gradient(circle at 85% 75%, rgba(185, 28, 28, 0.45) 0%, transparent 65%), rgba(18, 12, 10, 0.92)',
        glowColor: 'rgba(217, 119, 6, 0.45)'
      },
      {
        gradient: 'radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.55) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.45) 0%, transparent 65%), rgba(15, 10, 25, 0.92)',
        glowColor: 'rgba(147, 51, 234, 0.45)'
      },
      {
        gradient: 'radial-gradient(circle at 25% 25%, rgba(225, 29, 72, 0.6) 0%, transparent 60%), radial-gradient(circle at 75% 75%, rgba(244, 63, 94, 0.4) 0%, transparent 65%), rgba(20, 8, 14, 0.92)',
        glowColor: 'rgba(225, 29, 72, 0.5)'
      },
      {
        gradient: 'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.5) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(14, 165, 233, 0.45) 0%, transparent 65%), rgba(8, 18, 16, 0.92)',
        glowColor: 'rgba(16, 185, 129, 0.45)'
      },
      {
        gradient: 'radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.55) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(234, 88, 12, 0.4) 0%, transparent 65%), rgba(20, 12, 8, 0.92)',
        glowColor: 'rgba(249, 115, 22, 0.45)'
      }
    ];
    return themes[Math.abs(hash) % themes.length];
  };

  // 🌟 YouTube'a Oynat/Durdur/Sar/Sonraki Komutu Gönder
  const sendMediaCmd = (action, val) => {
    sound.playClick();
    const targetTabId = mediaState?.tabId || activeMediaTab?.id;
    if (targetTabId) {
      window.dispatchEvent(new CustomEvent('novaturk:media-command', {
        detail: { tabId: targetTabId, action, val }
      }));
    }
  };

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
            ? `0 35px 100px -10px rgba(0,0,0,0.95), 0 0 50px ${activeMediaTab ? 'rgba(239,68,68,0.45)' : `${themeAccent}40`}, inset 0 1px 1px rgba(255,255,255,0.3)`
            : activeMediaTab
              ? `0 12px 40px -5px rgba(239,68,68,0.5), 0 0 25px rgba(239,68,68,0.25), inset 0 1px 1px rgba(255,255,255,0.3)`
              : `0 10px 35px -5px rgba(0,0,0,0.7), 0 0 20px rgba(255,255,255,0.06), inset 0 1px 1px rgba(255,255,255,0.2)`
        }}
        className={`cursor-pointer transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) border backdrop-blur-3xl flex flex-col items-center overflow-hidden relative group/island ${
          isExpanded 
            ? 'w-[94vw] sm:w-[500px] p-4 rounded-[32px] bg-black/92 border-white/30 text-white' 
            : activeMediaTab
              ? 'h-11 px-4 rounded-full bg-black/90 border-red-500/40 text-white hover:border-red-400 hover:scale-[1.03]'
              : 'h-10 px-4 rounded-full bg-black/90 border-white/20 text-white hover:border-white/35 hover:scale-[1.02]'
        }`}
      >
        {/* ============================================================ */}
        {/* 1. KAPSÜL / KAPALI HAL (APPLE VISIONOS GLASS NOTCH & MEDIA)  */}
        {/* ============================================================ */}
        <div className="w-full flex items-center justify-between gap-2.5 h-full">
          
          {/* Sol İkon & Sürükleme Tutamacı veya Dönen Mini Plak */}
          <div className="flex items-center gap-2 shrink-0">
            {activeMediaTab ? (
              /* 💿 Dönen Mini Vinil Plak Animasyonu */
              <div 
                className="relative w-6 h-6 rounded-full overflow-hidden border border-red-400/50 shadow-[0_0_12px_rgba(239,68,68,0.6)] shrink-0 animate-spin-slow"
                title={mediaState?.title || "Müzik Çalıyor"}
              >
                {mediaState?.thumbnail ? (
                  <img src={mediaState.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center">
                    <Music className="w-3 h-3 text-white" />
                  </div>
                )}
                {/* Plak Göbeği */}
                <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-black border border-white/60" />
              </div>
            ) : (
              <div 
                style={{ backgroundColor: `${themeAccent}25`, borderColor: `${themeAccent}50` }}
                className="w-5 h-5 rounded-full border flex items-center justify-center relative shadow-sm"
              >
                <Zap className="w-3 h-3 text-sky-400 fill-current animate-pulse" />
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
            )}

            {/* Sürükleme İkonu */}
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

          {/* Orta Kısım: ÇALAN ŞARKININ GERÇEK ADI VEYA DURUM */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-center px-1">
            {activeMediaTab ? (() => {
              const displaySong = (mediaState?.title && mediaState.title !== 'www.youtube.com' && mediaState.title !== 'YouTube')
                ? mediaState.title
                : (activeMediaTab.title && activeMediaTab.title !== 'www.youtube.com' ? activeMediaTab.title : 'YouTube Canlı Müzik');

              return (
                <div className="flex items-center gap-2 min-w-0 max-w-[210px] sm:max-w-[280px]">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0" />
                  <span className="text-xs font-semibold text-white tracking-tight truncate drop-shadow-sm">
                    {displaySong}
                  </span>
                </div>
              );
            })() : isSearching ? (
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

          {/* Sağ Kısım: Canlı 4-Bar Equalizer, Hızlı Oynat/Durdur, Genişletme & Gizleme */}
          <div className="flex items-center gap-1.5 shrink-0">
            {activeMediaTab && (
              <>
                {/* 🎶 Canlı Apple 4-Bar Ses Dalgaları (Equalizer) */}
                <div className="flex items-end gap-0.5 h-4 px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                  <span className="w-1 bg-red-400 rounded-full animate-eq-1" />
                  <span className="w-1 bg-rose-400 rounded-full animate-eq-2" />
                  <span className="w-1 bg-amber-400 rounded-full animate-eq-3" />
                  <span className="w-1 bg-red-400 rounded-full animate-eq-4" />
                </div>

                {/* ⏯️ Kompakt Notch Hızlı Oynat / Durdur Butonu */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sendMediaCmd('toggle');
                  }}
                  className="p-1 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all hover:scale-110 active:scale-90"
                  title={mediaState?.paused ? "Oynat" : "Duraklat"}
                >
                  {mediaState?.paused ? (
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  ) : (
                    <Pause className="w-2.5 h-2.5 fill-current" />
                  )}
                </button>
              </>
            )}

            {isSpeaking && !activeMediaTab && (
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
            {/* 🎵 1. APPLE MUSIC & VISIONOS DİNAMİK MESH GRADIENT MÜZİK ÇALAR KARTI */}
            {activeMediaTab ? (() => {
              const currentTitle = mediaState?.title || activeMediaTab.title || 'YouTube Çalıyor';
              const currentArtist = mediaState?.artist || 'YouTube Müzik';
              const currentThumbnail = mediaState?.thumbnail;
              const isPaused = mediaState ? mediaState.paused : false;
              const currentTimeVal = mediaState?.currentTime || 0;
              const durationVal = mediaState?.duration || 1;
              const progressPct = Math.min(100, Math.max(0, (currentTimeVal / (durationVal || 1)) * 100));
              const mesh = getMeshGradient(currentTitle);

              return (
                <div 
                  style={{
                    background: mesh.gradient,
                    boxShadow: `0 20px 50px -10px ${mesh.glowColor}, inset 0 1px 2px rgba(255,255,255,0.25)`
                  }}
                  className="p-4 rounded-3xl border border-white/20 backdrop-blur-3xl flex flex-col gap-3.5 transition-all duration-500 shadow-2xl relative overflow-hidden"
                >
                  {/* Üst Kısım: Albüm Kapağı, Şarkı Adı ve Sekmeye Git */}
                  <div className="flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Albüm Kapağı / Thumbnail */}
                      <div className="relative group/cover shrink-0">
                        {currentThumbnail ? (
                          <img 
                            src={currentThumbnail} 
                            alt="" 
                            className="w-14 h-14 rounded-2xl object-cover border border-white/25 shadow-lg shadow-black/60"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
                            <Music className="w-7 h-7 text-white/80" />
                          </div>
                        )}
                        {!isPaused && (
                          <div className="absolute inset-0 rounded-2xl bg-black/35 backdrop-blur-[1px] flex items-center justify-center">
                            {/* Animated Mini Equalizer */}
                            <div className="flex items-end gap-0.5 h-4">
                              <span className="w-1 h-4 bg-white animate-pulse rounded-full" />
                              <span className="w-1 h-2 bg-white animate-pulse delay-100 rounded-full" />
                              <span className="w-1 h-3.5 bg-white animate-pulse delay-200 rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Şarkı & Sanatçı Başlığı */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/70 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                          <span>YouTube Canlı Çalar</span>
                        </div>
                        <h4 className="text-sm font-bold text-white tracking-tight truncate max-w-[230px] drop-shadow-sm">
                          {currentTitle}
                        </h4>
                        <p className="text-xs text-white/75 truncate max-w-[210px] font-medium">
                          {currentArtist}
                        </p>
                      </div>
                    </div>

                    {/* Sağ Üst Kısayollar */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          sound.playClick();
                          if (onSelectTab) onSelectTab(activeMediaTab.id);
                          setIsExpanded(false);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105"
                        title="YouTube Sekmesine Git"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      {onCloseTab && (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onCloseTab(activeMediaTab.id);
                          }}
                          className="p-1.5 rounded-xl hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                          title="Müziği Kapat"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 🌟 İNTERAKTİF SÜRE ÇUBUĞU (SCRUBBER BAR) */}
                  <div className="flex flex-col gap-1.5 relative z-10 pt-1">
                    <div 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                        const pct = clickX / rect.width;
                        const targetTime = Math.floor(pct * (durationVal || 1));
                        sendMediaCmd('seek', targetTime);
                      }}
                      className="w-full h-2 rounded-full bg-white/20 hover:h-2.5 transition-all cursor-pointer relative group flex items-center"
                      title="İstediğin saniyeye sar"
                    >
                      {/* Dolan Kısım */}
                      <div 
                        style={{ width: `${progressPct}%` }}
                        className="h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] relative"
                      >
                        {/* Apple Scrubber Knob */}
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md scale-0 group-hover:scale-100 transition-transform -mr-1.5" />
                      </div>
                    </div>

                    {/* Zaman Göstergesi */}
                    <div className="flex items-center justify-between text-[11px] font-mono font-medium text-white/80 px-0.5">
                      <span>{formatTime(currentTimeVal)}</span>
                      <span>{formatTime(durationVal)}</span>
                    </div>
                  </div>

                  {/* 🌟 APPLE VISIONOS MEDYA KONTROL TUŞLARI */}
                  <div className="flex items-center justify-center gap-3 relative z-10 pt-1">
                    {/* 10 Saniye Geri */}
                    <button
                      onClick={() => sendMediaCmd('seekDelta', -10)}
                      className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 hover:text-white transition-all hover:scale-110 active:scale-95"
                      title="10 Saniye Geri Sar"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Önceki Şarkı */}
                    <button
                      onClick={() => sendMediaCmd('prev')}
                      className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white hover:text-white transition-all hover:scale-110 active:scale-95"
                      title="Önceki Şarkı / Başa Sar"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    {/* ⏯️ BÜYÜK APPLE CAM OYNAT / DURDUR BUTONU */}
                    <button
                      onClick={() => sendMediaCmd('toggle')}
                      style={{
                        boxShadow: '0 8px 25px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.6)'
                      }}
                      className="p-4 rounded-full bg-white text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer flex items-center justify-center group"
                      title={isPaused ? "Oynat" : "Duraklat"}
                    >
                      {isPaused ? (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      ) : (
                        <Pause className="w-5 h-5 fill-current" />
                      )}
                    </button>

                    {/* ⏭️ SONRAKİ ŞARKIYA GEÇİŞ (BAŞA SARMAMA GARANTİLİ) */}
                    <button
                      onClick={() => sendMediaCmd('next')}
                      className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white hover:text-white transition-all hover:scale-110 active:scale-95"
                      title="Sonraki Şarkıya Geç"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    {/* 10 Saniye İleri */}
                    <button
                      onClick={() => sendMediaCmd('seekDelta', 10)}
                      className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 hover:text-white transition-all hover:scale-110 active:scale-95"
                      title="10 Saniye İleri Sar"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })() : (
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
