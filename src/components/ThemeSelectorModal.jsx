import React, { useState } from 'react';
import { X, Check, Palette, Sparkles, Moon, Sun, Flame, Zap } from 'lucide-react';
import { THEMES } from '../data/themes';
import { sound } from '../services/soundService';

const NEW_THEME_IDS = [
  'pure-black-oled',
  'space-gray-titanium',
  'midnight-visionos',
  'cyber-neon-matrix',
  'royal-amethyst',
  'sunset-horizon',
  'deep-emerald-abyss',
  'glacier-iceberg',
  'minimal-snow-apple',
  'rose-gold-blush'
];

export default function ThemeSelectorModal({ isOpen, onClose, currentTheme, onSelectTheme, isDark }) {
  const [filter, setFilter] = useState('all'); // 'all', 'new', 'dark', 'oled', 'light'

  if (!isOpen) return null;

  const filteredThemes = THEMES.filter(t => {
    if (filter === 'new') return NEW_THEME_IDS.includes(t.id);
    if (filter === 'oled') return t.id === 'pure-black-oled' || t.category === 'OLED';
    if (filter === 'dark') return t.isDark;
    if (filter === 'light') return !t.isDark;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xl animate-fadeIn">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className={`apple-glass relative z-10 w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl transition-all ${
        isDark ? 'border-white/15 text-white bg-[#0c0e18]/95' : 'border-black/10 text-slate-900 bg-white/95'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-current/10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md ${
              isDark ? 'bg-white/10 border-white/20 text-sky-400' : 'bg-black/5 border-black/10 text-sky-600'
            }`}>
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight font-['Outfit',sans-serif]">
                  20 Seçkin Apple VisionOS Cam & OLED Teması
                </h3>
                <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-sm">
                  10 Yeni Eklendi
                </span>
              </div>
              <p className="text-xs opacity-60">
                Saf OLED Siyah, buzlu cam dokuları ve Apple Pro renk tonları
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Badges Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3.5 no-scrollbar text-xs">
          {[
            { id: 'all', label: 'Tümü (20)', icon: Sparkles },
            { id: 'new', label: '✨ 10 Yeni Tema', icon: Flame, highlight: true },
            { id: 'oled', label: '🖤 Saf OLED Siyah', icon: Moon },
            { id: 'dark', label: '🌙 Koyu Cam (16)', icon: Moon },
            { id: 'light', label: '☀️ Açık & İnci (4)', icon: Sun },
          ].map(tab => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setFilter(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border text-xs ${
                  isActive
                    ? tab.highlight 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md'
                      : isDark 
                        ? 'bg-white text-black border-white shadow-md' 
                        : 'bg-black text-white border-black shadow-md'
                    : isDark 
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' 
                      : 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 20 Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[55vh] overflow-y-auto pr-1">
          {filteredThemes.map((theme) => {
            const isSelected = currentTheme.id === theme.id;
            const isNew = NEW_THEME_IDS.includes(theme.id);
            const isOled = theme.id === 'pure-black-oled';

            return (
              <div
                key={theme.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTheme(theme);
                }}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                  isSelected
                    ? isDark 
                      ? 'bg-white/15 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-2 ring-sky-400/50' 
                      : 'bg-black/10 border-black/30 shadow-[0_0_20px_rgba(0,0,0,0.08)] ring-2 ring-sky-500/50'
                    : isDark 
                      ? 'bg-white/[0.04] border-white/10 hover:border-white/25 hover:bg-white/[0.08]' 
                      : 'bg-black/[0.03] border-black/8 hover:border-black/20 hover:bg-black/[0.06]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Color Swatch Circle */}
                  <div 
                    style={{
                      boxShadow: isOled ? '0 0 0 1px rgba(255,255,255,0.3)' : undefined
                    }}
                    className={`w-8 h-8 rounded-full bg-gradient-to-tr ${theme.previewGradient} border border-white/25 shadow-sm flex items-center justify-center shrink-0`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-semibold tracking-tight group-hover:opacity-100 transition-opacity truncate">
                        {theme.name}
                      </h4>
                      {isNew && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-400 border border-sky-400/30">
                          YENİ
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] opacity-60 flex items-center gap-1 mt-0.5">
                      {theme.isDark ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                      {isOled ? 'Saf OLED (0% Işık)' : `${theme.category} Cam`}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    isDark ? 'bg-sky-400 text-black border-sky-300 font-bold' : 'bg-sky-600 text-white border-sky-600'
                  }`}>
                    Aktif
                  </span>
                ) : (
                  <span className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity text-sky-400 font-medium shrink-0">
                    Uygula
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-current/10 flex items-center justify-between text-[11px] opacity-60">
          <span>Tüm temalar Apple VisionOS cam yansıması ve saf OLED desteğine sahiptir.</span>
          <span className="font-semibold">Toplam: {THEMES.length} Tema</span>
        </div>

      </div>
    </div>
  );
}
