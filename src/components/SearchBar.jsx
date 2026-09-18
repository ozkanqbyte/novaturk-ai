import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, X, Brain, ArrowRight, Command, Flame } from 'lucide-react';
import { sound } from '../services/soundService';
import AutocompleteDropdown from './AutocompleteDropdown';

export default function SearchBar({ onSearch, isCompact = false, defaultQuery = '', isDeepSearch, setIsDeepSearch, isDark, currentTheme }) {
  const [query, setQuery] = useState(defaultQuery);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

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

  const trendingTags = [
    { label: 'Yapay Zeka 2026', query: '2026 Yapay Zeka Devrimi ve Türkiye' },
    { label: 'Borsa İstanbul & BIST', query: 'Borsa İstanbul piyasa analizi' },
    { label: 'TOGG & Yerli İnovasyon', query: 'Türkiye Milli Teknoloji Projeleri' },
    { label: 'Göbeklitepe Son Bulgular', query: 'Göbeklitepe son arkeolojik bulgular' },
  ];

  return (
    <div className={`w-full transition-all duration-300 ${isCompact ? 'max-w-4xl' : 'max-w-2xl mx-auto'}`}>
      <form onSubmit={handleSubmit} className="relative z-[70] w-full">
        {/* Apple VisionOS Minimalist Dynamic Search Capsule */}
        <div 
          style={{
            borderColor: isFocused ? themeAccent : undefined,
            boxShadow: isFocused 
              ? `0 0 25px ${themeAccent}30, 0 20px 50px rgba(0,0,0,${isDark ? '0.6' : '0.1'})` 
              : undefined
          }}
          className="apple-search-capsule rounded-full p-2 flex items-center gap-2.5 transition-all duration-300"
        >
          
          {/* Search Icon with Dynamic Focus Accent */}
          <div 
            style={{ color: isFocused ? themeAccent : undefined }}
            className="pl-2.5 flex items-center justify-center opacity-70 transition-colors"
          >
            <Search className="w-5 h-5" />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            aria-label="Arama sorgusu girin"
            autoFocus={!isCompact}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isListening 
                ? 'Sizi dinliyorum, konuşun...' 
                : 'NovaTürk ile her şeyi sorun veya webde arayın...'
            }
            className={`w-full bg-transparent text-sm sm:text-base font-normal focus:outline-none placeholder:opacity-50 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          />

          {/* Apple ⌘K Shortcut Pill */}
          {!query && !isFocused && (
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
              aria-label="Aramayı temizle"
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Search Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoiceSearch}
              title={isListening ? 'Kaydı Durdur' : 'Türkçe Sesli Arama'}
              aria-label="Sesli arama"
              className={`p-2 rounded-full transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {/* Deep Search Toggle */}
          <button
            type="button"
            onClick={handleDeepToggle}
            title="Derin Düşünce Modu"
            aria-label="Derin araştırma modunu aç/kapat"
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
            <Brain className="w-3.5 h-3.5" />
            <span>Derin Düşünce</span>
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!query.trim()}
            aria-label="Ara"
            style={query.trim() ? {
              backgroundColor: isDark ? '#ffffff' : '#0f172a',
              color: isDark ? '#000000' : '#ffffff'
            } : {}}
            className="apple-primary-btn flex items-center justify-center w-9 h-9 rounded-full shadow-sm disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <AutocompleteDropdown
          query={query}
          isVisible={isFocused && query.trim().length >= 2}
          isDark={isDark}
          currentTheme={currentTheme}
          onSelect={(text) => {
            sound.playClick();
            setQuery(text);
            setIsFocused(false);
            onSearch?.(text);
          }}
        />
      </form>

      {/* Minimalist Trending Pills */}
      {!isCompact && (
        <div className="mt-5 flex flex-wrap justify-center items-center gap-2 text-xs opacity-80">
          <span className="opacity-60 text-[11px]">Gündem:</span>
          {trendingTags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playClick();
                setQuery(tag.query);
                onSearch(tag.query);
              }}
              className="apple-pill-btn px-3 py-1 rounded-full text-xs hover:border-white/20 transition-all"
            >
              {tag.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
