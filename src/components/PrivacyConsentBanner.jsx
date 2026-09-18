import React, { useEffect, useState } from 'react';
import { ShieldCheck, ChevronDown, Check, X } from 'lucide-react';
import { getLearningConsent, setLearningConsent, onLearningConsentChange } from '../services/learningService';
import { sound } from '../services/soundService';

const WILL = [
  'Aradığın kelime ve tıkladığın sonuç (yalnızca hangi aramada hangi sonucun işe yaradığını öğrenmek için).',
  'Uygulama içi tarayıcıda açtığın herkese açık sayfaların adresi (sorgu parametreleri olmadan).'
];
const WONT = [
  'IP adresin, hesabın, çerezlerin veya kimliğin saklanmaz; veriler kişiye bağlanmaz.',
  'Gizli sekmelerde hiçbir şey gönderilmez.',
  'Giriş, e-posta, banka, ödeme ve hesap sayfaları hiçbir zaman indekslenmez.',
  'Sayfaların içeriğini sen göndermezsin; sunucumuz adresi kimliksiz olarak kendisi indirir.',
  'e-posta, telefon, kimlik numarası gibi kişisel veriye benzeyen aramalar kaydedilmez.'
];

export default function PrivacyConsentBanner() {
  const [decided, setDecided] = useState(() => getLearningConsent().decided);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => onLearningConsentChange(() => setDecided(getLearningConsent().decided)), []);

  useEffect(() => {
    if (decided) { setVisible(false); return undefined; }
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, [decided]);

  if (decided || !visible) return null;

  const choose = (clicks, browse) => {
    sound.playClick();
    setLearningConsent({ clicks, browse });
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="nv-consent-title"
      aria-describedby="nv-consent-desc"
      className="nv-consent fixed z-[60] left-1/2 -translate-x-1/2 bottom-4 sm:bottom-6 w-[calc(100%-1.5rem)] max-w-[560px]"
    >
      <div className="nv-consent-card rounded-[26px] p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className="nv-consent-icon shrink-0" aria-hidden="true">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="nv-consent-title" className="text-[15px] font-semibold tracking-tight">Aramaları birlikte geliştirelim</h2>
            <p id="nv-consent-desc" className="mt-1 text-[13px] leading-relaxed opacity-70">
              Yeni ve nadir aramalarda daha iyi sonuç verebilmek için anonim kullanım verisi toplayabiliriz. Bu tamamen isteğe bağlıdır; istediğin zaman Ayarlar &gt; Gizlilik bölümünden kapatabilirsin.
            </p>

            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              aria-expanded={open}
              aria-controls="nv-consent-details"
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
            >
              Ayrıntılar
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div id="nv-consent-details" className="mt-3 space-y-3 text-[12px] leading-relaxed">
                <div>
                  <p className="font-semibold mb-1">Toplananlar</p>
                  <ul className="space-y-1 opacity-75">
                    {WILL.map(t => <li key={t} className="flex gap-2"><Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" /><span>{t}</span></li>)}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">Asla toplanmayanlar</p>
                  <ul className="space-y-1 opacity-75">
                    {WONT.map(t => <li key={t} className="flex gap-2"><X className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-500" aria-hidden="true" /><span>{t}</span></li>)}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => choose(true, true)} className="nv-consent-btn nv-consent-primary">Kabul et</button>
              <button type="button" onClick={() => choose(true, false)} className="nv-consent-btn">Yalnızca aramalar</button>
              <button type="button" onClick={() => choose(false, false)} className="nv-consent-btn nv-consent-quiet">Hayır, teşekkürler</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
