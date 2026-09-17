@echo off
title NovaTurk AI - Turkiye Milli Yapay Zeka Arama Motoru
color 0b
cls

echo =====================================================================
echo             NOVATURK AI - TURKIYE MILLI YAPAY ZEKA MOTORU
echo =====================================================================
echo [1/3] SQLite Veritabani ve Backend API Sunucusu Baslatiliyor...
start "NovaTurk Backend API (Port 3001)" cmd /k "node server/index.js"

echo [2/3] Apple VisionOS Arayuz Sunucusu Baslatiliyor...
start "NovaTurk Frontend UI (Port 3000)" cmd /k "npm run dev"

echo [3/3] Tarayici Aciliyor...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo =====================================================================
echo  BASARIYLA BASLATILDI!
echo  Arayuz:   http://localhost:3000
echo  API & DB: http://localhost:3001
echo =====================================================================
echo Pencereleri kapatmak icin bu konsolu kapatabilirsiniz.
pause
