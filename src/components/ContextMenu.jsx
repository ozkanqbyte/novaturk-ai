import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, ArrowRight, RotateCw, Copy, Scissors, Clipboard, 
  CheckSquare, Sparkles, ExternalLink, Plus, X, Lock, Printer, Search,
  Code2, Terminal, Image, Download, Info, MousePointer
} from 'lucide-react';
import { sound } from '../services/soundService';
import { copyText, readClipboardText, insertIntoField } from '../services/clipboardService';
import { downloadImage } from './ImagesPanel';

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
  const [toastMessage, setToastMessage] = useState('');

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

  // Kullanıcıya sonucu göster (menü hemen kapanırsa "oldu mu, olmadı mı" belli olmaz)
  const finish = (message, delay = 900) => {
    setToastMessage(message);
    setTimeout(() => { setToastMessage(''); onClose(); }, delay);
  };

  if (!menuData || !menuData.visible) return null;

  // Ekran sınırlarını aşmasını engelle
  const x = Math.min(menuData.x, window.innerWidth - 260);
  const y = Math.min(menuData.y, window.innerHeight - 440);

  const selectedText = menuData.selectedText || '';
  const linkUrl = menuData.linkUrl || '';
  const srcUrl = menuData.srcUrl || '';

  const handleCopy = async () => {
    sound.playClick();
    const text = selectedText || window.getSelection()?.toString() || '';
    if (text) {
      finish((await copyText(text)) ? '✓ Kopyalandı' : 'Kopyalanamadı — Ctrl+C deneyin');
      return;
    }
    // Seçili metin yok: odaktaki alanda seçim varsa onu kopyala
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.selectionEnd > el.selectionStart) {
      const picked = el.value.slice(el.selectionStart, el.selectionEnd);
      finish((await copyText(picked)) ? '✓ Kopyalandı' : 'Kopyalanamadı — Ctrl+C deneyin');
      return;
    }
    finish('Kopyalanacak seçili metin yok', 1200);
  };

  const handlePaste = async () => {
    sound.playClick();
    const text = await readClipboardText();
    const el = document.activeElement;
    const isField = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
    if (text === null) {
      finish('Tarayıcı panoya erişime izin vermedi — Ctrl+V kullanın', 2200);
    } else if (!isField) {
      finish('Yapıştırmak için önce bir yazı alanına tıklayın', 1800);
    } else {
      insertIntoField(el, text);
      finish('✓ Yapıştırıldı');
    }
  };

  const handleCut = async () => {
    sound.playClick();
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.selectionEnd > el.selectionStart) {
      const picked = el.value.slice(el.selectionStart, el.selectionEnd);
      if (await copyText(picked)) {
        insertIntoField(el, ''); // seçili aralığı siler
        finish('✓ Kesildi');
        return;
      }
    }
    finish('Kesmek için bir yazı alanında metin seçin', 1500);
  };

  // 🌟 Tümünü Seç (Mavi kilitlenmeyi önler)
  const handleSelectAll = () => {
    sound.playClick();
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      activeEl.select();
    } else {
      // Bütün pencereyi değil, okunabilir ana içeriği seç
      const container = document.querySelector('.search-results-container') || document.querySelector('main') || document.body;
      const range = document.createRange();
      range.selectNodeContents(container);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    onClose();
  };

  const handleClearSelection = () => {
    sound.playClick();
    window.getSelection()?.removeAllRanges();
    onClose();
  };

  const handleCopyLink = async () => {
    sound.playClick();
    finish(linkUrl && (await copyText(linkUrl)) ? '✓ Bağlantı kopyalandı' : 'Kopyalanamadı');
  };

  const handleSearchSelection = () => {
    sound.playChime();
    if (selectedText && onOpenSearch) {
      onOpenSearch(selectedText.trim());
    }
    onClose();
  };

  // 🔍 1. Google Chrome Öğeyi İncele (Inspect / DevTools)
  const handleInspect = () => {
    sound.playClick();
    if (typeof window !== 'undefined' && window.electron?.inspectElement) {
      window.electron.inspectElement(menuData.x, menuData.y);
      onClose();
    } else if (typeof window !== 'undefined' && window.electron?.openDevTools) {
      window.electron.openDevTools();
      onClose();
    } else {
      // Tarayıcı (Chrome) ortamında:
      setToastMessage('💡 Chrome Geliştirici Araçları için F12 veya Ctrl+Shift+I tuşlarına basabilir; ya da Shift + Sağ Tık yaparak doğrudan Chrome menüsünü açabilirsiniz!');
      setTimeout(() => {
        setToastMessage('');
        onClose();
      }, 3500);
    }
  };

  // 📄 2. Sayfa Kaynağını Görüntüle (Ctrl+U)
  const handleViewSource = async () => {
    sound.playClick();
    const target = linkUrl || window.location.href;
    if (window.electron) {
      window.open(`view-source:${target}`, '_blank');
      onClose();
      return;
    }
    try {
      const url = new URL(target, window.location.href);
      if (url.origin !== window.location.origin) throw new Error('cross-origin');
      const html = await (await fetch(url.href)).text();
      const blobUrl = URL.createObjectURL(new Blob([html], { type: 'text/plain;charset=utf-8' }));
      window.open(blobUrl, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      onClose();
    } catch {
      finish('Başka sitenin kaynağı buradan açılamaz — sayfada Ctrl+U kullanın', 2600);
    }
  };

  // 🌐 3. Google'da Ara
  const handleSearchGoogle = () => {
    sound.playClick();
    const q = selectedText || 'NovaTürk AI';
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${Math.max(10, y)}px`, left: `${Math.max(10, x)}px` }}
      className={`fixed z-[9999] w-64 rounded-2xl border shadow-2xl backdrop-blur-2xl p-1.5 text-xs font-medium animate-fadeIn select-none transition-all ${
        isDark 
          ? 'bg-[#121520]/95 border-white/20 text-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.85)]' 
          : 'bg-white/95 border-black/15 text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.25)]'
      }`}
    >
      {/* Toast Mesajı */}
      {toastMessage && (
        <div className="mb-2 p-2 rounded-xl bg-sky-500/20 border border-sky-400/40 text-[11px] text-sky-200 leading-snug animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* 1. Navigasyon Çubuğu (Geri, İleri, Yenile) */}
      <div className="flex items-center justify-around p-1 mb-1 border-b border-white/10">
        <button
          onClick={() => { onClose(); if (onGoBack) onGoBack(); }}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-80 hover:opacity-100"
          title="Geri Git (Alt+Sol)"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => { onClose(); if (onGoForward) onGoForward(); }}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-80 hover:opacity-100"
          title="İleri Git (Alt+Sağ)"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => { onClose(); if (onReload) onReload(); }}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-80 hover:opacity-100"
          title="Yeniden Yükle (Ctrl+R / F5)"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Seçili Metin ile Arama Seçenekleri */}
      {selectedText && (
        <>
          <button
            onClick={handleSearchSelection}
            className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-sky-500 hover:text-white transition-colors text-sky-400 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">NovaTürk'te Ara: "{selectedText.slice(0, 16)}..."</span>
          </button>

          <button
            onClick={handleSearchGoogle}
            className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
          >
            <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Google'da Ara</span>
          </button>
          <div className="h-px bg-white/10 my-1" />
        </>
      )}

      {/* 3. Resim Seçenekleri (Eğer resme tıklandıysa) */}
      {srcUrl && (
        <>
          <button
            onClick={() => {
              onClose();
              if (onNewTab) onNewTab(srcUrl);
            }}
            className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-white/10 transition-colors"
          >
            <Image className="w-3.5 h-3.5 text-purple-400" />
            <span>Resmi Yeni Sekmede Aç</span>
          </button>
          <button
            onClick={async () => {
              sound.playClick();
              finish((await copyText(srcUrl)) ? '✓ Resim adresi kopyalandı' : 'Kopyalanamadı');
            }}
            className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-white/10 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 opacity-70" />
            <span>Resim Adresini Kopyala</span>
          </button>
          <button
            onClick={async () => {
              sound.playClick();
              setToastMessage('İndiriliyor…');
              const ok = await downloadImage({ fullImage: srcUrl, title: 'novaturk-gorsel' });
              finish(ok ? '✓ Resim indirildi' : 'İndirilemedi — resmi yeni sekmede açıp kaydedin', ok ? 900 : 2200);
            }}
            className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5 opacity-70" />
            <span>Resmi İndir</span>
          </button>
          <div className="h-px bg-white/10 my-1" />
        </>
      )}

      {/* 4. Link Seçenekleri */}
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

      {/* 5. Standart Pano İşlemleri (Kopyala, Yapıştır, Kes, Seç) */}
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

      {selectedText && (
        <button
          onClick={handleClearSelection}
          className="w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors text-slate-400"
        >
          <span className="flex items-center gap-2">
            <MousePointer className="w-3.5 h-3.5" />
            <span>Seçimi Temizle</span>
          </span>
          <span className="text-[10px] opacity-40 font-mono">Esc</span>
        </button>
      )}

      <div className="h-px bg-white/10 my-1" />

      {/* 6. Google Chrome Tarzı Geliştirici & Sistem Araçları (İncele & Kaynak) */}
      <button
        onClick={handleViewSource}
        className="w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-sky-400" />
          <span>Sayfa Kaynağını Görüntüle</span>
        </span>
        <span className="text-[10px] opacity-40 font-mono">Ctrl+U</span>
      </button>

      <button
        onClick={handleInspect}
        className="w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-sky-500/20 hover:text-sky-300 text-sky-400 font-semibold transition-colors"
      >
        <span className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Öğeyi İncele</span>
        </span>
        <span className="text-[10px] opacity-70 font-mono">F12</span>
      </button>

      <div className="h-px bg-white/10 my-1" />

      {/* 7. Sekme, Yazdırma ve Kalkan */}
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

      {/* 8. Alt Bilgi: Chrome Orijinal Menüsü Kısayolu */}
      <div className="mt-1 pt-1.5 border-t border-white/10 px-2 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1 opacity-70">
          <Info className="w-3 h-3 text-sky-400" /> Chrome Menüsü:
        </span>
        <span className="font-mono text-slate-300 font-semibold">Shift + Sağ Tık</span>
      </div>

    </div>
  );
}
