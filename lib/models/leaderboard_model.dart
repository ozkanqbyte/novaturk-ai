class LeaderboardEntry {
  final String userId;
  final String username;
  final String? avatarUrl;
  final int points;
  final int rank;
  final int level;
  final int totalCalculations;
  final String? country;
  final bool isCurrentUser;
  final Map<String, dynamic>? badges;

  LeaderboardEntry({
    required this.userId,
    required this.username,
    this.avatarUrl,
    required this.points,
    required this.rank,
    required this.level,
    required this.totalCalculations,
    this.country,
    this.isCurrentUser = false,
    this.badges,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      userId: json['userId'],
      username: json['username'],
      avatarUrl: json['avatarUrl'],
      points: json['points'],
      rank: json['rank'],
      level: json['level'],
      totalCalculations: json['totalCalculations'],
      country: json['country'],
      isCurrentUser: json['isCurrentUser'] ?? false,
      badges: json['badges'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'avatarUrl': avatarUrl,
      'points': points,
      'rank': rank,
      'level': level,
      'totalCalculations': totalCalculations,
      'country': country,
      'isCurrentUser': isCurrentUser,
      'badges': badges,
    };
  }

  String get rankEmoji {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🏅';
    }
  }

  String get rankText {
    if (rank <= 3) return '';
    return '#$rank';
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is LeaderboardEntry &&
          runtimeType == other.runtimeType &&
          userId == other.userId;

  @override
  int get hashCode => userId.hashCode;
}

enum LeaderboardPeriod {
  daily,
  weekly,
  monthly,
  allTime,
}

class LeaderboardData {
  final LeaderboardPeriod period;
  final List<LeaderboardEntry> entries;
  final LeaderboardEntry? currentUser;
  final DateTime lastUpdated;

  LeaderboardData({
    required this.period,
    required this.entries,
    this.currentUser,
    required this.lastUpdated,
  });

  factory LeaderboardData.fromJson(Map<String, dynamic> json) {
    return LeaderboardData(
      period: LeaderboardPeriod.values.firstWhere(
        (e) => e.toString() == json['period'],
        orElse: () => LeaderboardPeriod.allTime,
      ),
      entries: (json['entries'] as List)
          .map((e) => LeaderboardEntry.fromJson(e))
          .toList(),
      currentUser: json['currentUser'] != null
          ? LeaderboardEntry.fromJson(json['currentUser'])
          : null,
      lastUpdated: DateTime.fromMillisecondsSinceEpoch(json['lastUpdated']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'period': period.toString(),
      'entries': entries.map((e) => e.toJson()).toList(),
      'currentUser': currentUser?.toJson(),
      'lastUpdated': lastUpdated.millisecondsSinceEpoch,
    };
  }

  String get periodText {
    switch (period) {
      case LeaderboardPeriod.daily:
        return 'Günlük';
      case LeaderboardPeriod.weekly:
        return 'Haftalık';
      case LeaderboardPeriod.monthly:
        return 'Aylık';
      case LeaderboardPeriod.allTime:
        return 'Tüm Zamanlar';
    }
  }

  // Mock data generator for testing
  static LeaderboardData generateMockData({
    LeaderboardPeriod period = LeaderboardPeriod.allTime,
    int entryCount = 20,
    String currentUserId = 'current_user',
  }) {
    final entries = List.generate(entryCount, (index) {
      final isCurrentUser = index == 10; // Current user at rank 11
      return LeaderboardEntry(
        userId: isCurrentUser ? currentUserId : 'user_$index',
        username: isCurrentUser ? 'Sen' : 'Kullanıcı ${index + 1}',
        points: 10000 - (index * 500),
        rank: index + 1,
        level: 50 - (index * 2),
        totalCalculations: 1000 - (index * 50),
        isCurrentUser: isCurrentUser,
        country: 'TR',
      );
    });

    final currentUser = entries.firstWhere((e) => e.isCurrentUser);

    return LeaderboardData(
      period: period,
      entries: entries,
      currentUser: currentUser,
      lastUpdated: DateTime.now(),
    );
  }
}