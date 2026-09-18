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
import MobileBottomBar from './components/MobileBottomBar';
import MobileTopBar from './components/MobileTopBar';
import MobileTabsSheet from './components/MobileTabsSheet';
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
      title: 'Ana Sayfa', 
      query: '', 
      results: null, 
      hasSearched: false, 
      isLoading: false,
      history: [''],
      historyIndex: 0,
      isHome: true,
      isNewTab: false
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

  // 📱 Mobil Sekme Kartları Bottom Sheet State'i
  const [isMobileTabsOpen, setIsMobileTabsOpen] = useState(false);

  // 🎵 Mobil Bar için Canlı Medya Dinleyicisi
  const [mediaState, setMediaState] = useState(null);

  useEffect(() => {
    const handleMediaUpdate = (e) => {
      if (e.detail) {
        setMediaState(e.detail);
      }
    };
    window.addEventListener('novaturk:media-status-update', handleMediaUpdate);
    return () => window.removeEventListener('novaturk:media-status-update', handleMediaUpdate);
  }, []);

  const activeMediaTab = tabs.find(t => 
    t.type === 'web' && 
    (t.url?.includes('youtube.com') || t.url?.includes('youtu.be') || t.url?.includes('spotify') || t.title?.toLowerCase().includes('youtube'))
  );

  const handleToggleMediaPlay = () => {
    const targetTabId = mediaState?.tabId || activeMediaTab?.id;
    if (targetTabId) {
      window.dispatchEvent(new CustomEvent('novaturk:media-command', {
        detail: { tabId: targetTabId, action: 'toggle' }
      }));
    }
  };

  const handleExpandIsland = () => {
    window.dispatchEvent(new CustomEvent('novaturk:expand-island'));
  };

  // 🔍 Arama Sonuçları Başlığı Küçülme (Dynamic Collapsible Search Bar) State'i
  const [isSearchHeaderMini, setIsSearchHeaderMini] = useState(false);
  const lastScrollTopRef = useRef(0);

  const handleSearchResultsScroll = (e) => {
    const currentScrollTop = e.currentTarget.scrollTop;

    // 1. En yukarıdaysa (<= 25px): Kesinlikle tam boyut geri gelsin
    if (currentScrollTop <= 25) {
      setIsSearchHeaderMini(false);
    } 
    // 2. Aşağı kaydırınca (currentScrollTop artıyor ve > 50px): Küçülsün ve minimalist olsun
    else if (currentScrollTop > lastScrollTopRef.current && currentScrollTop > 50) {
      setIsSearchHeaderMini(true);
    } 
    // 3. Yukarı kaydırınca (currentScrollTop azalıyor): Geri gelsin!
    else if (currentScrollTop < lastScrollTopRef.current - 6) {
      setIsSearchHeaderMini(false);
    }

    lastScrollTopRef.current = currentScrollTop;
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

  // 🌟 Global Sağ Tık Menüsü (Kopyala, Yapıştır, İncele, Kaynak, Resim)
  useEffect(() => {
    const handleGlobalContextMenu = (e) => {
      // 💡 Shift + Sağ Tık: Doğrudan Google Chrome'un kendi yerel sağ tık menüsünü aç
      if (e.shiftKey) {
        setContextMenuData(null);
        return;
      }

      e.preventDefault();
      const sel = window.getSelection()?.toString() || '';
      let targetLink = '';
      const linkEl = e.target.closest('a');
      if (linkEl && linkEl.href) targetLink = linkEl.href;

      let imgSrc = '';
      const imgEl = e.target.closest('img');
      if (imgEl && imgEl.src) imgSrc = imgEl.src;

      setContextMenuData({
        x: e.clientX,
        y: e.clientY,
        visible: true,
        selectedText: sel,
        linkUrl: targetLink,
        srcUrl: imgSrc
      });
    };

    // 🌟 Tümünü Seç yapıldıktan sonra ekranda bir yere tıklandığında seçimi temizle (Mavi kilitlenmeyi çözer)
    const handleGlobalClickToDeselect = (e) => {
      if (e.target.closest('input') || e.target.closest('textarea')) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        if (!e.target.closest('.selectable-text') && !e.target.closest('p') && !e.target.closest('h1') && !e.target.closest('h2') && !e.target.closest('h3')) {
          sel.removeAllRanges();
        }
      }
    };

    window.addEventListener('contextmenu', handleGlobalContextMenu);
    window.addEventListener('click', handleGlobalClickToDeselect);
    return () => {
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
      window.removeEventListener('click', handleGlobalClickToDeselect);
    };
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
      isIncognito: false,
      isHome: false,
      isNewTab: true
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

    // 🌐 Canlı Proxy sayesinde web sürümünde de sekme içinde güvenle açılabilir!

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
    
    setIsSearchHeaderMini(false);
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

  // 6.1 Arama Terimini Yeni Sekmede Aç ve Hemen Ara
  const handleOpenSearchInNewTab = async (queryToSearch) => {
    if (!queryToSearch || !queryToSearch.trim()) return;
    sound.playChime();
    const cleanQ = unescapeHtml(queryToSearch.trim());
    const newId = `search_${Date.now()}`;
    const newTab = {
      id: newId,
      type: 'search',
      title: `Arama: ${cleanQ.slice(0, 18)}${cleanQ.length > 18 ? '...' : ''}`,
      query: cleanQ,
      results: null,
      hasSearched: true,
      isLoading: true,
      isIncognito: activeTab.isIncognito,
      history: [cleanQ],
      historyIndex: 0
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    if (!activeTab.isIncognito) {
      addSearchHistory(cleanQ);
    }
    try {
      const data = await executeSearch(cleanQ, isDeepSearch);
      setTabs(prev => prev.map(t => t.id === newId ? { ...t, results: data, isLoading: false } : t));
    } catch {
      setTabs(prev => prev.map(t => t.id === newId ? { ...t, isLoading: false } : t));
    }
  };

  // 7. Ana Sayfaya Dön (Logoya Tıklandığında)
  const handleHomeClick = () => {
    sound.playClick();
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        return { ...t, hasSearched: false, results: null, query: '', title: 'Ana Sayfa', isHome: true, isNewTab: false };
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

      {/* 🌟 APPLE DYNAMIC ISLAND (HER ZAMAN CANLI, GÖRÜNÜR, SÜRÜKLENEBİLİR & ETKİLEŞİMLİ) */}
      <DynamicIsland 
        query={activeTab.query}
        isSearching={activeTab.isLoading}
        sadedeGel={activeTab.results?.sadedeGel}
        halkNeDiyor={activeTab.results?.halkNeDiyor}
        comparison={activeTab.results?.comparison}
        isDark={isDark}
        currentTheme={currentTheme}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={(id) => setActiveTabId(id)}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        onSearch={handleSearch}
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

      {/* 🌟 4. TAM EKRAN İÇERİK ALANI (KALICI SEKMELER & KESİNTİSİZ SES) */}
      <main className="flex-1 w-full h-full overflow-hidden flex flex-col relative z-10">
        {/* ============================================================ */}
        {/* KALICI WEB SEKMELERİ (ARKA PLANDA YOUTUBE SESİ ASLA KESİLMEZ) */}
        {/* ============================================================ */}
        {tabs.filter(t => t.type === 'web').map((webTab) => {
          const isThisActive = activeTabId === webTab.id;
          return (
            <div
              key={webTab.id}
              className={`w-full h-full absolute inset-0 pb-[calc(60px+env(safe-area-inset-bottom,0px))] md:pb-0 ${isThisActive ? 'z-20' : 'z-0 pointer-events-none'}`}
              style={{
                visibility: isThisActive ? 'visible' : 'hidden',
              }}
            >
              <InAppBrowserTab 
                tab={webTab}
                onClose={handleCloseTab}
                onUpdateTab={handleUpdateTab}
                isDark={isDark}
                currentTheme={currentTheme}
                viewMode={viewMode}
                setViewMode={setViewMode}
                iframeRef={isThisActive ? iframeRef : undefined}
                reloadKey={reloadKey}
                onContextMenu={setContextMenuData}
              />
            </div>
          );
        })}

        {/* ============================================================ */}
        {/* EĞER AKTİF SEKME ARAMA / YENİ SEKME İSE GÖSTER               */}
        {/* ============================================================ */}
        {activeTab.type === 'search' && (
          <div className="w-full h-full relative z-10 flex flex-col flex-1 overflow-hidden">
            {!activeTab.hasSearched ? (
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
          /* PURE APPLE MINIMALIST HERO VIEW (YENİ SEKME BAŞLANGIÇ SAYFASI) */
          /* ============================================================ */
          <div className="w-full h-full overflow-y-auto flex-1 flex flex-col items-center justify-start pb-28 md:pb-12 pt-20 sm:pt-24 md:pt-28">
            <div className="w-full max-w-3xl mx-auto px-4 flex flex-col items-center text-center animate-fadeIn">
              
              {/* 🌟 LOGO: HOME'DA BÜYÜK VE ASİL, YENİ SEKMEDE MİNİMALİST APPLE SAFARI */}
              <NovaTurkGoogleLogo 
                isDark={isDark} 
                currentTheme={currentTheme} 
                isMinimal={activeTab.isNewTab === true} 
                showSubtitle={false} 
              />

              {/* 🔍 Arama Çubuğu (Apple tarzında bir tık aşağıda, ferah ve modern) */}
              <div className="w-full max-w-2xl mt-7 sm:mt-9 mb-10 sm:mb-12">
                <SearchBar 
                  onSearch={handleSearch} 
                  isCompact={false} 
                  defaultQuery={activeTab.query}
                  isDeepSearch={isDeepSearch}
                  setIsDeepSearch={setIsDeepSearch}
                  isDark={isDark}
                  currentTheme={currentTheme}
                  autoFocus={activeTab.isNewTab}
                />
              </div>

              {/* 🌟 1. APPLE SAFARI FAVORİLER (KULLANICININ EKLEDİĞİ ŞEYLER) */}
              <SpeedDialGrid 
                bookmarks={bookmarks}
                onSelectBookmark={handleSelectBookmark}
                onRemoveBookmark={handleRemoveBookmark}
                onAddBookmarkClick={() => setIsAddBookmarkOpen(true)}
                isDark={isDark}
                currentTheme={currentTheme}
              />

              {/* 🌟 2. APPLE SAFARI SIK ZİYARET EDİLENLER */}
              <RecentVisitsSection 
                history={historyList}
                onSelectVisit={handleOmnibarNavigate}
                onRemoveItem={(id) => {
                  const updated = removeHistoryItem(id);
                  setHistoryList(updated);
                }}
                isDark={isDark}
              />
            </div>
          </div>
        )
      ) : (
          /* ============================================================ */
          /* SEARCH RESULTS VIEW (FULL SCREEN SCROLLABLE)                 */
          /* ============================================================ */
          <div 
            onScroll={handleSearchResultsScroll}
            className="w-full h-full flex-1 overflow-y-auto flex flex-col pb-24 md:pb-0"
          >
            {/* Sticky Floating Glass Search Header (Apple VisionOS Collapsible) */}
            <div 
              style={{
                boxShadow: isDark 
                  ? isSearchHeaderMini
                    ? `0 12px 32px -10px rgba(0,0,0,0.85), 0 1px 0 0 rgba(255,255,255,0.12)`
                    : `0 10px 30px -10px rgba(0,0,0,0.6), 0 1px 0 0 rgba(255,255,255,0.08)` 
                  : isSearchHeaderMini
                    ? `0 12px 32px -10px rgba(0,0,0,0.12), 0 1px 0 0 rgba(0,0,0,0.1)`
                    : `0 10px 30px -10px rgba(0,0,0,0.05), 0 1px 0 0 rgba(0,0,0,0.06)`
              }}
              className={`w-full sticky top-0 z-40 backdrop-blur-3xl transition-all duration-300 ${
                isSearchHeaderMini ? 'py-1 sm:py-1.5' : 'py-2.5 sm:py-3.5'
              } ${
                isDark ? 'bg-[#08090d]/90' : 'bg-[#f6f7fb]/92'
              }`}
            >
              <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-start relative">
                
                {/* 🌟 1. AŞAĞIDAKİ KARTLARIN BİRAZ SOLUNDA YERLEŞEN APPLE LOGO (Google Desktop Tarzı) */}
                <button
                  onClick={handleHomeClick}
                  className="flex items-center gap-2 select-none shrink-0 group cursor-pointer active:scale-95 transition-all text-left xl:absolute xl:right-full xl:mr-4 2xl:mr-6 mr-3"
                  title="Ana Sayfaya Dön"
                >
                  {/* Apple Squircle Compass Icon */}
                  <div 
                    style={{
                      boxShadow: isDark
                        ? '0 4px 14px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
                        : '0 4px 14px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.8)'
                    }}
                    className={`${
                      isSearchHeaderMini ? 'w-7 h-7 rounded-lg' : 'w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl'
                    } flex items-center justify-center border transition-all duration-300 group-hover:scale-105 backdrop-blur-xl ${
                      isDark ? 'bg-white/10 border-white/20 text-sky-400' : 'bg-white/90 border-black/10 text-sky-600'
                    }`}
                  >
                    <Compass className={`${isSearchHeaderMini ? 'w-3.5 h-3.5' : 'w-4 h-4'} transition-transform duration-500 group-hover:rotate-45`} />
                  </div>

                  {/* Minimalist Apple Logo & İsim */}
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className={`${
                      isSearchHeaderMini ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                    } font-bold tracking-tight font-['Outfit',sans-serif] transition-all ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      NovaTürk
                    </span>
                    <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider border ${
                      isDark ? 'bg-white/10 text-sky-400 border-white/15' : 'bg-sky-50 text-sky-600 border-sky-200'
                    }`}>
                      AI
                    </span>
                  </div>
                </button>

                {/* 🌟 2. ARAMA BARI: AŞAĞIDAKİ KARTLARLA BİREBİR AYNI DİKEY HİZADA BAŞLAR */}
                <div className="w-full max-w-xl sm:max-w-2xl">
                  <SearchBar 
                    onSearch={handleSearch} 
                    isCompact={true} 
                    isMini={isSearchHeaderMini}
                    defaultQuery={activeTab.query}
                    isDeepSearch={isDeepSearch}
                    setIsDeepSearch={setIsDeepSearch}
                    isDark={isDark}
                    currentTheme={currentTheme}
                  />
                </div>
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
        setIsDark={setIsDark}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        onOpenThemeSelector={() => {
          setIsSettingsOpen(false);
          setIsThemeModalOpen(true);
        }}
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
        onNavigate={(target, item) => {
          const isUrl = target && (target.startsWith('http://') || target.startsWith('https://') || (target.includes('.') && !target.includes(' ')));
          if (isUrl) {
            handleOmnibarNavigate(target);
          } else {
            handleSearch(target);
          }
        }}
        onNewTab={(target, item) => {
          const isUrl = target && (target.startsWith('http://') || target.startsWith('https://') || (target.includes('.') && !target.includes(' ')));
          if (isUrl) {
            const finalUrl = (target.startsWith('http://') || target.startsWith('https://')) ? target : `https://${target}`;
            handleOpenInAppTab({ link: finalUrl, title: finalUrl }, true);
          } else {
            handleOpenSearchInNewTab(target);
          }
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

      {/* 🌟 MOBİL SAĞ ÜST KÖŞE AYARLAR VE KONTROL MERKEZİ (APPLE VISIONOS) */}
      <MobileTopBar 
        onHomeClick={handleHomeClick}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenThemeSelector={() => setIsThemeModalOpen(true)}
        onOpenVpnModal={() => { setVpnState(getVpnState()); setIsVpnOpen(true); }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        isVpnActive={vpnState.isActive}
        isDark={isDark}
        setIsDark={setIsDark}
        currentTheme={currentTheme}
        showHomeButton={activeTab.hasSearched || activeTab.type === 'web'}
      />

      {/* 📱 APPLE SAFARI iOS FLOATING GLASS ADRES & ARAMA KAPSÜLÜ (ALT BAR) */}
      <MobileBottomBar 
        tabs={tabs}
        activeTabId={activeTabId}
        activeTab={activeTab}
        onNavigate={handleOmnibarNavigate}
        onSearch={handleSearch}
        onNewTab={handleNewTab}
        onOpenTabsSheet={() => setIsMobileTabsOpen(true)}
        onGoBack={handleOmnibarGoBack}
        onGoForward={handleOmnibarGoForward}
        canGoBack={(activeTab.historyIndex || 0) > 0}
        canGoForward={(activeTab.historyIndex || 0) < ((activeTab.history || []).length - 1)}
        onReload={handleOmnibarReload}
        isDark={isDark}
        currentTheme={currentTheme}
        activeMediaTab={activeMediaTab}
        mediaState={mediaState}
        onToggleMediaPlay={handleToggleMediaPlay}
      />

      {/* 📑 MOBİL SEKME YÖNETİCİSİ (APPLE SAFARI 3D CARD GRID) */}
      <MobileTabsSheet 
        isOpen={isMobileTabsOpen}
        onClose={() => setIsMobileTabsOpen(false)}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={(id) => setActiveTabId(id)}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        onNewIncognitoTab={handleNewIncognitoTab}
        isDark={isDark}
        currentTheme={currentTheme}
      />
    </div>
  );
}
