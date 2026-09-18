import React from 'react';
import { X, ShieldCheck, ExternalLink } from 'lucide-react';
import { API_BASE } from '../services/searchService';
import { sound } from '../services/soundService';

// Bu pencere önceden SAHTEYDİ: "canlı tarama terminali" setTimeout ile uydurulmuş çıktı
// üretiyor, kara liste sabit bir dizi, istatistikler statik bir dosyadan geliyordu ve
// sunucuyla hiçbir bağlantısı yoktu. Gerçek yönetim paneli sunucuda (/admin) çalışır —
// gerçek veriyi, gerçek aksiyonları ve x-admin-key korumasını orada sunar.
// Bu bileşen artık yalnızca oraya yönlendirir.
export default function AdminPanelModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const adminUrl = `${API_BASE}/admin`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0f17]/95 p-6 text-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/15 text-cyan-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Yönetim Paneli</h3>
              <p className="text-xs opacity-60">Sunucu tarafında, anahtar korumalı</p>
            </div>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="rounded-xl p-1.5 opacity-70 transition-colors hover:bg-white/10 hover:opacity-100"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-5 text-sm leading-relaxed opacity-80">
          Gerçek yönetim paneli (site/RSS/domain yönetimi, şikayetler, güvenlik, denetim kaydı ve
          canlı analitik) sunucuda çalışır ve yönetici anahtarı ister.
        </p>

        <a
          href={adminUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sound.playClick()}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
        >
          <span>Yönetim Paneline Git</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
