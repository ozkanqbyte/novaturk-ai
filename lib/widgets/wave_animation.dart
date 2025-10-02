import 'package:flutter/material.dart';
import 'dart:math' as math;

/// 🌊 Ocean Wave Animation Widget
/// Splash screen için dinamik dalga animasyonu
class WaveAnimation extends StatefulWidget {
  final Color color1;
  final Color color2;
  final Color color3;
  final Duration duration;
  final double height;

  const WaveAnimation({
    super.key,
    this.color1 = const Color(0xFF0A74DA),
    this.color2 = const Color(0xFF004E98),
    this.color3 = const Color(0xFF6C5CE7),
    this.duration = const Duration(seconds: 3),
    this.height = 200,
  });

  @override
  State<WaveAnimation> createState() => _WaveAnimationState();
}

class _WaveAnimationState extends State<WaveAnimation>
    with TickerProviderStateMixin {
  late AnimationController _waveController;
  late AnimationController _riseController;
  late Animation<double> _riseAnimation;

  @override
  void initState() {
    super.initState();
    
    // Wave motion animation (continuous)
    _waveController = AnimationController(
      duration: widget.duration,
      vsync: this,
    )..repeat();

    // Rise animation (one-time)
    _riseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _riseAnimation = CurvedAnimation(
      parent: _riseController,
      curve: Curves.easeInOut,
    );

    _riseController.forward();
  }

  @override
  void dispose() {
    _waveController.dispose();
    _riseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([_waveController, _riseController]),
      builder: (context, child) {
        return CustomPaint(
          painter: _WavePainter(
            waveAnimation: _waveController.value,
            riseAnimation: _riseAnimation.value,
            color1: widget.color1,
            color2: widget.color2,
            color3: widget.color3,
          ),
          child: SizedBox(
            width: double.infinity,
            height: widget.height,
          ),
        );
      },
    );
  }
}

class _WavePainter extends CustomPainter {
  final double waveAnimation;
  final double riseAnimation;
  final Color color1;
  final Color color2;
  final Color color3;

  _WavePainter({
    required this.waveAnimation,
    required this.riseAnimation,
    required this.color1,
    required this.color2,
    required this.color3,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Calculate rise position (bottom to top)
    final riseOffset = size.height * (1 - riseAnimation);

    // Draw three wave layers
    _drawWaveLayer(
      canvas,
      size,
      color1.withOpacity(0.5),
      waveAnimation,
      riseOffset,
      0,
      1.5,
    );
    _drawWaveLayer(
      canvas,
      size,
      color2.withOpacity(0.7),
      waveAnimation,
      riseOffset,
      0.3,
      1.8,
    );
    _drawWaveLayer(
      canvas,
      size,
      color3.withOpacity(0.9),
      waveAnimation,
      riseOffset,
      0.6,
      2.2,
    );
  }

  void _drawWaveLayer(
    Canvas canvas,
    Size size,
    Color color,
    double animation,
    double riseOffset,
    double phaseShift,
    double frequency,
  ) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path();
    final waveHeight = 20.0;

    // Start from bottom left
    path.moveTo(0, size.height);

    // Draw wave curve
    for (double x = 0; x <= size.width; x++) {
      final normalizedX = x / size.width;
      final angle = (normalizedX * frequency * 2 * math.pi) + 
                    (animation * 2 * math.pi) + 
                    (phaseShift * math.pi);
      final y = riseOffset + math.sin(angle) * waveHeight;
      path.lineTo(x, y);
    }

    // Complete the path
    path.lineTo(size.width, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_WavePainter oldDelegate) {
    return waveAnimation != oldDelegate.waveAnimation ||
        riseAnimation != oldDelegate.riseAnimation;
  }
}

/// 🌊 Full Screen Wave Background
/// Tüm ekranı kaplayan dalga efekti
class FullScreenWaves extends StatelessWidget {
  final Widget? child;
  
  const FullScreenWaves({super.key, this.child});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    
    return Stack(
      children: [
        // Background gradient
        Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF001233), // Deep ocean
                Color(0xFF004E98), // Ocean blue
                Color(0xFF0A74DA), // Bright blue
              ],
            ),
          ),
        ),
        
        // Waves at bottom
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: WaveAnimation(
            height: size.height * 0.3,
          ),
        ),
        
        // Content
        if (child != null) child!,
      ],
    );
  }
}