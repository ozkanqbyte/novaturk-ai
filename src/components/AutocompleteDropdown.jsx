import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';
import { API_BASE } from '../services/searchService';

export default function AutocompleteDropdown({ query, isVisible, onSelect, isDark, currentTheme }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  useEffect(() => {
    if (!query || query.trim().length < 1 || !isVisible) {
      setSuggestions([]);
      return;
    }

    // 300ms debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(`${API_BASE}/api/autocomplete?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setSelectedIndex(-1);
        }
      } catch {
        // Sessiz hata — autocomplete opsiyonel
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isVisible]);

  // Klavye navigasyonu (üst bileşenden çağrılacak)
  useEffect(() => {
    if (!isVisible || suggestions.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        onSelect(suggestions[selectedIndex].query);
      } else if (e.key === 'Escape') {
        setSuggestions([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, onSelect]);

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div
      ref={dropdownRef}
      role="listbox"
      aria-label="Arama önerileri"
      className={`absolute top-full left-0 right-0 mt-1.5 rounded-2xl border shadow-2xl z-50 overflow-hidden backdrop-blur-xl ${
        isDark
          ? 'bg-slate-900/95 border-white/10 shadow-black/40'
          : 'bg-white/95 border-black/10 shadow-black/10'
      }`}
    >
      {suggestions.map((item, index) => (
        <button
          key={item.query}
          role="option"
          aria-selected={index === selectedIndex}
          onClick={() => onSelect(item.query)}
          onMouseEnter={() => setSelectedIndex(index)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${
            index === selectedIndex
              ? isDark
                ? 'bg-white/10'
                : 'bg-black/5'
              : 'hover:bg-white/5'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isDark ? 'bg-white/5' : 'bg-black/5'
          }`}>
            {item.score > 15 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : item.score > 5 ? (
              <Clock className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <Search className="w-3.5 h-3.5 opacity-40" />
            )}
          </div>

          <span className={`flex-1 text-sm truncate ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}>
            {/* Highlight matching prefix */}
            {item.query.toLowerCase().startsWith(query.toLowerCase().trim()) ? (
              <>
                <span className="opacity-50">{query.trim()}</span>
                <span className="font-medium">{item.query.slice(query.trim().length)}</span>
              </>
            ) : (
              <span>{item.query}</span>
            )}
          </span>

          <ArrowUpRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity ${
            index === selectedIndex ? 'opacity-40' : ''
          }`} />
        </button>
      ))}

      <div className={`px-4 py-2 text-[10px] border-t flex items-center gap-1.5 ${
        isDark ? 'text-slate-500 border-white/5' : 'text-slate-400 border-black/5'
      }`}>
        <span>↑↓ ile gezin</span>
        <span>•</span>
        <span>Enter ile seçin</span>
        <span>•</span>
        <span>NovaTürk Otomatik Tamamlama</span>
      </div>
    </div>
  );
}
