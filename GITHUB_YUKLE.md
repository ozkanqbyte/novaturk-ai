# 🚀 GitHub'a Yükleme Rehberi

## 📋 ÇOK BASIT - 3 ADIM

### 1️⃣ GitHub'da Repo Oluştur
1. [GitHub.com](https://github.com) → Giriş yap
2. Sağ üstte **"+"** → **"New repository"**
3. Repository name: **`ai-calculator-pro`**
4. **Public** seç (GitHub Pages için)
5. **"Create repository"** tıkla

### 2️⃣ Projeyi GitHub'a Yükle
PowerShell'de şu komutları çalıştır:

```powershell
# Proje klasörüne git
Set-Location "c:\ai_calculator_pro"

# Git başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit - AiPremium Hesap Makinesi v2.1.0"

# GitHub'ı ekle - SİZİN URL'NİZ:
git remote add origin https://github.com/ozkanqbyte/ai-calculator-pro.git

# Ana branch'i main yap
git branch -M main

# GitHub'a yükle
git push -u origin main
```

> **✅ URL Hazır:** Artık `GITHUB_KULLANICI_ADIN` yerine **doğrudan `ozkanqbyte`** kullanılıyor!

### 3️⃣ GitHub Pages Aktif Et (Privacy & Terms için)

1. GitHub repo'na git
2. **"Settings"** → **"Pages"**
3. **Source:** `main` branch seç
4. **Folder:** `/ (root)` seç
5. **"Save"** tıkla
6. 1-2 dakika bekle

✅ Artık bu linkler çalışıyor:
- Privacy: `https://ozkanqbyte.github.io/ai-calculator-pro/privacy_policy.html`
- Terms: `https://ozkanqbyte.github.io/ai-calculator-pro/terms_of_service.html`

---

## 🔄 Değişiklikleri GitHub'a Yükleme

Her değişiklikten sonra:

```powershell
# Değişiklikleri ekle
git add .

# Commit yap
git commit -m "Açıklama yazısı"

# GitHub'a yükle
git push
```

---

## 📱 Uygulamada URL'leri Güncelle

`lib\core\constants\app_constants.dart` dosyasında bu satırlar **ZATEN HAZIR** ve güncel:

```dart
static const String githubUrl = 'https://github.com/ozkanqbyte/ai-calculator-pro';
static const String privacyUrl = 'https://ozkanqbyte.github.io/ai-calculator-pro/privacy_policy.html';
static const String termsUrl = 'https://ozkanqbyte.github.io/ai-calculator-pro/terms_of_service.html';
```

**✅ Hiçbir şey değiştirmenize gerek yok - URL'ler doğru!**

---

## ✅ SONUÇ

✔️ Kod GitHub'da  
✔️ Privacy & Terms web'de  
✔️ Uygulama içinde GitHub linki var  
✔️ Google Play Store'a yükleyebilirsin!

---

## 🆘 Sorun mu var?

### Git yüklü değil?
[Git'i buradan indir](https://git-scm.com/download/win)

### Authentication hatası?
```powershell
# GitHub Personal Access Token kullan
# Settings → Developer settings → Personal access tokens → Generate new token
# Token'ı şifre yerine kullan
```

### Push hatası?
```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

**Made with ❤️ by Özkan Akçay | QByte Development**

© 2025 Özkan Akçay