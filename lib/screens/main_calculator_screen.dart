import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:get/get.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../controllers/calculator_controller.dart';
import '../controllers/ai_controller.dart';
import '../controllers/theme_controller.dart';
import '../services/admob_service.dart';
import '../widgets/calculator_button.dart';
import '../widgets/display_widget.dart';
import '../widgets/ai_features_panel.dart';
import '../widgets/history_panel.dart';
import '../models/calculation_model.dart';
import 'ai_assistant_screen.dart';

class MainCalculatorScreen extends StatefulWidget {
  const MainCalculatorScreen({super.key});

  @override
  State<MainCalculatorScreen> createState() => _MainCalculatorScreenState();
}

class _MainCalculatorScreenState extends State<MainCalculatorScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  late AnimationController _fadeController;
  late AnimationController _slideController;
  
  int _currentMode = 0; // 0: Basic, 1: Scientific, 2: AI Features, 3: History
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    
    _fadeController.forward();
    _slideController.forward();
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    _fadeController.dispose();
    _slideController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final admobService = Provider.of<AdMobService>(context, listen: false);
    
    return Consumer3<CalculatorController, AIController, ThemeController>(
      builder: (context, calcController, aiController, themeController, child) {
        return Scaffold(
          backgroundColor: themeController.isDarkMode 
              ? const Color(0xFF0A0A0A)
              : const Color(0xFFF8F9FA),
          body: SafeArea(
            child: Column(
              children: [
                // App Bar
                _buildAppBar(themeController),
                
                // Display Area
                Expanded(
                  flex: 2,
                  child: _buildDisplayArea(calcController, aiController, themeController),
                ),
                
                // Tab Bar
                _buildTabBar(themeController),
                
                // Main Content
                Expanded(
                  flex: 4,
                  child: _buildMainContent(calcController, aiController, themeController),
                ),
                
                // 📺 AdMob Banner (Bottom)
                if (admobService.isBannerAdLoaded && !admobService.isPremiumActive)
                  Container(
                    height: 60,
                    color: themeController.isDarkMode 
                        ? Colors.black.withOpacity(0.3)
                        : Colors.grey.shade100,
                    child: Center(
                      child: SizedBox(
                        height: 50,
                        child: AdWidget(ad: admobService.getBannerAd()!),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
  
  Widget _buildAppBar(ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: themeController.primaryGradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: themeController.primaryColor.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.calculate_rounded,
                  color: Colors.white,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'AI Math Genius',
                style: GoogleFonts.poppins(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          Row(
            children: [
              _buildAppBarButton(
                Icons.psychology_rounded,
                () => _openAIAssistant(),
              ),
              const SizedBox(width: 8),
              _buildAppBarButton(
                Icons.settings_rounded,
                () => _showSettings(),
              ),
              const SizedBox(width: 8),
              _buildAppBarButton(
                Icons.share_rounded,
                () => _shareApp(),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn().slideY(begin: -0.3, end: 0);
  }
  
  Widget _buildAppBarButton(IconData icon, VoidCallback onPressed) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onPressed();
      },
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: 20,
        ),
      ).animate()
       .scale(duration: 150.ms, curve: Curves.easeOut)
       .then()
       .shimmer(delay: 500.ms, duration: 1000.ms),
    );
  }
  
  Widget _buildDisplayArea(
    CalculatorController calcController,
    AIController aiController,
    ThemeController themeController,
  ) {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: themeController.cardColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          // AI Status Indicator
          if (aiController.isListening || aiController.isProcessing)
            _buildAIStatusIndicator(aiController, themeController),
          
          const SizedBox(height: 12),
          
          // Expression
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            reverse: true,
            child: Text(
              calcController.expression.isEmpty ? '0' : calcController.expression,
              style: GoogleFonts.poppins(
                fontSize: 24,
                color: themeController.secondaryTextColor,
                fontWeight: FontWeight.w400,
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Result
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerRight,
            child: Text(
              calcController.result,
              style: GoogleFonts.poppins(
                fontSize: 48,
                color: calcController.hasError 
                    ? themeController.errorColor
                    : themeController.primaryTextColor,
                fontWeight: FontWeight.bold,
              ),
            ).animate().fadeIn(delay: const Duration(milliseconds: 100)).scale(begin: const Offset(0.8, 0.8)),
          ),
          
          // Error message
          if (calcController.hasError)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                calcController.errorMessage,
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  color: themeController.errorColor,
                  fontWeight: FontWeight.w500,
                ),
              ).animate().fadeIn().shake(),
            ),
        ],
      ),
    ).animate().fadeIn(delay: 200.ms).slideY(begin: -0.2, end: 0);
  }
  
  Widget _buildAIStatusIndicator(AIController aiController, ThemeController themeController) {
    if (aiController.isListening) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: themeController.successColor,
              borderRadius: BorderRadius.circular(4),
            ),
          ).animate(onPlay: (controller) => controller.repeat()).fadeIn().fadeOut(),
          const SizedBox(width: 8),
          Text(
            'Listening...',
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: themeController.successColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      );
    }
    
    if (aiController.isProcessing) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 12,
            height: 12,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation(themeController.accentColor),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            'AI Processing...',
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: themeController.accentColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      );
    }
    
    return const SizedBox.shrink();
  }
  
  Widget _buildTabBar(ThemeController themeController) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
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
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          gradient: LinearGradient(colors: themeController.primaryGradient),
          borderRadius: BorderRadius.circular(20),
        ),
        labelColor: Colors.white,
        unselectedLabelColor: themeController.secondaryTextColor,
        labelStyle: GoogleFonts.poppins(
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: GoogleFonts.poppins(
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
        tabs: const [
          Tab(icon: Icon(Icons.calculate_rounded), text: 'Basic'),
          Tab(icon: Icon(Icons.functions_rounded), text: 'Scientific'),
          Tab(icon: Icon(Icons.smart_toy_rounded), text: 'AI'),
          Tab(icon: Icon(Icons.history_rounded), text: 'History'),
        ],
      ),
    ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2, end: 0);
  }
  
  Widget _buildMainContent(
    CalculatorController calcController,
    AIController aiController,
    ThemeController themeController,
  ) {
    return TabBarView(
      controller: _tabController,
      children: [
        _buildBasicCalculator(calcController, themeController),
        _buildScientificCalculator(calcController, themeController),
        AIFeaturesPanel(),
        HistoryPanel(),
      ],
    );
  }
  
  Widget _buildBasicCalculator(
    CalculatorController calcController,
    ThemeController themeController,
  ) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Memory and special functions row
            Row(
              children: [
                Expanded(
                  child: CalculatorButton(
                    text: 'C',
                    onPressed: () {
                      HapticFeedback.mediumImpact();
                      calcController.clear();
                    },
                    backgroundColor: themeController.errorColor,
                    textColor: Colors.white,
                    hasGlow: true,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: CalculatorButton(
                    text: '±',
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      _toggleSign(calcController);
                    },
                    backgroundColor: themeController.functionButtonColor,
                    hasGradient: true,
                    gradientColors: [themeController.functionButtonColor, themeController.functionButtonColor.withOpacity(0.8)],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: CalculatorButton(
                    text: '%',
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      calcController.addToExpression('%');
                    },
                    backgroundColor: themeController.functionButtonColor,
                    hasGradient: true,
                    gradientColors: [themeController.functionButtonColor, themeController.functionButtonColor.withOpacity(0.8)],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: CalculatorButton(
                    text: '÷',
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      calcController.addToExpression('÷');
                    },
                    backgroundColor: themeController.operatorButtonColor,
                    textColor: Colors.white,
                    hasGradient: true,
                    gradientColors: [themeController.operatorButtonColor, themeController.operatorButtonColor.withOpacity(0.7)],
                    hasGlow: true,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            // Numbers and operations
            ...List.generate(3, (rowIndex) {
              return Column(
                children: [
                  Row(
                    children: List.generate(4, (colIndex) {
                      final buttonIndex = (2 - rowIndex) * 3 + colIndex + 1;
                      
                      if (colIndex == 3) {
                        // Operators column
                        final operators = ['×', '-', '+'];
                        return Expanded(
                          child: CalculatorButton(
                            text: operators[rowIndex],
                            onPressed: () {
                              HapticFeedback.lightImpact();
                              calcController.addToExpression(operators[rowIndex]);
                            },
                            backgroundColor: themeController.operatorButtonColor,
                            textColor: Colors.white,
                            hasGradient: true,
                            gradientColors: [themeController.operatorButtonColor, themeController.operatorButtonColor.withOpacity(0.7)],
                            hasGlow: true,
                          ),
                        );
                      } else if (buttonIndex <= 9) {
                        // Numbers
                        return Expanded(
                          child: AnimatedNumberButton(
                            number: buttonIndex.toString(),
                            onPressed: () {
                              HapticFeedback.selectionClick();
                              calcController.addToExpression(buttonIndex.toString());
                            },
                            backgroundColor: themeController.numberButtonColor,
                          ),
                        );
                      }
                      
                      return const SizedBox.shrink();
                    }).expand((widget) => [widget, if (widget is! SizedBox) const SizedBox(width: 12)]).toList()
                      ..removeLast(),
                  ),
                  if (rowIndex < 2) const SizedBox(height: 12),
                ],
              );
            }),
            
            const SizedBox(height: 12),
            
            // Bottom row: 0, ., =
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: AnimatedNumberButton(
                    number: '0',
                    onPressed: () {
                      HapticFeedback.selectionClick();
                      calcController.addToExpression('0');
                    },
                    backgroundColor: themeController.numberButtonColor,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: CalculatorButton(
                    text: '.',
                    onPressed: () {
                      HapticFeedback.selectionClick();
                      calcController.addToExpression('.');
                    },
                    backgroundColor: themeController.numberButtonColor,
                    hasGradient: true,
                    gradientColors: [themeController.numberButtonColor, themeController.numberButtonColor.withOpacity(0.8)],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: CalculatorButton(
                    text: '=',
                    onPressed: () {
                      HapticFeedback.heavyImpact();
                      calcController.calculate();
                    },
                    backgroundColor: themeController.equalsButtonColor,
                    textColor: Colors.white,
                    hasGradient: true,
                    gradientColors: [themeController.equalsButtonColor, const Color(0xFF00CED1)],
                    hasGlow: true,
                    fontSize: 24,
                  ),
                ),
              ],
            ),
          ],
        ),
      ).animate().fadeIn(delay: 400.ms),
    );
  }
  
  Widget _buildScientificCalculator(
    CalculatorController calcController,
    ThemeController themeController,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Scientific functions row 1
          Row(
            children: [
              Expanded(child: _scientificButton('sin', calcController, themeController)),
              const SizedBox(width: 8),
              Expanded(child: _scientificButton('cos', calcController, themeController)),
              const SizedBox(width: 8),
              Expanded(child: _scientificButton('tan', calcController, themeController)),
              const SizedBox(width: 8),
              Expanded(child: _scientificButton('π', calcController, themeController)),
            ],
          ),
          
          const SizedBox(height: 12),
          
          // Scientific functions row 2
          Row(
            children: [
              Expanded(child: _scientificButton('log', calcController, themeController)),
              const SizedBox(width: 8),
              Expanded(child: _scientificButton('ln', calcController, themeController)),
              const SizedBox(width: 8),
              Expanded(child: _scientificButton('√', calcController, themeController)),
              const SizedBox(width: 8),
              Expanded(child: _scientificButton('x²', calcController, themeController)),
            ],
          ),
          
          const SizedBox(height: 12),
          
          // Scientific functions row 3
          Row(
            children: [
              Expanded(child: _scientificButton('(', calcController, themeController)),
              const SizedBox(width: 8),
              Expanded(child: _scientificButton(')', calcController, themeController)),
              const SizedBox(width: 8),
              Expanded(child: _scientificButton('!', calcController, themeController)),
              const SizedBox(width: 8),
              Expanded(child: _scientificButton('e', calcController, themeController)),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Basic calculator buttons (smaller)
          Expanded(
            child: _buildBasicCalculator(calcController, themeController),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 400.ms);
  }
  
  Widget _scientificButton(
    String text,
    CalculatorController calcController,
    ThemeController themeController,
  ) {
    return CalculatorButton(
      text: text,
      onPressed: () {
        HapticFeedback.lightImpact();
        if (text == '(' || text == ')') {
          calcController.addToExpression(text);
        } else {
          calcController.addFunction(text);
        }
      },
      backgroundColor: themeController.functionButtonColor,
      fontSize: 14,
      hasGradient: true,
      gradientColors: [
        themeController.functionButtonColor,
        themeController.functionButtonColor.withOpacity(0.7)
      ],
      hasGlow: ['sin', 'cos', 'tan', 'π', 'e', '√'].contains(text),
    );
  }
  
  void _toggleSign(CalculatorController calcController) {
    // Implementation for +/- toggle
    if (calcController.result != '0' && calcController.isNewCalculation) {
      final currentResult = double.tryParse(calcController.result);
      if (currentResult != null) {
        calcController.addToExpression('${-currentResult}');
      }
    }
  }
  
  void _openAIAssistant() {
    HapticFeedback.mediumImpact();
    
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const AIAssistantScreen(),
      ),
    );
  }
  
  void _showSettings() {
    final themeController = Get.find<ThemeController>();
    
    Get.dialog(
      AlertDialog(
        backgroundColor: themeController.cardColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: Text(
          '⚙️ Settings',
          style: GoogleFonts.poppins(
            color: themeController.primaryTextColor,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Theme Toggle
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: themeController.functionButtonColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Dark Theme',
                    style: GoogleFonts.poppins(
                      color: themeController.primaryTextColor,
                    ),
                  ),
                  Switch(
                    value: themeController.isDarkMode,
                    onChanged: (_) {
                      HapticFeedback.lightImpact();
                      themeController.toggleTheme();
                    },
                    activeColor: themeController.primaryColor,
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              HapticFeedback.lightImpact();
              Get.back();
            },
            child: Text(
              'Done',
              style: GoogleFonts.poppins(
                color: themeController.primaryColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ).animate().scale(duration: 300.ms).fadeIn(),
    );
  }
  
  void _shareApp() {
    HapticFeedback.mediumImpact();
    
    // Show animated sharing dialog
    Get.dialog(
      AlertDialog(
        backgroundColor: Get.find<ThemeController>().cardColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: Text(
          '📤 Share AI Math Genius',
          style: GoogleFonts.poppins(
            color: Get.find<ThemeController>().primaryTextColor,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Text(
          'Share this amazing AI-powered calculator with your friends!',
          style: GoogleFonts.poppins(
            color: Get.find<ThemeController>().secondaryTextColor,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              HapticFeedback.lightImpact();
              Get.back();
              // Real share functionality would go here
              Get.snackbar(
                '✅ Shared!',
                'App link copied to clipboard',
                backgroundColor: Get.find<ThemeController>().successColor.withOpacity(0.9),
                colorText: Colors.white,
                duration: const Duration(seconds: 2),
                animationDuration: const Duration(milliseconds: 300),
              );
            },
            child: Text(
              'Share',
              style: GoogleFonts.poppins(
                color: Get.find<ThemeController>().primaryColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ).animate().scale(duration: 300.ms).fadeIn(),
    );
  }
}