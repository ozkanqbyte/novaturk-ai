@echo off
chcp 65001 >nul
title NovaTürk AI - Masaüstü PC Uygulaması
cls

echo =====================================================================
echo           NOVATÜRK AI - MASAÜSTÜ PC UYGULAMASI BAŞLATILIYOR
echo =====================================================================

:: Arka planda takılı kalmış eski kilitli Electron kopyalarını temizle
taskkill /f /im electron.exe >nul 2>&1

set "WORK_DIR=C:\ai_calculator_pro"
if not exist "%WORK_DIR%" set "WORK_DIR=%~dp0NovaTurk_AI"

cd /d "%WORK_DIR%"

:: Backend kapalıysa sessizce başlat
netstat -ano | findstr :3001 >nul
if %errorlevel% neq 0 (
    start "NovaTurk Backend" /min cmd /c "cd /d %WORK_DIR% && node server/index.js"
)

:: Masaüstü uygulamasını doğrudan aç
if exist "%WORK_DIR%\node_modules\electron\dist\electron.exe" (
    start "" "%WORK_DIR%\node_modules\electron\dist\electron.exe" .
) else (
    start "" npm run electron
)

exit
