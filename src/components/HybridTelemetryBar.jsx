import React from 'react';
import { Cpu, Globe, Shield, Zap, CheckCircle2 } from 'lucide-react';

export default function HybridTelemetryBar({ hybridTelemetry, isDark, currentTheme }) {
  if (!hybridTelemetry?.pillars) return null;

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  return (
    <div className={`apple-glass rounded-2xl p-2.5 sm:p-3 mb-3.5 transition-all ${
      isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/8 bg-black/[0.02]'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        
        {/* Left Title */}
        <div className="flex items-center gap-2 shrink-0">
          <div 
            style={{ backgroundColor: `${themeAccent}20`, color: themeAccent }}
            className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
          >
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-tight block font-['Outfit',sans-serif]">
              3 Ayaklı Hibrit Motor
            </span>
            <span className="text-[10px] opacity-60 leading-none block">
              Eşzamanlı Dağıtık Arama ({hybridTelemetry.executionTime})
            </span>
          </div>
        </div>

        {/* The 3 Pillars Badges */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {hybridTelemetry.pillars.map((pillar) => (
            <div
              key={pillar.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] border font-medium whitespace-nowrap transition-all ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                pillar.id === 'turkish-index' ? 'bg-emerald-400 animate-ping' :
                pillar.id === 'brave-api' ? 'bg-amber-400' : 'bg-cyan-400'
              }`} />
              <span className="font-semibold">{pillar.shortName}</span>
              <span className="opacity-40">•</span>
              <span className="opacity-80 font-mono text-[10px]">{pillar.latency}</span>
              <span className={`text-[9px] px-1 py-0.2 rounded border ${pillar.badgeColor}`}>
                {pillar.status}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
