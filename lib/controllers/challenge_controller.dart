import 'package:flutter/material.dart';
import '../models/challenge_model.dart';
import '../services/storage_service.dart';

class ChallengeController extends ChangeNotifier {
  List<ChallengeModel> _dailyChallenges = [];
  List<ChallengeModel> _weeklyChallenges = [];
  List<ChallengeModel> _specialChallenges = [];
  bool _isLoading = false;

  // Getters
  List<ChallengeModel> get dailyChallenges => _dailyChallenges;
  List<ChallengeModel> get weeklyChallenges => _weeklyChallenges;
  List<ChallengeModel> get specialChallenges => _specialChallenges;
  List<ChallengeModel> get allChallenges =>
      [..._dailyChallenges, ..._weeklyChallenges, ..._specialChallenges];
  bool get isLoading => _isLoading;

  List<ChallengeModel> get activeChallenges =>
      allChallenges.where((c) => c.isActive && !c.isCompleted).toList();
  
  List<ChallengeModel> get completedChallenges =>
      allChallenges.where((c) => c.isCompleted).toList();
  
  int get totalActivePoints =>
      activeChallenges.fold(0, (sum, c) => sum + c.reward);

  ChallengeController() {
    _initialize();
  }

  Future<void> _initialize() async {
    _isLoading = true;
    notifyListeners();

    await _loadChallenges();

    _isLoading = false;
    notifyListeners();
  }

  Future<void> _loadChallenges() async {
    // Load from storage
    final dailyData = StorageService.getDailyChallenges();
    final weeklyData = StorageService.getWeeklyChallenges();
    final specialData = StorageService.getSpecialChallenges();

    if (dailyData.isNotEmpty) {
      _dailyChallenges = dailyData.map((d) => ChallengeModel.fromJson(d)).toList();
    } else {
      _dailyChallenges = Challenges.generateDailyChallenges();
      await _saveDailyChallenges();
    }

    if (weeklyData.isNotEmpty) {
      _weeklyChallenges = weeklyData.map((d) => ChallengeModel.fromJson(d)).toList();
    } else {
      _weeklyChallenges = Challenges.generateWeeklyChallenges();
      await _saveWeeklyChallenges();
    }

    if (specialData.isNotEmpty) {
      _specialChallenges = specialData.map((d) => ChallengeModel.fromJson(d)).toList();
    } else {
      _specialChallenges = Challenges.generateSpecialChallenges();
      await _saveSpecialChallenges();
    }

    // Clean up expired challenges
    await _cleanupExpiredChallenges();
  }

  Future<void> _saveDailyChallenges() async {
    final data = _dailyChallenges.map((c) => c.toJson()).toList();
    await StorageService.saveDailyChallenges(data);
  }

  Future<void> _saveWeeklyChallenges() async {
    final data = _weeklyChallenges.map((c) => c.toJson()).toList();
    await StorageService.saveWeeklyChallenges(data);
  }

  Future<void> _saveSpecialChallenges() async {
    final data = _specialChallenges.map((c) => c.toJson()).toList();
    await StorageService.saveSpecialChallenges(data);
  }

  Future<void> _cleanupExpiredChallenges() async {
    _dailyChallenges.removeWhere((c) => c.isExpired);
    _weeklyChallenges.removeWhere((c) => c.isExpired);
    
    // Regenerate if empty
    if (_dailyChallenges.isEmpty) {
      _dailyChallenges = Challenges.generateDailyChallenges();
      await _saveDailyChallenges();
    }

    if (_weeklyChallenges.isEmpty) {
      _weeklyChallenges = Challenges.generateWeeklyChallenges();
      await _saveWeeklyChallenges();
    }
  }

  // Update challenge progress
  Future<void> updateChallengeProgress(String challengeId, int increment) async {
    ChallengeModel? challenge;
    List<ChallengeModel>? targetList;

    // Find challenge
    if (_dailyChallenges.any((c) => c.id == challengeId)) {
      targetList = _dailyChallenges;
      challenge = _dailyChallenges.firstWhere((c) => c.id == challengeId);
    } else if (_weeklyChallenges.any((c) => c.id == challengeId)) {
      targetList = _weeklyChallenges;
      challenge = _weeklyChallenges.firstWhere((c) => c.id == challengeId);
    } else if (_specialChallenges.any((c) => c.id == challengeId)) {
      targetList = _specialChallenges;
      challenge = _specialChallenges.firstWhere((c) => c.id == challengeId);
    }

    if (challenge == null || targetList == null) return;

    final newProgress = (challenge.currentProgress + increment)
        .clamp(0, challenge.targetValue);
    final isCompleted = newProgress >= challenge.targetValue;

    final updatedChallenge = challenge.copyWith(
      currentProgress: newProgress,
      isCompleted: isCompleted,
    );

    final index = targetList.indexOf(challenge);
    targetList[index] = updatedChallenge;

    // Save
    if (targetList == _dailyChallenges) {
      await _saveDailyChallenges();
    } else if (targetList == _weeklyChallenges) {
      await _saveWeeklyChallenges();
    } else {
      await _saveSpecialChallenges();
    }

    notifyListeners();
  }

  // Track activities
  Future<void> onCalculation() async {
    await updateChallengeProgress('daily_calc_10', 1);
    await updateChallengeProgress('weekly_calc_100', 1);
  }

  Future<void> onAIQuery() async {
    await updateChallengeProgress('daily_ai_3', 1);
  }

  Future<void> onConverter() async {
    await updateChallengeProgress('daily_converter_5', 1);
  }

  Future<void> onDailyUse() async {
    await updateChallengeProgress('weekly_streak_7', 1);
  }

  // Claim reward
  Future<int> claimReward(String challengeId) async {
    ChallengeModel? challenge;
    List<ChallengeModel>? targetList;

    // Find challenge
    if (_dailyChallenges.any((c) => c.id == challengeId)) {
      targetList = _dailyChallenges;
      challenge = _dailyChallenges.firstWhere((c) => c.id == challengeId);
    } else if (_weeklyChallenges.any((c) => c.id == challengeId)) {
      targetList = _weeklyChallenges;
      challenge = _weeklyChallenges.firstWhere((c) => c.id == challengeId);
    } else if (_specialChallenges.any((c) => c.id == challengeId)) {
      targetList = _specialChallenges;
      challenge = _specialChallenges.firstWhere((c) => c.id == challengeId);
    }

    if (challenge == null || !challenge.isCompleted || challenge.isClaimed) {
      return 0;
    }

    final updatedChallenge = challenge.copyWith(isClaimed: true);
    final index = targetList!.indexOf(challenge);
    targetList[index] = updatedChallenge;

    // Save
    if (targetList == _dailyChallenges) {
      await _saveDailyChallenges();
    } else if (targetList == _weeklyChallenges) {
      await _saveWeeklyChallenges();
    } else {
      await _saveSpecialChallenges();
    }

    notifyListeners();
    return challenge.reward;
  }

  // Get challenge by ID
  ChallengeModel? getChallengeById(String id) {
    try {
      return allChallenges.firstWhere((c) => c.id == id);
    } catch (e) {
      return null;
    }
  }

  // Get challenges by type
  List<ChallengeModel> getChallengesByType(ChallengeType type) {
    return allChallenges.where((c) => c.type == type).toList();
  }

  // Get challenges by difficulty
  List<ChallengeModel> getChallengesByDifficulty(ChallengeDifficulty difficulty) {
    return allChallenges.where((c) => c.difficulty == difficulty).toList();
  }

  // Refresh challenges (force regenerate)
  Future<void> refreshChallenges() async {
    _dailyChallenges = Challenges.generateDailyChallenges();
    _weeklyChallenges = Challenges.generateWeeklyChallenges();
    _specialChallenges = Challenges.generateSpecialChallenges();

    await _saveDailyChallenges();
    await _saveWeeklyChallenges();
    await _saveSpecialChallenges();

    notifyListeners();
  }

  // Get statistics
  Map<String, dynamic> getStatistics() {
    return {
      'totalChallenges': allChallenges.length,
      'activeChallenges': activeChallenges.length,
      'completedChallenges': completedChallenges.length,
      'totalPossibleRewards': totalActivePoints,
      'claimedRewards': completedChallenges
          .where((c) => c.isClaimed)
          .fold(0, (sum, c) => sum + c.reward),
    };
  }
}