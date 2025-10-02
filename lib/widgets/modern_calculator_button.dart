import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/theme/app_colors.dart';

/// 🎨 Modern Calculator Button - Animated & Premium Design
class ModernCalculatorButton extends StatefulWidget {
  final String text;
  final VoidCallback onPressed;
  final ButtonType type;
  final Color? customColor;
  final Color? textColor;
  final bool isLarge;
  final IconData? icon;

  const ModernCalculatorButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.type = ButtonType.number,
    this.customColor,
    this.textColor,
    this.isLarge = false,
    this.icon,
  });

  @override
  State<ModernCalculatorButton> createState() => _ModernCalculatorButtonState();
}

class _ModernCalculatorButtonState extends State<ModernCalculatorButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.9).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Color _getBackgroundColor() {
    if (widget.customColor != null) return widget.customColor!;

    switch (widget.type) {
      case ButtonType.number:
        return const Color(0xFF1E1E2E);
      case ButtonType.operator:
        return AppColors.oceanBlue;
      case ButtonType.function:
        return AppColors.royalPurple;
      case ButtonType.equals:
        return AppColors.oceanBlue;
      case ButtonType.clear:
        return AppColors.coralRed;
      case ButtonType.special:
        return AppColors.electricViolet;
    }
  }

  Color _getTextColor() {
    if (widget.textColor != null) return widget.textColor!;
    return Colors.white;
  }

  List<Color> _getGradientColors() {
    final baseColor = _getBackgroundColor();
    
    switch (widget.type) {
      case ButtonType.equals:
        return [AppColors.oceanBlue, AppColors.royalPurple];
      case ButtonType.operator:
        return [AppColors.oceanBlue, AppColors.oceanBlue.withOpacity(0.8)];
      case ButtonType.function:
        return [AppColors.royalPurple, AppColors.electricViolet];
      case ButtonType.special:
        return [AppColors.electricViolet, AppColors.neonPink];
      case ButtonType.clear:
        return [AppColors.coralRed, AppColors.coralRed.withOpacity(0.8)];
      default:
        return [baseColor, baseColor];
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        setState(() => _isPressed = true);
        _controller.forward();
        HapticFeedback.lightImpact();
      },
      onTapUp: (_) {
        setState(() => _isPressed = false);
        _controller.reverse();
        widget.onPressed();
      },
      onTapCancel: () {
        setState(() => _isPressed = false);
        _controller.reverse();
      },
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Container(
          margin: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            gradient: widget.type == ButtonType.number
                ? null
                : LinearGradient(
                    colors: _getGradientColors(),
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
            color: widget.type == ButtonType.number ? _getBackgroundColor() : null,
            borderRadius: BorderRadius.circular(20),
            boxShadow: _isPressed
                ? []
                : [
                    BoxShadow(
                      color: _getBackgroundColor().withOpacity(0.4),
                      blurRadius: 15,
                      spreadRadius: widget.type == ButtonType.equals ? 3 : 1,
                      offset: const Offset(0, 4),
                    ),
                  ],
            border: Border.all(
              color: _isPressed
                  ? Colors.white.withOpacity(0.5)
                  : Colors.white.withOpacity(0.1),
              width: 2,
            ),
          ),
          child: Center(
            child: widget.icon != null
                ? Icon(
                    widget.icon,
                    color: _getTextColor(),
                    size: 28,
                  )
                : Text(
                    widget.text,
                    style: GoogleFonts.poppins(
                      fontSize: widget.type == ButtonType.equals ? 32 : 24,
                      fontWeight: widget.type == ButtonType.number
                          ? FontWeight.w500
                          : FontWeight.bold,
                      color: _getTextColor(),
                      letterSpacing: widget.type == ButtonType.operator ? 2 : 0,
                    ),
                  ),
          ),
        )
            .animate(target: _isPressed ? 1 : 0)
            .shimmer(
              duration: const Duration(milliseconds: 300),
              color: Colors.white.withOpacity(0.3),
            ),
      ),
    );
  }
}

enum ButtonType {
  number,
  operator,
  function,
  equals,
  clear,
  special,
}