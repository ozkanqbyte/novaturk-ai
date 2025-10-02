import 'package:flutter/material.dart';
import '../core/constants/app_constants.dart';
import '../services/storage_service.dart';

class PremiumController extends ChangeNotifier {
  bool _isPremium = false;
  DateTime? _premiumExpiryDate;
  PremiumPlan? _currentPlan;
  int _aiQueriesUsedToday = 0;
  DateTime? _lastQueryDate;
  bool _isLoading = false;

  // Getters
  bool get isPremium => _isPremium;
  DateTime? get premiumExpiryDate => _premiumExpiryDate;
  PremiumPlan? get currentPlan => _currentPlan;
  int get aiQueriesUsedToday => _aiQueriesUsedToday;
  bool get isLoading => _isLoading;

  bool get isPremiumActive {
    if (!_isPremium) return false;
    if (_premiumExpiryDate == null) return true; // Lifetime
    return _premiumExpiryDate!.isAfter(DateTime.now());
  }

  int get remainingAIQueries {
    if (isPremiumActive) return AppConstants.premiumAIQueriesPerDay;
    return (AppConstants.freeAIQueriesPerDay - _aiQueriesUsedToday)
        .clamp(0, AppConstants.freeAIQueriesPerDay);
  }

  bool get canUseAI {
    if (isPremiumActive) return true;
    return remainingAIQueries > 0;
  }

  PremiumController() {
    _initialize();
  }

  Future<void> _initialize() async {
    await _loadPremiumStatus();
    _checkQueryReset();
  }

  Future<void> _loadPremiumStatus() async {
    final premiumData = StorageService.getPremiumStatus();
    
    _isPremium = premiumData['isPremium'] ?? false;
    
    if (premiumData['expiryDate'] != null) {
      _premiumExpiryDate = DateTime.fromMillisecondsSinceEpoch(
        premiumData['expiryDate'],
      );
    }

    if (premiumData['plan'] != null) {
      _currentPlan = PremiumPlan.values.firstWhere(
        (p) => p.toString() == premiumData['plan'],
        orElse: () => PremiumPlan.free,
      );
    }

    _aiQueriesUsedToday = premiumData['aiQueriesUsedToday'] ?? 0;
    
    if (premiumData['lastQueryDate'] != null) {
      _lastQueryDate = DateTime.fromMillisecondsSinceEpoch(
        premiumData['lastQueryDate'],
      );
    }

    notifyListeners();
  }

  Future<void> _savePremiumStatus() async {
    await StorageService.savePremiumStatus({
      'isPremium': _isPremium,
      'expiryDate': _premiumExpiryDate?.millisecondsSinceEpoch,
      'plan': _currentPlan?.toString(),
      'aiQueriesUsedToday': _aiQueriesUsedToday,
      'lastQueryDate': _lastQueryDate?.millisecondsSinceEpoch,
    });
  }

  void _checkQueryReset() {
    if (_lastQueryDate == null) return;

    final now = DateTime.now();
    final lastDate = _lastQueryDate!;

    // Reset if it's a new day
    if (now.day != lastDate.day || 
        now.month != lastDate.month || 
        now.year != lastDate.year) {
      _aiQueriesUsedToday = 0;
      _lastQueryDate = now;
      _savePremiumStatus();
      notifyListeners();
    }
  }

  // AI Query Management
  Future<bool> useAIQuery() async {
    _checkQueryReset();

    if (!canUseAI) return false;

    if (!isPremiumActive) {
      _aiQueriesUsedToday++;
      _lastQueryDate = DateTime.now();
      await _savePremiumStatus();
      notifyListeners();
    }

    return true;
  }

  // Subscription Management
  Future<bool> subscribeToPremium(PremiumPlan plan) async {
    _isLoading = true;
    notifyListeners();

    try {
      // Simulate purchase process
      await Future.delayed(const Duration(seconds: 2));

      // In production, this would integrate with:
      // - In-App Purchases (iOS/Android)
      // - Stripe (Web)
      // - RevenueCat (Cross-platform)

      _isPremium = true;
      _currentPlan = plan;

      if (plan == PremiumPlan.monthly) {
        _premiumExpiryDate = DateTime.now().add(const Duration(days: 30));
      } else if (plan == PremiumPlan.lifetime) {
        _premiumExpiryDate = null; // Lifetime - never expires
      } else {
        _premiumExpiryDate = null; // Default lifetime
      }

      await _savePremiumStatus();
      
      _isLoading = false;
      notifyListeners();
      
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> cancelSubscription() async {
    _isPremium = false;
    _premiumExpiryDate = null;
    _currentPlan = PremiumPlan.free;
    
    await _savePremiumStatus();
    notifyListeners();
  }

  Future<bool> restorePurchases() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Simulate restore process
      await Future.delayed(const Duration(seconds: 1));

      // In production, this would check with the platform's purchase system
      
      _isLoading = false;
      notifyListeners();
      
      return false; // No purchases to restore in this demo
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Feature Access Checks
  bool canAccessFeature(PremiumFeature feature) {
    if (isPremiumActive) return true;

    switch (feature) {
      case PremiumFeature.unlimitedAI:
      case PremiumFeature.unlimitedHistory:
      case PremiumFeature.advancedCalculators:
      case PremiumFeature.cloudSync:
      case PremiumFeature.exclusiveThemes:
      case PremiumFeature.prioritySupport:
        return false;
      case PremiumFeature.basicCalculator:
      case PremiumFeature.limitedAI:
      case PremiumFeature.basicHistory:
        return true;
    }
  }

  String getRemainingTimeText() {
    if (!isPremiumActive || _premiumExpiryDate == null) {
      return 'Premium Değil';
    }

    final remaining = _premiumExpiryDate!.difference(DateTime.now());
    
    if (remaining.inDays > 30) {
      return '${remaining.inDays ~/ 30} ay kaldı';
    } else if (remaining.inDays > 0) {
      return '${remaining.inDays} gün kaldı';
    } else if (remaining.inHours > 0) {
      return '${remaining.inHours} saat kaldı';
    } else {
      return 'Bugün sona eriyor';
    }
  }

  List<PremiumFeatureItem> getPremiumFeatures() {
    return [
      PremiumFeatureItem(
        icon: '🤖',
        title: 'Sınırsız AI Sorgusu',
        description: 'Her gün sınırsız AI sorgusu yapın',
        isAvailable: canAccessFeature(PremiumFeature.unlimitedAI),
      ),
      PremiumFeatureItem(
        icon: '🚫',
        title: 'Reklamsız Deneyim',
        description: 'Hiç reklam görmeden kullanın',
        isAvailable: isPremiumActive,
      ),
      PremiumFeatureItem(
        icon: '📊',
        title: 'Tüm Hesaplayıcılar',
        description: 'Grafik, matris, istatistik ve daha fazlası',
        isAvailable: canAccessFeature(PremiumFeature.advancedCalculators),
      ),
      PremiumFeatureItem(
        icon: '☁️',
        title: 'Bulut Senkronizasyonu',
        description: 'Verileriniz tüm cihazlarda senkronize',
        isAvailable: canAccessFeature(PremiumFeature.cloudSync),
      ),
      PremiumFeatureItem(
        icon: '🎨',
        title: 'Özel Temalar',
        description: 'Premium tema koleksiyonuna erişin',
        isAvailable: canAccessFeature(PremiumFeature.exclusiveThemes),
      ),
      PremiumFeatureItem(
        icon: '⭐',
        title: 'Öncelikli Destek',
        description: '24/7 öncelikli müşteri desteği',
        isAvailable: canAccessFeature(PremiumFeature.prioritySupport),
      ),
    ];
  }

  List<PremiumPlanOption> getPlanOptions() {
    return [
      PremiumPlanOption(
        plan: PremiumPlan.monthly,
        title: 'Aylık',
        price: AppConstants.premiumMonthlyPrice,
        period: '/ay',
        savePercentage: 0,
        description: 'İstediğiniz zaman iptal edin',
      ),
      PremiumPlanOption(
        plan: PremiumPlan.lifetime,
        title: 'Ömür Boyu',
        price: AppConstants.premiumLifetimePrice,
        period: '',
        savePercentage: 88,
        description: 'Tek ödeme, süresiz erişim! 🎉',
        isRecommended: true,
      ),
    ];
  }
}

enum PremiumPlan {
  free,
  monthly,
  yearly,
  lifetime,
}

enum PremiumFeature {
  basicCalculator,
  limitedAI,
  basicHistory,
  unlimitedAI,
  unlimitedHistory,
  advancedCalculators,
  cloudSync,
  exclusiveThemes,
  prioritySupport,
}

class PremiumFeatureItem {
  final String icon;
  final String title;
  final String description;
  final bool isAvailable;

  PremiumFeatureItem({
    required this.icon,
    required this.title,
    required this.description,
    required this.isAvailable,
  });
}

class PremiumPlanOption {
  final PremiumPlan plan;
  final String title;
  final double price;
  final String period;
  final int savePercentage;
  final String description;
  final bool isRecommended;

  PremiumPlanOption({
    required this.plan,
    required this.title,
    required this.price,
    required this.period,
    this.savePercentage = 0,
    required this.description,
    this.isRecommended = false,
  });

  String get priceText => '${price.toStringAsFixed(2)} ₺';
  String get fullText => '$priceText$period';
}