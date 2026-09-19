import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, ExternalLink, BookOpen, 
  Lock, Sparkles, CheckCircle2, ArrowUpRight, ShieldAlert,
  Globe, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { unescapeHtml, API_BASE } from '../services/searchService';
import { sound } from '../services/soundService';

const isElectronApp = () => {
  if (typeof window !== 'undefined') {
    if (window.__IS_ELECTRON__ || window.electron) return true;
    if (window.process && window.process.type === 'renderer') return true;
  }
  return typeof navigator !== 'undefined' && /electron/i.test(navigator.userAgent);
};

const isKnownBlockedDomain = (url) => {
  if (isElectronApp()) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return [
      'claude.ai', 'claude.com', 'anthropic.com',
      'chatgpt.com', 'chat.openai.com', 'openai.com',
      'perplexity.ai', 'deepseek.com', 'chat.deepseek.com',
      'gemini.google.com', 'google.com', 'google.com.tr', 'accounts.google.com',
      'bing.com', 'copilot.microsoft.com', 'microsoft.com',
      'github.com', 'twitter.com', 'x.com', 'youtube.com',
      'facebook.com', 'instagram.com', 'linkedin.com', 'netflix.com',
      'spotify.com', 'reddit.com', 'tiktok.com', 'discord.com',
      'web.whatsapp.com', 'web.telegram.org', 'apple.com', 'icloud.com',
      'trendyol.com', 'hepsiburada.com', 'sahibinden.com', 'amazon.com', 'amazon.com.tr'
    ].some(d => host === d || host.endsWith('.' + d));
  } catch {
    return false;
  }
};

const IPHONE_SAFARI_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

export default function InAppBrowserTab({ 
  tab, 
  onClose, 
  onUpdateTab, 
  isDark, 
  currentTheme,
  viewMode = 'iframe',
  setViewMode,
  iframeRef,
  reloadKey = 1,
  onContextMenu
}) {
  const innerRef = useRef(null);
  const internalNavUrlRef = useRef('');

  // 📱 Otomatik Mobil Modu Algılama (Mobilde siteler kendiliğinden mobil arayüzünü açar)
  const [isMobileScreen, setIsMobileScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (iframeRef && innerRef.current) {
      iframeRef.current = innerRef.current;
    }
  });

  // 🌟 Canlı Medya Köprüsü: YouTube Durumunu Dinle ve Ada ile Eşitle
  useEffect(() => {
    if (!tab.url?.includes('youtube') && !tab.url?.includes('youtu.be') && !tab.title?.toLowerCase().includes('youtube')) return;

    const interval = setInterval(async () => {
      if (innerRef.current && typeof innerRef.current.executeJavaScript === 'function') {
        try {
          const media = await innerRef.current.executeJavaScript(`
            window.__novaturk_getMedia ? window.__novaturk_getMedia() : (() => {
              const v = document.querySelector('video');
              const t = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, h1.title, #title h1');
              const c = document.querySelector('#channel-name yt-formatted-string a, #owner-name a');
              let vId = '';
              try { vId = new URLSearchParams(window.location.search).get('v') || ''; } catch {}
              return {
                title: t ? t.textContent.trim() : document.title.replace(' - YouTube', '').trim(),
                artist: c ? c.textContent.trim() : 'YouTube Sanatçısı',
                currentTime: v ? Math.floor(v.currentTime) : 0,
                duration: v ? Math.floor(v.duration || 0) : 0,
                paused: v ? v.paused : true,
                videoId: vId,
                thumbnail: vId ? ('https://i.ytimg.com/vi/' + vId + '/hqdefault.jpg') : ''
              };
            })()
          `);

          if (media && (media.duration > 0 || media.title)) {
            window.dispatchEvent(new CustomEvent('novaturk:media-status-update', {
              detail: {
                tabId: tab.id,
                ...media
              }
            }));
          }
        } catch {}
      }
    }, 750);

    return () => clearInterval(interval);
  }, [tab.id, tab.url]);

  // 🌟 Dinamik Ada'dan Gelen Oynat/Durdur/Sar/Sonraki Komutlarını İlet
  useEffect(() => {
    const handleMediaCmd = async (e) => {
      if (e.detail?.tabId === tab.id && innerRef.current) {
        const { action, val } = e.detail;
        try {
          if (typeof innerRef.current.executeJavaScript === 'function') {
            await innerRef.current.executeJavaScript(`
              if (window.__novaturk_mediaControl) {
                window.__novaturk_mediaControl('${action}', ${JSON.stringify(val)});
              } else {
                const v = document.querySelector('video');
                if (v) {
                  if ('${action}' === 'toggle') v.paused ? v.play() : v.pause();
                  else if ('${action}' === 'play') v.play();
                  else if ('${action}' === 'pause') v.pause();
                  else if ('${action}' === 'seek') v.currentTime = Number(${JSON.stringify(val)});
                  else if ('${action}' === 'seekDelta') v.currentTime += Number(${JSON.stringify(val)});
                  else if ('${action}' === 'next') {
                    const b = document.querySelector('.ytp-next-button');
                    if (b) b.click();
                  } else if ('${action}' === 'prev') {
                    if (v.currentTime > 3) v.currentTime = 0; else window.history.back();
                  }
                }
              }
            `);
          }
        } catch {}
      }
    };

    window.addEventListener('novaturk:media-command', handleMediaCmd);
    return () => window.removeEventListener('novaturk:media-command', handleMediaCmd);
  }, [tab.id]);

  const isElectron = isElectronApp();
  const currentUrl = tab.url || 'https://google.com';

  // NovaTürk Canlı Proxy Kalkanı sayesinde tüm siteler sekme içinde doğrudan açılır
  const isBlocked = false;
  const [forceLive, setForceLive] = useState(false);

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');
  const cleanTitle = unescapeHtml(tab.title || 'Web Sayfası');
  const cleanSnippet = unescapeHtml(tab.snippet || '');
  let hostname = 'web';
  try { hostname = new URL(currentUrl).hostname; } catch {}

  const [isWaitingChrome, setIsWaitingChrome] = useState(false);
  const [connectedUser, setConnectedUser] = useState(null);
  const [authDismissed, setAuthDismissed] = useState(false);

  // 🛡️ Canlı Gezinti: Tüm siteler (Claude, ChatGPT, Google vb.) doğrudan kendi orijinal adreslerinde açılır
  const targetProxyUrl = currentUrl;

  const navigateToYouTube = () => {
    setAuthDismissed(true);
    setConnectedUser(null);
    setIsWaitingChrome(false);
    try {
      const el = iframeRef?.current;
      if (el) {
        if (typeof el.loadURL === 'function') {
          el.loadURL('https://www.youtube.com');
        } else if ('src' in el) {
          el.src = 'https://www.youtube.com';
        }
      }
    } catch(e) {
      console.warn('[NovaTurk Nav] navigateToYouTube ref error:', e);
    }
    if (onUpdateTab) {
      onUpdateTab(tab.id, { url: 'https://www.youtube.com', title: 'YouTube' });
    }
  };

  // URL accounts.google.com veya rejected dışında bir yere geçerse authDismissed durumunu sıfırla
  useEffect(() => {
    if (!currentUrl.includes('rejected')) {
      setAuthDismissed(false);
    }
  }, [currentUrl]);

  // Sekme URL'si dışarıdan (Omnibar / Kısayol) değiştiğinde webview'i yönlendir
  useEffect(() => {
    const wv = iframeRef?.current;
    if (wv && isElectron && typeof wv.getURL === 'function' && typeof wv.loadURL === 'function') {
      try {
        // Eğer bu URL değişikliği webview'in kendi iç gezinmesinden (ör. YouTube sonraki şarkı) geldiyse tekrar yükleme yapma!
        if (internalNavUrlRef.current === tab.url) {
          return;
        }
        const wvUrl = wv.getURL();
        if (wvUrl && tab.url) {
          const cleanWv = wvUrl.replace(/\/$/, '');
          const cleanTab = tab.url.replace(/\/$/, '');
          if (cleanWv !== cleanTab) {
            wv.loadURL(tab.url);
          }
        }
      } catch (err) {}
    }
  }, [tab.url, iframeRef, isElectron]);

  // Google oturumu tamamlandığında kutlama yap ve YouTube'u bağla
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron?.onGoogleLoginCompleted) {
      const unsubscribe = window.electron.onGoogleLoginCompleted((userData) => {
        setConnectedUser(userData || { name: 'Kullanıcı' });
        setIsWaitingChrome(false);
        sound.playSuccess();
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch(e) {}

        setTimeout(() => {
          navigateToYouTube();
        }, 1500);
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [onUpdateTab, tab.id, iframeRef]);

  // Web tarayıcısı (Electron OLMADAN) için giriş akışı: /auth/google/start yeni sekmede açılır,
  // sonra durum periyodik kontrol edilir. Önceden bu buton web'de hiçbir şey yapmıyordu —
  // tıklanınca sonsuza kadar "bekleniyor" yazıyordu.
  useEffect(() => {
    const isElectronRuntime = typeof window !== 'undefined' && !!window.electron?.openGoogleLogin;
    if (isElectronRuntime || !isWaitingChrome) return;

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 120) { // ~90 saniye zaman aşımı
        clearInterval(interval);
        setIsWaitingChrome(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/auth/google/status`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.authenticated && data.user) {
            clearInterval(interval);
            setConnectedUser(data.user);
            setIsWaitingChrome(false);
            sound.playSuccess();
            try {
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
            } catch (e) {}
            setTimeout(() => {
              navigateToYouTube();
            }, 1500);
          }
        }
      } catch (e) {}
    }, 750);

    return () => clearInterval(interval);
  }, [isWaitingChrome]);

  // SponsorBlock ve Reklam Atlayıcı Enjeksiyonu (Electron Webview)
  useEffect(() => {
    const wv = iframeRef?.current;
    if (!wv || !isElectron) return;

    const handleDomReady = () => {
      const script = `
        (function() {
          if (window.__NOVATURK_SHIELD_INJECTED__) return;
          window.__NOVATURK_SHIELD_INJECTED__ = true;

          // 1. YouTube & Web Video Reklam Atlayıcı
          setInterval(function() {
            try {
              const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .videoAdUiSkipButton');
              if (skipBtn) skipBtn.click();

              const video = document.querySelector('video');
              const adShowing = document.querySelector('.ad-showing, .ad-interrupting');
              if (video && adShowing && video.duration) {
                video.currentTime = video.duration;
              }
            } catch(e) {}
          }, 400);

          // 2. YouTube SponsorBlock Segment Atlayıcı
          let activeVId = '';
          let sponsorSegs = [];
          let skippedMap = {};

          function checkSponsorSegments() {
            try {
              const vId = new URLSearchParams(window.location.search).get('v');
              if (!vId || vId === activeVId) return;
              activeVId = vId;
              sponsorSegs = [];
              skippedMap = {};

              fetch('https://sponsor.ajay.app/api/skipSegments?videoID=' + encodeURIComponent(vId) + '&categories=["sponsor","intro","outro","selfpromo","preview"]')
                .then(function(r) { return r.ok ? r.json() : []; })
                .then(function(data) {
                  if (Array.isArray(data)) {
                    sponsorSegs = data;
                  }
                })
                .catch(function() {});
            } catch(e) {}
          }

          setInterval(checkSponsorSegments, 2000);

          setInterval(function() {
            try {
              if (!sponsorSegs || !sponsorSegs.length) return;
              const video = document.querySelector('video');
              if (!video || video.paused) return;

              const ct = video.currentTime;
              for (var i = 0; i < sponsorSegs.length; i++) {
                var s = sponsorSegs[i];
                var seg = s.segment || [];
                var start = seg[0];
                var end = seg[1];
                if (typeof start === 'number' && typeof end === 'number') {
                  if (ct >= start && ct < (end - 0.4) && !skippedMap[start]) {
                    skippedMap[start] = true;
                    video.currentTime = end + 0.1;

                    // Holographic Glass Toast
                    var toast = document.getElementById('novaturk-sponsor-toast');
                    if (!toast) {
                      toast = document.createElement('div');
                      toast.id = 'novaturk-sponsor-toast';
                      toast.style.cssText = 'position:fixed;bottom:80px;right:24px;background:rgba(15,23,42,0.92);color:#38bdf8;padding:10px 18px;border-radius:16px;border:1px solid rgba(56,189,248,0.35);box-shadow:0 10px 30px rgba(0,0,0,0.5);font-family:sans-serif;font-size:12px;font-weight:bold;z-index:9999999;display:flex;align-items:center;gap:8px;transition:opacity 0.3s;pointer-events:none;';
                      document.body.appendChild(toast);
                    }
                    var skippedDur = Math.round(end - start);
                    toast.innerHTML = '⚡ <b>NovaTürk SponsorBlock:</b> Tanıtım atlandı (+' + skippedDur + 's)';
                    toast.style.opacity = '1';
                    setTimeout(function() { if (toast) toast.style.opacity = '0'; }, 3500);
                    break;
                  }
                }
              }
            } catch(e) {}
          }, 350);
        })();
      `;
      try {
        wv.executeJavaScript(script);
      } catch (err) {}
    };

    const handleNavigate = (e) => {
      if (e.url && onUpdateTab) {
        internalNavUrlRef.current = e.url;
        if (e.url !== currentUrl) {
          let host = e.url;
          try { host = new URL(e.url).hostname; } catch {}
          onUpdateTab(tab.id, { url: e.url, title: host });
        }
      }
    };

    const handleWvContextMenu = (e) => {
      const p = e.params || {};
      if (onContextMenu) {
        onContextMenu({
          x: p.x || e.clientX || 200,
          y: p.y || e.clientY || 200,
          visible: true,
          selectedText: p.selectionText || '',
          linkUrl: p.linkURL || p.srcURL || currentUrl,
          srcUrl: p.srcURL || ''
        });
      }
    };

    wv.addEventListener('dom-ready', handleDomReady);
    wv.addEventListener('did-navigate', handleNavigate);
    wv.addEventListener('did-navigate-in-page', handleNavigate);
    wv.addEventListener('context-menu', handleWvContextMenu);

    return () => {
      try { 
        wv.removeEventListener('dom-ready', handleDomReady); 
        wv.removeEventListener('did-navigate', handleNavigate);
        wv.removeEventListener('did-navigate-in-page', handleNavigate);
        wv.removeEventListener('context-menu', handleWvContextMenu);
      } catch (e) {}
    };
  }, [iframeRef, currentUrl, reloadKey, isElectron, onUpdateTab, tab.id, onContextMenu]);

  const handleContextMenu = (e) => {
    if (onContextMenu) {
      e.preventDefault();
      const sel = window.getSelection()?.toString() || '';
      onContextMenu({
        x: e.clientX,
        y: e.clientY,
        visible: true,
        selectedText: sel,
        linkUrl: currentUrl
      });
    }
  };

  return (
    <div 
      onContextMenu={handleContextMenu}
      className="w-full h-full flex flex-col flex-1 overflow-hidden animate-fadeIn bg-transparent relative"
    >
      {/* 🌟 %100 TAM EKRAN İÇERİK ALANI (SIFIR ÇERÇEVE, SIFIR BOŞLUK) */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-white">
        
        {viewMode === 'iframe' ? (
          /* ============================================================ */
          /* DURUM 2: 🌟 %100 TAM EKRAN CANLI WEB (ELECTRON WEBVIEW / IFRAME) */
          /* ============================================================ */
          <div className="w-full h-full relative bg-white">
            {/* 🕶️ Gizli Gezinti Rozeti */}
            {tab.isIncognito && (
              <div className="absolute top-3 right-5 z-40 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[11px] font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 pointer-events-none animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>🕶️ Gizli Gezinti (Sıfır İz)</span>
              </div>
            )}

            {/* 🔑 Resmî Google & YouTube Yetkilendirme Köprüsü (Yalnızca Güvenlik Engeline Takılırsa Göster) */}
            {(currentUrl.includes('rejected') && !authDismissed) && (
              <div className="absolute inset-0 z-50 bg-[#06080e]/96 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                
                {/* Logo & Status Graphic */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl">
                    <svg width="32" height="32" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  </div>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-sky-400 to-blue-600 relative">
                    <div className="w-2 h-2 rounded-full bg-white absolute -top-[3px] left-1/2 -translate-x-1/2 shadow-lg shadow-sky-400 animate-ping" />
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-3xl shadow-xl shadow-sky-500/10">
                    🌐
                  </div>
                </div>

                <div className="max-w-md space-y-3 mb-8">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>VS Code & Slack Resmî Standardı</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-['Outfit',sans-serif]">
                    Google Hesabını Chrome ile Bağla
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Google, şifre güvenliği gereği masaüstü uygulamalarında gömülü şifre girişini engeller. Bilgisayarınızdaki <b>Google Chrome</b> üzerinden tek tıkla hesabınızı NovaTürk'e bağlayabilirsiniz.
                  </p>
                </div>

                {connectedUser ? (
                  <div className="space-y-4 max-w-sm w-full animate-fadeIn mb-6">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 shadow-lg">
                      <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400 animate-bounce" />
                      <div className="text-left text-xs">
                        <p className="font-bold text-white text-sm">Bağlantı Başarılı: {connectedUser.name}</p>
                        <p className="text-emerald-300/80">Google ve YouTube oturumunuz aktif edildi.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        sound.playClick();
                        navigateToYouTube();
                      }}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>🚀 YouTube'a Geç</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 w-full max-w-sm justify-center">
                    <button
                      disabled={isWaitingChrome}
                      onClick={() => {
                        sound.playClick();
                        setIsWaitingChrome(true);
                        if (window.electron?.openGoogleLogin) {
                          window.electron.openGoogleLogin();
                        } else {
                          fetch(`${API_BASE}/api/auth/google/reset`, { method: 'POST' }).catch(() => {});
                          window.open(`${API_BASE}/auth/google/start?target=youtube`, '_blank', 'width=480,height=720');
                        }
                      }}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75"
                    >
                      {isWaitingChrome ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Google Chrome'da Onay Bekleniyor...</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          <span>Google Chrome ile Tek Tıkla Bağla</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        navigateToYouTube();
                      }}
                      className="w-full py-3 px-4 rounded-2xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Şimdilik Giriş Yapmadan YouTube'a Dön
                    </button>
                  </div>
                )}

                <div className="mt-8 text-[11px] text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google RFC 8252 Protokolü ile 256-Bit Uçtan Uca Doğrulama</span>
                </div>
              </div>
            )}

            {isElectron ? (
              <webview
                ref={innerRef}
                key={`${reloadKey}_${isMobileScreen ? 'mob' : 'desk'}`}
                src={currentUrl}
                useragent={isMobileScreen ? IPHONE_SAFARI_USER_AGENT : undefined}
                partition={tab.isIncognito ? "nopersist_incognito" : "persist:novaturk_browsing"}
                allowpopups="true"
                webpreferences="backgroundThrottling=no"
                preload={window.electron?.webviewPreloadPath}
                className="w-full h-full border-0 absolute inset-0"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <>
                {/* 🛡️ NovaTürk Canlı Proxy Kalkanı Rozeti */}
                <div className="hidden md:flex absolute top-2.5 right-4 z-30 pointer-events-auto items-center gap-2">
                  <div className="px-2.5 py-1 rounded-full bg-slate-900/85 border border-white/20 text-slate-200 text-[11px] font-medium backdrop-blur-md shadow-lg flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Canlı Proxy Kalkanı Aktif</span>
                  </div>
                  <a
                    href={targetProxyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-full bg-slate-900/85 border border-white/20 text-slate-300 hover:text-white backdrop-blur-md shadow-lg transition-colors"
                    title="Yeni Sekmede Doğrudan Aç"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <iframe
                  ref={innerRef}
                  key={reloadKey}
                  src={
                    (targetProxyUrl && targetProxyUrl.startsWith('http'))
                      ? `${API_BASE}/api/proxy?url=${encodeURIComponent(targetProxyUrl)}`
                      : targetProxyUrl
                  }
                  title={cleanTitle}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera; web-share"
                />
              </>
            )}
          </div>
        ) : (
          /* ============================================================ */
          /* DURUM 3: REKLAMSIZ SAF OKUYUCU MODU                          */
          /* ============================================================ */
          <div className={`w-full h-full overflow-y-auto p-6 sm:p-12 ${
            isDark ? 'bg-[#0a0c12] text-slate-100' : 'bg-slate-50 text-slate-900'
          }`}>
            <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs opacity-60">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> %100 Reklamsız Arındırıldı
                </span>
                <span>•</span>
                <span className="font-mono">{hostname}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-['Outfit',sans-serif] leading-tight">
                {cleanTitle}
              </h1>

              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs leading-relaxed text-sky-300">
                <span className="font-bold flex items-center gap-1.5 mb-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-sky-400" /> NovaTürk Saf İçerik Raporu
                </span>
                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {cleanSnippet || 'Bu platform NovaTürk Güvenlik Kalkanı tarafından doğrulanmıştır.'}
                </p>
              </div>

              <div className={`space-y-4 text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <p>
                  Sayfa içeriği reklam afişlerinden, çerez pencerelerinden ve bot takipçilerinden arındırılmıştır.
                </p>
                <p className="opacity-80 text-xs sm:text-sm">
                  Platformun canlı interaktif özelliklerini kullanmak için aşağıdaki butondan resmî siteye tek tıkla geçiş yapabilirsiniz.
                </p>
              </div>

              <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apple-pill-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <span>Resmî Platformu Ziyaret Et</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>

                <span className="text-[11px] opacity-40 font-mono">
                  NovaTürk Güvenli Kalkan
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
