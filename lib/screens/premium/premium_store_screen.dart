import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../controllers/premium_controller.dart';
import '../../controllers/theme_controller.dart';
import '../../core/theme/app_colors.dart';
import '../../core/localization/tr_TR.dart';

class PremiumStoreScreen extends StatelessWidget {
  const PremiumStoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer2<PremiumController, ThemeController>(
      builder: (context, premiumController, themeController, child) {
        return Scaffold(
          backgroundColor: themeController.isDarkMode
              ? AppColors.darkBackground
              : AppColors.lightBackground,
          body: CustomScrollView(
            slivers: [
              // Header
              SliverAppBar(
                expandedHeight: 250,
                floating: false,
                pinned: true,
                backgroundColor: Colors.transparent,
                flexibleSpace: FlexibleSpaceBar(
                  background: _buildHeader(premiumController, themeController),
                ),
              ),
              
              // Premium Features
              SliverToBoxAdapter(
                child: _buildFeaturesList(premiumController, themeController),
              ),
              
              // Plan Options
              SliverToBoxAdapter(
                child: _buildPlanOptions(
                  context,
                  premiumController,
                  themeController,
                ),
              ),
              
              // Restore Purchases Button
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: TextButton(
                    onPressed: () async {
                      await premiumController.restorePurchases();
                    },
                    child: Text(
                      TRStrings.restorePurchases,
                      style: GoogleFonts.inter(
                        color: AppColors.primaryPurple,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
              
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader(
    PremiumController controller,
    ThemeController theme,
  ) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: AppColors.premiumGradient,
        ),
      ),
      child: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('👑', style: TextStyle(fontSize: 64))
                  .animate().scale(delay: 100.ms),
              const SizedBox(height: 16),
              Text(
                TRStrings.goPremium,
                style: GoogleFonts.inter(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ).animate().fadeIn(delay: 200.ms),
              const SizedBox(height: 8),
              Text(
                'Tüm özelliklerin kilidini aç',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  color: Colors.white.withOpacity(0.9),
                ),
              ).animate().fadeIn(delay: 300.ms),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeaturesList(
    PremiumController controller,
    ThemeController theme,
  ) {
    final features = controller.getPremiumFeatures();

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            TRStrings.premiumFeatures,
            style: GoogleFonts.inter(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: theme.primaryTextColor,
            ),
          ),
          const SizedBox(height: 20),
          ...features.map((feature) => _buildFeatureItem(feature, theme)),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(
    PremiumFeatureItem feature,
    ThemeController theme,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.dividerColor.withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Text(
            feature.icon,
            style: const TextStyle(fontSize: 32),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  feature.title,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: theme.primaryTextColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  feature.description,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: theme.secondaryTextColor,
                  ),
                ),
              ],
            ),
          ),
          Icon(
            feature.isAvailable
                ? Icons.check_circle_rounded
                : Icons.lock_rounded,
            color: feature.isAvailable
                ? AppColors.successGreen
                : theme.secondaryTextColor,
          ),
        ],
      ),
    ).animate().fadeIn().slideX(begin: -0.1);
  }

  Widget _buildPlanOptions(
    BuildContext context,
    PremiumController premiumController,
    ThemeController theme,
  ) {
    final plans = premiumController.getPlanOptions();

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Plan Seçin',
            style: GoogleFonts.inter(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: theme.primaryTextColor,
            ),
          ),
          const SizedBox(height: 20),
          ...plans.map((plan) => _buildPlanCard(
                context,
                plan,
                premiumController,
                theme,
              )),
        ],
      ),
    );
  }

  Widget _buildPlanCard(
    BuildContext context,
    PremiumPlanOption plan,
    PremiumController premiumController,
    ThemeController theme,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: plan.isRecommended
              ? AppColors.primaryPurple
              : theme.dividerColor.withOpacity(0.5),
          width: plan.isRecommended ? 2 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          plan.title,
                          style: GoogleFonts.inter(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: theme.primaryTextColor,
                          ),
                        ),
                        if (plan.isRecommended) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: AppColors.premiumGradient,
                              ),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'ÖNERİLEN',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      plan.description,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: theme.secondaryTextColor,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    plan.priceText,
                    style: GoogleFonts.inter(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: theme.primaryTextColor,
                    ),
                  ),
                  Text(
                    plan.period,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: theme.secondaryTextColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
          
          if (plan.savePercentage > 0) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.successGreen.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '%${plan.savePercentage} ${TRStrings.save}',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppColors.successGreen,
                ),
              ),
            ),
          ],
          
          const SizedBox(height: 16),
          
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: premiumController.isLoading
                  ? null
                  : () async {
                      final success = await premiumController.subscribeToPremium(plan.plan);
                      if (success && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Premium üyelik başarıyla aktifleştirildi!'),
                            backgroundColor: AppColors.successGreen,
                          ),
                        );
                        Navigator.pop(context);
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: plan.isRecommended
                    ? AppColors.primaryPurple
                    : theme.buttonBackgroundColor,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: premiumController.isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(
                      TRStrings.subscribe,
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn().slideY(begin: 0.1);
  }
}