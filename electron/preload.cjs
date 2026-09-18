// NovaTürk PC Masaüstü Preload Script
const { ipcRenderer } = require('electron');
const path = require('path');

try {
  window.__IS_ELECTRON__ = true;
  window.electron = {
    isElectron: true,
    ipcRenderer: ipcRenderer,
    webviewPreloadPath: path.join(__dirname, 'webview-preload.cjs'),
    openGoogleLogin: (url) => ipcRenderer.send('open-google-login', url),
    onGoogleLoginCompleted: (cb) => {
      const handler = (_event, data) => cb(data);
      ipcRenderer.on('google-login-completed', handler);
      return () => ipcRenderer.removeListener('google-login-completed', handler);
    },
    openExternal: (url) => ipcRenderer.send('open-external-url', url),
    sendVpnProxy: (data) => ipcRenderer.send('set-vpn-proxy', data),
    onVpnApplied: (cb) => ipcRenderer.on('vpn-applied', (e, data) => cb(data)),
    onSearchText: (cb) => ipcRenderer.on('search-text', (e, text) => cb(text)),
    onOpenLinkTab: (cb) => ipcRenderer.on('open-link-tab', (e, url) => cb(url)),
    onGoBack: (cb) => ipcRenderer.on('browser-go-back', () => cb()),
    onGoForward: (cb) => ipcRenderer.on('browser-go-forward', () => cb()),
    openDevTools: () => ipcRenderer.send('open-dev-tools'),
    inspectElement: (x, y) => ipcRenderer.send('inspect-element', { x, y })
  };
} catch (err) {
  console.error('[Preload] Hata:', err);
}
