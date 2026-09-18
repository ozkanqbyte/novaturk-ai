import React from 'react';
import { SearchX } from 'lucide-react';

export default function EmptyState({ query, isDark, currentTheme, onSuggestionClick }) {
  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');
  const suggestions = ['Türkiye haberleri', 'teknoloji', 'yapay zeka'];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
      <div 
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border shadow-sm ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'
        }`}
      >
        <SearchX className="w-8 h-8 opacity-50" style={{ color: themeAccent }} />
      </div>
      
      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
        Sonuç bulunamadı
      </h3>
      
      <p className={`text-sm max-w-md mx-auto mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        "{query}" araması için sonuç bulunamadı. Farklı anahtar kelimeler deneyebilirsiniz.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:scale-105 ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' 
                : 'bg-white hover:bg-slate-50 border-black/10 text-slate-700'
            }`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
