import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, X, Brain, ArrowRight, Command, Flame, Camera, Image as ImageIcon, Upload } from 'lucide-react';
import { sound } from '../services/soundService';

export default function SearchBar({ 
  onSearch, 
  isCompact = false, 
  isMini = false,
  defaultQuery = '', 
  isDeepSearch, 
  setIsDeepSearch, 
  isDark, 
  currentTheme, 
  autoFocus = false 
}) {
  const [query, setQuery] = useState(defaultQuery);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [lensModalOpen, setLensModalOpen] = useState(false);
  const [lensPreview, setLensPreview] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K or '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        sound.playClick();
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== inputRef.current && !['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) {
        e.preventDefault();
        sound.playClick();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'tr-TR';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        sound.playSearch();
        if (transcript.trim()) {
          onSearch(transcript.trim());
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [onSearch]);

  // 📷 NovaLens: Panodan Görsel Yapıştırma (Ctrl+V) Desteği
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleImageFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setLensPreview(e.target.result);
      setLensModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeAndSearch = () => {
    sound.playSearch();
    setIsAnalyzingImage(true);
    setTimeout(() => {
      setIsAnalyzingImage(false);
      setLensModalOpen(false);
      // Görsel analizi simülasyonu / Akıllı etiket arama
      const cleanFileName = 'Görsel Arama Sonuçları & Benzer Nesneler';
      setQuery(cleanFileName);
      onSearch(cleanFileName);
    }, 1200);
  };

  const toggleVoiceSearch = () => {
    sound.playClick();
    if (!speechSupported) {
      alert('Tarayıcınız sesli aramayı desteklemiyor.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Ses başlatılamadı:', err);
      }
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      sound.playSearch();
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    sound.playClick();
    setQuery('');
    inputRef.current?.focus();
  };

  const handleDeepToggle = () => {
    sound.playClick();
    setIsDeepSearch(!isDeepSearch);
  };

  return (
    <div className={`w-full transition-all duration-300 ${
      isMini ? 'max-w-xl' : isCompact ? 'max-w-2xl' : 'max-w-2xl mx-auto'
    }`}>
      <form onSubmit={handleSubmit} className="relative w-full">
        {/* Apple Dynamic Search Capsule */}
        <div 
          style={{
            borderColor: isFocused ? themeAccent : undefined,
            boxShadow: isFocused 
              ? `0 0 25px ${themeAccent}30, 0 20px 50px rgba(0,0,0,${isDark ? '0.6' : '0.1'})` 
              : undefined
          }}
          className={`apple-search-capsule rounded-full flex items-center transition-all duration-300 ${
            isMini 
              ? 'p-1 sm:p-1.5 gap-1.5 shadow-md' 
              : 'p-2 gap-2.5 shadow-lg'
          }`}
        >
          
          {/* Search Icon */}
          <div 
            style={{ color: isFocused ? themeAccent : undefined }}
            className={`${isMini ? 'pl-2' : 'pl-2.5'} flex items-center justify-center opacity-70 transition-colors`}
          >
            <Search className={isMini ? "w-4 h-4" : "w-5 h-5"} />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isListening 
                ? 'Sizi dinliyorum, konuşun...' 
                : isMini 
                  ? 'NovaTürk Arama...' 
                  : 'NovaTürk ile her şeyi sorun veya webde arayın...'
            }
            className={`w-full bg-transparent font-normal focus:outline-none placeholder:opacity-50 transition-all ${
              isMini ? 'text-xs sm:text-sm py-0.5' : 'text-sm sm:text-base'
            } ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          />

          {/* Apple ⌘K Shortcut Pill */}
          {!query && !isFocused && !isMini && (
            <div className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono select-none border opacity-60 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
            }`}>
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={`${isMini ? 'p-1' : 'p-1.5'} rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity`}
            >
              <X className={isMini ? "w-3.5 h-3.5" : "w-4 h-4"} />
            </button>
          )}

          {/* 📷 NovaLens Butonu (Resimle Arama) */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              fileInputRef.current?.click();
            }}
            title="NovaLens: Görsel ile Ara veya Yapıştır (Ctrl+V)"
            className={`${isMini ? 'p-1.5' : 'p-2'} rounded-full hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-all hover:text-sky-400`}
          >
            <Camera className={isMini ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleImageFile(e.target.files?.[0])} 
            accept="image/*" 
            className="hidden" 
          />

          {/* Voice Search Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoiceSearch}
              title={isListening ? 'Kaydı Durdur' : 'Türkçe Sesli Arama'}
              className={`${isMini ? 'p-1.5' : 'p-2'} rounded-full transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              {isListening ? <MicOff className={isMini ? "w-3.5 h-3.5" : "w-4 h-4"} /> : <Mic className={isMini ? "w-3.5 h-3.5" : "w-4 h-4"} />}
            </button>
          )}

          {/* Deep Search Toggle */}
          {!isMini && (
            <button
              type="button"
              onClick={handleDeepToggle}
              title="Derin Düşünce Modu"
              style={isDeepSearch ? {
                backgroundColor: themeAccent,
                borderColor: themeAccent,
                color: '#ffffff'
              } : {}}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isDeepSearch
                  ? 'font-semibold shadow-sm'
                  : isDark ? 'border-white/10 opacity-70 hover:opacity-100' : 'border-black/10 opacity-70 hover:opacity-100'
              }`}
            >
              <Brain className={`w-3.5 h-3.5 ${isDeepSearch ? 'animate-pulse' : ''}`} />
              <span>Derin</span>
            </button>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            style={{ backgroundColor: themeAccent }}
            className={`${isMini ? 'p-1.5 sm:p-2' : 'p-2.5'} rounded-full text-white shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0`}
          >
            <ArrowRight className={isMini ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </button>

        </div>
      </form>

      {/* 📷 NovaLens Görsel Yükleme / Arama Modalı */}
      {lensModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-black/10 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm">NovaLens • Canlı Görsel Arama</h3>
              </div>
              <button 
                onClick={() => setLensModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 opacity-60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {lensPreview && (
              <div className="rounded-2xl overflow-hidden aspect-video border border-white/10 bg-black/20 flex items-center justify-center relative">
                <img src={lensPreview} alt="NovaLens Önizleme" className="w-full h-full object-contain" />
                {isAnalyzingImage && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-sky-300">Görsel Analiz Ediliyor...</span>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs opacity-70">
              Yüklenen görsel yapay zeka ile taranıp benzer kaynaklar ve ürünler getirilecektir.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setLensModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs opacity-70 hover:opacity-100"
              >
                Vazgeç
              </button>
              <button
                onClick={handleAnalyzeAndSearch}
                disabled={isAnalyzingImage}
                style={{ backgroundColor: themeAccent }}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Görseli Ara</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
