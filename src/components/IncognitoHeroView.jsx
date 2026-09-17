import React from 'react';
import { EyeOff, ShieldCheck, Zap, Lock, Sparkles, Ghost, ArrowRight, Compass } from 'lucide-react';
import SearchBar from './SearchBar';
import { sound } from '../services/soundService';

export default function IncognitoHeroView({
  onSearch,
  onOpenNormalTab,
  onOpenAdBlocker,
  isDeepSearch,
  setIsDeepSearch,
  isDark = true,
  currentTheme
}) {
  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto text-slate-100 z-10 animate-fadeIn">
      
      {/* 🌟 Neon Mor Ajan Modu Arka Plan Işıkları */}
      <div className="absolute top-1/6 left-1/2 -translate-x-1/2 w-[480px] h-[360px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-[320px] h-[240px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center space-y-7 my-auto">
        
        {/* 1. Neon Ajan Maskesi İkonu */}
        <div className="relative group">
          <div className="w-20 h-20 rounded-3xl bg-purple-950/70 border-2 border-purple-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.35)] backdrop-blur-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-purple-400">
            <EyeOff className="w-10 h-10 text-purple-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-black tracking-widest uppercase shadow-md border border-purple-300/40">
            AJAN
          </div>
        </div>

        {/* 2. Başlık ve Açıklama */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold backdrop-blur-md">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>NovaTürk Gizli Gezinti & Ajan Modu</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-['Outfit',sans-serif] tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-400 bg-clip-text text-transparent">
            Tamamen Görünmezsiniz.
          </h1>

          <p className="max-w-xl mx-auto text-xs sm:text-sm text-purple-200/70 leading-relaxed font-normal">
            Bu sekmede yaptığınız aramalar, ziyaret ettiğiniz sayfalar ve form verileri 
            yerel geçmişinize <b>asla kaydedilmez</b>. Sekmeyi kapattığınız an tüm oturum ve çerezler anında buharlaşır.
          </p>
        </div>

        {/* 3. Arama Çubuğu (Mor Neon Temalı) */}
        <div className="w-full max-w-2xl shadow-[0_10px_35px_rgba(147,51,234,0.15)] rounded-3xl border border-purple-500/30 overflow-hidden bg-black/40 backdrop-blur-xl">
          <SearchBar 
            onSearch={onSearch} 
            isCompact={false} 
            defaultQuery=""
            isDeepSearch={isDeepSearch}
            setIsDeepSearch={setIsDeepSearch}
            isDark={true}
            currentTheme={{ accent: '#a855f7' }}
          />
        </div>

        {/* 4. 3 Güvenlik Garantisi Kartı */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-2">
          
          {/* Kart 1: Sıfır Geçmiş */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 backdrop-blur-md transition-all hover:border-purple-500/40">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5 border border-purple-500/30">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">
              Geçmişe Kaydedilmez
            </h3>
            <p className="text-[11px] text-purple-200/60 leading-relaxed">
              Aranan kelimeler ve açılan adresler ana geçmişe ve vitrine asla yazılmaz.
            </p>
          </div>

          {/* Kart 2: Buharlaşan Bellek */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 backdrop-blur-md transition-all hover:border-indigo-500/40">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2.5 border border-indigo-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">
              Bellek İzolasyonu (RAM)
            </h3>
            <p className="text-[11px] text-indigo-200/60 leading-relaxed">
              Çerezler ve oturumlar diske yazılmaz; sekme kapandığı an RAM'den tamamen silinir.
            </p>
          </div>

          {/* Kart 3: SponsorBlock & Kalkan */}
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 backdrop-blur-md transition-all hover:border-rose-500/40">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2.5 border border-rose-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">
              SponsorBlock & Kalkan
            </h3>
            <p className="text-[11px] text-rose-200/60 leading-relaxed">
              Video reklamları ve Youtube sponsor bölümleri gizli modda da otomatik atlanır.
            </p>
          </div>

        </div>

        {/* 5. Alt Aksiyonlar */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs">
          <button
            onClick={() => {
              sound.playClick();
              if (onOpenNormalTab) onOpenNormalTab();
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 font-semibold transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
          >
            <span>Normal Sekmeye Geç (+)</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              if (onOpenAdBlocker) onOpenAdBlocker();
            }}
            className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-semibold transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Kalkan Ultra & Ses Ayarları</span>
          </button>
        </div>

      </div>
    </div>
  );
}
