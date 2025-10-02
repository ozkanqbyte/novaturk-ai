class UserModel {
  final String id;
  final String username;
  final String email;
  final String? avatarUrl;
  final int points;
  final int level;
  final int totalCalculations;
  final int dailyStreak;
  final DateTime joinDate;
  final DateTime? lastActive;
  final bool isPremium;
  final DateTime? premiumExpiryDate;
  final List<String> unlockedAchievements;
  final Map<String, dynamic>? settings;
  final Map<String, int>? statistics;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    this.avatarUrl,
    this.points = 0,
    this.level = 1,
    this.totalCalculations = 0,
    this.dailyStreak = 0,
    required this.joinDate,
    this.lastActive,
    this.isPremium = false,
    this.premiumExpiryDate,
    this.unlockedAchievements = const [],
    this.settings,
    this.statistics,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      username: json['username'] ?? 'Kullanıcı',
      email: json['email'] ?? '',
      avatarUrl: json['avatarUrl'],
      points: json['points'] ?? 0,
      level: json['level'] ?? 1,
      totalCalculations: json['totalCalculations'] ?? 0,
      dailyStreak: json['dailyStreak'] ?? 0,
      joinDate: json['joinDate'] != null 
          ? DateTime.fromMillisecondsSinceEpoch(json['joinDate'])
          : DateTime.now(),
      lastActive: json['lastActive'] != null
          ? DateTime.fromMillisecondsSinceEpoch(json['lastActive'])
          : null,
      isPremium: json['isPremium'] ?? false,
      premiumExpiryDate: json['premiumExpiryDate'] != null
          ? DateTime.fromMillisecondsSinceEpoch(json['premiumExpiryDate'])
          : null,
      unlockedAchievements: json['unlockedAchievements'] != null
          ? List<String>.from(json['unlockedAchievements'])
          : [],
      settings: json['settings'],
      statistics: json['statistics'] != null
          ? Map<String, int>.from(json['statistics'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'avatarUrl': avatarUrl,
      'points': points,
      'level': level,
      'totalCalculations': totalCalculations,
      'dailyStreak': dailyStreak,
      'joinDate': joinDate.millisecondsSinceEpoch,
      'lastActive': lastActive?.millisecondsSinceEpoch,
      'isPremium': isPremium,
      'premiumExpiryDate': premiumExpiryDate?.millisecondsSinceEpoch,
      'unlockedAchievements': unlockedAchievements,
      'settings': settings,
      'statistics': statistics,
    };
  }

  UserModel copyWith({
    String? id,
    String? username,
    String? email,
    String? avatarUrl,
    int? points,
    int? level,
    int? totalCalculations,
    int? dailyStreak,
    DateTime? joinDate,
    DateTime? lastActive,
    bool? isPremium,
    DateTime? premiumExpiryDate,
    List<String>? unlockedAchievements,
    Map<String, dynamic>? settings,
    Map<String, int>? statistics,
  }) {
    return UserModel(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      points: points ?? this.points,
      level: level ?? this.level,
      totalCalculations: totalCalculations ?? this.totalCalculations,
      dailyStreak: dailyStreak ?? this.dailyStreak,
      joinDate: joinDate ?? this.joinDate,
      lastActive: lastActive ?? this.lastActive,
      isPremium: isPremium ?? this.isPremium,
      premiumExpiryDate: premiumExpiryDate ?? this.premiumExpiryDate,
      unlockedAchievements: unlockedAchievements ?? this.unlockedAchievements,
      settings: settings ?? this.settings,
      statistics: statistics ?? this.statistics,
    );
  }

  // Getters
  String get levelTitle {
    if (points < 100) return 'Başlangıç';
    if (points < 500) return 'Amatör';
    if (points < 1000) return 'Uzman';
    if (points < 2500) return 'Profesyonel';
    if (points < 5000) return 'Usta';
    if (points < 10000) return 'Efsane';
    return 'Tanrı';
  }

  String get levelEmoji {
    if (points < 100) return '🌱';
    if (points < 500) return '⭐';
    if (points < 1000) return '💫';
    if (points < 2500) return '🏆';
    if (points < 5000) return '👑';
    if (points < 10000) return '🔥';
    return '⚡';
  }

  int get nextLevelPoints {
    if (points < 100) return 100;
    if (points < 500) return 500;
    if (points < 1000) return 1000;
    if (points < 2500) return 2500;
    if (points < 5000) return 5000;
    if (points < 10000) return 10000;
    return 99999;
  }

  double get levelProgress {
    final currentLevelMin = _getCurrentLevelMin();
    final nextLevel = nextLevelPoints;
    return (points - currentLevelMin) / (nextLevel - currentLevelMin);
  }

  int _getCurrentLevelMin() {
    if (points < 100) return 0;
    if (points < 500) return 100;
    if (points < 1000) return 500;
    if (points < 2500) return 1000;
    if (points < 5000) return 2500;
    if (points < 10000) return 5000;
    return 10000;
  }

  bool hasAchievement(String achievementId) {
    return unlockedAchievements.contains(achievementId);
  }

  bool get isPremiumActive {
    if (!isPremium) return false;
    if (premiumExpiryDate == null) return true;
    return premiumExpiryDate!.isAfter(DateTime.now());
  }

  int get achievementCount => unlockedAchievements.length;

  String get formattedJoinDate {
    final months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return '${joinDate.day} ${months[joinDate.month - 1]} ${joinDate.year}';
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserModel && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}