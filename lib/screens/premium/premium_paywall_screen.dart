import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../controllers/premium_controller.dart';
import '../../core/theme/app_colors.dart';

/// 💎 Premium Paywall Screen - Subscription Plans
class PremiumPaywallScreen extends StatefulWidget {
  const PremiumPaywallScreen({super.key});

  @override
  State<PremiumPaywallScreen> createState() => _PremiumPaywallScreenState();
}

class _PremiumPaywallScreenState extends State<PremiumPaywallScreen> {
  int _selectedPlan = 1; // 0: Monthly, 1: Yearly, 2: Lifetime

  final List<Map<String, dynamic>> _plans = [
    {
      'title': 'Aylık',
      'price': '₺49,99',
      'period': '/ay',
      'discount': null,
      'color': AppColors.oceanBlue,
      'popular': false,
    },
    {
      'title': 'Yıllık',
      'price': '₺299,99',
      'period': '/yıl',
      'discount': '%50 İndirim',
      'color': AppColors.royalPurple,
      'popular': true,
      'save': '₺300 tasarruf',
    },
    {
      'title': 'Ömür Boyu',
      'price': '₺999,99',
      'period': 'tek seferlik',
      'discount': 'En İyi Değer',
      'color': AppColors.goldenYellow,
      'popular': false,
      'save': 'Sonsuza kadar premium',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              const Color(0xFF0A0A0A),
              const Color(0xFF1A1A2E),
              AppColors.royalPurple.withOpacity(0.2),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      _buildPremiumBadge(),
                      const SizedBox(height: 30),
                      _buildTitle(),
                      const SizedBox(height: 40),
                      _buildFeaturesList(),
                      const SizedBox(height: 40),
                      _buildPlans(),
                      const SizedBox(height: 30),
                      _buildSubscribeButton(),
                      const SizedBox(height: 20),
                      _buildFooter(),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.close, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '7 gün ücretsiz dene',
              style: GoogleFonts.poppins(
                fontSize: 12,
                color: Colors.white70,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPremiumBadge() {
    return Container(
      width: 120,
      height: 120,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [AppColors.goldenYellow, AppColors.sunsetOrange],
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.goldenYellow.withOpacity(0.5),
            blurRadius: 30,
            spreadRadius: 10,
          ),
        ],
      ),
      child: const Icon(
        Icons.workspace_premium_rounded,
        size: 70,
        color: Colors.white,
      ),
    )
        .animate(onPlay: (controller) => controller.repeat(reverse: true))
        .scale(duration: 2000.ms, begin: const Offset(1, 1), end: const Offset(1.1, 1.1))
        .then()
        .shimmer(duration: 1500.ms);
  }

  Widget _buildTitle() {
    return Column(
      children: [
        ShaderMask(
          shaderCallback: (bounds) => LinearGradient(
            colors: [AppColors.goldenYellow, AppColors.sunsetOrange],
          ).createShader(bounds),
          child: Text(
            'Premium\'a Yükselt',
            style: GoogleFonts.poppins(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Tüm özelliklerin kilidini aç',
          style: GoogleFonts.poppins(
            fontSize: 16,
            color: Colors.white70,
          ),
        ),
      ],
    ).animate().fadeIn().slideY(begin: 0.2, end: 0);
  }

  Widget _buildFeaturesList() {
    final features = [
      {'icon': Icons.all_inclusive, 'title': 'Sınırsız AI Sorgusu', 'desc': 'Günlük limit yok'},
      {'icon': Icons.flash_on, 'title': 'Öncelikli İşleme', 'desc': 'Daha hızlı sonuçlar'},
      {'icon': Icons.auto_awesome, 'title': 'Gelişmiş AI Özellikleri', 'desc': 'Tüm AI modelleri'},
      {'icon': Icons.calculate, 'title': '40+ Özel Hesaplayıcı', 'desc': '7 kategori'},
      {'icon': Icons.cloud_off, 'title': 'Tamamen Offline', 'desc': 'İnternet gerektirmez'},
      {'icon': Icons.block, 'title': 'Reklamsız Deneyim', 'desc': 'Hiç reklam yok'},
      {'icon': Icons.history, 'title': 'Sınırsız Geçmiş', 'desc': 'Tüm hesaplarınız'},
      {'icon': Icons.download, 'title': 'PDF/Excel Export', 'desc': 'Hesapları paylaş'},
    ];

    return Column(
      children: features.map((feature) {
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.white.withOpacity(0.1),
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.oceanBlue, AppColors.royalPurple],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  feature['icon'] as IconData,
                  color: Colors.white,
                  size: 26,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      feature['title'] as String,
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      feature['desc'] as String,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        color: Colors.white60,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.check_circle,
                color: Colors.greenAccent,
                size: 24,
              ),
            ],
          ),
        ).animate().fadeIn(delay: (features.indexOf(feature) * 50).ms).slideX(begin: 0.2, end: 0);
      }).toList(),
    );
  }

  Widget _buildPlans() {
    return Column(
      children: List.generate(_plans.length, (index) {
        final plan = _plans[index];
        final isSelected = _selectedPlan == index;
        final isPopular = plan['popular'] == true;

        return GestureDetector(
          onTap: () => setState(() => _selectedPlan = index),
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: isSelected
                  ? LinearGradient(
                      colors: [
                        plan['color'] as Color,
                        (plan['color'] as Color).withOpacity(0.7),
                      ],
                    )
                  : null,
              color: isSelected ? null : Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected
                    ? Colors.white.withOpacity(0.5)
                    : Colors.white.withOpacity(0.1),
                width: isSelected ? 3 : 2,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: (plan['color'] as Color).withOpacity(0.5),
                        blurRadius: 20,
                        spreadRadius: 5,
                      ),
                    ]
                  : null,
            ),
            child: Column(
              children: [
                if (isPopular)
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppColors.goldenYellow, AppColors.sunsetOrange],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '🔥 EN POPÜLER',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          plan['title'],
                          style: GoogleFonts.poppins(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        if (plan['save'] != null)
                          Text(
                            plan['save'],
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              color: Colors.greenAccent,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              plan['price'],
                              style: GoogleFonts.poppins(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              plan['period'],
                              style: GoogleFonts.poppins(
                                fontSize: 14,
                                color: Colors.white70,
                              ),
                            ),
                          ],
                        ),
                        if (plan['discount'] != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.redAccent,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              plan['discount'],
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        )
            .animate(target: isSelected ? 1 : 0)
            .scale(duration: 300.ms, curve: Curves.easeOut);
      }),
    );
  }

  Widget _buildSubscribeButton() {
    return Consumer<PremiumController>(
      builder: (context, premiumController, child) {
        return GestureDetector(
          onTap: () => _subscribe(premiumController),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.goldenYellow, AppColors.sunsetOrange],
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: AppColors.goldenYellow.withOpacity(0.5),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: Text(
              premiumController.isLoading
                  ? 'İşleniyor...'
                  : '✨ Premium\'a Başla',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        )
            .animate(onPlay: (controller) => controller.repeat(reverse: true))
            .shimmer(duration: 2000.ms);
      },
    );
  }

  Widget _buildFooter() {
    return Column(
      children: [
        Text(
          '• İstediğin zaman iptal et',
          style: GoogleFonts.poppins(
            fontSize: 13,
            color: Colors.white60,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextButton(
              onPressed: () {},
              child: Text(
                'Gizlilik Politikası',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: AppColors.oceanBlue,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
            Text('•', style: TextStyle(color: Colors.white60)),
            TextButton(
              onPressed: () {},
              child: Text(
                'Kullanım Koşulları',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: AppColors.oceanBlue,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Future<void> _subscribe(PremiumController premiumController) async {
    // TODO: Implement actual payment flow
    // For now, simulate subscription
    final selectedPlan = _plans[_selectedPlan];
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${selectedPlan['title']} planı seçildi!'),
        backgroundColor: AppColors.oceanBlue,
      ),
    );

    // In production, integrate with:
    // - Google Play Billing (Android)
    // - Apple In-App Purchase (iOS)
    // - Stripe/RevenueCat for cross-platform
  }
}