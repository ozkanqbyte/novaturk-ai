@echo off
chcp 65001 >nul
title NovaTürk AI - Türkiye Milli Yapay Zeka Motoru & Masaüstü Uygulaması
color 0b
cls

echo =====================================================================
echo             NOVATÜRK AI - TÜRKİYE MİLLİ YAPAY ZEKA MOTORU
echo =====================================================================

:: Arka planda takılı kalmış eski kilitli Electron kopyalarını temizle
taskkill /f /im electron.exe >nul 2>&1

set "WORK_DIR=C:\ai_calculator_pro"
if not exist "%WORK_DIR%" set "WORK_DIR=%~dp0NovaTurk_AI"

cd /d "%WORK_DIR%"

echo [1/3] SQLite Veritabanı ve Backend API Sunucusu Kontrol Ediliyor...
netstat -ano | findstr :3001 >nul
if %errorlevel% neq 0 (
    start "NovaTurk Backend API (Port 3001)" /min cmd /c "cd /d %WORK_DIR% && node server/index.js"
    timeout /t 1 /nobreak >nul
)

echo [2/3] Apple VisionOS Frontend Sunucusu Kontrol Ediliyor...
netstat -ano | findstr :3000 >nul
if %errorlevel% neq 0 (
    start "NovaTurk Frontend UI (Port 3000)" /min cmd /c "cd /d %WORK_DIR% && npm run dev"
    timeout /t 2 /nobreak >nul
)

echo [3/3] NovaTürk AI Masaüstü PC Penceresi Başlatılıyor...
if exist "%WORK_DIR%\node_modules\electron\dist\electron.exe" (
    start "" "%WORK_DIR%\node_modules\electron\dist\electron.exe" .
) else (
    start "" npm run electron
)

echo =====================================================================
echo  ✅ BAŞARIYLA BAŞLATILDI!
echo  💻 Masaüstü Uygulaması: Açıldı!
echo  🌐 Web Tarayıcı Erişimi: http://localhost:3000
echo  📊 Yerel Backend & DB:   http://localhost:3001
echo =====================================================================
timeout /t 3 /nobreak >nul
exit
