import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:math' as math;
import '../controllers/theme_controller.dart';
import '../models/calculation_model.dart';

class DisplayWidget extends StatefulWidget {
  final String expression;
  final String result;
  final bool hasError;
  final String errorMessage;
  final bool isAIMode;
  final String? aiResponse;
  final List<String>? steps;

  const DisplayWidget({
    super.key,
    required this.expression,
    required this.result,
    this.hasError = false,
    this.errorMessage = '',
    this.isAIMode = false,
    this.aiResponse,
    this.steps,
  });

  @override
  State<DisplayWidget> createState() => _DisplayWidgetState();
}

class _DisplayWidgetState extends State<DisplayWidget>
    with TickerProviderStateMixin {
  late AnimationController _resultController;
  late AnimationController _errorController;
  late AnimationController _stepsController;
  late Animation<double> _resultAnimation;
  late Animation<double> _errorAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _resultController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _errorController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _stepsController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _resultAnimation = CurvedAnimation(
      parent: _resultController,
      curve: Curves.elasticOut,
    );
    _errorAnimation = CurvedAnimation(
      parent: _errorController,
      curve: Curves.bounceInOut,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(1.0, 0.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _resultController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _resultController.dispose();
    _errorController.dispose();
    _stepsController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(DisplayWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    
    if (widget.result != oldWidget.result && widget.result != '0') {
      _resultController.forward();
    }
    
    if (widget.hasError != oldWidget.hasError && widget.hasError) {
      _errorController.forward().then((_) {
        _errorController.reverse();
      });
    }
    
    if (widget.steps != oldWidget.steps && widget.steps != null) {
      _stepsController.forward();
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeController = ThemeController();
    
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: widget.isAIMode 
              ? [
                  themeController.cardColor,
                  themeController.cardColor.withOpacity(0.9),
                  themeController.primaryColor.withOpacity(0.1),
                ]
              : [
                  themeController.cardColor,
                  themeController.cardColor,
                ],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: widget.isAIMode 
                ? themeController.primaryColor.withOpacity(0.2)
                : Colors.black.withOpacity(0.1),
            blurRadius: widget.isAIMode ? 15 : 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // AI Mode Indicator
          if (widget.isAIMode) _buildAIModeIndicator(themeController),
          
          // Expression Display
          _buildExpressionDisplay(themeController),
          
          const SizedBox(height: 16),
          
          // Result Display
          _buildResultDisplay(themeController),
          
          // Error Display
          if (widget.hasError) _buildErrorDisplay(themeController),
          
          // AI Response
          if (widget.aiResponse != null && widget.aiResponse!.isNotEmpty)
            _buildAIResponse(themeController),
          
          // Steps Display
          if (widget.steps != null && widget.steps!.isNotEmpty)
            _buildStepsDisplay(themeController),
        ],
      ),
    );
  }

  Widget _buildAIModeIndicator(ThemeController themeController) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: themeController.primaryGradient,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: themeController.primaryColor.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.auto_awesome_rounded,
            color: Colors.white,
            size: 16,
          ),
          const SizedBox(width: 6),
          Text(
            'AI Mode',
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.white,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    ).animate().fadeIn().scale(begin: const Offset(0.8, 0.8));
  }

  Widget _buildExpressionDisplay(ThemeController themeController) {
    return Container(
      constraints: const BoxConstraints(minHeight: 40),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        reverse: true,
        child: SelectableText(
          widget.expression.isEmpty ? '0' : widget.expression,
          style: GoogleFonts.robotoMono(
            fontSize: 20,
            color: themeController.secondaryTextColor,
            fontWeight: FontWeight.w400,
            letterSpacing: 1.0,
          ),
        ),
      ),
    );
  }

  Widget _buildResultDisplay(ThemeController themeController) {
    return AnimatedBuilder(
      animation: _resultAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: 0.9 + (0.1 * _resultAnimation.value),
          child: SlideTransition(
            position: _slideAnimation,
            child: Container(
              constraints: const BoxConstraints(minHeight: 60),
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerRight,
                child: SelectableText(
                  widget.result,
                  style: GoogleFonts.robotoMono(
                    fontSize: 48,
                    color: widget.hasError 
                        ? themeController.errorColor
                        : themeController.primaryTextColor,
                    fontWeight: FontWeight.bold,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildErrorDisplay(ThemeController themeController) {
    return AnimatedBuilder(
      animation: _errorAnimation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(
            10 * math.sin(_errorAnimation.value * 8 * 3.14159) * (1 - _errorAnimation.value),
            0,
          ),
          child: Container(
            margin: const EdgeInsets.only(top: 12),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: themeController.errorColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: themeController.errorColor.withOpacity(0.3),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.error_outline_rounded,
                  color: themeController.errorColor,
                  size: 16,
                ),
                const SizedBox(width: 8),
                Text(
                  widget.errorMessage,
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: themeController.errorColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildAIResponse(ThemeController themeController) {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: themeController.primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
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
                Icons.psychology_rounded,
                color: themeController.primaryColor,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                'AI Explanation',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: themeController.primaryColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            widget.aiResponse!,
            style: GoogleFonts.poppins(
              fontSize: 13,
              color: themeController.primaryTextColor,
              height: 1.4,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 300)).slideX(begin: 0.3, end: 0);
  }

  Widget _buildStepsDisplay(ThemeController themeController) {
    return AnimatedBuilder(
      animation: _stepsController,
      builder: (context, child) {
        return Container(
          margin: const EdgeInsets.only(top: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: themeController.successColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: themeController.successColor.withOpacity(0.2),
              width: 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.list_alt_rounded,
                    color: themeController.successColor,
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Step by Step',
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: themeController.successColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ...widget.steps!.asMap().entries.map((entry) {
                final index = entry.key;
                final step = entry.value;
                final delay = index * 100;
                
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        margin: const EdgeInsets.only(right: 12, top: 2),
                        decoration: BoxDecoration(
                          color: themeController.successColor,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Text(
                            '${index + 1}',
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: Text(
                          step,
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: themeController.primaryTextColor,
                            height: 1.3,
                          ),
                        ),
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: Duration(milliseconds: delay))
                  .slideX(begin: 0.3, end: 0);
              }),
            ],
          ),
        );
      },
    );
  }

  // Helper for shake animation - removed since we use math.sin directly
}

// Specialized displays
class ScientificDisplay extends DisplayWidget {
  final String mode;
  final bool isDegreeMode;

  const ScientificDisplay({
    super.key,
    required super.expression,
    required super.result,
    super.hasError = false,
    super.errorMessage = '',
    this.mode = 'DEG',
    this.isDegreeMode = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Mode indicators
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                mode,
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: isDegreeMode ? Colors.orange : Colors.blue,
                ),
              ),
            ],
          ),
        ),
        // Main display
        DisplayWidget(
          expression: expression,
          result: result,
          hasError: hasError,
          errorMessage: errorMessage,
        ),
      ],
    );
  }
}

class GraphingDisplay extends DisplayWidget {
  final List<double>? dataPoints;
  final String? functionExpression;

  const GraphingDisplay({
    super.key,
    required super.expression,
    required super.result,
    super.hasError = false,
    super.errorMessage = '',
    this.dataPoints,
    this.functionExpression,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        DisplayWidget(
          expression: expression,
          result: result,
          hasError: hasError,
          errorMessage: errorMessage,
        ),
        if (dataPoints != null && dataPoints!.isNotEmpty)
          Container(
            height: 200,
            margin: const EdgeInsets.only(top: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Center(
              child: Text(
                'Graph visualization would go here',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  color: Theme.of(context).textTheme.bodyMedium?.color,
                ),
              ),
            ),
          ),
      ],
    );
  }
}