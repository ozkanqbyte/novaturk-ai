import React, { useState, useEffect } from 'react';
import { X, Key, Globe, Sparkles, Check, ExternalLink, ShieldCheck, Cpu, Terminal } from 'lucide-react';
import { getApiConfig, saveApiConfig } from '../services/searchService';
import { sound } from '../services/soundService';

export default function ApiSettingsModal({ isOpen, onClose }) {
  const [braveApiKey, setBraveApiKey] = useState('');
  const [searxngUrl, setSearxngUrl] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [googleCx, setGoogleCx] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const current = getApiConfig();
      setBraveApiKey(current.braveApiKey || '');
      setSearxngUrl(current.searxngUrl || 'https://searx.be');
      setGeminiApiKey(current.geminiApiKey || '');
      setGoogleApiKey(current.googleApiKey || '');
      setGoogleCx(current.googleCx || '');
      setStatusMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    sound.playChime();
    saveApiConfig({
      braveApiKey: braveApiKey.trim(),
      searxngUrl: searxngUrl.trim(),
      geminiApiKey: geminiApiKey.trim(),
      googleApiKey: googleApiKey.trim(),
      googleCx: googleCx.trim()
    });
    setStatusMsg('✅ 3 Ayaklı Hibrit Motor ayarları kaydedildi!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    sound.playClick();
    setBraveApiKey('');
    setSearxngUrl('https://searx.be');
    setGeminiApiKey('');
    setGoogleApiKey('');
    setGoogleCx('');
    saveApiConfig({
      braveApiKey: '',
      searxngUrl: 'https://searx.be',
      geminiApiKey: '',
      googleApiKey: '',
      googleCx: ''
    });
    setStatusMsg('Sıfırlandı. NovaTürk Türk İndeksi ve Açık Kaynak varsayılan devrede.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fadeIn">
      <div className="apple-glass w-full max-w-xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] relative max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit',sans-serif]">
              3 Ayaklı Hibrit Motor & API Masası
            </h3>
            <p className="text-xs text-slate-400">
              NovaTürk Türk İndeksi + Brave API + Açık Kaynak SearXNG Altyapısı
            </p>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            NovaTürk, API anahtarı olmadan da 50 Türk sitesi indeksi ve ücretsiz açık kaynak P2P ağıyla çalışır. Kendi Brave veya Gemini anahtarınızı ekleyerek hız ve zekâyı en üst seviyeye taşıyabilirsiniz.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-3.5 text-xs sm:text-sm">
          
          {/* 1. AYAK: 50 Türk Sitesi İndeksi (Kilitli/Dahili) */}
          <div className="p-3 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="font-semibold text-xs text-emerald-300 block">1. Ayak: 50 Seçkin Türk Sitesi İndeksi</span>
                <span className="text-[10px] text-slate-400">Webrazzi, AA, TRT, TÜBİTAK, Borsa İstanbul (Dahili & 0ms)</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              AKTİF
            </span>
          </div>

          {/* 2. AYAK: Brave Search API Key */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Ayak: Brave Search API Key (Bağımsız Küresel İndeks)</span>
              </label>
              <a
                href="https://brave.com/search/api/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5"
              >
                Ücretsiz 2.000 Arama Al <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={braveApiKey}
              onChange={(e) => setBraveApiKey(e.target.value)}
              placeholder="BSA... (Boş bırakılırsa simüle bağımsız mod çalışır)"
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* 3. AYAK: Açık Kaynak SearXNG Örneği */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>3. Ayak: Açık Kaynak SearXNG URL (Sansürsüz & Ücretsiz)</span>
              </label>
              <span className="text-[10px] text-slate-400">Örn: https://searx.be</span>
            </div>
            <input
              type="text"
              value={searxngUrl}
              onChange={(e) => setSearxngUrl(e.target.value)}
              placeholder="https://searx.be"
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors font-mono"
            />
          </div>

          {/* Google Gemini API Key */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Gemini API Key (Canlı LLM Akıl Yürütme)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                AI Studio'dan Ücretsiz Al <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy... (Boş bırakılırsa yerel akıllı sentez çalışır)"
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium">
              {statusMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="apple-pill-btn px-3.5 py-2 rounded-full text-xs text-slate-400 hover:text-rose-300"
            >
              Sıfırla
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="apple-pill-btn px-4 py-2 rounded-full text-xs"
              >
                İptal
              </button>
              <button
                type="submit"
                className="apple-primary-btn px-5 py-2 rounded-full text-xs font-bold"
              >
                Kaydet & Uygula
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
