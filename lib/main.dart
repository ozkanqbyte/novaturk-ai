import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart'; // 🔥 Firebase configuration

import 'screens/splash_screen.dart';
import 'screens/admob_test_screen.dart'; // 📺 AdMob Test Ekranı
import 'screens/main_calculator_screen.dart';
import 'controllers/calculator_controller.dart';
import 'controllers/theme_controller.dart';
import 'controllers/ai_controller.dart';
import 'controllers/profile_controller.dart';
import 'controllers/leaderboard_controller.dart';
import 'controllers/challenge_controller.dart';
import 'controllers/premium_controller.dart';
import 'services/storage_service.dart';
import 'services/local_nlp_service.dart';
import 'services/smart_prediction_service.dart';
import 'services/currency_service.dart';
import 'core/localization/localization_service.dart';
// Native-only services
import 'services/iap_service.dart';
import 'services/admob_service.dart';
import 'services/firebase_service.dart';
import 'services/security_service.dart';
import 'controllers/special_calculators/health_calculators_controller.dart';
import 'controllers/special_calculators/finance_calculators_controller.dart';
import 'controllers/special_calculators/construction_calculators_controller.dart';
import 'controllers/special_calculators/science_calculators_controller.dart';
import 'controllers/special_calculators/business_calculators_controller.dart';
import 'controllers/special_calculators/daily_calculators_controller.dart';
import 'controllers/special_calculators/education_calculators_controller.dart';

// Native services - only import on non-web platforms
dynamic LocalVoiceService;
dynamic HandwritingService;
dynamic LocalOCRService;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive database
  await Hive.initFlutter();
  await StorageService.init();
  
  // 🛡️ Initialize Security Service FIRST (Critical!)
  if (!kIsWeb) {
    try {
      await SecurityService.instance.initialize();
      print('✅ Security Service initialized');
      
      // Check if device is secure
      if (!SecurityService.instance.isSecurityCheckPassed) {
        print('⚠️ WARNING: Device security check failed!');
        // In production, you might want to show a warning dialog
        // or disable premium features on insecure devices
      }
    } catch (e) {
      print('⚠️ Security Service error: $e');
    }
  }
  
  // 🔥 Initialize Firebase (Android, iOS, Web)
  try {
    // Initialize Firebase Core first
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    print('✅ Firebase Core initialized');
    
    // Then initialize Firebase Services (Analytics + Crashlytics)
    await FirebaseService().initialize();
  } catch (e) {
    print('⚠️ Firebase initialization error: $e');
    // Continue app execution even if Firebase fails
  }
  
  // Initialize IAP & AdMob (Mobile only)
  if (!kIsWeb) {
    try {
      print('🚀 Starting IAP initialization...');
      await IAPService().initialize();
      print('✅ IAP initialized successfully');
      
      print('🚀 Starting AdMob initialization...');
      await AdMobService().initialize(isPremium: false);
      print('✅ AdMob initialized successfully');
      
      // Force banner ad load with retry
      print('📺 Loading banner ad...');
      await Future.delayed(Duration(seconds: 1));
      await AdMobService().loadBannerAd();
      print('✅ Banner ad load requested');
    } catch (e) {
      print('❌ Service initialization error: $e');
      print('📍 Stack trace: ${StackTrace.current}');
    }
  }
  
  // Request permissions (skip on web)
  if (!kIsWeb) {
    await _requestPermissions();
  }
  
  // Initialize AI Services
  await _initializeLocalAI();
  
  // Set system UI style (skip on web)
  if (!kIsWeb) {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0A0A0A),
      systemNavigationBarIconBrightness: Brightness.light,
    ));
  }
  
  runApp(const AICalculatorApp());
}

Future<void> _requestPermissions() async {
  // Permissions are requested when needed by individual services
  print('🔒 Permission requests will be handled by individual services');
}

/// 🤖 Initialize Local AI Services (Offline)
Future<void> _initializeLocalAI() async {
  print('🚀 Initializing Local AI Services...');
  
  try {
    // NLP Service (always available - works on web)
    final nlpService = LocalNLPService();
    print('✅ NLP Service ready');
    
    // Smart Prediction Service (works on web)
    final predictionService = SmartPredictionService();
    await predictionService.initialize();
    print('✅ Smart Prediction Service initialized');
    
    // Native-only services (skip on web)
    if (!kIsWeb) {
      print('📱 Native platform detected - services available on-demand');
      // Native services will be initialized when actually used
    } else {
      print('ℹ️ Web mode: Camera, Voice, and Handwriting services disabled');
    }
    
    print('🎉 Available AI Services initialized successfully!');
  } catch (e) {
    print('⚠️ Some AI services failed to initialize: $e');
    // Continue anyway - app will work without AI features
  }
}

class AICalculatorApp extends StatelessWidget {
  const AICalculatorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CalculatorController()),
        ChangeNotifierProvider(create: (_) => ThemeController()),
        ChangeNotifierProvider(create: (_) => AIController()),
        ChangeNotifierProvider(create: (_) => PremiumController()),
        // Localization Service (Dil Desteği)
        ChangeNotifierProvider(create: (_) => LocalizationService()),
        // Monetization Services (Singleton instances)
        // ChangeNotifierProvider.value(value: IAPService()), // Web'de çalışmıyor
        ChangeNotifierProvider.value(value: AdMobService()), // ✅ AdMob AKTİF
        // Currency Service (Singleton - GÜNCEL DÖVİZ KURLARI!)
        ChangeNotifierProvider.value(value: CurrencyService()),
        // Special Calculators Controllers
        ChangeNotifierProvider(create: (_) => HealthCalculatorsController()),
        ChangeNotifierProvider(create: (_) => FinanceCalculatorsController()),
        ChangeNotifierProvider(create: (_) => ConstructionCalculatorsController()),
        ChangeNotifierProvider(create: (_) => ScienceCalculatorsController()),
        ChangeNotifierProvider(create: (_) => BusinessCalculatorsController()),
        ChangeNotifierProvider(create: (_) => DailyCalculatorsController()),
        ChangeNotifierProvider(create: (_) => EducationCalculatorsController()),
      ],
      child: Consumer2<ThemeController, LocalizationService>(
        builder: (context, themeController, localizationService, child) {
          return GetMaterialApp(
            title: 'Premium Hesap Makinesi',
            debugShowCheckedModeBanner: false,
            theme: _buildLightTheme(),
            darkTheme: _buildDarkTheme(),
            themeMode: themeController.themeMode,
            locale: localizationService.currentLocale,
            supportedLocales: LocalizationService.supportedLanguages
                .map((lang) => lang.locale)
                .toList(),
            fallbackLocale: const Locale('tr', 'TR'),
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            
            // 🏠 Ana Ekran - AdMob test için değiştir:
            home: const SplashScreen(), // Normal kullanım
            // home: const AdMobTestScreen(), // ⚠️ AdMob TEST için bu satırı aç!
          );
        },
      ),
    );
  }

  ThemeData _buildDarkTheme() {
    return ThemeData(
      brightness: Brightness.dark,
      primarySwatch: Colors.blue,
      primaryColor: const Color(0xFF6C5CE7),
      scaffoldBackgroundColor: const Color(0xFF0A0A0A),
      cardColor: const Color(0xFF1A1A1A),
      dividerColor: const Color(0xFF2A2A2A),
      
      textTheme: GoogleFonts.poppinsTextTheme().copyWith(
        displayLarge: GoogleFonts.poppins(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
        displayMedium: GoogleFonts.poppins(
          fontSize: 28,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
        headlineLarge: GoogleFonts.poppins(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
        bodyLarge: GoogleFonts.poppins(
          fontSize: 16,
          color: Colors.white70,
        ),
        bodyMedium: GoogleFonts.poppins(
          fontSize: 14,
          color: Colors.white70,
        ),
      ),
      
      colorScheme: const ColorScheme.dark(
        primary: Color(0xFF6C5CE7),
        secondary: Color(0xFFA29BFE),
        surface: Color(0xFF1A1A1A),
        background: Color(0xFF0A0A0A),
        error: Color(0xFFE17055),
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: Colors.white,
        onBackground: Colors.white,
        onError: Colors.white,
      ),
      
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF6C5CE7),
          foregroundColor: Colors.white,
          elevation: 8,
          shadowColor: const Color(0xFF6C5CE7).withOpacity(0.4),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        ),
      ),
      
      appBarTheme: AppBarTheme(
        backgroundColor: const Color(0xFF0A0A0A),
        foregroundColor: Colors.white,
        elevation: 0,
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
        ),
      ),
      
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Color(0xFF1A1A1A),
        selectedItemColor: Color(0xFF6C5CE7),
        unselectedItemColor: Colors.white54,
        elevation: 20,
      ),
      
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF1A1A1A),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF2A2A2A)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF2A2A2A)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF6C5CE7), width: 2),
        ),
        hintStyle: GoogleFonts.poppins(color: Colors.white54),
        labelStyle: GoogleFonts.poppins(color: Colors.white70),
      ),
      
      cardTheme: CardThemeData(
        color: const Color(0xFF1A1A1A),
        elevation: 8,
        shadowColor: Colors.black26,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: Color(0xFF6C5CE7),
        foregroundColor: Colors.white,
        elevation: 12,
      ),
    );
  }

  ThemeData _buildLightTheme() {
    return ThemeData(
      brightness: Brightness.light,
      primarySwatch: Colors.blue,
      primaryColor: const Color(0xFF6C5CE7),
      scaffoldBackgroundColor: const Color(0xFFF8F9FA),
      
      textTheme: GoogleFonts.poppinsTextTheme().copyWith(
        displayLarge: GoogleFonts.poppins(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: const Color(0xFF2D3436),
        ),
      ),
      
      colorScheme: const ColorScheme.light(
        primary: Color(0xFF6C5CE7),
        secondary: Color(0xFFA29BFE),
        surface: Colors.white,
        background: Color(0xFFF8F9FA),
        error: Color(0xFFE17055),
      ),
    );
  }
}