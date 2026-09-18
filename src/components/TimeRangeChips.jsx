import React from 'react';
import { Calendar } from 'lucide-react';
import { sound } from '../services/soundService';

export const TIME_OPTIONS = [
  { id: 'all', label: 'Her zaman' },
  { id: 'hour', label: 'Son 1 saat', newsOnly: true },
  { id: 'day', label: 'Son 24 saat' },
  { id: 'week', label: 'Son hafta' },
  { id: 'month', label: 'Son ay' },
  { id: 'year', label: 'Son yıl' }
];

// Haber servisinin (Google News) anladığı zaman kodları
export const NEWS_WHEN = { hour: '1h', day: '1d', week: '7d', month: '30d', year: '1y' };

export default function TimeRangeChips({ value, onChange, isDark, includeHour = false, disabled = false }) {
  const options = TIME_OPTIONS.filter(o => includeHour || !o.newsOnly);
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]" role="group" aria-label="Zaman aralığı">
      <Calendar className="w-3 h-3 opacity-50 shrink-0" />
      {options.map(o => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => { sound.playClick(); onChange(o.id); }}
            className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap border transition-all disabled:opacity-50 ${
              active
                ? (isDark ? 'bg-sky-500/20 border-sky-400/40 text-sky-300 font-semibold' : 'bg-sky-100 border-sky-300 text-sky-800 font-semibold')
                : (isDark ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-black/5 border-black/5 text-slate-600 hover:text-black')
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
