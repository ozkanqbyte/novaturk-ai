/**
 * NovaTürk AI - Sponsorlu İşletmeler & Gelir Ekosistemi Servisi
 * Model 1: Aramada TEK ve NET 1. Sıra Doğrulanmış Sponsorlu Link
 * Model 2: AI Fırsat Avcısı & Canlı Kupon Kalkanı
 * Model 3: Ana Ekran Prestij Vitrini
 *
 * 🛡️ KESİN KURAL:
 * - Bilgi aramalarında (Dolar, Deprem, Atatürk, Hava Durumu, Nedir, Ne zaman vb.): ASLA REKLAM ÇIKMAZ (0 REKLAM)!
 * - SADECE ticari/hizmet arayan kullanıcıya (Uçak bileti, çilingir, diş hekimi vb.): EN FAZLA 1 TANE DOĞRULANMIŞ LİNK ÇIKAR!
 */

// 🛡️ BİLGİ VE GENEL KÜLTÜR ARAMALARI (KESİNLİKLE REKLAM ÇIKAMAZ LİSTESİ)
const STRICT_INFORMATIONAL_TRIGGERS = [
  'nedir', 'kimdir', 'nerede', 'nerededir', 'ne zaman', 'nasıl yapılır', 'tarihçesi', 
  'biyografisi', 'anlamı', 'tanımı', 'kaç yılında', 'şiiri', 'şarkı sözü', 'özeti', 
  'neden', 'niçin', 'formülü', 'hava durumu', 'namaz vakti', 'dolar', 'euro', 'altın', 
  'borsa', 'deprem', 'son dakika', 'haber', 'haberleri', 'türkiye', 'atatürk', 
  'cumhurbaşkanı', 'maç sonucu', 'puan durumu', 'vikipedi', 'tercüme', 'çeviri',
  'saat kaç', 'tarih', 'biyoloji', 'fizik', 'kimya', 'matematik', 'türkçe'
];

// 💎 DOĞRULANMIŞ YERLİ SPONSORLU İŞLETMELER VERİTABANI (Sadece 1. Sıra İçin)
export const SPONSORED_ADS_DATABASE = [
  {
    id: 'ad_bilet',
    keywords: ['uçak bileti', 'ucuz bilet', 'bilet al', 'uçuş ara', 'pegasus bilet', 'thy bilet', 'anadolujet bilet', 'uçak seferleri', 'ucuz uçuş'],
    title: 'Enuygun - Tüm Uçak Biletlerinde Ekstra 150 TL İndirim',
    domain: 'enuygun.com',
    url: 'https://www.enuygun.com/ucak-bileti/',
    snippet: 'Yurt içi ve yurt dışı 1000+ hava yolunun biletlerini tek ekranda karşılaştırın. NovaTürk kullanıcılarına özel 150 TL anında indirim kodu sepette geçerlidir.',
    phone: '0850 333 88 88',
    whatsapp: '908503338888',
    badge: '💎 NovaTürk Doğrulanmış Partner',
    discountCode: 'NOVATURK150',
    discountText: '150 TL Anında İndirim',
    rating: 4.9,
    reviewsCount: 14200,
    category: 'Ulaşım & Bilet'
  },
  {
    id: 'ad_otel',
    keywords: ['otel rezervasyon', 'tatil rezervasyon', 'butik otel', 'pansiyon rezervasyon', 'antalya otel', 'bodrum otel', 'bungalov kirala', 'erken rezervasyon'],
    title: 'Tatilbudur - Erken Rezervasyonda %50 İndirim + İptal Güvencesi',
    domain: 'tatilbudur.com',
    url: 'https://www.tatilbudur.com',
    snippet: 'Türkiye genelinde 5.000+ otelde 12 aya varan taksit ve koşulsuz iptal hakkı. Yerli ve güvenli turizm kalkanıyla en uygun fiyat garantisi.',
    phone: '0850 333 33 33',
    whatsapp: '908503333333',
    badge: '💎 NovaTürk Doğrulanmış Partner',
    discountCode: 'NOVATATIL',
    discountText: '%10 Ekstra Tatil İndirimi',
    rating: 4.8,
    reviewsCount: 9850,
    category: 'Otel & Konaklama'
  },
  {
    id: 'ad_cilingir',
    keywords: ['çilingir', 'kilit tamiri', 'anahtarcı', 'kapı açma', 'oto anahtar', 'kale kilit', 'acil çilingir', 'kadıköy çilingir', 'şişli çilingir', 'çilingir çağır'],
    title: '7/24 Garantili Acil Çilingir & Kilit Değişimi - 15 Dakikada Adresinizde',
    domain: 'istanbulcilingirservisi.com',
    url: 'https://istanbulcilingirservisi.com',
    snippet: 'İstanbul genelinde 39 ilçede 15 dakikada motorlu servis. Hasarsız kapı açma, çelik kapı kilit değişimi ve oto anahtar tamiri. Sabit fiyat garantili.',
    phone: '0532 700 00 00',
    whatsapp: '905327000000',
    badge: '💎 Doğrulanmış Yerel Esnaf',
    discountCode: 'NOVA20',
    discountText: '%20 Esnaf İndirimi',
    rating: 5.0,
    reviewsCount: 680,
    category: 'Acil Esnaf Hizmeti'
  },
  {
    id: 'ad_dis',
    keywords: ['diş hekimi', 'implant fiyatları', 'diş kliniği', 'zirkonyum diş', 'diş beyazlatma', 'ortodonti', 'diş hekimi randevu', 'diş teli'],
    title: 'NovaDent Ağız ve Diş Sağlığı Merkezi - Ücretsiz İlk Muayene ve Röntgen',
    domain: 'novadentklinik.com',
    url: 'https://novadentklinik.com',
    snippet: 'Uzman hekim kadrosuyla ağrısız implant, estetik gülüş tasarımı ve zirkonyum kaplama. NovaTürk referansıyla gelen hastalara panoramik film ve muayene ücretsiz.',
    phone: '0212 444 00 00',
    whatsapp: '902124440000',
    badge: '💎 Doğrulanmış Sağlık Kuruluşu',
    discountCode: 'NOVADIS',
    discountText: 'Ücretsiz Röntgen & Muayene',
    rating: 4.9,
    reviewsCount: 1240,
    category: 'Sağlık & Medikal'
  },
  {
    id: 'ad_arac',
    keywords: ['araç kiralama', 'rent a car', 'araba kiralama', 'günlük araç kiralama', 'filo kiralama', 'havalimanı oto kiralama', 'ucuz araç kirala'],
    title: 'Yolcu360 - Tüm Rent A Car Firmaları Tek Ekranda En İyi Fiyat Garantisiyle',
    domain: 'yolcu360.com',
    url: 'https://yolcu360.com',
    snippet: 'Avis, Budget, Enterprise ve yerel güvenilir acenteleri tek tıkla kıyaslayın. Koşulsuz para iadeli ücretsiz iptal ve NovaTürk özel indirimi.',
    phone: '0850 360 5 360',
    whatsapp: '908503605360',
    badge: '💎 NovaTürk Doğrulanmış Partner',
    discountCode: 'NOVAYOLCU',
    discountText: '200 TL Anında İndirim',
    rating: 4.8,
    reviewsCount: 21500,
    category: 'Otomotiv & Ulaşım'
  },
  {
    id: 'ad_kombi',
    keywords: ['kombi servisi', 'klima servisi', 'kombi tamiri', 'klima montaj', 'petek temizliği', 'kombi arıza', 'vaillant servisi', 'demirdöküm servisi'],
    title: 'Garantili Kombi & Klima Teknik Servisi - Aynı Gün Yerinde Onarım',
    domain: 'teknikserviskombi.com',
    url: 'https://teknikserviskombi.com',
    snippet: '1 Yıl garantili orijinal yedek parça, şeffaf sabit işçilik ücreti ve 2 saat içinde adrese servis. NovaTürk referansıyla %15 işçilik indirimi.',
    phone: '0850 441 00 00',
    whatsapp: '908504410000',
    badge: '💎 Doğrulanmış Yerel Servis',
    discountCode: 'NOVASERVIS',
    discountText: '%15 İşçilik İndirimi',
    rating: 4.9,
    reviewsCount: 840,
    category: 'Teknik Servis'
  },
  {
    id: 'ad_nakliyat',
    keywords: ['evden eve nakliyat', 'nakliyat firması', 'şehirlerarası nakliyat', 'asansörlü nakliyat', 'eşya taşıma', 'nakliye fiyatları'],
    title: 'Sigortalı Evden Eve Nakliyat & Asansörlü Taşımacılık - Sıfır Hasar Garantisi',
    domain: 'guvenlinakliyat.com.tr',
    url: 'https://guvenlinakliyat.com.tr',
    snippet: 'Sözleşmeli ve tam kapsamlı sigortalı profesyonel taşımacılık. Ücretsiz ekspertiz, demonte ve montaj dahil sabit fiyat güvencesi.',
    phone: '0216 550 00 00',
    whatsapp: '902165500000',
    badge: '💎 Doğrulanmış Taşımacılık',
    discountCode: 'NOVATASI',
    discountText: '%10 Paketleme İndirimi',
    rating: 4.8,
    reviewsCount: 520,
    category: 'Taşımacılık & Lojistik'
  },
  {
    id: 'ad_avukat',
    keywords: ['avukat', 'hukuk bürosu', 'boşanma avukatı', 'ceza avukatı', 'iş hukuku avukatı', 'tazminat avukatı', 'icra avukatı'],
    title: 'Uzman Hukuk & Danışmanlık Bürosu - Hızlı Hukuki Çözüm ve Danışmanlık',
    domain: 'uzmanhukuk.av.tr',
    url: 'https://uzmanhukuk.av.tr',
    snippet: 'Ticaret, iş hukuku, gayrimenkul ve ceza davalarında tecrübeli avukat kadrosu. Şeffaf ve gizlilik ilkelerine %100 bağlı kurumsal danışmanlık.',
    phone: '0212 280 00 00',
    whatsapp: '902122800000',
    badge: '💎 Doğrulanmış Hukuk Danışmanlığı',
    discountCode: 'NOVAHUKUK',
    discountText: 'Ön Değerlendirme Randevusu',
    rating: 4.9,
    reviewsCount: 310,
    category: 'Hukuk & Danışmanlık'
  },
  {
    id: 'ad_eticaret',
    keywords: ['ayakkabı satın al', 'spor ayakkabı fiyatları', 'elbise satın al', 'telefon satın al', 'laptop fiyatları', 'indirimli alışveriş', 'trendyol indirim'],
    title: 'Trendyol Süper İndirim Günleri - Milyonlarca Üründe Sepette %50 İndirim',
    domain: 'trendyol.com',
    url: 'https://www.trendyol.com',
    snippet: 'Elektronikten modaya, ev yaşamdan kozmetiğe Türkiye\'nin 1 numaralı pazaryeri. Hızlı kargo, kolay iade ve NovaTürk\'e özel kupon avantajı.',
    phone: '0212 331 0 200',
    whatsapp: '902123310200',
    badge: '💎 NovaTürk Doğrulanmış Partner',
    discountCode: 'NOVA100',
    discountText: '1000 TL Üzeri 100 TL İndirim',
    rating: 4.9,
    reviewsCount: 89000,
    category: 'Alışveriş & Moda'
  },
  {
    id: 'ad_yemek',
    keywords: ['pizza sipariş', 'yemek siparişi', 'online yemek', 'döner sipariş', 'burger sipariş', 'tatlı siparişi', 'yemeksepeti kupon'],
    title: 'Yemeksepeti - Mahallenin En İyi Restoranları İlk Siparişe 120 TL İndirimle',
    domain: 'yemeksepeti.com',
    url: 'https://www.yemeksepeti.com',
    snippet: 'Sıcak ve taptaze lezzetler kapınızda. Mahalle kasabından lüks burgercilere kadar 50.000+ restoran. NovaTürk koduyla anında 120 TL cepte.',
    phone: '0212 359 10 00',
    whatsapp: '902123591000',
    badge: '💎 NovaTürk Doğrulanmış Partner',
    discountCode: 'NOVAYEMEK',
    discountText: '120 TL Hoş Geldin İndirimi',
    rating: 4.8,
    reviewsCount: 65000,
    category: 'Yiyecek & Sipariş'
  }
];

// Model 3: Ana Ekran Prestij Vitrini Partnerleri
export const SHOWCASE_PARTNERS = [
  {
    id: 'sc_trendyol',
    name: 'Trendyol',
    domain: 'trendyol.com',
    url: 'https://www.trendyol.com',
    badge: '⚡ Süper Fırsatlar',
    tag: '%50\'ye Varan',
    color: '#f97316',
    desc: 'Moda & Elektronik Dev Fırsatlar'
  },
  {
    id: 'sc_enuygun',
    name: 'Enuygun',
    domain: 'enuygun.com',
    url: 'https://www.enuygun.com',
    badge: '✈️ Uçak Bileti',
    tag: '150 TL İndirim',
    color: '#0284c7',
    desc: 'Tüm Hava Yolları Tek Ekranda'
  },
  {
    id: 'sc_yemeksepeti',
    name: 'Yemeksepeti',
    domain: 'yemeksepeti.com',
    url: 'https://www.yemeksepeti.com',
    badge: '🍔 Lezzet',
    tag: '120 TL Kupon',
    color: '#e11d48',
    desc: 'İlk Siparişte Dev Avantaj'
  },
  {
    id: 'sc_hepsiburada',
    name: 'Hepsiburada',
    domain: 'hepsiburada.com',
    url: 'https://www.hepsiburada.com',
    badge: '📦 Süper Hızlı',
    tag: 'Yarın Kapında',
    color: '#ea580c',
    desc: 'Orijinal Ürün & Güvenli Teslimat'
  },
  {
    id: 'sc_getir',
    name: 'Getir',
    domain: 'getir.com',
    url: 'https://getir.com',
    badge: '⚡ 10 Dakikada',
    tag: 'Bedava Teslimat',
    color: '#5b21b6',
    desc: 'Market & Sıcak Yemek Kapında'
  },
  {
    id: 'sc_sahibinden',
    name: 'Sahibinden',
    domain: 'sahibinden.com',
    url: 'https://www.sahibinden.com',
    badge: '🏠 Yerli İlan',
    tag: 'Milyonlarca İlan',
    color: '#eab308',
    desc: 'Emlak, Vasıta ve Alışveriş'
  }
];

// Model 2: AI Fırsat Avcısı Kupon Havuzu
export const DEAL_HUNTER_COUPONS = [
  {
    code: 'NOVATURK15',
    title: 'NovaTürk Özel %15 Sepet İndirimi',
    discount: '%15 İndirim',
    store: 'Tüm Anlaşmalı Yerli Mağazalar',
    expires: 'Kalan Süre: 2 Gün',
    verified: true
  },
  {
    code: 'NOVATURK150',
    title: 'Enuygun Uçak Biletinde 150 TL Nakit İndirim',
    discount: '150 TL',
    store: 'enuygun.com',
    expires: 'Aktif Kupon',
    verified: true
  },
  {
    code: 'NOVA100',
    title: 'Trendyol 1000 TL ve Üzeri 100 TL İndirim',
    discount: '100 TL',
    store: 'trendyol.com',
    expires: 'Bugün Geçerli',
    verified: true
  },
  {
    code: 'NOVAYEMEK',
    title: 'Yemeksepeti İlk Siparişte 120 TL Fırsatı',
    discount: '120 TL',
    store: 'yemeksepeti.com',
    expires: 'İlk Sipariş',
    verified: true
  }
];

/**
 * 🛡️ AKILLI TİCARİ NİYET DENETLEYİCİSİ (Commercial Intent Classifier)
 * 
 * SADECE satın alma, hizmet veya kiralama arayan kullanıcılara EN FAZLA 1 TANE sponsorlu link verir.
 * Bilgi aramalarında (Atatürk, Dolar, Deprem, Nedir, Ne zaman vb.) KESİNLİKLE NULL (0 REKLAM) DÖNER!
 */
export function getSponsoredAd(query) {
  if (!query) return null;
  const q = query.toLowerCase().trim();

  // 1. Bilgi / Soru / Genel Kültür Sorgusu Denetimi
  // Eğer sorgu bilgi arayışı içeriyorsa ve spesifik bir satın alma eylemi ("satın al", "fiyatı", "kiralık", "çilingir") yoksa REKLAM GÖSTERME!
  const hasInformationalTrigger = STRICT_INFORMATIONAL_TRIGGERS.some(trigger => {
    // Kelime sınırı ile eşleşme (örneğin "ne zaman" veya "dolar")
    return q.includes(trigger);
  });

  const hasExplicitBuyAction = ['satın al', 'fiyatı', 'fiyatları', 'kiralama', 'çilingir', 'servisi', 'randevu', 'bilet al', 'sipariş'].some(action => q.includes(action));

  if (hasInformationalTrigger && !hasExplicitBuyAction) {
    // 🛑 KULLANICI BİLGİ ARIYOR -> KESİNLİKLE SIFIR REKLAM!
    return null;
  }

  // 2. Doğrulanmış Ticari Hizmet / Ürün Eşleşmesi (ASLA 1'DEN FAZLA OLMAZ)
  for (const ad of SPONSORED_ADS_DATABASE) {
    const isDirectMatch = ad.keywords.some(kw => q.includes(kw) || kw.includes(q));
    if (isDirectMatch) {
      // ✅ Tam hedefli, doğrulanmış TEK partneri döndür
      return { ...ad, isTargeted: true };
    }
  }

  // 3. Eşleşme yoksa KESİNLİKLE RASTGELE REKLAM ÇIKMAZ!
  // Kullanıcıyı rahatsız etmemek için NULL dönülür.
  return null;
}

/**
 * Reklam Tıklamalarını Takip Et (Simüle edilmiş Analitik / Faturalandırma)
 */
export function trackAdClick(adId, adTitle) {
  try {
    const clicks = JSON.parse(localStorage.getItem('novaturk_ad_clicks') || '[]');
    clicks.push({
      adId,
      adTitle,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('novaturk_ad_clicks', JSON.stringify(clicks.slice(-100)));
  } catch {}
}

/**
 * Yeni İşletme Başvurusu Kaydet
 */
export function submitBusinessAdRequest(formData) {
  try {
    const requests = JSON.parse(localStorage.getItem('novaturk_business_requests') || '[]');
    const newReq = {
      ...formData,
      id: 'req_' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    requests.push(newReq);
    localStorage.setItem('novaturk_business_requests', JSON.stringify(requests));
    return { success: true, id: newReq.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
