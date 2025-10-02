import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../controllers/profile_controller.dart';
import '../../controllers/theme_controller.dart';
import '../../core/theme/app_colors.dart';
import '../../models/achievement_model.dart';

class AchievementsScreen extends StatelessWidget {
  const AchievementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer2<ProfileController, ThemeController>(
      builder: (context, profileController, themeController, child) {
        return Scaffold(
          backgroundColor: themeController.isDarkMode
              ? AppColors.darkBackground
              : AppColors.lightBackground,
          appBar: AppBar(
            title: Text(
              'Başarımlar',
              style: GoogleFonts.inter(fontWeight: FontWeight.bold),
            ),
            backgroundColor: Colors.transparent,
            elevation: 0,
          ),
          body: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              // Progress Card
              _buildProgressCard(profileController, themeController),
              
              const SizedBox(height: 24),
              
              // Unlocked Achievements
              if (profileController.unlockedAchievements.isNotEmpty) ...[
                Text(
                  'Kazanılmış Başarımlar',
                  style: GoogleFonts.inter(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: themeController.primaryTextColor,
                  ),
                ),
                const SizedBox(height: 16),
                ...profileController.unlockedAchievements.map(
                  (achievement) => _buildAchievementCard(
                    achievement,
                    true,
                    profileController,
                    themeController,
                  ),
                ),
                const SizedBox(height: 24),
              ],
              
              // Locked Achievements
              if (profileController.lockedAchievements.isNotEmpty) ...[
                Text(
                  'Kilitli Başarımlar',
                  style: GoogleFonts.inter(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: themeController.primaryTextColor,
                  ),
                ),
                const SizedBox(height: 16),
                ...profileController.lockedAchievements.map(
                  (achievement) => _buildAchievementCard(
                    achievement,
                    false,
                    profileController,
                    themeController,
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildProgressCard(
    ProfileController controller,
    ThemeController theme,
  ) {
    final unlocked = controller.unlockedAchievements.length;
    final total = controller.allAchievements.length;
    final progress = unlocked / total;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: AppColors.purpleGradient),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          Text(
            '$unlocked / $total',
            style: GoogleFonts.inter(
              fontSize: 48,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Başarım Tamamlandı',
            style: GoogleFonts.inter(
              fontSize: 16,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 20),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 12,
              backgroundColor: Colors.white.withOpacity(0.3),
              valueColor: const AlwaysStoppedAnimation(Colors.white),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${(progress * 100).toStringAsFixed(0)}% Tamamlandı',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: Colors.white.withOpacity(0.8),
            ),
          ),
        ],
      ),
    ).animate().fadeIn().scale();
  }

  Widget _buildAchievementCard(
    AchievementModel achievement,
    bool isUnlocked,
    ProfileController controller,
    ThemeController theme,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isUnlocked
              ? AppColors.successGreen.withOpacity(0.3)
              : theme.dividerColor.withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: isUnlocked
                  ? AppColors.successGreen.withOpacity(0.1)
                  : theme.dividerColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Center(
              child: Opacity(
                opacity: isUnlocked ? 1.0 : 0.3,
                child: Text(
                  achievement.emoji,
                  style: const TextStyle(fontSize: 32),
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  achievement.title,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: theme.primaryTextColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  achievement.description,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: theme.secondaryTextColor,
                  ),
                ),
                if (!isUnlocked) ...[
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: controller.getAchievementProgress(achievement.id),
                      minHeight: 6,
                      backgroundColor: theme.dividerColor,
                      valueColor: AlwaysStoppedAnimation(AppColors.primaryPurple),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: isUnlocked
                  ? AppColors.successGreen.withOpacity(0.1)
                  : theme.dividerColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '+${achievement.points}',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: isUnlocked ? AppColors.successGreen : theme.secondaryTextColor,
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn().slideX(begin: -0.1);
  }
}