import React, { useState } from 'react';
import { GitFork, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { sound } from '../services/soundService';

export default function MindMapWidget({ query, onNodeClick }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Generate dynamic concept nodes based on the search query
  const cleanQ = query || 'Arama Konusu';
  const nodes = [
    { id: 1, label: 'Gelecek & Trendler', sub: '2026-2030 Projeksiyonu', query: `${cleanQ} gelecek trendleri ve 2026 vizyonu`, x: 80, y: 55, color: '#10b981' },
    { id: 2, label: 'Türkiye Ekosistemi', sub: 'Yerli Girişimler & Ar-Ge', query: `Türkiye'de ${cleanQ} projeleri ve yatırımlar`, x: 320, y: 50, color: '#06b6d4' },
    { id: 3, label: 'Akademik & Bilim', sub: 'Hakemli Araştırmalar', query: `${cleanQ} akademik makaleler ve tezler`, x: 75, y: 225, color: '#8b5cf6' },
    { id: 4, label: 'Ekonomi & Piyasalar', sub: 'Finansal Boyut', query: `${cleanQ} sektörel ve ekonomik etkileri`, x: 325, y: 230, color: '#f59e0b' },
  ];

  const handleSelect = (nodeQuery) => {
    sound.playClick();
    onNodeClick(nodeQuery);
  };

  return (
    <div className="vision-glass rounded-[32px] p-6 relative overflow-hidden border border-cyan-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-white">
            <GitFork className="w-4 h-4 rotate-90" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white font-['Outfit',sans-serif] flex items-center gap-1.5">
              <span>NovaTürk Nöron Zihin Haritası</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                CANLI GRAF
              </span>
            </h4>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">Düğümlere tıklayarak derinleşin</span>
      </div>

      {/* SVG Interactive Constellation Graph */}
      <div className="relative w-full h-[290px] flex items-center justify-center select-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 290">
          <defs>
            <linearGradient id="lineGrad1" x1="200" y1="140" x2="80" y2="55" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="lineGrad2" x1="200" y1="140" x2="320" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="lineGrad3" x1="200" y1="140" x2="75" y2="225" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="lineGrad4" x1="200" y1="140" x2="325" y2="230" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Glowing Animated Connection Beams */}
          <line x1="200" y1="140" x2="80" y2="55" stroke="url(#lineGrad1)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
          <line x1="200" y1="140" x2="320" y2="50" stroke="url(#lineGrad2)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
          <line x1="200" y1="140" x2="75" y2="225" stroke="url(#lineGrad3)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
          <line x1="200" y1="140" x2="325" y2="230" stroke="url(#lineGrad4)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
        </svg>

        {/* Center Root Node */}
        <div className="absolute top-[140px] left-[200px] -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 p-[2px] shadow-[0_0_30px_rgba(6,182,212,0.6)] animate-pulse">
              <div className="w-full h-full rounded-full bg-[#070d24] flex flex-col items-center justify-center p-2 text-center">
                <Sparkles className="w-4 h-4 text-cyan-300 mb-0.5" />
                <span className="text-[11px] font-black text-white line-clamp-2 leading-tight">
                  {cleanQ}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Satellite Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            onClick={() => handleSelect(node.query)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              position: 'absolute',
              left: `${(node.x / 400) * 100}%`,
              top: `${(node.y / 290) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="z-20 cursor-pointer group"
          >
            <div className={`p-2.5 sm:p-3 rounded-2xl bg-[#09112a]/90 backdrop-blur-xl border transition-all duration-300 shadow-glass ${
              hoveredNode === node.id 
                ? 'scale-110 border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.5)] -translate-y-1' 
                : 'border-white/15 hover:border-white/30'
            }`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
                <h5 className="text-[11px] font-bold text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap">
                  {node.label}
                </h5>
              </div>
              <span className="text-[9px] text-slate-400 block whitespace-nowrap">
                {node.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-2 text-[11px] text-slate-400">
        💡 Bir kavram seçtiğinizde yapay zeka o perspektiften yeni bir araştırma başlatır.
      </div>
    </div>
  );
}
