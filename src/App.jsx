import React, { useState, useEffect, useRef } from 'react';
import AuroraBackground from './components/AuroraBackground';
import BrowserTabBar from './components/BrowserTabBar';
import BookmarksBar from './components/BookmarksBar';
import SpeedDialGrid from './components/SpeedDialGrid';
import AddBookmarkModal from './components/AddBookmarkModal';
import SearchBar from './components/SearchBar';
import HybridResults from './components/HybridResults';
import SettingsModal from './components/SettingsModal';
import InAppBrowserTab from './components/InAppBrowserTab';
import AdminPanelModal from './components/AdminPanelModal';
import ThemeSelectorModal from './components/ThemeSelectorModal';
import ContextMenu from './components/ContextMenu';
import BrowserOmnibar from './components/BrowserOmnibar';
import SslSecurityModal from './components/SslSecurityModal';
import AdBlockerModal from './components/AdBlockerModal';
import RecentVisitsSection from './components/RecentVisitsSection';
import IncognitoHeroView from './components/IncognitoHeroView';
import VpnModal from './components/VpnModal';
import HistoryModal from './components/HistoryModal';
import NovaTurkGoogleLogo from './components/NovaTurkGoogleLogo';
import SponsoredShowcase from './components/SponsoredShowcase';
import DynamicIsland from './components/DynamicIsland';
import DealHunterWidget from './components/DealHunterWidget';
import BusinessAdsModal from './components/BusinessAdsModal';
import { executeSearch, unescapeHtml } from './services/searchService';
import { 
  getBookmarks, addBookmark, removeBookmark, isBookmarked 
} from './services/bookmarkService';
import { getHistory, removeHistoryItem, addSearchHistory, addVisitHistory } from './services/historyService';
import { getVpnState } from './services/vpnService';
import { sound } from './services/soundService';
import { getSavedTheme, saveTheme } from './data/themes';
import { 
  ShieldCheck, Server, Compass, 
  BookOpen, Bot, Palette
} from 'lucide-react';

export default function App() {
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
  const [showBookmarksBar, setShowBookmarksBar] = useState(true);

  // 🌟 Sağ Tık (Context Menu) State'i
  const [contextMenuData, setContextMenuData] = useState(null);

  // 🌟 İframe & Omnibar & Kalkan State'leri
  const iframeRef = useRef(null);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAdBlockerOpen, setIsAdBlockerOpen] = useState(false);
  const [isVpnOpen, setIsVpnOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [vpnState, setVpnState] = useState(() => getVpnState());
  const [viewMode, setViewMode] = useState('iframe');
  const [reloadKey, setReloadKey] = useState(1);
  const [historyList, setHistoryList] = useState(() => getHistory());

  // 🌟 Yer İmleri ve Kısayollar State'i
  const [bookmarks, setBookmarks] = useState(() => getBookmarks());

  // 🌟 Google Chrome & Arc Tarzı Çoklu Sekme Mimarisi
  const [tabs, setTabs] = useState([
    { 
      id: 'tab_default', 
      type: 'search', 
      title: 'Yeni Sekme', 
      query: '', 
      results: null, 
      hasSearched: false, 
      isLoading: false,
      history: [''],
      historyIndex: 0
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab_default');

  // Aktif Sekmeyi Bul
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0] || {
    id: 'tab_default',
    type: 'search',
    title: 'Yeni Sekme',
    query: '',
    results: null,
    hasSearched: false,
    isLoading: false
  };

  // 10 Cam & Gradient Teması State'i
  const [currentTheme, setCurrentTheme] = useState(() => getSavedTheme());
  const [isDark, setIsDark] = useState(() => currentTheme.isDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  // Klavye Kısayolları: Ctrl + T (Yeni Sekme), Ctrl + Shift + N (Gizli Sekme), Ctrl + W (Sekme Kapat), Ctrl + B (Kısayollar Çubuğu)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 🕵️‍♂️ Ctrl + Shift + N: Gizli / Ajan Modu Sekmesi Aç
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewIncognitoTab();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleNewTab();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (tabs.length > 1) {
          handleCloseTab(activeTabId);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setShowBookmarksBar(prev => !prev);
      }
      // 🕒 Ctrl + H: Gelişmiş Tarayıcı Geçmişi Modalı Aç
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        sound.playChime();
        setIsHistoryOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId]);

  // 🌟 Global Sağ Tık Menüsü (Kopyala, Yapıştır, Geri, İleri, Ara)
  useEffect(() => {
    const handleGlobalContextMenu = (e) => {
      e.preventDefault();
      const sel = window.getSelection()?.toString() || '';
      let targetLink = '';
      const linkEl = e.target.closest('a');
      if (linkEl && linkEl.href) targetLink = linkEl.href;

      setContextMenuData({
        x: e.clientX,
        y: e.clientY,
        visible: true,
        selectedText: sel,
        linkUrl: targetLink
      });
    };

    window.addEventListener('contextmenu', handleGlobalContextMenu);
    return () => window.removeEventListener('contextmenu', handleGlobalContextMenu);
  }, []);

  // Canlı Tema Seçimi
  const handleSelectTheme = (theme) => {
    sound.playChime();
    setCurrentTheme(theme);
    saveTheme(theme.id);
    setIsDark(theme.isDark);
  };

  // 1. Yeni Normal Sekme Aç (+)
  const handleNewTab = () => {
    sound.playChime();
    const newId = `tab_${Date.now()}`;
    const newTab = {
      id: newId,
      type: 'search',
      title: 'Yeni Sekme',
      query: '',
      results: null,
      hasSearched: false,
      isLoading: false,
      isIncognito: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  };

  // 1.1 Yeni Gizli / Ajan Modu Sekmesi Aç (Ctrl + Shift + N)
  const handleNewIncognitoTab = () => {
    sound.playIncognito();
    const newId = `incognito_${Date.now()}`;
    const newTab = {
      id: newId,
      type: 'search',
      title: '🕶️ Gizli Sekme',
      query: '',
      results: null,
      hasSearched: false,
      isLoading: false,
      isIncognito: true
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  };

  // 2. Sekme Kapat (x)
  const handleCloseTab = (tabId) => {
    sound.playClick();
    setTabs(prev => {
      const remaining = prev.filter(t => t.id !== tabId);
      if (remaining.length === 0) {
        const fallback = {
          id: `tab_${Date.now()}`,
          type: 'search',
          title: 'Yeni Sekme',
          query: '',
          results: null,
          hasSearched: false,
          isLoading: false
        };
        setActiveTabId(fallback.id);
        return [fallback];
      }
      if (activeTabId === tabId) {
        const closedIdx = prev.findIndex(t => t.id === tabId);
        const nextActive = remaining[Math.min(closedIdx, remaining.length - 1)];
        setActiveTabId(nextActive.id);
      }
      return remaining;
    });
  };

const isElectronApp = () => {
  if (typeof window !== 'undefined') {
    if (window.__IS_ELECTRON__ || window.electron) return true;
    if (window.process && window.process.type === 'renderer') return true;
  }
  return typeof navigator !== 'undefined' && /electron/i.test(navigator.userAgent);
};

  // 3. Arama Sonucunu Sekmede Aç (Webde Yeni Sekme, Electron'da Dahili Tarayıcı)
  const handleOpenInAppTab = (result, forceNewTab = false) => {
    sound.playChime();
    let host = 'web';
    try { if (result.link) host = new URL(result.link).hostname; } catch {}
    const cleanTitle = unescapeHtml(result.title || host);

    // Ziyaret geçmişine ekle (Gizli modda ise ASLA kaydetme!)
    if (!activeTab.isIncognito) {
      addVisitHistory(result.link, cleanTitle);
    }

    // 🌐 Web Sürümünde (Vercel vb. normal tarayıcılarda):
    // Claude, Google, GitHub vb. modern siteler güvenlik (X-Frame-Options) nedeniyle
    // iframe içinde 'Bağlanmayı reddetti' hatası verir.
    // Bu yüzden web tarayıcısında daima güvenle yeni sekmede açılır!
    if (!isElectronApp()) {
      window.open(result.link, '_blank', 'noopener,noreferrer');
      return;
    }

    if (!forceNewTab) {
      // 🌟 GOOGLE CHROME GİBİ: AYNI SEKMEDE AÇ VE GEÇMİŞİ İLERLET!
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          const prevHist = t.history || (t.url ? [t.url] : [t.query || '']);
          const prevIdx = typeof t.historyIndex === 'number' ? t.historyIndex : prevHist.length - 1;
          const nextHist = [...prevHist.slice(0, prevIdx + 1), result.link];
          return {
            ...t,
            type: 'web',
            url: result.link,
            title: cleanTitle,
            snippet: unescapeHtml(result.snippet || ''),
            displayLink: result.displayLink || host,
            // Arama durumunu sakla ki geri tuşuna basınca anında arama sonuçları geri gelsin!
            savedQuery: t.query,
            savedResults: t.results,
            history: nextHist,
            historyIndex: nextHist.length - 1
          };
        }
        return t;
      }));
      setReloadKey(k => k + 1);
    } else {
      const newTabId = `web_${Date.now()}`;
      const newTab = {
        id: newTabId,
        type: 'web',
        url: result.link,
        title: cleanTitle,
        snippet: unescapeHtml(result.snippet || ''),
        displayLink: result.displayLink || host,
        history: [result.link],
        historyIndex: 0,
        isIncognito: activeTab.isIncognito
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTabId);
    }
  };

  // 🌟 Omnibar Navigasyon & Adres Girişi
  const handleOmnibarNavigate = (input) => {
    let target = input.trim();
    if (!target) return;

    const isUrl = target.startsWith('http://') || 
                  target.startsWith('https://') || 
                  (target.includes('.') && !target.includes(' '));

    if (isUrl) {
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
      }
      let host = target;
      try { host = new URL(target).hostname; } catch {}

      // Gizli modda ise geçmişe ekleme
      if (!activeTab.isIncognito) {
        addVisitHistory(target, host);
      }

      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          const prevHist = t.history || (t.url ? [t.url] : ['']);
          const prevIdx = typeof t.historyIndex === 'number' ? t.historyIndex : prevHist.length - 1;
          const nextHist = [...prevHist.slice(0, prevIdx + 1), target];
          return {
            ...t,
            type: 'web',
            url: target,
            title: host,
            snippet: `${host} web sitesi`,
            displayLink: host,
            history: nextHist,
            historyIndex: nextHist.length - 1
          };
        }
        return t;
      }));
      setReloadKey(k => k + 1);
    } else {
      // Arama Terimi (Gizli modda geçmişe kaydetme)
      if (!activeTab.isIncognito) {
        addSearchHistory(target);
      }

      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          const prevHist = t.history || [];
          const prevIdx = typeof t.historyIndex === 'number' ? t.historyIndex : prevHist.length - 1;
          const nextHist = [...prevHist.slice(0, prevIdx + 1), target];
          return {
            ...t,
            history: nextHist,
            historyIndex: nextHist.length - 1
          };
        }
        return t;
      }));
      handleSearch(target);
    }
  };

  // 🌟 Bir Adım Geri Git (Asla komple çıkmaz, sekme geçmişinde 1 adım geri döner)
  const handleOmnibarGoBack = () => {
    sound.playClick();
    try {
      if (iframeRef.current) {
        if (typeof iframeRef.current.canGoBack === 'function' && iframeRef.current.canGoBack()) {
          iframeRef.current.goBack();
          return;
        } else if (typeof iframeRef.current.goBack === 'function') {
          iframeRef.current.goBack();
          return;
        } else if (iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.history.back();
        }
      }
    } catch {}

    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const hist = t.history || [];
        const idx = typeof t.historyIndex === 'number' ? t.historyIndex : 0;
        if (idx > 0) {
          const newIdx = idx - 1;
          const target = hist[newIdx];
          const isTargetUrl = target && (target.startsWith('http://') || target.startsWith('https://'));
          if (isTargetUrl) {
            let host = target;
            try { host = new URL(target).hostname; } catch {}
            return {
              ...t,
              type: 'web',
              url: target,
              title: host,
              historyIndex: newIdx
            };
          } else {
            // Arama sonuçlarına 1 adım geri dön
            return {
              ...t,
              type: 'search',
              query: t.savedQuery || target || '',
              results: t.savedResults || t.results,
              hasSearched: !!(t.savedResults || t.results || target),
              historyIndex: newIdx
            };
          }
        }
      }
      return t;
    }));
    setReloadKey(k => k + 1);
  };

  // 🌟 Bir Adım İleri Git
  const handleOmnibarGoForward = () => {
    sound.playClick();
    try {
      if (iframeRef.current) {
        if (typeof iframeRef.current.canGoForward === 'function' && iframeRef.current.canGoForward()) {
          iframeRef.current.goForward();
          return;
        } else if (typeof iframeRef.current.goForward === 'function') {
          iframeRef.current.goForward();
          return;
        } else if (iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.history.forward();
        }
      }
    } catch {}

    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const hist = t.history || [];
        const idx = typeof t.historyIndex === 'number' ? t.historyIndex : 0;
        if (idx < hist.length - 1) {
          const newIdx = idx + 1;
          const target = hist[newIdx];
          const isTargetUrl = target && (target.startsWith('http://') || target.startsWith('https://'));
          if (isTargetUrl) {
            let host = target;
            try { host = new URL(target).hostname; } catch {}
            return {
              ...t,
              type: 'web',
              url: target,
              title: host,
              historyIndex: newIdx
            };
          } else {
            return {
              ...t,
              type: 'search',
              query: target,
              hasSearched: true,
              historyIndex: newIdx
            };
          }
        }
      }
      return t;
    }));
    setReloadKey(k => k + 1);
  };

  const handleOmnibarReload = () => {
    sound.playClick();
    setReloadKey(k => k + 1);
  };

  const handleOmnibarHome = () => {
    handleHomeClick();
  };

  // 🌟 Electron IPC Olay Dinleyicileri (Sağ tık arama, yeni sekmede link açma, geri/ileri)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron) {
      if (window.electron.onSearchText) {
        window.electron.onSearchText((text) => {
          if (text) handleOmnibarNavigate(text);
        });
      }
      if (window.electron.onOpenLinkTab) {
        window.electron.onOpenLinkTab((url) => {
          if (url) handleOpenInAppTab({ link: url, title: url });
        });
      }
      if (window.electron.onGoBack) {
        window.electron.onGoBack(() => handleOmnibarGoBack());
      }
      if (window.electron.onGoForward) {
        window.electron.onGoForward(() => handleOmnibarGoForward());
      }
    }
  }, []);

  // 4. Sekme Bilgilerini Güncelle (URL değiştirildiğinde)
  const handleUpdateTab = (tabId, updates) => {
    setTabs(prev => prev.map(t => {
      if (t.id === tabId) {
        return { ...t, ...updates };
      }
      return t;
    }));
  };

  // 5. Yer İmleri İşlemleri
  const handleAddBookmark = (item) => {
    const updated = addBookmark(item);
    setBookmarks(updated);
  };

  const handleRemoveBookmark = (idOrUrl) => {
    const updated = removeBookmark(idOrUrl);
    setBookmarks(updated);
  };

  const handleSelectBookmark = (bm) => {
    sound.playChime();
    let host = bm.domain || 'web';
    try { if (bm.url) host = new URL(bm.url).hostname; } catch {}
    const cleanTitle = unescapeHtml(bm.title || host);

    // Eğer aktif sekme zaten web sayfasıysa mevcut sekmede adresi değiştir, arama sekmesiyse yeni web sekmesi aç
    if (activeTab.type === 'web') {
      handleUpdateTab(activeTab.id, { url: bm.url, title: cleanTitle });
    } else {
      const newTabId = `web_${Date.now()}`;
      const newTab = {
        id: newTabId,
        type: 'web',
        url: bm.url,
        title: cleanTitle,
        snippet: `${cleanTitle} resmî platformu`,
        displayLink: host
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTabId);
    }
  };

  const handleToggleBookmarkCurrent = (item) => {
    if (isBookmarked(item.url)) {
      handleRemoveBookmark(item.url);
    } else {
      handleAddBookmark(item);
    }
  };

  // 6. Arama Yap
  const handleSearch = async (queryToSearch) => {
    if (!queryToSearch || !queryToSearch.trim()) return;
    
    sound.playClick();
    const cleanQ = unescapeHtml(queryToSearch.trim());
    
    // Arama geçmişine ekle (Gizli modda ise ASLA kaydetme!)
    if (!activeTab.isIncognito) {
      addSearchHistory(cleanQ);
    }
    
    // Aktif sekmeyi hemen arama durumuna geçir
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const prevHist = t.history || [];
        const prevIdx = typeof t.historyIndex === 'number' ? t.historyIndex : prevHist.length - 1;
        const nextHist = [...prevHist.slice(0, prevIdx + 1), cleanQ];
        return { 
          ...t, 
          query: cleanQ, 
          title: `Arama: ${cleanQ.slice(0, 18)}${cleanQ.length > 18 ? '...' : ''}`, 
          isLoading: true, 
          hasSearched: true,
          history: nextHist,
          historyIndex: nextHist.length - 1
        };
      }
      return t;
    }));

    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const data = await executeSearch(cleanQ, isDeepSearch);
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          return { ...t, results: data, isLoading: false };
        }
        return t;
      }));
    } catch (err) {
      console.error('Arama hatası:', err);
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          return { ...t, isLoading: false };
        }
        return t;
      }));
    }
  };

  // 7. Ana Sayfaya Dön (Logoya Tıklandığında)
  const handleHomeClick = () => {
    sound.playClick();
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        return { ...t, hasSearched: false, results: null, query: '', title: 'Yeni Sekme' };
      }
      return t;
    }));
  };

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  return (
    <div className={`relative w-screen h-screen min-h-screen flex flex-col overflow-hidden transition-colors duration-500 bg-transparent ${
      isDark ? 'dark text-slate-100' : 'light text-slate-900'
    }`}>
      {/* 🌟 10 Canlı Cam & Gradient Arka Planı (Arama Sayfasında Görünür) */}
      {activeTab.type === 'search' && <AuroraBackground currentTheme={currentTheme} isDark={isDark} />}

      {/* 🌟 APPLE DYNAMIC ISLAND (HER ZAMAN CANLI, GÖRÜNÜR & ETKİLEŞİMLİ) */}
      <DynamicIsland 
        query={activeTab.query}
        isSearching={activeTab.isLoading}
        sadedeGel={activeTab.results?.sadedeGel}
        halkNeDiyor={activeTab.results?.halkNeDiyor}
        comparison={activeTab.results?.comparison}
        isDark={isDark}
        currentTheme={currentTheme}
        onScrollToTop={() => {
          const el = document.querySelector('.overflow-y-auto');
          if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 🌟 1. EN TEPEDE APPLE VISIONOS & CHROME TARZI TAM EKRAN SEKME ÇUBUĞU */}
      <BrowserTabBar 
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={(id) => setActiveTabId(id)}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        onNewIncognitoTab={handleNewIncognitoTab}
        onHomeClick={handleHomeClick}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenThemeSelector={() => setIsThemeModalOpen(true)}
        onOpenVpnModal={() => { setVpnState(getVpnState()); setIsVpnOpen(true); }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        isVpnActive={vpnState.isActive}
        isDark={isDark}
        setIsDark={setIsDark}
        currentTheme={currentTheme}
      />

      {/* 🌟 2. GOOGLE CHROME ADRES & ARAMA ÇUBUĞU (YENİ SEKME DAHİL HER ZAMAN GÖRÜNÜR) */}
      <BrowserOmnibar 
        activeTab={activeTab}
        onNavigate={handleOmnibarNavigate}
        onGoBack={handleOmnibarGoBack}
        onGoForward={handleOmnibarGoForward}
        canGoBack={(activeTab.historyIndex || 0) > 0}
        canGoForward={(activeTab.historyIndex || 0) < ((activeTab.history || []).length - 1)}
        onReload={handleOmnibarReload}
        onHome={handleOmnibarHome}
        isBookmarked={isBookmarked(activeTab.url || '')}
        onToggleBookmark={() => {
          if (activeTab.url) {
            handleToggleBookmarkCurrent({ title: activeTab.title, url: activeTab.url });
          } else {
            setIsAddBookmarkOpen(true);
          }
        }}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenAdBlockerModal={() => setIsAdBlockerOpen(true)}
        onOpenVpnModal={() => { setVpnState(getVpnState()); setIsVpnOpen(true); }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        isVpnActive={vpnState.isActive}
        selectedVpnCountry={vpnState.selectedCountry}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        isDark={isDark}
        currentTheme={currentTheme}
        isDeepSearch={isDeepSearch}
        setIsDeepSearch={setIsDeepSearch}
      />

      {/* 🌟 3. APPLE VISIONOS YER İMLERİ VE HIZLI KISAYOLLAR ŞERİDİ */}
      {showBookmarksBar && (
        <BookmarksBar 
          bookmarks={bookmarks}
          onSelectBookmark={handleSelectBookmark}
          onRemoveBookmark={handleRemoveBookmark}
          onAddBookmarkClick={() => setIsAddBookmarkOpen(true)}
          isDark={isDark}
          currentTheme={currentTheme}
        />
      )}

      {/* 🌟 4. TAM EKRAN İÇERİK ALANI */}
      <main className="flex-1 w-full h-full overflow-hidden flex flex-col relative z-10">
        {activeTab.type === 'web' ? (
          /* ============================================================ */
          /* %100 TAM EKRAN WEB SEKME İÇİ TARAYICI                        */
          /* ============================================================ */
          <InAppBrowserTab 
            key={activeTab.id}
            tab={activeTab}
            onClose={handleCloseTab}
            onUpdateTab={handleUpdateTab}
            isDark={isDark}
            currentTheme={currentTheme}
            viewMode={viewMode}
            setViewMode={setViewMode}
            iframeRef={iframeRef}
            reloadKey={reloadKey}
            onContextMenu={setContextMenuData}
          />
        ) : !activeTab.hasSearched ? (
          activeTab.isIncognito ? (
            <IncognitoHeroView 
              onSearch={handleSearch}
              onOpenNormalTab={handleNewTab}
              onOpenAdBlocker={() => setIsAdBlockerOpen(true)}
              isDeepSearch={isDeepSearch}
              setIsDeepSearch={setIsDeepSearch}
              isDark={isDark}
              currentTheme={currentTheme}
            />
          ) : (
          /* ============================================================ */
          /* PURE APPLE MINIMALIST HERO VIEW (YENİ SEKME ANA SAYFASI)     */
          /* ============================================================ */
          <div className="w-full h-full overflow-y-auto flex-1 flex flex-col justify-between">
            <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center animate-fadeIn my-auto">
              
              {/* 🌟 GOOGLE TARZI ÇOK RENKLİ VE İNTERAKTİF NOVATÜRK LOGOSU & İSMİ */}
              <NovaTurkGoogleLogo 
                isDark={isDark} 
                currentTheme={currentTheme} 
                showSubtitle={true} 
                size="large" 
              />

              {/* Apple VisionOS Search Bar */}
              <div className="w-full max-w-2xl mb-4">
                <SearchBar 
                  onSearch={handleSearch} 
                  isCompact={false} 
                  defaultQuery={activeTab.query}
                  isDeepSearch={isDeepSearch}
                  setIsDeepSearch={setIsDeepSearch}
                  isDark={isDark}
                  currentTheme={currentTheme}
                />
              </div>

              {/* 🌟 Ajan / Gizli Gezinti Hızlı Başlatıcı */}
              <div className="mb-8">
                <button
                  onClick={handleNewIncognitoTab}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-300 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105 cursor-pointer shadow-sm group"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span>🕶️ Gizli Gezinti (Ajan Modu - Ctrl + Shift + N)</span>
                </button>
              </div>

              {/* 🌟 MODEL 3: ANA EKRAN PRESTİJ VİTRİNİ & SPONSORLU PARTNERLER */}
              <SponsoredShowcase
                onSelectPartner={(partner) => handleOpenInAppTab({ link: partner.link, title: partner.title, displayLink: partner.displayLink })}
                onOpenBusinessModal={() => setIsBusinessModalOpen(true)}
                isDark={isDark}
                currentTheme={currentTheme}
              />

              {/* 🌟 APPLE VISIONOS SPEED DIAL (SIK ZİYARET EDİLEN KISAYOLLAR) */}
              <SpeedDialGrid 
                bookmarks={bookmarks}
                onSelectBookmark={handleSelectBookmark}
                onRemoveBookmark={handleRemoveBookmark}
                onAddBookmarkClick={() => setIsAddBookmarkOpen(true)}
                isDark={isDark}
                currentTheme={currentTheme}
              />

              {/* 🌟 GOOGLE TARZI SON ZİYARET EDİLEN SİTELER VİTRİNİ */}
              <RecentVisitsSection 
                history={historyList}
                onSelectVisit={handleOmnibarNavigate}
                onRemoveItem={(id) => {
                  const updated = removeHistoryItem(id);
                  setHistoryList(updated);
                }}
                isDark={isDark}
              />

              {/* Apple Minimalist Feature Pillars */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
                {[
                  {
                    icon: ShieldCheck,
                    title: '50 Türk Sitesi İndeksi',
                    desc: 'Webrazzi, AA, TÜBİTAK ve üniversitelerden çekilen reklamsız veritabanı.'
                  },
                  {
                    icon: Bot,
                    title: '4 Otonom Ajan',
                    desc: 'Kâşif, Hâkim, Analist ve İcracı sorguyu eşzamanlı olarak işler.'
                  },
                  {
                    icon: BookOpen,
                    title: 'Reklamsız Okuyucu',
                    desc: 'Siteden ayrılmadan, çerez ve reklamları temizlenmiş saf metni oku.'
                  },
                  {
                    icon: Server,
                    title: 'Admin Masası',
                    desc: 'Crawler durumu, canlı indeksleme ve kara liste yönetim konsolu.'
                  }
                ].map((f, i) => {
                  const Icon = f.icon;
                  const accent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        sound.playClick();
                        if (i === 3) setIsAdminOpen(true);
                      }}
                      className={`apple-glass-card rounded-2xl p-3.5 border cursor-pointer group transition-all duration-300 ${
                        isDark ? 'border-white/8 hover:border-white/20' : 'border-black/6 hover:border-black/15'
                      }`}
                    >
                      <div 
                        style={{
                          backgroundColor: `${accent}18`,
                          borderColor: `${accent}35`,
                          color: accent
                        }}
                        className="w-7 h-7 rounded-xl flex items-center justify-center mb-2.5 border transition-all duration-300 group-hover:scale-110 shadow-sm"
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-semibold mb-0.5 tracking-tight group-hover:text-current transition-colors">
                        {f.title}
                      </h3>
                      <p className={`text-[11px] leading-relaxed font-normal ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {f.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Minimalist Trust Indicator */}
              <div className="mt-8 flex items-center justify-center gap-6 text-xs opacity-50">
                <span>Sıfır Reklam</span>
                <span>•</span>
                <span>50 Yerli Web Sitesi</span>
                <span>•</span>
                <span>%100 Gizlilik</span>
              </div>

            </div>

            {/* Apple Minimalist Footer (Sadece Arama Sayfasında) */}
            <footer className={`w-full border-t py-4 px-6 backdrop-blur-xl transition-colors ${
              isDark ? 'border-white/10 bg-[#08090d]/70' : 'border-black/10 bg-[#f6f7fb]/70'
            }`}>
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-60">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">NovaTürk AI</span>
                  <span>•</span>
                  <span>{currentTheme.name} Teması</span>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      sound.playClick();
                      setIsThemeModalOpen(true);
                    }}
                    className="hover:opacity-100 transition-opacity flex items-center gap-1 font-medium"
                  >
                    <Palette className="w-3.5 h-3.5" /> Temalar (10)
                  </button>
                  <span>•</span>
                  <button 
                    onClick={() => {
                      sound.playClick();
                      setIsAdminOpen(true);
                    }}
                    className="hover:opacity-100 transition-opacity"
                  >
                    Admin Masası
                  </button>
                  <span>•</span>
                  <button 
                    onClick={() => {
                      sound.playClick();
                      setIsSettingsOpen(true);
                    }}
                    className="hover:opacity-100 transition-opacity font-semibold"
                  >
                    ⚙️ Sistem & Tarayıcı Ayarları
                  </button>
                </div>
              </div>
            </footer>
          </div>
        )
      ) : (
          /* ============================================================ */
          /* SEARCH RESULTS VIEW (FULL SCREEN SCROLLABLE)                 */
          /* ============================================================ */
          <div className="w-full h-full flex-1 overflow-y-auto flex flex-col">
            {/* Sticky Floating Glass Search Header */}
            <div 
              style={{
                boxShadow: isDark 
                  ? `0 10px 30px -10px rgba(0,0,0,0.6), 0 1px 0 0 rgba(255,255,255,0.08)` 
                  : `0 10px 30px -10px rgba(0,0,0,0.05), 0 1px 0 0 rgba(0,0,0,0.06)`
              }}
              className={`w-full py-2.5 sticky top-0 z-40 backdrop-blur-3xl transition-all ${
                isDark ? 'bg-[#08090d]/85' : 'bg-[#f6f7fb]/90'
              }`}
            >
              <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
                <SearchBar 
                  onSearch={handleSearch} 
                  isCompact={true} 
                  defaultQuery={activeTab.query}
                  isDeepSearch={isDeepSearch}
                  setIsDeepSearch={setIsDeepSearch}
                  isDark={isDark}
                  currentTheme={currentTheme}
                />
              </div>
            </div>

            {/* Results Content */}
            <div className="flex-1 w-full">
              {activeTab.isLoading ? (
                <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border animate-pulse ${
                    isDark ? 'bg-white/10 border-white/15' : 'bg-black/5 border-black/10'
                  }`}>
                    <Compass className="w-4 h-4 opacity-60" />
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="text-sm font-semibold">
                      "{activeTab.query}" taranıyor...
                    </h3>
                    <p className="text-xs opacity-50 max-w-sm">
                      50 Türk sitesi ve doğrulanmış kaynaklar taranıyor, saf rapor hazırlanıyor.
                    </p>
                  </div>

                  <div className="w-full space-y-2.5 pt-3">
                    <div className={`h-28 rounded-2xl animate-pulse ${isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`} />
                    <div className={`h-20 rounded-2xl animate-pulse ${isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`} />
                  </div>
                </div>
              ) : (
                <HybridResults 
                  results={activeTab.results} 
                  onRelatedClick={handleSearch}
                  isDark={isDark}
                  currentTheme={currentTheme}
                  onOpenInAppTab={handleOpenInAppTab}
                />
              )}
            </div>

            {/* Results Footer */}
            <footer className={`w-full border-t py-4 px-6 mt-10 backdrop-blur-xl transition-colors ${
              isDark ? 'border-white/10 bg-[#08090d]/70' : 'border-black/10 bg-[#f6f7fb]/70'
            }`}>
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-60">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">NovaTürk AI</span>
                  <span>•</span>
                  <span>{currentTheme.name} Teması</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="hover:opacity-100 transition-opacity font-semibold"
                  >
                    ⚙️ Sistem & Tarayıcı Ayarları
                  </button>
                </div>
              </div>
            </footer>
          </div>
        )}
      </main>

      {/* Kısayol / Yer İmi Ekleme Modalı */}
      <AddBookmarkModal 
        isOpen={isAddBookmarkOpen}
        onClose={() => setIsAddBookmarkOpen(false)}
        onAdd={handleAddBookmark}
        isDark={isDark}
        currentTheme={currentTheme}
      />

      {/* Gelişmiş Ayarlar Modalı (4 Sekmeli) */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        isDark={isDark}
        currentTheme={currentTheme}
      />

      {/* Admin Masası Konsolu Modalı */}
      <AdminPanelModal 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        isDark={isDark}
        currentTheme={currentTheme}
      />

      {/* 🌟 10 Renkli Cam Teması Seçim Modalı (Canlı Önizleme) */}
      <ThemeSelectorModal 
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        isDark={isDark}
      />

      {/* 🌟 11. SAĞ TIK SEÇENEKLERİ MENÜSÜ (Kopyala, Yapıştır, Kes, Geri, İleri, Yenile, Ara) */}
      <ContextMenu 
        menuData={contextMenuData}
        onClose={() => setContextMenuData(null)}
        onGoBack={handleOmnibarGoBack}
        onGoForward={handleOmnibarGoForward}
        onReload={handleOmnibarReload}
        onNewTab={(url) => {
          if (url) {
            handleOpenInAppTab({ link: url, title: url });
          } else {
            handleNewTab();
          }
        }}
        onCloseTab={() => {
          if (tabs.length > 1) {
            handleCloseTab(activeTabId);
          }
        }}
        onOpenSearch={(query) => {
          handleSearch(query);
        }}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        isDark={isDark}
      />

      {/* 🌟 12. SSL & GÜVENLİK SERTİFİKASI MODALI */}
      <SslSecurityModal 
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        url={activeTab.url || 'https://novaturk.ai'}
        isDark={isDark}
      />

      {/* 🌟 13. REKLAM & TAKİPÇİ ENGELLEYİCİ ULTRA KALKAN MODALI */}
      <AdBlockerModal 
        isOpen={isAdBlockerOpen}
        onClose={() => setIsAdBlockerOpen(false)}
        currentUrl={activeTab.url || 'https://novaturk.ai'}
        isDark={isDark}
      />

      {/* 🌟 14. NOVATÜRK CYBERVPN & GİZLİLİK MODALI */}
      <VpnModal 
        isOpen={isVpnOpen}
        onClose={() => {
          setIsVpnOpen(false);
          const updated = getVpnState();
          setVpnState(updated);
          setReloadKey(k => k + 1);
        }}
        onVpnChange={(updated) => {
          setVpnState(updated);
          setReloadKey(k => k + 1);
        }}
        isDark={isDark}
      />

      {/* 🌟 15. ULTRA GELİŞMİŞ TARAYICI & ARAMA GEÇMİŞİ MODALI (CTRL+H) */}
      <HistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onNavigate={handleOmnibarNavigate}
        onNewTab={(url) => {
          if (url) handleOpenInAppTab({ link: url, title: url });
          else handleNewTab();
        }}
        isDark={isDark}
      />

      {/* 🌟 MODEL 2: AI FIRSAT AVCISI & CANLI KUPON KALKANI */}
      <DealHunterWidget 
        isDark={isDark}
        onOpenStore={(partner) => handleOpenInAppTab({ link: partner.link, title: partner.title, displayLink: partner.displayLink })}
        activeQuery={activeTab?.query}
      />

      {/* 🌟 İŞLETME SPONSORLUK & 1. SIRA REKLAM MERKEZİ */}
      <BusinessAdsModal 
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
        isDark={isDark}
        currentTheme={currentTheme}
      />
    </div>
  );
}
