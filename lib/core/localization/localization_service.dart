import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app_localizations.dart';

/// 🌍 LOCALIZATION SERVICE - Dil Yönetimi
/// 16 Dil Desteği: TR, EN, DE, FR, ES, IT, PT, NL, PL, EL, HI, ID, MS, JA, RU, AR

class LocalizationService extends ChangeNotifier {
  static const String _languageKey = 'selected_language';
  static const String _defaultLanguage = 'tr';
  
  String _currentLanguage = _defaultLanguage;
  Locale _currentLocale = const Locale('tr', 'TR');

  String get currentLanguage => _currentLanguage;
  String get currentLanguageCode => _currentLanguage;
  Locale get currentLocale => _currentLocale;
  
  // Desteklenen diller (16 Dil)
  static const List<LanguageModel> supportedLanguages = [
    LanguageModel(code: 'tr', name: 'Türkçe', flag: '🇹🇷', locale: Locale('tr', 'TR')),
    LanguageModel(code: 'en', name: 'English', flag: '🇬🇧', locale: Locale('en', 'US')),
    LanguageModel(code: 'de', name: 'Deutsch', flag: '🇩🇪', locale: Locale('de', 'DE')),
    LanguageModel(code: 'fr', name: 'Français', flag: '🇫🇷', locale: Locale('fr', 'FR')),
    LanguageModel(code: 'es', name: 'Español', flag: '🇪🇸', locale: Locale('es', 'ES')),
    LanguageModel(code: 'it', name: 'Italiano', flag: '🇮🇹', locale: Locale('it', 'IT')),
    LanguageModel(code: 'pt', name: 'Português', flag: '🇵🇹', locale: Locale('pt', 'PT')),
    LanguageModel(code: 'nl', name: 'Nederlands', flag: '🇳🇱', locale: Locale('nl', 'NL')),
    LanguageModel(code: 'pl', name: 'Polski', flag: '🇵🇱', locale: Locale('pl', 'PL')),
    LanguageModel(code: 'el', name: 'Ελληνικά', flag: '🇬🇷', locale: Locale('el', 'GR')),
    LanguageModel(code: 'hi', name: 'हिन्दी', flag: '🇮🇳', locale: Locale('hi', 'IN')),
    LanguageModel(code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', locale: Locale('id', 'ID')),
    LanguageModel(code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾', locale: Locale('ms', 'MY')),
    LanguageModel(code: 'ja', name: '日本語', flag: '🇯🇵', locale: Locale('ja', 'JP')),
    LanguageModel(code: 'ru', name: 'Русский', flag: '🇷🇺', locale: Locale('ru', 'RU')),
    LanguageModel(code: 'ar', name: 'العربية', flag: '🇸🇦', locale: Locale('ar', 'SA')),
  ];

  LocalizationService() {
    _loadLanguage();
  }

  Future<void> _loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    _currentLanguage = prefs.getString(_languageKey) ?? _defaultLanguage;
    _currentLocale = _getLocaleFromCode(_currentLanguage);
    notifyListeners();
  }

  Future<void> changeLanguage(String languageCode) async {
    if (_currentLanguage == languageCode) return;
    
    _currentLanguage = languageCode;
    _currentLocale = _getLocaleFromCode(languageCode);
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_languageKey, languageCode);
    
    notifyListeners();
  }

  Locale _getLocaleFromCode(String code) {
    final language = supportedLanguages.firstWhere(
      (lang) => lang.code == code,
      orElse: () => supportedLanguages[0],
    );
    return language.locale;
  }

  LanguageModel getCurrentLanguageModel() {
    return supportedLanguages.firstWhere(
      (lang) => lang.code == _currentLanguage,
      orElse: () => supportedLanguages[0],
    );
  }

  // Number formatting için locale string
  String getLocaleString() {
    switch (_currentLanguage) {
      case 'tr': return 'tr_TR';
      case 'en': return 'en_US';
      case 'de': return 'de_DE';
      case 'fr': return 'fr_FR';
      case 'es': return 'es_ES';
      case 'it': return 'it_IT';
      case 'pt': return 'pt_PT';
      case 'nl': return 'nl_NL';
      case 'pl': return 'pl_PL';
      case 'el': return 'el_GR';
      case 'hi': return 'hi_IN';
      case 'id': return 'id_ID';
      case 'ms': return 'ms_MY';
      case 'ja': return 'ja_JP';
      case 'ru': return 'ru_RU';
      case 'ar': return 'ar_SA';
      default: return 'en_US';
    }
  }

  // Varsayılan para birimi
  String getDefaultCurrency() {
    switch (_currentLanguage) {
      case 'tr': return '₺';
      case 'en': return '\$';
      case 'de':
      case 'fr':
      case 'es':
      case 'it':
      case 'pt':
      case 'nl':
      case 'el':
        return '€';
      case 'pl': return 'zł';
      case 'hi': return '₹';
      case 'id': return 'Rp';
      case 'ms': return 'RM';
      case 'ja': return '¥';
      case 'ru': return '₽';
      case 'ar': return 'ر.س';
      default: return '\$';
    }
  }
}

class LanguageModel {
  final String code;
  final String name;
  final String flag;
  final Locale locale;

  const LanguageModel({
    required this.code,
    required this.name,
    required this.flag,
    required this.locale,
  });
}