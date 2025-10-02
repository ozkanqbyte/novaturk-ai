# 🔧 AI CALCULATOR PRO - SORUN ÇÖZME REHBERİ

## ⚠️ TESPİT EDİLEN SORUNLAR

### 1. AdMob Reklamları Görünmüyor
**Sebep:** AdMob initialize ediliyor ama test reklamları yüklenemiyor olabilir.
**Çözüm:** 
- İnternet bağlantısı kontrolü
- Google Play Services güncellemesi
- Test cihazı ekleme (AdMob Console)

### 2. AI Özellikleri Çalışmıyor
**Sebep:** İzinler verilmemiş veya servisler initialize edilememiş
**Çözüm:**
- Kamera izni ver
- Mikrofon izni ver
- Galeri izni ver

### 3. Premium Paket Fiyatları
**Güncellemeler:**
- Aylık: 50₺
- Ömür Boyu: 399₺
- Yıllık paket kaldırıldı

## 📱 GEREKLI İZİNLER

AndroidManifest.xml'de şunlar olmalı:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## 🧪 TEST ADIMLARI

### AdMob Test
1. İnternet bağlantısını kontrol et
2. Uygulamayı açın
3. Ana ekranın altında test reklamı görünmeli
4. 30 saniye bekleyin (reklam yüklenme süresi)

### Sesli Asistan Test
1. AI Asistan → Sesli
2. "Konuşmaya Başla" tıkla
3. İlk seferde mikrofon izni iste
4. "iki artı iki" de
5. Sonuç: 4

### Fotoğraf OCR Test
1. AI Asistan → Fotoğraf
2. "Kamera Aç" tıkla
3. İlk seferde kamera izni iste
4. Kağıda "2+2=" yaz, fotoğrafla
5. AI tanımalı

### El Yazısı Test
1. AI Asistan → El Yazısı
2. Ekrana parmakla "3+5" yaz
3. Otomatik tanımalı

## 🔧 DÜZELTMELER

### 1. IAP Service
- Fiyatlar güncellendi: 50₺ aylık, 399₺ ömür boyu
- Yearly subscription kaldırıldı

### 2. AdMob Service
- Test mode aktif (Line 21)
- Banner ad initialize ediliyor (main.dart Line 88)

### 3. AI Controller
- Türkçe NLP entegrasyonu eklendi
- Tüm servisler initialize ediliyor

## 📞 SORUN YAŞIYORSANIZ

1. **Reklamlar hala görünmüyor:**
   - Uygulama ayarlarından cache temizle
   - Uygulamayı sil, yeniden yükle
   - Google Play Services'i güncelle

2. **Sesli asistan çalışmıyor:**
   - Ayarlar → Uygulamalar → İzinler → Mikrofon ✅
   - Google Ses Tanıma yüklü mü?

3. **Kamera/Fotoğraf çalışmıyor:**
   - Ayarlar → Uygulamalar → İzinler → Kamera ✅
   - Galeri izni ✅

4. **Premium satın alma çalışmıyor:**
   - Google Play Store'a bağlı mısınız?
   - Google Play Console'da ürünler oluşturuldu mu?
   - Test hesabı eklenmiş mi?