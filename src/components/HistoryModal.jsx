import React, { useState, useMemo } from 'react';
import { 
  History, Search, Trash2, Globe, ExternalLink, Copy, 
  Calendar, Clock, ShieldCheck, CheckCircle2, Circle, 
  Download, BarChart2, X, Sparkles, ChevronRight, Check
} from 'lucide-react';
import { sound } from '../services/soundService';
import { 
  getHistory, removeHistoryItem, removeHistoryItemsBatch, 
  clearHistoryByTimeRange, getHistoryStats, 
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
  const [showClearActionSheet, setShowClearActionSheet] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'stats'
  const [copiedId, setCopiedId] = useState(null);

  // 1. Filtrelenmiş Liste
  const filteredItems = useMemo(() => {
    return historyItems.filter(item => {
      if (filterType === 'search' && item.type !== 'search') return false;
      if (filterType === 'visit' && item.type !== 'visit') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = (item.text || item.title || '').toLowerCase();
        const url = (item.url || item.hostname || '').toLowerCase();
        return text.includes(q) || url.includes(q);
      }
      return true;
    });
  }, [historyItems, filterType, searchQuery]);

  // 2. Gruplandırılmış Liste (Tarihe göre)
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

  const handleClearHistoryRange = (range) => {
    sound.playShieldDeflect();
    const updated = clearHistoryByTimeRange(range);
    setHistoryItems(updated);
    setSelectedIds(new Set());
    setShowClearActionSheet(false);
  };

  const handleItemClick = (item) => {
    sound.playChime();
    const target = item.type === 'visit' ? item.url : (item.text || item.title || item.url);
    if (onNavigate) {
      onNavigate(target, item);
      onClose();
    }
  };

  const handleOpenInNewTab = (item, e) => {
    e.stopPropagation();
    sound.playChime();
    if (onNewTab) {
      const target = item.type === 'visit' ? item.url : (item.text || item.title || item.url);
      onNewTab(target, item);
      onClose();
    }
  };

  const handleCopy = (text, id, e) => {
    e.stopPropagation();
    sound.playClick();
    try { 
      navigator.clipboard.writeText(text); 
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  // Apple SF Grouped Row Item
  const renderItem = (item) => {
    const isSelected = selectedIds.has(item.id);
    const isSearch = item.type === 'search';
    const title = item.text || item.title || item.url;
    const subtitle = isSearch ? 'NovaTürk AI Arama Motoru' : (item.url || item.hostname);
    const domain = item.hostname || (item.url ? new URL(item.url).hostname : 'novaturk.ai');
    const isCopied = copiedId === item.id;

    return (
      <div
        key={item.id}
        onClick={() => handleItemClick(item)}
        className={`group flex items-center justify-between px-3.5 py-2.5 transition-all cursor-pointer select-none relative ${
          isSelected
            ? 'bg-sky-500/15'
            : isDark
            ? 'hover:bg-white/[0.06] active:bg-white/[0.1]'
            : 'hover:bg-slate-100 active:bg-slate-200'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Apple Style Checkbox / Radio */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleToggleSelect(item.id); }}
            className="text-slate-400 hover:text-sky-400 p-1 -m-1 rounded-full cursor-pointer transition-colors shrink-0"
          >
            {isSelected ? (
              <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
            ) : (
              <Circle className="w-4 h-4 opacity-30 group-hover:opacity-70 transition-opacity" />
            )}
          </button>

          {/* Apple Squircle Favicon */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border bg-white/[0.06] border-white/10 overflow-hidden shadow-sm">
            {isSearch ? (
              <Search className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                alt=""
                className="w-4 h-4 object-contain"
                onError={(e) => { 
                  e.target.style.display = 'none'; 
                }}
              />
            )}
          </div>

          {/* Başlık ve Subtitle */}
          <div className="min-w-0 flex-1 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium tracking-tight truncate text-white">
                {title}
              </span>
              {isSearch && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/20 shrink-0">
                  Arama
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-slate-400 truncate max-w-[210px] sm:max-w-xs font-sans">
                {subtitle}
              </p>
              <span className="text-[10px] text-slate-500 font-mono shrink-0 hidden xs:inline">
                • {formatHistoryTime(item.timestamp)}
              </span>
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları (Mobilde her zaman görünür, Apple ergonomisi) */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {/* Yeni Sekmede Aç */}
          <button
            onClick={(e) => handleOpenInNewTab(item, e)}
            className="p-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 text-slate-400 hover:text-sky-400 transition-all cursor-pointer"
            title="Yeni Sekmede Aç"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Kopyala */}
          <button
            onClick={(e) => handleCopy(item.url || item.text, item.id, e)}
            className="p-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
            title="Bağlantıyı Kopyala"
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in-50" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Tekil Sil */}
          <button
            onClick={(e) => handleDeleteSingle(item.id, e)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 active:bg-red-500/30 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
            title="Kayıttan Sil"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Apple Safari iOS Container: Mobilde Tam Ekran, Masaüstünde VisionOS Cam Pencere */}
      <div
        style={{
          boxShadow: isDark
            ? '0 25px 70px -10px rgba(0,0,0,0.9), 0 0 35px rgba(56,189,248,0.15), inset 0 1px 1px rgba(255,255,255,0.15)'
            : '0 25px 70px -10px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.8)'
        }}
        className={`w-full max-w-3xl h-full sm:h-[85vh] sm:max-h-[760px] rounded-none sm:rounded-3xl border-0 sm:border overflow-hidden flex flex-col transition-all relative animate-in zoom-in-95 sm:zoom-in-100 duration-200 ${
          isDark
            ? 'bg-[#0b0e17] sm:bg-[#0c0f1a]/92 border-white/15 text-slate-100'
            : 'bg-white border-black/10 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Apple VisionOS Holographic Gradient Glows */}
        <div className="absolute top-0 right-1/4 w-56 h-56 bg-sky-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-1/4 w-56 h-56 bg-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* 1. Apple Navigation Bar Header */}
        <div className={`px-4 sm:px-6 pt-[calc(0.85rem+env(safe-area-inset-top,0px))] pb-3 sm:py-4 flex items-center justify-between border-b ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-slate-50/50'
        }`}>
          {/* Sol: Başlık & Rozet */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight font-['Outfit',sans-serif]">
                  Geçmiş
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25">
                  {historyItems.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                Ziyaret ettiğiniz siteler ve arama geçmişi
              </p>
            </div>
          </div>

          {/* Sağ: Apple 'Bitti' Butonu & Dışa Aktar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                exportHistoryJson();
              }}
              className="p-2 rounded-full hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Geçmişi JSON Olarak Dışa Aktar"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Apple Safari Signature 'Bitti' (Done) Button */}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 active:scale-95 border border-sky-500/20 transition-all cursor-pointer"
            >
              Bitti
            </button>
          </div>
        </div>

        {/* 2. Apple Segmented Picker & Search Toolbar */}
        <div className={`px-4 sm:px-6 py-2.5 sm:py-3 border-b space-y-2.5 ${
          isDark ? 'border-white/10 bg-black/20' : 'border-black/5 bg-slate-100/50'
        }`}>
          {/* Apple iOS Search Field */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Geçmişte veya aramalarda ara..."
              className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-sans outline-none border transition-all ${
                isDark 
                  ? 'bg-white/[0.06] border-white/10 focus:border-sky-400/50 text-white placeholder-slate-400' 
                  : 'bg-white border-black/10 focus:border-sky-500 text-slate-900 placeholder-slate-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-slate-500/30 text-slate-300 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Apple Segmented Filter Pill Slider */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 max-w-sm p-0.5 rounded-xl bg-black/30 border border-white/10 flex items-center">
              <button
                onClick={() => { sound.playClick(); setFilterType('all'); setActiveTab('list'); }}
                className={`flex-1 py-1 text-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'all' && activeTab === 'list'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => { sound.playClick(); setFilterType('search'); setActiveTab('list'); }}
                className={`flex-1 py-1 text-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'search' && activeTab === 'list'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Aramalar
              </button>
              <button
                onClick={() => { sound.playClick(); setFilterType('visit'); setActiveTab('list'); }}
                className={`flex-1 py-1 text-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'visit' && activeTab === 'list'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Siteler
              </button>
              <button
                onClick={() => { sound.playClick(); setActiveTab(activeTab === 'stats' ? 'list' : 'stats'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'stats'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="İstatistikler & Grafikler"
              >
                <BarChart2 className="w-3 h-3" />
                <span className="hidden sm:inline">Rapor</span>
              </button>
            </div>

            {/* Toplu Seçim Butonu */}
            {activeTab === 'list' && filteredItems.length > 0 && (
              <button
                onClick={handleSelectAllInView}
                className="text-[11px] font-medium text-sky-400 hover:text-sky-300 px-2 py-1 rounded-lg hover:bg-sky-500/10 cursor-pointer shrink-0 transition-colors"
              >
                {selectedIds.size === filteredItems.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </button>
            )}
          </div>
        </div>

        {/* 3. İçerik Alanı: Apple Grouped Listesi veya İstatistikler */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
          {activeTab === 'stats' ? (
            /* 📊 APPLE VISIONOS İSTATİSTİK KARTLARI */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center">
                  <span className="text-[11px] text-slate-400">Toplam Kayıt</span>
                  <p className="text-xl sm:text-2xl font-bold text-sky-400 font-mono mt-0.5">{stats.total}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <span className="text-[11px] text-slate-400">Yapılan Arama</span>
                  <p className="text-xl sm:text-2xl font-bold text-purple-400 font-mono mt-0.5">{stats.searchCount}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-[11px] text-slate-400">Site Ziyareti</span>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mt-0.5">{stats.visitCount}</p>
                </div>
              </div>

              {/* En Çok Ziyaret Edilenler */}
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" /> En Çok Ziyaret Edilen Alan Adları
                </h4>
                <div className="space-y-2">
                  {stats.topDomains.length > 0 ? (
                    stats.topDomains.map((d, i) => (
                      <div key={d.domain} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] text-xs font-sans">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {i + 1}
                          </span>
                          <span className="font-medium truncate text-white">{d.domain}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px] shrink-0">{d.count} ziyaret</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-3 text-center">Henüz yeterli ziyaret verisi kaydedilmedi.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* 📱 APPLE SAFARI GROUPED GEÇMİŞ LİSTESİ */
            <>
              {filteredItems.length === 0 ? (
                <div className="h-60 flex flex-col items-center justify-center text-center space-y-2.5 opacity-60">
                  <History className="w-10 h-10 stroke-1 text-slate-400" />
                  <p className="text-sm font-semibold text-white">
                    {searchQuery ? 'Aramanıza uygun kayıt bulunamadı.' : 'Tarayıcı geçmişiniz şu anda temiz.'}
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Gezindiğiniz sayfalar ve aramalarınız burada Apple Safari düzeninde listelenecektir.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Bugün */}
                  {grouped.today.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                        <span className="flex items-center gap-1.5 text-sky-400">
                          <Clock className="w-3.5 h-3.5" /> Bugün
                        </span>
                        <span>{grouped.today.length}</span>
                      </div>
                      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden divide-y divide-white/[0.05]">
                        {grouped.today.map(renderItem)}
                      </div>
                    </div>
                  )}

                  {/* Dün */}
                  {grouped.yesterday.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Dün
                        </span>
                        <span>{grouped.yesterday.length}</span>
                      </div>
                      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden divide-y divide-white/[0.05]">
                        {grouped.yesterday.map(renderItem)}
                      </div>
                    </div>
                  )}

                  {/* Bu Hafta */}
                  {grouped.thisWeek.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Bu Hafta
                        </span>
                        <span>{grouped.thisWeek.length}</span>
                      </div>
                      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden divide-y divide-white/[0.05]">
                        {grouped.thisWeek.map(renderItem)}
                      </div>
                    </div>
                  )}

                  {/* Daha Eski */}
                  {grouped.older.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Daha Eski
                        </span>
                        <span>{grouped.older.length}</span>
                      </div>
                      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden divide-y divide-white/[0.05]">
                        {grouped.older.map(renderItem)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* 4. Apple Safari Bottom Toolbar */}
        <div className={`px-4 sm:px-6 py-3 border-t flex items-center justify-between text-xs pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-slate-50/80'
        }`}>
          {/* Sol: Apple 'Temizle' Butonu */}
          <button
            onClick={() => {
              sound.playClick();
              setShowClearActionSheet(true);
            }}
            className="text-red-400 hover:text-red-300 active:scale-95 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Temizle...</span>
          </button>

          {/* Orta: Seçilenler Varsa 'Seçilenleri Sil' Butonu */}
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold text-[11px] shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer animate-in fade-in"
            >
              <span>Seçilenleri Sil ({selectedIds.size})</span>
            </button>
          )}

          {/* Sağ: Gizlilik Kalkanı */}
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Gizli mod kaydedilmez</span>
          </div>
        </div>

        {/* 5. 📱 APPLE SAFARI NATIVE ACTION SHEET (CLEAR HISTORY) */}
        {showClearActionSheet && (
          <div 
            className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-3 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setShowClearActionSheet(false)}
          >
            <div 
              className="w-full max-w-sm space-y-2.5 animate-in slide-in-from-bottom-5 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Apple Action Group */}
              <div className="rounded-2xl bg-[#1c1f2e]/95 border border-white/15 overflow-hidden divide-y divide-white/10 shadow-2xl backdrop-blur-2xl">
                <div className="px-4 py-3 text-center">
                  <h4 className="text-xs font-semibold text-slate-300">
                    Tarama Verilerini Temizle
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Seçtiğiniz aralıktaki arama ve web geçmişi silinecektir.
                  </p>
                </div>

                <button
                  onClick={() => handleClearHistoryRange('1h')}
                  className="w-full py-3 text-center text-xs font-medium text-sky-400 hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
                >
                  Son 1 saat
                </button>

                <button
                  onClick={() => handleClearHistoryRange('24h')}
                  className="w-full py-3 text-center text-xs font-medium text-sky-400 hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
                >
                  Son 24 saat (Bugün)
                </button>

                <button
                  onClick={() => handleClearHistoryRange('7d')}
                  className="w-full py-3 text-center text-xs font-medium text-sky-400 hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
                >
                  Son 7 gün
                </button>

                <button
                  onClick={() => handleClearHistoryRange('all')}
                  className="w-full py-3 text-center text-xs font-semibold text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-colors cursor-pointer"
                >
                  Tüm Geçmişi Temizle
                </button>
              </div>

              {/* Apple Separate Cancel Button */}
              <button
                onClick={() => setShowClearActionSheet(false)}
                className="w-full py-3 rounded-2xl bg-[#1c1f2e]/95 border border-white/15 text-center text-xs font-bold text-sky-400 hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer shadow-lg"
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
