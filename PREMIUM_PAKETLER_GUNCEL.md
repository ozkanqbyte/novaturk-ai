# 💎 PREMIUM PAKETLER - GÜNCEL FİYATLANDIRMA
## AiPremium Hesap Makinesi v2.1

---

## 📊 MEVCUT PAKETLER

| Paket Adı | Fiyat | Faturalandırma | Product ID | Durum |
|-----------|-------|----------------|------------|-------|
| **Aylık Premium** | 50₺ | Aylık | `ai_calculator_monthly_premium` | ✅ Aktif |
| **Ömür Boyu Premium** | 399₺ | Tek seferlik | `ai_calculator_lifetime_premium` | ✅ Aktif |
| ~~Yıllık Premium~~ | ~~450₺~~ | ~~Yıllık~~ | ~~`ai_calculator_yearly_premium`~~ | ❌ Kaldırıldı |

---

## 💰 FİYAT DEĞİŞİKLİKLERİ (v2.1)

### AYLIK PAKET
- **Eski Fiyat:** 29.99₺/ay
- **Yeni Fiyat:** 50₺/ay
- **Artış:** +20.01₺ (%67 artış)
- **Sebep:** Pazar araştırması ve rekabetçi fiyatlandırma

### YILLIK PAKET
- **Eski Durum:** 450₺/yıl (aylığa göre %25 tasarruf)
- **Yeni Durum:** ❌ KALDIRILDI
- **Sebep:** Müşteri tercihi düşük, ömür boyu paket daha popüler

### ÖMÜR BOYU PAKET
- **Eski Durum:** Yoktu
- **Yeni Fiyat:** 399₺ (tek ödeme)
- **Sebep:** Müşteri talebi, uzun vadeli gelir artışı
- **Tasarruf:** Aylık pakete göre 8 ayda kendini öder

---

## 🎯 GOOGLE PLAY CONSOLE AYARLARI

### 1️⃣ AYLIK ABONELİK OLUŞTURMA

**Adım 1: Yeni Subscription Oluştur**
- Play Console → Monetize → In-app products
- "Create subscription" tıklayın

**Adım 2: Temel Bilgiler**
```
Product ID: ai_calculator_monthly_premium
Name: Premium Aylık Abonelik
Description: Tüm premium özelliklere tam erişim - Aylık
```

**Adım 3: Base Plan**
```
Base plan ID: monthly-plan
Billing period: 1 month
Renewal type: Auto-renewing
Grace period: 3 days (opsiyonel)
```

**Adım 4: Fiyatlandırma**
```
Country: Turkey (TR)
Price: 50.00 TRY
```

**Diğer ülkeler için (opsiyonel):**
```
United States: 1.99 USD
Germany: 1.99 EUR
United Kingdom: 1.99 GBP
```

**Adım 5: Free Trial (Opsiyonel)**
```
Free trial period: 7 days
```
*(Not: İlk kullanıcılar için iyi bir pazarlama stratejisi)*

**Adım 6: Activate**
- "Save" ve "Activate" tıklayın

---

### 2️⃣ ÖMÜR BOYU PAKET OLUŞTURMA

**Adım 1: Yeni Product Oluştur**
- Play Console → Monetize → In-app products
- "Create product" tıklayın (NOT: "subscription" DEĞİL!)

**Adım 2: Temel Bilgiler**
```
Product ID: ai_calculator_lifetime_premium
Name: Premium Ömür Boyu
Description: Tüm premium özelliklere ömür boyu erişim - Tek ödeme
Product type: Managed product
```

**Adım 3: Fiyatlandırma**
```
Country: Turkey (TR)
Price: 399.00 TRY
```

**Diğer ülkeler için (opsiyonel):**
```
United States: 14.99 USD
Germany: 14.99 EUR
United Kingdom: 14.99 GBP
```

**Adım 4: Activate**
- "Save" ve "Activate" tıklayın

---

### 3️⃣ YILLIK ABONELİĞİ KALDIRMA (Eğer varsa)

**Adım 1: Mevcut Ürünü Bul**
- Play Console → Monetize → In-app products
- `ai_calculator_yearly_premium` ürününü bulun

**Adım 2: Deactivate**
- Ürüne tıklayın
- "Deactivate" butonuna tıklayın
- ⚠️ **DİKKAT:** Mevcut aboneler etkilenmez, sadece yeni satışlar durur

**Adım 3: Koddan Kaldırma**
Aşağıdaki dosyalarda `yearly` referanslarını temizledik:
- ✅ `lib/services/iap_service.dart`
- ✅ `lib/controllers/premium_controller.dart`
- ✅ `lib/core/constants/app_constants.dart`

---

## 📱 KULLANICI TARAFINDA GÖRÜNÜM

### Premium Ekranı (Ayarlar → Premium)

```
╔═══════════════════════════════════════╗
║     💎 PREMIUM'A YÜKSELTİN            ║
╠═══════════════════════════════════════╣
║                                       ║
║  📦 AYLIK PAKET                       ║
║  ━━━━━━━━━━━━━━━━━                    ║
║  50₺ / ay                             ║
║  Aylık otomatik yenilenir             ║
║  Dilediğin zaman iptal et             ║
║  [ Satın Al ]                         ║
║                                       ║
║  ─────────────────────────────────    ║
║                                       ║
║  💎 ÖMÜR BOYU - ÖNERİLEN             ║
║  ━━━━━━━━━━━━━━━━━                    ║
║  399₺ (Tek ödeme)                     ║
║  Hiç ek ödeme yok                     ║
║  🎯 %88 TASARRUF!                     ║
║  [ Satın Al ]                         ║
║                                       ║
╠═══════════════════════════════════════╣
║  ✨ Premium ile:                      ║
║  ✓ Reklamsız deneyim                  ║
║  ✓ Tüm özel hesaplayıcılar            ║
║  ✓ Sınırsız AI özellikleri            ║
║  ✓ Sınırsız geçmiş kayıtları          ║
║  ✓ Premium temalar                    ║
║  ✓ Öncelikli destek                   ║
╚═══════════════════════════════════════╝
```

---

## 💡 TASARRUF HESAPLAMA

### Aylık vs Ömür Boyu Karşılaştırma

**Aylık Paket (50₺/ay):**
- 1 ay: 50₺
- 3 ay: 150₺
- 6 ay: 300₺
- **8 ay: 400₺** ⬅️ Ömür boyundan daha pahalı!
- 12 ay: 600₺
- 24 ay: 1.200₺

**Ömür Boyu Paket (399₺):**
- Tek ödeme: 399₺
- Sonsuza kadar geçerli
- **8 aydan sonra kâr!**

**Tasarruf Yüzdesi:**
```
1 yıl için: (600₺ - 399₺) / 600₺ = %33 tasarruf
2 yıl için: (1200₺ - 399₺) / 1200₺ = %67 tasarruf
5 yıl için: (3000₺ - 399₺) / 3000₺ = %87 tasarruf
```

---

## 🎯 PAZARLAMA STRATEJİSİ

### 1. Ömür Boyu Paketi Öne Çıkarma

**Kullanıcı Arayüzünde:**
- ✅ "ÖNERİLEN" badge ekleyin
- ✅ Daha büyük buton
- ✅ Parlayan animasyon
- ✅ "%88 TASARRUF" etiketi

**Kod örneği:**
```dart
Container(
  decoration: BoxDecoration(
    border: Border.all(color: Colors.amber, width: 3),
    borderRadius: BorderRadius.circular(12),
    gradient: LinearGradient(
      colors: [Colors.purple, Colors.blue],
    ),
  ),
  child: Column(
    children: [
      Row(
        children: [
          Icon(Icons.star, color: Colors.amber),
          Text("ÖNERİLEN", style: TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
      Text("ÖMÜR BOYU PREMIUM", style: TextStyle(fontSize: 20)),
      Text("399₺", style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
      Text("Tek ödeme - Sonsuza kadar"),
      Container(
        color: Colors.red,
        child: Text("%88 TASARRUF!", style: TextStyle(color: Colors.white)),
      ),
      ElevatedButton(onPressed: () => buyLifetime(), child: Text("SATIN AL")),
    ],
  ),
)
```

---

### 2. Ücretsiz Deneme (Aylık İçin)

**7 günlük ücretsiz deneme:**
- Kullanıcı ilk 7 gün ücretsiz kullanır
- 7. gün sonunda otomatik ücretlendirilir
- İptal ederse ücret alınmaz

**Avantajları:**
- ✅ Conversion rate artışı (%15-30)
- ✅ Kullanıcı uygulamayı dener
- ✅ Bağlılık artar

**Play Console'da Ayarlama:**
```
Subscription → Base plan → Offers
- Add offer
- Offer type: Free trial
- Duration: 7 days
- Eligibility: New customers only
```

---

### 3. İndirim Kampanyaları (Seasonal)

**Özel günlerde indirim:**
- 🎉 Yeni yıl: %20 indirim
- 🎓 Okul açılışı: %15 indirim
- 🛍️ Black Friday: %30 indirim
- ❤️ Sevgililer günü: %10 indirim

**Play Console'da Ayarlama:**
```
Subscription → Offers → Create offer
- Offer type: Introductory price
- Price: 39.99 TRY (örn. %20 indirim)
- Duration: 1 month
- Eligibility: New customers
```

---

## 📊 BEKLENTİLER & TAHMİNLER

### Gelir Projeksiyonu (İlk 6 ay)

**Senaryo: Günlük 100 indirme**

**Ay 1:**
- Toplam indirme: 3.000
- Premium satış oranı: %2 (60 kullanıcı)
- Aylık alan: 40 kişi × 50₺ = 2.000₺
- Ömür boyu alan: 20 kişi × 399₺ = 7.980₺
- **Toplam:** 9.980₺
- Google Pay kesintisi (15%): -1.497₺
- **Net:** 8.483₺

**Ay 3:**
- Toplam kullanıcı: 10.000
- Aktif premium: 180 kişi
- Aylık: 120 × 50₺ = 6.000₺
- Ömür boyu (yeni): 10 × 399₺ = 3.990₺
- **Toplam:** 9.990₺
- Google Pay kesintisi: -1.498₺
- **Net:** 8.492₺/ay

**Ay 6:**
- Toplam kullanıcı: 20.000
- Aktif premium: 350 kişi
- Aylık: 250 × 50₺ = 12.500₺
- Ömür boyu (yeni): 5 × 399₺ = 1.995₺
- **Toplam:** 14.495₺
- Google Pay kesintisi: -2.174₺
- **Net:** 12.321₺/ay

**İlk 6 ay toplam tahmini net gelir:** ~60.000₺

---

### AdMob Reklam Geliri (Ücretsiz Kullanıcılar)

**Senaryo: Günlük 100 indirme, %98 ücretsiz kullanıcı**

**Banner Ads:**
- Günlük gösterim: 980 kullanıcı × 10 gösterim = 9.800 gösterim
- CPM (Türkiye): ~0.5$ (yaklaşık 17₺)
- Günlük gelir: (9.800 / 1000) × 17₺ = **166₺/gün**
- Aylık gelir: 166₺ × 30 = **4.980₺/ay**

**Toplam Gelir (Premium + AdMob):**
- Ay 1: 8.483₺ + 4.980₺ = **13.463₺**
- Ay 3: 8.492₺ + 4.980₺ = **13.472₺**
- Ay 6: 12.321₺ + 4.980₺ = **17.301₺**

---

## 🛠️ TEKNİK DETAYLAR

### Kod Tarafında Kontrol

**Aylık abonelik kontrolü:**
```dart
// lib/controllers/premium_controller.dart
Future<bool> isMonthlyActive() async {
  final purchases = await IAPService().getPurchases();
  final monthly = purchases.firstWhere(
    (p) => p.productID == 'ai_calculator_monthly_premium',
    orElse: () => null,
  );
  
  if (monthly != null) {
    // Abonelik aktif mi kontrol et
    final expiryDate = DateTime.parse(monthly.transactionDate)
        .add(Duration(days: 30));
    return DateTime.now().isBefore(expiryDate);
  }
  return false;
}
```

**Ömür boyu satın alma kontrolü:**
```dart
Future<bool> isLifetimeActive() async {
  final purchases = await IAPService().getPurchases();
  final lifetime = purchases.firstWhere(
    (p) => p.productID == 'ai_calculator_lifetime_premium',
    orElse: () => null,
  );
  return lifetime != null; // Bir kere satın alındıysa hep aktif
}
```

**Premium durumu kontrolü:**
```dart
Future<bool> isPremiumActive() async {
  return await isMonthlyActive() || await isLifetimeActive();
}
```

---

## 🎁 EK ÖNERİLER

### 1. Rewarded Ads (Ödüllü Reklam)

**Konsept:** Kullanıcı reklam izlerse 1 günlük premium kazanır.

**Uygulama:**
```dart
// Rewarded ad izlenince
Future<void> onRewardedAdWatched() async {
  final expiryDate = DateTime.now().add(Duration(days: 1));
  await StorageService.setTemporaryPremium(expiryDate);
  showSnackbar("🎉 1 gün premium kazandınız!");
}
```

**Play Console gerekli mi?** Hayır, bu kodu zaten uygulayabilirsiniz.

---

### 2. Referral Program (Arkadaşını Getir)

**Konsept:** Kullanıcı 5 arkadaş davet ederse 1 ay premium bedava.

**Uygulama:**
```dart
String get referralCode => user.uid.substring(0, 6).toUpperCase();

Future<void> onReferralSuccess() async {
  referralCount++;
  if (referralCount >= 5) {
    await grantPremium(duration: Duration(days: 30));
    referralCount = 0;
  }
}
```

---

### 3. Upgrade Flow (Aylıktan Ömür Boyuna Geçiş)

**Konsept:** Aylık kullanan kullanıcıya "Ömür boyuna geçip tasarruf et" önerisi.

**Uygulama:**
```dart
Future<void> showUpgradeOffer() async {
  if (await isMonthlyActive()) {
    // Modal göster
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text("💎 Ömür Boyuna Geçin!"),
        content: Text("Sadece 349₺ daha ödeyerek ömür boyu premium sahibi olun!"),
        actions: [
          TextButton(
            onPressed: () => upgradeToLifetime(),
            child: Text("GEÇİŞ YAP"),
          ),
        ],
      ),
    );
  }
}

Future<void> upgradeToLifetime() async {
  // Kullanıcının ödediği toplam tutarı hesapla
  // Kalan kısmı ödet
  final remainingAmount = 399.00 - (monthsSubscribed * 50.00);
  // ... satın alma işlemi
}
```

**Play Console ayarı:**
- "Prorated" veya "Immediate charge" seçeneği

---

## 📞 DESTEK

**Sorularınız için:**
- E-posta: ozkanqbyte@gmail.com
- Play Console: Support → Contact us

---

## ✅ ÖZET CHECKLIST

```
☐ Play Console → Monetize → In-app products açıldı
☐ Aylık abonelik oluşturuldu (ai_calculator_monthly_premium)
☐ Fiyat 50₺ olarak ayarlandı
☐ Ömür boyu paket oluşturuldu (ai_calculator_lifetime_premium)
☐ Fiyat 399₺ olarak ayarlandı
☐ Yıllık paket deactivate edildi (varsa)
☐ Kodda fiyatlar güncellendi (app_constants.dart)
☐ IAP Service güncel ürünleri kullanıyor
☐ Premium Controller iki paketi destekliyor
☐ UI'da ömür boyu paket "Önerilen" olarak işaretli
☐ Test edildi (sandbox mode)
☐ Production'a gönderildi
```

---

**🚀 Başarılar! İyi satışlar!**

---

© 2024 QByte Development - Premium Pricing v2.1