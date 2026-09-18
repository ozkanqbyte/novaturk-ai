import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, Sliders, Database, Palette, Bot, Volume2, 
  Trash2, X, Globe, Save, CheckCircle2, Moon, Sun, Search, Sparkles, Check
} from 'lucide-react';
import { getApiConfig, saveApiConfig } from '../services/searchService';
import { sound } from '../services/soundService';
import { THEMES } from '../data/themes';

export const getSavedSettings = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return {
      safeSearch: 'strict',
      resultsPerPage: 10,
      sqliteCacheEnabled: true,
      navigationalPinning: true,
      aiSynthesisMode: 'compact',
      agentDevilsAdvocate: true,
      agentBargainHunter: true,
      agentExecutor: true,
      speechRate: 1.0,
      soundEnabled: true,
      blurIntensity: 'ultra',
      privacyShield: 'maximum'
    };
  }
  const saved = localStorage.getItem('novaturk_advanced_settings');
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return {
    safeSearch: 'strict',
    resultsPerPage: 10,
    sqliteCacheEnabled: true,
    navigationalPinning: true,
    aiSynthesisMode: 'compact',
    agentDevilsAdvocate: true,
    agentBargainHunter: true,
    agentExecutor: true,
    speechRate: 1.0,
    soundEnabled: true,
    blurIntensity: 'ultra',
    privacyShield: 'maximum'
  };
};

export const saveUserSettings = (settings) => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem('novaturk_advanced_settings', JSON.stringify(settings));
  }
};

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  isDark, 
  setIsDark, 
  currentTheme,
  onSelectTheme,
  onOpenThemeSelector
}) {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'ai' | 'appearance' | 'privacy'
  const [settings, setSettings] = useState(getSavedSettings);
  const [statusMsg, setStatusMsg] = useState('');

  // API Config State
  const [braveApiKey, setBraveApiKey] = useState('');
  const [searxngUrl, setSearxngUrl] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [googleCx, setGoogleCx] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSettings(getSavedSettings());
      const apiCfg = getApiConfig();
      setBraveApiKey(apiCfg.braveApiKey || '');
      setSearxngUrl(apiCfg.searxngUrl || 'https://searx.be');
      setGeminiApiKey(apiCfg.geminiApiKey || '');
      setGoogleApiKey(apiCfg.googleApiKey || '');
      setGoogleCx(apiCfg.googleCx || '');
      setStatusMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateSetting = (key, value) => {
    sound.playClick();
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveUserSettings(updated);
    setStatusMsg('Ayarlar anında güncellendi.');
    setTimeout(() => setStatusMsg(''), 2000);
  };

  const handleSaveApis = (e) => {
    e.preventDefault();
    sound.playChime();
    saveApiConfig({
      braveApiKey: braveApiKey.trim(),
      searxngUrl: searxngUrl.trim(),
      geminiApiKey: geminiApiKey.trim(),
      googleApiKey: googleApiKey.trim(),
      googleCx: googleCx.trim()
    });
    setStatusMsg('✅ Tüm ayarlar ve motor yapılandırması kaydedildi!');
    setTimeout(() => onClose(), 1000);
  };

  const handleClearCache = () => {
    sound.playClick();
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('novaturk_search_history');
      localStorage.removeItem('novaturk_search_cache');
    }
    setStatusMsg('🧹 Önbellek ve arama geçmişi başarıyla temizlendi!');
    setTimeout(() => setStatusMsg(''), 2500);
  };

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  const navItems = [
    { id: 'search', label: 'Arama Motoru', icon: Search },
    { id: 'ai', label: 'Yapay Zekâ & Ajanlar', icon: Bot },
    { id: 'appearance', label: 'Arayüz & Deneyim', icon: Palette },
    { id: 'privacy', label: 'Gizlilik & Veritabanı', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      <div className={`apple-glass w-full max-w-3xl rounded-3xl border shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden ${
        isDark ? 'border-white/10 bg-[#0a0c12]/90 text-slate-100' : 'border-black/10 bg-white/95 text-slate-900'
      }`}>
        
        {/* Header Bar */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-white/8' : 'border-black/5'
        }`}>
          <div className="flex items-center gap-3">
            <div 
              style={{ backgroundColor: `${themeAccent}20`, borderColor: `${themeAccent}40`, color: themeAccent }}
              className="w-9 h-9 rounded-2xl flex items-center justify-center border shadow-sm"
            >
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-['Outfit',sans-serif]">
                NovaTürk Gelişmiş Sistem Ayarları
              </h2>
              <p className="text-[11px] opacity-60">
                Arama motoru parametreleri, otonom ajanlar ve tarayıcı tercihleri
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Sidebar + Main Settings */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Navigation Sidebar */}
          <div className={`w-full md:w-56 p-3 flex md:flex-col gap-1 border-b md:border-b-0 md:border-r overflow-x-auto no-scrollbar ${
            isDark ? 'border-white/8 bg-black/20' : 'border-black/5 bg-slate-50/50'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTab(item.id);
                  }}
                  style={isActive ? { backgroundColor: `${themeAccent}18`, color: themeAccent, borderColor: `${themeAccent}40` } : {}}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                    isActive 
                      ? 'shadow-sm' 
                      : 'border-transparent opacity-60 hover:opacity-100 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Tab Content */}
          <div className="flex-1 p-5 sm:p-7 overflow-y-auto no-scrollbar space-y-6">
            
            {/* TAB 1: ARAMA MOTORU AYARLARI */}
            {activeTab === 'search' && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-bold mb-1">Arama ve Dizin Tercihleri</h3>
                  <p className="text-xs opacity-60">Arama sonuçlarının kalitesi, filtreleme ve SQLite yerel dizin ayarları.</p>
                </div>

                {/* Güvenli Arama */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-semibold block">Güvenli Arama (SafeSearch)</span>
                    <span className="text-[11px] opacity-60">Spam siteleri, kumar, bahis ve zararlı içerikleri filtrele</span>
                  </div>
                  <select
                    value={settings.safeSearch}
                    onChange={(e) => updateSetting('safeSearch', e.target.value)}
                    className="apple-pill-btn text-xs px-3 py-1.5 rounded-xl bg-transparent border border-white/20 font-medium"
                  >
                    <option value="strict" className="text-black">Sıkı (En Yüksek Kalkan)</option>
                    <option value="standard" className="text-black">Standart</option>
                    <option value="off" className="text-black">Kapalı</option>
                  </select>
                </div>

                {/* SQLite Tier 1 Hızlı Önbellek */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-semibold block">SQLite 1ms Akıllı Önbellek (Tier 1)</span>
                    <span className="text-[11px] opacity-60">Daha önce aranan popüler sonuçları 1 milisaniyede sıfır gecikmeyle getir</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sqliteCacheEnabled}
                    onChange={(e) => updateSetting('sqliteCacheEnabled', e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 cursor-pointer"
                  />
                </div>

                {/* Navigasyonel #1 Çivileme */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-semibold block">Resmî Platform Çivileme (#1 Sıra)</span>
                    <span className="text-[11px] opacity-60">ChatGPT, E-Devlet, Ekşi Sözlük gibi siteleri doğrudan en başa al</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.navigationalPinning}
                    onChange={(e) => updateSetting('navigationalPinning', e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 cursor-pointer"
                  />
                </div>

                {/* Sayfa Başına Sonuç Sayısı */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-semibold block">Sayfa Başına Sonuç Sayısı</span>
                    <span className="text-[11px] opacity-60">Arama akışında gösterilecek doğrulanmış bağlantı sayısı</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[10, 15, 20].map((count) => (
                      <button
                        key={count}
                        onClick={() => updateSetting('resultsPerPage', count)}
                        style={settings.resultsPerPage === count ? { backgroundColor: themeAccent, color: '#fff' } : {}}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border border-white/15 transition-all ${
                          settings.resultsPerPage === count ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: YAPAY ZEKÂ VE AJANLAR */}
            {activeTab === 'ai' && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-bold mb-1">Otonom Ajan Ekibi (Swarm) & Sentez</h3>
                  <p className="text-xs opacity-60">Arama esnasında çalışan 5 uzman yapay zekâ ajanını yapılandırın.</p>
                </div>

                {/* Şeytanın Avukatı Ajanı */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-semibold block">Şeytanın Avukatı (Ters Köşe Analizci)</span>
                    <span className="text-[11px] opacity-60">Riskleri, görünmeyen olumsuzlukları ve alternatif bakış açılarını uyarır</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.agentDevilsAdvocate}
                    onChange={(e) => updateSetting('agentDevilsAdvocate', e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 cursor-pointer"
                  />
                </div>

                {/* Pazarlıkçı & Fiyat Avcısı Ajanı */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-semibold block">Pazarlıkçı & Fiyat Avcısı Ajanı</span>
                    <span className="text-[11px] opacity-60">Ürün, hizmet ve aboneliklerde indirim tüyoları ve pazarlık taktikleri üretir</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.agentBargainHunter}
                    onChange={(e) => updateSetting('agentBargainHunter', e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 cursor-pointer"
                  />
                </div>

                {/* İcracı Ajan */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-semibold block">İcracı & Resmî Belge Ajanı</span>
                    <span className="text-[11px] opacity-60">Hukuki itiraz dilekçeleri, kira feshi ve e-devlet başvuru taslakları sunar</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.agentExecutor}
                    onChange={(e) => updateSetting('agentExecutor', e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 cursor-pointer"
                  />
                </div>

                {/* Sesli Okuma Hızı */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-semibold block">Sesli Okuma (TTS) Hızı</span>
                    <span className="text-[11px] opacity-60">Yapay zekâ sesli sentezinin konuşma temposu</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[0.9, 1.0, 1.15].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => updateSetting('speechRate', rate)}
                        style={settings.speechRate === rate ? { backgroundColor: themeAccent, color: '#fff' } : {}}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border border-white/15 transition-all ${
                          settings.speechRate === rate ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* İsteğe Bağlı API Anahtarları */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-xs font-bold block mb-2">Harici Canlı API Bağlantıları (Opsiyonel)</span>
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="Google Gemini API Anahtarı (Opsiyonel)"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-white/15 bg-white/5 focus:outline-none focus:border-sky-400 font-mono"
                    />
                    <input
                      type="password"
                      placeholder="Brave Search API Anahtarı (Opsiyonel)"
                      value={braveApiKey}
                      onChange={(e) => setBraveApiKey(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-white/15 bg-white/5 focus:outline-none focus:border-sky-400 font-mono"
                    />
                  </div>
                  <button
                    onClick={handleSaveApis}
                    style={{ backgroundColor: themeAccent }}
                    className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity"
                  >
                    API Ayarlarını Kaydet
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: ARAYÜZ VE DENEYİM */}
            {activeTab === 'appearance' && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-bold mb-1">Görsel Efektler & Apple VisionOS</h3>
                  <p className="text-xs opacity-60">Buzlu cam dokusu, ses efektleri ve karanlık mod tercihleri.</p>
                </div>

                {/* 🌟 20 SEÇKİN APPLE CAM & OLED TEMASI SEÇİCİSİ */}
                <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold block">Apple Cam & OLED Temaları</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-400/30">
                          20 Tema (10 Yeni Eklendi)
                        </span>
                      </div>
                      <span className="text-[11px] opacity-60">
                        Aktif Tema: <strong className="text-white">{currentTheme?.name || 'Varsayılan'}</strong>
                      </span>
                    </div>

                    {onOpenThemeSelector && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onOpenThemeSelector();
                        }}
                        className="apple-pill-btn px-3 py-1.5 rounded-xl text-xs font-bold text-sky-400 border border-sky-400/40 hover:bg-sky-400/10 transition-all"
                      >
                        Tümünü Gör (20)
                      </button>
                    )}
                  </div>

                  {/* Hızlı Seçim: Popüler ve Yeni Temalar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {THEMES.slice(0, 8).concat(THEMES.filter(t => t.id === 'pure-black-oled')).slice(0, 8).map(theme => {
                      const isSelected = currentTheme?.id === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => {
                            sound.playClick();
                            if (onSelectTheme) onSelectTheme(theme);
                          }}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all text-xs ${
                            isSelected
                              ? 'bg-sky-500/20 border-sky-400 text-white font-bold ring-1 ring-sky-400'
                              : 'bg-white/[0.02] border-white/10 opacity-70 hover:opacity-100 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${theme.previewGradient} shrink-0 border border-white/20`} />
                          <span className="truncate text-[11px]">{theme.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Karanlık Mod Geçişi */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-semibold block">Görünüm Teması</span>
                    <span className="text-[11px] opacity-60">Karanlık (OLED) veya Saf Açık Tema</span>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsDark(!isDark);
                    }}
                    className="apple-pill-btn px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    {isDark ? <Moon className="w-3.5 h-3.5 text-sky-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{isDark ? 'Karanlık Mod' : 'Açık Mod'}</span>
                  </button>
                </div>

                {/* Ses Efektleri */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-semibold block">Haptic Arayüz Sesleri</span>
                    <span className="text-[11px] opacity-60">Buton tıklamalarında ve arama tamamlandığında sesli bildirim</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 cursor-pointer"
                  />
                </div>

                {/* Cam Efekti Yoğunluğu */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-semibold block">Buzlu Cam (Frosted Blur)</span>
                    <span className="text-[11px] opacity-60">Apple VisionOS cam geçirgenlik seviyesi</span>
                  </div>
                  <select
                    value={settings.blurIntensity}
                    onChange={(e) => updateSetting('blurIntensity', e.target.value)}
                    className="apple-pill-btn text-xs px-3 py-1.5 rounded-xl bg-transparent border border-white/20 font-medium"
                  >
                    <option value="ultra" className="text-black">Ultra (VisionOS 24px)</option>
                    <option value="balanced" className="text-black">Dengeli</option>
                    <option value="low" className="text-black">Düşük (Hafif)</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 4: GİZLİLİK VE VERİTABANI */}
            {activeTab === 'privacy' && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-bold mb-1">Gizlilik Kalkanı & SQLite Hafızası</h3>
                  <p className="text-xs opacity-60">Sıfır izleme politikası, reklam engelleme ve yerel veritabanı temizleme.</p>
                </div>

                {/* Gizlilik Durumu */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> %100 Sıfır Takipçi Koruması
                  </span>
                  <p className="text-[11px] opacity-80 leading-relaxed">
                    NovaTürk AI IP adresinizi, tarama geçmişinizi veya kimliğinizi reklam verenlere satmaz. Arama geçmişiniz yalnızca kendi tarayıcınızın yerel depolama alanında tutulur.
                  </p>
                </div>

                {/* Önbellek ve Geçmişi Temizleme */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/5">
                  <div>
                    <span className="text-xs font-semibold text-rose-400 block">Önbelleği ve Geçmişi Sıfırla</span>
                    <span className="text-[11px] opacity-60">Yerel tarayıcıdaki tüm arama geçmişini ve geçici verileri temizler</span>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Temizle</span>
                  </button>
                </div>

                {/* Motor Durumu */}
                <div className="p-3.5 rounded-2xl border border-white/10 text-xs space-y-1 opacity-70">
                  <div className="flex justify-between">
                    <span>Motor Mimarisi:</span>
                    <span className="font-mono">NovaTürk AI v2.5 (3-Tier Hybrid)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Veritabanı Motoru:</span>
                    <span className="font-mono">SQLite Native Sync (Node 24)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maliyet Oranı:</span>
                    <span className="font-mono text-emerald-400">0 TL / Sıfır Maliyet</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Bar */}
        <div className={`flex items-center justify-between px-6 py-3 border-t text-xs ${
          isDark ? 'border-white/8 bg-black/40' : 'border-black/5 bg-slate-50'
        }`}>
          <span className="text-emerald-400 font-medium">
            {statusMsg || 'Tüm ayarlar anlık ve yerel olarak korunur.'}
          </span>

          <button
            onClick={onClose}
            style={{ backgroundColor: themeAccent }}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
          >
            Tamam
          </button>
        </div>

      </div>
    </div>
  );
}
