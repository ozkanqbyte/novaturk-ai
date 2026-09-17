import React from 'react';
import { X, Check, Palette, Sparkles, Moon, Sun } from 'lucide-react';
import { THEMES } from '../data/themes';
import { sound } from '../services/soundService';

export default function ThemeSelectorModal({ isOpen, onClose, currentTheme, onSelectTheme, isDark }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className={`apple-glass relative z-10 w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl transition-all ${
        isDark ? 'border-white/10 text-white' : 'border-black/10 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-current/10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${
              isDark ? 'bg-white/10 border-white/15' : 'bg-black/5 border-black/10'
            }`}>
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight font-['Outfit',sans-serif]">
                10 Seçkin Cam & Gradient Teması
              </h3>
              <p className="text-xs opacity-60">
                Apple VisionOS şeffaf cam ve renkli degrade arka plan koleksiyonu
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 10 Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {THEMES.map((theme) => {
            const isSelected = currentTheme.id === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTheme(theme);
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                  isSelected
                    ? isDark 
                      ? 'bg-white/15 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-1 ring-white/50' 
                      : 'bg-black/10 border-black/30 shadow-[0_0_20px_rgba(0,0,0,0.08)] ring-1 ring-black/30'
                    : isDark 
                      ? 'bg-white/[0.03] border-white/8 hover:border-white/20 hover:bg-white/[0.06]' 
                      : 'bg-black/[0.02] border-black/6 hover:border-black/15 hover:bg-black/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Color Swatch Circle */}
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${theme.previewGradient} border border-white/20 shadow-sm flex items-center justify-center shrink-0`}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold tracking-tight group-hover:opacity-100 transition-opacity">
                      {theme.name}
                    </h4>
                    <span className="text-[10px] opacity-60 flex items-center gap-1">
                      {theme.isDark ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                      {theme.category} Cam
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                  }`}>
                    Aktif
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
