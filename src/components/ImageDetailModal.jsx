import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Download, ExternalLink, 
  Copy, Check, ZoomIn, ZoomOut, Maximize2, Minimize2, 
  Sparkles, Image as ImageIcon, Share2, Info, CheckCircle2
} from 'lucide-react';
import { sound } from '../services/soundService';
import { downloadImage } from './ImagesPanel';
import { copyText } from '../services/clipboardService';

export default function ImageDetailModal({
  isOpen,
  onClose,
  image,
  images = [],
  onSelectImage,
  isDark = true
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [downloadState, setDownloadState] = useState('');

  // Aktif görselin indexi
  const currentIndex = images.findIndex(img => (img.id && img.id === image?.id) || img.thumb === image?.thumb || img.url === image?.url);
  const totalCount = images.length;

  // Görsel değiştiğinde zoom ve yükleme durumunu sıfırla
  useEffect(() => {
    setIsZoomed(false);
    setImageLoaded(false);
  }, [image]);

  // Önceki görsel
  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    sound.playClick();
    const prevIdx = (currentIndex - 1 + images.length) % images.length;
    if (onSelectImage) onSelectImage(images[prevIdx]);
  }, [currentIndex, images, onSelectImage]);

  // Sonraki görsel
  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    sound.playClick();
    const nextIdx = (currentIndex + 1) % images.length;
    if (onSelectImage) onSelectImage(images[nextIdx]);
  }, [currentIndex, images, onSelectImage]);

  // Klavye kısayolları (Sol/Sağ ok, Esc, Z zoom)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key.toLowerCase() === 'z') {
        sound.playClick();
        setIsZoomed(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !image) return null;

  const activeSrc = image.fullImage || image.url || image.thumb;
  const displayTitle = image.title || 'Fotoğraf Detayı';
  const displaySource = image.source || 'Wikimedia Commons';
  const resolutionText = image.width && image.height ? `${image.width} × ${image.height}` : (image.dimensions || 'HD Çözünürlük');

  // Bağlantıyı kopyala
  const handleCopy = async () => {
    sound.playClick();
    const ok = await copyText(activeSrc);
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  };

  // İndir
  const handleDownload = async () => {
    sound.playClick();
    setDownloadState('İndiriliyor…');
    const ok = await downloadImage({ ...image, fullImage: activeSrc, title: displayTitle });
    setDownloadState(ok ? '✓ İndirildi' : 'İndirilemedi');
    setTimeout(() => setDownloadState(''), 2000);
  };

  // Tam ekran modu toggle
  const toggleFullscreen = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/90 backdrop-blur-2xl select-none animate-fadeIn overflow-hidden text-white"
      onClick={(e) => {
        // Arka plana tıklayınca kapat
        if (e.target === e.currentTarget) {
          sound.playClick();
          onClose();
        }
      }}
    >
      {/* 🌟 1. APPLE VISIONOS ÜST KONTROL ÇUBUĞU (Floating Frosted Glass Header) */}
      <header className="w-full max-w-7xl mx-auto px-4 pt-4 pb-2 z-20 flex items-center justify-between gap-3">
        {/* Sol Bilgi Kapsülü */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-mono font-medium flex items-center gap-2 backdrop-blur-xl shadow-lg shrink-0">
            <span className="text-sky-400 font-bold">{currentIndex >= 0 ? currentIndex + 1 : 1}</span>
            <span className="opacity-40">/</span>
            <span className="opacity-70">{totalCount}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 backdrop-blur-xl shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[140px]">{displaySource}</span>
          </div>

          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-400">
            <span>{resolutionText}</span>
          </div>
        </div>

        {/* Orta Başlık (Masaüstünde Görünür) */}
        <div className="hidden lg:block text-center truncate max-w-md px-4">
          <h2 className="text-xs sm:text-sm font-semibold truncate opacity-90 font-['Outfit',sans-serif]">
            {displayTitle}
          </h2>
        </div>

        {/* Sağ Aksiyon Kapsülü (VisionOS Glass Pill) */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xl shadow-2xl shrink-0">
          {/* Zoom Büyüteç */}
          <button
            onClick={() => {
              sound.playClick();
              setIsZoomed(prev => !prev);
            }}
            title={isZoomed ? "Standart Görünüm (Z)" : "Yakınlaştır (Z)"}
            className={`p-2 rounded-full transition-all ${
              isZoomed ? 'bg-sky-500 text-white shadow-sm' : 'hover:bg-white/15 text-slate-200'
            }`}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>

          {/* Tam Ekran */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
            className="p-2 rounded-full hover:bg-white/15 text-slate-200 transition-colors hidden sm:inline-flex"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* İndir */}
          <button
            onClick={handleDownload}
            title={downloadState || "Görseli İndir"}
            disabled={downloadState === "İndiriliyor…"}
            className="p-2 rounded-full hover:bg-white/15 text-slate-200 transition-colors flex items-center gap-1.5 disabled:opacity-60"
          >
            <Download className={`w-4 h-4 ${downloadState === "İndiriliyor…" ? "animate-pulse" : ""}`} />
            {downloadState && <span className="text-[11px] font-semibold">{downloadState}</span>}
          </button>

          {/* Bağlantıyı Kopyala */}
          <button
            onClick={handleCopy}
            title="Doğrudan Görsel Linkini Kopyala"
            className="p-2 rounded-full hover:bg-white/15 text-slate-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Orijinal Sayfada Aç */}
          {image.descriptionUrl || image.sourceUrl || image.url ? (
            <a
              href={image.descriptionUrl || image.sourceUrl || image.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Orijinal Kaynak Sayfasında Aç"
              className="p-2 rounded-full hover:bg-white/15 text-slate-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : null}

          {/* Ayırıcı */}
          <div className="w-[1px] h-4 bg-white/20 my-auto mx-0.5" />

          {/* Kapat Butonu */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            title="Kapat (Esc)"
            className="p-2 rounded-full bg-white/15 hover:bg-red-500/80 hover:text-white text-slate-200 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 🌟 2. ORTA ANA GÖRSEL ALANI & SAĞ/SOL OKLAR */}
      <div 
        className="relative flex-1 flex items-center justify-center px-4 sm:px-12 py-2 overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            sound.playClick();
            onClose();
          }
        }}
      >
        {/* Sol Gezinme Oku */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            title="Önceki Fotoğraf (←)"
            className="absolute left-3 sm:left-6 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:scale-90 border border-white/15 text-white flex items-center justify-center transition-all backdrop-blur-xl shadow-2xl hover:scale-105"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Görsel Çerçevesi */}
        <div 
          className={`relative max-w-full max-h-full flex items-center justify-center transition-all duration-300 ${
            isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(prev => !prev)}
        >
          {/* Yükleniyor Placeholder */}
          {!imageLoaded && (
            <div className="w-64 h-48 sm:w-96 sm:h-72 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 animate-pulse">
              <ImageIcon className="w-8 h-8 text-sky-400 opacity-60" />
              <span className="text-xs text-slate-400 font-mono">Görsel yükleniyor...</span>
            </div>
          )}

          <img
            src={activeSrc}
            alt={displayTitle}
            onLoad={() => setImageLoaded(true)}
            className={`max-h-[68vh] sm:max-h-[74vh] max-w-full object-contain rounded-2xl sm:rounded-3xl border border-white/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] transition-all duration-300 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        </div>

        {/* Sağ Gezinme Oku */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            title="Sonraki Fotoğraf (→)"
            className="absolute right-3 sm:right-6 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:scale-90 border border-white/15 text-white flex items-center justify-center transition-all backdrop-blur-xl shadow-2xl hover:scale-105"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* 🌟 3. ALT FİLM ŞERİDİ & DETAY BİLGİSİ (Apple Photos Filmstrip) */}
      <footer className="w-full max-w-5xl mx-auto px-4 pb-4 pt-2 z-20 flex flex-col items-center gap-3">
        {/* Başlık ve İpuçları */}
        <div className="w-full flex items-center justify-between text-xs px-2">
          <div className="min-w-0 pr-4">
            <h3 className="text-xs sm:text-sm font-bold truncate text-white font-['Outfit',sans-serif]">
              {displayTitle}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{displaySource}</span>
              <span>•</span>
              <span className="font-mono text-sky-400">{resolutionText}</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400 font-mono shrink-0">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">← / → Gezin</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Z Zoom</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Esc Kapat</span>
          </div>
        </div>

        {/* Küçük Görsel Şeridi (Filmstrip Thumbnail Carousel) */}
        {images.length > 1 && (
          <div className="w-full flex items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar justify-start sm:justify-center">
            {images.map((item, idx) => {
              const isActive = (item.id && item.id === image.id) || item.thumb === image.thumb || item.url === image.url;
              return (
                <button
                  key={item.id || idx}
                  onClick={() => {
                    sound.playClick();
                    if (onSelectImage) onSelectImage(item);
                  }}
                  className={`relative shrink-0 w-14 h-10 sm:w-16 sm:h-11 rounded-xl overflow-hidden border transition-all duration-200 ${
                    isActive 
                      ? 'ring-2 ring-sky-400 border-white scale-105 opacity-100 shadow-lg' 
                      : 'border-white/15 opacity-50 hover:opacity-100 hover:scale-100'
                  }`}
                >
                  <img
                    src={item.thumb || item.url}
                    alt={item.title || `Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-sky-500/10 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </footer>
    </div>
  );
}
