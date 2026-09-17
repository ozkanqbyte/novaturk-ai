import React, { useState } from 'react';
import { Tag, TrendingDown, AlertCircle, Check, Copy, Zap, ShoppingCart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/soundService';

export default function BargainHunterWidget({ bargainData, isDark }) {
  const [copiedCode, setCopiedCode] = useState(null);

  if (!bargainData?.marketAnalysis) return null;

  const { marketAnalysis } = bargainData;

  const handleCopyCoupon = (code) => {
    sound.playChime();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.4 }
    });
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className={`apple-glass rounded-3xl p-4 sm:p-5 mb-4 border transition-all ${
      isDark ? 'border-amber-500/20 bg-amber-500/[0.02]' : 'border-amber-500/30 bg-amber-50/40'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-amber-500/15">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight font-['Outfit',sans-serif] flex items-center gap-1.5">
              <span>Pazarlıkçı & Fiyat Avcısı Ajanı</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full border bg-amber-500/15 border-amber-500/30 text-amber-500 font-semibold">
                Canlı Piyasa Taraması
              </span>
            </h3>
            <p className="text-[11px] opacity-60">
              Türkiye pazar yerlerindeki sahte indirimleri tespit eder, gerçek dip fiyatı bulur.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider opacity-50 block">Durum</span>
          <span className="text-xs font-bold text-amber-500">Dip Fiyat Alarmı</span>
        </div>
      </div>

      {/* Fake Discount Warning Banner */}
      <div className="mb-3.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 dark:text-rose-200 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          {marketAnalysis.fakeDiscountAlert}
        </p>
      </div>

      {/* Price Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
        <div className={`p-3 rounded-2xl border ${
          isDark ? 'bg-white/[0.02] border-white/8' : 'bg-white border-black/8'
        }`}>
          <span className="text-[10px] uppercase tracking-wider opacity-50 block mb-0.5">
            Piyasa Ortalaması
          </span>
          <span className="text-sm font-semibold opacity-75 line-through">
            {marketAnalysis.marketAverage}
          </span>
        </div>

        <div className={`p-3 rounded-2xl border ${
          isDark ? 'bg-emerald-500/[0.05] border-emerald-500/25' : 'bg-emerald-50 border-emerald-300'
        }`}>
          <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold block mb-0.5 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Gerçek Dip Fiyat
          </span>
          <span className="text-sm font-bold text-emerald-500">
            {marketAnalysis.realDipPrice}
          </span>
        </div>
      </div>

      {/* Working Coupons */}
      {marketAnalysis.testedCoupons?.length > 0 && (
        <div className="mb-3.5">
          <span className="text-[11px] font-semibold opacity-70 block mb-1.5 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Test Edilen Çalışan Kupon Kodları:
          </span>
          <div className="flex flex-wrap gap-2">
            {marketAnalysis.testedCoupons.map((c, i) => (
              <div 
                key={i}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                }`}
              >
                <code className="font-mono font-bold text-amber-400">{c.code}</code>
                <span className="opacity-60 text-[11px]">{c.discount}</span>
                <button
                  onClick={() => handleCopyCoupon(c.code)}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors"
                  title="Kodu Kopyala"
                >
                  {copiedCode === c.code ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-60" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Verdict */}
      <div className={`p-3 rounded-xl text-xs leading-relaxed border ${
        isDark ? 'bg-white/[0.02] border-white/5 text-slate-300' : 'bg-black/[0.02] border-black/5 text-slate-700'
      }`}>
        <strong className="text-amber-500 font-semibold">Pazarlıkçı Kararı: </strong>
        <span>{marketAnalysis.actionVerdict}</span>
      </div>
    </div>
  );
}
