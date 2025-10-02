# 🎯 ADMOB PRODUCTION SETUP - GERÇEK REKLAMLAR

## ✅ TAMAMLANAN İŞLEMLER

### 1. App ID Entegrasyonu
✅ **AndroidManifest.xml** güncellendi  
✅ Gerçek App ID: `ca-app-pub-9245498152791757~7621501650`  
✅ Test ID kaldırıldı  

### 2. Banner Ad Entegrasyonu
✅ **AdMobService.dart** güncellendi  
✅ Gerçek Banner ID: `ca-app-pub-9245498152791757/6718471766`  
✅ Production/Test mode switch eklendi  

### 3. Rewarded Ad Entegrasyonu
✅ **AdMobService.dart** güncellendi  
✅ Gerçek Rewarded ID: `ca-app-pub-9245498152791757/9674424709`  
✅ Ödüllü reklam sistemi hazır  

### 4. Akıllı Test Sistemi
✅ `_useTestAds` flag'i eklendi  
✅ Development'ta test, production'da gerçek reklamlar  
✅ AdMobTestScreen hazır  

---

## ⚠️ ÖNEMLİ: KALAN İŞLEMLER

### 🔴 Sadece Interstitial Kaldı!

#### 1️⃣ Interstitial Ad Unit Oluştur
AdMob Console'a git ve yeni reklam birimi oluştur:

**Adımlar:**
1. https://apps.admob.com/ → Uygulamalar → Premium Hesap Makinesi
2. **"Reklam Birimi"** → **"Reklam birimi ekle"**
3. Format seç: **"Araya Giren"** (Interstitial)
4. Ad: `Calculator_Interstitial`
5. **"Reklam birimi oluştur"** → ID'yi kopyala
6. `admob_service.dart` → Line 31'deki TODO'ya yapıştır

Format:
```dart
: 'ca-app-pub-9245498152791757/XXXXXXXXXX'; // Interstitial ID buraya
```

#### 2️⃣ Rewarded Ad Unit - ✅ TAMAMLANDI!
Rewarded ad unit başarıyla entegre edildi:

✅ **Rewarded ID**: `ca-app-pub-9245498152791757/9674424709`  
✅ Kod entegrasyonu tamamlandı  
✅ Test için hazır  

**Rewarded Reklam Özellikleri:**
- 🎁 Kullanıcı video izler → Ödül kazanır
- 👑 Örnek: 24 saat Premium deneme süresi
- 📈 En yüksek eCPM'li reklam türü (~$8-15)
- 💯 Kullanıcı deneyimi pozitif (zorunlu değil)

---

## 🧪 TEST AŞAMALARI

### 📱 AŞAMA 1: Test Modu ile Test (GÜVENLİ)

**Neden Test Modu?**
- ❌ Gerçek reklamlara kendi tıklarsan → **AdMob account ban yer!**
- ✅ Test reklamlar gerçek gibi çalışır ama ban riski YOK
- ✅ Reklam akışını, boyutları, yerleşimi test edebilirsin

**Test Modunu Aktifleştir:**

```dart
// admob_service.dart - Line 22
static const bool _useTestAds = true; // Development için TRUE yap
```

**Test Et:**
```bash
flutter clean
flutter pub get
flutter run
```

**Test Checklist:**
- [ ] Uygulama açıldı mı?
- [ ] Console'da "📺 Initializing AdMob..." görünüyor mu?
- [ ] Banner alt kısımda yüklendi mi?
- [ ] AdMob Test Screen açılıyor mu? (Settings > AdMob Test)
- [ ] Banner'da "Test Ad" yazısı var mı? ✅ (Bu normal!)
- [ ] Interstitial test reklam açıldı mı?
- [ ] Rewarded video izlenip ödül alındı mı?

**Beklenen Console Çıktısı:**
```
📺 Initializing AdMob...
✅ Banner ad loaded
✅ Interstitial ad loaded
✅ Rewarded ad loaded
✅ AdMob initialized successfully
```

---

### 🎯 AŞAMA 2: Debug View ile Gerçek Reklam Testi

**Önemli:** Bu aşamada GERÇEK reklamlar gösterilecek ama AdMob tarafından izlenecek.

#### Adım 1: Test Cihazını Kaydet
```bash
# Cihazını AdMob test cihazı olarak ekle
# Android cihaz bağlıyken:
flutter run

# Console'da şunu bul:
# "To use this device for testing, you can add: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
# Bu ID'yi kopyala
```

#### Adım 2: Test Cihaz ID'sini Koda Ekle

```dart
// admob_service.dart - initialize() fonksiyonunda
await MobileAds.instance.initialize();

// Test cihazını ekle (line 97'den sonra)
RequestConfiguration configuration = RequestConfiguration(
  testDeviceIds: ['XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'], // Kendi ID'ni buraya
);
MobileAds.instance.updateRequestConfiguration(configuration);
```

#### Adım 3: Production Moduna Geç

```dart
// admob_service.dart - Line 22
static const bool _useTestAds = false; // FALSE yap - GERÇEK REKLAMLAR!
```

#### Adım 4: Test Et

```bash
flutter clean
flutter pub get
flutter run --release  # Release mode'da test et!
```

**Test Checklist:**
- [ ] Banner gerçek reklamları gösteriyor mu?
- [ ] Interstitial tam ekran açılıyor mu?
- [ ] Rewarded video 30 saniye oynatılıyor mu?
- [ ] Reklamlara tıklarsan uygun sayfa açılıyor mu?

**⚠️ UYARI:** Kendi reklamlarına SAKIN TIKLA! AdMob invalid traffic algılar ve account suspend eder!

---

### 📊 AŞAMA 3: AdMob Console'da İzleme

#### 1. DebugView Aktifleştir
```bash
# Android için
adb shell setprop debug.firebase.analytics.app com.aicalcpro

# iOS için (ileride)
# Xcode schemes'de Arguments: -FIRDebugEnabled
```

#### 2. AdMob Console'u Aç
- https://apps.admob.com/
- **Uygulamalar** → **Premium Hesap Makinesi**
- **Dashboard** → Bugünün rakamlarını izle

**Göreceklerin:**
- 📊 **Requests**: Kaç reklam istendi
- 👀 **Impressions**: Kaç reklam gösterildi
- 💰 **Estimated earnings**: Tahmini kazanç
- 📈 **Fill rate**: Reklam doldurma oranı (hedef: >90%)
- 🖱️ **Clicks**: Reklam tıklamaları

#### 3. İlk 24 Saat
⚠️ **İlk gün veri görünmeyebilir - bu normal!**

AdMob veri işleme süresi:
- **Real-time**: Yok (Firebase gibi değil)
- **İlk veri**: 24-48 saat sonra
- **Detaylı rapor**: 2-3 gün sonra

---

## 🚀 PRODUCTION BUILD

### Release APK Oluştur

#### Adım 1: Kontroller
```dart
// admob_service.dart kontrolü
static const bool _useTestAds = false; // ✅ FALSE olmalı!
```

#### Adım 2: Build
```bash
flutter clean
flutter build apk --release
```

**APK Konumu:**
```
build/app/outputs/flutter-apk/app-release.apk
```

#### Adım 3: Test Et (Gerçek Cihaz)
```bash
# APK'yı cihaza yükle
adb install build/app/outputs/flutter-apk/app-release.apk

# Uygulamayı aç ve test et
```

**Test Checklist (Release Build):**
- [ ] Uygulama açılıyor mu?
- [ ] Banner reklamlar yükleniyor mu?
- [ ] Interstitial frekans kontrolü çalışıyor mu? (her 3 işlemde 1)
- [ ] Rewarded video ödül veriyor mu?
- [ ] Premium kullanıcılar reklam görmüyor mu?

---

## 📱 ADMOB TEST SCREEN KULLANIMI

### Test Ekranını Açma
1. Uygulamayı aç
2. **Settings** (⚙️) → **"AdMob Test"** butonuna tıkla
3. Test ekranı açılacak

### Test Ekranı Özellikleri

#### 📊 Reklam Durumu Paneli
- **Banner**: ✅/❌ - Alt kısımda gösterilir
- **Interstitial**: ✅/❌ - Tam ekran reklam
- **Rewarded**: ✅/❌ - Ödüllü video

#### Test Butonları

**1. Banner Ad**
- Sürekli alt kısımda görünür
- "Test Ad" yazısı varsa → Test modu aktif ✅
- Gerçek marka logoları varsa → Production modu ✅

**2. Interstitial Ad**
- "TEST ET" butonuna tıkla
- Tam ekran reklam açılır
- ❌ simgesi ile kapat
- **Frekans Kontrolü:** Her 3 tıklamada 1 gösterir + 2 dk bekleme

**3. Rewarded Ad**
- "TEST ET" butonuna tıkla
- 30 saniyelik video oynatılır
- İzlersen → "🎁 Ödül Kazanıldı!" mesajı görünür
- Ödül: Premium özellik 24 saat aktif

### Refresh Butonu (🔄)
Sağ alt köşedeki FAB butonu:
- Reklam durumlarını yeniler
- Yüklenmeyen reklamları tekrar dener

---

## 💡 SORUN GİDERME

### ❌ "Banner ad failed to load"

**Sebep 1: İnternet Bağlantısı**
```bash
# İnternet var mı kontrol et
ping google.com
```

**Sebep 2: AdMob Hesabı Henüz Aktif Değil**
- Yeni oluşturulmuş hesaplar 24-48 saat sonra aktif olur
- AdMob Console → "Verification" durumunu kontrol et

**Sebep 3: App ID Yanlış**
```xml
<!-- AndroidManifest.xml - kontrol et -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-9245498152791757~7621501650"/>
```

**Sebep 4: Package Name Uyuşmuyor**
AdMob Console'daki package name: `com.aicalcpro` olmalı

---

### ❌ "Interstitial ad failed to show"

**Sebep: Frekans Kontrolü**
- Her 3 işlemde 1 gösterilir
- Son reklamdan 2 dakika geçmeli

**Çözüm: Frequency'yi geçici kaldır**
```dart
// admob_service.dart - Line 238
// Geçici olarak yorum satırına al:
// if (_interstitialCounter < _interstitialFrequency) return;
```

---

### ❌ "Ad request successful, but no ad returned"

**Sebep: Reklam Envanteri Yok**
- Bazı ülkelerde reklam stoku düşük olabilir
- Bazı saatlerde reklam az olabilir

**Çözüm:**
- Test Mode kullan (her zaman reklam döner)
- Farklı zamanlarda dene
- Fill rate'i AdMob Console'dan izle (hedef >85%)

---

### ⚠️ "Invalid traffic detected"

**Sebep: Kendi Reklamlarına Tıklamışsın!**
- AdMob kendi tıklamalarını algılar
- Invalid traffic = Policy violation

**Çözüm:**
1. Test Mode kullan (development'ta)
2. Test cihazı kaydet (production test için)
3. ASLA kendi reklamlarına tıklama!
4. Arkadaşlarına organik test yaptır

---

## 🎯 BEST PRACTICES

### 1. Development vs Production

| Ortam | _useTestAds | Reklam Tipi | Risk |
|-------|-------------|-------------|------|
| **Dev (flutter run)** | `true` | Test reklamlar | 🟢 Güvenli |
| **Beta Test** | `false` + test device | Gerçek reklamlar | 🟡 Orta |
| **Production** | `false` | Gerçek reklamlar | 🔴 Dikkat! |

### 2. Reklam Sıklığı

**Banner:**
- ✅ Her ekranda 1 banner
- ❌ Birden fazla banner yan yana
- ❌ Ekranın yarısını kaplayacak şekilde

**Interstitial:**
- ✅ Her 3-5 işlemde 1
- ✅ En az 2 dakika aralık
- ❌ Uygulama açılışında hemen gösterme
- ❌ Her buton tıklamasında gösterme

**Rewarded:**
- ✅ Kullanıcı isteğine bağlı
- ✅ Premium özellik denemesi için
- ❌ Zorunlu kılma

### 3. Premium Kullanıcılar
```dart
// Premium satın alındığında reklamları kapat
AdMobService().updatePremiumStatus(true);

// Böylece:
// - Tüm reklamlar otomatik kapanır
// - Ad instance'ları dispose edilir
// - Bellekten temizlenir
```

### 4. Analytics Entegrasyonu
```dart
// Her reklam gösteriminde Firebase'e log at
await FirebaseService().logEvent(
  'ad_impression',
  parameters: {'ad_type': 'banner', 'placement': 'calculator_bottom'},
);

// Tıklama analizi
await FirebaseService().logEvent(
  'ad_click',
  parameters: {'ad_type': 'interstitial'},
);
```

---

## 📈 KAZANÇ OPTİMİZASYONU

### 1. Fill Rate İyileştirme
**Hedef: >90%**

Düşük fill rate sebepleri:
- Tek mediation network (sadece AdMob)
- Dar geo-targeting
- Az reklam talebi

**Çözüm:**
```yaml
# pubspec.yaml - Mediation ekle
dependencies:
  google_mobile_ads: ^5.1.0
  # facebook_audience_network: ^2.0.0  # Opsiyonel
  # unity_ads_plugin: ^0.3.0           # Opsiyonel
```

### 2. eCPM Artırma
**eCPM = (Kazanç / Gösterim) × 1000**

**Stratejiler:**
- Rewarded ads kullan (en yüksek eCPM)
- Premium konumları kullan (app open ads)
- Kullanıcı segmentasyonu yap (ülke, dil, davranış)
- Ad placement optimization (A/B test)

### 3. Kullanıcı Deneyimi
**Reklam çok = Kullanıcı kaybı = Kazanç düşer**

Denge kur:
- ✅ Banner: Her ekranda (pasif)
- ✅ Interstitial: 5 işlemde 1
- ✅ Rewarded: İsteğe bağlı
- ❌ Her 30 saniyede reklam → Uygulamayı silerler!

---

## 🔒 GÜVENLİK

### 1. App-ads.txt Dosyası
Google'ın gelirini korumak için:

**Adımlar:**
1. AdMob Console → **"App-ads.txt"** sayfası
2. Kod satırlarını kopyala
3. Websitene yükle: `https://yourdomain.com/app-ads.txt`
4. Yoksa boş ver (opsiyonel)

### 2. Invalid Traffic Koruması
```dart
// Emulator'da reklamları kapat
if (kDebugMode || Platform.isAndroid && await isEmulator()) {
  print('ℹ️ Emulator detected - Ads disabled');
  return;
}
```

---

## ✅ RELEASE CHECKLIST

### Pre-Release (Yayınlamadan Önce)
- [ ] `_useTestAds = false` yapıldı mı?
- [ ] Interstitial Ad Unit ID eklendi mi?
- [ ] Rewarded Ad Unit ID eklendi mi?
- [ ] Test cihaz ID'si production'dan çıkarıldı mı?
- [ ] AdMob Console'da uygulama onaylandı mı?
- [ ] Policy kontrolü yapıldı mı?
- [ ] Release APK test edildi mi?

### Post-Release (Yayınlandıktan Sonra)
- [ ] İlk 24 saat AdMob Console'u izle
- [ ] Fill rate >85% mi?
- [ ] Invalid traffic uyarısı yok mu?
- [ ] Firebase Analytics'te ad_impression eventi görünüyor mu?
- [ ] Kullanıcı şikayeti var mı?

---

## 📞 DESTEK LİNKLERİ

### AdMob Console
- **Dashboard**: https://apps.admob.com/
- **Ad Units**: https://apps.admob.com/ad-units/
- **Policy Center**: https://apps.admob.com/policy-center
- **Account Settings**: https://apps.admob.com/account

### Dokümantasyon
- **AdMob Flutter**: https://developers.google.com/admob/flutter/quick-start
- **AdMob Policies**: https://support.google.com/admob/answer/6128543
- **Banner Best Practices**: https://support.google.com/admob/answer/6066980
- **Invalid Traffic**: https://support.google.com/admob/answer/9366304

### Destek
- **AdMob Help**: https://support.google.com/admob
- **Flutter Community**: https://discord.gg/flutter

---

## 🎉 ÖZET

### ✅ Tamamlananlar:
1. ✅ AdMob App ID entegre edildi
2. ✅ Banner Ad Unit ID eklendi
3. ✅ Production/Test mode switch eklendi
4. ✅ AdMobTestScreen hazır
5. ✅ Frequency control aktif
6. ✅ Premium integration mevcut

### ⚠️ Yapılacaklar:
1. ⚠️ Interstitial Ad Unit oluştur
2. ⚠️ Rewarded Ad Unit oluştur
3. ⚠️ Test mode ile tam test yap
4. ⚠️ Production mode ile real test yap
5. ⚠️ Release build test et

### 🎯 Sonraki Adım:
1. **Test Mode Test**: `_useTestAds = true` ile banner/interstitial/rewarded test et
2. **AdMob Console**: Kalan 2 ad unit'i oluştur
3. **Production Test**: Test device ekleyip gerçek reklamları test et
4. **Release**: Build al ve Google Play'e yükle

---

**Başarılar! 🚀**

Sorular:
- Test ederken sorun mu yaşadın?
- Reklam yüklenmiyor mu?
- AdMob Console'da sorun mu var?

Haber ver, birlikte çözelim! 💪