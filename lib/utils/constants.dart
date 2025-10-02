class AppConstants {
  // App Information
  static const String appName = 'AI Math Genius';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'World\'s Smartest Calculator with AI';
  
  // Colors
  static const int primaryColorValue = 0xFF6C5CE7;
  static const int secondaryColorValue = 0xFFA29BFE;
  static const int accentColorValue = 0xFF00CED1;
  static const int successColorValue = 0xFF00B894;
  static const int warningColorValue = 0xFFFDAB3E;
  static const int errorColorValue = 0xFFE17055;
  
  // Animation Durations
  static const int shortAnimationDuration = 200;
  static const int mediumAnimationDuration = 500;
  static const int longAnimationDuration = 1000;
  
  // Spacing
  static const double smallSpacing = 8.0;
  static const double mediumSpacing = 16.0;
  static const double largeSpacing = 24.0;
  static const double extraLargeSpacing = 32.0;
  
  // Border Radius
  static const double smallRadius = 8.0;
  static const double mediumRadius = 16.0;
  static const double largeRadius = 24.0;
  static const double extraLargeRadius = 32.0;
  
  // Font Sizes
  static const double smallFontSize = 12.0;
  static const double mediumFontSize = 16.0;
  static const double largeFontSize = 20.0;
  static const double extraLargeFontSize = 24.0;
  static const double displayFontSize = 48.0;
  
  // Calculations
  static const int maxHistoryItems = 100;
  static const int maxFavoriteItems = 50;
  static const int maxExpressionLength = 1000;
  
  // AI Settings
  static const int maxVoiceInputDuration = 30; // seconds
  static const int aiQueryLimit = 100; // per day for free users
  static const int maxImageSize = 5; // MB
  
  // Math Constants
  static const String piSymbol = 'π';
  static const String eSymbol = 'e';
  static const String infinitySymbol = '∞';
  static const String rootSymbol = '√';
  
  // Supported Languages
  static const List<String> supportedLanguages = [
    'en', 'tr', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar'
  ];
  
  // Voice Commands
  static const List<String> voiceOperators = [
    'plus', 'add', 'minus', 'subtract', 'times', 'multiply', 
    'divided by', 'divide', 'equals', 'is', 'square root', 
    'squared', 'cubed', 'power', 'percent'
  ];
  
  // Error Messages
  static const String divisionByZeroError = 'Cannot divide by zero';
  static const String invalidExpressionError = 'Invalid expression';
  static const String mathErrorMessage = 'Math error occurred';
  static const String networkErrorMessage = 'Network connection required';
  static const String permissionDeniedMessage = 'Permission denied';
  
  // Success Messages
  static const String calculationCompleteMessage = 'Calculation completed';
  static const String savedToHistoryMessage = 'Saved to history';
  static const String addedToFavoritesMessage = 'Added to favorites';
  static const String sharedSuccessMessage = 'Shared successfully';
  
  // Feature Limits (Free vs Premium)
  static const int freeAIQueries = 5;
  static const int premiumAIQueries = -1; // unlimited
  static const int freeHistoryItems = 20;
  static const int premiumHistoryItems = -1; // unlimited
  
  // URLs
  static const String privacyPolicyUrl = 'https://aimathgenius.com/privacy';
  static const String termsOfServiceUrl = 'https://aimathgenius.com/terms';
  static const String supportUrl = 'https://aimathgenius.com/support';
  static const String feedbackUrl = 'https://aimathgenius.com/feedback';
  
  // Social Media
  static const String twitterUrl = 'https://twitter.com/aimathgenius';
  static const String facebookUrl = 'https://facebook.com/aimathgenius';
  static const String instagramUrl = 'https://instagram.com/aimathgenius';
  
  // API Endpoints (for future use)
  static const String baseApiUrl = 'https://api.aimathgenius.com/v1';
  static const String aiSolveEndpoint = '/ai/solve';
  static const String feedbackEndpoint = '/feedback';
  static const String analyticsEndpoint = '/analytics';
  
  // Local Storage Keys
  static const String themeKey = 'app_theme';
  static const String languageKey = 'app_language';
  static const String firstLaunchKey = 'first_launch';
  static const String userPreferencesKey = 'user_preferences';
  static const String calculationHistoryKey = 'calculation_history';
  static const String favoritesKey = 'favorites';
  
  // Gamification
  static const Map<String, int> pointValues = {
    'basic_calculation': 10,
    'scientific_calculation': 20,
    'ai_query': 30,
    'voice_input': 25,
    'photo_solve': 40,
    'daily_streak': 50,
    'first_time_bonus': 100,
  };
  
  static const List<String> achievements = [
    'first_calculation',
    'hundred_calculations',
    'voice_master',
    'photo_expert',
    'math_streak_7',
    'math_streak_30',
    'ai_explorer',
    'share_master',
  ];
  
  // Tutorial Steps
  static const List<String> tutorialSteps = [
    'welcome',
    'basic_calculator',
    'voice_input',
    'camera_feature',
    'ai_assistance',
    'history_favorites',
    'customization',
    'completion'
  ];
  
  // Math Functions
  static const List<String> basicOperators = ['+', '-', '×', '÷', '='];
  static const List<String> scientificFunctions = [
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'log', 'ln', 'sqrt', 'cbrt', 'exp', 'abs'
  ];
  
  // Regular Expressions
  static const String numberRegex = r'^-?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$';
  static const String expressionRegex = r'^[0-9+\-*/().\s×÷πe√^!%]+$';
  
  // Default Settings
  static const Map<String, dynamic> defaultSettings = {
    'theme': 'dark',
    'language': 'en',
    'voice_enabled': true,
    'sound_enabled': true,
    'vibration_enabled': true,
    'auto_speak_results': false,
    'decimal_places': 10,
    'angle_unit': 'degrees',
    'number_format': 'auto',
  };
}

class MathConstants {
  static const double pi = 3.141592653589793;
  static const double e = 2.718281828459045;
  static const double phi = 1.618033988749895; // Golden ratio
  static const double sqrt2 = 1.4142135623730951;
  static const double sqrt3 = 1.7320508075688772;
  static const double ln2 = 0.6931471805599453;
  static const double ln10 = 2.302585092994046;
  
  // Convert degrees to radians
  static double degreesToRadians(double degrees) => degrees * pi / 180;
  
  // Convert radians to degrees  
  static double radiansToDegrees(double radians) => radians * 180 / pi;
}

class AppRoutes {
  static const String splash = '/splash';
  static const String main = '/main';
  static const String settings = '/settings';
  static const String history = '/history';
  static const String favorites = '/favorites';
  static const String about = '/about';
  static const String tutorial = '/tutorial';
  static const String premium = '/premium';
}

class AppAssets {
  // Images
  static const String logoPath = 'assets/images/logo.png';
  static const String splashImage = 'assets/images/splash_bg.png';
  static const String tutorialImage1 = 'assets/images/tutorial_1.png';
  static const String tutorialImage2 = 'assets/images/tutorial_2.png';
  static const String tutorialImage3 = 'assets/images/tutorial_3.png';
  
  // Animations
  static const String loadingAnimation = 'assets/animations/loading.json';
  static const String successAnimation = 'assets/animations/success.json';
  static const String errorAnimation = 'assets/animations/error.json';
  static const String celebrationAnimation = 'assets/animations/celebration.json';
  
  // Icons
  static const String customIcon = 'assets/icons/custom_icons.ttf';
  
  // Sounds
  static const String buttonClickSound = 'assets/sounds/button_click.wav';
  static const String successSound = 'assets/sounds/success.wav';
  static const String errorSound = 'assets/sounds/error.wav';
}