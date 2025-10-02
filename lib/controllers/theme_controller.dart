import 'package:flutter/material.dart';
import '../services/storage_service.dart';

class ThemeController extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.dark; // Default to dark theme
  
  ThemeMode get themeMode => _themeMode;
  
  bool get isDarkMode => _themeMode == ThemeMode.dark;
  
  ThemeController() {
    _loadThemeFromStorage();
  }
  
  void _loadThemeFromStorage() {
    final savedTheme = StorageService.getThemeMode();
    _themeMode = savedTheme;
    notifyListeners();
  }
  
  Future<void> toggleTheme() async {
    _themeMode = _themeMode == ThemeMode.dark 
        ? ThemeMode.light 
        : ThemeMode.dark;
    
    await StorageService.setThemeMode(_themeMode);
    
    // Add real-time theme switching with animation
    notifyListeners();
    
    // Optional: Add a brief delay for smoother transition
    await Future.delayed(const Duration(milliseconds: 50));
    notifyListeners();
  }
  
  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    await StorageService.setThemeMode(_themeMode);
    notifyListeners();
  }
  
  Color get primaryColor => const Color(0xFF6C5CE7);
  Color get secondaryColor => const Color(0xFFA29BFE);
  Color get accentColor => const Color(0xFF00CED1);
  Color get successColor => const Color(0xFF00B894);
  Color get warningColor => const Color(0xFFFDAB3E);
  Color get errorColor => const Color(0xFFE17055);
  
  // Gradient colors
  List<Color> get primaryGradient => [
    const Color(0xFF6C5CE7),
    const Color(0xFFA29BFE),
  ];
  
  List<Color> get backgroundGradient => isDarkMode
      ? [
          const Color(0xFF0A0A0A),
          const Color(0xFF1A1A1A),
        ]
      : [
          const Color(0xFFF8F9FA),
          const Color(0xFFFFFFFF),
        ];
  
  // Text colors
  Color get primaryTextColor => isDarkMode 
      ? Colors.white 
      : const Color(0xFF2D3436);
      
  Color get secondaryTextColor => isDarkMode 
      ? Colors.white70 
      : const Color(0xFF636E72);
      
  Color get hintTextColor => isDarkMode 
      ? Colors.white54 
      : const Color(0xFF95A5A6);
  
  // Surface colors
  Color get surfaceColor => isDarkMode 
      ? const Color(0xFF1A1A1A) 
      : Colors.white;
      
  Color get cardColor => isDarkMode 
      ? const Color(0xFF1A1A1A) 
      : Colors.white;
      
  Color get dividerColor => isDarkMode 
      ? const Color(0xFF2A2A2A) 
      : const Color(0xFFE1E8ED);
  
  // Button colors
  Color get buttonBackgroundColor => primaryColor;
  Color get buttonTextColor => Colors.white;
  
  // Calculator specific colors
  Color get numberButtonColor => isDarkMode 
      ? const Color(0xFF2A2A2A) 
      : const Color(0xFFF1F2F6);
      
  Color get operatorButtonColor => primaryColor;
  
  Color get functionButtonColor => isDarkMode 
      ? const Color(0xFF3A3A3A) 
      : const Color(0xFFDDD6FE);
  
  Color get equalsButtonColor => const Color(0xFF00B894);
  
  // AI specific colors
  Color get aiButtonColor => const Color(0xFF00CED1);
  Color get voiceButtonColor => const Color(0xFFE84393);
  Color get cameraButtonColor => const Color(0xFFFD79A8);
  
  // Animation colors
  List<Color> get calculatorGradient => [
    primaryColor,
    secondaryColor,
    accentColor,
  ];
}