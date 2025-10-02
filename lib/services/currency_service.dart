import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';

/// 💱 GÜNCEL DÖVİZ KURU SERVİSİ
/// TCMB ve diğer kaynaklardan güncel döviz kurları

class CurrencyService extends ChangeNotifier {
  static final CurrencyService _instance = CurrencyService._internal();
  factory CurrencyService() => _instance;
  CurrencyService._internal();

  Map<String, double> _rates = {};
  DateTime? _lastUpdate;
  bool _isLoading = false;
  String? _error;

  Map<String, double> get rates => _rates;
  DateTime? get lastUpdate => _lastUpdate;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Varsayılan kurlar (API çalışmazsa)
  final Map<String, double> _defaultRates = {
    'USD': 32.50,
    'EUR': 35.20,
    'GBP': 41.30,
    'CHF': 37.80,
    'CAD': 24.10,
    'AUD': 21.50,
    'JPY': 0.22,
    'CNY': 4.50,
    'RUB': 0.35,
    'SAR': 8.65,
    'KWD': 105.80,
    'AED': 8.85,
    'QAR': 8.92,
    'BHD': 86.20,
    'OMR': 84.50,
    'SEK': 3.15,
    'NOK': 3.05,
    'DKK': 4.72,
    'PLN': 8.15,
    'TRY': 1.00, // Temel para birimi
  };

  /// Döviz kurlarını TCMB'den çek
  Future<void> fetchRates() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TCMB API (Ücretsiz, kayıt gerektirmez)
      final response = await http.get(
        Uri.parse('https://www.tcmb.gov.tr/kurlar/today.xml'),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        _rates = _parseTCMBXML(response.body);
        _lastUpdate = DateTime.now();
        _error = null;
      } else {
        throw Exception('TCMB API yanıt vermedi');
      }
    } catch (e) {
      debugPrint('⚠️ Döviz kuru çekilemedi, varsayılan kurlar kullanılıyor: $e');
      
      // Alternatif API dene
      try {
        await _fetchFromAlternativeAPI();
      } catch (e2) {
        debugPrint('⚠️ Alternatif API de başarısız: $e2');
        _rates = Map.from(_defaultRates);
        _error = 'İnternet bağlantısı yok, varsayılan kurlar kullanılıyor';
      }
    }

    _isLoading = false;
    notifyListeners();
  }

  /// TCMB XML'ini parse et
  Map<String, double> _parseTCMBXML(String xml) {
    Map<String, double> rates = {'TRY': 1.00};
    
    try {
      // Basit XML parsing (xml package kullanmadan)
      final currencyCodes = ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY', 
                            'CNY', 'RUB', 'SAR', 'KWD', 'AED', 'QAR', 'SEK', 
                            'NOK', 'DKK'];
      
      for (var code in currencyCodes) {
        // <Currency Code="USD"> ... <ForexSelling>32.5000</ForexSelling>
        final pattern = RegExp('<Currency Code="$code">.*?<ForexSelling>(.*?)</ForexSelling>', 
                              multiLine: true, dotAll: true);
        final match = pattern.firstMatch(xml);
        
        if (match != null) {
          final rateStr = match.group(1)?.replaceAll(',', '.');
          rates[code] = double.tryParse(rateStr ?? '0') ?? _defaultRates[code]!;
        } else {
          rates[code] = _defaultRates[code]!;
        }
      }
    } catch (e) {
      debugPrint('XML parsing hatası: $e');
      return Map.from(_defaultRates);
    }
    
    return rates;
  }

  /// Alternatif API (exchangerate-api.com - ücretsiz tier)
  Future<void> _fetchFromAlternativeAPI() async {
    final response = await http.get(
      Uri.parse('https://api.exchangerate-api.com/v4/latest/TRY'),
    ).timeout(const Duration(seconds: 10));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final ratesData = data['rates'] as Map<String, dynamic>;
      
      _rates = {};
      ratesData.forEach((key, value) {
        // Tersine çevir (TRY bazlı yapıyoruz)
        _rates[key] = 1.0 / (value as double);
      });
      
      _rates['TRY'] = 1.00;
      _lastUpdate = DateTime.now();
      _error = null;
    }
  }

  /// Para birimi dönüştür
  double convert({
    required double amount,
    required String from,
    required String to,
  }) {
    if (_rates.isEmpty) {
      _rates = Map.from(_defaultRates);
    }

    if (from == to) return amount;
    
    final fromRate = _rates[from] ?? _defaultRates[from] ?? 1.0;
    final toRate = _rates[to] ?? _defaultRates[to] ?? 1.0;
    
    // TRY üzerinden dönüştür
    final inTRY = amount * fromRate;
    return inTRY / toRate;
  }

  /// Kur bilgisini al
  double getRate(String currency) {
    if (_rates.isEmpty) {
      _rates = Map.from(_defaultRates);
    }
    return _rates[currency] ?? _defaultRates[currency] ?? 1.0;
  }

  /// Tüm kurları göster
  Map<String, String> getAllRatesFormatted() {
    if (_rates.isEmpty) {
      _rates = Map.from(_defaultRates);
    }

    return _rates.map((key, value) => 
      MapEntry(key, _formatRate(key, value))
    );
  }

  String _formatRate(String currency, double rate) {
    return '$currency: ${rate.toStringAsFixed(4)} ₺';
  }

  /// Para birimi simgeleri
  static const Map<String, String> currencySymbols = {
    'USD': '\$',
    'EUR': '€',
    'GBP': '£',
    'TRY': '₺',
    'CHF': 'CHF',
    'JPY': '¥',
    'CNY': '¥',
    'RUB': '₽',
    'SAR': 'SR',
    'KWD': 'KD',
    'AED': 'AED',
    'QAR': 'QR',
    'CAD': 'C\$',
    'AUD': 'A\$',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
  };

  /// Para birimi isimleri (Türkçe)
  static const Map<String, String> currencyNames = {
    'USD': 'Amerikan Doları',
    'EUR': 'Euro',
    'GBP': 'İngiliz Sterlini',
    'TRY': 'Türk Lirası',
    'CHF': 'İsviçre Frangı',
    'JPY': 'Japon Yeni',
    'CNY': 'Çin Yuanı',
    'RUB': 'Rus Rublesi',
    'SAR': 'Suudi Arabistan Riyali',
    'KWD': 'Kuveyt Dinarı',
    'AED': 'BAE Dirhemi',
    'QAR': 'Katar Riyali',
    'CAD': 'Kanada Doları',
    'AUD': 'Avustralya Doları',
    'SEK': 'İsveç Kronu',
    'NOK': 'Norveç Kronu',
    'DKK': 'Danimarka Kronu',
    'PLN': 'Polonya Zlotisi',
    'BHD': 'Bahreyn Dinarı',
    'OMR': 'Umman Riyali',
  };

  String getCurrencyName(String code) {
    return currencyNames[code] ?? code;
  }

  String getCurrencySymbol(String code) {
    return currencySymbols[code] ?? code;
  }

  /// Kurları yenile (son güncelleme 1 saatten eskiyse)
  Future<void> refreshIfNeeded() async {
    if (_lastUpdate == null || 
        DateTime.now().difference(_lastUpdate!).inHours >= 1) {
      await fetchRates();
    }
  }

  /// Kurları zorla yenile
  Future<void> forceRefresh() async {
    await fetchRates();
  }
}