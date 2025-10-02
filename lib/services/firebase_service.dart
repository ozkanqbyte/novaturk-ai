import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'dart:ui' show PlatformDispatcher;

/// 🔥 Firebase Service
/// Analytics + Crashlytics integration
class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  FirebaseAnalytics? _analytics;
  FirebaseCrashlytics? _crashlytics;

  FirebaseAnalytics? get analytics => _analytics;
  FirebaseAnalyticsObserver? get observer =>
      _analytics != null ? FirebaseAnalyticsObserver(analytics: _analytics!) : null;

  /// 🚀 Initialize Firebase Services
  /// NOTE: Firebase.initializeApp() should be called BEFORE this in main.dart
  Future<void> initialize() async {
    try {
      print('🔥 Initializing Firebase Services...');

      // Initialize Analytics
      _analytics = FirebaseAnalytics.instance;
      await _analytics?.setAnalyticsCollectionEnabled(true);
      print('📊 Firebase Analytics enabled');

      // Initialize Crashlytics
      _crashlytics = FirebaseCrashlytics.instance;
      
      // Enable Crashlytics data collection
      await _crashlytics?.setCrashlyticsCollectionEnabled(true);
      
      // Pass all uncaught Flutter errors to Crashlytics
      FlutterError.onError = (FlutterErrorDetails details) {
        _crashlytics?.recordFlutterFatalError(details);
        // Also print to console in debug mode
        if (kDebugMode) {
          FlutterError.presentError(details);
        }
      };
      
      // Pass all uncaught asynchronous errors to Crashlytics
      PlatformDispatcher.instance.onError = (error, stack) {
        _crashlytics?.recordError(error, stack, fatal: true);
        return true;
      };
      
      print('💥 Firebase Crashlytics enabled');
      
      // Log app start event
      await logEvent(
        name: 'app_started',
        parameters: {
          'timestamp': DateTime.now().toIso8601String(),
          'platform': defaultTargetPlatform.toString(),
        },
      );

      print('✅ Firebase Services initialized successfully');
    } catch (e) {
      print('❌ Firebase Services initialization error: $e');
      // Don't crash the app if Firebase fails
    }
  }

  /// 📊 Log Event
  Future<void> logEvent({
    required String name,
    Map<String, dynamic>? parameters,
  }) async {
    try {
      await _analytics?.logEvent(
        name: name,
        parameters: parameters?.map((key, value) => MapEntry(key, value as Object)),
      );
      if (kDebugMode) {
        print('📊 Analytics: $name ${parameters ?? ""}');
      }
    } catch (e) {
      print('❌ Analytics error: $e');
    }
  }

  /// 📱 Set User Properties
  Future<void> setUserProperty({
    required String name,
    required String value,
  }) async {
    try {
      await _analytics?.setUserProperty(name: name, value: value);
    } catch (e) {
      print('❌ Set user property error: $e');
    }
  }

  /// 🆔 Set User ID
  Future<void> setUserId(String userId) async {
    try {
      await _analytics?.setUserId(id: userId);
      await _crashlytics?.setUserIdentifier(userId);
    } catch (e) {
      print('❌ Set user ID error: $e');
    }
  }

  /// 📍 Set Current Screen
  Future<void> setCurrentScreen(String screenName) async {
    try {
      await _analytics?.logScreenView(screenName: screenName);
    } catch (e) {
      print('❌ Set current screen error: $e');
    }
  }

  /// 💥 Log Custom Error
  Future<void> logError(
    dynamic exception,
    StackTrace? stackTrace, {
    String? reason,
    bool fatal = false,
  }) async {
    try {
      await _crashlytics?.recordError(
        exception,
        stackTrace,
        reason: reason,
        fatal: fatal,
      );
      if (kDebugMode) {
        print('💥 Error logged: $exception');
      }
    } catch (e) {
      print('❌ Log error failed: $e');
    }
  }

  /// 🎯 Common Analytics Events
  
  // Calculator usage
  Future<void> logCalculation(String calculationType) async {
    await logEvent(
      name: 'calculation_performed',
      parameters: {'type': calculationType},
    );
  }

  // Premium features
  Future<void> logPremiumPurchase(String productId, double price) async {
    await logEvent(
      name: 'purchase',
      parameters: {
        'product_id': productId,
        'value': price,
        'currency': 'TRY',
      },
    );
  }

  Future<void> logPremiumFeatureUsed(String featureName) async {
    await logEvent(
      name: 'premium_feature_used',
      parameters: {'feature': featureName},
    );
  }

  // AI features
  Future<void> logAIFeatureUsed(String featureType) async {
    await logEvent(
      name: 'ai_feature_used',
      parameters: {'feature_type': featureType},
    );
  }

  // Converter usage
  Future<void> logConverterUsed(String converterType) async {
    await logEvent(
      name: 'converter_used',
      parameters: {'converter_type': converterType},
    );
  }

  // Ad impressions
  Future<void> logAdImpression(String adType) async {
    await logEvent(
      name: 'ad_impression',
      parameters: {'ad_type': adType},
    );
  }

  // Settings changes
  Future<void> logSettingsChanged(String setting, String value) async {
    await logEvent(
      name: 'settings_changed',
      parameters: {
        'setting': setting,
        'value': value,
      },
    );
  }

  // Theme changes
  Future<void> logThemeChanged(String theme) async {
    await logEvent(
      name: 'theme_changed',
      parameters: {'theme': theme},
    );
  }

  // Language changes
  Future<void> logLanguageChanged(String language) async {
    await logEvent(
      name: 'language_changed',
      parameters: {'language': language},
    );
    await setUserProperty(name: 'user_language', value: language);
  }

  // Tutorial/Onboarding
  Future<void> logTutorialBegin() async {
    await logEvent(name: 'tutorial_begin');
  }

  Future<void> logTutorialComplete() async {
    await logEvent(name: 'tutorial_complete');
  }

  // App rating
  Future<void> logAppRated(int rating) async {
    await logEvent(
      name: 'app_rated',
      parameters: {'rating': rating},
    );
  }
}