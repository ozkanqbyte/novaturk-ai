import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../controllers/theme_controller.dart';
import '../../core/theme/app_colors.dart';
import '../../core/localization/tr_TR.dart';
import '../special_calculators/special_calculators_hub.dart';

/// 🔄 Dönüştürücüler & Özel Hesaplayıcılar Hub
class ConvertersHubScreen extends StatelessWidget {
  const ConvertersHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeController>(
      builder: (context, themeController, child) {
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
                    child: _buildContent(context),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShaderMask(
            shaderCallback: (bounds) => LinearGradient(
              colors: [AppColors.oceanBlue, AppColors.electricViolet],
            ).createShader(bounds),
            child: Text(
              '🔄 Dönüştürücüler & Hesaplayıcılar',
              style: GoogleFonts.poppins(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '7 Kategori • 40+ Özel Hesaplayıcı',
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    ).animate().fadeIn().slideY(begin: -0.2, end: 0);
  }

  Widget _buildContent(BuildContext context) {
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

    return GridView.builder(
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
    );
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
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: GoogleFonts.poppins(
                          fontSize: 12,
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