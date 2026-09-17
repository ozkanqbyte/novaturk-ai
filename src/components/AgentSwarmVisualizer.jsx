import React, { useState } from 'react';
import { 
  ShieldCheck, Search, Database, FileText, CheckCircle2, 
  ChevronDown, ChevronUp, Bot, Check
} from 'lucide-react';
import { sound } from '../services/soundService';

export default function AgentSwarmVisualizer({ agentData, isDark }) {
  const [isOpen, setIsOpen] = useState(false); // Default collapsed for ultra-minimalism!

  if (!agentData) return null;

  const { scout, judge, analyst, devilsAdvocate, bargainHunter, executor } = agentData;

  const agents = [
    { id: 'scout', icon: Search, name: 'Kâşif', badge: scout?.metrics || '3 Motor', desc: scout?.actionText },
    { id: 'judge', icon: ShieldCheck, name: 'Hâkim', badge: judge?.confidenceScore || '%99.2', desc: judge?.actionText },
    { id: 'devilsAdvocate', icon: Database, name: 'Şeytanın Avukatı', badge: devilsAdvocate?.neutralityScore || '%99.4', desc: 'Ters Köşe & Riskler' },
    { id: 'bargainHunter', icon: CheckCircle2, name: 'Pazarlıkçı', badge: bargainHunter?.isShoppingQuery ? 'İndirim Tespiti' : 'İzleme', desc: 'Sahte İndirim & Dip Fiyat' },
    { id: 'executor', icon: FileText, name: 'İcracı', badge: 'Eylemler Hazır', desc: executor?.actionText }
  ];

  return (
    <div className={`apple-glass rounded-2xl overflow-hidden mb-4 transition-all duration-200 ${
      isDark ? 'border-white/10' : 'border-black/8'
    }`}>
      {/* Ultra-Slim Compact Bar */}
      <div 
        onClick={() => {
          sound.playClick();
          setIsOpen(!isOpen);
        }}
        className={`px-4 py-2.5 flex items-center justify-between cursor-pointer select-none transition-colors ${
          isDark ? 'bg-white/[0.02] hover:bg-white/[0.04]' : 'bg-black/[0.01] hover:bg-black/[0.03]'
        }`}
      >
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <Bot className="w-3.5 h-3.5 opacity-70" />
            <span className="text-xs font-semibold">5 Otonom Ajan Ekibi:</span>
          </div>

          <div className="flex items-center gap-2">
            {agents.map((ag) => {
              const Icon = ag.icon;
              return (
                <div 
                  key={ag.id} 
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border shrink-0 ${
                    isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-black/5 border-black/10 text-slate-700'
                  }`}
                >
                  <Icon className="w-3 h-3 opacity-60" />
                  <span className="font-medium">{ag.name}</span>
                  <span className="opacity-40">•</span>
                  <span className="opacity-75">{ag.badge}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button className="p-1 rounded-md opacity-50 hover:opacity-100 shrink-0 ml-2">
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Details */}
      {isOpen && (
        <div className={`p-3.5 grid grid-cols-2 sm:grid-cols-5 gap-2 border-t text-xs ${
          isDark ? 'border-white/5 bg-white/[0.01]' : 'border-black/5 bg-black/[0.01]'
        }`}>
          {agents.map((ag) => (
            <div key={ag.id} className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
              <span className="font-semibold block text-[11px]">{ag.name} Ajanı</span>
              <span className="text-[10px] opacity-60 leading-snug block mt-0.5">{ag.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
