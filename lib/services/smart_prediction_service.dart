import 'dart:math' as math;
import 'package:shared_preferences/shared_preferences.dart';

/// 🎯 Smart Prediction Service - Local AI Prediction
/// Kullanıcı davranışlarını öğrenir ve akıllı tahminler yapar
class SmartPredictionService {
  static final SmartPredictionService _instance = SmartPredictionService._internal();
  factory SmartPredictionService() => _instance;
  SmartPredictionService._internal();

  SharedPreferences? _prefs;
  bool _isInitialized = false;

  // History tracking
  final List<String> _recentCalculations = [];
  final Map<String, int> _operationFrequency = {};
  final Map<String, double> _patternScores = {};
  final List<String> _favoriteOperations = [];

  // ML parametreleri (basit linear regression)
  double _learningRate = 0.01;
  Map<String, double> _weights = {};

  // Getters
  bool get isInitialized => _isInitialized;
  List<String> get recentCalculations => List.from(_recentCalculations);
  List<String> get favoriteOperations => List.from(_favoriteOperations);

  /// Servisi başlatır
  Future<bool> initialize() async {
    if (_isInitialized) return true;

    try {
      _prefs = await SharedPreferences.getInstance();
      await _loadHistory();
      _isInitialized = true;
      print('✅ Smart prediction service initialized');
      return true;
    } catch (e) {
      print('❌ Smart prediction initialization error: $e');
      return false;
    }
  }

  /// Geçmiş hesaplamaları yükler
  Future<void> _loadHistory() async {
    if (_prefs == null) return;

    // Son hesaplamalar
    _recentCalculations.clear();
    _recentCalculations.addAll(_prefs!.getStringList('recent_calculations') ?? []);

    // Operasyon sıklıkları
    _operationFrequency.clear();
    final freqData = _prefs!.getString('operation_frequency');
    if (freqData != null) {
      // JSON parse yapılabilir
    }

    // Favori işlemler
    _favoriteOperations.clear();
    _favoriteOperations.addAll(_prefs!.getStringList('favorite_operations') ?? []);
  }

  /// Geçmişi kaydeder
  Future<void> _saveHistory() async {
    if (_prefs == null) return;

    await _prefs!.setStringList('recent_calculations', _recentCalculations);
    await _prefs!.setStringList('favorite_operations', _favoriteOperations);
  }

  /// Yeni hesaplama kaydeder
  Future<void> recordCalculation(String expression, String result) async {
    if (!_isInitialized) await initialize();

    // Son hesaplamaya ekle
    _recentCalculations.insert(0, '$expression = $result');
    if (_recentCalculations.length > 100) {
      _recentCalculations.removeRange(100, _recentCalculations.length);
    }

    // Operasyon sıklığını güncelle
    _updateOperationFrequency(expression);

    // Patern öğren
    _learnPattern(expression, result);

    // Kaydet
    await _saveHistory();
  }

  /// Operasyon sıklığını günceller
  void _updateOperationFrequency(String expression) {
    // Operatörleri bul
    final operators = ['+', '-', '*', '/', '^', 'sqrt', 'sin', 'cos', 'tan', 'log'];
    
    for (var op in operators) {
      if (expression.contains(op)) {
        _operationFrequency[op] = (_operationFrequency[op] ?? 0) + 1;
      }
    }

    // Favori işlemleri güncelle
    _updateFavorites();
  }

  /// Favori işlemleri günceller
  void _updateFavorites() {
    _favoriteOperations.clear();
    
    // Sıklık sırasına göre sırala
    var sortedOps = _operationFrequency.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    
    _favoriteOperations.addAll(
      sortedOps.take(5).map((e) => e.key),
    );
  }

  /// Patern öğrenir (basit ML)
  void _learnPattern(String expression, String result) {
    try {
      // Özellik çıkarımı
      Map<String, double> features = _extractFeatures(expression);
      double targetValue = double.tryParse(result) ?? 0.0;

      // Ağırlıkları güncelle (gradient descent)
      features.forEach((key, value) {
        double currentWeight = _weights[key] ?? 0.0;
        double prediction = currentWeight * value;
        double error = targetValue - prediction;
        
        // Gradient descent update
        _weights[key] = currentWeight + (_learningRate * error * value);
      });

      // Patern skorunu güncelle
      String patternKey = _getPatternKey(expression);
      _patternScores[patternKey] = (_patternScores[patternKey] ?? 0.0) + 1.0;
    } catch (e) {
      // Hata durumunda sessizce devam et
    }
  }

  /// İfadeden özellik çıkarır
  Map<String, double> _extractFeatures(String expression) {
    Map<String, double> features = {};

    // Uzunluk
    features['length'] = expression.length.toDouble();

    // Operatör sayıları
    features['plus_count'] = '+'.allMatches(expression).length.toDouble();
    features['minus_count'] = '-'.allMatches(expression).length.toDouble();
    features['multiply_count'] = '*'.allMatches(expression).length.toDouble();
    features['divide_count'] = '/'.allMatches(expression).length.toDouble();
    features['power_count'] = '^'.allMatches(expression).length.toDouble();

    // Parantez sayısı
    features['parentheses_count'] = '('.allMatches(expression).length.toDouble();

    // Fonksiyon sayısı
    final functions = ['sqrt', 'sin', 'cos', 'tan', 'log', 'ln', 'abs'];
    double functionCount = 0;
    for (var func in functions) {
      functionCount += expression.split(func).length - 1;
    }
    features['function_count'] = functionCount;

    return features;
  }

  /// Patern anahtarı oluşturur
  String _getPatternKey(String expression) {
    // Sayıları X ile değiştir
    String pattern = expression.replaceAll(RegExp(r'\d+\.?\d*'), 'X');
    return pattern;
  }

  /// Sonraki işlemi tahmin eder
  List<String> predictNextOperation() {
    if (_favoriteOperations.isEmpty) {
      return ['+', '-', '*', '/'];
    }

    return _favoriteOperations;
  }

  /// Tamamlama önerileri
  List<String> getSuggestions(String partial) {
    List<String> suggestions = [];

    // Geçmiş hesaplamalardan öner
    for (var calc in _recentCalculations) {
      if (calc.startsWith(partial) && !suggestions.contains(calc)) {
        suggestions.add(calc);
        if (suggestions.length >= 5) break;
      }
    }

    // Patern tabanlı öneriler
    String patternKey = _getPatternKey(partial);
    if (_patternScores.containsKey(patternKey)) {
      // Benzer patternleri öner
    }

    return suggestions;
  }

  /// Kullanıcının matematik seviyesini tahmin eder
  String estimateUserLevel() {
    if (_recentCalculations.length < 10) return 'Yeni Başlayan';

    // Karmaşıklık skorunu hesapla
    double complexity = 0.0;
    for (var calc in _recentCalculations.take(50)) {
      complexity += _calculateComplexity(calc);
    }
    complexity /= math.min(_recentCalculations.length, 50);

    if (complexity < 2.0) return 'Temel';
    if (complexity < 4.0) return 'Orta';
    if (complexity < 6.0) return 'İleri';
    return 'Uzman';
  }

  /// Hesaplama karmaşıklığını hesaplar
  double _calculateComplexity(String expression) {
    double score = 0.0;

    // Uzunluk
    score += expression.length * 0.1;

    // Operatör sayısı
    score += ('+'.allMatches(expression).length + 
              '-'.allMatches(expression).length) * 0.5;
    score += ('*'.allMatches(expression).length + 
              '/'.allMatches(expression).length) * 1.0;
    score += '^'.allMatches(expression).length * 2.0;

    // Fonksiyon kullanımı
    final functions = ['sqrt', 'sin', 'cos', 'tan', 'log', 'ln'];
    for (var func in functions) {
      score += (expression.split(func).length - 1) * 3.0;
    }

    // Parantez
    score += '('.allMatches(expression).length * 1.5;

    return score;
  }

  /// İstatistikler
  Map<String, dynamic> getStatistics() {
    return {
      'total_calculations': _recentCalculations.length,
      'favorite_operations': _favoriteOperations,
      'operation_frequency': _operationFrequency,
      'user_level': estimateUserLevel(),
      'most_used_operation': _operationFrequency.isNotEmpty
          ? _operationFrequency.entries.reduce((a, b) => a.value > b.value ? a : b).key
          : 'none',
    };
  }

  /// Geçmişi temizler
  Future<void> clearHistory() async {
    _recentCalculations.clear();
    _operationFrequency.clear();
    _patternScores.clear();
    _favoriteOperations.clear();
    _weights.clear();
    
    await _prefs?.clear();
  }

  /// Servisi temizler
  void dispose() {
    _isInitialized = false;
  }
}