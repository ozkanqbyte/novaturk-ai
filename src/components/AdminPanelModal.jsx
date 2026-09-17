import React, { useState } from 'react';
import { 
  X, ShieldCheck, RefreshCw, Terminal, CheckCircle2, 
  AlertCircle, Database, Server, Radio, Play, Sliders, Globe, Ban, Search
} from 'lucide-react';
import { getAllIndexedSites, getIndexStats } from '../services/localIndexService';
import { sound } from '../services/soundService';

export default function AdminPanelModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('sites'); // sites, crawler, blacklist, ai
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlLogs, setCrawlLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [blacklist, setBlacklist] = useState([
    'dolandirici-sahte-site.xyz',
    'kumar-bahis-reklami.net',
    'sahte-kripto-tuzagi.com'
  ]);
  const [newBlacklistUrl, setNewBlacklistUrl] = useState('');

  if (!isOpen) return null;

  const sites = getAllIndexedSites();
  const stats = getIndexStats();

  const filteredSites = sites.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Canlı Simüle Tarama Terminali
  const handleStartCrawl = () => {
    sound.playSearch();
    setIsCrawling(true);
    setCrawlLogs(['[00:00:01] 🚀 NovaTürk Bot 1.0 Başlatıldı...']);

    sites.forEach((site, index) => {
      setTimeout(() => {
        setCrawlLogs(prev => [
          `[${new Date().toLocaleTimeString()}] [${index + 1}/50] Tarandı: ${site.name} (${site.domain}) -> ✓ Reklamlar & Çöpler Ayıklandı`,
          ...prev.slice(0, 40)
        ]);

        if (index === sites.length - 1) {
          setIsCrawling(false);
          sound.playChime();
          setCrawlLogs(prev => [
            `[${new Date().toLocaleTimeString()}] 🎉 50 Türk Sitesi Başarıyla İndekslendi ve Güncellendi!`,
            ...prev
          ]);
        }
      }, (index + 1) * 120);
    });
  };

  const handleAddBlacklist = (e) => {
    e.preventDefault();
    if (newBlacklistUrl.trim()) {
      sound.playClick();
      setBlacklist([...blacklist, newBlacklistUrl.trim()]);
      setNewBlacklistUrl('');
    }
  };

  const handleRemoveBlacklist = (url) => {
    sound.playClick();
    setBlacklist(blacklist.filter(u => u !== url));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="vision-glass w-full max-w-5xl h-[88vh] rounded-[32px] border border-cyan-500/40 shadow-[0_25px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit',sans-serif]">
                  NovaTürk Arama Motoru Yönetim Konsolu
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  CANLI İNDEKS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                50 Türk Sitesi Çekirdek İndeksi & Otonom Crawler Merkezi
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-b border-white/10 bg-white/[0.01]">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Taranan Türk Siteleri</span>
            <span className="text-xl font-black text-cyan-300 font-['Outfit',sans-serif]">50 / 50</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">İndekslenmiş Sayfalar</span>
            <span className="text-xl font-black text-emerald-300 font-['Outfit',sans-serif]">{stats.totalIndexedPages}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Spam & Reklam Temizleme</span>
            <span className="text-xl font-black text-violet-300 font-['Outfit',sans-serif]">{stats.spamFilteredRate}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Arama Gecikmesi</span>
            <span className="text-xl font-black text-amber-300 font-['Outfit',sans-serif]">0.08 ms</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-white/10 bg-white/[0.02]">
          {[
            { id: 'sites', label: '50 Türk Sitesi Veritabanı', icon: Globe },
            { id: 'crawler', label: 'Canlı Crawler Terminali', icon: Terminal },
            { id: 'blacklist', label: 'Spam & Kara Liste', icon: Ban },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  active 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-inner' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: 50 SİTE VERİTABANI */}
          {activeTab === 'sites' && (
            <div className="space-y-4">
              {/* Search in Sites */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Taranan sitelerde filtrele..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <span className="text-xs text-slate-400">
                  {filteredSites.length} site listeleniyor
                </span>
              </div>

              {/* Sites Table */}
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/[0.04] text-slate-400 uppercase font-semibold border-b border-white/10 text-[10px]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Site Adı</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Domain</th>
                      <th className="p-3">Durum</th>
                      <th className="p-3">Spam Filtresi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSites.map((site, idx) => (
                      <tr key={site.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-semibold text-white">{site.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px]">
                            {site.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">{site.domain}</td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> {site.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">{site.cleanScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CRAWLER TERMİNALİ */}
          {activeTab === 'crawler' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Otonom Tarayıcı Motoru (NovaTurkBot)</h4>
                  <p className="text-xs text-slate-400">50 Türk sitesini sırayla gezip HTML reklamlarını ve çerezlerini ayıklar.</p>
                </div>
                <button
                  onClick={handleStartCrawl}
                  disabled={isCrawling}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 shadow-glass transition-all"
                >
                  {isCrawling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isCrawling ? 'Taranıyor...' : '50 Siteyi Canlı Tara'}</span>
                </button>
              </div>

              {/* Terminal Box */}
              <div className="rounded-2xl bg-[#030611] border border-cyan-500/30 p-4 font-mono text-xs text-emerald-400 h-[380px] overflow-y-auto space-y-1 shadow-inner">
                {crawlLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <Terminal className="w-8 h-8 text-cyan-400/50" />
                    <p>"50 Siteyi Canlı Tara" butonuna basarak anlık tarama loglarını izleyebilirsiniz.</p>
                  </div>
                ) : (
                  crawlLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SPAM VE KARA LİSTE */}
          {activeTab === 'blacklist' && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <h4 className="text-sm font-bold text-white">Zararlı & Spam Site Filtresi (Kara Liste)</h4>
                <p className="text-xs text-slate-400">Buraya eklenen domainler NovaTürk arama sonuçlarından tamamen silinir.</p>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddBlacklist} className="flex gap-2">
                <input
                  type="text"
                  value={newBlacklistUrl}
                  onChange={(e) => setNewBlacklistUrl(e.target.value)}
                  placeholder="Engellenecek domain (ör: sahte-site.com)..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 transition-colors"
                >
                  Engelle
                </button>
              </form>

              {/* List */}
              <div className="space-y-2">
                {blacklist.map((domain, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                    <span className="font-mono text-rose-300 flex items-center gap-2">
                      <Ban className="w-3.5 h-3.5 text-rose-400" />
                      {domain}
                    </span>
                    <button
                      onClick={() => handleRemoveBlacklist(domain)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Kaldır
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
