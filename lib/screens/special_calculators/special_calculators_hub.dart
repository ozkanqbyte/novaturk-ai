import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import 'calculator_configurations.dart';

/// 🎯 Special Calculators Hub - 7 Categories, 40+ Calculators
class SpecialCalculatorsHub extends StatelessWidget {
  const SpecialCalculatorsHub({super.key});

  @override
  Widget build(BuildContext context) {
    final categories = [
      {
        'title': '💰 Finans',
        'subtitle': '6 Hesaplayıcı',
        'color': AppColors.goldenYellow,
        'icon': Icons.attach_money,
        'calculators': ['Kredi', 'Yatırım', 'Faiz', 'Döviz', 'Vergi', 'Emeklilik']
      },
      {
        'title': '🏥 Sağlık',
        'subtitle': '7 Hesaplayıcı',
        'color': AppColors.coralRed,
        'icon': Icons.favorite,
        'calculators': ['BMI', 'Kalori', 'Su İhtiyacı', 'İdeal Kilo', 'Yağ Oranı', 'Hamilelik', 'İlaç Dozu']
      },
      {
        'title': '🏗️ İnşaat',
        'subtitle': '6 Hesaplayıcı',
        'color': AppColors.sunsetOrange,
        'icon': Icons.construction,
        'calculators': ['Beton', 'Tuğla', 'Boya', 'Demir', 'Maliyet', 'Alan']
      },
      {
        'title': '🔬 Bilim',
        'subtitle': '8 Hesaplayıcı',
        'color': AppColors.electricViolet,
        'icon': Icons.science,
        'calculators': ['Fizik', 'Kimya', 'Elektrik', 'Optik', 'Mekanik', 'Termodinamik', 'Atom', 'Dalga']
      },
      {
        'title': '💼 İş',
        'subtitle': '6 Hesaplayıcı',
        'color': AppColors.oceanBlue,
        'icon': Icons.business,
        'calculators': ['Maaş', 'Kar/Zarar', 'ROI', 'Çalışma Saati', 'Prim', 'Fatura']
      },
      {
        'title': '🏠 Günlük',
        'subtitle': '5 Hesaplayıcı',
        'color': AppColors.royalPurple,
        'icon': Icons.home,
        'calculators': ['Alışveriş', 'Bahşiş', 'Tarif', 'Yakıt', 'Zaman']
      },
      {
        'title': '🎓 Eğitim',
        'subtitle': '5 Hesaplayıcı',
        'color': AppColors.neonPink,
        'icon': Icons.school,
        'calculators': ['Not Ortalaması', 'Yüzdelik', 'Geometri', 'İstatistik', 'Olasılık']
      },
    ];

    return Scaffold(
      body: Container(
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
              _buildHeader(context),
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(20),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 0.85,
                  ),
                  itemCount: categories.length,
                  itemBuilder: (context, index) {
                    final category = categories[index];
                    return _buildCategoryCard(
                      context,
                      category['title'] as String,
                      category['subtitle'] as String,
                      category['color'] as Color,
                      category['icon'] as IconData,
                      category['calculators'] as List<String>,
                      index,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ShaderMask(
                  shaderCallback: (bounds) => LinearGradient(
                    colors: [AppColors.oceanBlue, AppColors.electricViolet],
                  ).createShader(bounds),
                  child: Text(
                    'Özel Hesaplayıcılar',
                    style: GoogleFonts.poppins(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
                Text(
                  '7 Kategori • 40+ Hesaplayıcı',
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.goldenYellow, AppColors.sunsetOrange],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '⭐ PREMIUM',
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          )
              .animate(onPlay: (controller) => controller.repeat())
              .shimmer(duration: 1500.ms),
        ],
      ),
    ).animate().fadeIn().slideY(begin: -0.2, end: 0);
  }

  Widget _buildCategoryCard(
    BuildContext context,
    String title,
    String subtitle,
    Color color,
    IconData icon,
    List<String> calculators,
    int index,
  ) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => CalculatorCategoryScreen(
              title: title,
              color: color,
              calculators: calculators,
            ),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              color,
              color.withOpacity(0.7),
            ],
          ),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.4),
              blurRadius: 20,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Stack(
          children: [
            // Background pattern
            Positioned(
              right: -20,
              top: -20,
              child: Icon(
                icon,
                size: 120,
                color: Colors.white.withOpacity(0.1),
              ),
            ),
            
            // Content
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(icon, color: Colors.white, size: 32),
                  ),
                  
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: GoogleFonts.poppins(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: GoogleFonts.poppins(
                          fontSize: 13,
                          color: Colors.white.withOpacity(0.9),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    )
        .animate()
        .fadeIn(delay: (index * 100).ms)
        .scale(delay: (index * 100).ms);
  }
}

/// 📱 Calculator Category Screen - Shows all calculators in a category
class CalculatorCategoryScreen extends StatelessWidget {
  final String title;
  final Color color;
  final List<String> calculators;

  const CalculatorCategoryScreen({
    super.key,
    required this.title,
    required this.color,
    required this.calculators,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFF0A0A0A),
              const Color(0xFF1A1A2E),
              color.withOpacity(0.15),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(context),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: calculators.length,
                  itemBuilder: (context, index) {
                    return _buildCalculatorItem(
                      context,
                      calculators[index],
                      index,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: GoogleFonts.poppins(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn().slideY(begin: -0.2, end: 0);
  }

  Widget _buildCalculatorItem(BuildContext context, String name, int index) {
    return GestureDetector(
      onTap: () {
        Widget? calculatorScreen = _getCalculatorScreen(context, title, name);
        if (calculatorScreen != null) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => calculatorScreen),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('$name hesaplayıcısı açılıyor...')),
          );
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              color.withOpacity(0.3),
              color.withOpacity(0.1),
            ],
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: color.withOpacity(0.5),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  '${index + 1}',
                  style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                name,
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Colors.white.withOpacity(0.5),
              size: 20,
            ),
          ],
        ),
      ),
    )
        .animate()
        .fadeIn(delay: (index * 50).ms)
        .slideX(begin: 0.2, end: 0, delay: (index * 50).ms);
  }
}

// Helper function outside class
Widget? _getCalculatorScreen(BuildContext context, String category, String name) {
    // Finance Category
    if (category.contains('Finans')) {
      switch (name) {
        case 'Kredi': return CalculatorConfigurations.getLoanCalculator(context);
        case 'Yatırım': return CalculatorConfigurations.getInvestmentCalculator(context);
        case 'Faiz': return CalculatorConfigurations.getInterestCalculator(context);
        case 'Vergi': return CalculatorConfigurations.getTaxCalculator(context);
        case 'Emeklilik': return CalculatorConfigurations.getRetirementCalculator(context);
        case 'Döviz': return CalculatorConfigurations.getROICalculator(context);
      }
    }
    // Health Category
    else if (category.contains('Sağlık')) {
      switch (name) {
        case 'BMI': return CalculatorConfigurations.getBMICalculator(context);
        case 'Kalori': return CalculatorConfigurations.getCalorieCalculator(context);
        case 'Su İhtiyacı': return CalculatorConfigurations.getWaterIntakeCalculator(context);
        case 'İdeal Kilo': return CalculatorConfigurations.getIdealWeightCalculator(context);
        case 'Yağ Oranı': return CalculatorConfigurations.getBodyFatCalculator(context);
        case 'Hamilelik': return CalculatorConfigurations.getPregnancyCalculator(context);
        case 'İlaç Dozu': return CalculatorConfigurations.getMedicationCalculator(context);
      }
    }
    // Construction Category
    else if (category.contains('İnşaat')) {
      switch (name) {
        case 'Beton': return CalculatorConfigurations.getConcreteCalculator(context);
        case 'Tuğla': return CalculatorConfigurations.getBrickCalculator(context);
        case 'Boya': return CalculatorConfigurations.getPaintCalculator(context);
        case 'Demir': return CalculatorConfigurations.getRebarCalculator(context);
        case 'Maliyet': return CalculatorConfigurations.getCostCalculator(context);
        case 'Alan': return CalculatorConfigurations.getAreaCalculator(context);
      }
    }
    // Science Category
    else if (category.contains('Bilim')) {
      switch (name) {
        case 'Fizik': return CalculatorConfigurations.getPhysicsCalculator(context);
        case 'Kimya': return CalculatorConfigurations.getChemistryCalculator(context);
        case 'Elektrik': return CalculatorConfigurations.getElectricalCalculator(context);
        case 'Optik': return CalculatorConfigurations.getOpticsCalculator(context);
        case 'Mekanik': return CalculatorConfigurations.getMechanicsCalculator(context);
        case 'Termodinamik': return CalculatorConfigurations.getThermodynamicsCalculator(context);
        case 'Atom': return CalculatorConfigurations.getAtomicCalculator(context);
        case 'Dalga': return CalculatorConfigurations.getWaveCalculator(context);
      }
    }
    // Business Category
    else if (category.contains('İş')) {
      switch (name) {
        case 'Maaş': return CalculatorConfigurations.getSalaryCalculator(context);
        case 'Kar/Zarar': return CalculatorConfigurations.getProfitLossCalculator(context);
        case 'ROI': return CalculatorConfigurations.getBusinessROICalculator(context);
        case 'Çalışma Saati': return CalculatorConfigurations.getWorkingHoursCalculator(context);
        case 'Prim': return CalculatorConfigurations.getCommissionCalculator(context);
        case 'Fatura': return CalculatorConfigurations.getInvoiceCalculator(context);
      }
    }
    // Daily Category
    else if (category.contains('Günlük')) {
      switch (name) {
        case 'Alışveriş': return CalculatorConfigurations.getShoppingCalculator(context);
        case 'Bahşiş': return CalculatorConfigurations.getTipCalculator2(context);
        case 'Tarif': return CalculatorConfigurations.getRecipeCalculator(context);
        case 'Yakıt': return CalculatorConfigurations.getFuelCalculator(context);
        case 'Zaman': return CalculatorConfigurations.getTimeCalculator(context);
      }
    }
    // Education Category
    else if (category.contains('Eğitim')) {
      switch (name) {
        case 'Not Ortalaması': return CalculatorConfigurations.getGPACalculator(context);
        case 'Yüzdelik': return CalculatorConfigurations.getPercentageCalculator(context);
        case 'Geometri': return CalculatorConfigurations.getGeometryCalculator(context);
        case 'İstatistik': return CalculatorConfigurations.getStatisticsCalculator2(context);
        case 'Olasılık': return CalculatorConfigurations.getProbabilityCalculator(context);
      }
    }
    return null;
}