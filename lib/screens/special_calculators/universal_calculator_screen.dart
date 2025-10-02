import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../services/admob_service.dart';

/// 🎯 Universal Calculator Screen - Dynamic Template for All Calculators
class UniversalCalculatorScreen extends StatefulWidget {
  final String title;
  final String emoji;
  final Color primaryColor;
  final List<CalculatorField> fields;
  final Function(Map<String, dynamic>) onCalculate;
  final Widget Function(Map<String, dynamic>)? resultBuilder;

  const UniversalCalculatorScreen({
    super.key,
    required this.title,
    required this.emoji,
    required this.primaryColor,
    required this.fields,
    required this.onCalculate,
    this.resultBuilder,
  });

  @override
  State<UniversalCalculatorScreen> createState() => _UniversalCalculatorScreenState();
}

class _UniversalCalculatorScreenState extends State<UniversalCalculatorScreen> {
  final Map<String, TextEditingController> controllers = {};
  final Map<String, dynamic> values = {};
  Map<String, dynamic>? results;

  @override
  void initState() {
    super.initState();
    for (var field in widget.fields) {
      if (field.type != FieldType.dropdown && field.type != FieldType.switch_toggle) {
        controllers[field.key] = TextEditingController();
      }
      values[field.key] = field.defaultValue;
    }
  }

  @override
  void dispose() {
    controllers.values.forEach((c) => c.dispose());
    super.dispose();
  }

  void _calculate() {
    try {
      // Collect values
      for (var field in widget.fields) {
        if (field.type == FieldType.number) {
          values[field.key] = double.tryParse(controllers[field.key]?.text ?? '0') ?? 0.0;
        } else if (field.type == FieldType.integer) {
          values[field.key] = int.tryParse(controllers[field.key]?.text ?? '0') ?? 0;
        }
      }

      // Calculate
      final result = widget.onCalculate(values);
      setState(() {
        results = result;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Hata: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final admobService = Provider.of<AdMobService>(context, listen: false);
    
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFF0A0A0A),
              const Color(0xFF1A1A2E),
              widget.primaryColor.withOpacity(0.2),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      _buildInputSection(),
                      const SizedBox(height: 20),
                      _buildCalculateButton(),
                      if (results != null) ...[
                        const SizedBox(height: 30),
                        _buildResultsSection(),
                      ],
                    ],
                  ),
                ),
              ),
              
              // 📺 AdMob Banner (Bottom)
              if (admobService.isBannerAdLoaded && !admobService.isPremiumActive)
                Container(
                  height: 60,
                  color: Colors.black.withOpacity(0.3),
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
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          const SizedBox(width: 12),
          Text(
            widget.emoji,
            style: const TextStyle(fontSize: 32),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              widget.title,
              style: GoogleFonts.poppins(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn().slideY(begin: -0.2, end: 0);
  }

  Widget _buildInputSection() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.1), width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bilgileri Girin',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 20),
          ...widget.fields.map((field) => _buildField(field)),
        ],
      ),
    ).animate().fadeIn(delay: 200.ms).slideX(begin: -0.1, end: 0);
  }

  Widget _buildField(CalculatorField field) {
    switch (field.type) {
      case FieldType.number:
      case FieldType.integer:
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: TextField(
            controller: controllers[field.key],
            keyboardType: TextInputType.numberWithOptions(
              decimal: field.type == FieldType.number,
            ),
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              labelText: field.label,
              labelStyle: TextStyle(color: Colors.white70),
              suffixText: field.suffix,
              suffixStyle: TextStyle(color: widget.primaryColor),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.white.withOpacity(0.2)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: widget.primaryColor, width: 2),
              ),
            ),
          ),
        );

      case FieldType.dropdown:
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: DropdownButtonFormField<dynamic>(
            value: values[field.key],
            dropdownColor: const Color(0xFF1A1A2E),
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              labelText: field.label,
              labelStyle: const TextStyle(color: Colors.white70),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.white.withOpacity(0.2)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: widget.primaryColor, width: 2),
              ),
            ),
            items: field.options?.map((option) {
              return DropdownMenuItem(
                value: option['value'],
                child: Text(option['label'] ?? ''),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                values[field.key] = value;
              });
            },
          ),
        );

      case FieldType.switch_toggle:
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                field.label,
                style: const TextStyle(color: Colors.white70, fontSize: 16),
              ),
              Switch(
                value: values[field.key] ?? false,
                activeColor: widget.primaryColor,
                onChanged: (value) {
                  setState(() {
                    values[field.key] = value;
                  });
                },
              ),
            ],
          ),
        );

      case FieldType.slider:
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    field.label,
                    style: const TextStyle(color: Colors.white70, fontSize: 16),
                  ),
                  Text(
                    '${values[field.key]?.toStringAsFixed(field.decimals ?? 0) ?? ''} ${field.suffix ?? ''}',
                    style: TextStyle(
                      color: widget.primaryColor,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Slider(
                value: values[field.key]?.toDouble() ?? field.min ?? 0,
                min: field.min ?? 0,
                max: field.max ?? 100,
                divisions: field.divisions,
                activeColor: widget.primaryColor,
                onChanged: (value) {
                  setState(() {
                    values[field.key] = value;
                  });
                },
              ),
            ],
          ),
        );
    }
  }

  Widget _buildCalculateButton() {
    return GestureDetector(
      onTap: _calculate,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [widget.primaryColor, widget.primaryColor.withOpacity(0.7)],
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: widget.primaryColor.withOpacity(0.4),
              blurRadius: 20,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.calculate, color: Colors.white),
            const SizedBox(width: 12),
            Text(
              'HESAPLA',
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
      ),
    )
        .animate(onPlay: (controller) => controller.repeat(reverse: true))
        .shimmer(duration: 2000.ms);
  }

  // Türkçe sayı formatlama fonksiyonu
  String _formatNumber(dynamic value) {
    if (value == null) return '-';
    if (value is String) return value;
    if (value is! num) return value.toString();
    
    double number = value.toDouble();
    
    // Çok küçük veya çok büyük sayılar için bilimsel notasyon
    if (number.abs() >= 1e6 || (number.abs() < 0.001 && number != 0)) {
      return number.toStringAsExponential(2);
    }
    
    // Türkçe format: 1.234.567,89
    final formatter = NumberFormat('#,##0.##', 'tr_TR');
    return formatter.format(number);
  }

  Widget _buildResultsSection() {
    if (widget.resultBuilder != null && results != null) {
      return widget.resultBuilder!(results!);
    }

    // Get display map if exists, otherwise use raw results
    Map<String, dynamic> displayData = results!['display'] ?? results!;
    
    // Eğer display yoksa, raw sonuçları formatla
    if (displayData == results!) {
      displayData = Map<String, dynamic>.from(results!)
        ..removeWhere((key, value) => key == 'display' || key == 'formatted');
      
      // Her değeri formatla
      displayData = displayData.map((key, value) {
        if (value is num) {
          return MapEntry(key, _formatNumber(value));
        }
        return MapEntry(key, value);
      });
    }
    
    // Filter out meta keys
    final filteredData = Map<String, dynamic>.from(displayData)
      ..removeWhere((key, value) => 
        key == 'display' || 
        key == 'formatted' || 
        key == 'simple_interest' ||
        key == 'compound_interest' ||
        key == 'final_amount' ||
        key == 'difference' ||
        key == 'result' ||
        key == 'from_rate' ||
        key == 'to_rate' ||
        key == 'last_update' ||
        key == 'monthly_payment' ||
        key == 'total_payment' ||
        key == 'total_interest' ||
        key == 'interest_percentage' ||
        key == 'future_value' ||
        key == 'total_invested' ||
        key == 'total_gain' ||
        key == 'roi_percentage'
      );

    // Default result builder
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            widget.primaryColor.withOpacity(0.3),
            widget.primaryColor.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: widget.primaryColor.withOpacity(0.3), width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                '📊 ',
                style: GoogleFonts.poppins(
                  fontSize: 24,
                ),
              ),
              Text(
                'Sonuçlar',
                style: GoogleFonts.poppins(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          ...filteredData.entries.map((entry) {
            // Skip separator lines in display
            if (entry.value.toString().isEmpty) {
              return const Divider(
                color: Colors.white24,
                thickness: 1,
                height: 24,
              );
            }
            
            return Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 3,
                    child: Text(
                      entry.key,
                      style: GoogleFonts.poppins(
                        color: Colors.white70,
                        fontSize: 15,
                        height: 1.4,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    flex: 2,
                    child: Text(
                      entry.value.toString(),
                      textAlign: TextAlign.right,
                      style: GoogleFonts.poppins(
                        color: widget.primaryColor,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    ).animate().fadeIn(delay: 300.ms).scale();
  }

  String _formatKey(String key) {
    return key.split('_').map((word) => 
      word[0].toUpperCase() + word.substring(1)
    ).join(' ');
  }

  String _formatValue(dynamic value) {
    if (value is double) {
      return value.toStringAsFixed(2);
    }
    return value.toString();
  }
}

// Field Types
enum FieldType {
  number,
  integer,
  dropdown,
  switch_toggle,
  slider,
}

// Calculator Field Model
class CalculatorField {
  final String key;
  final String label;
  final FieldType type;
  final dynamic defaultValue;
  final String? suffix;
  final List<Map<String, dynamic>>? options;
  final double? min;
  final double? max;
  final int? divisions;
  final int? decimals;

  CalculatorField({
    required this.key,
    required this.label,
    required this.type,
    this.defaultValue,
    this.suffix,
    this.options,
    this.min,
    this.max,
    this.divisions,
    this.decimals,
  });
}