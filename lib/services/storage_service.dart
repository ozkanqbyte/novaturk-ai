import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'dart:convert';

class StorageService {
  static late SharedPreferences _prefs;
  static late Box _calculationBox;
  static late Box _favoritesBox;
  static late Box _settingsBox;
  
  static const String _themeKey = 'theme_mode';
  static const String _languageKey = 'language';
  static const String _calculationHistoryKey = 'calculation_history';
  static const String _favoritesKey = 'favorites';
  static const String _aiSettingsKey = 'ai_settings';
  static const String _voiceSettingsKey = 'voice_settings';
  static const String _firstLaunchKey = 'first_launch';
  static const String _userStatsKey = 'user_stats';
  
  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    
    // Initialize Hive boxes
    _calculationBox = await Hive.openBox('calculations');
    _favoritesBox = await Hive.openBox('favorites');
    _settingsBox = await Hive.openBox('settings');
  }
  
  // Theme Management
  static ThemeMode getThemeMode() {
    final themeString = _prefs.getString(_themeKey);
    switch (themeString) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      case 'system':
        return ThemeMode.system;
      default:
        return ThemeMode.dark; // Default to dark
    }
  }
  
  static Future<bool> setThemeMode(ThemeMode mode) {
    String themeString;
    switch (mode) {
      case ThemeMode.light:
        themeString = 'light';
        break;
      case ThemeMode.dark:
        themeString = 'dark';
        break;
      case ThemeMode.system:
        themeString = 'system';
        break;
    }
    return _prefs.setString(_themeKey, themeString);
  }
  
  // Language Management
  static String getLanguage() {
    return _prefs.getString(_languageKey) ?? 'en';
  }
  
  static Future<bool> setLanguage(String languageCode) {
    return _prefs.setString(_languageKey, languageCode);
  }
  
  // Calculation History
  static List<Map<String, dynamic>> getCalculationHistory() {
    final historyJson = _calculationBox.get(_calculationHistoryKey);
    if (historyJson == null) return [];
    
    return List<Map<String, dynamic>>.from(
      (historyJson as List).map((item) => Map<String, dynamic>.from(item)),
    );
  }
  
  static Future<void> saveCalculation(Map<String, dynamic> calculation) async {
    final history = getCalculationHistory();
    
    // Add timestamp
    calculation['timestamp'] = DateTime.now().millisecondsSinceEpoch;
    calculation['id'] = DateTime.now().millisecondsSinceEpoch.toString();
    
    // Add to beginning of list
    history.insert(0, calculation);
    
    // Keep only last 100 calculations
    if (history.length > 100) {
      history.removeRange(100, history.length);
    }
    
    await _calculationBox.put(_calculationHistoryKey, history);
  }
  
  static Future<void> clearCalculationHistory() async {
    await _calculationBox.delete(_calculationHistoryKey);
  }
  
  static Future<void> deleteCalculation(String id) async {
    final history = getCalculationHistory();
    history.removeWhere((calc) => calc['id'] == id);
    await _calculationBox.put(_calculationHistoryKey, history);
  }
  
  // Favorites Management
  static List<Map<String, dynamic>> getFavorites() {
    final favoritesJson = _favoritesBox.get(_favoritesKey);
    if (favoritesJson == null) return [];
    
    return List<Map<String, dynamic>>.from(
      (favoritesJson as List).map((item) => Map<String, dynamic>.from(item)),
    );
  }
  
  static Future<void> addToFavorites(Map<String, dynamic> calculation) async {
    final favorites = getFavorites();
    
    // Add timestamp and id if not present
    calculation['favorited_at'] = DateTime.now().millisecondsSinceEpoch;
    if (!calculation.containsKey('id')) {
      calculation['id'] = DateTime.now().millisecondsSinceEpoch.toString();
    }
    
    // Check if already exists
    if (!favorites.any((fav) => fav['id'] == calculation['id'])) {
      favorites.insert(0, calculation);
      await _favoritesBox.put(_favoritesKey, favorites);
    }
  }
  
  static Future<void> removeFromFavorites(String id) async {
    final favorites = getFavorites();
    favorites.removeWhere((fav) => fav['id'] == id);
    await _favoritesBox.put(_favoritesKey, favorites);
  }
  
  static bool isFavorite(String id) {
    final favorites = getFavorites();
    return favorites.any((fav) => fav['id'] == id);
  }
  
  // AI Settings
  static Map<String, dynamic> getAISettings() {
    final settings = _settingsBox.get(_aiSettingsKey);
    if (settings == null) {
      return {
        'voice_enabled': true,
        'auto_speak_results': true,
        'ai_explanations': true,
        'step_by_step': true,
        'cultural_math': true,
        'fun_facts': true,
      };
    }
    return Map<String, dynamic>.from(settings);
  }
  
  static Future<void> setAISettings(Map<String, dynamic> settings) async {
    await _settingsBox.put(_aiSettingsKey, settings);
  }
  
  // Voice Settings
  static Map<String, dynamic> getVoiceSettings() {
    final settings = _settingsBox.get(_voiceSettingsKey);
    if (settings == null) {
      return {
        'voice_speed': 0.5,
        'voice_pitch': 1.0,
        'voice_language': 'en-US',
        'wake_word_enabled': false,
        'continuous_listening': false,
      };
    }
    return Map<String, dynamic>.from(settings);
  }
  
  static Future<void> setVoiceSettings(Map<String, dynamic> settings) async {
    await _settingsBox.put(_voiceSettingsKey, settings);
  }
  
  // First Launch
  static bool isFirstLaunch() {
    return _prefs.getBool(_firstLaunchKey) ?? true;
  }
  
  static Future<bool> setFirstLaunchComplete() {
    return _prefs.setBool(_firstLaunchKey, false);
  }
  
  // User Statistics
  static Map<String, dynamic> getUserStats() {
    final stats = _settingsBox.get(_userStatsKey);
    if (stats == null) {
      return {
        'total_calculations': 0,
        'photos_processed': 0,
        'voice_commands': 0,
        'favorites_count': 0,
        'problems_solved': 0,
        'streak_days': 0,
        'level': 1,
        'experience_points': 0,
        'achievements': [],
        'last_used': DateTime.now().millisecondsSinceEpoch,
        'total_time_spent': 0, // in minutes
      };
    }
    return Map<String, dynamic>.from(stats);
  }
  
  static Future<void> updateUserStats(Map<String, dynamic> stats) async {
    await _settingsBox.put(_userStatsKey, stats);
  }
  
  static Future<void> incrementStat(String statKey) async {
    final stats = getUserStats();
    stats[statKey] = (stats[statKey] ?? 0) + 1;
    stats['last_used'] = DateTime.now().millisecondsSinceEpoch;
    await updateUserStats(stats);
  }
  
  // Utility methods
  static Future<void> clearAllData() async {
    await _prefs.clear();
    await _calculationBox.clear();
    await _favoritesBox.clear();
    await _settingsBox.clear();
  }
  
  static Future<void> exportData() async {
    // Implementation for data export
    final data = {
      'calculations': getCalculationHistory(),
      'favorites': getFavorites(),
      'ai_settings': getAISettings(),
      'voice_settings': getVoiceSettings(),
      'user_stats': getUserStats(),
      'theme': getThemeMode().toString(),
      'language': getLanguage(),
      'export_date': DateTime.now().toIso8601String(),
    };
    
    final jsonString = jsonEncode(data);
    // Here you would typically save to file or share
    return;
  }
  
  static Future<bool> importData(String jsonString) async {
    try {
      final data = jsonDecode(jsonString) as Map<String, dynamic>;
      
      if (data.containsKey('calculations')) {
        await _calculationBox.put(_calculationHistoryKey, data['calculations']);
      }
      
      if (data.containsKey('favorites')) {
        await _favoritesBox.put(_favoritesKey, data['favorites']);
      }
      
      if (data.containsKey('ai_settings')) {
        await setAISettings(data['ai_settings']);
      }
      
      if (data.containsKey('voice_settings')) {
        await setVoiceSettings(data['voice_settings']);
      }
      
      if (data.containsKey('user_stats')) {
        await updateUserStats(data['user_stats']);
      }
      
      if (data.containsKey('theme')) {
        final themeString = data['theme'].toString().split('.').last;
        ThemeMode themeMode;
        switch (themeString) {
          case 'light':
            themeMode = ThemeMode.light;
            break;
          case 'dark':
            themeMode = ThemeMode.dark;
            break;
          default:
            themeMode = ThemeMode.system;
        }
        await setThemeMode(themeMode);
      }
      
      if (data.containsKey('language')) {
        await setLanguage(data['language']);
      }
      
      return true;
    } catch (e) {
      print('Error importing data: $e');
      return false;
    }
  }
  
  // 🚀 ULTRA-PREMIUM AI FEATURES - Storage Support
  
  // Last Active Date for Streak Calculation
  static DateTime? getLastActiveDate() {
    final dateString = _prefs.getString('last_active_date');
    return dateString != null ? DateTime.parse(dateString) : null;
  }
  
  static Future<bool> setLastActiveDate(DateTime date) {
    return _prefs.setString('last_active_date', date.toIso8601String());
  }
  
  // Streak Days
  static int getStreakDays() {
    return _prefs.getInt('streak_days') ?? 0;
  }
  
  static Future<bool> setStreakDays(int days) {
    return _prefs.setInt('streak_days', days);
  }
  
  // User Profile for AI Personalization
  static Map<String, dynamic> getUserProfile() {
    final profileString = _prefs.getString('user_profile');
    if (profileString != null) {
      return Map<String, dynamic>.from(jsonDecode(profileString));
    }
    return {
      'math_level': 'beginner',
      'preferred_speed': 'normal',
      'learning_style': 'visual',
      'difficulty_preference': 1.0,
      'language_preference': 'en-US',
      'total_problems_solved': 0,
      'accuracy_rate': 0.0,
      'favorite_topics': <String>[],
      'ai_assistance_level': 'balanced'
    };
  }
  
  static Future<bool> setUserProfile(Map<String, dynamic> profile) {
    return _prefs.setString('user_profile', jsonEncode(profile));
  }
  
  // AI Learning History
  static List<String> getAILearningHistory() {
    final historyString = _prefs.getString('ai_learning_history');
    if (historyString != null) {
      return List<String>.from(jsonDecode(historyString));
    }
    return [];
  }
  
  static Future<bool> setAILearningHistory(List<String> history) {
    return _prefs.setString('ai_learning_history', jsonEncode(history));
  }
  
  // Performance Metrics
  static Map<String, dynamic> getPerformanceMetrics() {
    final metricsString = _prefs.getString('performance_metrics');
    if (metricsString != null) {
      return Map<String, dynamic>.from(jsonDecode(metricsString));
    }
    return {
      'total_queries': 0,
      'average_response_time': 0.0,
      'accuracy_score': 0.0,
      'success_rate': 0.0,
      'error_count': 0,
      'model_switches': 0
    };
  }
  
  static Future<bool> setPerformanceMetrics(Map<String, dynamic> metrics) {
    return _prefs.setString('performance_metrics', jsonEncode(metrics));
  }
  
  // Daily Challenges Data (Old format - kept for backwards compatibility)
  static Future<bool> setDailyChallengesOld(Map<String, dynamic> challenges) {
    return _prefs.setString('daily_challenges_old', jsonEncode(challenges));
  }
  
  // User Management (NEW)
  static Map<String, dynamic>? getCurrentUser() {
    final userString = _prefs.getString('current_user');
    if (userString != null) {
      return Map<String, dynamic>.from(jsonDecode(userString));
    }
    return null;
  }

  static Future<bool> saveCurrentUser(Map<String, dynamic> user) {
    return _prefs.setString('current_user', jsonEncode(user));
  }

  // Premium Status (NEW)
  static Map<String, dynamic> getPremiumStatus() {
    final statusString = _prefs.getString('premium_status');
    if (statusString != null) {
      return Map<String, dynamic>.from(jsonDecode(statusString));
    }
    return {};
  }

  static Future<bool> savePremiumStatus(Map<String, dynamic> status) {
    return _prefs.setString('premium_status', jsonEncode(status));
  }

  // Challenges (NEW)
  static List<Map<String, dynamic>> getDailyChallenges() {
    final challengesString = _prefs.getString('daily_challenges');
    if (challengesString != null) {
      final decoded = jsonDecode(challengesString);
      return List<Map<String, dynamic>>.from(decoded);
    }
    return [];
  }

  static Future<bool> saveDailyChallenges(List<Map<String, dynamic>> challenges) {
    return _prefs.setString('daily_challenges', jsonEncode(challenges));
  }

  static List<Map<String, dynamic>> getWeeklyChallenges() {
    final challengesString = _prefs.getString('weekly_challenges');
    if (challengesString != null) {
      final decoded = jsonDecode(challengesString);
      return List<Map<String, dynamic>>.from(decoded);
    }
    return [];
  }

  static Future<bool> saveWeeklyChallenges(List<Map<String, dynamic>> challenges) {
    return _prefs.setString('weekly_challenges', jsonEncode(challenges));
  }

  static List<Map<String, dynamic>> getSpecialChallenges() {
    final challengesString = _prefs.getString('special_challenges');
    if (challengesString != null) {
      final decoded = jsonDecode(challengesString);
      return List<Map<String, dynamic>>.from(decoded);
    }
    return [];
  }

  static Future<bool> saveSpecialChallenges(List<Map<String, dynamic>> challenges) {
    return _prefs.setString('special_challenges', jsonEncode(challenges));
  }

  // Achievement Progress
  static List<Map<String, dynamic>> getAchievements() {
    final achievementsString = _prefs.getString('achievements');
    if (achievementsString != null) {
      final decoded = jsonDecode(achievementsString);
      return List<Map<String, dynamic>>.from(decoded);
    }
    return [
      {
        'id': 'first_calculation',
        'title': 'İlk Hesaplama',
        'description': 'İlk hesaplamayı yap',
        'icon': '🎯',
        'unlocked': false,
        'progress': 0,
        'target': 1
      },
      {
        'id': 'voice_master',
        'title': 'Ses Ustası',
        'description': '50 sesli komut kullan',
        'icon': '🎤',
        'unlocked': false,
        'progress': 0,
        'target': 50
      },
      {
        'id': 'photo_solver',
        'title': 'Fotoğraf Çözücü',
        'description': '25 fotoğrafla problem çöz',
        'icon': '📸',
        'unlocked': false,
        'progress': 0,
        'target': 25
      },
      {
        'id': 'streak_champion',
        'title': 'Streak Şampiyonu',
        'description': '30 gün kesintisiz kullan',
        'icon': '🔥',
        'unlocked': false,
        'progress': 0,
        'target': 30
      },
      {
        'id': 'ai_conversationalist',
        'title': 'AI Sohbet Ustası',
        'description': 'AI ile 100 sohbet yap',
        'icon': '🤖',
        'unlocked': false,
        'progress': 0,
        'target': 100
      }
    ];
  }
  
  static Future<bool> setAchievements(List<Map<String, dynamic>> achievements) {
    return _prefs.setString('achievements', jsonEncode(achievements));
  }
  
  // Gesture Recognition Data
  static Map<String, dynamic> getGestureData() {
    final gestureString = _prefs.getString('gesture_data');
    if (gestureString != null) {
      return Map<String, dynamic>.from(jsonDecode(gestureString));
    }
    return {
      'enabled': true,
      'sensitivity': 0.7,
      'custom_gestures': {},
      'recognition_count': 0
    };
  }
  
  static Future<bool> setGestureData(Map<String, dynamic> gestureData) {
    return _prefs.setString('gesture_data', jsonEncode(gestureData));
  }
  
  // Conversation History for AI
  static List<Map<String, String>> getConversationHistory() {
    final historyString = _prefs.getString('conversation_history');
    if (historyString != null) {
      final decoded = jsonDecode(historyString);
      return List<Map<String, String>>.from(
        decoded.map((item) => Map<String, String>.from(item))
      );
    }
    return [];
  }
  
  static Future<bool> setConversationHistory(List<Map<String, String>> history) {
    // Keep only last 100 conversations to save space
    final limitedHistory = history.length > 100 
        ? history.sublist(history.length - 100) 
        : history;
    return _prefs.setString('conversation_history', jsonEncode(limitedHistory));
  }
  
  // Predictive AI Data
  static Map<String, List<String>> getUserPatterns() {
    final patternsString = _prefs.getString('user_patterns');
    if (patternsString != null) {
      final decoded = jsonDecode(patternsString);
      return Map<String, List<String>>.from(
        decoded.map((k, v) => MapEntry(k, List<String>.from(v)))
      );
    }
    return {};
  }
  
  static Future<bool> setUserPatterns(Map<String, List<String>> patterns) {
    return _prefs.setString('user_patterns', jsonEncode(patterns));
  }
  
  // Clear AI Data (Privacy)
  static Future<void> clearAIData() async {
    await _prefs.remove('user_profile');
    await _prefs.remove('ai_learning_history');
    await _prefs.remove('conversation_history');
    await _prefs.remove('user_patterns');
    await _prefs.remove('performance_metrics');
  }
  
  // 🛡️ ============================================
  // SECURITY & ANTI-CRACK FUNCTIONS
  // ============================================
  
  /// Save security check timestamp
  static Future<bool> saveSecurityCheckTime(DateTime time) {
    return _prefs.setString('security_check_time', time.toIso8601String());
  }
  
  /// Get last security check time
  static DateTime? getSecurityCheckTime() {
    final timeString = _prefs.getString('security_check_time');
    if (timeString != null) {
      return DateTime.tryParse(timeString);
    }
    return null;
  }
  
  /// Log security violation
  static Future<void> logSecurityViolation(Map<String, dynamic> violation) async {
    final violations = getSecurityViolations();
    violations.add(violation);
    
    // Keep only last 50 violations
    final limitedViolations = violations.length > 50 
        ? violations.sublist(violations.length - 50) 
        : violations;
    
    await _prefs.setString('security_violations', jsonEncode(limitedViolations));
  }
  
  /// Get security violations
  static List<Map<String, dynamic>> getSecurityViolations() {
    final violationsString = _prefs.getString('security_violations');
    if (violationsString != null) {
      final decoded = jsonDecode(violationsString);
      return List<Map<String, dynamic>>.from(decoded);
    }
    return [];
  }
  
  /// Check if device is trusted
  static bool isDeviceTrusted() {
    return _prefs.getBool('device_trusted') ?? false;
  }
  
  /// Set device trust status
  static Future<bool> setDeviceTrusted(bool trusted) {
    return _prefs.setBool('device_trusted', trusted);
  }
  
  /// Save device fingerprint
  static Future<bool> saveDeviceFingerprint(String fingerprint) {
    return _prefs.setString('device_fingerprint', fingerprint);
  }
  
  /// Get device fingerprint
  static String getDeviceFingerprint() {
    return _prefs.getString('device_fingerprint') ?? '';
  }
  
  /// Increment security check failures
  static Future<void> incrementSecurityFailures() async {
    final count = getSecurityFailures();
    await _prefs.setInt('security_failures', count + 1);
  }
  
  /// Get security check failures
  static int getSecurityFailures() {
    return _prefs.getInt('security_failures') ?? 0;
  }
  
  /// Reset security failures
  static Future<void> resetSecurityFailures() async {
    await _prefs.setInt('security_failures', 0);
  }
  
  /// Save app integrity hash
  static Future<bool> saveAppIntegrityHash(String hash) {
    return _prefs.setString('app_integrity_hash', hash);
  }
  
  /// Get app integrity hash
  static String getAppIntegrityHash() {
    return _prefs.getString('app_integrity_hash') ?? '';
  }
}