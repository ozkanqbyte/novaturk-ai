import React, { useState } from 'react';
import { 
  ShieldCheck, Phone, MessageSquare, ExternalLink, 
  Sparkles, Tag, Star, ChevronRight, Check, Copy, ArrowUpRight
} from 'lucide-react';
import { sound } from '../services/soundService';
import { trackAdClick } from '../services/sponsoredAdsService';

export default function VerifiedSponsoredResult({ 
  ad, 
  onOpenInAppTab, 
  onOpenBusinessModal, 
  isDark = true,
  currentTheme 
}) {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!ad) return null;

  const handleLinkClick = () => {
    sound?.playClick?.();
    trackAdClick(ad.id, ad.title);
    if (onOpenInAppTab) {
      onOpenInAppTab({
        link: ad.url,
        title: ad.title,
        snippet: ad.snippet,
        displayLink: ad.domain
      });
    } else {
      window.open(ad.url, '_blank');
    }
  };

  const handleCopyCode = (e) => {
    e.stopPropagation();
    sound?.playChime?.();
    if (ad.discountCode) {
      navigator.clipboard.writeText(ad.discountCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    }
  };

  const handlePhoneClick = (e) => {
    e.stopPropagation();
    sound?.playClick?.();
    window.open(`tel:${ad.phone.replace(/\s+/g, '')}`, '_blank');
  };

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    sound?.playClick?.();
    const msg = encodeURIComponent(`Merhaba, sizi NovaTürk AI arama motorunda 1. sırada gördüm. Hizmetiniz hakkında bilgi alabilir miyim?`);
    window.open(`https://wa.me/${ad.whatsapp}?text=${msg}`, '_blank');
  };

  return (
    <div className="relative mb-4 group animate-fadeIn">
      {/* Hafif altın/platin prestij ışıması */}
      <div 
        className="absolute -inset-0.5 rounded-2xl blur-md opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-40"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(251,191,36,0.3) 0%, rgba(56,189,248,0.2) 50%, rgba(139,92,246,0.15) 100%)'
            : 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(2,132,199,0.15) 100%)'
        }}
      />

      <div className={`relative apple-glass-card rounded-2xl p-4 sm:p-4.5 border transition-all duration-300 ${
        isDark 
          ? 'bg-[#0f1420]/90 border-amber-500/25 shadow-lg shadow-black/40 hover:border-amber-400/40' 
          : 'bg-white/95 border-amber-500/30 shadow-md shadow-amber-500/5 hover:border-amber-500/50'
      }`}>
        
        {/* Üst Başlık Şeridi: Rozet, Puan ve Sponsor Bildirimi */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-xs border ${
              isDark 
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' 
                : 'bg-amber-100 border-amber-300 text-amber-900'
            }`}>
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin-slow" />
              {ad.badge || '💎 Doğrulanmış Partner'}
            </span>

            <span className="text-[11px] opacity-40">•</span>

            <span className="text-[11px] font-mono opacity-70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              1. Sıra Öne Çıkan Sonuç
            </span>
          </div>

          {/* Puan ve İnceleme Sayısı */}
          {ad.rating && (
            <div className="flex items-center gap-1 text-[11px] font-semibold opacity-85">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{ad.rating}</span>
              <span className="opacity-40 font-normal">({ad.reviewsCount?.toLocaleString('tr-TR') || '500+'} yorum)</span>
            </div>
          )}
        </div>

        {/* Alan Adı ve URL */}
        <div className="flex items-center gap-2 text-xs opacity-75 mb-1.5">
          <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
            <img 
              src={`https://www.google.com/s2/favicons?domain=${ad.domain}&sz=32`} 
              alt="" 
              className="w-3.5 h-3.5 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <span className="font-semibold text-current">{ad.domain}</span>
          <span className="opacity-30">•</span>
          <span className="font-mono text-[11px] opacity-50 truncate">{ad.category || 'Doğrulanmış İşletme'}</span>
        </div>

        {/* Ana Başlık - Tıklanabilir */}
        <h3 className="text-base sm:text-lg font-bold tracking-tight mb-2">
          <button
            onClick={handleLinkClick}
            className={`text-left hover:underline transition-colors inline-flex items-baseline gap-1.5 group/link ${
              isDark ? 'text-sky-400 hover:text-sky-300' : 'text-blue-700 hover:text-blue-800'
            }`}
          >
            <span>{ad.title}</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </button>
        </h3>

        {/* Açıklama */}
        <p className={`text-xs sm:text-[13px] leading-relaxed mb-3.5 font-normal ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          {ad.snippet}
        </p>

        {/* 🌟 HIZLI EYLEMLER ŞERİDİ (Siteye Git, Ara, WhatsApp, Kupon) */}
        <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-white/5">
          {/* Siteyi Sekmede Aç */}
          <button
            onClick={handleLinkClick}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Siteyi Aç</span>
          </button>

          {/* Telefonla Ara */}
          {ad.phone && (
            <button
              onClick={handlePhoneClick}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all hover:scale-105 cursor-pointer ${
                isDark 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200' 
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
              }`}
              title="Doğrudan Telefonla İletişime Geç"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{ad.phone}</span>
            </button>
          )}

          {/* WhatsApp Butonu */}
          {ad.whatsapp && (
            <button
              onClick={handleWhatsAppClick}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/25 transition-all hover:scale-105 cursor-pointer"
              title="WhatsApp Üzerinden Hızlı Mesaj Gönder"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          )}

          {/* Özel İndirim Kuponu */}
          {ad.discountCode && (
            <button
              onClick={handleCopyCode}
              className="ml-auto px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer group/copy"
              title="NovaTürk İndirim Kodunu Kopyala"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{ad.discountText || ad.discountCode}</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400 inline" /> : ad.discountCode}
              </span>
              <span className="text-[10px] opacity-60 group-hover/copy:opacity-100">
                {copiedCode ? 'Kopyalandı!' : 'Kopyala'}
              </span>
            </button>
          )}
        </div>

        {/* Alt Bilgi & Esnaf Sponsorluk Başvurusu */}
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] opacity-60">
          <span>Güvenli & Doğrulanmış NovaTürk Yerli İndeksi</span>
          <button
            onClick={onOpenBusinessModal}
            className="hover:opacity-100 text-amber-400 hover:underline flex items-center gap-1 font-medium transition-opacity cursor-pointer"
          >
            <span>📍 İşletmenizi bu aramada 1. sıraya sabitleyin (Aylık Sabit)</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
}
