import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../controllers/calculator_controller.dart';
import '../controllers/theme_controller.dart';
import '../controllers/premium_controller.dart';
import '../widgets/modern_calculator_button.dart';
import '../widgets/premium_logo.dart';
import '../core/theme/app_colors.dart';
import 'ai_assistant_screen.dart';
import 'special_calculators/special_calculators_hub.dart';
import 'premium/premium_paywall_screen.dart';

// Helper function for haptic feedback (skip on web)
void _hapticFeedback(HapticFeedbackType type) {
  if (!kIsWeb) {
    switch (type) {
      case HapticFeedbackType.light:
        HapticFeedback.lightImpact();
        break;
      case HapticFeedbackType.medium:
        HapticFeedback.mediumImpact();
        break;
      case HapticFeedbackType.heavy:
        HapticFeedback.heavyImpact();
        break;
      case HapticFeedbackType.selection:
        HapticFeedback.selectionClick();
        break;
    }
  }
}

enum HapticFeedbackType { light, medium, heavy, selection }

/// 🎨 Modern Calculator Screen - Premium Design with Animations
class ModernCalculatorScreen extends StatefulWidget {
  const ModernCalculatorScreen({super.key});

  @override
  State<ModernCalculatorScreen> createState() => _ModernCalculatorScreenState();
}

class _ModernCalculatorScreenState extends State<ModernCalculatorScreen>
    with TickerProviderStateMixin {
  late AnimationController _displayController;
  late AnimationController _buttonController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  bool _isScientificMode = false;
  bool _isFABOpen = false;

  @override
  void initState() {
    super.initState();
    
    _displayController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    
    _buttonController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _displayController, curve: Curves.easeOut),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _buttonController, curve: Curves.easeOutCubic),
    );

    _displayController.forward();
    Future.delayed(const Duration(milliseconds: 200), () {
      _buttonController.forward();
    });
  }

  @override
  void dispose() {
    _displayController.dispose();
    _buttonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer3<CalculatorController, ThemeController, PremiumController>(
      builder: (context, calcController, themeController, premiumController, child) {
        return Scaffold(
          body: Stack(
            children: [
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      const Color(0xFF0A0A0A),
                      const Color(0xFF1A1A2E),
                      AppColors.oceanBlue.withOpacity(0.15),
                    ],
                  ),
                ),
                child: SafeArea(
                  child: Column(
                    children: [
                      _buildModernAppBar(context, premiumController),
                      _buildModernDisplay(calcController),
                      const SizedBox(height: 20),
                      _buildScientificToggle(),
                      const SizedBox(height: 10),
                      _buildQuickAccessBar(context, premiumController),
                      const SizedBox(height: 10),
                      Expanded(
                        child: _buildButtonsLayout(calcController),
                      ),
                    ],
                  ),
                ),
              ),
              // FAB Speed Dial for AI Features
              _buildAISpeedDial(context),
            ],
          ),
        );
      },
    );
  }

  /// 🎨 Modern App Bar
  Widget _buildModernAppBar(BuildContext context, PremiumController premiumController) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Logo & Title
          Row(
            children: [
              // Premium Logo Widget
              PremiumLogo(
                size: 50,
                animate: false,
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ShaderMask(
                    shaderCallback: (bounds) => LinearGradient(
                      colors: [AppColors.oceanBlue, AppColors.electricViolet],
                    ).createShader(bounds),
                    child: Text(
                      'Premium',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  Text(
                    'Hesap Makinesi',
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                      color: Colors.white70,
                      letterSpacing: 0.3,
                    ),
                  ),
                  if (premiumController.isPremiumActive)
                    Container(
                      margin: const EdgeInsets.only(top: 2),
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppColors.goldenYellow, AppColors.sunsetOrange],
                        ),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '⭐ PREMIUM',
                        style: GoogleFonts.poppins(
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    )
                        .animate(onPlay: (controller) => controller.repeat())
                        .shimmer(duration: 1500.ms),
                ],
              ),
            ],
          ),

          // Special Calculators Button
          _buildActionButton(
            Icons.apps_rounded,
            AppColors.royalPurple,
            () {
              _hapticFeedback(HapticFeedbackType.medium);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SpecialCalculatorsHub(),
                ),
              );
            },
          ),
        ],
      ),
    ).animate().fadeIn(duration: 600.ms).slideY(begin: -0.2, end: 0);
  }

  Widget _buildActionButton(IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [color, color.withOpacity(0.7)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.4),
              blurRadius: 10,
              spreadRadius: 1,
            ),
          ],
        ),
        child: Icon(icon, color: Colors.white, size: 22),
      ),
    ).animate(onPlay: (controller) => controller.repeat(reverse: true))
     .scale(begin: const Offset(1, 1), end: const Offset(1.05, 1.05), duration: 1500.ms);
  }

  /// 🤖 AI Speed Dial FAB
  Widget _buildAISpeedDial(BuildContext context) {
    return Positioned(
      right: 20,
      bottom: 20,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // AI Feature Buttons (show when open)
          if (_isFABOpen) ...[
            _buildFABOption(
              context,
              icon: Icons.mic_rounded,
              label: 'Sesli Asistan',
              color: AppColors.oceanBlue,
              onTap: () => _openAIFeature(context, 0),
            ),
            const SizedBox(height: 12),
            _buildFABOption(
              context,
              icon: Icons.camera_alt_rounded,
              label: 'Fotoğraf Çöz',
              color: AppColors.royalPurple,
              onTap: () => _openAIFeature(context, 1),
            ),
            const SizedBox(height: 12),
            _buildFABOption(
              context,
              icon: Icons.draw_rounded,
              label: 'El Yazısı',
              color: AppColors.electricViolet,
              onTap: () => _openAIFeature(context, 2),
            ),
            const SizedBox(height: 12),
            _buildFABOption(
              context,
              icon: Icons.chat_bubble_rounded,
              label: 'AI Sohbet',
              color: AppColors.neonPink,
              onTap: () => _openAIFeature(context, 3),
            ),
            const SizedBox(height: 12),
            _buildFABOption(
              context,
              icon: Icons.list_alt_rounded,
              label: 'Adım Adım',
              color: AppColors.sunsetOrange,
              onTap: () => _openAIFeature(context, 4),
            ),
            const SizedBox(height: 16),
          ],

          // Main FAB Button
          GestureDetector(
            onTap: () {
              _hapticFeedback(HapticFeedbackType.medium);
              setState(() {
                _isFABOpen = !_isFABOpen;
              });
            },
            child: Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: _isFABOpen 
                    ? [Colors.red, Colors.redAccent]
                    : [AppColors.electricViolet, AppColors.royalPurple],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: (_isFABOpen ? Colors.red : AppColors.electricViolet).withOpacity(0.5),
                    blurRadius: 20,
                    spreadRadius: 3,
                  ),
                ],
              ),
              child: AnimatedRotation(
                turns: _isFABOpen ? 0.125 : 0,
                duration: const Duration(milliseconds: 300),
                child: Icon(
                  _isFABOpen ? Icons.close_rounded : Icons.psychology_rounded,
                  color: Colors.white,
                  size: 28,
                ),
              ),
            ),
          )
              .animate(onPlay: (controller) => controller.repeat(reverse: true))
              .scale(begin: const Offset(1, 1), end: const Offset(1.05, 1.05), duration: 1500.ms),
        ],
      ),
    );
  }

  Widget _buildFABOption(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: () {
        _hapticFeedback(HapticFeedbackType.light);
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [color, color.withOpacity(0.8)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.4),
              blurRadius: 15,
              spreadRadius: 2,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: Colors.white, size: 22),
            const SizedBox(width: 10),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ],
        ),
      )
          .animate()
          .fadeIn(duration: 200.ms)
          .slideX(begin: 1, end: 0, duration: 300.ms, curve: Curves.easeOutBack),
    );
  }

  void _openAIFeature(BuildContext context, int featureIndex) {
    setState(() {
      _isFABOpen = false;
    });
    
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const AIAssistantScreen(),
      ),
    );
  }

  /// 📺 Modern Display Area
  Widget _buildModernDisplay(CalculatorController calcController) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20),
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white.withOpacity(0.08),
              Colors.white.withOpacity(0.03),
            ],
          ),
          borderRadius: BorderRadius.circular(28),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.oceanBlue.withOpacity(0.2),
              blurRadius: 30,
              spreadRadius: 5,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Expression
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              reverse: true,
              child: Text(
                calcController.expression.isEmpty ? '0' : calcController.expression,
                style: GoogleFonts.orbitron(
                  fontSize: 26,
                  color: Colors.white70,
                  fontWeight: FontWeight.w400,
                  letterSpacing: 1,
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Result with shimmer effect
            calcController.result.isNotEmpty
                ? Shimmer.fromColors(
                    baseColor: Colors.white,
                    highlightColor: AppColors.oceanBlue,
                    period: const Duration(milliseconds: 1500),
                    child: Text(
                      calcController.result,
                      style: GoogleFonts.orbitron(
                        fontSize: 52,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2,
                      ),
                    ),
                  ).animate()
                   .scale(duration: 300.ms, curve: Curves.easeOut)
                : Text(
                    '0',
                    style: GoogleFonts.orbitron(
                      fontSize: 52,
                      color: Colors.white54,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  /// 🔄 Scientific Mode Toggle
  Widget _buildScientificToggle() {
    return GestureDetector(
      onTap: () {
        setState(() => _isScientificMode = !_isScientificMode);
        HapticFeedback.mediumImpact();
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          gradient: _isScientificMode
              ? LinearGradient(
                  colors: [AppColors.royalPurple, AppColors.electricViolet],
                )
              : null,
          color: _isScientificMode ? null : Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: Colors.white.withOpacity(0.2),
            width: 2,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _isScientificMode ? Icons.functions : Icons.dialpad,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(
              _isScientificMode ? '🔬 Bilimsel Mod' : '🔢 Temel Mod',
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn().scale();
  }

  /// 🎯 Quick Access Bar
  Widget _buildQuickAccessBar(BuildContext context, PremiumController premiumController) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      height: 50,
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () {
                if (premiumController.isPremiumActive) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const SpecialCalculatorsHub(),
                    ),
                  );
                } else {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const PremiumPaywallScreen(),
                    ),
                  );
                }
              },
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.goldenYellow, AppColors.sunsetOrange],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.goldenYellow.withOpacity(0.4),
                      blurRadius: 10,
                      spreadRadius: 1,
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('🎯', style: TextStyle(fontSize: 20)),
                    const SizedBox(width: 8),
                    Text(
                      '40+ Özel Hesaplayıcı',
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    if (!premiumController.isPremiumActive) ...[
                      const SizedBox(width: 6),
                      const Icon(Icons.lock, color: Colors.white, size: 16),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn().slideX(begin: -0.2, end: 0);
  }

  /// ⌨️ Buttons Layout
  Widget _buildButtonsLayout(CalculatorController calcController) {
    return SlideTransition(
      position: _slideAnimation,
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: _isScientificMode
            ? _buildScientificButtons(calcController)
            : _buildBasicButtons(calcController),
      ),
    );
  }

  /// 🔢 Basic Calculator Buttons
  Widget _buildBasicButtons(CalculatorController calcController) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Column(
        children: [
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: ModernCalculatorButton(
                    text: 'C',
                    type: ButtonType.clear,
                    onPressed: () => calcController.clear(),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '( )',
                    type: ButtonType.special,
                    onPressed: () => calcController.addParenthesis(),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '%',
                    type: ButtonType.operator,
                    onPressed: () => calcController.appendOperator('%'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '÷',
                    type: ButtonType.operator,
                    onPressed: () => calcController.appendOperator('/'),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: ModernCalculatorButton(
                    text: '7',
                    onPressed: () => calcController.appendNumber('7'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '8',
                    onPressed: () => calcController.appendNumber('8'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '9',
                    onPressed: () => calcController.appendNumber('9'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '×',
                    type: ButtonType.operator,
                    onPressed: () => calcController.appendOperator('*'),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: ModernCalculatorButton(
                    text: '4',
                    onPressed: () => calcController.appendNumber('4'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '5',
                    onPressed: () => calcController.appendNumber('5'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '6',
                    onPressed: () => calcController.appendNumber('6'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '−',
                    type: ButtonType.operator,
                    onPressed: () => calcController.appendOperator('-'),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: ModernCalculatorButton(
                    text: '1',
                    onPressed: () => calcController.appendNumber('1'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '2',
                    onPressed: () => calcController.appendNumber('2'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '3',
                    onPressed: () => calcController.appendNumber('3'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '+',
                    type: ButtonType.operator,
                    onPressed: () => calcController.appendOperator('+'),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: ModernCalculatorButton(
                    text: '⌫',
                    type: ButtonType.special,
                    onPressed: () => calcController.backspace(),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '0',
                    onPressed: () => calcController.appendNumber('0'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '.',
                    onPressed: () => calcController.appendDecimal(),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '=',
                    type: ButtonType.equals,
                    onPressed: () => calcController.calculate(),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// 🔬 Scientific Calculator Buttons
  Widget _buildScientificButtons(CalculatorController calcController) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        children: [
          // Row 1: Functions
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: ModernCalculatorButton(
                    text: 'sin',
                    type: ButtonType.function,
                    onPressed: () => calcController.appendFunction('sin'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: 'cos',
                    type: ButtonType.function,
                    onPressed: () => calcController.appendFunction('cos'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: 'tan',
                    type: ButtonType.function,
                    onPressed: () => calcController.appendFunction('tan'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: 'C',
                    type: ButtonType.clear,
                    onPressed: () => calcController.clear(),
                  ),
                ),
              ],
            ),
          ),
          // Row 2: Advanced
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: ModernCalculatorButton(
                    text: '√',
                    type: ButtonType.function,
                    onPressed: () => calcController.appendFunction('sqrt'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '^',
                    type: ButtonType.operator,
                    onPressed: () => calcController.appendOperator('^'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: 'π',
                    type: ButtonType.special,
                    onPressed: () => calcController.appendConstant('π'),
                  ),
                ),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '÷',
                    type: ButtonType.operator,
                    onPressed: () => calcController.appendOperator('/'),
                  ),
                ),
              ],
            ),
          ),
          // Row 3-6: Numbers and operators (same as basic)
          Expanded(
            child: Row(
              children: [
                Expanded(child: ModernCalculatorButton(text: '7', onPressed: () => calcController.appendNumber('7'))),
                Expanded(child: ModernCalculatorButton(text: '8', onPressed: () => calcController.appendNumber('8'))),
                Expanded(child: ModernCalculatorButton(text: '9', onPressed: () => calcController.appendNumber('9'))),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '×',
                    type: ButtonType.operator,
                    onPressed: () => calcController.appendOperator('*'),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Row(
              children: [
                Expanded(child: ModernCalculatorButton(text: '4', onPressed: () => calcController.appendNumber('4'))),
                Expanded(child: ModernCalculatorButton(text: '5', onPressed: () => calcController.appendNumber('5'))),
                Expanded(child: ModernCalculatorButton(text: '6', onPressed: () => calcController.appendNumber('6'))),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '−',
                    type: ButtonType.operator,
                    onPressed: () => calcController.appendOperator('-'),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Row(
              children: [
                Expanded(child: ModernCalculatorButton(text: '1', onPressed: () => calcController.appendNumber('1'))),
                Expanded(child: ModernCalculatorButton(text: '2', onPressed: () => calcController.appendNumber('2'))),
                Expanded(child: ModernCalculatorButton(text: '3', onPressed: () => calcController.appendNumber('3'))),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '+',
                    type: ButtonType.operator,
                    onPressed: () => calcController.appendOperator('+'),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: ModernCalculatorButton(
                    text: '⌫',
                    type: ButtonType.special,
                    onPressed: () => calcController.backspace(),
                  ),
                ),
                Expanded(child: ModernCalculatorButton(text: '0', onPressed: () => calcController.appendNumber('0'))),
                Expanded(child: ModernCalculatorButton(text: '.', onPressed: () => calcController.appendDecimal())),
                Expanded(
                  child: ModernCalculatorButton(
                    text: '=',
                    type: ButtonType.equals,
                    onPressed: () => calcController.calculate(),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showHistory(BuildContext context) {
    // TODO: Implement history dialog
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Geçmiş özelliği yakında eklenecek!')),
    );
  }

  void _showSettings(BuildContext context) {
    // TODO: Implement settings dialog
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Ayarlar özelliği yakında eklenecek!')),
    );
  }
}