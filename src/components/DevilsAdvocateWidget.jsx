import React from 'react';
import { Scale, ShieldAlert, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { sound } from '../services/soundService';

export default function DevilsAdvocateWidget({ devilsData, isDark }) {
  if (!devilsData) return null;

  const { thesis, antithesis, balanceVerdict, neutralityScore } = devilsData;

  return (
    <div className={`apple-glass rounded-3xl p-4 sm:p-5 mb-4 border transition-all ${
      isDark ? 'border-white/10' : 'border-black/8'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-white/5 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight font-['Outfit',sans-serif] flex items-center gap-1.5">
              <span>Şeytanın Avukatı (Ters Köşe Ajanı)</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full border bg-purple-500/10 border-purple-500/20 text-purple-400 font-semibold">
                Echo-Chamber Kırıcı
              </span>
            </h3>
            <p className="text-[11px] opacity-60">
              Google tek taraflı sonuç verir; NovaTürk gerçeğin iki yüzünü de serer.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider opacity-50 block">Tarafsızlık</span>
          <span className="text-xs font-bold text-emerald-400">{neutralityScore}</span>
        </div>
      </div>

      {/* Side-by-Side Dual Perspective Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3.5">
        
        {/* Thesis (Savunanlar / Fırsatlar) */}
        <div className={`rounded-2xl p-3.5 border transition-all ${
          isDark 
            ? 'bg-emerald-500/[0.04] border-emerald-500/20 hover:border-emerald-500/35' 
            : 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
        }`}>
          <div className="flex items-center gap-2 mb-2 text-emerald-500 font-semibold text-xs">
            <CheckCircle className="w-3.5 h-3.5" />
            <h4>{thesis?.title || 'Fırsatlar & Avantajlar'}</h4>
          </div>
          <ul className="space-y-1.5 text-xs">
            {thesis?.points?.map((pt, i) => (
              <li key={i} className="flex items-start gap-1.5 leading-relaxed opacity-90">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Antithesis (Ters Köşe / Riskler) */}
        <div className={`rounded-2xl p-3.5 border transition-all ${
          isDark 
            ? 'bg-rose-500/[0.04] border-rose-500/20 hover:border-rose-500/35' 
            : 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
        }`}>
          <div className="flex items-center gap-2 mb-2 text-rose-500 font-semibold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <h4>{antithesis?.title || 'Ters Köşe & Görünmeyen Riskler'}</h4>
          </div>
          <ul className="space-y-1.5 text-xs">
            {antithesis?.points?.map((pt, i) => (
              <li key={i} className="flex items-start gap-1.5 leading-relaxed opacity-90">
                <span className="text-rose-500 font-bold mt-0.5">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Balance Verdict */}
      <div className={`p-3 rounded-xl text-xs leading-relaxed border ${
        isDark ? 'bg-white/[0.02] border-white/5 text-slate-300' : 'bg-black/[0.02] border-black/5 text-slate-700'
      }`}>
        <strong className="text-current font-semibold">NovaTürk Hükmü: </strong>
        <span>{balanceVerdict}</span>
      </div>
    </div>
  );
}
