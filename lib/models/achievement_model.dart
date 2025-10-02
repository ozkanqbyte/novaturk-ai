class AchievementModel {
  final String id;
  final String title;
  final String description;
  final String emoji;
  final int points;
  final AchievementTier tier;
  final AchievementCategory category;
  final int requiredValue;
  final String? imageUrl;
  final bool isSecret;

  AchievementModel({
    required this.id,
    required this.title,
    required this.description,
    required this.emoji,
    required this.points,
    required this.tier,
    required this.category,
    required this.requiredValue,
    this.imageUrl,
    this.isSecret = false,
  });

  factory AchievementModel.fromJson(Map<String, dynamic> json) {
    return AchievementModel(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      emoji: json['emoji'],
      points: json['points'],
      tier: AchievementTier.values.firstWhere(
        (e) => e.toString() == json['tier'],
        orElse: () => AchievementTier.bronze,
      ),
      category: AchievementCategory.values.firstWhere(
        (e) => e.toString() == json['category'],
        orElse: () => AchievementCategory.general,
      ),
      requiredValue: json['requiredValue'] ?? 0,
      imageUrl: json['imageUrl'],
      isSecret: json['isSecret'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'emoji': emoji,
      'points': points,
      'tier': tier.toString(),
      'category': category.toString(),
      'requiredValue': requiredValue,
      'imageUrl': imageUrl,
      'isSecret': isSecret,
    };
  }

  String get tierColor {
    switch (tier) {
      case AchievementTier.bronze:
        return '#CD7F32';
      case AchievementTier.silver:
        return '#C0C0C0';
      case AchievementTier.gold:
        return '#FFD700';
      case AchievementTier.platinum:
        return '#E5E4E2';
      case AchievementTier.diamond:
        return '#B9F2FF';
    }
  }

  String get categoryName {
    switch (category) {
      case AchievementCategory.general:
        return 'Genel';
      case AchievementCategory.calculation:
        return 'Hesaplama';
      case AchievementCategory.ai:
        return 'AI';
      case AchievementCategory.converter:
        return 'Dönüştürücü';
      case AchievementCategory.streak:
        return 'Seri';
      case AchievementCategory.social:
        return 'Sosyal';
      case AchievementCategory.premium:
        return 'Premium';
      case AchievementCategory.special:
        return 'Özel';
    }
  }
}

enum AchievementTier {
  bronze,
  silver,
  gold,
  platinum,
  diamond,
}

enum AchievementCategory {
  general,
  calculation,
  ai,
  converter,
  streak,
  social,
  premium,
  special,
}

// Predefined Achievements
class Achievements {
  static final List<AchievementModel> all = [
    AchievementModel(
      id: 'first_calculation',
      title: 'İlk Adım',
      description: 'İlk hesaplamanı yap',
      emoji: '🎯',
      points: 10,
      tier: AchievementTier.bronze,
      category: AchievementCategory.calculation,
      requiredValue: 1,
    ),
    AchievementModel(
      id: 'calc_10',
      title: 'Başlangıç',
      description: '10 hesaplama yap',
      emoji: '🌱',
      points: 50,
      tier: AchievementTier.bronze,
      category: AchievementCategory.calculation,
      requiredValue: 10,
    ),
    AchievementModel(
      id: 'calc_100',
      title: 'Üretken',
      description: '100 hesaplama yap',
      emoji: '⭐',
      points: 200,
      tier: AchievementTier.silver,
      category: AchievementCategory.calculation,
      requiredValue: 100,
    ),
    AchievementModel(
      id: 'calc_1000',
      title: 'Matematik Ustası',
      description: '1000 hesaplama yap',
      emoji: '🏆',
      points: 1000,
      tier: AchievementTier.gold,
      category: AchievementCategory.calculation,
      requiredValue: 1000,
    ),
    AchievementModel(
      id: 'calc_10000',
      title: 'Matematik Tanrısı',
      description: '10000 hesaplama yap',
      emoji: '⚡',
      points: 5000,
      tier: AchievementTier.diamond,
      category: AchievementCategory.calculation,
      requiredValue: 10000,
    ),
    AchievementModel(
      id: 'first_ai',
      title: 'AI ile Tanışma',
      description: 'İlk AI sorguyu yap',
      emoji: '🤖',
      points: 50,
      tier: AchievementTier.bronze,
      category: AchievementCategory.ai,
      requiredValue: 1,
    ),
    AchievementModel(
      id: 'voice_master',
      title: 'Ses Komutu Ustası',
      description: '50 sesli komut kullan',
      emoji: '🎤',
      points: 300,
      tier: AchievementTier.silver,
      category: AchievementCategory.ai,
      requiredValue: 50,
    ),
    AchievementModel(
      id: 'camera_expert',
      title: 'Kamera Uzmanı',
      description: '25 fotoğraf çöz',
      emoji: '📸',
      points: 400,
      tier: AchievementTier.gold,
      category: AchievementCategory.ai,
      requiredValue: 25,
    ),
    AchievementModel(
      id: 'streak_7',
      title: '7 Günlük Seri',
      description: '7 gün üst üste kullan',
      emoji: '🔥',
      points: 100,
      tier: AchievementTier.bronze,
      category: AchievementCategory.streak,
      requiredValue: 7,
    ),
    AchievementModel(
      id: 'streak_30',
      title: '30 Günlük Seri',
      description: '30 gün üst üste kullan',
      emoji: '💥',
      points: 500,
      tier: AchievementTier.silver,
      category: AchievementCategory.streak,
      requiredValue: 30,
    ),
    AchievementModel(
      id: 'streak_100',
      title: '100 Günlük Seri',
      description: '100 gün üst üste kullan',
      emoji: '🌟',
      points: 2000,
      tier: AchievementTier.gold,
      category: AchievementCategory.streak,
      requiredValue: 100,
    ),
    AchievementModel(
      id: 'converter_master',
      title: 'Dönüştürme Ustası',
      description: '100 birim dönüştür',
      emoji: '🔄',
      points: 300,
      tier: AchievementTier.silver,
      category: AchievementCategory.converter,
      requiredValue: 100,
    ),
    AchievementModel(
      id: 'social_butterfly',
      title: 'Sosyal Kelebek',
      description: '10 hesaplama paylaş',
      emoji: '🦋',
      points: 200,
      tier: AchievementTier.bronze,
      category: AchievementCategory.social,
      requiredValue: 10,
    ),
    AchievementModel(
      id: 'premium_member',
      title: 'Premium Üye',
      description: 'Premium üyeliğe katıl',
      emoji: '👑',
      points: 1000,
      tier: AchievementTier.platinum,
      category: AchievementCategory.premium,
      requiredValue: 1,
    ),
    AchievementModel(
      id: 'night_owl',
      title: 'Gece Kuşu',
      description: 'Gece 2-4 arası 10 hesaplama yap',
      emoji: '🦉',
      points: 150,
      tier: AchievementTier.silver,
      category: AchievementCategory.special,
      requiredValue: 10,
      isSecret: true,
    ),
  ];

  static AchievementModel? getById(String id) {
    try {
      return all.firstWhere((achievement) => achievement.id == id);
    } catch (e) {
      return null;
    }
  }

  static List<AchievementModel> getByCategory(AchievementCategory category) {
    return all.where((achievement) => achievement.category == category).toList();
  }

  static List<AchievementModel> getByTier(AchievementTier tier) {
    return all.where((achievement) => achievement.tier == tier).toList();
  }
}