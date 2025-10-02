import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../controllers/profile_controller.dart';
import '../../controllers/theme_controller.dart';
import '../../core/theme/app_colors.dart';
import '../../core/localization/tr_TR.dart';

class StatisticsScreen extends StatelessWidget {
  const StatisticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer2<ProfileController, ThemeController>(
      builder: (context, profileController, themeController, child) {
        final stats = profileController.getUserStatistics();

        return Scaffold(
          backgroundColor: themeController.isDarkMode
              ? AppColors.darkBackground
              : AppColors.lightBackground,
          appBar: AppBar(
            title: Text(
              TRStrings.statistics,
              style: GoogleFonts.inter(fontWeight: FontWeight.bold),
            ),
            backgroundColor: Colors.transparent,
            elevation: 0,
          ),
          body: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              // Level Progress
              _buildLevelCard(stats, themeController),
              
              const SizedBox(height: 20),
              
              // Main Stats Grid
              _buildStatsGrid(stats, themeController),
              
              const SizedBox(height: 20),
              
              // Details
              _buildDetailCard(
                icon: Icons.calendar_today_rounded,
                title: TRStrings.joinDate,
                value: stats['joinDate'],
                theme: themeController,
              ).animate().fadeIn(delay: 100.ms),
              
              const SizedBox(height: 12),
              
              _buildDetailCard(
                icon: Icons.trending_up_rounded,
                title: 'Seviye İlerlemesi',
                value: '${(stats['levelProgress'] * 100).toStringAsFixed(0)}%',
                subtitle: '${stats['nextLevelPoints']} puana ${stats['levelTitle']} olacaksınız',
                theme: themeController,
              ).animate().fadeIn(delay: 200.ms),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLevelCard(
    Map<String, dynamic> stats,
    ThemeController theme,
  ) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: AppColors.purpleGradient),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                stats['levelEmoji'],
                style: const TextStyle(fontSize: 48),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${TRStrings.level} ${stats['level']}',
                    style: GoogleFonts.inter(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    stats['levelTitle'],
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.9),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: stats['levelProgress'],
              minHeight: 12,
              backgroundColor: Colors.white.withOpacity(0.3),
              valueColor: const AlwaysStoppedAnimation(Colors.white),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '${stats['totalPoints']} / ${stats['nextLevelPoints']} ${TRStrings.points}',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
        ],
      ),
    ).animate().fadeIn().scale();
  }

  Widget _buildStatsGrid(
    Map<String, dynamic> stats,
    ThemeController theme,
  ) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildStatBox(
                icon: '🎯',
                title: TRStrings.points,
                value: stats['totalPoints'].toString(),
                theme: theme,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatBox(
                icon: '🔢',
                title: TRStrings.totalCalculations,
                value: stats['totalCalculations'].toString(),
                theme: theme,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatBox(
                icon: '🔥',
                title: TRStrings.dailyStreak,
                value: '${stats['dailyStreak']}',
                theme: theme,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatBox(
                icon: '🏆',
                title: TRStrings.achievements,
                value: '${stats['achievementsCount']}',
                theme: theme,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatBox({
    required String icon,
    required String title,
    required String value,
    required ThemeController theme,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: theme.dividerColor.withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Text(
            icon,
            style: const TextStyle(fontSize: 40),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: theme.primaryTextColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: theme.secondaryTextColor,
            ),
          ),
        ],
      ),
    ).animate().fadeIn().scale(delay: 100.ms);
  }

  Widget _buildDetailCard({
    required IconData icon,
    required String title,
    required String value,
    String? subtitle,
    required ThemeController theme,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: theme.dividerColor.withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: AppColors.purpleGradient),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              icon,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: theme.secondaryTextColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: theme.primaryTextColor,
                  ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: theme.secondaryTextColor,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}