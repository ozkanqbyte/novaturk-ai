import 'package:flutter/material.dart';
import 'dart:math' as math;

/// 🌊 Premium Hesap Makinesi Logo
/// Modern okyanus dalgası + matematik sembolleri
class PremiumLogo extends StatelessWidget {
  final double size;
  final bool animate;

  const PremiumLogo({
    super.key,
    this.size = 120,
    this.animate = false,
  });

  @override
  Widget build(BuildContext context) {
    if (animate) {
      return _AnimatedLogo(size: size);
    }
    return _StaticLogo(size: size);
  }
}

class _StaticLogo extends StatelessWidget {
  final double size;

  const _StaticLogo({required this.size});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _LogoPainter(),
      ),
    );
  }
}

class _AnimatedLogo extends StatefulWidget {
  final double size;

  const _AnimatedLogo({required this.size});

  @override
  State<_AnimatedLogo> createState() => _AnimatedLogoState();
}

class _AnimatedLogoState extends State<_AnimatedLogo>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return SizedBox(
          width: widget.size,
          height: widget.size,
          child: CustomPaint(
            painter: _LogoPainter(animationValue: _controller.value),
          ),
        );
      },
    );
  }
}

class _LogoPainter extends CustomPainter {
  final double animationValue;

  _LogoPainter({this.animationValue = 0});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // 🎨 Gradient Colors (Ocean Blue → Purple)
    final oceanBlue = const Color(0xFF0A74DA);
    final deepBlue = const Color(0xFF004E98);
    final purple = const Color(0xFF6C5CE7);
    final lightPurple = const Color(0xFFA29BFE);

    // 🌊 Background Circle with Gradient
    final gradientPaint = Paint()
      ..shader = RadialGradient(
        colors: [oceanBlue, deepBlue, purple],
        stops: const [0.0, 0.6, 1.0],
      ).createShader(Rect.fromCircle(center: center, radius: radius));

    canvas.drawCircle(center, radius, gradientPaint);

    // 🌊 Wave Paths (3 layers)
    _drawWave(canvas, size, oceanBlue.withOpacity(0.3), 0, animationValue);
    _drawWave(canvas, size, oceanBlue.withOpacity(0.5), 0.3, animationValue);
    _drawWave(canvas, size, Colors.white.withOpacity(0.8), 0.6, animationValue);

    // 🔢 Math Symbols
    _drawMathSymbols(canvas, size, lightPurple, purple);
  }

  void _drawWave(Canvas canvas, Size size, Color color, double offset, double animation) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path();
    final waveHeight = size.height * 0.15;
    final baseY = size.height * (0.5 + offset);

    path.moveTo(0, size.height);

    for (double x = 0; x <= size.width; x++) {
      final normalizedX = x / size.width;
      final angle = (normalizedX * 2 * math.pi * 2) + (animation * 2 * math.pi);
      final y = baseY + math.sin(angle) * waveHeight;
      path.lineTo(x, y);
    }

    path.lineTo(size.width, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  void _drawMathSymbols(Canvas canvas, Size size, Color lightColor, Color darkColor) {
    final textPainter = TextPainter(
      textDirection: TextDirection.ltr,
      textAlign: TextAlign.center,
    );

    // π symbol (top left)
    _drawSymbol(canvas, size, textPainter, 'π', 
      Offset(size.width * 0.25, size.height * 0.25), 
      lightColor, size.width * 0.15);

    // ∑ symbol (top right)
    _drawSymbol(canvas, size, textPainter, '∑', 
      Offset(size.width * 0.75, size.height * 0.3), 
      darkColor, size.width * 0.18);

    // √ symbol (bottom left)
    _drawSymbol(canvas, size, textPainter, '√', 
      Offset(size.width * 0.3, size.height * 0.7), 
      darkColor, size.width * 0.12);

    // ÷ symbol (center - main)
    _drawSymbol(canvas, size, textPainter, '=', 
      Offset(size.width * 0.5, size.height * 0.45), 
      Colors.white, size.width * 0.25);
  }

  void _drawSymbol(Canvas canvas, Size size, TextPainter textPainter, 
      String symbol, Offset position, Color color, double fontSize) {
    textPainter.text = TextSpan(
      text: symbol,
      style: TextStyle(
        color: color,
        fontSize: fontSize,
        fontWeight: FontWeight.bold,
        fontFamily: 'serif',
      ),
    );
    textPainter.layout();
    textPainter.paint(
      canvas,
      Offset(
        position.dx - textPainter.width / 2,
        position.dy - textPainter.height / 2,
      ),
    );
  }

  @override
  bool shouldRepaint(_LogoPainter oldDelegate) {
    return animationValue != oldDelegate.animationValue;
  }
}