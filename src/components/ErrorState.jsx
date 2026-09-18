import React from 'react';
import { WifiOff } from 'lucide-react';

export default function ErrorState({ error, onRetry, isDark, currentTheme }) {
  const themeAccent = currentTheme?.accent || (isDark ? '#ef4444' : '#dc2626');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
      <div 
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border shadow-sm ${
          isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'
        }`}
      >
        <WifiOff className="w-8 h-8" style={{ color: themeAccent }} />
      </div>
      
      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
        Bağlantı Sorunu
      </h3>
      
      <p className={`text-sm max-w-md mx-auto mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {error || 'Arama sunucusuna bağlanılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.'}
      </p>

      <button
        onClick={onRetry}
        className={`px-6 py-2.5 rounded-xl text-sm font-medium border shadow-sm transition-all hover:scale-105 ${
          isDark 
            ? 'bg-white/10 hover:bg-white/15 border-white/20 text-white' 
            : 'bg-slate-800 hover:bg-slate-900 border-slate-900 text-white'
        }`}
      >
        Tekrar Dene
      </button>
    </div>
  );
}
