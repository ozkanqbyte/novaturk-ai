import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../controllers/leaderboard_controller.dart';
import '../../controllers/challenge_controller.dart';
import '../../controllers/theme_controller.dart';
import '../../core/theme/app_colors.dart';
import '../../core/localization/tr_TR.dart';
import '../../models/leaderboard_model.dart';
import 'challenges_screen.dart';

class LeaderboardScreen extends StatelessWidget {
  const LeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer3<LeaderboardController, ChallengeController, ThemeController>(
      builder: (context, leaderboardController, challengeController, themeController, child) {
        return Scaffold(
          backgroundColor: themeController.isDarkMode
              ? AppColors.darkBackground
              : AppColors.lightBackground,
          body: CustomScrollView(
            slivers: [
              // App Bar with Tabs
              SliverAppBar(
                expandedHeight: 120,
                floating: true,
                pinned: true,
                backgroundColor: AppColors.primaryPurple,
                flexibleSpace: FlexibleSpaceBar(
                  title: Text(
                    TRStrings.leaderboard,
                    style: GoogleFonts.inter(fontWeight: FontWeight.bold),
                  ),
                  centerTitle: false,
                ),
                bottom: PreferredSize(
                  preferredSize: const Size.fromHeight(60),
                  child: _buildPeriodTabs(leaderboardController, themeController),
                ),
                actions: [
                  IconButton(
                    icon: const Icon(Icons.emoji_events_rounded),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ChallengesScreen(),
                        ),
                      );
                    },
                  ),
                ],
              ),

              // Loading or Content
              if (leaderboardController.isLoading)
                const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                )
              else ...[
                // Top 3 Podium
                SliverToBoxAdapter(
                  child: _buildTopThreePodium(leaderboardController, themeController),
                ),

                // Current User Card (if not in top 3)
                if (leaderboardController.currentUser != null &&
                    leaderboardController.currentUser!.rank > 3)
                  SliverToBoxAdapter(
                    child: _buildCurrentUserCard(leaderboardController, themeController),
                  ),

                // Other Users List
                SliverPadding(
                  padding: const EdgeInsets.all(20),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final entries = leaderboardController.entries.skip(3).toList();
                        if (index >= entries.length) return null;
                        return _buildLeaderboardEntry(
                          entries[index],
                          themeController,
                        ).animate().fadeIn(delay: (50 * index).ms);
                      },
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildPeriodTabs(
    LeaderboardController controller,
    ThemeController theme,
  ) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: LeaderboardPeriod.values.map((period) {
          final isSelected = controller.currentPeriod == period;
          return Expanded(
            child: GestureDetector(
              onTap: () => controller.switchPeriod(period),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.white : Colors.transparent,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  _getPeriodText(period),
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: isSelected ? AppColors.primaryPurple : Colors.white,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  String _getPeriodText(LeaderboardPeriod period) {
    switch (period) {
      case LeaderboardPeriod.daily:
        return TRStrings.daily;
      case LeaderboardPeriod.weekly:
        return TRStrings.weekly;
      case LeaderboardPeriod.monthly:
        return TRStrings.monthly;
      case LeaderboardPeriod.allTime:
        return TRStrings.allTime;
    }
  }

  Widget _buildTopThreePodium(
    LeaderboardController controller,
    ThemeController theme,
  ) {
    final top3 = controller.getTopThree();
    if (top3.length < 3) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // 2nd Place
          _buildPodiumCard(top3[1], 2, 140, theme).animate().fadeIn(delay: 200.ms).slideY(begin: 0.3),
          const SizedBox(width: 12),
          // 1st Place
          _buildPodiumCard(top3[0], 1, 180, theme).animate().fadeIn(delay: 100.ms).slideY(begin: 0.3),
          const SizedBox(width: 12),
          // 3rd Place
          _buildPodiumCard(top3[2], 3, 120, theme).animate().fadeIn(delay: 300.ms).slideY(begin: 0.3),
        ],
      ),
    );
  }

  Widget _buildPodiumCard(
    LeaderboardEntry entry,
    int place,
    double height,
    ThemeController theme,
  ) {
    final colors = [
      AppColors.premiumGradient, // Gold
      [const Color(0xFFC0C0C0), const Color(0xFFE8E8E8)], // Silver
      [const Color(0xFFCD7F32), const Color(0xFFDDA15E)], // Bronze
    ];

    return Container(
      width: 100,
      height: height,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: colors[place - 1]),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        boxShadow: [
          BoxShadow(
            color: colors[place - 1][0].withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
            ),
            child: Center(
              child: Text(
                entry.username[0].toUpperCase(),
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: colors[place - 1][0],
                ),
              ),
            ),
          ),
          Text(
            entry.username,
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          Text(
            '${entry.points}',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          Text(
            entry.rankEmoji,
            style: const TextStyle(fontSize: 24),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentUserCard(
    LeaderboardController controller,
    ThemeController theme,
  ) {
    final user = controller.currentUser!;

    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: AppColors.primaryGradient),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
            ),
            child: Center(
              child: Text(
                user.username[0].toUpperCase(),
                style: GoogleFonts.inter(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryPurple,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      '${TRStrings.you} ',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '#${user.rank}',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                Text(
                  '${user.points} ${TRStrings.points}',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.9),
                  ),
                ),
              ],
            ),
          ),
          const Icon(
            Icons.star_rounded,
            color: Colors.white,
            size: 32,
          ),
        ],
      ),
    ).animate().fadeIn().scale();
  }

  Widget _buildLeaderboardEntry(
    LeaderboardEntry entry,
    ThemeController theme,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: entry.isCurrentUser
            ? AppColors.primaryPurple.withOpacity(0.1)
            : theme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: entry.isCurrentUser
              ? AppColors.primaryPurple.withOpacity(0.3)
              : theme.dividerColor.withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          // Rank
          SizedBox(
            width: 40,
            child: Text(
              '#${entry.rank}',
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: theme.primaryTextColor,
              ),
            ),
          ),
          // Avatar
          Container(
            width: 45,
            height: 45,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primaryPurple.withOpacity(0.1),
            ),
            child: Center(
              child: Text(
                entry.username[0].toUpperCase(),
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryPurple,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      entry.username,
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: theme.primaryTextColor,
                      ),
                    ),
                    if (entry.isCurrentUser) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primaryPurple,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          TRStrings.you,
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
                Text(
                  '${TRStrings.level} ${entry.level}',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: theme.secondaryTextColor,
                  ),
                ),
              ],
            ),
          ),
          // Points
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${entry.points}',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: theme.primaryTextColor,
                ),
              ),
              Text(
                TRStrings.points,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: theme.secondaryTextColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}