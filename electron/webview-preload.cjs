// NovaTürk AI - Webview Anti-Detection & Google Chrome Emulation Preload
(function() {
  try {
    // 1. Google Bot / Automation Kontrolünü (navigator.webdriver) Yok Et
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
      configurable: true
    });
    try { delete navigator.__proto__.webdriver; } catch(e) {}

    // 2. Orijinal Google Chrome Nesnesini (window.chrome) Simüle Et
    if (!window.chrome || Object.keys(window.chrome).length === 0) {
      window.chrome = {
        runtime: {
          OnInstalledReason: { INSTALL: 'install', UPDATE: 'update', CHROME_UPDATE: 'chrome_update', SHARED_MODULE_UPDATE: 'shared_module_update' },
          OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' },
          PlatformArch: { ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
          PlatformNaclArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
          PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
          RequestUpdateCheckStatus: { THROTTLED: 'throttled', NO_UPDATE: 'no_update', UPDATE_AVAILABLE: 'update_available' }
        },
        app: {
          isInstalled: false,
          InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
          RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' }
        },
        loadTimes: function() {
          return {
            commitLoadTime: Date.now() / 1000 - 0.2,
            connectionInfo: 'h2',
            finishDocumentLoadTime: Date.now() / 1000 - 0.1,
            finishLoadTime: Date.now() / 1000,
            firstPaintAfterLoadTime: 0,
            firstPaintTime: Date.now() / 1000 - 0.15,
            navigationType: 'Other',
            npnNegotiatedProtocol: 'h2',
            requestTime: Date.now() / 1000 - 0.3,
            startLoadTime: Date.now() / 1000 - 0.25,
            wasAlternateProtocolAvailable: false,
            wasFetchedViaSpdy: true,
            wasNpnNegotiated: true
          };
        },
        csi: function() {
          return {
            startE: Date.now(),
            onloadT: Date.now(),
            pageT: 120.4,
            tran: 15
          };
        }
      };
    }

    // 3. Masaüstü Chrome Eklenti Listesi Simülasyonu
    if (!navigator.plugins || navigator.plugins.length === 0) {
      const mockPlugins = [
        { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Microsoft Edge PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'WebKit built-in PDF', filename: 'internal-pdf-viewer', description: 'Portable Document Format' }
      ];
      Object.defineProperty(navigator, 'plugins', {
        get: () => mockPlugins
      });
    }

    // 4. Diller ve Donanım Uyumluluğu
    if (!navigator.languages || navigator.languages.length === 0) {
      Object.defineProperty(navigator, 'languages', {
        get: () => ['tr-TR', 'tr', 'en-US', 'en']
      });
    }

    // 🌟 5. YouTube Kesintisiz Şarkı Geçişi & Canlı Medya Köprüsü (Auto-Next & Media Bridge)
    const setupYouTubeAutoNext = () => {
      if (!window.location.hostname.includes('youtube.com')) return;
      const video = document.querySelector('video');
      if (video && !video.__novaturk_setup) {
        video.__novaturk_setup = true;
        
        // Şarkı/video bittiğinde otomatik sonraki parçaya geçiş (başa sarmayı ve sayfa yenilemeyi %100 önler)
        video.addEventListener('ended', () => {
          if (video.__novaturk_ended_handled) return;
          video.__novaturk_ended_handled = true;
          setTimeout(() => { video.__novaturk_ended_handled = false; }, 6000);

          console.log('[NovaTurk Media] Şarkı bitti, sonraki parçaya akıcı geçiş denetleniyor...');
          // YouTube'un kendi geçiş yapması için 2 saniye bekle, eğer hala bitişte kaldıysa tıkla
          setTimeout(() => {
            const v = document.querySelector('video');
            if (v && (v.ended || (v.currentTime < 1 && v.paused))) {
              const nextBtn = document.querySelector('.ytp-next-button');
              if (nextBtn) {
                nextBtn.click();
              } else {
                const nextThumb = document.querySelector('ytd-compact-video-renderer a#thumbnail, ytd-playlist-panel-video-renderer a#thumbnail');
                if (nextThumb) nextThumb.click();
              }
            }
          }, 2000);
        });

        // Autoplay toggle kapalıysa otomatik aç (kesintisiz akış için)
        try {
          const autonav = document.querySelector('.ytp-autonav-toggle-button[aria-checked="false"]');
          if (autonav) autonav.click();
        } catch {}
      }
    };

    if (window.location.hostname.includes('youtube.com')) {
      setInterval(setupYouTubeAutoNext, 1200);
    }

    // Üst pencere (NovaTürk) için medya okuma ve kontrol köprüsü
    window.__novaturk_getMedia = function() {
      const v = document.querySelector('video');
      const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, h1.title yt-formatted-string, #title h1');
      const channelEl = document.querySelector('#channel-name yt-formatted-string a, #owner-name a, ytd-channel-name a');
      const nextBtn = document.querySelector('.ytp-next-button');
      
      let videoId = '';
      try {
        const urlParams = new URLSearchParams(window.location.search);
        videoId = urlParams.get('v') || '';
      } catch {}

      return {
        title: titleEl ? titleEl.textContent.trim() : (document.title.replace(' - YouTube', '').trim()),
        artist: channelEl ? channelEl.textContent.trim() : 'YouTube Müzik',
        currentTime: v ? Math.floor(v.currentTime) : 0,
        duration: v ? Math.floor(v.duration || 0) : 0,
        paused: v ? v.paused : true,
        volume: v ? v.volume : 1,
        videoId: videoId,
        thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '',
        hasNext: !!nextBtn
      };
    };

    window.__novaturk_mediaControl = function(action, val) {
      const v = document.querySelector('video');
      if (!v && action !== 'next') return false;

      if (action === 'toggle') {
        if (v) v.paused ? v.play() : v.pause();
      } else if (action === 'play') {
        if (v) v.play();
      } else if (action === 'pause') {
        if (v) v.pause();
      } else if (action === 'seek') {
        if (v) v.currentTime = Number(val);
      } else if (action === 'seekDelta') {
        if (v) v.currentTime = Math.max(0, Math.min(v.duration || 99999, v.currentTime + Number(val)));
      } else if (action === 'next') {
        const b = document.querySelector('.ytp-next-button');
        if (b) {
          b.click();
        } else {
          const t = document.querySelector('ytd-compact-video-renderer a#thumbnail, ytd-playlist-panel-video-renderer a#thumbnail');
          if (t) t.click();
        }
      } else if (action === 'prev') {
        if (v) {
          if (v.currentTime > 3) {
            v.currentTime = 0;
          } else {
            window.history.back();
          }
        }
      }
      return true;
    };

  } catch (err) {
    // Sessiz hata yakalama
  }
})();
