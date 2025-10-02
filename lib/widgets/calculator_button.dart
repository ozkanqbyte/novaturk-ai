import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';

class CalculatorButton extends StatefulWidget {
  final String text;
  final VoidCallback onPressed;
  final Color? backgroundColor;
  final Color? textColor;
  final double? fontSize;
  final double? borderRadius;
  final EdgeInsetsGeometry? padding;
  final bool isEnabled;
  final Widget? child;
  final bool hasGradient;
  final List<Color>? gradientColors;
  final bool hasGlow;

  const CalculatorButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.backgroundColor,
    this.textColor,
    this.fontSize = 18,
    this.borderRadius = 20,
    this.padding = const EdgeInsets.all(20),
    this.isEnabled = true,
    this.child,
    this.hasGradient = false,
    this.gradientColors,
    this.hasGlow = false,
  });

  @override
  State<CalculatorButton> createState() => _CalculatorButtonState();
}

class _CalculatorButtonState extends State<CalculatorButton>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late AnimationController _glowController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _glowAnimation;
  
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 100),
      vsync: this,
    );
    _glowController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    
    _glowAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _glowController,
      curve: Curves.easeInOut,
    ));
    
    if (widget.hasGlow) {
      _glowController.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    if (!widget.isEnabled) return;
    
    setState(() {
      _isPressed = true;
    });
    _animationController.forward();
    HapticFeedback.lightImpact();
  }

  void _onTapUp(TapUpDetails details) {
    if (!widget.isEnabled) return;
    
    setState(() {
      _isPressed = false;
    });
    _animationController.reverse();
    widget.onPressed();
  }

  void _onTapCancel() {
    setState(() {
      _isPressed = false;
    });
    _animationController.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    final backgroundColor = widget.backgroundColor ??
        (theme.brightness == Brightness.dark 
            ? const Color(0xFF2A2A2A)
            : const Color(0xFFF1F2F6));
    
    final textColor = widget.textColor ??
        (theme.brightness == Brightness.dark 
            ? Colors.white
            : const Color(0xFF2D3436));

    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: GestureDetector(
            onTapDown: _onTapDown,
            onTapUp: _onTapUp,
            onTapCancel: _onTapCancel,
            child: Container(
              decoration: BoxDecoration(
                gradient: widget.hasGradient && widget.gradientColors != null
                    ? LinearGradient(
                        colors: widget.gradientColors!,
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : null,
                color: widget.hasGradient ? null : backgroundColor,
                borderRadius: BorderRadius.circular(widget.borderRadius!),
                boxShadow: [
                  // Main shadow
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                  // Inner glow effect
                  if (_isPressed)
                    BoxShadow(
                      color: backgroundColor.withOpacity(0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 2),
                      spreadRadius: -2,
                    ),
                  // Glow animation
                  if (widget.hasGlow)
                    BoxShadow(
                      color: (widget.gradientColors?.first ?? backgroundColor)
                          .withOpacity(0.4 * _glowAnimation.value),
                      blurRadius: 20 * _glowAnimation.value,
                      spreadRadius: 2 * _glowAnimation.value,
                    ),
                ],
                border: _isPressed
                    ? Border.all(
                        color: (widget.gradientColors?.first ?? backgroundColor)
                            .withOpacity(0.5),
                        width: 2,
                      )
                    : null,
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(widget.borderRadius!),
                  onTap: widget.isEnabled ? widget.onPressed : null,
                  splashColor: textColor.withOpacity(0.1),
                  highlightColor: textColor.withOpacity(0.05),
                  child: Container(
                    padding: widget.padding,
                    child: Center(
                      child: widget.child ??
                          Text(
                            widget.text,
                            style: GoogleFonts.poppins(
                              fontSize: widget.fontSize,
                              fontWeight: FontWeight.w600,
                              color: widget.isEnabled 
                                  ? textColor 
                                  : textColor.withOpacity(0.5),
                              letterSpacing: 0.5,
                            ),
                          ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

// Specialized button variants
class AICalculatorButton extends CalculatorButton {
  const AICalculatorButton({
    super.key,
    required super.text,
    required super.onPressed,
    super.backgroundColor,
    super.textColor = Colors.white,
    super.fontSize = 16,
    super.borderRadius = 24,
    super.child,
  }) : super(
    hasGradient: true,
    gradientColors: const [Color(0xFF6C5CE7), Color(0xFFA29BFE)],
    hasGlow: true,
  );
}

class VoiceButton extends StatelessWidget {
  final VoidCallback onPressed;
  final bool isListening;
  final bool isEnabled;

  const VoiceButton({
    super.key,
    required this.onPressed,
    this.isListening = false,
    this.isEnabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return CalculatorButton(
      text: '',
      onPressed: onPressed,
      hasGradient: true,
      gradientColors: isListening 
          ? [const Color(0xFF00B894), const Color(0xFF00CED1)]
          : [const Color(0xFFE84393), const Color(0xFFFD79A8)],
      hasGlow: isListening,
      borderRadius: 28,
      padding: const EdgeInsets.all(16),
      isEnabled: isEnabled,
      child: Icon(
        isListening ? Icons.mic : Icons.mic_none_rounded,
        color: Colors.white,
        size: 24,
      ).animate(
        onPlay: (controller) => isListening ? controller.repeat() : null,
      ).scale(
        begin: const Offset(1.0, 1.0),
        end: const Offset(1.2, 1.2),
        duration: const Duration(milliseconds: 800),
      ),
    );
  }
}

class CameraButton extends CalculatorButton {
  const CameraButton({
    super.key,
    required super.onPressed,
    super.isEnabled = true,
  }) : super(
    text: '',
    hasGradient: true,
    gradientColors: const [Color(0xFFFF6B6B), Color(0xFFFFE66D)],
    borderRadius: 28,
    padding: const EdgeInsets.all(16),
    child: const Icon(
      Icons.camera_alt_rounded,
      color: Colors.white,
      size: 24,
    ),
  );
}

class HistoryButton extends CalculatorButton {
  const HistoryButton({
    super.key,
    required super.onPressed,
    super.isEnabled = true,
  }) : super(
    text: '',
    hasGradient: true,
    gradientColors: const [Color(0xFF4ECDC4), Color(0xFF44A08D)],
    borderRadius: 28,
    padding: const EdgeInsets.all(16),
    child: const Icon(
      Icons.history_rounded,
      color: Colors.white,
      size: 24,
    ),
  );
}

class ShareButton extends CalculatorButton {
  const ShareButton({
    super.key,
    required super.onPressed,
    super.isEnabled = true,
  }) : super(
    text: '',
    hasGradient: true,
    gradientColors: const [Color(0xFF667eea), Color(0xFF764ba2)],
    borderRadius: 28,
    padding: const EdgeInsets.all(16),
    child: const Icon(
      Icons.share_rounded,
      color: Colors.white,
      size: 24,
    ),
  );
}

// Animated Number Button with ripple effect
class AnimatedNumberButton extends StatefulWidget {
  final String number;
  final VoidCallback onPressed;
  final Color? backgroundColor;

  const AnimatedNumberButton({
    super.key,
    required this.number,
    required this.onPressed,
    this.backgroundColor,
  });

  @override
  State<AnimatedNumberButton> createState() => _AnimatedNumberButtonState();
}

class _AnimatedNumberButtonState extends State<AnimatedNumberButton>
    with TickerProviderStateMixin {
  late AnimationController _rippleController;
  late Animation<double> _rippleAnimation;

  @override
  void initState() {
    super.initState();
    _rippleController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _rippleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _rippleController,
      curve: Curves.easeOut,
    ));
  }

  @override
  void dispose() {
    _rippleController.dispose();
    super.dispose();
  }

  void _onPressed() {
    _rippleController.forward().then((_) {
      _rippleController.reset();
    });
    widget.onPressed();
  }

  @override
  Widget build(BuildContext context) {
    return CalculatorButton(
      text: widget.number,
      onPressed: _onPressed,
      backgroundColor: widget.backgroundColor,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Text(
            widget.number,
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).brightness == Brightness.dark 
                  ? Colors.white 
                  : const Color(0xFF2D3436),
            ),
          ),
          AnimatedBuilder(
            animation: _rippleAnimation,
            builder: (context, child) {
              return Container(
                width: 60 * _rippleAnimation.value,
                height: 60 * _rippleAnimation.value,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Theme.of(context).primaryColor
                        .withOpacity(0.3 * (1 - _rippleAnimation.value)),
                    width: 2,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}