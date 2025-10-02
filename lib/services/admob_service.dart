import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

/// 📺 AdMob Service
/// Google AdMob Integration for monetization
/// 
/// Ad Types:
/// - Banner Ads: Bottom of screens
/// - Interstitial Ads: Between actions
/// - Rewarded Ads: For premium features trial
/// - Rewarded Interstitial Ads: High value rewards
class AdMobService extends ChangeNotifier {
  static final AdMobService _instance = AdMobService._internal();
  factory AdMobService() => _instance;
  AdMobService._internal();

  // 🎚️ AD MODE CONTROL
  // Set to TRUE for development/testing (uses Google test ads)
  // Set to FALSE for production (uses real ad unit IDs)
  static const bool _useTestAds = true; // ⚠️ SWITCH TO true FOR TESTING!

  // Ad Units - Production IDs
  static String get bannerAdUnitId {
    if (kIsWeb) return '';
    if (Platform.isAndroid) {
      return _useTestAds
          ? 'ca-app-pub-3940256099942544/6300978111' // Google Test ID
          : 'ca-app-pub-9245498152791757/6718471766'; // ✅ PRODUCTION ID
    } else if (Platform.isIOS) {
      return 'ca-app-pub-3940256099942544/2934735716'; // TEST ID (iOS not configured yet)
    }
    return '';
  }

  static String get interstitialAdUnitId {
    if (kIsWeb) return '';
    if (Platform.isAndroid) {
      return _useTestAds
          ? 'ca-app-pub-3940256099942544/1033173712' // Google Test ID
          : 'ca-app-pub-3940256099942544/1033173712'; // ⚠️ TODO: Create Interstitial Ad Unit in AdMob Console
    } else if (Platform.isIOS) {
      return 'ca-app-pub-3940256099942544/4411468910'; // TEST ID (iOS not configured yet)
    }
    return '';
  }

  static String get rewardedAdUnitId {
    if (kIsWeb) return '';
    if (Platform.isAndroid) {
      return _useTestAds
          ? 'ca-app-pub-3940256099942544/5224354917' // Google Test ID
          : 'ca-app-pub-9245498152791757/9674424709'; // ✅ PRODUCTION ID
    } else if (Platform.isIOS) {
      return 'ca-app-pub-3940256099942544/1712485313'; // TEST ID (iOS not configured yet)
    }
    return '';
  }

  // Ad instances
  BannerAd? _bannerAd;
  InterstitialAd? _interstitialAd;
  RewardedAd? _rewardedAd;

  // Ad status
  bool _isBannerAdLoaded = false;
  bool get isBannerAdLoaded => _isBannerAdLoaded;

  bool _isInterstitialAdLoaded = false;
  bool get isInterstitialAdLoaded => _isInterstitialAdLoaded;

  bool _isRewardedAdLoaded = false;
  bool get isRewardedAdLoaded => _isRewardedAdLoaded;

  // Premium status (ads disabled if premium)
  bool _isPremiumActive = false;
  bool get isPremiumActive => _isPremiumActive;

  // Ad frequency control
  DateTime? _lastInterstitialTime;
  int _interstitialCounter = 0;
  static const int _interstitialFrequency = 3; // Show every 3 actions

  /// 🚀 Initialize AdMob
  Future<void> initialize({bool isPremium = false}) async {
    if (kIsWeb) {
      print('ℹ️ AdMob not available on web');
      return;
    }

    try {
      print('📺 Initializing AdMob...');
      
      _isPremiumActive = isPremium;
      
      if (_isPremiumActive) {
        print('👑 Premium active - Ads disabled');
        return;
      }

      // Initialize Mobile Ads SDK
      await MobileAds.instance.initialize();
      
      // Load initial ads
      await loadBannerAd();
      await _loadInterstitialAd();
      await _loadRewardedAd();

      print('✅ AdMob initialized successfully');
    } catch (e) {
      print('❌ AdMob Initialization Error: $e');
    }
  }

  /// 📱 Load Banner Ad
  Future<void> loadBannerAd() async {
    if (kIsWeb || _isPremiumActive) return;

    try {
      _bannerAd = BannerAd(
        adUnitId: bannerAdUnitId,
        size: AdSize.banner,
        request: const AdRequest(),
        listener: BannerAdListener(
          onAdLoaded: (ad) {
            print('✅ Banner ad loaded');
            _isBannerAdLoaded = true;
            notifyListeners();
          },
          onAdFailedToLoad: (ad, error) {
            print('❌ Banner ad failed: $error');
            ad.dispose();
            _isBannerAdLoaded = false;
            notifyListeners();
          },
        ),
      );

      await _bannerAd!.load();
    } catch (e) {
      print('❌ Banner Ad Error: $e');
    }
  }

  /// 🎬 Load Interstitial Ad
  Future<void> _loadInterstitialAd() async {
    if (kIsWeb || _isPremiumActive) return;

    try {
      await InterstitialAd.load(
        adUnitId: interstitialAdUnitId,
        request: const AdRequest(),
        adLoadCallback: InterstitialAdLoadCallback(
          onAdLoaded: (ad) {
            print('✅ Interstitial ad loaded');
            _interstitialAd = ad;
            _isInterstitialAdLoaded = true;
            notifyListeners();

            // Set full screen callback
            _interstitialAd!.fullScreenContentCallback =
                FullScreenContentCallback(
              onAdDismissedFullScreenContent: (ad) {
                print('🔚 Interstitial ad dismissed');
                ad.dispose();
                _isInterstitialAdLoaded = false;
                _loadInterstitialAd(); // Load next ad
              },
              onAdFailedToShowFullScreenContent: (ad, error) {
                print('❌ Interstitial ad failed to show: $error');
                ad.dispose();
                _isInterstitialAdLoaded = false;
                _loadInterstitialAd();
              },
            );
          },
          onAdFailedToLoad: (error) {
            print('❌ Interstitial ad failed to load: $error');
            _isInterstitialAdLoaded = false;
          },
        ),
      );
    } catch (e) {
      print('❌ Interstitial Ad Error: $e');
    }
  }

  /// 🎁 Load Rewarded Ad
  Future<void> _loadRewardedAd() async {
    if (kIsWeb || _isPremiumActive) return;

    try {
      await RewardedAd.load(
        adUnitId: rewardedAdUnitId,
        request: const AdRequest(),
        rewardedAdLoadCallback: RewardedAdLoadCallback(
          onAdLoaded: (ad) {
            print('✅ Rewarded ad loaded');
            _rewardedAd = ad;
            _isRewardedAdLoaded = true;
            notifyListeners();

            // Set full screen callback
            _rewardedAd!.fullScreenContentCallback =
                FullScreenContentCallback(
              onAdDismissedFullScreenContent: (ad) {
                print('🔚 Rewarded ad dismissed');
                ad.dispose();
                _isRewardedAdLoaded = false;
                _loadRewardedAd();
              },
              onAdFailedToShowFullScreenContent: (ad, error) {
                print('❌ Rewarded ad failed to show: $error');
                ad.dispose();
                _isRewardedAdLoaded = false;
                _loadRewardedAd();
              },
            );
          },
          onAdFailedToLoad: (error) {
            print('❌ Rewarded ad failed to load: $error');
            _isRewardedAdLoaded = false;
          },
        ),
      );
    } catch (e) {
      print('❌ Rewarded Ad Error: $e');
    }
  }

  /// 📺 Get Banner Ad Widget
  BannerAd? getBannerAd() {
    if (_isPremiumActive || !_isBannerAdLoaded) return null;
    return _bannerAd;
  }

  /// 🎬 Show Interstitial Ad
  Future<void> showInterstitialAd() async {
    if (_isPremiumActive || !_isInterstitialAdLoaded) return;

    // Frequency control
    _interstitialCounter++;
    if (_interstitialCounter < _interstitialFrequency) {
      print('ℹ️ Interstitial skipped (frequency control)');
      return;
    }

    // Time control (minimum 2 minutes between ads)
    if (_lastInterstitialTime != null) {
      final timeSinceLastAd =
          DateTime.now().difference(_lastInterstitialTime!);
      if (timeSinceLastAd.inMinutes < 2) {
        print('ℹ️ Interstitial skipped (time control)');
        return;
      }
    }

    try {
      await _interstitialAd?.show();
      _lastInterstitialTime = DateTime.now();
      _interstitialCounter = 0;
    } catch (e) {
      print('❌ Show Interstitial Error: $e');
    }
  }

  /// 🎁 Show Rewarded Ad
  Future<bool> showRewardedAd({required Function() onRewarded}) async {
    if (_isPremiumActive || !_isRewardedAdLoaded) return false;

    try {
      bool rewarded = false;

      await _rewardedAd?.show(
        onUserEarnedReward: (ad, reward) {
          print('🎁 User earned reward: ${reward.amount} ${reward.type}');
          rewarded = true;
          onRewarded();
        },
      );

      return rewarded;
    } catch (e) {
      print('❌ Show Rewarded Ad Error: $e');
      return false;
    }
  }

  /// 👑 Update Premium Status
  void updatePremiumStatus(bool isPremium) {
    _isPremiumActive = isPremium;
    
    if (_isPremiumActive) {
      // Dispose all ads
      _bannerAd?.dispose();
      _interstitialAd?.dispose();
      _rewardedAd?.dispose();
      
      _isBannerAdLoaded = false;
      _isInterstitialAdLoaded = false;
      _isRewardedAdLoaded = false;
      
      print('👑 Premium activated - All ads disabled');
    } else {
      // Reload ads
      initialize(isPremium: false);
      print('📺 Premium deactivated - Ads enabled');
    }
    
    notifyListeners();
  }

  /// 🧹 Dispose
  void dispose() {
    _bannerAd?.dispose();
    _interstitialAd?.dispose();
    _rewardedAd?.dispose();
    super.dispose();
  }
}