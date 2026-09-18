import React from 'react';
import { EyeOff, ShieldCheck, Lock, Sparkles, ArrowRight, Compass, Shield } from 'lucide-react';
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
  const themeAccent = currentTheme?.accent || '#38bdf8';

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto text-slate-100 z-10 animate-fadeIn">
      
      {/* 🌟 Apple Stealth Titanyum & Cam Arka Plan Işıması (Sıfır Mor!) */}
      <div className="absolute top-1/6 left-1/2 -translate-x-1/2 w-[500px] h-[360px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/3 w-[360px] h-[260px] bg-slate-400/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center space-y-7 my-auto">
        
        {/* 1. Apple Safari Özel Dolaşma Squircle Rozeti */}
        <div className="relative group">
          <div 
            style={{
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
            className="w-20 h-20 rounded-3xl bg-[#0c1017]/90 border border-white/20 flex items-center justify-center backdrop-blur-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-sky-400/50"
          >
            <EyeOff className="w-10 h-10 text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-slate-900 text-sky-400 text-[10px] font-black tracking-widest uppercase shadow-md border border-white/20">
            ÖZEL
          </div>
        </div>

        {/* 2. Apple Tipografisi Başlık ve Açıklama */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/15 text-slate-300 text-xs font-semibold backdrop-blur-md">
            <Lock className="w-3.5 h-3.5 text-sky-400" />
            <span>Apple Standartlarında Özel Dolaşma</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-['Outfit',sans-serif] tracking-tight text-white drop-shadow-md">
            Tamamen Görünmezsiniz.
          </h1>

          <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
            Bu sekmede yaptığınız aramalar, ziyaret ettiğiniz sayfalar ve form verileri 
            yerel geçmişinize <strong className="text-slate-200">asla kaydedilmez</strong>. Sekmeyi kapattığınız an tüm oturum ve çerezler iz bırakmadan buharlaşır.
          </p>
        </div>

        {/* 3. Arama Çubuğu (Apple Safari Titanyum Cam Kapsül) */}
        <div 
          style={{
            boxShadow: '0 15px 40px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.15)'
          }}
          className="w-full max-w-2xl rounded-full border border-white/20 overflow-hidden bg-[#07090e]/80 backdrop-blur-2xl"
        >
          <SearchBar 
            onSearch={onSearch} 
            isCompact={false} 
            defaultQuery=""
            isDeepSearch={isDeepSearch}
            setIsDeepSearch={setIsDeepSearch}
            isDark={true}
            currentTheme={{ accent: '#38bdf8' }}
          />
        </div>

        {/* 4. 3 Apple Güvenlik Garantisi Kartı */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-2">
          
          {/* Kart 1: Sıfır Geçmiş */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:border-white/20">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-2.5 border border-sky-400/30">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">
              Sıfır Yerel Geçmiş
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Aranan terimler ve ziyaret edilen web siteleri ana geçmişe veya arama vitrinine asla yazılmaz.
            </p>
          </div>

          {/* Kart 2: Buharlaşan Bellek */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:border-white/20">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2.5 border border-emerald-400/30">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">
              Bellek İzolasyonu (RAM)
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Çerezler ve oturumlar diske depolanmaz; sekme kapandığı an RAM'den tamamen silinir.
            </p>
          </div>

          {/* Kart 3: SponsorBlock & Ultra Kalkan */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:border-white/20">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2.5 border border-amber-400/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">
              İzleyici Koruması Ultra
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Siteler arası reklam takipçileri ve YouTube sponsorlukları özel modda da otomatik engellenir.
            </p>
          </div>

        </div>

        {/* 5. Alt Aksiyon Butonları (Apple Glass Pills) */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs">
          <button
            onClick={() => {
              sound.playClick();
              if (onOpenNormalTab) onOpenNormalTab();
            }}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 font-semibold transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>Normal Sekmeye Geç (+)</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              if (onOpenAdBlocker) onOpenAdBlocker();
            }}
            className="px-4 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 font-semibold transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Kalkan Ultra & Gizlilik</span>
          </button>
        </div>

      </div>
    </div>
  );
}
