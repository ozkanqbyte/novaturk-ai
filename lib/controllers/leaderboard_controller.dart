import 'package:flutter/material.dart';
import '../models/leaderboard_model.dart';

class LeaderboardController extends ChangeNotifier {
  LeaderboardData? _currentLeaderboard;
  LeaderboardPeriod _currentPeriod = LeaderboardPeriod.allTime;
  bool _isLoading = false;
  String? _error;

  // Getters
  LeaderboardData? get currentLeaderboard => _currentLeaderboard;
  LeaderboardPeriod get currentPeriod => _currentPeriod;
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<LeaderboardEntry> get entries => _currentLeaderboard?.entries ?? [];
  LeaderboardEntry? get currentUser => _currentLeaderboard?.currentUser;

  LeaderboardController() {
    loadLeaderboard();
  }

  Future<void> loadLeaderboard({LeaderboardPeriod? period}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      if (period != null) {
        _currentPeriod = period;
      }

      // Simulate API call delay
      await Future.delayed(const Duration(milliseconds: 800));

      // For now, use mock data
      // In production, this would fetch from API
      _currentLeaderboard = LeaderboardData.generateMockData(
        period: _currentPeriod,
        entryCount: 50,
      );

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Liderlik tablosu yüklenirken hata oluştu';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> switchPeriod(LeaderboardPeriod period) async {
    if (_currentPeriod == period) return;
    await loadLeaderboard(period: period);
  }

  Future<void> refresh() async {
    await loadLeaderboard();
  }

  // Get user rank for current period
  int? getCurrentUserRank() {
    return currentUser?.rank;
  }

  // Get top 3 users
  List<LeaderboardEntry> getTopThree() {
    if (_currentLeaderboard == null || entries.isEmpty) return [];
    return entries.take(3).toList();
  }

  // Get users around current user
  List<LeaderboardEntry> getUsersAroundCurrent({int range = 5}) {
    if (_currentLeaderboard == null || currentUser == null) return [];

    final currentRank = currentUser!.rank;
    final startRank = (currentRank - range).clamp(1, entries.length);
    final endRank = (currentRank + range).clamp(1, entries.length);

    return entries
        .where((e) => e.rank >= startRank && e.rank <= endRank)
        .toList();
  }

  // Search user by username
  LeaderboardEntry? findUserByUsername(String username) {
    if (_currentLeaderboard == null) return null;
    
    try {
      return entries.firstWhere(
        (e) => e.username.toLowerCase().contains(username.toLowerCase()),
      );
    } catch (e) {
      return null;
    }
  }

  // Get rank change (would require historical data)
  String getRankChange(String userId) {
    // This would compare with previous period data
    // For now, return mock data
    return '↑ 5';
  }

  String getPeriodText() {
    return _currentLeaderboard?.periodText ?? 'Tüm Zamanlar';
  }
}