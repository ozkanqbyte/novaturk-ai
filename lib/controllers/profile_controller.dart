import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../models/achievement_model.dart';
import '../services/storage_service.dart';
import '../core/constants/app_constants.dart';

class ProfileController extends ChangeNotifier {
  UserModel? _currentUser;
  List<AchievementModel> _allAchievements = [];
  List<AchievementModel> _unlockedAchievements = [];
  bool _isLoading = false;

  // Getters
  UserModel? get currentUser => _currentUser;
  List<AchievementModel> get allAchievements => _allAchievements;
  List<AchievementModel> get unlockedAchievements => _unlockedAchievements;
  List<AchievementModel> get lockedAchievements =>
      _allAchievements.where((a) => !_isAchievementUnlocked(a.id)).toList();
  bool get isLoading => _isLoading;
  bool get hasUser => _currentUser != null;

  ProfileController() {
    _initialize();
  }

  Future<void> _initialize() async {
    _isLoading = true;
    notifyListeners();

    await _loadUser();
    await _loadAchievements();

    _isLoading = false;
    notifyListeners();
  }

  Future<void> _loadUser() async {
    final userData = StorageService.getCurrentUser();
    if (userData != null) {
      _currentUser = UserModel.fromJson(userData);
    } else {
      // Create default user
      _currentUser = UserModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        username: 'Kullanıcı',
        email: '',
        joinDate: DateTime.now(),
        points: 0,
        level: 1,
        totalCalculations: 0,
        dailyStreak: 0,
      );
      await _saveUser();
    }
  }

  Future<void> _loadAchievements() async {
    _allAchievements = Achievements.all;
    if (_currentUser != null) {
      _unlockedAchievements = _allAchievements
          .where((a) => _currentUser!.hasAchievement(a.id))
          .toList();
    }
  }

  Future<void> _saveUser() async {
    if (_currentUser != null) {
      await StorageService.saveCurrentUser(_currentUser!.toJson());
    }
  }

  // User Management
  Future<void> updateUsername(String username) async {
    if (_currentUser == null) return;
    _currentUser = _currentUser!.copyWith(username: username);
    await _saveUser();
    notifyListeners();
  }

  Future<void> updateEmail(String email) async {
    if (_currentUser == null) return;
    _currentUser = _currentUser!.copyWith(email: email);
    await _saveUser();
    notifyListeners();
  }

  Future<void> updateAvatar(String avatarUrl) async {
    if (_currentUser == null) return;
    _currentUser = _currentUser!.copyWith(avatarUrl: avatarUrl);
    await _saveUser();
    notifyListeners();
  }

  // Points & Level Management
  Future<void> addPoints(int points) async {
    if (_currentUser == null) return;
    
    final oldLevel = _currentUser!.level;
    final newPoints = _currentUser!.points + points;
    
    _currentUser = _currentUser!.copyWith(points: newPoints);
    
    // Check for level up
    final newLevel = _calculateLevel(newPoints);
    if (newLevel > oldLevel) {
      _currentUser = _currentUser!.copyWith(level: newLevel);
      // Could trigger a level up animation/celebration here
    }
    
    await _saveUser();
    notifyListeners();
  }

  int _calculateLevel(int points) {
    if (points < 100) return 1;
    if (points < 500) return 2;
    if (points < 1000) return 3;
    if (points < 2500) return 4;
    if (points < 5000) return 5;
    if (points < 10000) return 6;
    return 7;
  }

  // Calculations Management
  Future<void> incrementCalculations() async {
    if (_currentUser == null) return;
    
    final newTotal = _currentUser!.totalCalculations + 1;
    _currentUser = _currentUser!.copyWith(totalCalculations: newTotal);
    
    // Add points
    await addPoints(AppConstants.pointsBasicCalculation);
    
    // Check calculation-based achievements
    await _checkCalculationAchievements(newTotal);
    
    await _saveUser();
    notifyListeners();
  }

  Future<void> _checkCalculationAchievements(int total) async {
    final achievementsToCheck = [
      ('first_calculation', 1),
      ('calc_10', 10),
      ('calc_100', 100),
      ('calc_1000', 1000),
      ('calc_10000', 10000),
    ];

    for (final (id, required) in achievementsToCheck) {
      if (total >= required && !_isAchievementUnlocked(id)) {
        await unlockAchievement(id);
      }
    }
  }

  // Streak Management
  Future<void> updateStreak() async {
    if (_currentUser == null) return;

    final now = DateTime.now();
    final lastActive = _currentUser!.lastActive;

    if (lastActive == null) {
      // First time using app today
      _currentUser = _currentUser!.copyWith(
        dailyStreak: 1,
        lastActive: now,
      );
    } else {
      final difference = now.difference(lastActive).inDays;
      
      if (difference == 1) {
        // Consecutive day
        final newStreak = _currentUser!.dailyStreak + 1;
        _currentUser = _currentUser!.copyWith(
          dailyStreak: newStreak,
          lastActive: now,
        );
        
        // Add streak bonus
        await addPoints(AppConstants.pointsDailyStreak);
        
        // Check streak achievements
        await _checkStreakAchievements(newStreak);
      } else if (difference > 1) {
        // Streak broken
        _currentUser = _currentUser!.copyWith(
          dailyStreak: 1,
          lastActive: now,
        );
      } else {
        // Same day, just update last active
        _currentUser = _currentUser!.copyWith(lastActive: now);
      }
    }

    await _saveUser();
    notifyListeners();
  }

  Future<void> _checkStreakAchievements(int streak) async {
    final achievementsToCheck = [
      ('streak_7', 7),
      ('streak_30', 30),
      ('streak_100', 100),
    ];

    for (final (id, required) in achievementsToCheck) {
      if (streak >= required && !_isAchievementUnlocked(id)) {
        await unlockAchievement(id);
      }
    }
  }

  // Achievement Management
  bool _isAchievementUnlocked(String achievementId) {
    return _currentUser?.hasAchievement(achievementId) ?? false;
  }

  Future<void> unlockAchievement(String achievementId) async {
    if (_currentUser == null) return;
    if (_isAchievementUnlocked(achievementId)) return;

    final achievement = Achievements.getById(achievementId);
    if (achievement == null) return;

    final updatedAchievements = List<String>.from(_currentUser!.unlockedAchievements)
      ..add(achievementId);

    _currentUser = _currentUser!.copyWith(
      unlockedAchievements: updatedAchievements,
    );

    // Add achievement points
    await addPoints(achievement.points);

    // Update unlocked achievements list
    _unlockedAchievements.add(achievement);

    await _saveUser();
    notifyListeners();

    // Could show achievement unlocked animation here
  }

  double getAchievementProgress(String achievementId) {
    if (_isAchievementUnlocked(achievementId)) return 1.0;

    final achievement = Achievements.getById(achievementId);
    if (achievement == null || _currentUser == null) return 0.0;

    switch (achievement.category) {
      case AchievementCategory.calculation:
        return (_currentUser!.totalCalculations / achievement.requiredValue)
            .clamp(0.0, 1.0);
      case AchievementCategory.streak:
        return (_currentUser!.dailyStreak / achievement.requiredValue)
            .clamp(0.0, 1.0);
      default:
        return 0.0;
    }
  }

  // Premium Management
  Future<void> activatePremium({int? days}) async {
    if (_currentUser == null) return;

    final expiryDate = days != null
        ? DateTime.now().add(Duration(days: days))
        : null; // null means lifetime premium

    _currentUser = _currentUser!.copyWith(
      isPremium: true,
      premiumExpiryDate: expiryDate,
    );

    await unlockAchievement('premium_member');
    await _saveUser();
    notifyListeners();
  }

  Future<void> deactivatePremium() async {
    if (_currentUser == null) return;

    _currentUser = _currentUser!.copyWith(
      isPremium: false,
      premiumExpiryDate: null,
    );

    await _saveUser();
    notifyListeners();
  }

  // Statistics
  Map<String, dynamic> getUserStatistics() {
    if (_currentUser == null) {
      return {
        'totalCalculations': 0,
        'totalPoints': 0,
        'level': 1,
        'dailyStreak': 0,
        'achievementsCount': 0,
        'isPremium': false,
      };
    }

    return {
      'totalCalculations': _currentUser!.totalCalculations,
      'totalPoints': _currentUser!.points,
      'level': _currentUser!.level,
      'levelTitle': _currentUser!.levelTitle,
      'levelEmoji': _currentUser!.levelEmoji,
      'dailyStreak': _currentUser!.dailyStreak,
      'achievementsCount': _currentUser!.achievementCount,
      'isPremium': _currentUser!.isPremiumActive,
      'joinDate': _currentUser!.formattedJoinDate,
      'nextLevelPoints': _currentUser!.nextLevelPoints,
      'levelProgress': _currentUser!.levelProgress,
    };
  }

  // Refresh/Reload
  Future<void> refresh() async {
    await _initialize();
  }

  // Reset (for testing)
  Future<void> resetProfile() async {
    _currentUser = UserModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      username: 'Kullanıcı',
      email: '',
      joinDate: DateTime.now(),
      points: 0,
      level: 1,
      totalCalculations: 0,
      dailyStreak: 0,
    );
    await _saveUser();
    await _loadAchievements();
    notifyListeners();
  }
}