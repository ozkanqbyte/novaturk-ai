import React from 'react';
import { Clock, ArrowUpRight, X, Sparkles } from 'lucide-react';
import { sound } from '../services/soundService';

export default function RecentVisitsSection({ history = [], onSelectVisit, onRemoveItem, isDark }) {
  const visits = history.filter(item => item.type === 'visit').slice(0, 6);

  if (visits.length === 0) return null;

  const formatTime = (ts) => {
    if (!ts) return 'Az önce';
    const diffMin = Math.floor((Date.now() - ts) / (1000 * 60));
    if (diffMin < 1) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dk önce`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} sa önce`;
    return `${Math.floor(diffHours / 24)} gün önce`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-2.5 px-1 text-xs opacity-60">
        <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-sky-400" /> Sık Ziyaret Edilenler
        </span>
        <span className="text-[10px] font-mono opacity-60">Hızlı Geri Dönüş</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {visits.map((item) => {
          let domain = item.hostname || 'web';
          try { domain = new URL(item.url).hostname; } catch {}

          return (
            <div
              key={item.id}
              onClick={() => {
                sound.playClick();
                onSelectVisit(item.url);
              }}
              className={`group relative p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 shadow-xs ${
                isDark 
                  ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20' 
                  : 'bg-white/80 border-black/10 hover:bg-white hover:border-black/20 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} 
                    alt="" 
                    className="w-3.5 h-3.5 object-contain rounded-xs"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate group-hover:text-sky-400 transition-colors">
                    {item.title || domain}
                  </p>
                  <p className="text-[10px] opacity-40 font-mono truncate">
                    {formatTime(item.timestamp)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-80 transition-opacity" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onRemoveItem(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-70 hover:opacity-100 p-1 rounded hover:bg-rose-500/20 hover:text-rose-400 transition-all ml-0.5"
                  title="Kaldır"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
