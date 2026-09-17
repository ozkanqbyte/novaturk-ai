import React, { useEffect, useRef } from 'react';
import { 
  ArrowLeft, ArrowRight, RotateCw, Copy, Scissors, Clipboard, 
  CheckSquare, Sparkles, ExternalLink, Plus, X, Lock, Printer, Search
} from 'lucide-react';
import { sound } from '../services/soundService';

export default function ContextMenu({ 
  menuData, 
  onClose, 
  onGoBack, 
  onGoForward, 
  onReload, 
  onNewTab, 
  onCloseTab,
  onOpenSearch,
  onOpenSecurityModal,
  isDark 
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!menuData || !menuData.visible) return null;

  // Ekran sınırlarını aşmasını engelle
  const x = Math.min(menuData.x, window.innerWidth - 240);
  const y = Math.min(menuData.y, window.innerHeight - 380);

  const selectedText = menuData.selectedText || '';
  const linkUrl = menuData.linkUrl || '';

  const handleCopy = async () => {
    sound.playClick();
    if (selectedText) {
      try { await navigator.clipboard.writeText(selectedText); } catch {}
    } else {
      document.execCommand('copy');
    }
    onClose();
  };

  const handlePaste = async () => {
    sound.playClick();
    try {
      const text = await navigator.clipboard.readText();
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        const start = activeEl.selectionStart || 0;
        const end = activeEl.selectionEnd || 0;
        const val = activeEl.value || '';
        activeEl.value = val.slice(0, start) + text + val.slice(end);
        activeEl.selectionStart = activeEl.selectionEnd = start + text.length;
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch {
      document.execCommand('paste');
    }
    onClose();
  };

  const handleCut = () => {
    sound.playClick();
    document.execCommand('cut');
    onClose();
  };

  const handleSelectAll = () => {
    sound.playClick();
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      activeEl.select();
    } else {
      window.getSelection()?.selectAllChildren(document.body);
    }
    onClose();
  };

  const handleCopyLink = async () => {
    sound.playClick();
    if (linkUrl) {
      try { await navigator.clipboard.writeText(linkUrl); } catch {}
    }
    onClose();
  };

  const handleSearchSelection = () => {
    sound.playChime();
    if (selectedText && onOpenSearch) {
      onOpenSearch(selectedText.trim());
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${Math.max(10, y)}px`, left: `${Math.max(10, x)}px` }}
      className={`fixed z-[9999] w-56 rounded-2xl border shadow-2xl backdrop-blur-xl p-1.5 text-xs font-medium animate-fadeIn select-none transition-all ${
        isDark 
          ? 'bg-[#151822]/95 border-white/15 text-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.8)]' 
          : 'bg-white/95 border-black/10 text-slate-800 shadow-[0_15px_40px_rgba(0,0,0,0.2)]'
      }`}
    >
      {/* 1. Navigasyon Çubuğu (Geri, İleri, Yenile) */}
      <div className="flex items-center justify-around p-1 mb-1 border-b border-white/10">
        <button
          onClick={() => { onClose(); if (onGoBack) onGoBack(); }}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-80 hover:opacity-100"
          title="Geri Git"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => { onClose(); if (onGoForward) onGoForward(); }}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-80 hover:opacity-100"
          title="İleri Git"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => { onClose(); if (onReload) onReload(); }}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-80 hover:opacity-100"
          title="Yenile (F5)"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Seçili Metin Arama */}
      {selectedText && (
        <>
          <button
            onClick={handleSearchSelection}
            className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-sky-500 hover:text-white transition-colors text-sky-400 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">NovaTürk'te Ara: "{selectedText.slice(0, 16)}..."</span>
          </button>
          <div className="h-px bg-white/10 my-1" />
        </>
      )}

      {/* 3. Link Seçenekleri */}
      {linkUrl && (
        <>
          <button
            onClick={() => {
              onClose();
              if (onNewTab) onNewTab(linkUrl);
            }}
            className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-white/10 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            <span>Bağlantıyı Yeni Sekmede Aç</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-white/10 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 opacity-70" />
            <span>Bağlantı Adresini Kopyala</span>
          </button>
          <div className="h-px bg-white/10 my-1" />
        </>
      )}

      {/* 4. Standart Pano İşlemleri (Kopyala, Yapıştır, Kes, Seç) */}
      <button
        onClick={handleCopy}
        className="w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Copy className="w-3.5 h-3.5 opacity-70" />
          <span>Kopyala</span>
        </span>
        <span className="text-[10px] opacity-40 font-mono">Ctrl+C</span>
      </button>

      <button
        onClick={handlePaste}
        className="w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Clipboard className="w-3.5 h-3.5 opacity-70" />
          <span>Yapıştır</span>
        </span>
        <span className="text-[10px] opacity-40 font-mono">Ctrl+V</span>
      </button>

      <button
        onClick={handleCut}
        className="w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Scissors className="w-3.5 h-3.5 opacity-70" />
          <span>Kes</span>
        </span>
        <span className="text-[10px] opacity-40 font-mono">Ctrl+X</span>
      </button>

      <button
        onClick={handleSelectAll}
        className="w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <span className="flex items-center gap-2">
          <CheckSquare className="w-3.5 h-3.5 opacity-70" />
          <span>Tümünü Seç</span>
        </span>
        <span className="text-[10px] opacity-40 font-mono">Ctrl+A</span>
      </button>

      <div className="h-px bg-white/10 my-1" />

      {/* 5. Sekme ve Tarayıcı Kontrolleri */}
      <button
        onClick={() => { onClose(); if (onNewTab) onNewTab(); }}
        className="w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-sky-400" />
          <span>Yeni Sekme</span>
        </span>
        <span className="text-[10px] opacity-40 font-mono">Ctrl+T</span>
      </button>

      {onCloseTab && (
        <button
          onClick={() => { onClose(); onCloseTab(); }}
          className="w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-rose-500/15 hover:text-rose-400 transition-colors"
        >
          <span className="flex items-center gap-2">
            <X className="w-3.5 h-3.5 text-rose-400" />
            <span>Sekmeyi Kapat</span>
          </span>
          <span className="text-[10px] opacity-40 font-mono">Ctrl+W</span>
        </button>
      )}

      {/* 6. Güvenlik ve Yazdırma */}
      <div className="h-px bg-white/10 my-1" />

      {onOpenSecurityModal && (
        <button
          onClick={() => { onClose(); onOpenSecurityModal(); }}
          className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-emerald-400 hover:bg-emerald-500/15 transition-colors"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Güvenlik & Kalkan Bilgisi</span>
        </button>
      )}

      <button
        onClick={() => { onClose(); window.print(); }}
        className="w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Printer className="w-3.5 h-3.5 opacity-70" />
          <span>Yazdır...</span>
        </span>
        <span className="text-[10px] opacity-40 font-mono">Ctrl+P</span>
      </button>
    </div>
  );
}
