import React, { useState } from 'react';
import { X, Star, Globe, Plus, Check } from 'lucide-react';
import { sound } from '../services/soundService';

export default function AddBookmarkModal({ isOpen, onClose, onAdd, isDark, currentTheme }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Lütfen geçerli bir web adresi girin.');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    let cleanTitle = title.trim();
    if (!cleanTitle) {
      try {
        cleanTitle = new URL(cleanUrl).hostname;
      } catch {
        cleanTitle = 'Kısayol';
      }
    }

    sound.playChime();
    onAdd({ title: cleanTitle, url: cleanUrl });
    setTitle('');
    setUrl('');
    setError('');
    onClose();
  };

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className={`apple-glass relative z-10 w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all ${
        isDark ? 'bg-[#0d1017]/95 border-white/15 text-white' : 'bg-white/95 border-black/15 text-slate-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-current/10">
          <div className="flex items-center gap-2.5">
            <div 
              style={{ backgroundColor: `${themeAccent}20`, color: themeAccent }}
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/10"
            >
              <Star className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-['Outfit',sans-serif]">Yeni Kısayol / Yer İmi Ekle</h3>
              <p className="text-[11px] opacity-60">Sık kullandığın web sitelerini ana sayfana sabitle</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold opacity-70 mb-1">
              Web Sitesi Başlığı (İsteğe bağlı)
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: ShiftDelete, Webrazzi, ChatGPT..."
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                isDark 
                  ? 'bg-black/50 border-white/10 text-white focus:border-sky-500' 
                  : 'bg-slate-50 border-black/10 text-slate-900 focus:border-sky-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold opacity-70 mb-1">
              Web Adresi (URL) *
            </label>
            <input 
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="Örn: shiftdelete.net veya https://..."
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                isDark 
                  ? 'bg-black/50 border-white/10 text-white focus:border-sky-500' 
                  : 'bg-slate-50 border-black/10 text-slate-900 focus:border-sky-500'
              }`}
            />
            {error && (
              <p className="text-[11px] text-rose-400 mt-1">{error}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-current/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold opacity-60 hover:opacity-100 hover:bg-white/5 transition-all"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              style={{ backgroundColor: themeAccent }}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Kısayolu Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
