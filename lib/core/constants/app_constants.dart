class AppConstants {
  // App Info
  static const String appName = 'Premium Hesap Makinesi';
  static const String appVersion = '2.0.0';
  static const String appDescription = 'Yapay zeka destekli akıllı hesap makinesi';
  
  // Premium
  static const String premiumMonthlyId = 'ai_calculator_monthly_premium';
  static const String premiumLifetimeId = 'ai_calculator_lifetime_premium';
  static const double premiumMonthlyPrice = 50.00;
  static const double premiumLifetimePrice = 399.00;
  
  // Free Limits
  static const int freeAIQueriesPerDay = 5;
  static const int freeHistoryLimit = 20;
  static const int freeConverterLimit = 10;
  
  // Premium Features
  static const int premiumAIQueriesPerDay = 999999;
  static const int premiumHistoryLimit = 999999;
  
  // Gamification
  static const int pointsBasicCalculation = 10;
  static const int pointsScientificCalculation = 20;
  static const int pointsAICalculation = 50;
  static const int pointsConverter = 15;
  static const int pointsDailyStreak = 100;
  static const int pointsChallenge = 200;
  
  // Levels
  static const Map<int, String> levels = {
    0: 'Başlangıç',
    100: 'Amatör',
    500: 'Uzman',
    1000: 'Profesyonel',
    2500: 'Usta',
    5000: 'Efsane',
    10000: 'Tanrı',
  };
  
  // Achievements
  static const List<String> achievements = [
    'İlk Hesaplama',
    '10 Hesaplama',
    '100 Hesaplama',
    '1000 Hesaplama',
    'İlk AI Sorgu',
    'Ses Komutu Ustası',
    'Kamera Uzmanı',
    '7 Günlük Seri',
    '30 Günlük Seri',
    'Matematik Dehası',
  ];
  
  // Settings
  static const String settingsTheme = 'theme_mode';
  static const String settingsHaptic = 'haptic_feedback';
  static const String settingsSound = 'sound_effects';
  static const String settingsLanguage = 'language';
  static const String settingsAutoCalculate = 'auto_calculate';
  
  // URLs & Contact
  static const String supportEmail = 'ozkanqbyte@gmail.com';
  static const String developerName = 'Özkan Akçay';
  static const String companyName = 'QByte Development';
  static const String githubUrl = 'https://github.com/ozkanqbyte/ai-calculator-pro';
  static const String githubProfile = 'https://github.com/ozkanqbyte';
  static const String websiteUrl = 'https://ozkanqbyte.github.io/ai-calculator-pro';
  static const String privacyUrl = 'https://ozkanqbyte.github.io/ai-calculator-pro/privacy_policy.html';
  static const String termsUrl = 'https://ozkanqbyte.github.io/ai-calculator-pro/terms_of_service.html';
  
  // Social
  static const String twitterUrl = '';
  static const String instagramUrl = '';
  static const String youtubeUrl = '';
  
  // Animations
  static const Duration shortAnimation = Duration(milliseconds: 150);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
  
  // API (for future use)
  static const String apiBaseUrl = 'https://api.aihesapmakinesi.com/v1';
  static const String apiTimeout = '30';
  
  // Calculator
  static const int maxDecimalPlaces = 10;
  static const int maxHistoryItems = 1000;
  static const int maxFavorites = 100;
  
  // Currency (will be fetched from API)
  static const List<String> popularCurrencies = [
    'TRY', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'RUB', 'CHF', 'AUD', 'CAD'
  ];
  
  // Units
  static const List<String> lengthUnits = [
    'mm', 'cm', 'm', 'km', 'inch', 'ft', 'yard', 'mile'
  ];
  
  static const List<String> weightUnits = [
    'mg', 'g', 'kg', 'ton', 'oz', 'lb'
  ];
  
  static const List<String> temperatureUnits = [
    'C', 'F', 'K'
  ];
  
  static const List<String> areaUnits = [
    'm²', 'km²', 'ft²', 'acre', 'hectare'
  ];
  
  static const List<String> volumeUnits = [
    'ml', 'l', 'ft³', 'gal'
  ];
  
  static const List<String> speedUnits = [
    'km/h', 'm/s', 'mph', 'knot'
  ];
  
  static const List<String> dataUnits = [
    'B', 'KB', 'MB', 'GB', 'TB'
  ];
  
  // Date Calculator
  static const List<String> dateOperations = [
    'Gün Ekle/Çıkar',
    'Ay Ekle/Çıkar',
    'Yıl Ekle/Çıkar',
    'İki Tarih Arası Fark',
    'Yaş Hesapla',
    'Doğum Günü Sayacı',
  ];
}