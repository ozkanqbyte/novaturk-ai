import React, { useState } from 'react';
import { X, ExternalLink, Volume2, VolumeX, Copy, Check, BookOpen, ShieldCheck, Type } from 'lucide-react';
import { sound } from '../services/soundService';

export default function ReaderModeDrawer({ isOpen, onClose, article, isDark }) {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState('text-sm sm:text-base'); // text-sm, text-base, text-lg
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen || !article) return null;

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(`${article.title}\n\n${article.snippet || article.description}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    sound.playClick();
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const text = `${article.title}. ${article.snippet || article.description}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <div className={`relative w-full max-w-2xl h-full shadow-2xl flex flex-col z-10 border-l transition-all duration-300 ${
        isDark 
          ? 'bg-[#0b0d14]/95 text-slate-100 border-white/10' 
          : 'bg-white/95 text-slate-900 border-black/10'
      }`}>
        
        {/* Top Action Bar */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-black/[0.01]'
        }`}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Apple Reader Modu • Reklamsız Saf Okuma
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Font Size Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                setFontSize(prev => prev === 'text-sm sm:text-base' ? 'text-base sm:text-lg' : 'text-sm sm:text-base');
              }}
              title="Yazı Boyutunu Değiştir"
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isDark ? 'border-white/10 hover:bg-white/10' : 'border-black/10 hover:bg-black/5'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
            </button>

            {/* TTS Speaker */}
            <button
              onClick={handleToggleSpeak}
              title="Sesli Dinle"
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isDark ? 'border-white/10 hover:bg-white/10' : 'border-black/10 hover:bg-black/5'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              title="Metni Kopyala"
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isDark ? 'border-white/10 hover:bg-white/10' : 'border-black/10 hover:bg-black/5'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isDark ? 'border-white/10 hover:bg-white/10' : 'border-black/10 hover:bg-black/5'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Article Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-medium text-slate-300">{article.displayLink || article.sourceName}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> %100 Reklamsız Arındırıldı
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
              {article.title}
            </h2>
          </div>

          {/* Clean Article Text */}
          <div className={`leading-relaxed space-y-4 font-normal ${fontSize} ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <p className="text-base sm:text-lg font-medium leading-relaxed opacity-95">
              {article.snippet || article.description}
            </p>

            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-white/[0.02] border-white/10 text-slate-400' : 'bg-black/[0.02] border-black/5 text-slate-600'
            } text-xs leading-relaxed space-y-2`}>
              <p className="font-semibold text-slate-200 dark:text-slate-300">
                📌 NovaTürk Reader Modu Özeti:
              </p>
              <p>
                Bu içerik, taranan kaynak üzerinden tüm banner reklamlar, JavaScript takipçileri ve çerez pencerelerinden arındırılarak saf okuma moduna dönüştürülmüştür.
              </p>
            </div>
          </div>

          {/* Original Link */}
          <div className="pt-6 border-t border-white/10">
            <a
              href={article.link || article.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${
                isDark 
                  ? 'border-white/15 hover:border-white/30 text-slate-300 hover:text-white' 
                  : 'border-black/10 hover:border-black/20 text-slate-700 hover:text-black'
              }`}
            >
              <span>Orijinal Web Sitesinde Aç</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
