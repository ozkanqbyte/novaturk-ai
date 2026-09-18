const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 512,
    height: 512,
    show: false,
    webPreferences: {
      offscreen: true
    }
  });

  const svgPath = path.join(__dirname, '../public/icon.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <style>
        body, html { margin: 0; padding: 0; width: 512px; height: 512px; overflow: hidden; background: transparent; }
        svg { width: 100%; height: 100%; }
      </style>
    </head>
    <body>${svgContent}</body>
  </html>`;

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  // Wait slightly for SVG render
  await new Promise(r => setTimeout(r, 600));

  const image = await win.capturePage({ x: 0, y: 0, width: 512, height: 512 });
  const png512 = image.toPNG();
  fs.writeFileSync(path.join(__dirname, '../public/icon-512.png'), png512);

  const image192 = image.resize({ width: 192, height: 192, quality: 'best' });
  fs.writeFileSync(path.join(__dirname, '../public/icon-192.png'), image192.toPNG());

  console.log('✅ Icons generated successfully: icon-512.png and icon-192.png');
  app.quit();
});
