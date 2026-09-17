import React from 'react';
import { 
  Sparkles, ExternalLink, ArrowUpRight, Plus, 
  ShieldCheck, Award, Zap, Tag
} from 'lucide-react';
import { sound } from '../services/soundService';
import { SHOWCASE_PARTNERS, trackAdClick } from '../services/sponsoredAdsService';

export default function SponsoredShowcase({ 
  onSelectPartner, 
  onOpenBusinessModal, 
  isDark = true,
  currentTheme 
}) {
  const handlePartnerClick = (partner) => {
    sound?.playClick?.();
    trackAdClick(partner.id, partner.name);
    if (onSelectPartner) {
      onSelectPartner({
        link: partner.url,
        title: `${partner.name} - ${partner.desc}`,
        displayLink: partner.domain
      });
    } else {
      window.open(partner.url, '_blank');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 animate-fadeIn">
      {/* Vitrin Başlığı */}
      <div className="flex items-center justify-between px-2 mb-2.5 text-xs">
        <div className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex items-center gap-1.5 opacity-85">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Öne Çıkan Yerli Partnerler & Fırsat Vitrini</span>
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-semibold uppercase">
            Sponsorlu Vitrin
          </span>
        </div>

        <button
          onClick={() => {
            sound?.playClick?.();
            onOpenBusinessModal?.();
          }}
          className="text-[11px] opacity-70 hover:opacity-100 text-amber-400 hover:underline flex items-center gap-1 transition-opacity cursor-pointer font-medium"
        >
          <span>Markanızı Ekleyin</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Yatay Akıcı Partner Kartları Izgarası */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {SHOWCASE_PARTNERS.map((partner) => (
          <div
            key={partner.id}
            onClick={() => handlePartnerClick(partner)}
            className={`group relative apple-glass-card rounded-2xl p-3 border transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer flex flex-col justify-between text-left overflow-hidden ${
              isDark 
                ? 'bg-white/[0.025] border-white/8 hover:border-amber-400/40 hover:bg-white/[0.05]' 
                : 'bg-white/80 border-black/8 hover:border-amber-500/50 hover:bg-white shadow-xs'
            }`}
          >
            {/* Üst Logo ve Kampanya Rozeti */}
            <div className="flex items-center justify-between mb-2">
              <div className="w-6 h-6 rounded-xl bg-white/10 p-1 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                <img 
                  src={`https://www.google.com/s2/favicons?domain=${partner.domain}&sz=32`} 
                  alt={partner.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>

              <span 
                style={{ backgroundColor: `${partner.color}20`, color: partner.color, borderColor: `${partner.color}40` }}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border font-mono tracking-tight shrink-0"
              >
                {partner.tag}
              </span>
            </div>

            {/* Marka Adı ve Açıklaması */}
            <div>
              <h4 className="text-xs font-bold truncate group-hover:text-amber-400 transition-colors flex items-center justify-between">
                <span>{partner.name}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className={`text-[10px] truncate font-normal mt-0.5 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {partner.desc}
              </p>
            </div>

            {/* Alt Mikro Rozet */}
            <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[9px] opacity-60">
              <span className="truncate">{partner.badge}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
