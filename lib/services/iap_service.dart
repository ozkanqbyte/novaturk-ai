import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:in_app_purchase_android/in_app_purchase_android.dart';
import 'package:in_app_purchase_storekit/in_app_purchase_storekit.dart';
import 'storage_service.dart';
import 'security_service.dart';

/// 💰 In-App Purchase Service
/// Supports: Google Play Store + Apple App Store
/// 
/// Premium Packages:
/// - Monthly: 50₺/month
/// - Lifetime: 399₺ (One-time payment - Best Value!)
class IAPService extends ChangeNotifier {
  static final IAPService _instance = IAPService._internal();
  factory IAPService() => _instance;
  IAPService._internal();

  final InAppPurchase _iap = InAppPurchase.instance;
  
  // Purchase Stream
  StreamSubscription<List<PurchaseDetails>>? _subscription;
  
  // Product IDs
  static const String monthlySubscription = 'ai_calculator_monthly_premium';
  static const String lifetimePurchase = 'ai_calculator_lifetime_premium';
  
  // Available Products
  List<ProductDetails> _products = [];
  List<ProductDetails> get products => _products;
  
  // Purchase Status
  bool _isPurchasing = false;
  bool get isPurchasing => _isPurchasing;
  
  bool _isPremiumActive = false;
  bool get isPremiumActive => _isPremiumActive;
  
  String _premiumType = ''; // 'monthly', 'lifetime'
  String get premiumType => _premiumType;
  
  DateTime? _premiumExpiryDate;
  DateTime? get premiumExpiryDate => _premiumExpiryDate;
  
  // Error Handling
  String? _lastError;
  String? get lastError => _lastError;

  /// 🚀 Initialize IAP Service
  Future<void> initialize() async {
    try {
      print('🛒 Initializing IAP Service...');
      
      // Check if IAP is available
      final bool available = await _iap.isAvailable();
      if (!available) {
        print('❌ IAP not available on this device');
        _lastError = 'In-App Purchase not available';
        return;
      }

      // Platform-specific initialization
      // Note: enablePendingPurchases is deprecated and no longer needed

      // Listen to purchase updates
      _subscription = _iap.purchaseStream.listen(
        _handlePurchaseUpdates,
        onDone: () => _subscription?.cancel(),
        onError: (error) {
          print('❌ IAP Stream Error: $error');
          _lastError = error.toString();
        },
      );

      // Load products
      await _loadProducts();
      
      // Restore previous purchases
      await restorePurchases();
      
      print('✅ IAP Service initialized successfully');
    } catch (e) {
      print('❌ IAP Initialization Error: $e');
      _lastError = e.toString();
    }
  }

  /// 📦 Load Available Products
  Future<void> _loadProducts() async {
    try {
      final Set<String> productIds = {
        monthlySubscription,
        lifetimePurchase,
      };

      final ProductDetailsResponse response =
          await _iap.queryProductDetails(productIds);

      if (response.notFoundIDs.isNotEmpty) {
        print('⚠️ Products not found: ${response.notFoundIDs}');
      }

      if (response.error != null) {
        _lastError = response.error!.message;
        print('❌ Product Query Error: ${response.error}');
        return;
      }

      _products = response.productDetails;
      print('✅ Loaded ${_products.length} products');
      
      for (var product in _products) {
        print('  - ${product.id}: ${product.price}');
      }
      
      notifyListeners();
    } catch (e) {
      print('❌ Load Products Error: $e');
      _lastError = e.toString();
    }
  }

  /// 💳 Purchase Premium Package
  Future<bool> purchasePremium(String productId) async {
    try {
      _isPurchasing = true;
      _lastError = null;
      notifyListeners();

      // Find product
      final ProductDetails? product = _products.firstWhere(
        (p) => p.id == productId,
        orElse: () => throw Exception('Product not found'),
      );

      if (product == null) {
        throw Exception('Product $productId not found');
      }

      // Create purchase param
      final PurchaseParam purchaseParam = PurchaseParam(
        productDetails: product,
      );

      // Start purchase
      bool success;
      if (productId == lifetimePurchase) {
        // Non-consumable product (lifetime)
        success = await _iap.buyNonConsumable(purchaseParam: purchaseParam);
      } else {
        // Subscription (monthly/yearly)
        success = await _iap.buyNonConsumable(purchaseParam: purchaseParam);
        // Note: Google Play billing v4+ treats subscriptions similarly
        // Use buyNonConsumable for both types
      }

      return success;
    } catch (e) {
      print('❌ Purchase Error: $e');
      _lastError = e.toString();
      _isPurchasing = false;
      notifyListeners();
      return false;
    }
  }

  /// 🔄 Handle Purchase Updates
  void _handlePurchaseUpdates(List<PurchaseDetails> purchaseDetailsList) async {
    for (final PurchaseDetails purchaseDetails in purchaseDetailsList) {
      print('📦 Purchase Update: ${purchaseDetails.status}');

      if (purchaseDetails.status == PurchaseStatus.pending) {
        _isPurchasing = true;
        notifyListeners();
      } else if (purchaseDetails.status == PurchaseStatus.purchased ||
          purchaseDetails.status == PurchaseStatus.restored) {
        // Verify purchase
        final bool valid = await _verifyPurchase(purchaseDetails);
        
        if (valid) {
          await _deliverProduct(purchaseDetails);
        }

        // Complete purchase
        if (purchaseDetails.pendingCompletePurchase) {
          await _iap.completePurchase(purchaseDetails);
        }

        _isPurchasing = false;
        notifyListeners();
      } else if (purchaseDetails.status == PurchaseStatus.error) {
        _lastError = purchaseDetails.error?.message ?? 'Unknown error';
        _isPurchasing = false;
        notifyListeners();
      } else if (purchaseDetails.status == PurchaseStatus.canceled) {
        _isPurchasing = false;
        notifyListeners();
      }
    }
  }

  /// ✅ Verify Purchase (Server-side verification recommended for production)
  /// 🛡️ NOW WITH SECURITY CHECKS!
  Future<bool> _verifyPurchase(PurchaseDetails purchaseDetails) async {
    print('🔍 Verifying purchase: ${purchaseDetails.productID}');
    
    // 🛡️ STEP 1: Device Security Check
    if (!kDebugMode) {  // Skip security checks in debug mode
      final securityService = SecurityService.instance;
      
      // Perform runtime security check
      final isDeviceSecure = await securityService.performRuntimeCheck();
      
      if (!isDeviceSecure) {
        print('❌ Purchase verification FAILED: Device is not secure');
        print('   Rooted: ${securityService.isRooted}');
        print('   Jailbroken: ${securityService.isJailbroken}');
        print('   Emulator: ${securityService.isEmulator}');
        
        _lastError = 'Purchase not allowed on modified devices';
        
        // Log security violation
        await StorageService.incrementSecurityFailures();
        
        return false;
      }
    }
    
    // 🔍 STEP 2: Platform Purchase Verification
    // TODO: Implement server-side verification for production
    // For now, we trust the platform after security checks
    print('✅ Purchase verified: ${purchaseDetails.productID}');
    
    return true;
  }

  /// 📬 Deliver Product
  Future<void> _deliverProduct(PurchaseDetails purchaseDetails) async {
    try {
      print('📬 Delivering product: ${purchaseDetails.productID}');

      _isPremiumActive = true;

      // Set premium type
      if (purchaseDetails.productID == monthlySubscription) {
        _premiumType = 'monthly';
        _premiumExpiryDate = DateTime.now().add(const Duration(days: 30));
      } else if (purchaseDetails.productID == yearlySubscription) {
        _premiumType = 'yearly';
        _premiumExpiryDate = DateTime.now().add(const Duration(days: 365));
      } else if (purchaseDetails.productID == lifetimePurchase) {
        _premiumType = 'lifetime';
        _premiumExpiryDate = null; // No expiry
      }
      
      // 🛡️ Generate secure license token for ALL premium types
      await SecurityService.instance.resetLicenseToken();

      // Save to local storage
      await _savePremiumStatus();

      print('✅ Product delivered successfully');
      notifyListeners();
    } catch (e) {
      print('❌ Deliver Product Error: $e');
      _lastError = e.toString();
    }
  }

  /// 💾 Save Premium Status
  Future<void> _savePremiumStatus() async {
    await StorageService.savePremiumStatus({
      'isActive': _isPremiumActive,
      'type': _premiumType,
      'expiryDate': _premiumExpiryDate?.toIso8601String(),
    });
  }

  /// 🔄 Restore Purchases
  Future<void> restorePurchases() async {
    try {
      print('🔄 Restoring purchases...');
      
      // Check local storage first
      final premiumStatus = StorageService.getPremiumStatus();
      _isPremiumActive = premiumStatus['isActive'] ?? false;
      _premiumType = premiumStatus['type'] ?? '';
      final expiryString = premiumStatus['expiryDate'] as String?;
      _premiumExpiryDate = expiryString != null ? DateTime.tryParse(expiryString) : null;

      // Check if subscription expired
      if (_premiumExpiryDate != null && 
          DateTime.now().isAfter(_premiumExpiryDate!)) {
        _isPremiumActive = false;
        _premiumType = '';
        _premiumExpiryDate = null;
        await _savePremiumStatus();
      }

      // Restore from store
      await _iap.restorePurchases();
      
      print('✅ Purchases restored');
      notifyListeners();
    } catch (e) {
      print('❌ Restore Error: $e');
      _lastError = e.toString();
    }
  }

  /// 🗑️ Cancel Subscription (redirects to store)
  Future<void> cancelSubscription() async {
    // User must cancel through Google Play or App Store
    // We just provide the link
    print('ℹ️ Redirect user to store to cancel subscription');
  }

  /// 🧹 Cleanup
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  /// 📊 Get Premium Benefits
  static List<String> getPremiumBenefits() {
    return [
      '🚫 Reklamsız deneyim',
      '🔢 40+ özel hesaplayıcıya tam erişim',
      '🤖 Tüm AI özellikler (Ses, OCR, El Yazısı)',
      '📊 Sınırsız geçmiş kayıtları',
      '🎨 Premium temalar',
      '☁️ Bulut yedekleme',
      '📱 Öncelikli müşteri desteği',
      '🎁 Yeni özelliklere erken erişim',
    ];
  }

  /// 💰 Get Product Price
  String? getProductPrice(String productId) {
    final product = _products.firstWhere(
      (p) => p.id == productId,
      orElse: () => throw Exception('Product not found'),
    );
    return product.price;
  }

  /// 📅 Get Days Until Expiry
  int? getDaysUntilExpiry() {
    if (_premiumExpiryDate == null) return null;
    return _premiumExpiryDate!.difference(DateTime.now()).inDays;
  }

  /// 🎁 Check if Trial Available
  bool get isTrialAvailable {
    // Check if user never had premium before
    return !_isPremiumActive && _premiumType.isEmpty;
  }
}