# 📺 AdMob Test Rehberi

## ✅ PRODUCTION HAZIR!

### Yapılan İşlemler:
1. ✅ `main.dart` - Firebase ve AdMob aktifleştirildi
2. ✅ `admob_test_screen.dart` - Test ekranı oluşturuldu
3. ✅ **GERÇEK AdMob ID'leri entegre edildi!**
   - App ID: `ca-app-pub-9245498152791757~7621501650`
   - Banner ID: `ca-app-pub-9245498152791757/6718471766`
   - Rewarded ID: `ca-app-pub-9245498152791757/9674424709`
4. ⚠️ Sadece Interstitial Ad Unit kaldı (oluşturulacak)

📋 **Detaylı Test Rehberi:** `ADMOB_PRODUCTION_SETUP.md` dosyasına bakın!

---

## 🚀 HIZLI TEST YÖNTEMİ

### Seçenek 1: Test Ekranını Ana Sayfa Yap (EN KOLAY)

1. **`lib/main.dart` dosyasını aç**
2. **Satır 11'de bu import'u ekle:**
   ```dart
   import 'screens/admob_test_screen.dart';
   ```

3. **Satır 275 civarında (AICalculatorApp class'ının içinde) `home:` parametresini bul:**
   ```dart
   home: const SplashScreen(), // <-- Bunu değiştir
   ```

4. **Şu şekilde değiştir:**
   ```dart
   home: const AdMobTestScreen(), // TEST İÇİN
   ```

5. **Uygulamayı çalıştır:**
   ```cmd
   flutter run
   ```

---

### Seçenek 2: Ayarlar Ekranına Buton Ekle

Eğer tüm uygulamayı kullanırken test etmek istersen:

1. `lib/screens/settings/settings_screen.dart` dosyasına test butonu ekle
2. Navigator ile AdMobTestScreen'e git

---

## 📱 TEST ADIMLARI

### Emülatör veya Gerçek Cihazda Test:

```cmd
# Debug build çalıştır
flutter run

# VEYA Release build (daha gerçekçi)
flutter run --release
```

### Test Ekranında Göreceklerin:

#### 1. 📊 **Durum Paneli**
- ✅ Banner: Yüklendi mi?
- ✅ Interstitial: Yüklendi mi?
- ✅ Rewarded: Yüklendi mi?

#### 2. 🎨 **Test Kartları**

**Banner Ad (Mavi)**
- Alt kısımda otomatik görünür
- 320x50 boyutunda
- Test reklamı: Google örnek banner

**Interstitial Ad (Turuncu)**
- "TEST ET" butonuna tıkla
- Tam ekran reklam açılır
- X ile kapat
- NOT: İlk tıklamada göstermeyebilir (frekans kontrolü var)

**Rewarded Ad (Yeşil)**
- "TEST ET" butonuna tıkla
- Video reklam izle
- Sonunda "Ödül Kazanıldı! 🎉" mesajı görünür

#### 3. 🔄 **Yenile Butonu**
- Sağ alttaki mor FAB butonuna tıkla
- Tüm reklamların durumu yenilenir

---

## ⚠️ OLASI SORUNLAR & ÇÖZÜMLER

### Problem 1: Firebase Hatası
```
google-services.json not found
```
**ÇÖZÜM:** Firebase Console'dan dosyayı indir ve `android/app/` klasörüne koy

### Problem 2: Reklamlar Yüklenmiyor
```
Banner: ❌
Interstitial: ❌
Rewarded: ❌
```
**ÇÖZÜM:** 
1. İnternet bağlantısını kontrol et
2. `flutter clean` → `flutter pub get` → `flutter run`
3. Gerçek cihazda test et (emülatör yavaş olabilir)

### Problem 3: Interstitial Gösterilmiyor
```
Butona bastım ama açılmadı
```
**ÇÖZÜM:** Normal! Kod 3 işlem yaptıktan sonra + 2 dk bekleme süresi var.
- Geçici olarak `admob_service.dart` içinde `_interstitialFrequency = 1` yap

### Problem 4: Build Hatası
```
Error: Cannot find symbol Firebase
```
**ÇÖZÜM:** 
```cmd
flutter clean
flutter pub get
flutter run
```

---

## 🎯 TEST SONUÇLARI

### ✅ Başarılı Test:
- Banner göründü (alt kısımda)
- Interstitial gösterildi (tam ekran)
- Rewarded izlendi ve ödül mesajı geldi
- Konsol logları:
  ```
  ✅ AdMob initialized successfully
  ✅ Banner ad loaded
  ✅ Interstitial ad loaded
  ✅ Rewarded ad loaded
  🎁 User earned reward: 1 Reward
  ```

### ❌ Başarısız Test:
- Hiçbir reklam yüklenmedi
- Console'da hata mesajları var
- Firebase hatası alıyorsun

---

## 🔥 ÖNEMLİ NOTLAR

1. **TEST ID'leri Kullanıyoruz**
   - Şu anki reklamlar Google'ın test reklamları
   - Gerçek para kazanamazsın
   - Production'da gerçek ID'lerle değiştir

2. **Firebase Gerekli**
   - `google-services.json` olmadan AdMob çalışmaz
   - Firebase projesi oluştur ve dosyayı indir

3. **Debug vs Release**
   - Debug: Daha yavaş ama log'lar görünür
   - Release: Gerçek performans ama log yok

4. **Gerçek Cihazda Test Tavsiyesi**
   - Emülatör yavaş olabilir
   - Gerçek cihazda daha iyi sonuç alırsın

---

## 🚀 SONRAKI ADIMLAR

### Test Başarılı Olduysa:

1. **`main.dart` home parametresini geri al:**
   ```dart
   home: const SplashScreen(), // Eski haline dön
   ```

2. **AdMob Hesabı Aç:**
   - https://admob.google.com
   - Uygulama oluştur
   - 3 Ad Unit oluştur (Banner, Interstitial, Rewarded)

3. **Gerçek ID'leri Ekle:**
   - `AndroidManifest.xml` → App ID değiştir
   - `admob_service.dart` → Ad Unit ID'leri değiştir

4. **Production Build Al:**
   ```cmd
   flutter build appbundle --release
   ```

---

## 📞 YARDIM

Sorun mu yaşıyorsun?

**Kontrol Listesi:**
- [ ] İnternet bağlantısı var mı?
- [ ] google-services.json yerinde mi?
- [ ] flutter pub get çalıştırdın mı?
- [ ] Gerçek cihazda test ettin mi?
- [ ] Console log'larına baktın mı?

**Hala Sorun Varsa:**
Console çıktısını ve hata mesajını paylaş!

---

## 🎉 BAŞARILAR!

AdMob entegrasyonu tamamlandı. Test et ve gerçek ID'lerle yayınla! 🚀