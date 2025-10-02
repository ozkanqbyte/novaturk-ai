import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../controllers/challenge_controller.dart';
import '../../controllers/profile_controller.dart';
import '../../controllers/theme_controller.dart';
import '../../core/theme/app_colors.dart';
import '../../core/localization/tr_TR.dart';
import '../../models/challenge_model.dart';

class ChallengesScreen extends StatelessWidget {
  const ChallengesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer3<ChallengeController, ProfileController, ThemeController>(
      builder: (context, challengeController, profileController, themeController, child) {
        return Scaffold(
          backgroundColor: themeController.isDarkMode
              ? AppColors.darkBackground
              : AppColors.lightBackground,
          appBar: AppBar(
            title: Text(
              TRStrings.challenges,
              style: GoogleFonts.inter(fontWeight: FontWeight.bold),
            ),
            backgroundColor: Colors.transparent,
            elevation: 0,
          ),
          body: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              // Günlük Meydan Okumalar
              _buildSection(
                TRStrings.dailyChallenges,
                challengeController.dailyChallenges,
                challengeController,
                profileController,
                themeController,
              ),
              
              const SizedBox(height: 24),
              
              // Haftalık Meydan Okumalar
              _buildSection(
                TRStrings.weeklyChallenges,
                challengeController.weeklyChallenges,
                challengeController,
                profileController,
                themeController,
              ),
              
              const SizedBox(height: 24),
              
              // Özel Meydan Okumalar
              _buildSection(
                TRStrings.specialChallenges,
                challengeController.specialChallenges,
                challengeController,
                profileController,
                themeController,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSection(
    String title,
    List<ChallengeModel> challenges,
    ChallengeController challengeController,
    ProfileController profileController,
    ThemeController theme,
  ) {
    if (challenges.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: theme.primaryTextColor,
          ),
        ),
        const SizedBox(height: 16),
        ...challenges.map(
          (challenge) => _buildChallengeCard(
            challenge,
            challengeController,
            profileController,
            theme,
          ),
        ),
      ],
    );
  }

  Widget _buildChallengeCard(
    ChallengeModel challenge,
    ChallengeController challengeController,
    ProfileController profileController,
    ThemeController theme,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: challenge.isCompleted
              ? AppColors.successGreen.withOpacity(0.3)
              : theme.dividerColor.withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Icon
              Text(
                challenge.emoji,
                style: const TextStyle(fontSize: 32),
              ),
              const SizedBox(width: 16),
              // Title & Difficulty
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      challenge.title,
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: theme.primaryTextColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(
                          challenge.difficultyEmoji,
                          style: const TextStyle(fontSize: 14),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          challenge.difficultyText,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: theme.secondaryTextColor,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Reward Badge
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: AppColors.premiumGradient),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Text('🏆', style: TextStyle(fontSize: 16)),
                    const SizedBox(width: 4),
                    Text(
                      '+${challenge.reward}',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Description
          Text(
            challenge.description,
            style: GoogleFonts.inter(
              fontSize: 14,
              color: theme.secondaryTextColor,
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Progress Bar
          Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'İlerleme: ${challenge.currentProgress}/${challenge.targetValue}',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: theme.secondaryTextColor,
                    ),
                  ),
                  Text(
                    challenge.timeRemainingText,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: challenge.isExpired
                          ? AppColors.errorRed
                          : AppColors.primaryPurple,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: challenge.progress,
                  minHeight: 8,
                  backgroundColor: theme.dividerColor,
                  valueColor: AlwaysStoppedAnimation(
                    challenge.isCompleted
                        ? AppColors.successGreen
                        : AppColors.primaryPurple,
                  ),
                ),
              ),
            ],
          ),
          
          // Claim Button
          if (challenge.isCompleted && !challenge.isClaimed) ...[
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  final points = await challengeController.claimReward(challenge.id);
                  if (points > 0) {
                    await profileController.addPoints(points);
                    // Show success message
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.successGreen,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  '${TRStrings.claimReward} (+${challenge.reward})',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
          
          // Completed Badge
          if (challenge.isClaimed) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.successGreen.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.check_circle_rounded,
                    color: AppColors.successGreen,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    TRStrings.completed,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.successGreen,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    ).animate().fadeIn().slideX(begin: -0.1);
  }
}