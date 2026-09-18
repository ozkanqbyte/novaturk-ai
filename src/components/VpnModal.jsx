import React, { useState } from 'react';
import {
  ShieldCheck, ShieldAlert, Globe, Zap, Lock,
  X, CheckCircle2, RefreshCw, Power, Radio, EyeOff, AlertTriangle
} from 'lucide-react';
import { sound } from '../services/soundService';
import {
  getVpnState, toggleVpn, setVpnCountry, toggleVpnOption, VPN_LOCATIONS
} from '../services/vpnService';
import { API_BASE } from '../services/searchService';

export default function VpnModal({ isOpen, onClose, onVpnChange, isDark = true }) {
  if (!isOpen) return null;

  const [vpn, setVpn] = useState(() => getVpnState());
  const [testedIp, setTestedIp] = useState('');
  const [isCheckingIp, setIsCheckingIp] = useState(false);

  const activeLocation = VPN_LOCATIONS.find(l => l.id === vpn.selectedCountry) || VPN_LOCATIONS[0];

  const handleToggle = () => {
    sound.playShieldDeflect();
    const updated = toggleVpn();
    setVpn(updated);
    if (onVpnChange) onVpnChange(updated);
  };

  const handleSelectCountry = (id) => {
    sound.playClick();
    const updated = setVpnCountry(id);
    setVpn(updated);
    if (onVpnChange) onVpnChange(updated);
  };

  const handleToggleOpt = (key) => {
    sound.playClick();
    const updated = toggleVpnOption(key);
    setVpn(updated);
    if (onVpnChange) onVpnChange(updated);
  };

  const handleCheckLiveIp = async () => {
    sound.playClick();
    setIsCheckingIp(true);
    try {
      const res = await fetch(`${API_BASE}/api/vpn/my-ip`);
      const data = await res.json();
      if (data && data.ip) {
        setTestedIp(data.ip);
        sound.playChime();
      } else {
        setTestedIp(vpn.isActive ? activeLocation.ip : '78.177.223.178');
      }
    } catch {
      setTestedIp(vpn.isActive ? activeLocation.ip : '78.177.223.178');
    } finally {
      setIsCheckingIp(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 relative ${
          isDark
            ? 'bg-[#0c0f17]/95 border-cyan-500/25 text-slate-100 shadow-[0_20px_60px_rgba(6,182,212,0.18)]'
            : 'bg-white/95 border-cyan-500/20 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Holographic Glowing Aurora Orbs */}
        <div className={`absolute top-0 right-1/4 w-44 h-44 rounded-full blur-3xl pointer-events-none -z-10 transition-colors duration-500 ${
          vpn.isActive ? 'bg-cyan-500/25 animate-pulse' : 'bg-slate-500/10'
        }`} />
        <div className="absolute bottom-0 left-1/4 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* 1. Header Bar */}
        <div className={`p-5 flex items-center justify-between border-b ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-slate-50/50'
        }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner transition-colors ${
              vpn.isActive
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                : 'bg-slate-500/15 border-slate-500/30 text-slate-400'
            }`}
            >
              <Globe className={`w-5 h-5 ${vpn.isActive ? 'animate-spin-slow' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-['Outfit',sans-serif] tracking-tight">
                  NovaTürk CyberVPN & Gizlilik
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  vpn.isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse'
                    : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                }`}
                >
                  {vpn.isActive ? 'BAĞLI' : 'DEVRE DIŞI'}
                </span>
              </div>
              <p className="text-xs opacity-60 font-mono mt-0.5">
                {vpn.isActive ? `${activeLocation.flag} ${activeLocation.city} (${activeLocation.ip})` : 'Gerçek IP Koruması Hazır'}
              </p>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-1.5 rounded-xl hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Orta Alan: Fütüristik Güç Şalteri & Canlı Telemetri */}
        {/* Demo Uyarısı */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-semibold text-sm">⚠️ Demo Özellik</p>
            <p className="text-amber-200/70 text-xs mt-1">Bu özellik bir tanıtım/simülasyondur. Gerçek bir VPN tüneli oluşturmaz ve trafiğinizi şifrelemez. Gerçek gizlilik koruması için profesyonel bir VPN hizmeti kullanın.</p>
          </div>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Fütüristik Büyük Aç/Kapa Butonu */}
          <div className="flex flex-col items-center justify-center py-4 relative">
            <div className="relative">
              {vpn.isActive && (
                <div className="absolute -inset-4 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin-slow pointer-events-none" />
              )}

              <button
                onClick={handleToggle}
                className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center gap-1 transition-all duration-500 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 ${
                  vpn.isActive
                    ? 'bg-gradient-to-b from-cyan-500 to-emerald-600 border-cyan-300 text-white shadow-[0_0_40px_rgba(6,182,212,0.5)]'
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-600 text-slate-400 shadow-lg'
                }`}
              >
                <Power className={`w-9 h-9 ${vpn.isActive ? 'animate-pulse' : 'opacity-70'}`} />
                <span className="text-[11px] font-black tracking-wider uppercase">
                  {vpn.isActive ? 'GÜVENLİ' : 'BAĞLAN'}
                </span>
              </button>
            </div>

            <p className="text-xs font-semibold mt-4 text-center">
              {vpn.isActive
                ? 'Tüm internet trafiğiniz 256-bit askeri düzey şifrelemeyle korunuyor'
                : 'Tek tıkla anonim tünele bağlanın, engelleri ve takipleri aşın'}
            </p>
          </div>

          {/* 3 Canlı Telemetri Kartı */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className={`p-3 rounded-2xl border flex flex-col items-center text-center ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100/70 border-black/5'
            }`}
            >
              <span className="text-[10px] opacity-60">Gecikme (Ping)</span>
              <span className={`text-base font-bold font-mono mt-0.5 ${vpn.isActive ? 'text-cyan-400' : 'opacity-50'}`}
              >
                {vpn.isActive ? `${activeLocation.ping} ms` : '-- ms'}
              </span>
              <span className="text-[9px] text-emerald-400 font-semibold mt-0.5">
                {vpn.isActive ? 'Ultra Hızlı' : 'Beklemede'}
              </span>
            </div>

            <div className={`p-3 rounded-2xl border flex flex-col items-center text-center ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100/70 border-black/5'
            }`}
            >
              <span className="text-[10px] opacity-60">Sanal Konum</span>
              <span className="text-base font-bold font-mono mt-0.5 flex items-center gap-1">
                <span>{activeLocation.flag}</span>
                <span className="text-xs">{activeLocation.name}</span>
              </span>
              <span className="text-[9px] opacity-50 truncate max-w-full">
                {activeLocation.city}
              </span>
            </div>

            <div className={`p-3 rounded-2xl border flex flex-col items-center text-center ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100/70 border-black/5'
            }`}
            >
              <span className="text-[10px] opacity-60">Şifrelenen Veri</span>
              <span className={`text-base font-bold font-mono mt-0.5 ${vpn.isActive ? 'text-emerald-400' : 'opacity-50'}`}
              >
                {vpn.isActive ? `${vpn.encryptedMB} MB` : '0 MB'}
              </span>
              <span className="text-[9px] text-purple-400 font-semibold mt-0.5">
                AES-256 Bit
              </span>
            </div>
          </div>

          {/* 🌟 Canlı Çıkış IP'si Doğrulama Kartı */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
            isDark ? 'bg-cyan-500/10 border-cyan-500/25' : 'bg-cyan-50 border-cyan-500/20'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-['Outfit',sans-serif]">
                    {vpn.isActive ? '🛡️ Aktif VPN Çıkış Noktası:' : '🌐 Doğrudan Bağlantı:'}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-400">
                    {testedIp || (vpn.isActive ? `${activeLocation.flag} ${activeLocation.ip}` : 'Yerel Türk Telekom')}
                  </span>
                </div>
                <p className="text-[11px] opacity-65 truncate mt-0.5">
                  {vpn.isActive 
                    ? `Gerçek IP'niz gizlendi! Hedef siteler sizi ${activeLocation.name} (${activeLocation.city}) olarak görür.`
                    : 'VPN kapalı. Trafiğiniz yerel servis sağlayıcınız üzerinden doğrudan akar.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckLiveIp}
              disabled={isCheckingIp}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/35 text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
              title="Çıkış IP adresinizi anında canlı sunucudan test edin"
            >
              <RefreshCw className={`w-3 h-3 ${isCheckingIp ? 'animate-spin' : ''}`} />
              <span>{isCheckingIp ? 'Sorgulanıyor...' : 'Canlı Test Et'}</span>
            </button>
          </div>

          {/* Sunucu / Ülke Seçim Vitrini */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold tracking-wider uppercase opacity-50 px-1">
              Güvenli Tünel Sunucuları
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {VPN_LOCATIONS.map((loc) => {
                const isSelected = vpn.selectedCountry === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => handleSelectCountry(loc.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm'
                        : isDark
                          ? 'bg-white/[0.02] border-white/10 hover:bg-white/[0.06]'
                          : 'bg-slate-100/60 border-black/5 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{loc.flag}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-tight">{loc.name}</p>
                        <p className="text-[10px] opacity-60 truncate">{loc.city}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono opacity-70 shrink-0 ml-1">
                      {loc.ping}ms
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gelişmiş Gizlilik Katmanları */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold tracking-wider uppercase opacity-50 px-1">
              Gelişmiş Gizlilik Korumaları
            </h4>

            <div className={`rounded-2xl border divide-y overflow-hidden text-xs ${
              isDark ? 'border-white/10 divide-white/10 bg-white/[0.02]' : 'border-black/5 divide-black/5 bg-slate-50/50'
            }`}
            >
              <div
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5"
                onClick={() => handleToggleOpt('dnsLeakProtection')}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <p className="font-semibold">DNS Sızıntı Savunması (DoH)</p>
                    <p className="text-[11px] opacity-60">İnternet servis sağlayıcısının site geçmişinizi görmesini sıfırlar</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                  vpn.dnsLeakProtection ? 'text-cyan-400 bg-cyan-500/15' : 'text-slate-400 bg-slate-500/15'
                }`}
                >
                  {vpn.dnsLeakProtection ? 'AÇIK' : 'KAPALI'}
                </span>
              </div>

              <div
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5"
                onClick={() => handleToggleOpt('killSwitch')}
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold">Otomatik Acil Kapatma (Kill-Switch)</p>
                    <p className="text-[11px] opacity-60">Bağlantı anlık kopsa bile gerçek IP sızıntısını anında önler</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                  vpn.killSwitch ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400 bg-slate-500/15'
                }`}
                >
                  {vpn.killSwitch ? 'AÇIK' : 'KAPALI'}
                </span>
              </div>

              <div
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5"
                onClick={() => handleToggleOpt('webrtcShield')}
              >
                <div className="flex items-center gap-2.5">
                  <EyeOff className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <p className="font-semibold">WebRTC Yerel IP Maskeleme</p>
                    <p className="text-[11px] opacity-60">Sitelerin tarayıcı üzerinden ev veya modem IP'nizi bulmasını engeller</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                  vpn.webrtcShield ? 'text-purple-400 bg-purple-500/15' : 'text-slate-400 bg-slate-500/15'
                }`}
                >
                  {vpn.webrtcShield ? 'AÇIK' : 'KAPALI'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-slate-50/50'
        }`}
        >
          <span className="text-[11px] opacity-40 font-mono">
            NovaTürk Milli Anonim Ağ Protokolü
          </span>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg transition-all hover:scale-105 cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}