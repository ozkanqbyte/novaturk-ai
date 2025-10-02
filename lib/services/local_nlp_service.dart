import 'package:string_similarity/string_similarity.dart';

/// 🧠 Local NLP Service - Offline Natural Language Processing
/// Matematik komutlarını anlar ve çevirir
class LocalNLPService {
  static final LocalNLPService _instance = LocalNLPService._internal();
  factory LocalNLPService() => _instance;
  LocalNLPService._internal();

  // Türkçe matematik komutları
  final Map<String, String> _mathCommands = {
    // Temel işlemler
    'artı': '+',
    'toplanı': '+',
    'ekle': '+',
    'toplam': '+',
    'eksi': '-',
    'çıkar': '-',
    'fark': '-',
    'çarpı': '*',
    'çarp': '*',
    'kere': '*',
    'defa': '*',
    'bölü': '/',
    'böl': '/',
    'üzeri': '^',
    'kuvveti': '^',
    'mod': '%',
    'kalan': '%',
    
    // Özel fonksiyonlar
    'karekök': 'sqrt',
    'kök': 'sqrt',
    'karekökü': 'sqrt',
    'sinüs': 'sin',
    'sin': 'sin',
    'kosinüs': 'cos',
    'cos': 'cos',
    'tanjant': 'tan',
    'tan': 'tan',
    'logaritma': 'log',
    'log': 'log',
    'doğal logaritma': 'ln',
    'ln': 'ln',
    'mutlak değer': 'abs',
    'mutlak': 'abs',
    'faktöriyel': '!',
    
    // Sabitler
    'pi': '3.14159265359',
    'euler': '2.71828182846',
    'e': '2.71828182846',
    
    // Sayılar (Türkçe)
    'sıfır': '0',
    'bir': '1',
    'iki': '2',
    'üç': '3',
    'dört': '4',
    'beş': '5',
    'altı': '6',
    'yedi': '7',
    'sekiz': '8',
    'dokuz': '9',
    'on': '10',
    'yüz': '100',
    'bin': '1000',
  };

  // Soru kalıpları
  final List<String> _questionPatterns = [
    'kaç',
    'hesapla',
    'bul',
    'sonuç',
    'eder',
    'yapar',
    'nedir',
  ];

  /// Doğal dil komutunu matematiksel ifadeye çevirir
  String parseCommand(String input) {
    String processed = input.toLowerCase().trim();
    
    // Soru kelimelerini temizle
    for (var pattern in _questionPatterns) {
      processed = processed.replaceAll(pattern, '');
    }
    
    // Türkçe komutları sembollere çevir
    _mathCommands.forEach((key, value) {
      processed = processed.replaceAll(key, value);
    });
    
    // Gereksiz karakterleri temizle
    processed = processed.replaceAll('?', '');
    processed = processed.replaceAll('!', '');
    processed = processed.replaceAll(',', '.');
    
    // Boşlukları temizle
    processed = processed.replaceAll(RegExp(r'\s+'), '');
    
    return processed;
  }

  /// Komutun matematik ifadesi olup olmadığını kontrol eder
  bool isMathCommand(String input) {
    String lower = input.toLowerCase();
    
    // Matematik operatörü içeriyor mu?
    if (RegExp(r'[+\-*/^%()]').hasMatch(input)) return true;
    
    // Türkçe matematik kelimesi içeriyor mu?
    for (var key in _mathCommands.keys) {
      if (lower.contains(key)) return true;
    }
    
    // Soru kalıbı içeriyor mu?
    for (var pattern in _questionPatterns) {
      if (lower.contains(pattern)) return true;
    }
    
    return false;
  }

  /// Komutun benzerlik skorunu hesaplar (Fuzzy matching)
  double getSimilarityScore(String input, String target) {
    return input.toLowerCase().similarityTo(target.toLowerCase());
  }

  /// En yakın komutu bulur
  String? findClosestCommand(String input) {
    String lower = input.toLowerCase();
    String? bestMatch;
    double bestScore = 0.0;
    
    for (var key in _mathCommands.keys) {
      double score = lower.similarityTo(key);
      if (score > bestScore && score > 0.7) {
        bestScore = score;
        bestMatch = key;
      }
    }
    
    return bestMatch;
  }

  /// Akıllı yanıt üretir
  String generateResponse(String result) {
    final responses = [
      'Sonuç: $result',
      'Cevap: $result',
      'Hesapladım! Sonuç: $result',
      '✓ Sonuç: $result',
      '🎯 Cevap: $result',
    ];
    
    return responses[DateTime.now().millisecond % responses.length];
  }

  /// Hata mesajı üretir
  String generateErrorMessage(String error) {
    final errorMessages = [
      'Üzgünüm, bu işlemi anlayamadım. Tekrar dener misin?',
      'Bu komutu çözemedim. Daha basit bir şekilde söyler misin?',
      'Hmm, bu biraz karmaşık. Başka türlü deneyebilir misin?',
      'Bu işlemi yapamadım. Farklı bir şekilde ifade edebilir misin?',
    ];
    
    return errorMessages[DateTime.now().millisecond % errorMessages.length];
  }
}