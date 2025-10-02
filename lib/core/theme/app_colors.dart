import 'package:flutter/material.dart';

/// Apple-inspired modern color system
class AppColors {
  // iOS Calculator Colors
  static const Color iosBlack = Color(0xFF000000);
  static const Color iosDarkGray = Color(0xFF333333);
  static const Color iosLightGray = Color(0xFFA5A5A5);
  static const Color iosOrange = Color(0xFFFF9500);
  static const Color iosWhite = Color(0xFFFFFFFF);
  
  // Modern Gradients (as List<Color> for flexibility)
  static const List<Color> primaryGradient = [
    Color(0xFF667EEA),
    Color(0xFF764BA2),
  ];
  
  static const List<Color> successGradient = [
    Color(0xFF11998E),
    Color(0xFF38EF7D),
  ];
  
  static const List<Color> warningGradient = [
    Color(0xFFFFB75E),
    Color(0xFFED8F03),
  ];
  
  static const List<Color> dangerGradient = [
    Color(0xFFFF416C),
    Color(0xFFFF4B2B),
  ];
  
  static const List<Color> errorGradient = [
    Color(0xFFFF416C),
    Color(0xFFFF4B2B),
  ];
  
  static const List<Color> infoGradient = [
    Color(0xFF4FACFE),
    Color(0xFF00F2FE),
  ];
  
  static const List<Color> purpleGradient = [
    Color(0xFF6C5CE7),
    Color(0xFFA29BFE),
  ];
  
  static const List<Color> oceanGradient = [
    Color(0xFF2E3192),
    Color(0xFF1BFFFF),
  ];
  
  static const List<Color> sunsetGradient = [
    Color(0xFFFF6B6B),
    Color(0xFFFFE66D),
  ];
  
  static const List<Color> premiumGradient = [
    Color(0xFFFFD700),
    Color(0xFFFFAF00),
  ];
  
  // Theme Colors
  static const Color primaryPurple = Color(0xFF6C5CE7);
  static const Color secondaryPurple = Color(0xFFA29BFE);
  static const Color accentCyan = Color(0xFF00CED1);
  static const Color successGreen = Color(0xFF00B894);
  static const Color warningYellow = Color(0xFFFDAB3E);
  static const Color errorRed = Color(0xFFE17055);
  static const Color infoPink = Color(0xFFE84393);
  
  // Modern Calculator Colors (for ModernCalculatorScreen)
  static const Color oceanBlue = Color(0xFF0A74DA);
  static const Color royalPurple = Color(0xFF6C5CE7);
  static const Color electricViolet = Color(0xFF8E44AD);
  static const Color neonPink = Color(0xFFFF006E);
  static const Color sunsetOrange = Color(0xFFFF6B35);
  static const Color coralRed = Color(0xFFFF5252);
  static const Color goldenYellow = Color(0xFFFFD700);
  
  // Shorthand aliases for convenience
  static const Color primary = primaryPurple;
  static const Color success = successGreen;
  static const Color warning = warningYellow;
  static const Color error = errorRed;
  static const Color premium = premiumGold;
  
  // Dark Theme Colors
  static const Color darkBackground = Color(0xFF0A0A0A);
  static const Color darkSurface = Color(0xFF1A1A1A);
  static const Color darkCard = Color(0xFF1E1E1E);
  static const Color darkBorder = Color(0xFF2A2A2A);
  
  // Light Theme Colors
  static const Color lightBackground = Color(0xFFF8F9FA);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightBorder = Color(0xFFE1E8ED);
  
  // Text Colors
  static const Color darkText = Color(0xFF2D3436);
  static const Color lightText = Color(0xFFFFFFFF);
  static const Color grayText = Color(0xFF636E72);
  static const Color hintText = Color(0xFF95A5A6);
  
  // Calculator Specific
  static const Color calculatorOrange = Color(0xFFFF9500);
  static const Color calculatorGray = Color(0xFF505050);
  static const Color calculatorLightGray = Color(0xFFD4D4D2);
  
  // Premium Colors
  static const Color premiumGold = Color(0xFFFFD700);
  static const Color premiumSilver = Color(0xFFC0C0C0);
  static const Color premiumBronze = Color(0xFFCD7F32);
  
  // Social Colors
  static const Color likeRed = Color(0xFFE74C3C);
  static const Color shareBlue = Color(0xFF3498DB);
  static const Color commentGreen = Color(0xFF2ECC71);
  
  // Achievement Colors
  static const Color achievementGold = Color(0xFFFFD700);
  static const Color achievementSilver = Color(0xFFE8E8E8);
  static const Color achievementBronze = Color(0xFFCD7F32);
  
  // Shimmer Colors
  static const Color shimmerBase = Color(0xFF2A2A2A);
  static const Color shimmerHighlight = Color(0xFF3A3A3A);
  
  // Status Colors
  static const Color online = Color(0xFF2ECC71);
  static const Color offline = Color(0xFF95A5A6);
  static const Color busy = Color(0xFFE74C3C);
  static const Color away = Color(0xFFF39C12);
}