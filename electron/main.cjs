const { app, BrowserWindow, globalShortcut, ipcMain, shell, session, Menu, MenuItem, clipboard, webContents } = require('electron');
const path = require('path');
const { fork } = require('child_process');

const fs = require('fs');
fs.writeFileSync(path.join(__dirname, 'debug_start.log'), `Started at ${new Date().toISOString()}\n`);

process.on('uncaughtException', (err) => {
  try { fs.appendFileSync(path.join(__dirname, 'debug_start.log'), `uncaughtException: ${err.stack || err}\n`); } catch(e) {}
});
process.on('unhandledRejection', (reason) => {
  try { fs.appendFileSync(path.join(__dirname, 'debug_start.log'), `unhandledRejection: ${reason}\n`); } catch(e) {}
});

let mainWindow = null;
let serverProcess = null;

// 🌟 TEK ÖRNEK KİLİDİ (SINGLE INSTANCE LOCK)
// İki pencerenin aynı anda açılıp GPU önbelleğini kilitlemesini (Siyah Ekran Hatasını) %100 önler!
const gotTheLock = app.requestSingleInstanceLock();
fs.appendFileSync(path.join(__dirname, 'debug_start.log'), `gotTheLock: ${gotTheLock}\n`);
if (!gotTheLock) {
  fs.appendFileSync(path.join(__dirname, 'debug_start.log'), `Quitting due to single instance lock!\n`);
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.setAlwaysOnTop(true);
      mainWindow.focus();
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.setAlwaysOnTop(false);
      }, 500);
    } else {
      createWindow();
    }
  });
}


// Standart Modern Orijinal Google Chrome User-Agent
const CHROME_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

// Google ve sitelerin Electron / Robot / Otomasyon tespitini tamamen devre dışı bırak & GPU Hızlandırma
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-gpu-process-crash-limit');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

function startBackendServer() {
  const serverPath = path.join(__dirname, '../server/index.js');
  fetch('http://localhost:3001/api/status', { signal: AbortSignal.timeout(800) })
    .then(() => {
      console.log('[NovaTurk PC] Backend sunucusu zaten 3001 portunda çalışıyor.');
    })
    .catch(() => {
      try {
        serverProcess = fork(serverPath, [], {
          env: { ...process.env, PORT: '3001' },
          stdio: 'inherit'
        });
        console.log('[NovaTurk PC] Yerel backend sunucusu (Port 3001) otomatik başlatıldı.');
      } catch (err) {
        console.error('[NovaTurk PC] Sunucu başlatma hatası:', err);
      }
    });
}

function applySessionStealthHooks(sess) {
  if (!sess || sess.__stealthApplied) return;
  sess.__stealthApplied = true;

  sess.webRequest.onBeforeSendHeaders((details, callback) => {
    const requestHeaders = { ...details.requestHeaders };

    // Google Hesap girişi sırasında Firefox User-Agent kullan ve Sec-CH-UA başlıklarını temizle
    if (details.url.includes('accounts.google.com') || details.url.includes('google.com/signin')) {
      requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0';
      delete requestHeaders['Sec-CH-UA'];
      delete requestHeaders['sec-ch-ua'];
      delete requestHeaders['Sec-CH-UA-Mobile'];
      delete requestHeaders['sec-ch-ua-mobile'];
      delete requestHeaders['Sec-CH-UA-Platform'];
      delete requestHeaders['sec-ch-ua-platform'];
      delete requestHeaders['Sec-CH-UA-Full-Version-List'];
      delete requestHeaders['sec-ch-ua-full-version-list'];
    }

    callback({ cancel: false, requestHeaders });
  });

  sess.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['X-Frame-Options'];
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['Content-Security-Policy'];
    callback({ cancel: false, responseHeaders });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 880,
    minWidth: 980,
    minHeight: 650,
    title: 'NovaTürk AI - Yeni Nesil Milli Arama Motoru & Tarayıcı',
    backgroundColor: '#07090e',
    show: true,
    autoHideMenuBar: true,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  mainWindow.webContents.setUserAgent(CHROME_USER_AGENT);

  const devUrl = 'http://localhost:3000';
  const prodPath = path.join(__dirname, '../dist/index.html');

  fetch(devUrl, { method: 'HEAD', signal: AbortSignal.timeout(1200) })
    .then(() => {
      console.log('[NovaTurk PC] Dev sunucu aktif, localhost:3000 yükleniyor...');
      mainWindow.loadURL(devUrl);
    })
    .catch(() => {
      console.log('[NovaTurk PC] Yerel dist/index.html anında açılıyor...');
      mainWindow.loadFile(prodPath);
    });

  mainWindow.show();
  mainWindow.focus();
  mainWindow.setAlwaysOnTop(true);
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(false);
    }
  }, 600);

  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = new Menu();

    menu.append(new MenuItem({
      label: 'Geri',
      accelerator: 'Alt+Left',
      click: () => mainWindow.webContents.send('browser-go-back')
    }));

    menu.append(new MenuItem({
      label: 'İleri',
      accelerator: 'Alt+Right',
      click: () => mainWindow.webContents.send('browser-go-forward')
    }));

    menu.append(new MenuItem({
      label: 'Yenile',
      accelerator: 'CmdOrCtrl+R',
      click: () => mainWindow.webContents.reload()
    }));

    menu.append(new MenuItem({ type: 'separator' }));

    if (params.editFlags.canCut) {
      menu.append(new MenuItem({ label: 'Kes', role: 'cut', accelerator: 'CmdOrCtrl+X' }));
    }
    if (params.editFlags.canCopy || params.selectionText) {
      menu.append(new MenuItem({ label: 'Kopyala', role: 'copy', accelerator: 'CmdOrCtrl+C' }));
    }
    if (params.editFlags.canPaste) {
      menu.append(new MenuItem({ label: 'Yapıştır', role: 'paste', accelerator: 'CmdOrCtrl+V' }));
    }
    if (params.editFlags.canSelectAll) {
      menu.append(new MenuItem({ label: 'Tümünü Seç', role: 'selectAll', accelerator: 'CmdOrCtrl+A' }));
    }

    if (params.selectionText && params.selectionText.trim()) {
      menu.append(new MenuItem({ type: 'separator' }));
      const cleanSnippet = params.selectionText.trim().substring(0, 25);
      menu.append(new MenuItem({
        label: `NovaTürk ile Ara: "${cleanSnippet}..."`,
        click: () => mainWindow.webContents.send('search-text', params.selectionText.trim())
      }));
    }

    if (params.linkURL) {
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({
        label: 'Bağlantıyı Yeni Sekmede Aç',
        click: () => mainWindow.webContents.send('open-link-tab', params.linkURL)
      }));
      menu.append(new MenuItem({
        label: 'Bağlantı Adresini Kopyala',
        click: () => clipboard.writeText(params.linkURL)
      }));
    }

    menu.popup();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}


app.whenReady().then(() => {
  if (session && session.defaultSession) {
    applySessionStealthHooks(session.defaultSession);
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => callback(true));
    session.defaultSession.setPermissionCheckHandler(() => true);

    const BLOCKED_DOMAINS = [
      'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
      'pagead2.googlesyndication.com', 'googleads.g.doubleclick.net',
      'criteo.com', 'taboola.com', 'outbrain.com',
      'scorecardresearch.com', 'adnxs.com', 'adform.net',
      'analytics.twitter.com', 'popads.net', 'popcash.net',
      'adcash.com', 'smartadserver.com', 'revcontent.com', 'coin-hive.com',
      'coinhive.com', 'minr.pw'
    ];

    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      const url = details.url.toLowerCase();
      if (url.includes('youtube.com') || url.includes('googlevideo.com') || url.includes('ytimg.com') || url.includes('accounts.google') || url.includes('myaccount.google') || url.includes('oauth')) {
        return callback({ cancel: false });
      }
      const isAdOrTracker = BLOCKED_DOMAINS.some(domain => url.includes(domain));
      if (isAdOrTracker) {
        return callback({ cancel: true });
      }
      callback({ cancel: false });
    });
  }

  const persistSession = session.fromPartition('persist:novaturk_browsing');
  if (persistSession) {
    applySessionStealthHooks(persistSession);
    persistSession.setPermissionRequestHandler((webContents, permission, callback) => callback(true));
    persistSession.setPermissionCheckHandler(() => true);
  }

  startBackendServer();
  createWindow();

  let activeVpnRule = '';

  let authPollInterval = null;

  // 🔑 RESMÎ GOOGLE OAUTH DOĞRULAMA KÖPRÜSÜ (VS CODE & SLACK STANDARTI)
  // Google Chrome ile tek tıkla doğrular, oturumu sıfır hatayla NovaTürk'e aktarır!
  ipcMain.on('open-google-login', async () => {
    console.log('[NovaTurk OAuth Bridge] Resmî Google Doğrulama Köprüsü başlatılıyor...');
    
    // 1. Önceki oturumu sıfırla
    try {
      await fetch('http://localhost:3001/api/auth/google/reset', { method: 'POST' });
    } catch (e) {}

    // 2. Kullanıcının bilgisayarındaki gerçek Google Chrome tarayıcısını aç
    const bridgeUrl = 'http://localhost:3001/auth/google/start?target=youtube';
    shell.openExternal(bridgeUrl);

    // 3. Kullanıcı Chrome'da "Onayla" dediğinde otomatik yakala (Polling)
    if (authPollInterval) clearInterval(authPollInterval);

    let attempts = 0;
    authPollInterval = setInterval(async () => {
      attempts++;
      if (attempts > 120) { // 2 dakika zaman aşımı
        clearInterval(authPollInterval);
        authPollInterval = null;
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/api/auth/google/status', { signal: AbortSignal.timeout(600) });
        if (res.ok) {
          const data = await res.json();
          if (data && data.authenticated && data.user) {
            console.log('[NovaTurk OAuth Bridge] Oturum doğrulandı, NovaTürk\'e aktarılıyor:', data.user);
            clearInterval(authPollInterval);
            authPollInterval = null;

            // Oturum başarıyla onaylandı

            // NovaTürk penceresini ekrana öne getir
            if (mainWindow && !mainWindow.isDestroyed()) {
              if (mainWindow.isMinimized()) mainWindow.restore();
              mainWindow.show();
              mainWindow.setAlwaysOnTop(true);
              mainWindow.focus();
              mainWindow.setAlwaysOnTop(false);

              // Arayüze oturum açıldı bilgisini ilet
              mainWindow.webContents.send('google-login-completed', data.user);
            }
          }
        }
      } catch (err) {}
    }, 750);
  });

  // 🌟 Harici Tarayıcıda Açma IPC Handler (VS Code / Slack / Discord Standartı)
  ipcMain.on('open-external-url', (event, url) => {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      console.log('[NovaTurk External] Sistem tarayıcısında açılıyor:', url);
      shell.openExternal(url);
    }
  });

  app.on('web-contents-created', (event, contents) => {
    contents.setUserAgent(CHROME_USER_AGENT);

    if (contents.session) {
      applySessionStealthHooks(contents.session);
    }

    // Popupları ve Google Giriş pencerelerini doğrudan NovaTürk içinde aç
    contents.setWindowOpenHandler(({ url }) => {
      console.log('[NovaTurk Nav] Pencere isteği:', url);
      return { action: 'allow' };
    });

    if (activeVpnRule && contents.session) {
      contents.session.setProxy({
        proxyRules: activeVpnRule,
        proxyBypassRules: '<local>;localhost;127.0.0.1;3000;3001'
      }).catch(() => {});
    }

    contents.on('context-menu', (e, params) => {
      const menu = new Menu();

      menu.append(new MenuItem({
        label: 'Geri',
        accelerator: 'Alt+Left',
        enabled: contents.canGoBack(),
        click: () => contents.goBack()
      }));

      menu.append(new MenuItem({
        label: 'İleri',
        accelerator: 'Alt+Right',
        enabled: contents.canGoForward(),
        click: () => contents.goForward()
      }));

      menu.append(new MenuItem({
        label: 'Yenile',
        accelerator: 'CmdOrCtrl+R',
        click: () => contents.reload()
      }));

      menu.append(new MenuItem({ type: 'separator' }));

      if (params.editFlags.canCut) {
        menu.append(new MenuItem({ label: 'Kes', role: 'cut', accelerator: 'CmdOrCtrl+X' }));
      }
      if (params.editFlags.canCopy || params.selectionText) {
        menu.append(new MenuItem({ label: 'Kopyala', role: 'copy', accelerator: 'CmdOrCtrl+C' }));
      }
      if (params.editFlags.canPaste) {
        menu.append(new MenuItem({ label: 'Yapıştır', role: 'paste', accelerator: 'CmdOrCtrl+V' }));
      }
      if (params.editFlags.canSelectAll) {
        menu.append(new MenuItem({ label: 'Tümünü Seç', role: 'selectAll', accelerator: 'CmdOrCtrl+A' }));
      }

      if (params.selectionText && params.selectionText.trim()) {
        menu.append(new MenuItem({ type: 'separator' }));
        const cleanSnippet = params.selectionText.trim().substring(0, 25);
        menu.append(new MenuItem({
          label: `NovaTürk ile Ara: "${cleanSnippet}..."`,
          click: () => {
            if (mainWindow) mainWindow.webContents.send('search-text', params.selectionText.trim());
          }
        }));
      }

      if (params.linkURL) {
        menu.append(new MenuItem({ type: 'separator' }));
        menu.append(new MenuItem({
          label: 'Bağlantıyı Yeni Sekmede Aç',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('open-link-tab', params.linkURL);
          }
        }));
        menu.append(new MenuItem({
          label: 'Bağlantı Adresini Kopyala',
          click: () => clipboard.writeText(params.linkURL)
        }));
      }

      if (params.srcURL && params.mediaType === 'image') {
        menu.append(new MenuItem({ type: 'separator' }));
        menu.append(new MenuItem({
          label: 'Resim Adresini Kopyala',
          click: () => clipboard.writeText(params.srcURL)
        }));
        menu.append(new MenuItem({
          label: 'Resmi Yeni Sekmede Aç',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('open-link-tab', params.srcURL);
          }
        }));
      }

      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({
        label: 'İncele (Geliştirici Araçları)',
        accelerator: 'F12',
        click: () => {
          if (typeof contents.inspectElement === 'function' && typeof params.x === 'number') {
            contents.inspectElement(params.x, params.y);
          } else {
            contents.openDevTools({ mode: 'detach' });
          }
        }
      }));

      menu.popup();
    });
  });

  ipcMain.on('set-vpn-proxy', async (event, { enabled, proxyRules }) => {
    activeVpnRule = (enabled && proxyRules && proxyRules !== 'direct') ? proxyRules : '';
    console.log('[NovaTurk VPN] Yeni VPN Proxy Kuralı:', activeVpnRule || 'DOĞRUDAN BAĞLANTI (DIRECT)');

    const sessions = new Set();
    if (session && session.defaultSession) sessions.add(session.defaultSession);
    try {
      webContents.getAllWebContents().forEach(wc => {
        if (wc && wc.session) sessions.add(wc.session);
      });
    } catch (e) {}

    const proxyConfig = activeVpnRule ? {
      proxyRules: activeVpnRule,
      proxyBypassRules: '<local>;localhost;127.0.0.1;3000;3001'
    } : {
      mode: 'direct'
    };

    for (const s of sessions) {
      try {
        await s.setProxy(proxyConfig);
        try {
          await s.closeAllConnections();
          await s.clearHostResolverCache();
        } catch (e) {}
      } catch (err) {
        console.error('[NovaTurk VPN] Oturum proxy uygulama hatası:', err.message);
      }
    }

    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('vpn-applied', { enabled: !!activeVpnRule, proxyRules: activeVpnRule });
    }
  });

  try {
    globalShortcut.register('Alt+Space', () => {
      if (mainWindow) {
        if (mainWindow.isVisible() && mainWindow.isFocused()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  } catch (err) {}

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
