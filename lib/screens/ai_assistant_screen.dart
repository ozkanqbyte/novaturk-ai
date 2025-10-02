import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../controllers/ai_controller.dart';
import '../controllers/calculator_controller.dart';
import '../core/theme/app_colors.dart';

/// 🤖 AI Assistant Screen
/// All AI-powered features in one place
class AIAssistantScreen extends StatefulWidget {
  const AIAssistantScreen({super.key});

  @override
  State<AIAssistantScreen> createState() => _AIAssistantScreenState();
}

class _AIAssistantScreenState extends State<AIAssistantScreen> {
  int _selectedFeature = 0;

  @override
  Widget build(BuildContext context) {
    final aiController = Provider.of<AIController>(context);
    final calcController = Provider.of<CalculatorController>(context);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFF0A0A0A),
              const Color(0xFF1A1A2E),
              AppColors.oceanBlue.withOpacity(0.2),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(context),
              _buildFeatureTabs(),
              Expanded(
                child: _buildFeatureContent(aiController, calcController),
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
                Text(
                  'AI Asistan',
                  style: GoogleFonts.poppins(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'Yapay Zeka Destekli Özellikler',
                  style: GoogleFonts.poppins(
                    fontSize: 12,
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
                colors: [AppColors.oceanBlue, AppColors.royalPurple],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Colors.greenAccent,
                    shape: BoxShape.circle,
                  ),
                )
                    .animate(onPlay: (controller) => controller.repeat())
                    .fade(duration: const Duration(milliseconds: 1000)),
                const SizedBox(width: 6),
                Text(
                  'ACTIVE',
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureTabs() {
    final features = [
      {'icon': Icons.mic, 'title': 'Sesli', 'color': AppColors.oceanBlue},
      {'icon': Icons.camera_alt, 'title': 'Fotoğraf', 'color': AppColors.royalPurple},
      {'icon': Icons.draw, 'title': 'El Yazısı', 'color': AppColors.electricViolet},
      {'icon': Icons.chat_bubble, 'title': 'Sohbet', 'color': AppColors.neonPink},
      {'icon': Icons.list_alt, 'title': 'Çözüm', 'color': AppColors.sunsetOrange},
    ];

    return Container(
      height: 100,
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: features.length,
        itemBuilder: (context, index) {
          final feature = features[index];
          final isSelected = _selectedFeature == index;

          return GestureDetector(
            onTap: () => setState(() => _selectedFeature = index),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                gradient: isSelected
                    ? LinearGradient(
                        colors: [
                          feature['color'] as Color,
                          (feature['color'] as Color).withOpacity(0.6),
                        ],
                      )
                    : null,
                color: isSelected ? null : Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected
                      ? Colors.white.withOpacity(0.3)
                      : Colors.white.withOpacity(0.1),
                  width: isSelected ? 2 : 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: (feature['color'] as Color).withOpacity(0.5),
                          blurRadius: 15,
                          spreadRadius: 2,
                        ),
                      ]
                    : null,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    feature['icon'] as IconData,
                    color: Colors.white,
                    size: isSelected ? 28 : 24,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    feature['title'] as String,
                    style: GoogleFonts.poppins(
                      fontSize: isSelected ? 12 : 11,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          )
              .animate(target: isSelected ? 1 : 0)
              .scale(duration: const Duration(milliseconds: 300));
        },
      ),
    );
  }

  Widget _buildFeatureContent(AIController aiController, CalculatorController calcController) {
    switch (_selectedFeature) {
      case 0:
        return _buildVoiceAssistant(aiController, calcController);
      case 1:
        return _buildPhotoSolve(aiController, calcController);
      case 2:
        return _buildHandwriting(aiController, calcController);
      case 3:
        return _buildChat(aiController, calcController);
      case 4:
        return _buildStepByStep(aiController, calcController);
      default:
        return _buildVoiceAssistant(aiController, calcController);
    }
  }

  // 🎙️ Voice Assistant
  Widget _buildVoiceAssistant(AIController aiController, CalculatorController calcController) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Voice Animation
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.oceanBlue.withOpacity(0.3),
                  AppColors.oceanBlue.withOpacity(0.1),
                  Colors.transparent,
                ],
              ),
            ),
            child: Center(
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [AppColors.oceanBlue, AppColors.royalPurple],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.oceanBlue.withOpacity(0.5),
                      blurRadius: 30,
                      spreadRadius: 10,
                    ),
                  ],
                ),
                child: Icon(
                  aiController.isListening ? Icons.mic : Icons.mic_none,
                  size: 60,
                  color: Colors.white,
                ),
              )
                  .animate(
                    onPlay: (controller) =>
                        aiController.isListening ? controller.repeat() : null,
                  )
                  .scale(
                    duration: const Duration(milliseconds: 1000),
                    begin: const Offset(1, 1),
                    end: const Offset(1.2, 1.2),
                  ),
            ),
          )
              .animate(
                onPlay: (controller) =>
                    aiController.isListening ? controller.repeat() : null,
              )
              .shimmer(
                duration: const Duration(milliseconds: 2000),
                color: AppColors.oceanBlue.withOpacity(0.3),
              ),

          const SizedBox(height: 30),

          // Voice Input Display
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: Colors.white.withOpacity(0.1),
              ),
            ),
            child: Column(
              children: [
                Text(
                  aiController.isListening ? 'Dinliyorum...' : 'Mikrofon Hazır',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  aiController.voiceInput.isEmpty
                      ? 'Bir matematik sorusu sorun'
                      : aiController.voiceInput,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 30),

          // Voice Control Button
          ElevatedButton(
            onPressed: () {
              if (aiController.isListening) {
                aiController.stopListening();
              } else {
                aiController.startListening();
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: aiController.isListening
                  ? AppColors.coralRed
                  : AppColors.oceanBlue,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
              elevation: 10,
              shadowColor: (aiController.isListening
                      ? AppColors.coralRed
                      : AppColors.oceanBlue)
                  .withOpacity(0.5),
            ),
            child: Text(
              aiController.isListening ? 'Durdur' : 'Konuşmaya Başla',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),

          const SizedBox(height: 30),

          // Quick Commands
          _buildQuickCommands(),
        ],
      ),
    );
  }

  Widget _buildQuickCommands() {
    final commands = [
      '2 artı 2 kaç eder?',
      '15 çarpı 8',
      'Karekök 144',
      'Pi çarpı 10',
      '5 üzeri 3',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Örnek Komutlar:',
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.white70,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: commands
              .map(
                (cmd) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: AppColors.oceanBlue.withOpacity(0.3),
                    ),
                  ),
                  child: Text(
                    cmd,
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      color: Colors.white60,
                    ),
                  ),
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  // 📸 Photo Solve
  Widget _buildPhotoSolve(AIController aiController, CalculatorController calcController) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Camera Icon
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.royalPurple.withOpacity(0.3),
                  AppColors.royalPurple.withOpacity(0.1),
                  Colors.transparent,
                ],
              ),
            ),
            child: Center(
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [AppColors.royalPurple, AppColors.electricViolet],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.royalPurple.withOpacity(0.5),
                      blurRadius: 30,
                      spreadRadius: 10,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.camera_alt,
                  size: 60,
                  color: Colors.white,
                ),
              ),
            ),
          ),

          const SizedBox(height: 30),

          Text(
            'Fotoğrafla Çöz',
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),

          const SizedBox(height: 12),

          Text(
            'Matematik problemini fotoğrafla,\nAI anlık olarak çözsün',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: Colors.white70,
            ),
          ),

          const SizedBox(height: 40),

          // Camera Button
          ElevatedButton.icon(
            onPressed: () async {
              await aiController.captureAndProcessImage();
            },
            icon: const Icon(Icons.camera_alt),
            label: Text(
              'Kamera Aç',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.royalPurple,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
              elevation: 10,
            ),
          ),

          const SizedBox(height: 16),

          // Gallery Button
          OutlinedButton.icon(
            onPressed: () async {
              await aiController.pickAndProcessImage();
            },
            icon: const Icon(Icons.photo_library),
            label: Text(
              'Galeriden Seç',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              side: BorderSide(color: AppColors.royalPurple, width: 2),
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
            ),
          ),

          const SizedBox(height: 30),

          // AI Response
          if (aiController.aiResponse.isNotEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.royalPurple.withOpacity(0.3),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.auto_awesome, color: AppColors.royalPurple, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'AI Çözümü:',
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    aiController.aiResponse,
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  // ✍️ Handwriting Recognition
  Widget _buildHandwriting(AIController aiController, CalculatorController calcController) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.draw,
            size: 100,
            color: AppColors.electricViolet.withOpacity(0.5),
          ),
          const SizedBox(height: 20),
          Text(
            'El Yazısı Tanıma',
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Yakında Eklenecek!',
            style: GoogleFonts.poppins(
              fontSize: 16,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  // 💬 Chat
  Widget _buildChat(AIController aiController, CalculatorController calcController) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.chat_bubble,
            size: 100,
            color: AppColors.neonPink.withOpacity(0.5),
          ),
          const SizedBox(height: 20),
          Text(
            'AI Sohbet',
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Yakında Eklenecek!',
            style: GoogleFonts.poppins(
              fontSize: 16,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  // 📋 Step by Step Solutions
  Widget _buildStepByStep(AIController aiController, CalculatorController calcController) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.list_alt,
            size: 100,
            color: AppColors.sunsetOrange.withOpacity(0.5),
          ),
          const SizedBox(height: 20),
          Text(
            'Adım Adım Çözüm',
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Yakında Eklenecek!',
            style: GoogleFonts.poppins(
              fontSize: 16,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }
}