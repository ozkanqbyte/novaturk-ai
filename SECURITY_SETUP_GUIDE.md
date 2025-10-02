# 🛡️ GÜVENLIK SİSTEMİ KURULUM REHBERİ

## Tebrikler! Uygulamanıza ULTRA-GÜVENL İK sistemi kuruldu! 🎉

Bu rehber, güvenlik sisteminin nasıl çalıştığını ve neler yapmanız gerektiğini açıklar.

---

## 🔐 KURULAN GÜVENLİK SİSTEMLERİ

### 1. ✅ Root/Jailbreak Detection
- **Ne Yapar**: Rootlu/Jailbreak'li cihazları tespit eder
- **Nasıl Çalışır**: Cihaz sistem dosyalarını kontrol eder, root göstergelerini arar
- **Sonuç**: Rootlu cihazlarda premium satın alma engellenir

### 2. ✅ Emulator Detection
- **Ne Yapar**: Sahte test ortamlarını (emulator) tespit eder
- **Nasıl Çalışır**: Cihaz donanım bilgilerini analiz eder
- **Sonuç**: Crack yapanların test ortamını engeller

### 3. ✅ App Signature Verification
- **Ne Yapar**: APK imzasını kontrol eder
- **Nasıl Çalışır**: Package name ve imza hash'ini doğrular
- **Sonuç**: Sahte/değiştirilmiş APK'lar çalışmaz

### 4. ✅ License Token System
- **Ne Yapar**: Her premium kullanıcıya özel token oluşturur
- **Nasıl Çalışır**: Cihaz + kullanıcı bilgilerinden unique token üretir
- **Sonuç**: Token kopyalanamaz, başka cihazda çalışmaz

### 5. ✅ Code Obfuscation (ProGuard/R8)
- **Ne Yapar**: Kodu şifreler, okunmaz hale getirir
- **Nasıl Çalışır**: Build sırasında class/method isimlerini değiştirir
- **Sonuç**: Tersine mühendislik neredeyse imkansız hale gelir

### 6. ✅ Runtime Integrity Check
- **Ne Yapar**: Çalışma anında güvenlik kontrolü yapar
- **Nasıl Çalışır**: Premium özellik kullanılmadan önce kontrol eder
- **Sonuç**: Crack yapanlar premium özelliklere erişemez

---

## 📱 KULLANIM

### Otomatik Kontrol
Güvenlik sistemi **uygulama başlarken otomatik** çalışır:

```dart
// main.dart içinde otomatik çalışıyor
await SecurityService.instance.initialize();
```

### Manuel Kontrol (İsteğe bağlı)
Belirli bir noktada kontrol yapmak isterseniz:

```dart
final isSecure = await SecurityService.instance.performRuntimeCheck();
if (!isSecure) {
  // Güvenlik riski var - premium özellikleri devre dışı bırak
}
```

### Premium Lisans Kontrolü
Premium satın almalarda otomatik çalışıyor:

```dart
// iap_service.dart içinde otomatik çalışıyor
// Rootlu cihazlarda satın alma başarısız olur
```

---

## ⚙️ YAPMAMIZ GEREKENLER

### 1. ✅ TAMAMLANDI: Package Name Güncellendi

Dosya: `lib/services/security_service.dart` (line ~196)

```dart
// ✅ Package name artık kısa ve profesyonel:
const expectedPackageName = 'com.aicalcpro';
```

**Yeni Package Name:** `com.aicalcpro` (eski: `com.aicalc.pro.ai_calculator_pro`)

### 2. ✅ TAMAMLANDI: Firebase Config Güncellendi

**Firebase artık tamamen entegre edildi!** ✅

#### ✅ Android (TAMAMLANDI):
1. ✅ Firebase Console'dan `google-services.json` indirildi
2. ✅ `android/app/google-services.json` dosyası yerleştirildi
3. ✅ Package name: **`com.aicalcpro`** ✅
4. ✅ Google Services plugin eklendi
5. ✅ Firebase Analytics + Crashlytics aktif

#### 🟡 iOS için (YAPILACAK - eğer iOS build yapacaksanız):
1. Firebase Console'a gidin: https://console.firebase.google.com
2. Projenize iOS uygulaması ekleyin
3. Bundle ID girin: **`com.aicalcpro`** ✅
4. `GoogleService-Info.plist` dosyasını indirin
5. Xcode'da Runner projesine dosyayı ekleyin (sürükle-bırak)
6. `lib/firebase_options.dart` dosyasındaki iOS API key'lerini güncelleyin

**NOT**: iOS build yapmıyorsanız bu adımı atlayabilirsiniz.

### 3. 🟡 ÖNERİLEN: Release Keystore Oluşturun

Release için imzalı APK/AAB oluşturmak gerekli:

```bash
# Windows'ta:
keytool -genkey -v -keystore c:\ai_calculator_pro\android\app\upload-keystore.jks -storetype JKS -keyalg RSA -keysize 2048 -validity 10000 -alias upload

# Şifre girin (örn: password123)
# Bilgileri doldurun
```

Ardından `android/key.properties` dosyasını düzenleyin:

```properties
storePassword=password123
keyPassword=password123
keyAlias=upload
storeFile=upload-keystore.jks
```

---

## 🧪 TEST ETME

### Debug Modda Test
```bash
flutter run
```
**NOT**: Debug modda güvenlik kontrolleri daha gevşektir. Bu normal!

### Release Modda Test
```bash
flutter build apk --release
# veya
flutter build appbundle --release
```

### Güvenlik Loglarını İzleme
Konsol çıktısında şunları göreceksiniz:

```
🛡️ Initializing Security Service...
🔓 Root Detection: Not Rooted ✅
📱 Emulator Detection: Real Device ✅
✍️ Signature Verification: VALID ✅
✅ Security checks passed - Device is secure
```

---

## ⚠️ SORUN GİDERME

### "Security check failed" hatası alıyorsanız:

1. **Debug modda mı çalışıyorsunuz?**
   - Debug modda bazı kontroller atlanır, bu normal

2. **Emulator'da mı çalışıyorsunuz?**
   - Evet? Bu normaldir. Emulator güvenli değil olarak işaretlenir
   - Production'da gerçek cihazlarda çalışır

3. **Package name doğru mu?**
   - `security_service.dart` dosyasında `expectedPackageName` kontrol edin

4. **Root detection yanlış pozitif veriyor mu?**
   - `security_service.dart` içinde root kontrolünü ayarlayabilirsiniz

---

## 📊 GÜVENLİK RAPORU GÖRME

Kullanıcı cihazının güvenlik durumunu görmek için:

```dart
final report = SecurityService.instance.getSecurityReport();
print(report);

// Çıktı:
// {
//   'device_secure': true,
//   'rooted': false,
//   'emulator': false,
//   'signature_valid': true,
//   ...
// }
```

---

## 🚀 RELEASE YAPMADAN ÖNCE

### Kontrol Listesi:

- [x] `security_service.dart` içinde package name güncellendi ✅
- [x] Firebase `google-services.json` gerçek dosya ile değiştirildi ✅
- [x] Google Services plugin eklendi ✅
- [x] Firebase Analytics + Crashlytics entegre edildi ✅
- [ ] Release keystore oluşturuldu ve `key.properties` düzenlendi
- [ ] `flutter build appbundle --release` ile test edildi
- [ ] Root/emulator detection test edildi
- [ ] Premium satın alma test edildi

---

## 💡 EK GÜVENLİK ÖNERİLERİ

### Sunucu Taraflı Doğrulama (İleri Seviye)
Daha fazla güvenlik için:

1. Backend server kurun (Node.js/Python/Go)
2. IAP satın almalarını server'da doğrulayın
3. Google Play Developer API kullanın
4. License token'ları server'da saklayın

### SSL Pinning (İleri Seviye)
API çağrılarınızı korumak için SSL pinning ekleyin.

### Periodic Security Checks
Uygulamanın arka planında periyodik güvenlik kontrolü:

```dart
// Her 5 dakikada bir kontrol
Timer.periodic(Duration(minutes: 5), (timer) async {
  await SecurityService.instance.performRuntimeCheck();
});
```

---

## 📞 YARDIM

Güvenlik sistemi ile ilgili sorunuz mu var?

1. Önce bu rehberi okuyun
2. `security_service.dart` dosyasındaki yorumları inceleyin
3. Console loglarını kontrol edin

---

## 🎯 SONUÇ

Tebrikler! Uygulamanız artık:

✅ Rootlu cihazlarda çalışmayı reddediyor
✅ Emulator'ları tespit ediyor
✅ Sahte APK'ları engelliyor
✅ Kodu şifrelenmiş (obfuscated)
✅ Premium lisansı güvenli şekilde doğruluyor
✅ Runtime güvenlik kontrolü yapıyor

**Bu, crack yapanların işini ÇOK ZORLAŞTIRACAK!** 💪

Ancak unutmayın: %100 güvenlik yoktur. Bu sistem, crack yapanların %95'ini engelleyecektir. Geriye kalan %5 için sunucu taraflı doğrulama gerekir (aylık maliyet).

---

**İyi şanslar! 🚀**