import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../controllers/special_calculators/health_calculators_controller.dart';
import '../universal_calculator_screen.dart';
import '../../../core/theme/app_colors.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';

class BMICalculatorScreen extends StatelessWidget {
  const BMICalculatorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Provider.of<HealthCalculatorsController>(context, listen: false);

    return UniversalCalculatorScreen(
      title: 'BMI Hesaplayıcı',
      emoji: '⚖️',
      primaryColor: AppColors.coralRed,
      fields: [
        CalculatorField(
          key: 'weight',
          label: 'Kilo',
          type: FieldType.number,
          suffix: 'kg',
          defaultValue: 70.0,
        ),
        CalculatorField(
          key: 'height',
          label: 'Boy',
          type: FieldType.number,
          suffix: 'cm',
          defaultValue: 170.0,
        ),
      ],
      onCalculate: (values) {
        double weight = values['weight'] ?? 0;
        double height = values['height'] ?? 1;
        double bmi = controller.calculateBMI(weight, height);
        String category = controller.getBMICategory(bmi);
        
        return {
          'bmi': bmi,
          'category': category,
          'weight_kg': weight,
          'height_cm': height,
        };
      },
      resultBuilder: (results) {
        double bmi = results['bmi'] ?? 0;
        String category = results['category'] ?? '';
        Color categoryColor = _getBMIColor(bmi);

        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                categoryColor.withOpacity(0.3),
                categoryColor.withOpacity(0.1),
              ],
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: categoryColor.withOpacity(0.3), width: 2),
          ),
          child: Column(
            children: [
              Text(
                '📊 BMI Sonucunuz',
                style: GoogleFonts.poppins(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 24),
              
              // BMI Value
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: categoryColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: categoryColor, width: 3),
                ),
                child: Column(
                  children: [
                    Text(
                      bmi.toStringAsFixed(1),
                      style: GoogleFonts.poppins(
                        fontSize: 56,
                        fontWeight: FontWeight.bold,
                        color: categoryColor,
                      ),
                    ),
                    Text(
                      category,
                      style: GoogleFonts.poppins(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 24),
              
              // BMI Scale
              _buildBMIScale(bmi),
              
              const SizedBox(height: 24),
              
              // Health Info
              _buildHealthInfo(category, categoryColor),
            ],
          ),
        ).animate().fadeIn(delay: 300.ms).scale();
      },
    );
  }

  Widget _buildBMIScale(double bmi) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'BMI Skalası',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white70,
          ),
        ),
        const SizedBox(height: 12),
        _buildScaleItem('< 18.5', 'Zayıf', Colors.blue, bmi < 18.5),
        _buildScaleItem('18.5 - 25', 'Normal', Colors.green, bmi >= 18.5 && bmi < 25),
        _buildScaleItem('25 - 30', 'Fazla Kilolu', Colors.orange, bmi >= 25 && bmi < 30),
        _buildScaleItem('≥ 30', 'Obez', Colors.red, bmi >= 30),
      ],
    );
  }

  Widget _buildScaleItem(String range, String label, Color color, bool isActive) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isActive ? color.withOpacity(0.3) : Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isActive ? color : Colors.white.withOpacity(0.1),
          width: isActive ? 2 : 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          Text(
            range,
            style: TextStyle(
              color: Colors.white,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          const Spacer(),
          Text(
            label,
            style: TextStyle(
              color: Colors.white70,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHealthInfo(String category, Color color) {
    Map<String, String> info = {
      'Zayıf': 'Kilo almanız önerilir. Dengeli beslenme ve spor danışmanına başvurun.',
      'Normal': 'Sağlıklı bir kiloda sınız! Bu kilo aralığını korumaya devam edin.',
      'Fazla Kilolu': 'Hafif kilo vermeniz önerilir. Düzenli egzersiz ve dengeli beslenme.',
      'Obez (Sınıf I)': 'Sağlığınız için kilo vermeniz önemli. Uzman desteği alın.',
      'Obez (Sınıf II)': 'Acilen kilo vermelisiniz. Doktor kontrolünde program başlatın.',
      'Obez (Sınıf III)': 'Ciddi sağlık riski. Derhal tıbbi destek alın.',
    };

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline, color: color, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              info[category] ?? 'BMI değeriniz hesaplandı.',
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 14,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getBMIColor(double bmi) {
    if (bmi < 18.5) return Colors.blue;
    if (bmi < 25) return Colors.green;
    if (bmi < 30) return Colors.orange;
    return Colors.red;
  }
}