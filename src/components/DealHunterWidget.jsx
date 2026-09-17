import React, { useState } from 'react';
import { 
  Tag, Gift, Sparkles, X, Check, Copy, ExternalLink, 
  TrendingDown, ShieldCheck, ChevronRight, Zap, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/soundService';
import { DEAL_HUNTER_COUPONS } from '../services/sponsoredAdsService';

export default function DealHunterWidget({ 
  isDark = true, 
  onOpenStore,
  activeQuery = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [savingsTotal, setSavingsTotal] = useState(650);

  const handleToggle = () => {
    sound?.playChime?.();
    setIsOpen(prev => !prev);
  };

  const handleCopy = (code, discountValue = 50) => {
    sound?.playChime?.();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setSavingsTotal(prev => prev + discountValue);

    // Viral Confetti Patlaması
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.85, x: 0.9 },
      colors: ['#38bdf8', '#34d399', '#fbbf24', '#f43f5e']
    });

    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <>
      {/* Sağ Altta Sabit Yüzen Apple VisionOS Fırsat Rozeti */}
      <div className="fixed bottom-5 right-5 z-40 animate-bounce-gentle">
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group ${
            isDark
              ? 'bg-[#0f172a]/90 border-amber-500/30 text-amber-300 shadow-amber-500/10 hover:border-amber-400'
              : 'bg-white/95 border-amber-500/40 text-amber-900 shadow-xl hover:border-amber-600'
          }`}
          title="NovaTürk AI Fırsat Avcısı & Canlı Kupon Kalkanı"
        >
          <div className="relative">
            <Gift className="w-4 h-4 text-amber-400 animate-wiggle" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black tracking-wide flex items-center gap-1 uppercase">
              Fırsat Avcısı <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            </span>
            <span className="text-[9px] opacity-70 font-mono">
              {DEAL_HUNTER_COUPONS.length} Aktif Kupon & Tasarruf
            </span>
          </div>

          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
            %15 OFF
          </span>
        </button>
      </div>

      {/* Açılır Fırsat & Kupon Kalkanı Modalı */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-96 max-w-[calc(100vw-2.5rem)] animate-slideUp">
          <div className={`apple-glass-card rounded-3xl p-5 border shadow-2xl backdrop-blur-2xl transition-all ${
            isDark 
              ? 'bg-[#080c14]/95 border-amber-500/25 text-slate-100 shadow-black/80' 
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-2xl'
          }`}>
            
            {/* Modal Başlığı */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold flex items-center gap-1.5">
                    <span>NovaTürk Fırsat Avcısı</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                      CANLI
                    </span>
                  </h3>
                  <p className="text-[10px] opacity-60">Alışverişinde otomatik kupon ve komisyon kalkanı</p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound?.playClick?.();
                  setIsOpen(false);
                }}
                className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 opacity-70" />
              </button>
            </div>

            {/* Canlı Tasarruf Sayacı (Viral Sosyal Kanıt) */}
            <div className={`rounded-2xl p-3 mb-3 border flex items-center justify-between ${
              isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] opacity-70 block">Toplam Kullanıcı Tasarrufu</span>
                  <span className="text-sm font-black tracking-tight text-emerald-400">
                    +{savingsTotal} TL Cepte
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/25">
                🎉 %100 Doğrulanmış
              </span>
            </div>

            {/* Kupon Listesi */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 no-scrollbar mb-3">
              {DEAL_HUNTER_COUPONS.map((coupon, idx) => {
                const isCopied = copiedCode === coupon.code;

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl p-3 border transition-all duration-200 flex flex-col justify-between gap-2 ${
                      isDark 
                        ? 'bg-white/[0.03] border-white/10 hover:border-white/20' 
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-sky-400 truncate max-w-[180px]">
                        {coupon.store}
                      </span>
                      <span className="text-[9px] font-mono opacity-50">
                        {coupon.expires}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold leading-tight">{coupon.title}</h4>
                        <span className="text-[10px] text-amber-400 font-bold">{coupon.discount}</span>
                      </div>

                      <button
                        onClick={() => handleCopy(coupon.code, 75)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                          isCopied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-current border border-white/10'
                        }`}
                        title="Kodu Kopyala"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Kopyalandı!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 opacity-60" />
                            <span>{coupon.code}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alt Bilgi */}
            <div className="text-[10px] opacity-50 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>NovaTürk Fırsat Ağı: Alışverişlerinizde otomatik tasarruf koruması</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
