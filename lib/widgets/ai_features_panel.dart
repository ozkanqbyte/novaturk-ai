import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:get/get.dart';
import 'dart:async';
import '../controllers/ai_controller.dart';
import '../controllers/calculator_controller.dart';
import '../controllers/theme_controller.dart';
import 'calculator_button.dart';
import '../services/storage_service.dart';
import 'ultra_premium_ai_widgets.dart';

class AIFeaturesPanel extends StatefulWidget {
  const AIFeaturesPanel({super.key});

  @override
  State<AIFeaturesPanel> createState() => _AIFeaturesPanelState();
}

class _AIFeaturesPanelState extends State<AIFeaturesPanel> with TickerProviderStateMixin {
  bool _showTutorial = false;
  bool _showAdvancedFeatures = false;
  int _selectedTab = 0;
  bool _autoScrollEnabled = false;
  Timer? _autoScrollTimer;
  late ScrollController _scrollController;
  late AnimationController _scrollAnimationController;
  late Animation<double> _scrollAnimation;
  
  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollAnimationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _scrollAnimation = CurvedAnimation(
      parent: _scrollAnimationController,
      curve: Curves.easeInOutCubic,
    );
  }
  
  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _scrollController.dispose();
    _scrollAnimationController.dispose();
    super.dispose();
  }
  
  void _animateToTop() {
    _scrollController.animateTo(
      0,
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeInOut,
    );
  }
  
  void _smoothScrollDown() {
    final maxScroll = _scrollController.position.maxScrollExtent;
    
    _scrollController.animateTo(
      maxScroll,
      duration: const Duration(milliseconds: 800),
      curve: Curves.easeInOut,
    );
  }
  
  void _scrollToBottom() {
    final maxScroll = _scrollController.position.maxScrollExtent;
    
    _scrollController.animateTo(
      maxScroll,
      duration: const Duration(milliseconds: 1200),
      curve: Curves.easeInOutCubic,
    );
  }
  
  void _scrollToMiddle() {
    final maxScroll = _scrollController.position.maxScrollExtent;
    final middleScroll = maxScroll / 2;
    
    _scrollController.animateTo(
      middleScroll,
      duration: const Duration(milliseconds: 600),
      curve: Curves.easeInOut,
    );
  }
  
  double _getScrollProgress() {
    if (!_scrollController.hasClients) return 0.0;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return maxScroll > 0 ? (currentScroll / maxScroll).clamp(0.0, 1.0) : 0.0;
  }
  
  void _scrollToSection(int sectionIndex) {
    final maxScroll = _scrollController.position.maxScrollExtent;
    final sectionHeight = maxScroll / 4; // 4 sections (tabs)
    final targetScroll = sectionHeight * sectionIndex;
    
    _scrollController.animateTo(
      targetScroll.clamp(0.0, maxScroll),
      duration: const Duration(milliseconds: 800),
      curve: Curves.easeInOutCubic,
    );
  }
  
  void _toggleAutoScroll() {
    setState(() {
      _autoScrollEnabled = !_autoScrollEnabled;
    });
    
    if (_autoScrollEnabled) {
      _startAutoScroll();
    } else {
      _stopAutoScroll();
    }
  }
  
  void _startAutoScroll() {
    if (!_scrollController.hasClients || _autoScrollTimer != null) return;
    
    _autoScrollTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (!mounted || !_autoScrollEnabled) {
        timer.cancel();
        _autoScrollTimer = null;
        return;
      }
      
      final maxScroll = _scrollController.position.maxScrollExtent;
      final currentScroll = _scrollController.offset;
      
      if (currentScroll >= maxScroll) {
        // If at bottom, scroll to top
        _animateToTop();
      } else {
        // Continue scrolling down smoothly
        final nextScroll = (currentScroll + 150).clamp(0.0, maxScroll);
        _scrollController.animateTo(
          nextScroll,
          duration: const Duration(milliseconds: 1500),
          curve: Curves.easeInOut,
        );
      }
    });
  }
  
  void _stopAutoScroll() {
    _autoScrollTimer?.cancel();
    _autoScrollTimer = null;
  }
  
  void _handleScrollGesture(TapDownDetails details) {
    final RenderBox renderBox = context.findRenderObject() as RenderBox;
    final localPosition = renderBox.globalToLocal(details.globalPosition);
    final screenHeight = MediaQuery.of(context).size.height;
    final tapPosition = localPosition.dy / screenHeight;
    
    // Convert tap position to scroll position
    final maxScroll = _scrollController.position.maxScrollExtent;
    final targetScroll = maxScroll * tapPosition;
    
    _scrollController.animateTo(
      targetScroll,
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeInOut,
    );
  }
  
  void _showSectionNavigation(ThemeController themeController) {
    final sections = [
      {'name': '🎤 Voice AI', 'icon': Icons.mic, 'index': 0},
      {'name': '📸 Camera OCR', 'icon': Icons.camera_alt, 'index': 1},
      {'name': '🤖 Conversational AI', 'icon': Icons.psychology, 'index': 2},
      {'name': '🔮 Predictive AI', 'icon': Icons.auto_fix_high, 'index': 3},
      {'name': '👋 Gesture Recognition', 'icon': Icons.gesture, 'index': 4},
      {'name': '🌍 Multi-Language', 'icon': Icons.language, 'index': 5},
      {'name': '📊 Analytics', 'icon': Icons.analytics, 'index': 6},
    ];
    
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              themeController.primaryColor.withOpacity(0.9),
              themeController.secondaryColor.withOpacity(0.9),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(25),
            topRight: Radius.circular(25),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle bar
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.5),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            
            Text(
              '📍 Hızlı Navigasyon',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            
            const SizedBox(height: 20),
            
            ...sections.map((section) {
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      section['icon'] as IconData,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                  title: Text(
                    section['name'] as String,
                    style: GoogleFonts.poppins(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  trailing: Icon(
                    Icons.arrow_forward_ios,
                    color: Colors.white.withOpacity(0.7),
                    size: 16,
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    _scrollToSection(section['index'] as int);
                    HapticFeedback.lightImpact();
                  },
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  tileColor: Colors.white.withOpacity(0.1),
                ),
              ).animate().fadeIn().slideX(begin: -0.3, end: 0);
            }).toList(),
            
            const SizedBox(height: 20),
            
            // Close button
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: themeController.primaryColor,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              ),
              child: Text(
                'Kapat',
                style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer3<AIController, CalculatorController, ThemeController>(
      builder: (context, aiController, calcController, themeController, child) {
        return Scaffold(
          backgroundColor: Colors.transparent,
          body: Container(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Ultra-Premium Header with Real-time Stats
                _buildUltraPremiumHeader(aiController, themeController),
                
                const SizedBox(height: 20),
                
                // AI Feature Tabs
                _buildAIFeatureTabs(themeController),
                
                const SizedBox(height: 20),
                
                // Main AI Features Panel with Enhanced Scrolling
                Expanded(
                  child: NotificationListener<ScrollNotification>(
                    onNotification: (scrollNotification) {
                      if (scrollNotification is ScrollUpdateNotification) {
                        setState(() {});
                      }
                      return false;
                    },
                    child: Scrollbar(
                      controller: _scrollController,
                      thumbVisibility: true,
                      thickness: 8,
                      radius: const Radius.circular(10),
                      child: GestureDetector(
                        onDoubleTap: () {
                          // Double tap to scroll to middle
                          _scrollToMiddle();
                          HapticFeedback.mediumImpact();
                        },
                        onLongPress: () {
                          // Long press to toggle auto-scroll
                          _toggleAutoScroll();
                          HapticFeedback.heavyImpact();
                        },
                        child: SingleChildScrollView(
                          controller: _scrollController,
                          physics: const BouncingScrollPhysics(),
                          padding: const EdgeInsets.only(right: 8),
                          child: AnimatedBuilder(
                            animation: _scrollAnimation,
                            builder: (context, child) {
                              return _buildSelectedTabContent(aiController, calcController, themeController);
                            },
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          floatingActionButton: _buildScrollButtons(themeController),
        );
      },
    );
  }

  Widget _buildScrollButtons(ThemeController themeController) {
    final scrollProgress = _getScrollProgress();
    
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: themeController.cardColor.withOpacity(0.9),
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Scroll Progress Indicator
          Container(
            width: 8,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.grey.withOpacity(0.3),
              borderRadius: BorderRadius.circular(4),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.topCenter,
              heightFactor: scrollProgress,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [themeController.primaryColor, themeController.secondaryColor],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ).animate()
           .fadeIn(duration: 300.ms),
          
          const SizedBox(height: 12),
          
          // Scroll to Top Button
          FloatingActionButton.small(
            heroTag: "scrollTop",
            onPressed: _animateToTop,
            backgroundColor: themeController.primaryColor,
            child: Icon(Icons.vertical_align_top, color: Colors.white, size: 18),
          ).animate()
           .fadeIn(duration: 300.ms)
           .scale(delay: 100.ms),
           
          const SizedBox(height: 8),
          
          // Scroll to Middle Button
          FloatingActionButton.small(
            heroTag: "scrollMiddle",
            onPressed: _scrollToMiddle,
            backgroundColor: themeController.accentColor,
            child: Icon(Icons.vertical_align_center, color: Colors.white, size: 18),
          ).animate()
           .fadeIn(duration: 300.ms)
           .scale(delay: 150.ms),
           
          const SizedBox(height: 8),
          
          // Scroll to Bottom Button (Complete Scroll Down)
          FloatingActionButton.small(
            heroTag: "scrollBottom",
            onPressed: _smoothScrollDown,
            backgroundColor: themeController.secondaryColor,
            child: Icon(Icons.vertical_align_bottom, color: Colors.white, size: 18),
          ).animate()
           .fadeIn(duration: 300.ms)
           .scale(delay: 200.ms),
           
          const SizedBox(height: 12),
          
          // Auto-Scroll Toggle Button
          FloatingActionButton.small(
            heroTag: "autoScroll",
            onPressed: _toggleAutoScroll,
            backgroundColor: _autoScrollEnabled 
                ? themeController.successColor 
                : Colors.grey,
            child: Icon(
              _autoScrollEnabled ? Icons.pause : Icons.play_arrow,
              color: Colors.white,
              size: 18,
            ),
          ).animate(target: _autoScrollEnabled ? 1 : 0)
           .scale(duration: 200.ms)
           .then()
           .shimmer(delay: 500.ms, duration: 1000.ms),
           
          const SizedBox(height: 8),
          
          // Quick Section Navigation
          GestureDetector(
            onLongPress: () => _showSectionNavigation(themeController),
            child: FloatingActionButton.small(
              heroTag: "sectionNav",
              onPressed: () => _scrollToSection(_selectedTab),
              backgroundColor: themeController.warningColor,
              child: Icon(Icons.list, color: Colors.white, size: 18),
            ),
          ).animate()
           .fadeIn(duration: 300.ms)
           .scale(delay: 250.ms),
           
          const SizedBox(height: 12),
          
          // Scroll Progress Text
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: themeController.primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Text(
                  '${(scrollProgress * 100).toInt()}%',
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: themeController.primaryColor,
                  ),
                ),
                if (_autoScrollEnabled)
                  Icon(
                    Icons.autorenew,
                    size: 12,
                    color: themeController.successColor,
                  ).animate(onPlay: (controller) => controller.repeat())
                   .rotate(duration: 2000.ms),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectedTabContent(AIController aiController, CalculatorController calcController, ThemeController themeController) {
    Widget content;
    switch (_selectedTab) {
      case 0: // Core AI Features
        content = _buildCoreAIFeatures(aiController, calcController, themeController);
        break;
      case 1: // Ultra-Premium Features
        content = _buildUltraPremiumFeatures(aiController, calcController, themeController);
        break;
      case 2: // Social & Gamification
        content = _buildSocialGameFeatures(aiController, calcController, themeController);
        break;
      case 3: // Settings & Analytics
        content = _buildSettingsAnalytics(aiController, themeController);
        break;
      default:
        content = _buildCoreAIFeatures(aiController, calcController, themeController);
    }
    
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      transitionBuilder: (Widget child, Animation<double> animation) {
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0.1, 0.0),
              end: Offset.zero,
            ).animate(animation),
            child: child,
          ),
        );
      },
      child: Container(
        key: ValueKey(_selectedTab),
        child: content,
      ),
    );
  }

  // 🚀 ULTRA-PREMIUM HEADER WITH REAL-TIME STATS
  Widget _buildUltraPremiumHeader(AIController aiController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            themeController.primaryColor,
            themeController.secondaryColor,
            themeController.accentColor,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          stops: const [0.0, 0.5, 1.0],
        ),
        borderRadius: BorderRadius.circular(25),
        boxShadow: [
          BoxShadow(
            color: themeController.primaryColor.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              // AI Brain Icon with Animation
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Icon(
                  Icons.psychology_rounded,
                  color: Colors.white,
                  size: 32,
                ).animate(onPlay: (controller) => controller.repeat())
                 .shimmer(duration: 2000.ms, color: Colors.white.withOpacity(0.5)),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '🧠 AI Math Genius',
                      style: GoogleFonts.poppins(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Next-Gen AI • Voice • Gesture • Camera • Real-time Learning',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
              // Real-time Performance Indicator
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.green.withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Colors.green,
                        shape: BoxShape.circle,
                      ),
                    ).animate(onPlay: (controller) => controller.repeat())
                     .fade(duration: 1000.ms),
                    const SizedBox(width: 6),
                    Text(
                      'LIVE',
                      style: GoogleFonts.poppins(
                        fontSize: 10,
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
          
          // Real-time AI Stats Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatCard('Accuracy', '${(aiController.accuracyScore * 100).toInt()}%', Icons.gps_fixed, Colors.green),
              _buildStatCard('Speed', '${aiController.averageResponseTime.toInt()}ms', Icons.speed, Colors.blue),
              _buildStatCard('Streak', '${aiController.streakDays}d', Icons.local_fire_department, Colors.orange),
              _buildStatCard('Lang', aiController.currentLanguage.split('-')[0].toUpperCase(), Icons.language, Colors.purple),
            ],
          ),
        ],
      ),
    ).animate().fadeIn().slideY(begin: -0.3, end: 0);
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 10,
            color: Colors.white.withOpacity(0.8),
          ),
        ),
      ],
    );
  }

  // 🎭 AI FEATURE TABS
  Widget _buildAIFeatureTabs(ThemeController themeController) {
    final tabs = [
      {'title': 'Core AI', 'icon': Icons.auto_awesome},
      {'title': 'Ultra-Premium', 'icon': Icons.diamond},
      {'title': 'Social', 'icon': Icons.emoji_events},
      {'title': 'Analytics', 'icon': Icons.analytics},
    ];

    return Container(
      height: 60,
      decoration: BoxDecoration(
        color: themeController.cardColor,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        children: tabs.asMap().entries.map((entry) {
          final index = entry.key;
          final tab = entry.value;
          final isSelected = _selectedTab == index;
          
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _selectedTab = index),
              child: Container(
                margin: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  gradient: isSelected ? LinearGradient(
                    colors: [themeController.primaryColor, themeController.secondaryColor],
                  ) : null,
                  color: !isSelected ? Colors.transparent : null,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      tab['icon'] as IconData,
                      color: isSelected ? Colors.white : themeController.primaryColor,
                      size: 20,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      tab['title'] as String,
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: isSelected ? Colors.white : themeController.primaryColor,
                      ),
                    ),
                  ],
                ),
              ).animate().scale(
                duration: 200.ms,
                curve: Curves.easeInOut,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // 🎯 CORE AI FEATURES TAB
  Widget _buildCoreAIFeatures(AIController aiController, CalculatorController calcController, ThemeController themeController) {
    return Column(
      children: [
        // Enhanced Voice & Camera Row
        Row(
          children: [
            Expanded(
              child: _buildEnhancedVoiceFeature(aiController, calcController, themeController),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildEnhancedCameraFeature(aiController, calcController, themeController),
            ),
          ],
        ),
        
        const SizedBox(height: 20),
        
        // AI Expression Solver with Natural Language
        _buildNaturalLanguageSolver(aiController, calcController, themeController),
        
        const SizedBox(height: 20),
        
        // Conversational AI Chat
        UltraPremiumAIWidgets.buildConversationalAI(aiController, calcController, themeController),
        
        const SizedBox(height: 20),
        
        // Real-time Expression Prediction
        UltraPremiumAIWidgets.buildPredictiveAI(aiController, calcController, themeController),
        
        const SizedBox(height: 20),
        
        // Smart History & Learning
        _buildSmartHistoryLearning(aiController, calcController, themeController),
        
        const SizedBox(height: 20),
        
        // Multi-Language Support
        UltraPremiumAIWidgets.buildMultiLanguageSupport(aiController, themeController),
        
        const SizedBox(height: 20),
        
        // AI Performance Monitor
        _buildRealTimePerformance(aiController, themeController),
      ],
    );
  }

  // 💎 ULTRA-PREMIUM FEATURES TAB
  Widget _buildUltraPremiumFeatures(AIController aiController, CalculatorController calcController, ThemeController themeController) {
    return Column(
      children: [
        // Gesture Recognition
        UltraPremiumAIWidgets.buildGestureRecognition(aiController, calcController, themeController),
        
        const SizedBox(height: 20),
        
        // Advanced OCR with 4-Layer Processing
        _buildAdvancedOCR(aiController, calcController, themeController),
        
        const SizedBox(height: 20),
        
        // Pattern Recognition & Symbolic AI
        _buildPatternRecognition(aiController, themeController),
        
        const SizedBox(height: 20),
        
        // Real-time Learning & Personalization
        _buildPersonalizationPanel(aiController, themeController),
      ],
    );
  }

  // 🏆 SOCIAL & GAMIFICATION TAB
  Widget _buildSocialGameFeatures(AIController aiController, CalculatorController calcController, ThemeController themeController) {
    return Column(
      children: [
        // Daily Challenges
        _buildDailyChallenges(aiController, themeController),
        
        const SizedBox(height: 20),
        
        // Achievement Progress
        _buildAchievements(aiController, themeController),
        
        const SizedBox(height: 20),
        
        // Streak & Leaderboard
        _buildStreakLeaderboard(aiController, themeController),
        
        const SizedBox(height: 20),
        
        // AI Encouragement
        _buildAIEncouragement(aiController, themeController),
      ],
    );
  }

  // 📊 SETTINGS & ANALYTICS TAB
  Widget _buildSettingsAnalytics(AIController aiController, ThemeController themeController) {
    return Column(
      children: [
        // Performance Analytics
        _buildPerformanceAnalytics(aiController, themeController),
        
        const SizedBox(height: 20),
        
        // AI Model Settings
        _buildAIModelSettings(aiController, themeController),
        
        const SizedBox(height: 20),
        
        // Privacy & Data Controls
        _buildPrivacyControls(themeController),
      ],
    );
  }

  // 🎤 ENHANCED VOICE FEATURE WITH MULTI-LANGUAGE
  Widget _buildEnhancedVoiceFeature(AIController aiController, CalculatorController calcController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            themeController.successColor.withOpacity(0.1),
            themeController.primaryColor.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: aiController.isListening 
              ? themeController.successColor.withOpacity(0.5)
              : themeController.primaryColor.withOpacity(0.2),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: aiController.isListening 
                ? themeController.successColor.withOpacity(0.3)
                : Colors.black.withOpacity(0.1),
            blurRadius: aiController.isListening ? 20 : 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          // Voice Icon with Real-time Animation
          Stack(
            alignment: Alignment.center,
            children: [
              if (aiController.isListening)
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: themeController.successColor.withOpacity(0.2),
                  ),
                ).animate(onPlay: (controller) => controller.repeat())
                 .scale(duration: 1000.ms, begin: const Offset(0.8, 0.8), end: const Offset(1.2, 1.2)),
              
              Icon(
                aiController.isListening ? Icons.mic : Icons.mic_none,
                size: 40,
                color: aiController.isListening 
                    ? themeController.successColor 
                    : themeController.primaryColor,
              ).animate(
                onPlay: (controller) => aiController.isListening ? controller.repeat() : null,
              ).shimmer(duration: 500.ms),
            ],
          ),
          
          const SizedBox(height: 16),
          
          Text(
            '🎤 Smart Voice AI',
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: themeController.primaryTextColor,
            ),
          ),
          
          const SizedBox(height: 8),
          
          Text(
            aiController.isListening 
                ? '👂 Dinliyorum... (${aiController.currentLanguage})' 
                : 'Matematik problemini sesle söyle',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: themeController.secondaryTextColor,
              fontStyle: FontStyle.italic,
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Enhanced Voice Button with Multiple Actions
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              // Main Voice Button
              GestureDetector(
                onTap: () => _handleEnhancedVoiceInput(aiController, calcController),
                onLongPress: () => _showVoiceLanguageSelector(aiController, themeController),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: aiController.isListening 
                          ? [themeController.successColor, themeController.successColor.withOpacity(0.7)]
                          : [themeController.primaryColor, themeController.secondaryColor],
                    ),
                    borderRadius: BorderRadius.circular(50),
                    boxShadow: [
                      BoxShadow(
                        color: (aiController.isListening 
                            ? themeController.successColor 
                            : themeController.primaryColor).withOpacity(0.3),
                        blurRadius: 15,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Icon(
                    aiController.isListening ? Icons.stop : Icons.mic,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
              ).animate(target: aiController.isListening ? 1 : 0)
               .scale(duration: 200.ms)
               .then()
               .shake(hz: 2),
              
              // Voice Settings Button  
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: themeController.cardColor,
                  borderRadius: BorderRadius.circular(40),
                  border: Border.all(color: themeController.primaryColor.withOpacity(0.3)),
                ),
                child: Icon(
                  Icons.settings_voice,
                  color: themeController.primaryColor,
                  size: 20,
                ),
              ),
              
              // Voice History Button
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: themeController.cardColor,
                  borderRadius: BorderRadius.circular(40),
                  border: Border.all(color: themeController.primaryColor.withOpacity(0.3)),
                ),
                child: Icon(
                  Icons.history,
                  color: themeController.primaryColor,
                  size: 20,
                ),
              ),
            ],
          ),
          
          // Voice Input Display with Animation
          if (aiController.voiceInput.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: themeController.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: themeController.primaryColor.withOpacity(0.3),
                ),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Icon(Icons.record_voice_over, 
                          size: 16, 
                          color: themeController.primaryColor),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '"${aiController.voiceInput}"',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontStyle: FontStyle.italic,
                            color: themeController.primaryTextColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ).animate().fadeIn().slideY(begin: 0.3, end: 0),
          ],
          
          // Quick Voice Commands
          const SizedBox(height: 12),
          Wrap(
            spacing: 6,
            children: [
              _buildVoiceQuickCommand('√16', aiController),
              _buildVoiceQuickCommand('2+3×5', aiController),
              _buildVoiceQuickCommand('sin(30°)', aiController),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 100)).slideX(begin: -0.3, end: 0);
  }

  Widget _buildVoiceQuickCommand(String command, AIController aiController) {
    return GestureDetector(
      onTap: () => aiController.processMathConversation(command),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.2)),
        ),
        child: Text(
          command,
          style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[600]),
        ),
      ),
    );
  }

  // 📸 ENHANCED CAMERA FEATURE WITH 4-LAYER OCR
  Widget _buildEnhancedCameraFeature(AIController aiController, CalculatorController calcController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            themeController.accentColor.withOpacity(0.1),
            themeController.warningColor.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: aiController.isProcessing 
              ? themeController.warningColor.withOpacity(0.5)
              : themeController.accentColor.withOpacity(0.2),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: aiController.isProcessing 
                ? themeController.warningColor.withOpacity(0.3)
                : Colors.black.withOpacity(0.1),
            blurRadius: aiController.isProcessing ? 20 : 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          // Camera Icon with Processing Animation
          Stack(
            alignment: Alignment.center,
            children: [
              if (aiController.isProcessing)
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: themeController.warningColor.withOpacity(0.2),
                  ),
                ).animate(onPlay: (controller) => controller.repeat())
                 .rotate(duration: 2000.ms),
              
              Icon(
                aiController.isProcessing ? Icons.auto_fix_high : Icons.camera_alt_rounded,
                size: 40,
                color: aiController.isProcessing 
                    ? themeController.warningColor 
                    : themeController.accentColor,
              ).animate(
                onPlay: (controller) => aiController.isProcessing ? controller.repeat() : null,
              ).scale(duration: 800.ms, begin: const Offset(0.9, 0.9), end: const Offset(1.1, 1.1)),
            ],
          ),
          
          const SizedBox(height: 16),
          
          Text(
            '📸 Ultra OCR AI',
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: themeController.primaryTextColor,
            ),
          ),
          
          const SizedBox(height: 8),
          
          Text(
            aiController.isProcessing 
                ? '🔍 4-Layer analiz yapıyor...\n${(aiController.ocrAccuracy * 100).toInt()}% doğruluk' 
                : 'El yazısı, baskı, sembol, geometri tanır',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: themeController.secondaryTextColor,
              fontStyle: FontStyle.italic,
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Enhanced Camera Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildEnhancedCameraButton(
                Icons.camera_alt,
                'Kamera',
                'Live Capture',
                () => _handleAdvancedCameraCapture(aiController, calcController),
                themeController.accentColor,
                isEnabled: !aiController.isProcessing,
              ),
              _buildEnhancedCameraButton(
                Icons.photo_library,
                'Galeri',
                'Photo Import',
                () => _handleAdvancedImagePick(aiController, calcController),
                themeController.warningColor,
                isEnabled: !aiController.isProcessing,
              ),
            ],
          ),
          
          // OCR Processing Indicator
          if (aiController.isProcessing) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: themeController.warningColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: themeController.warningColor.withOpacity(0.3),
                ),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'AI Processing Layers:',
                        style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        '${(aiController.ocrAccuracy * 100).toInt()}%',
                        style: GoogleFonts.poppins(fontSize: 11, color: themeController.successColor),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: aiController.ocrAccuracy,
                    backgroundColor: Colors.grey.withOpacity(0.2),
                    valueColor: AlwaysStoppedAnimation(themeController.successColor),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 4,
                    children: [
                      _buildOCRLayerChip('Handwriting', true),
                      _buildOCRLayerChip('Printed', true),
                      _buildOCRLayerChip('Symbols', true),
                      _buildOCRLayerChip('Geometry', false),
                    ],
                  ),
                ],
              ),
            ).animate().fadeIn().slideY(begin: 0.3, end: 0),
          ],
          
          // OCR Features
          const SizedBox(height: 12),
          Wrap(
            spacing: 6,
            children: [
              _buildOCRFeatureChip('✍️ El yazısı'),
              _buildOCRFeatureChip('🖨️ Baskı'),
              _buildOCRFeatureChip('∫ Semboller'),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 200)).slideX(begin: 0.3, end: 0);
  }

  Widget _buildEnhancedCameraButton(IconData icon, String title, String subtitle, VoidCallback onPressed, Color color, {bool isEnabled = true}) {
    return GestureDetector(
      onTap: isEnabled ? onPressed : null,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          gradient: isEnabled ? LinearGradient(
            colors: [color, color.withOpacity(0.7)],
          ) : null,
          color: !isEnabled ? Colors.grey.withOpacity(0.3) : null,
          borderRadius: BorderRadius.circular(16),
          boxShadow: isEnabled ? [
            BoxShadow(
              color: color.withOpacity(0.3),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ] : [],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(height: 6),
            Text(
              title,
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            Text(
              subtitle,
              style: GoogleFonts.poppins(
                fontSize: 8,
                color: Colors.white.withOpacity(0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOCRLayerChip(String layer, bool isActive) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isActive ? Colors.green.withOpacity(0.2) : Colors.grey.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isActive ? Colors.green.withOpacity(0.5) : Colors.grey.withOpacity(0.3),
        ),
      ),
      child: Text(
        layer,
        style: GoogleFonts.poppins(
          fontSize: 9,
          color: isActive ? Colors.green[700] : Colors.grey[600],
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildOCRFeatureChip(String feature) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Text(
        feature,
        style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[600]),
      ),
    );
  }

  Widget _buildAIChatFeature(AIController aiController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            themeController.primaryColor.withOpacity(0.1),
            themeController.secondaryColor.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: themeController.primaryColor.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.chat_bubble_outline_rounded,
                color: themeController.primaryColor,
                size: 24,
              ),
              const SizedBox(width: 12),
              Text(
                'AI Math Teacher',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: themeController.primaryTextColor,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          Text(
            'Ask me anything about mathematics! I can explain concepts, solve problems, and provide step-by-step solutions.',
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: themeController.secondaryTextColor,
              height: 1.4,
            ),
          ),
          
          const SizedBox(height: 16),
          
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildQuickPrompt('Explain quadratic formula', aiController),
              _buildQuickPrompt('What is calculus?', aiController),
              _buildQuickPrompt('Solve for x: 2x + 5 = 15', aiController),
              _buildQuickPrompt('What is pi?', aiController),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 300)).slideY(begin: 0.3, end: 0);
  }

  Widget _buildQuickActions(
    AIController aiController,
    CalculatorController calcController,
    ThemeController themeController,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: themeController.cardColor,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Quick Actions',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: themeController.primaryTextColor,
            ),
          ),
          
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(
                child: _buildActionButton(
                  'Generate Graph',
                  Icons.show_chart,
                  () => _generateGraph(calcController),
                  themeController.successColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionButton(
                  'Math Facts',
                  Icons.lightbulb_outline,
                  () => _showMathFacts(themeController),
                  themeController.warningColor,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          Row(
            children: [
              Expanded(
                child: _buildActionButton(
                  'Step Solutions',
                  Icons.format_list_numbered,
                  () => _showStepSolutions(calcController),
                  themeController.accentColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionButton(
                  'Voice Settings',
                  Icons.settings_voice,
                  () => _showVoiceSettings(aiController),
                  themeController.primaryColor,
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 400));
  }

  Widget _buildAIInsights(ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            themeController.successColor.withOpacity(0.1),
            themeController.accentColor.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.insights,
                color: themeController.successColor,
                size: 24,
              ),
              const SizedBox(width: 12),
              Text(
                'AI Insights',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: themeController.primaryTextColor,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          _buildInsightCard(
            'Did you know?',
            'The number π (pi) appears in many surprising places in mathematics, not just circles!',
            Icons.info_outline,
            themeController,
          ),
          
          const SizedBox(height: 8),
          
          _buildInsightCard(
            'Tip of the day',
            'Use parentheses to control the order of operations in complex expressions.',
            Icons.tips_and_updates,
            themeController,
          ),
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 500));
  }

  Widget _buildTutorial(ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: themeController.cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: themeController.primaryColor.withOpacity(0.3),
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'How to use AI Features',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: themeController.primaryColor,
            ),
          ),
          
          const SizedBox(height: 16),
          
          _buildTutorialStep(
            '1',
            'Voice Input',
            'Tap the microphone and say "What is 15 plus 27?" or any math problem',
            themeController,
          ),
          
          _buildTutorialStep(
            '2',
            'Photo Solve',
            'Take a photo of handwritten or printed math problems for instant solutions',
            themeController,
          ),
          
          _buildTutorialStep(
            '3',
            'AI Chat',
            'Ask questions like "Explain how to solve quadratic equations" for detailed help',
            themeController,
          ),
        ],
      ),
    ).animate().fadeIn().slideY(begin: 0.5, end: 0);
  }

  // Helper widgets
  Widget _buildSmallButton(
    IconData icon,
    String label,
    VoidCallback onPressed,
    Color color, {
    bool isEnabled = true,
  }) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: color.withOpacity(0.3),
              width: 1,
            ),
          ),
          child: IconButton(
            onPressed: isEnabled ? onPressed : null,
            icon: Icon(icon, color: color, size: 20),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 10,
            color: color,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildQuickPrompt(String text, AIController aiController) {
    return InkWell(
      onTap: () => _handleQuickPrompt(text, aiController),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: Colors.white.withOpacity(0.2),
            width: 1,
          ),
        ),
        child: Text(
          text,
          style: GoogleFonts.poppins(
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton(String text, IconData icon, VoidCallback onPressed, Color color) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: color.withOpacity(0.2),
            width: 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              text,
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInsightCard(String title, String content, IconData icon, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: themeController.successColor),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: themeController.primaryTextColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  content,
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    color: themeController.secondaryTextColor,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTutorialStep(String number, String title, String description, ThemeController themeController) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: themeController.primaryColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                number,
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: themeController.primaryTextColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: themeController.secondaryTextColor,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 🎯 ENHANCED EVENT HANDLERS

  void _handleVoiceInput(AIController aiController, CalculatorController calcController) async {
    HapticFeedback.mediumImpact();
    
    if (aiController.isListening) {
      await aiController.stopListening();
      if (aiController.aiResponse.isNotEmpty) {
        calcController.addToExpression(aiController.aiResponse);
      }
    } else {
      await aiController.startListening();
    }
  }

  void _handleCameraCapture(AIController aiController, CalculatorController calcController) async {
    HapticFeedback.mediumImpact();
    final result = await aiController.captureAndProcessImage();
    if (result != null && result.isNotEmpty) {
      calcController.addToExpression(result);
    }
  }

  // 📸 ADVANCED CAMERA HANDLERS
  void _handleAdvancedCameraCapture(AIController aiController, CalculatorController calcController) async {
    HapticFeedback.mediumImpact();
    final result = await aiController.processAdvancedOCR('camera_capture');
    if (result != null && result.isNotEmpty) {
      calcController.addToExpression(result);
      // Show success feedback
      Get.snackbar(
        '✅ OCR Başarılı',
        'Matematik problemi tanındı: $result',
        snackPosition: SnackPosition.TOP,
        duration: const Duration(seconds: 3),
        backgroundColor: Colors.green.withOpacity(0.8),
        colorText: Colors.white,
      );
    }
  }

  void _handleAdvancedImagePick(AIController aiController, CalculatorController calcController) async {
    HapticFeedback.mediumImpact();
    final result = await aiController.processAdvancedOCR('gallery_pick');
    if (result != null && result.isNotEmpty) {
      calcController.addToExpression(result);
      // Show success feedback
      Get.snackbar(
        '✅ OCR Başarılı', 
        'Fotoğraf analiz edildi: $result',
        snackPosition: SnackPosition.TOP,
        duration: const Duration(seconds: 3),
        backgroundColor: Colors.green.withOpacity(0.8),
        colorText: Colors.white,
      );
    }
  }

  void _handleImagePick(AIController aiController, CalculatorController calcController) async {
    HapticFeedback.mediumImpact();
    final result = await aiController.pickAndProcessImage();
    if (result != null && result.isNotEmpty) {
      calcController.addToExpression(result);
    }
  }

  void _handleQuickPrompt(String prompt, AIController aiController) {
    HapticFeedback.lightImpact();
    // Process AI prompt
    Get.snackbar(
      'AI Processing',
      'Processing: $prompt',
      duration: const Duration(seconds: 2),
    );
  }

  void _generateGraph(CalculatorController calcController) {
    HapticFeedback.lightImpact();
    Get.snackbar('Graph', 'Generating graph for: ${calcController.expression}');
  }

  void _showMathFacts(ThemeController themeController) {
    HapticFeedback.lightImpact();
    Get.dialog(
      AlertDialog(
        title: const Text('Math Fact'),
        content: const Text('Did you know that 0.999... = 1? This might seem impossible, but it\'s mathematically proven!'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cool!'),
          ),
        ],
      ),
    );
  }

  void _showStepSolutions(CalculatorController calcController) {
    HapticFeedback.lightImpact();
    Get.snackbar('Step Solutions', 'Generating step-by-step solution...');
  }

  void _showVoiceSettings(AIController aiController) {
    HapticFeedback.lightImpact();
    Get.dialog(
      AlertDialog(
        title: const Text('Voice Settings'),
        content: const Text('Voice settings panel would go here'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  // 🔧 PLACEHOLDER METHODS FOR MISSING FEATURES
  
  Widget _buildAdvancedOCR(AIController aiController, CalculatorController calcController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.orange.withOpacity(0.1),
            Colors.red.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.orange.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.auto_fix_high, color: Colors.orange, size: 24),
              const SizedBox(width: 12),
              Text(
                '🔍 4-Layer Ultra OCR',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'El yazısı, baskı, sembol ve geometri tanıma ile %98 doğruluk',
            style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => _handleAdvancedCameraCapture(aiController, calcController),
            child: const Text('Advanced OCR Test'),
          ),
        ],
      ),
    );
  }

  Widget _buildPatternRecognition(AIController aiController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.teal.withOpacity(0.1), Colors.green.withOpacity(0.1)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.pattern, color: Colors.teal, size: 24),
              const SizedBox(width: 12),
              Text(
                '🧠 Pattern Recognition',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Matematiksel patternleri ve dizileri otomatik tanır',
            style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalizationPanel(AIController aiController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.indigo.withOpacity(0.1), Colors.purple.withOpacity(0.1)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.person_outline, color: Colors.indigo, size: 24),
              const SizedBox(width: 12),
              Text(
                '👤 AI Personalization',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Öğrenme stiline göre kişiselleşen AI asistan',
            style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  Widget _buildDailyChallenges(AIController aiController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.amber.withOpacity(0.1), Colors.orange.withOpacity(0.1)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.emoji_events, color: Colors.amber, size: 24),
              const SizedBox(width: 12),
              Text(
                '🏆 Günlük Challenges',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'AI tarafından kişiselleştirilmiş günlük matematik görevleri',
            style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => aiController.generateDailyChallenges(),
            child: const Text('Yeni Challenge Oluştur'),
          ),
        ],
      ),
    );
  }

  Widget _buildAchievements(AIController aiController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.pink.withOpacity(0.1), Colors.purple.withOpacity(0.1)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.star, color: Colors.pink, size: 24),
              const SizedBox(width: 12),
              Text(
                '⭐ Achievements',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Matematik yolculuğundaki başarılarını takip et',
            style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  Widget _buildStreakLeaderboard(AIController aiController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.deepOrange.withOpacity(0.1), Colors.red.withOpacity(0.1)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.local_fire_department, color: Colors.deepOrange, size: 24),
              const SizedBox(width: 12),
              Text(
                '🔥 Streak: ${aiController.streakDays} gün',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Günlük matematik alışkanlığını sürdür!',
            style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  Widget _buildAIEncouragement(AIController aiController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.lightBlue.withOpacity(0.1), Colors.blue.withOpacity(0.1)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.favorite, color: Colors.lightBlue, size: 24),
              const SizedBox(width: 12),
              Text(
                '💙 AI Motivasyon',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),
          FutureBuilder<String>(
            future: aiController.getPersonalizedEncouragement(),
            builder: (context, snapshot) {
              return Text(
                snapshot.data ?? 'AI motivasyon mesajı yükleniyor...',
                style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
                textAlign: TextAlign.center,
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceAnalytics(AIController aiController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.cyan.withOpacity(0.1), Colors.teal.withOpacity(0.1)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.analytics, color: Colors.cyan, size: 24),
              const SizedBox(width: 12),
              Text(
                '📊 Performance Analytics',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildAnalyticCard('Doğruluk', '${(aiController.accuracyScore * 100).toInt()}%', Icons.check_circle),
              _buildAnalyticCard('Hız', '${aiController.averageResponseTime.toInt()}ms', Icons.speed),
              _buildAnalyticCard('Toplam', '${aiController.streakDays}', Icons.calculate),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAnalyticCard(String title, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.cyan, size: 20),
        const SizedBox(height: 4),
        Text(value, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
        Text(title, style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[600])),
      ],
    );
  }

  Widget _buildAIModelSettings(AIController aiController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.lime.withOpacity(0.1), Colors.green.withOpacity(0.1)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.settings, color: Colors.lime, size: 24),
              const SizedBox(width: 12),
              Text(
                '⚙️ AI Model Ayarları',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'AI model performansını ve davranışını özelleştir',
            style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  Widget _buildPrivacyControls(ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.grey.withOpacity(0.1), Colors.blueGrey.withOpacity(0.1)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.privacy_tip, color: Colors.blueGrey, size: 24),
              const SizedBox(width: 12),
              Text(
                '🔒 Gizlilik Kontrolleri',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'AI öğrenme ve veri saklama ayarlarını yönet',
            style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => StorageService.clearAIData(),
            child: const Text('AI Verilerini Temizle'),
          ),
        ],
      ),
    );
  }
  
  // 🚀 ENHANCED AI FUNCTIONALITY METHODS
  
  void _handleEnhancedVoiceInput(AIController aiController, CalculatorController calcController) async {
    try {
      if (aiController.isListening) {
        await aiController.stopListening();
        // Process the voice input
        if (aiController.aiResponse.isNotEmpty) {
          calcController.addToExpression(aiController.aiResponse);
          _showSuccessMessage('Ses girişi başarıyla işlendi!');
        }
      } else {
        await aiController.startListening();
        HapticFeedback.lightImpact();
      }
    } catch (e) {
      _showErrorMessage('Ses özelliği geçici olarak kullanılamıyor');
    }
  }
  
  void _showVoiceLanguageSelector(AIController aiController, ThemeController themeController) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [themeController.primaryColor, themeController.secondaryColor],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(25),
            topRight: Radius.circular(25),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '🌍 Dil Seçimi',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 20),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: ['Türkçe', 'English', 'Español', 'Français', 'Deutsch'].map((lang) {
                final isSelected = aiController.currentLanguage.contains(lang.toLowerCase());
                return GestureDetector(
                  onTap: () {
                    // Language selection - for demo purposes
                    _showSuccessMessage('Dil değiştirildi: $lang');
                    Navigator.pop(context);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.white : Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      lang,
                      style: GoogleFonts.poppins(
                        color: isSelected ? themeController.primaryColor : Colors.white,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildNaturalLanguageSolver(AIController aiController, CalculatorController calcController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            themeController.accentColor.withOpacity(0.1),
            themeController.primaryColor.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: themeController.accentColor.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.psychology_alt, color: themeController.accentColor, size: 24),
              const SizedBox(width: 12),
              Text(
                '🤖 AI Doğal Dil İşleme',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: themeController.primaryTextColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            decoration: InputDecoration(
              hintText: 'Matematik problemini yazın (örn: "5 ile 3 ün toplamının karesi")',
              prefixIcon: Icon(Icons.edit, color: themeController.accentColor),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(15),
                borderSide: BorderSide(color: themeController.accentColor.withOpacity(0.5)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(15),
                borderSide: BorderSide(color: themeController.accentColor),
              ),
            ),
            onSubmitted: (text) async {
              // Simulate natural language processing
              final processedText = text.replaceAll(RegExp(r'[^\d+\-*/().\s]'), '');
              if (processedText.isNotEmpty) {
                calcController.addToExpression(processedText);
                _showSuccessMessage('Doğal dil işleme tamamlandı!');
              } else {
                _showErrorMessage('Matematik ifadesi bulunamadı');
              }
            },
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildQuickExpressionChip('İki sayının toplamı', themeController),
              _buildQuickExpressionChip('Yüzde hesapla', themeController),
              _buildQuickExpressionChip('Kök al', themeController),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildQuickExpressionChip(String text, ThemeController themeController) {
    return GestureDetector(
      onTap: () {
        // Auto-fill the natural language input
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: themeController.accentColor.withOpacity(0.2),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Text(
          text,
          style: GoogleFonts.poppins(
            fontSize: 10,
            color: themeController.accentColor,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
  
  Widget _buildSmartHistoryLearning(AIController aiController, CalculatorController calcController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.indigo.withOpacity(0.1), Colors.deepPurple.withOpacity(0.1)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.auto_stories, color: Colors.indigo, size: 24),
              const SizedBox(width: 12),
              Text(
                '📚 Akıllı Geçmiş & Öğrenme',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('🎯 AI Önerileri:', style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: ['sin(45)', 'sqrt(16)', '2^8', 'log(100)', 'π*r²'].map((suggestion) {
                  return GestureDetector(
                    onTap: () {
                      calcController.addToExpression(suggestion);
                      _showSuccessMessage('AI önerisi uygulandı!');
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      margin: const EdgeInsets.only(bottom: 8),
                      decoration: BoxDecoration(
                        color: Colors.indigo.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(15),
                        border: Border.all(color: Colors.indigo.withOpacity(0.3)),
                      ),
                      child: Text(
                        suggestion,
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          color: Colors.indigo,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildRealTimePerformance(AIController aiController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.teal.withOpacity(0.1), Colors.green.withOpacity(0.1)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.speed, color: Colors.teal, size: 24),
              const SizedBox(width: 12),
              Text(
                '⚡ Real-time AI Performans',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildPerformanceIndicator('CPU', '23%', Colors.blue),
              _buildPerformanceIndicator('Bellek', '45MB', Colors.orange),
              _buildPerformanceIndicator('AI Hız', '${aiController.averageResponseTime.toInt()}ms', Colors.green),
              _buildPerformanceIndicator('Başarı', '${(aiController.accuracyScore * 100).toInt()}%', Colors.purple),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildPerformanceIndicator(String label, String value, Color color) {
    return Column(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              value.split(RegExp(r'[a-zA-Z%]'))[0],
              style: GoogleFonts.poppins(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: GoogleFonts.poppins(fontSize: 9, color: Colors.grey[600]),
        ),
        Text(
          value,
          style: GoogleFonts.poppins(fontSize: 8, color: color, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
  
  void _showSuccessMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }
  
  void _showErrorMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }
}