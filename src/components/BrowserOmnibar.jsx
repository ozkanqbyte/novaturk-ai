import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, ArrowRight, RotateCw, Home, Lock, ShieldCheck, 
  Star, Search, Globe, BookOpen, ExternalLink, X, Mic, Sparkles, EyeOff, History
} from 'lucide-react';
import { sound } from '../services/soundService';
import OmnibarHistoryDropdown from './OmnibarHistoryDropdown';
import { getHistory, removeHistoryItem, clearAllHistory } from '../services/historyService';
import { getAdBlockStats } from '../services/adBlockerService';

const isElectronApp = () => {
  return typeof navigator !== 'undefined' && /electron/i.test(navigator.userAgent);
};

export default function BrowserOmnibar({
  activeTab,
  onNavigate,
  onGoBack,
  onGoForward,
  canGoBack = true,
  canGoForward = false,
  onReload,
  onHome,
  isBookmarked,
  onToggleBookmark,
  onOpenSecurityModal,
  onOpenAdBlockerModal,
  onOpenVpnModal,
  onOpenHistory,
  isVpnActive = false,
  selectedVpnCountry = 'DE',
  viewMode = 'iframe',
  onToggleViewMode,
  isDark,
  currentTheme,
  isDeepSearch,
  setIsDeepSearch
}) {
  const isElectron = isElectronApp();
  const inputRef = useRef(null);

  // Sekme değiştiğinde Omnibar input değerini güncelle
  const [inputVal, setInputVal] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  // 🌟 Google Tarzı Arama & Ziyaret Geçmişi
  const [historyList, setHistoryList] = useState(() => getHistory());

  const handleRemoveHistory = (id) => {
    const updated = removeHistoryItem(id);
    setHistoryList(updated);
  };

  const handleClearHistory = () => {
    const updated = clearAllHistory();
    setHistoryList(updated);
  };

  useEffect(() => {
    if (activeTab?.type === 'web' && activeTab?.url) {
      setInputVal(activeTab.url);
    } else if (activeTab?.query) {
      setInputVal(activeTab.query);
    } else {
      setInputVal('');
    }
  }, [activeTab?.id, activeTab?.url, activeTab?.query, activeTab?.type]);

  // Kısayol: Ctrl+L veya Alt+D adres çubuğuna odaklanır
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const val = inputVal.trim();
    if (!val) return;
    sound.playClick();
    onNavigate(val);
  };

  // Sesli Arama (Speech Recognition)
  const handleVoiceSearch = () => {
    sound.playClick();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tarayıcınız sesli aramayı desteklemiyor.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(transcript);
        setIsListening(false);
        sound.playChime();
        onNavigate(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  return (
    <div className={`hidden md:flex w-full px-3 py-1.5 items-center justify-between gap-2.5 border-b shrink-0 z-20 transition-all select-none ${
      isDark 
        ? 'bg-[#12151e] border-white/10 text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.4)]' 
        : 'bg-[#f4f6fa] border-black/10 text-slate-800 shadow-sm'
    }`}>
      
      {/* 1. Sol Taraf Navigasyon Kontrolleri: Geri, İleri, Yenile, Ana Sayfa */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onGoBack}
          disabled={!canGoBack}
          className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-inherit opacity-80 hover:opacity-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          title="Bir Adım Geri Git (Alt + Sol Ok)"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onGoForward}
          disabled={!canGoForward}
          className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-inherit opacity-80 hover:opacity-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          title="Bir Adım İleri Git (Alt + Sağ Ok)"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onReload}
          className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-inherit opacity-80 hover:opacity-100 cursor-pointer"
          title="Sayfayı Yenile (Ctrl + R / F5)"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          onClick={onHome}
          className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-inherit opacity-80 hover:opacity-100 cursor-pointer ml-0.5"
          title="Yeni Sekme / Ana Sayfa"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Merkezi Akıllı Adres & Arama Çubuğu (Omnibar) */}
      <div className="flex-1 relative">
        <form 
          onSubmit={handleSubmit}
          className={`w-full flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border transition-all ${
            activeTab?.isIncognito
              ? isFocused
                ? 'bg-black/90 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.35)]'
                : 'bg-purple-950/20 border-purple-500/35 hover:border-purple-500/50'
              : isFocused 
                ? isDark 
                  ? 'bg-black/80 border-sky-500/80 shadow-[0_0_20px_rgba(56,189,248,0.25)]' 
                  : 'bg-white border-sky-500 shadow-[0_0_20px_rgba(2,132,199,0.2)]'
                : isDark 
                  ? 'bg-black/45 border-white/10 hover:border-white/20' 
                  : 'bg-white/90 border-black/10 hover:border-black/20 shadow-xs'
          }`}
        >
          {/* Ajan Modu Rozeti (Gizli Sekmede Görünür) */}
          {activeTab?.isIncognito && (
            <div className="flex items-center gap-1 px-2 py-0.5 -ml-1 rounded-lg bg-purple-500/25 border border-purple-500/40 text-purple-300 text-[10px] font-black tracking-wider uppercase shrink-0 shadow-xs">
              <EyeOff className="w-3 h-3 text-purple-400" />
              <span className="hidden sm:inline">AJAN</span>
            </div>
          )}

          {/* SSL Kilit Butonu (Tıklanınca Sertifika Paneli Açılır) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              sound.playClick();
              if (onOpenSecurityModal) onOpenSecurityModal();
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 -ml-1.5 rounded-lg hover:bg-white/15 text-emerald-400 transition-colors cursor-pointer shrink-0"
            title="Site Güvenliği ve SSL Sertifikasını Görüntüle"
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-sans font-bold hidden md:inline">Güvenli</span>
          </button>

          {/* Input Kutusu */}
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setHistoryList(getHistory());
            }}
            onBlur={() => {
              // Kısa gecikme ile menü içi tıklamalara izin ver
              setTimeout(() => setIsFocused(false), 200);
            }}
            placeholder="Google veya bir web adresi yazın ya da arayın (örn: youtube.com, hava durumu)..."
            className="w-full bg-transparent border-none outline-none font-mono text-xs text-inherit placeholder:opacity-40 placeholder:font-sans"
          />

          {/* Temizle Butonu (x) */}
          {inputVal && (
            <button
              type="button"
              onClick={() => { setInputVal(''); inputRef.current?.focus(); }}
              className="p-1 rounded-md hover:bg-white/15 opacity-50 hover:opacity-100 transition-colors shrink-0"
              title="Temizle"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Sesli Arama Butonu */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`p-1 rounded-lg transition-all shrink-0 cursor-pointer ${
              isListening ? 'text-rose-400 animate-pulse bg-rose-500/20' : 'opacity-60 hover:opacity-100 hover:text-sky-400'
            }`}
            title={isListening ? "Dinleniyor... Konuşun" : "Sesli Arama Yap (🎙️)"}
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          {/* 🌟 Reklam Engelleyici Kalkan Rozeti (Tıklanınca Canlı HUD Açılır) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              sound.playClick();
              if (onOpenAdBlockerModal) onOpenAdBlockerModal();
              else if (onOpenSecurityModal) onOpenSecurityModal();
            }}
            className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-sans font-bold shrink-0 border border-emerald-500/30 hidden lg:inline-flex items-center gap-1.5 transition-all shadow-xs hover:scale-105 cursor-pointer"
            title="NovaTürk Reklam & Takipçi Kalkanı (Tıkla)"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Kalkan Ultra</span>
          </button>

          {/* 🌟 NovaTürk CyberVPN & Gizlilik Rozeti */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              sound.playClick();
              if (onOpenVpnModal) onOpenVpnModal();
            }}
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-sans font-bold shrink-0 border hidden md:inline-flex items-center gap-1.5 transition-all shadow-xs hover:scale-105 cursor-pointer ${
              isVpnActive 
                ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]' 
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
            }`}
            title="NovaTürk CyberVPN & Gizlilik (Tıkla)"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isVpnActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>{isVpnActive ? `VPN: ${selectedVpnCountry}` : 'VPN'}</span>
          </button>

          {/* 🕒 Gelişmiş Tarayıcı Geçmişi (Ctrl + H) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              sound.playChime();
              if (onOpenHistory) onOpenHistory();
            }}
            className="p-1 rounded-lg transition-all shrink-0 cursor-pointer opacity-50 hover:opacity-100 hover:text-sky-400"
            title="Gelişmiş Tarayıcı Geçmişi (Ctrl + H)"
          >
            <History className="w-3.5 h-3.5" />
          </button>

          {/* ⭐ 1-Tıkla Yer İmlerine Ekle */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              sound.playChime();
              if (onToggleBookmark) {
                onToggleBookmark();
              }
            }}
            className={`p-1 rounded-lg transition-all shrink-0 cursor-pointer ${
              isBookmarked 
                ? 'text-amber-400 scale-110' 
                : 'opacity-50 hover:opacity-100 hover:text-amber-400'
            }`}
            title={isBookmarked ? "Yer İmlerinden Kaldır" : "Yer İmlerine / Kısayollara Ekle (⭐)"}
          >
            <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </form>

        {/* 🌟 GOOGLE CHROME TARZI ARAMA & ZİYARET GEÇMİŞİ AÇILIR MENÜSÜ */}
        <OmnibarHistoryDropdown 
          isOpen={isFocused && !activeTab?.isIncognito}
          onClose={() => setIsFocused(false)}
          inputVal={inputVal}
          history={historyList}
          onSelectSearch={(txt) => {
            setInputVal(txt);
            setIsFocused(false);
            onNavigate(txt);
          }}
          onSelectVisit={(url) => {
            setInputVal(url);
            setIsFocused(false);
            onNavigate(url);
          }}
          onRemoveItem={handleRemoveHistory}
          onClearAll={handleClearHistory}
          isDark={isDark}
        />
      </div>

      {/* 3. Sağ Taraf: Web Görünüm Modu / Derin Düşünce / Dış Bağlantı */}
      <div className="flex items-center gap-1.5 shrink-0">
        
        {/* Derin Düşünce Modu Toggle */}
        {setIsDeepSearch && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsDeepSearch(!isDeepSearch);
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isDeepSearch 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm' 
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            title="Derin Düşünce: 4 Ajanlı Analiz Modu"
          >
            <Sparkles className={`w-3 h-3 ${isDeepSearch ? 'text-purple-400 animate-spin-slow' : ''}`} />
            <span className="hidden xl:inline text-[11px]">Derin Düşünce</span>
          </button>
        )}

        {/* Eğer Web Sekmesindeysek: Canlı Web / Saf Okuyucu ve Dış Sekme */}
        {activeTab?.type === 'web' && (
          <>
            <div className={`flex p-0.5 rounded-xl border ${isDark ? 'bg-black/40 border-white/10' : 'bg-black/5 border-black/10'}`}>
              <button
                onClick={() => onToggleViewMode && onToggleViewMode('iframe')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'iframe' 
                    ? 'bg-sky-500 text-white shadow-sm' 
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Canlı Web Çerçevesi"
              >
                <Globe className="w-3 h-3" />
                <span className="hidden md:inline text-[11px]">Canlı</span>
              </button>

              <button
                onClick={() => onToggleViewMode && onToggleViewMode('reader')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'reader' 
                    ? 'bg-sky-500 text-white shadow-sm' 
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Saf Okuyucu Modu (Reklamsız Arındırılmış)"
              >
                <BookOpen className="w-3 h-3" />
                <span className="hidden md:inline text-[11px]">Okuyucu</span>
              </button>
            </div>

            <a
              href={activeTab.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-sky-400 cursor-pointer"
              title="Dış Tarayıcıda Aç (Chrome/Edge)"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </>
        )}
      </div>

    </div>
  );
}
