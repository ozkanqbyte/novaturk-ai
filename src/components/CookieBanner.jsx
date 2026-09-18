import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner({ isDark, currentTheme }) {
  const [isVisible, setIsVisible] = useState(false);
  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  useEffect(() => {
    const consent = localStorage.getItem('novaturk_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('novaturk_cookie_consent', 'true');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl z-[9999]">
      <div 
        className={`rounded-2xl p-4 border shadow-2xl flex flex-col sm:flex-row items-center gap-4 ${
          isDark ? 'bg-slate-900/90 backdrop-blur-lg border-white/10' : 'bg-white/90 backdrop-blur-lg border-black/10'
        }`}
        role="dialog"
        aria-label="Çerez Bildirimi"
      >
        <div className="flex items-start gap-3 flex-1 w-full">
          <Cookie className="w-5 h-5 mt-0.5 shrink-0" style={{ color: themeAccent }} />
          <div className="flex-1">
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              NovaTürk AI, deneyiminizi iyileştirmek için çerezler kullanır.{' '}
              <a href="#" className="underline font-medium hover:opacity-80 transition-opacity" style={{ color: themeAccent }}>
                Gizlilik politikamızı inceleyin.
              </a>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
          <button
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: themeAccent }}
            aria-label="Çerezleri Kabul Et"
          >
            Kabul Et
          </button>
          <button
            onClick={handleClose}
            className={`p-2 rounded-xl border transition-all ${
              isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-black/10 hover:bg-black/5 text-slate-500'
            }`}
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
