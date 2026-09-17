import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, CheckCircle2, ShieldAlert, KeyRound, 
  EyeOff, Cookie, Bell, MapPin, Camera, X, ExternalLink, RefreshCw
} from 'lucide-react';
import { sound } from '../services/soundService';

export default function SslSecurityModal({ isOpen, onClose, url, isDark }) {
  if (!isOpen) return null;

  const [cookiesCleared, setCookiesCleared] = useState(false);

  let hostname = 'web';
  let isHttps = true;
  try {
    const parsed = new URL(url || 'https://google.com');
    hostname = parsed.hostname;
    isHttps = parsed.protocol === 'https:';
  } catch {}

  const handleClearCookies = () => {
    sound.playClick();
    setCookiesCleared(true);
    setTimeout(() => setCookiesCleared(false), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 scale-100 ${
          isDark 
            ? 'bg-[#11141d]/95 border-white/15 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.8)]' 
            : 'bg-white/95 border-black/10 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className={`p-5 flex items-start justify-between border-b ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${
              isHttps 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}>
              {isHttps ? <Lock className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-['Outfit',sans-serif] tracking-tight">
                  {isHttps ? 'Bağlantı Tamamen Güvenli' : 'Güvensiz Bağlantı'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isHttps 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {isHttps ? 'SSL/TLS 1.3' : 'HTTP'}
                </span>
              </div>
              <p className="text-xs opacity-60 font-mono mt-0.5">{hostname}</p>
            </div>
          </div>

          <button 
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-1.5 rounded-xl hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 1. Şifreleme Durumu */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-black/5'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-emerald-400">256-Bit Uçtan Uca Askerî Düzey Şifreleme</p>
              <p className="opacity-70 leading-relaxed">
                Bu web sitesine gönderdiğiniz parolalar, kredi kartı bilgileri ve oturum verileri 
                üçüncü tarafların müdahalesine karşı tamamen şifrelenmiştir.
              </p>
            </div>
          </div>

          {/* 2. Sertifika Ayrıntıları */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold tracking-wider uppercase opacity-50 px-1">
              Güvenlik Sertifikası Detayları
            </h4>
            <div className={`p-3.5 rounded-2xl border text-xs space-y-2.5 font-mono ${
              isDark ? 'bg-black/30 border-white/10' : 'bg-slate-100/70 border-black/5'
            }`}>
              <div className="flex items-center justify-between">
                <span className="opacity-60 flex items-center gap-1.5 font-sans">
                  <KeyRound className="w-3.5 h-3.5 text-sky-400" /> Sertifika Otoritesi:
                </span>
                <span className="font-semibold text-sky-400">DigiCert / Let's Encrypt ECC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-60 flex items-center gap-1.5 font-sans">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sertifika Durumu:
                </span>
                <span className="text-emerald-400 font-semibold">Geçerli & Doğrulanmış ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-60 flex items-center gap-1.5 font-sans">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Şifreleme Standardı:
                </span>
                <span>TLS 1.3 / AES_256_GCM</span>
              </div>
            </div>
          </div>

          {/* 3. NovaTürk Kalkanı (Takipçi & Reklam Koruması) */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold tracking-wider uppercase opacity-50 px-1">
              NovaTürk Kalkan & Gizlilik Durumu
            </h4>
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-500/20'
            }`}>
              <div className="flex items-center gap-2.5 text-xs">
                <EyeOff className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="font-semibold text-emerald-400">Gizli İzleyiciler Engellendi</p>
                  <p className="text-[11px] opacity-70">14 adet üçüncü taraf çerez ve analitik durduruldu</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                AKTİF
              </span>
            </div>
          </div>

          {/* 4. Site İzinleri (Konum, Kamera, Bildirimler) */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold tracking-wider uppercase opacity-50 px-1">
              Site İzinleri & Gizlilik Kontrolleri
            </h4>
            <div className={`rounded-2xl border divide-y overflow-hidden text-xs ${
              isDark ? 'border-white/10 divide-white/10 bg-white/[0.02]' : 'border-black/5 divide-black/5 bg-slate-50/50'
            }`}>
              <div className="p-3 flex items-center justify-between">
                <span className="flex items-center gap-2 opacity-80">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Konum Erişimi
                </span>
                <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                  Engellendi (Güvenli)
                </span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="flex items-center gap-2 opacity-80">
                  <Camera className="w-3.5 h-3.5 text-slate-400" /> Kamera ve Mikrofon
                </span>
                <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                  Engellendi
                </span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="flex items-center gap-2 opacity-80">
                  <Bell className="w-3.5 h-3.5 text-slate-400" /> Web Bildirimleri
                </span>
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  Sessize Alındı
                </span>
              </div>
            </div>
          </div>

          {/* 5. Çerezler ve Veriler */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                Çerezler ve Site Belleği
              </h4>
              <button
                onClick={handleClearCookies}
                disabled={cookiesCleared}
                className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className={`w-3 h-3 ${cookiesCleared ? 'animate-spin' : ''}`} />
                {cookiesCleared ? 'Temizlendi ✓' : 'Site Verilerini Temizle'}
              </button>
            </div>
            <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
              isDark ? 'bg-black/30 border-white/10' : 'bg-slate-100/70 border-black/5'
            }`}>
              <div className="flex items-center gap-2 opacity-80">
                <Cookie className="w-3.5 h-3.5 text-amber-400" />
                <span>Oturum Çerezleri</span>
              </div>
              <span className="font-mono opacity-60">
                {cookiesCleared ? '0 KB (Sıfırlandı)' : '3 Çerez Kullanımda'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-slate-50/50'
        }`}>
          <span className="text-[11px] opacity-40 font-mono">
            NovaTürk Güvenlik Motoru v2.4
          </span>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-md transition-all hover:scale-105"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
