import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../models/converter_models.dart';

class CurrencyController extends ChangeNotifier {
  Currency _fromCurrency = Currency.currencies[0]; // TRY
  Currency _toCurrency = Currency.currencies[1]; // USD
  double _inputValue = 0;
  double _outputValue = 0;
  
  Map<String, double> _exchangeRates = {};
  bool _isLoading = false;
  String? _error;
  DateTime? _lastUpdate;

  Currency get fromCurrency => _fromCurrency;
  Currency get toCurrency => _toCurrency;
  double get inputValue => _inputValue;
  double get outputValue => _outputValue;
  bool get isLoading => _isLoading;
  String? get error => _error;
  DateTime? get lastUpdate => _lastUpdate;

  // Free API key from exchangerate-api.com (100 requests/day free)
  final String _apiKey = '7c9d8b3e4f5a6c7d8e9f0a1b'; // Replace with real key
  final String _baseUrl = 'https://api.exchangerate-api.com/v4/latest';

  Future<void> fetchExchangeRates() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Using free API without key requirement
      final response = await http.get(
        Uri.parse('$_baseUrl/USD'),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _exchangeRates = Map<String, double>.from(data['rates']);
        _lastUpdate = DateTime.now();
        _error = null;
        _convert();
      } else {
        _error = 'API hatası: ${response.statusCode}';
        _useFallbackRates();
      }
    } catch (e) {
      _error = 'Bağlantı hatası';
      _useFallbackRates();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _useFallbackRates() {
    // Fallback rates (approximate, for offline use)
    _exchangeRates = {
      'TRY': 32.50,
      'USD': 1.0,
      'EUR': 0.92,
      'GBP': 0.79,
      'JPY': 149.50,
      'CHF': 0.88,
      'CAD': 1.36,
      'AUD': 1.52,
      'CNY': 7.24,
      'INR': 83.12,
      'RUB': 92.50,
      'KRW': 1320.50,
      'BRL': 4.95,
      'MXN': 17.05,
      'SAR': 3.75,
      'AED': 3.67,
    };
    _lastUpdate = DateTime.now();
  }

  void setFromCurrency(Currency currency) {
    _fromCurrency = currency;
    _convert();
    notifyListeners();
  }

  void setToCurrency(Currency currency) {
    _toCurrency = currency;
    _convert();
    notifyListeners();
  }

  void setInputValue(double value) {
    _inputValue = value;
    _convert();
    notifyListeners();
  }

  void _convert() {
    if (_exchangeRates.isEmpty) return;

    // Get exchange rates
    final fromRate = _exchangeRates[_fromCurrency.code] ?? 1.0;
    final toRate = _exchangeRates[_toCurrency.code] ?? 1.0;

    // Convert via USD
    final usdValue = _inputValue / fromRate;
    _outputValue = usdValue * toRate;
  }

  void swap() {
    final temp = _fromCurrency;
    _fromCurrency = _toCurrency;
    _toCurrency = temp;
    _inputValue = _outputValue;
    _convert();
    notifyListeners();
  }

  void clear() {
    _inputValue = 0;
    _outputValue = 0;
    notifyListeners();
  }

  // Initialize with fallback rates
  CurrencyController() {
    _useFallbackRates();
  }
}