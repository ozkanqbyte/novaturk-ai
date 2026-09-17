import React, { useState, useMemo } from 'react';
import { 
  History, Search, Trash2, Globe, ExternalLink, Copy, 
  Calendar, Clock, ShieldCheck, CheckSquare, Square, 
  Download, BarChart2, X, RefreshCw, Sparkles, Filter
} from 'lucide-react';
import { sound } from '../services/soundService';
import { 
  getHistory, removeHistoryItem, removeHistoryItemsBatch, 
  clearHistoryByTimeRange, clearAllHistory, getHistoryStats, 
  formatHistoryTime, groupHistoryByDate, exportHistoryJson 
} from '../services/historyService';

export default function HistoryModal({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onNewTab, 
  isDark = true 
}) {
  if (!isOpen) return null;

  const [historyItems, setHistoryItems] = useState(() => getHistory());
  const [filterType, setFilterType] = useState('all'); // 'all', 'search', 'visit'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearRange, setClearRange] = useState('all');
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'stats'

  // Filtrelenmiş Liste
  const filteredItems = useMemo(() => {
    return historyItems.filter(item => {
      // 1. Kategori Filtresi
      if (filterType === 'search' && item.type !== 'search') return false;
      if (filterType === 'visit' && item.type !== 'visit') return false;

      // 2. Arama Filtresi
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = (item.text || item.title || '').toLowerCase();
        const url = (item.url || item.hostname || '').toLowerCase();
        return text.includes(q) || url.includes(q);
      }
      return true;
    });
  }, [historyItems, filterType, searchQuery]);

  // Gruplandırılmış Liste (Tarihe göre)
  const grouped = useMemo(() => groupHistoryByDate(filteredItems), [filteredItems]);
  const stats = useMemo(() => getHistoryStats(), [historyItems]);

  const handleToggleSelect = (id) => {
    sound.playClick();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllInView = () => {
    sound.playClick();
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleDeleteSingle = (id, e) => {
    e.stopPropagation();
    sound.playClick();
    const updated = removeHistoryItem(id);
    setHistoryItems(updated);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    sound.playClick();
    if (!selectedIds.size) return;
    const updated = removeHistoryItemsBatch(Array.from(selectedIds));
    setHistoryItems(updated);
    setSelectedIds(new Set());
  };

  const handleClearHistory = () => {
    sound.playShieldDeflect();
    const updated = clearHistoryByTimeRange(clearRange);
    setHistoryItems(updated);
    setSelectedIds(new Set());
    setShowClearConfirm(false);
  };

  const handleItemClick = (item) => {
    sound.playChime();
    const target = item.type === 'visit' ? item.url : item.text;
    if (onNavigate) {
      onNavigate(target);
      onClose();
    }
  };

  const handleOpenInNewTab = (item, e) => {
    e.stopPropagation();
    sound.playChime();
    if (onNewTab) {
      const target = item.type === 'visit' ? item.url : item.text;
      onNewTab(target);
      onClose();
    }
  };

  const handleCopy = (text, e) => {
    e.stopPropagation();
    sound.playClick();
    try { navigator.clipboard.writeText(text); } catch {}
  };

  const renderItem = (item) => {
    const isSelected = selectedIds.has(item.id);
    const isSearch = item.type === 'search';
    const title = item.text || item.title || item.url;
    const subtitle = isSearch ? 'NovaTürk AI Arama Motoru' : (item.url || item.hostname);
    const domain = item.hostname || (item.url ? new URL(item.url).hostname : 'novaturk.ai');

    return (
      <div
        key={item.id}
        onClick={() => handleItemClick(item)}
        className={`group flex items-center justify-between p-3 rounded-2xl transition-all border cursor-pointer select-none ${
          isSelected
            ? 'bg-sky-500/15 border-sky-500/40'
            : isDark
            ? 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5 hover:border-white/10'
            : 'bg-slate-100/60 hover:bg-slate-100 border-black/5'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Seçim Kutusu */}
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleSelect(item.id); }}
            className="text-slate-400 hover:text-sky-400 p-0.5 rounded cursor-pointer transition-colors"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-sky-400" />
            ) : (
              <Square className="w-4 h-4 opacity-40 group-hover:opacity-100" />
            )}
          </button>

          {/* İkon / Favicon */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border bg-white/5 border-white/10 overflow-hidden shadow-inner">
            {isSearch ? (
              <Search className="w-4 h-4 text-sky-400" />
            ) : (
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                alt=""
                className="w-4 h-4 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>

          {/* Başlık ve Bilgi */}
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold truncate font-['Outfit',sans-serif]">
                {title}
              </span>
              {isSearch && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-sky-500/15 text-sky-400 shrink-0 border border-sky-500/20">
                  Arama
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-50 truncate font-mono mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Aksiyon Butonları & Zaman */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono opacity-50 hidden sm:inline-block">
            {formatHistoryTime(item.timestamp)}
          </span>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => handleOpenInNewTab(item, e)}
              className="p-1.5 rounded-lg hover:bg-white/10 opacity-70 hover:opacity-100 hover:text-sky-400 transition-colors cursor-pointer"
              title="Yeni Sekmede Aç"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => handleCopy(item.url || item.text, e)}
              className="p-1.5 rounded-lg hover:bg-white/10 opacity-70 hover:opacity-100 hover:text-emerald-400 transition-colors cursor-pointer"
              title="Kopyala"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => handleDeleteSingle(item.id, e)}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Geçmişten Kaldır"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-2xl animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-3xl h-[85vh] max-h-[750px] rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-all relative ${
          isDark
            ? 'bg-[#0b0e17]/95 border-sky-500/20 text-slate-100 shadow-[0_20px_60px_rgba(14,165,233,0.18)]'
            : 'bg-white/95 border-sky-500/20 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Holographic Glowing Aurora */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* 1. Başlık Çubuğu */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg font-['Outfit',sans-serif] tracking-tight">
                  Gelişmiş Tarayıcı Geçmişi
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25">
                  {historyItems.length} Kayıt
                </span>
              </div>
              <p className="text-xs opacity-60 mt-0.5">
                Aramalarınızı ve ziyaret ettiğiniz web sayfalarını anında bulun, yönetin veya temizleyin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportHistoryJson()}
              className="p-2 rounded-xl hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
              title="Geçmişi JSON Olarak Dışa Aktar (Yedekle)"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => { sound.playClick(); onClose(); }}
              className="p-2 rounded-xl hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Kontrol ve Filtre Çubuğu */}
        <div className={`px-4 sm:px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'border-white/5 bg-white/[0.01]' : 'border-black/5 bg-white'
        }`}>
          {/* Arama Kutusu */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Geçmişte veya aramalarda ara..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-sans outline-none border transition-all ${
                isDark 
                  ? 'bg-white/5 border-white/10 focus:border-sky-400/50 text-slate-100' 
                  : 'bg-slate-100 border-black/10 focus:border-sky-500 text-slate-900'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sekmeler: Hepsi, Aramalar, Siteler, İstatistikler */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/20 border border-white/5">
            <button
              onClick={() => { sound.playClick(); setFilterType('all'); setActiveTab('list'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'all' && activeTab === 'list'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => { sound.playClick(); setFilterType('search'); setActiveTab('list'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'search' && activeTab === 'list'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Aramalar
            </button>
            <button
              onClick={() => { sound.playClick(); setFilterType('visit'); setActiveTab('list'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'visit' && activeTab === 'list'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Web Siteleri
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveTab(activeTab === 'stats' ? 'list' : 'stats'); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'stats'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'opacity-60 hover:opacity-100'
              }`}
              title="İstatistikler ve Grafikler"
            >
              <BarChart2 className="w-3 h-3" />
              <span className="hidden sm:inline">Rapor</span>
            </button>
          </div>

          {/* Toplu İşlem & Temizleme Butonları */}
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer animate-fadeIn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sil ({selectedIds.size})</span>
              </button>
            )}

            <button
              onClick={() => { sound.playClick(); setShowClearConfirm(true); }}
              className="px-3 py-1.5 rounded-xl border border-red-500/30 hover:bg-red-500/15 text-red-400 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Verileri Temizle</span>
            </button>
          </div>
        </div>

        {/* 3. İçerik Alanı: Liste veya İstatistikler */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {activeTab === 'stats' ? (
            /* İSTATİSTİKLER PANELİ */
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center">
                  <span className="text-xs opacity-60">Toplam Kayıt</span>
                  <p className="text-2xl font-bold text-sky-400 font-mono mt-1">{stats.total}</p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <span className="text-xs opacity-60">Yapılan Arama</span>
                  <p className="text-2xl font-bold text-purple-400 font-mono mt-1">{stats.searchCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-xs opacity-60">Site Ziyareti</span>
                  <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{stats.visitCount}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" /> En Çok Ziyaret Edilen Alan Adları
                </h4>
                <div className="space-y-2">
                  {stats.topDomains.length > 0 ? (
                    stats.topDomains.map((d, i) => (
                      <div key={d.domain} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          <span className="font-bold">{d.domain}</span>
                        </div>
                        <span className="text-slate-400 font-semibold">{d.count} ziyaret</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs opacity-50 py-4 text-center">Henüz yeterli ziyaret verisi bulunmuyor.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* GEÇMİŞ LİSTESİ */
            <>
              {filteredItems.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                  <History className="w-12 h-12 stroke-1 opacity-40" />
                  <p className="text-sm font-semibold">
                    {searchQuery ? 'Aramanıza uygun geçmiş kaydı bulunamadı.' : 'Tarayıcı geçmişiniz şu anda temiz.'}
                  </p>
                  <p className="text-xs opacity-75 max-w-xs">
                    Arama motorunu kullandıkça ve siteleri ziyaret ettikçe burada kronolojik olarak listelenecektir.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Bugün */}
                  {grouped.today.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider px-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Bugün</span>
                        <span className="opacity-50 font-normal">({grouped.today.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {grouped.today.map(renderItem)}
                      </div>
                    </div>
                  )}

                  {/* Dün */}
                  {grouped.yesterday.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold opacity-60 uppercase tracking-wider px-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Dün</span>
                        <span className="opacity-50 font-normal">({grouped.yesterday.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {grouped.yesterday.map(renderItem)}
                      </div>
                    </div>
                  )}

                  {/* Bu Hafta */}
                  {grouped.thisWeek.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold opacity-60 uppercase tracking-wider px-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Bu Hafta</span>
                        <span className="opacity-50 font-normal">({grouped.thisWeek.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {grouped.thisWeek.map(renderItem)}
                      </div>
                    </div>
                  )}

                  {/* Daha Eski */}
                  {grouped.older.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold opacity-60 uppercase tracking-wider px-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Daha Eski</span>
                        <span className="opacity-50 font-normal">({grouped.older.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {grouped.older.map(renderItem)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* 4. Alt Bilgi Çubuğu (Gizlilik Garantisi) */}
        <div className={`p-3.5 px-5 border-t flex items-center justify-between text-xs opacity-70 ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Gizli (Incognito) modda gezindiğiniz hiçbir sayfa geçmişe kaydedilmez.</span>
          </div>

          <span className="font-mono text-[11px] opacity-60 hidden sm:inline">
            Kısayol: Ctrl + H
          </span>
        </div>

        {/* 5. Tarama Verilerini Temizleme Onay Modalı */}
        {showClearConfirm && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-5 ${
              isDark ? 'bg-[#151923] border-red-500/30 text-white' : 'bg-white border-red-500/20 text-slate-900'
            }`}>
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base font-['Outfit',sans-serif]">
                    Tarama Verilerini Temizle
                  </h4>
                  <p className="text-xs opacity-70">Hangi zaman aralığındaki geçmişi silmek istersiniz?</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { id: '1h', label: 'Son 1 saat' },
                  { id: '24h', label: 'Son 24 saat' },
                  { id: '7d', label: 'Son 7 gün' },
                  { id: 'all', label: 'Tüm zamanlar (Komple temizle)' }
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      clearRange === opt.id
                        ? 'bg-red-500/15 border-red-500/50 text-red-300'
                        : isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200 border-black/5'
                    }`}
                  >
                    <span className="text-xs font-semibold">{opt.label}</span>
                    <input
                      type="radio"
                      name="clearRange"
                      checked={clearRange === opt.id}
                      onChange={() => setClearRange(opt.id)}
                      className="accent-red-500"
                    />
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
                >
                  Geçmişi Temizle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
