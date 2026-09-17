/**
 * NovaTürk AI - Doğrudan Navigasyon & Resmi Platform Tanıma Motoru
 * Kullanıcı "ChatGPT", "YouTube", "GitHub", "e-Devlet" gibi bir platform aradığında
 * Google gibi resmi ana sayfayı doğrudan en başa (#1) çiviler.
 */

const OFFICIAL_PLATFORMS = [
  // 🤖 Yapay Zeka Platformları
  {
    keywords: ['chatgpt', 'chat gpt', 'openai chat', 'gpt4', 'gpt', 'chatgpt com', 'chat.openai'],
    name: 'ChatGPT (OpenAI)',
    domain: 'chatgpt.com',
    url: 'https://chatgpt.com',
    title: 'ChatGPT — OpenAI Resmi Yapay Zeka Platformu',
    description: 'OpenAI tarafından geliştirilen gelişmiş yapay zeka sohbet robotu. Doğal dilde soru sorun, kod yazdırın, metin oluşturun ve analiz yapın.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['claude', 'anthropic', 'claude ai', 'claude 3'],
    name: 'Claude AI (Anthropic)',
    domain: 'claude.ai',
    url: 'https://claude.ai',
    title: 'Claude AI — Anthropic Yeni Nesil Yapay Zeka',
    description: 'Anthropic tarafından geliştirilen güvenli, akıllı ve gelişmiş bağlam pencereli yapay zeka asistanı.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['deepseek', 'deep seek', 'deepseek r1', 'deepseek ai'],
    name: 'DeepSeek AI',
    domain: 'chat.deepseek.com',
    url: 'https://chat.deepseek.com',
    title: 'DeepSeek — Açık & Güçlü Muhakeme Yapay Zekası',
    description: 'DeepSeek-R1 ve DeepSeek-V3 modelleriyle ücretsiz ve yüksek akıl yürütme yeteneğine sahip küresel yapay zeka.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['gemini', 'google gemini', 'bard', 'google ai'],
    name: 'Google Gemini',
    domain: 'gemini.google.com',
    url: 'https://gemini.google.com',
    title: 'Google Gemini — Çok Modlu Yapay Zeka Asistanı',
    description: 'Google’ın en yetenekli yapay zeka modeli. Görselleri, kodları, metinleri analiz edin ve Google ekosistemiyle entegre çalışın.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['perplexity', 'perplexity ai'],
    name: 'Perplexity AI',
    domain: 'perplexity.ai',
    url: 'https://www.perplexity.ai',
    title: 'Perplexity AI — İnteraktif Yapay Zeka Arama Motoru',
    description: 'Canlı internet kaynaklarını tarayarak alıntılı ve doğrulanmış yapay zeka cevapları sunan arama platformu.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['midjourney', 'mid journey'],
    name: 'Midjourney',
    domain: 'midjourney.com',
    url: 'https://www.midjourney.com',
    title: 'Midjourney — Üretken Yapay Zeka Görsel Sanat Platformu',
    description: 'Metin açıklamalarından hiper-gerçekçi ve sanatsal görseller üreten dünyanın lider yapay zeka görsel motoru.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['huggingface', 'hugging face'],
    name: 'Hugging Face',
    domain: 'huggingface.co',
    url: 'https://huggingface.co',
    title: 'Hugging Face — Yapay Zeka Topluluğu ve Model Havuzu',
    description: 'Açık kaynak makine öğrenimi modelleri, veri kümeleri ve Spaces uygulamalarının küresel merkezi.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },

  // 🌐 Küresel Devler ve Araçlar
  {
    keywords: ['youtube', 'yt', 'you tube'],
    name: 'YouTube',
    domain: 'youtube.com',
    url: 'https://www.youtube.com',
    title: 'YouTube — Dünyanın En Büyük Video Paylaşım Platformu',
    description: 'Milyonlarca video, canlı yayın, müzik ve eğitim içeriğini keşfedin.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['github', 'git hub'],
    name: 'GitHub',
    domain: 'github.com',
    url: 'https://github.com',
    title: 'GitHub — Açık Kaynak Yazılım & Kod Deposu',
    description: '100 milyondan fazla geliştiricinin yazılım geliştirdiği, paylaştığı ve işbirliği yaptığı küresel kod platformu.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['netflix', 'net flix'],
    name: 'Netflix',
    domain: 'netflix.com',
    url: 'https://www.netflix.com',
    title: 'Netflix Türkiye — Dizi, Film ve Belgesel İzle',
    description: 'Ödüllü diziler, filmler, animeler, belgeseller ve çok daha fazlası.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['spotify', 'spoti'],
    name: 'Spotify',
    domain: 'spotify.com',
    url: 'https://open.spotify.com',
    title: 'Spotify — Milyonlarca Şarkı ve Podcast',
    description: 'Dünyanın her yerinden müzik ve podcast dinleyin, kendi çalma listelerinizi oluşturun.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['twitter', 'x', 'x.com', 'tweet'],
    name: 'X (Eski Twitter)',
    domain: 'x.com',
    url: 'https://x.com',
    title: 'X — Dünyada Olup Bitenler ve Gündem',
    description: 'Canlı haberler, küresel tartışmalar, spor, siyaset ve eğlence konularındaki en sıcak paylaşımlar.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['instagram', 'insta', 'ig'],
    name: 'Instagram',
    domain: 'instagram.com',
    url: 'https://www.instagram.com',
    title: 'Instagram — Fotoğraf, Reels ve Hikayeler',
    description: 'Arkadaşlarınızla bağlantı kurun, neler yaptığınızı paylaşın ve dünyayı keşfedin.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['reddit'],
    name: 'Reddit',
    domain: 'reddit.com',
    url: 'https://www.reddit.com',
    title: 'Reddit — İnternetin Ön Sayfası ve Topluluklar',
    description: 'İlgi duyduğunuz her konuda topluluklara katılın, tartışmalara dahil olun ve içerik oylayın.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['wikipedia', 'vikipedi'],
    name: 'Vikipedi',
    domain: 'tr.wikipedia.org',
    url: 'https://tr.wikipedia.org',
    title: 'Vikipedi — Özgür Ansiklopedi',
    description: 'Herkesin katkıda bulunabildiği dünyanın en büyük çok dilli açık ansiklopedisi.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['canva'],
    name: 'Canva',
    domain: 'canva.com',
    url: 'https://www.canva.com',
    title: 'Canva — Ücretsiz Çevrimiçi Görsel Tasarım Aracı',
    description: 'Sosyal medya gönderileri, sunumlar, posterler ve videolar tasarlayın.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['figma'],
    name: 'Figma',
    domain: 'figma.com',
    url: 'https://www.figma.com',
    title: 'Figma — İşbirlikçi Arayüz Tasarım Platformu',
    description: 'Ekiplerin birlikte UI/UX tasarımı yapmasını sağlayan lider tasarım aracı.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['discord'],
    name: 'Discord',
    domain: 'discord.com',
    url: 'https://discord.com',
    title: 'Discord — Topluluk Sohbet ve Sesli İletişim',
    description: 'Sesli, görüntülü ve yazılı iletişim kurabileceğiniz topluluk platformu.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },

  // 🇹🇷 Türkiye Resmi Hizmetler & Dev Portallar
  {
    keywords: ['edevlet', 'e-devlet', 'turkiye gov tr', 'e devlet'],
    name: 'e-Devlet Kapısı',
    domain: 'turkiye.gov.tr',
    url: 'https://www.turkiye.gov.tr',
    title: 'e-Devlet Kapısı — Türkiye Cumhuriyeti Dijital Hizmetleri',
    description: 'Kamu kurum ve kuruluşlarının sunduğu hizmetlere tek noktadan, hızlı ve güvenli erişim portalı.',
    badge: '🏛️ T.C. Resmi Portalı',
    cleanBadge: '⚡ Doğrudan Kamu Girişi'
  },
  {
    keywords: ['osym', 'ösym', 'ais osym'],
    name: 'ÖSYM',
    domain: 'osym.gov.tr',
    url: 'https://ais.osym.gov.tr',
    title: 'ÖSYM Aday İşlemleri Sistemi (AİS)',
    description: 'YKS, KPSS, ALES, DGS sınav başvuruları ve sonuç sorgulama ekranı.',
    badge: '🏛️ Resmi Sınav Portalı',
    cleanBadge: '⚡ Doğrudan Giriş'
  },
  {
    keywords: ['mhrs', 'hastane randevu', 'doktor randevu'],
    name: 'MHRS Hastane Randevu Sistemi',
    domain: 'mhrs.gov.tr',
    url: 'https://mhrs.gov.tr',
    title: 'MHRS — Merkezi Hekim Randevu Sistemi (T.C. Sağlık Bakanlığı)',
    description: 'T.C. Sağlık Bakanlığı hastaneleri ve aile hekimlerinden randevu alma sistemi.',
    badge: '🏥 T.C. Sağlık Bakanlığı',
    cleanBadge: '⚡ Doğrudan Randevu'
  },
  {
    keywords: ['trendyol'],
    name: 'Trendyol',
    domain: 'trendyol.com',
    url: 'https://www.trendyol.com',
    title: 'Trendyol — Türkiye’nin Lider E-Ticaret Platformu',
    description: 'Moda, elektronik, ev yaşam ve süpermarkette güvenli alışveriş.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['hepsiburada'],
    name: 'Hepsiburada',
    domain: 'hepsiburada.com',
    url: 'https://www.hepsiburada.com',
    title: 'Hepsiburada — Güvenli Alışveriş ve Hızlı Teslimat',
    description: 'Elektronikten süpermarkete aradığın her şey kapında.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['sahibinden'],
    name: 'Sahibinden',
    domain: 'sahibinden.com',
    url: 'https://www.sahibinden.com',
    title: 'sahibinden.com — Vasıta, Emlak ve İkinci El Alışveriş',
    description: 'Türkiye’nin en büyük ilan ve alışveriş platformu.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  },
  {
    keywords: ['eksisozluk', 'eksi sozluk', 'ekşi sözlük', 'ekşi'],
    name: 'Ekşi Sözlük',
    domain: 'eksisozluk.com',
    url: 'https://eksisozluk.com',
    title: 'Ekşi Sözlük — Kutsal Bilgi Kaynağı',
    description: 'Gündemdeki olaylar, fikirler ve eleştirilerin özgür tartışma platformu.',
    badge: '⭐ Resmi Web Sitesi',
    cleanBadge: '⚡ Doğrudan Giriş Kapısı'
  }
];

export function resolveNavigationalIntent(query) {
  if (!query || !query.trim()) return null;

  const normalized = query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ğüşıöç\s]/g, '')
    .replace(/\s+/g, ' ');

  for (const platform of OFFICIAL_PLATFORMS) {
    const isDirectMatch = platform.keywords.some(kw => {
      if (normalized === kw) return true;
      if (normalized.startsWith(kw + ' ') || normalized.endsWith(' ' + kw)) return true;
      return false;
    });

    if (isDirectMatch) {
      return {
        title: platform.title,
        snippet: platform.description,
        link: platform.url,
        displayLink: platform.domain,
        sourceName: `${platform.name} (Resmi Platform)`,
        badge: platform.badge,
        cleanBadge: platform.cleanBadge,
        timestamp: 'Doğrudan Kapı',
        isNavigationalTopHit: true
      };
    }
  }

  return null;
}
