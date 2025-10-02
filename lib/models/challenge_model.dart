class ChallengeModel {
  final String id;
  final String title;
  final String description;
  final String emoji;
  final int reward;
  final ChallengeDifficulty difficulty;
  final ChallengeType type;
  final int targetValue;
  final int currentProgress;
  final DateTime startDate;
  final DateTime endDate;
  final bool isCompleted;
  final bool isClaimed;

  ChallengeModel({
    required this.id,
    required this.title,
    required this.description,
    required this.emoji,
    required this.reward,
    required this.difficulty,
    required this.type,
    required this.targetValue,
    this.currentProgress = 0,
    required this.startDate,
    required this.endDate,
    this.isCompleted = false,
    this.isClaimed = false,
  });

  factory ChallengeModel.fromJson(Map<String, dynamic> json) {
    return ChallengeModel(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      emoji: json['emoji'],
      reward: json['reward'],
      difficulty: ChallengeDifficulty.values.firstWhere(
        (e) => e.toString() == json['difficulty'],
        orElse: () => ChallengeDifficulty.easy,
      ),
      type: ChallengeType.values.firstWhere(
        (e) => e.toString() == json['type'],
        orElse: () => ChallengeType.daily,
      ),
      targetValue: json['targetValue'],
      currentProgress: json['currentProgress'] ?? 0,
      startDate: DateTime.fromMillisecondsSinceEpoch(json['startDate']),
      endDate: DateTime.fromMillisecondsSinceEpoch(json['endDate']),
      isCompleted: json['isCompleted'] ?? false,
      isClaimed: json['isClaimed'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'emoji': emoji,
      'reward': reward,
      'difficulty': difficulty.toString(),
      'type': type.toString(),
      'targetValue': targetValue,
      'currentProgress': currentProgress,
      'startDate': startDate.millisecondsSinceEpoch,
      'endDate': endDate.millisecondsSinceEpoch,
      'isCompleted': isCompleted,
      'isClaimed': isClaimed,
    };
  }

  ChallengeModel copyWith({
    String? id,
    String? title,
    String? description,
    String? emoji,
    int? reward,
    ChallengeDifficulty? difficulty,
    ChallengeType? type,
    int? targetValue,
    int? currentProgress,
    DateTime? startDate,
    DateTime? endDate,
    bool? isCompleted,
    bool? isClaimed,
  }) {
    return ChallengeModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      emoji: emoji ?? this.emoji,
      reward: reward ?? this.reward,
      difficulty: difficulty ?? this.difficulty,
      type: type ?? this.type,
      targetValue: targetValue ?? this.targetValue,
      currentProgress: currentProgress ?? this.currentProgress,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      isCompleted: isCompleted ?? this.isCompleted,
      isClaimed: isClaimed ?? this.isClaimed,
    );
  }

  double get progress => currentProgress / targetValue;
  
  bool get isActive => DateTime.now().isBefore(endDate) && DateTime.now().isAfter(startDate);
  
  bool get isExpired => DateTime.now().isAfter(endDate);

  Duration get timeRemaining => endDate.difference(DateTime.now());

  String get timeRemainingText {
    final duration = timeRemaining;
    if (duration.isNegative) return 'Süre Doldu';
    
    if (duration.inDays > 0) {
      return '${duration.inDays} gün';
    } else if (duration.inHours > 0) {
      return '${duration.inHours} saat';
    } else if (duration.inMinutes > 0) {
      return '${duration.inMinutes} dakika';
    } else {
      return '${duration.inSeconds} saniye';
    }
  }

  String get difficultyText {
    switch (difficulty) {
      case ChallengeDifficulty.easy:
        return 'Kolay';
      case ChallengeDifficulty.medium:
        return 'Orta';
      case ChallengeDifficulty.hard:
        return 'Zor';
      case ChallengeDifficulty.expert:
        return 'Uzman';
    }
  }

  String get difficultyEmoji {
    switch (difficulty) {
      case ChallengeDifficulty.easy:
        return '🟢';
      case ChallengeDifficulty.medium:
        return '🟡';
      case ChallengeDifficulty.hard:
        return '🟠';
      case ChallengeDifficulty.expert:
        return '🔴';
    }
  }

  String get typeText {
    switch (type) {
      case ChallengeType.daily:
        return 'Günlük';
      case ChallengeType.weekly:
        return 'Haftalık';
      case ChallengeType.special:
        return 'Özel';
    }
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ChallengeModel &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}

enum ChallengeDifficulty {
  easy,
  medium,
  hard,
  expert,
}

enum ChallengeType {
  daily,
  weekly,
  special,
}

// Predefined Challenges
class Challenges {
  static List<ChallengeModel> generateDailyChallenges() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final tomorrow = today.add(const Duration(days: 1));

    return [
      ChallengeModel(
        id: 'daily_calc_10',
        title: '10 Hesaplama',
        description: 'Bugün 10 hesaplama yap',
        emoji: '🎯',
        reward: 50,
        difficulty: ChallengeDifficulty.easy,
        type: ChallengeType.daily,
        targetValue: 10,
        startDate: today,
        endDate: tomorrow,
      ),
      ChallengeModel(
        id: 'daily_ai_3',
        title: '3 AI Sorgu',
        description: 'Bugün 3 AI sorgusu yap',
        emoji: '🤖',
        reward: 100,
        difficulty: ChallengeDifficulty.medium,
        type: ChallengeType.daily,
        targetValue: 3,
        startDate: today,
        endDate: tomorrow,
      ),
      ChallengeModel(
        id: 'daily_converter_5',
        title: '5 Dönüştürme',
        description: 'Bugün 5 birim dönüştür',
        emoji: '🔄',
        reward: 75,
        difficulty: ChallengeDifficulty.easy,
        type: ChallengeType.daily,
        targetValue: 5,
        startDate: today,
        endDate: tomorrow,
      ),
    ];
  }

  static List<ChallengeModel> generateWeeklyChallenges() {
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
    final endOfWeek = startOfWeek.add(const Duration(days: 7));

    return [
      ChallengeModel(
        id: 'weekly_calc_100',
        title: '100 Hesaplama',
        description: 'Bu hafta 100 hesaplama yap',
        emoji: '🏆',
        reward: 300,
        difficulty: ChallengeDifficulty.medium,
        type: ChallengeType.weekly,
        targetValue: 100,
        startDate: startOfWeek,
        endDate: endOfWeek,
      ),
      ChallengeModel(
        id: 'weekly_streak_7',
        title: '7 Günlük Seri',
        description: 'Bu hafta her gün kullan',
        emoji: '🔥',
        reward: 500,
        difficulty: ChallengeDifficulty.hard,
        type: ChallengeType.weekly,
        targetValue: 7,
        startDate: startOfWeek,
        endDate: endOfWeek,
      ),
      ChallengeModel(
        id: 'weekly_variety',
        title: 'Çeşitlilik',
        description: 'Tüm hesaplayıcı türlerini kullan',
        emoji: '🌈',
        reward: 400,
        difficulty: ChallengeDifficulty.hard,
        type: ChallengeType.weekly,
        targetValue: 5,
        startDate: startOfWeek,
        endDate: endOfWeek,
      ),
    ];
  }

  static List<ChallengeModel> generateSpecialChallenges() {
    final now = DateTime.now();
    final endOfMonth = DateTime(now.year, now.month + 1, 0);

    return [
      ChallengeModel(
        id: 'special_master',
        title: 'Matematik Ustası',
        description: '1000 hesaplama yap',
        emoji: '⚡',
        reward: 2000,
        difficulty: ChallengeDifficulty.expert,
        type: ChallengeType.special,
        targetValue: 1000,
        startDate: DateTime(now.year, now.month, 1),
        endDate: endOfMonth,
      ),
      ChallengeModel(
        id: 'special_ai_master',
        title: 'AI Ustası',
        description: '50 AI sorgusu yap',
        emoji: '🧠',
        reward: 1500,
        difficulty: ChallengeDifficulty.expert,
        type: ChallengeType.special,
        targetValue: 50,
        startDate: DateTime(now.year, now.month, 1),
        endDate: endOfMonth,
      ),
    ];
  }
}