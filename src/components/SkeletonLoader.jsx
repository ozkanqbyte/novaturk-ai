import React from 'react';
import { Loader2 } from 'lucide-react';

export default function SkeletonLoader({ isDark, currentTheme }) {
  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-center gap-2 mb-8 opacity-60">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: themeAccent }} />
        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          NovaTürk aranıyor...
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`rounded-2xl p-5 border shadow-sm animate-pulse ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-black/5'
            }`}
          >
            <div className={`h-5 w-3/4 rounded mb-4 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
            <div className="space-y-2 mb-4">
              <div className={`h-3 w-full rounded ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
              <div className={`h-3 w-5/6 rounded ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
            </div>
            <div className={`h-3 w-1/3 rounded mt-4 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
