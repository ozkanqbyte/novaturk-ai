import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/ai_controller.dart';
import '../controllers/calculator_controller.dart';
import '../controllers/theme_controller.dart';

class UltraPremiumAIWidgets {
  
  // 🤖 CONVERSATIONAL AI CHAT
  static Widget buildConversationalAI(AIController aiController, CalculatorController calcController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            themeController.primaryColor.withOpacity(0.1),
            themeController.secondaryColor.withOpacity(0.15),
            themeController.accentColor.withOpacity(0.1),
          ],
          stops: const [0.0, 0.5, 1.0],
        ),
        borderRadius: BorderRadius.circular(25),
        border: Border.all(
          color: themeController.primaryColor.withOpacity(0.3),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: themeController.primaryColor.withOpacity(0.2),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with AI Status
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [themeController.primaryColor, themeController.secondaryColor],
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Icon(
                  Icons.psychology_rounded,
                  color: Colors.white,
                  size: 24,
                ).animate(onPlay: (controller) => controller.repeat())
                 .shimmer(duration: 2000.ms),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '🤖 AI Matematik Öğretmeni',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: themeController.primaryTextColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      aiController.conversationMode 
                          ? '💬 Aktif sohbet • ${aiController.mathConversation.length} mesaj'
                          : 'Doğal dilde matematik sorularını sor',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: themeController.secondaryTextColor,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ),
              // Conversation Toggle
              GestureDetector(
                onTap: () => aiController.conversationMode 
                    ? null 
                    : aiController.startMathConversation(),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: aiController.conversationMode 
                        ? themeController.successColor.withOpacity(0.2)
                        : themeController.primaryColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: aiController.conversationMode 
                          ? themeController.successColor
                          : themeController.primaryColor,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: aiController.conversationMode 
                              ? themeController.successColor
                              : themeController.primaryColor,
                          shape: BoxShape.circle,
                        ),
                      ).animate(onPlay: (controller) => aiController.conversationMode ? controller.repeat() : null)
                       .fade(duration: 1000.ms),
                      const SizedBox(width: 6),
                      Text(
                        aiController.conversationMode ? 'LIVE' : 'START',
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: aiController.conversationMode 
                              ? themeController.successColor
                              : themeController.primaryColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Conversation Display Area
          if (aiController.conversationMode && aiController.mathConversation.isNotEmpty) ...[
            Container(
              height: 200,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.withOpacity(0.2)),
              ),
              child: ListView.builder(
                itemCount: aiController.mathConversation.length,
                itemBuilder: (context, index) {
                  final message = aiController.mathConversation[index];
                  final isUser = message['role'] == 'user';
                  
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: isUser ? themeController.accentColor : themeController.primaryColor,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Icon(
                            isUser ? Icons.person : Icons.auto_awesome,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isUser ? 'Sen' : 'AI Öğretmen',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: isUser ? themeController.accentColor : themeController.primaryColor,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: isUser 
                                      ? themeController.accentColor.withOpacity(0.1)
                                      : themeController.primaryColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  message['message'] ?? '',
                                  style: GoogleFonts.poppins(
                                    fontSize: 12,
                                    color: themeController.primaryTextColor,
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn().slideX(begin: isUser ? 0.3 : -0.3, end: 0);
                },
              ),
            ),
            const SizedBox(height: 16),
          ],
          
          // Quick AI Prompts
          Text(
            aiController.conversationMode ? 'Hızlı Sorular:' : 'AI ile Konuşmaya Başla:',
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: themeController.primaryTextColor,
            ),
          ),
          
          const SizedBox(height: 12),
          
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildAIPromptChip('Kareköklerin nasıl çalıştığını açıkla', Icons.help_outline, aiController, themeController),
              _buildAIPromptChip('2x + 5 = 15 denklemini çöz', Icons.calculate, aiController, themeController),
              _buildAIPromptChip('Pi sayısı nedir?', Icons.info_outline, aiController, themeController),
              _buildAIPromptChip('Trigonometri nedir?', Icons.school, aiController, themeController),
              _buildAIPromptChip('Zorluk seviyemi artır', Icons.trending_up, aiController, themeController),
              _buildAIPromptChip('Adım adım açıkla', Icons.list_alt, aiController, themeController),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 300)).slideY(begin: 0.3, end: 0);
  }

  static Widget _buildAIPromptChip(String text, IconData icon, AIController aiController, ThemeController themeController) {
    return GestureDetector(
      onTap: () => aiController.processMathConversation(text),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              themeController.primaryColor.withOpacity(0.1),
              themeController.secondaryColor.withOpacity(0.1),
            ],
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: themeController.primaryColor.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: themeController.primaryColor),
            const SizedBox(width: 6),
            Text(
              text,
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: themeController.primaryTextColor,
              ),
            ),
          ],
        ),
      ).animate().scale(
        duration: 200.ms,
        curve: Curves.easeInOut,
      ),
    );
  }

  // 🔮 PREDICTIVE AI
  static Widget buildPredictiveAI(AIController aiController, CalculatorController calcController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            themeController.secondaryColor.withOpacity(0.1),
            themeController.accentColor.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: themeController.secondaryColor.withOpacity(0.3),
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [themeController.secondaryColor, themeController.accentColor],
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  Icons.auto_fix_high,
                  color: Colors.white,
                  size: 20,
                ).animate(onPlay: (controller) => controller.repeat())
                 .rotate(duration: 3000.ms),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '🔮 Predictive AI',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: themeController.primaryTextColor,
                      ),
                    ),
                    Text(
                      'Bir sonraki işlemini tahmin eder',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: themeController.secondaryTextColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Prediction Display
          if (aiController.predictedExpressions.isNotEmpty) ...[
            Text(
              'Tahminler:',
              style: GoogleFonts.poppins(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: themeController.primaryTextColor,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: aiController.predictedExpressions.take(6).map((prediction) => 
                GestureDetector(
                  onTap: () {
                    calcController.addToExpression(prediction);
                    HapticFeedback.lightImpact();
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: themeController.secondaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: themeController.secondaryColor.withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.bolt, size: 12, color: themeController.secondaryColor),
                        const SizedBox(width: 4),
                        Text(
                          prediction,
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: themeController.primaryTextColor,
                          ),
                        ),
                      ],
                    ),
                  ).animate().scale(
                    duration: 200.ms,
                    curve: Curves.easeInOut,
                  ),
                ),
              ).toList(),
            ),
          ] else ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Icon(
                    Icons.psychology_outlined,
                    color: Colors.grey[600],
                    size: 32,
                  ).animate(onPlay: (controller) => controller.repeat())
                   .scale(duration: 2000.ms, begin: const Offset(0.8, 0.8), end: const Offset(1.2, 1.2)),
                  const SizedBox(height: 8),
                  Text(
                    'Yazmaya başla, AI tahminlerini göreceksin',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: Colors.grey[600],
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 400)).slideX(begin: -0.3, end: 0);
  }

  // 👋 GESTURE RECOGNITION
  static Widget buildGestureRecognition(AIController aiController, CalculatorController calcController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.purple.withOpacity(0.1),
            Colors.pink.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: aiController.gestureEnabled 
              ? Colors.purple.withOpacity(0.5)
              : Colors.grey.withOpacity(0.3),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: aiController.gestureEnabled 
                ? Colors.purple.withOpacity(0.3)
                : Colors.grey.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.purple, Colors.pink],
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Icon(
                  Icons.gesture,
                  color: Colors.white,
                  size: 24,
                ).animate(
                  onPlay: (controller) => aiController.gestureEnabled ? controller.repeat() : null,
                ).rotate(duration: 2000.ms),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '👋 Gesture AI',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: themeController.primaryTextColor,
                      ),
                    ),
                    Text(
                      aiController.gestureEnabled 
                          ? 'Havada matematik yaz! ✨'
                          : 'Parmağınla havada sembol çiz',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: themeController.secondaryTextColor,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ),
              // Gesture Toggle Switch
              GestureDetector(
                onTap: () {
                  if (aiController.gestureEnabled) {
                    aiController.stopGestureRecognition();
                  } else {
                    aiController.startGestureRecognition();
                  }
                },
                child: Container(
                  width: 60,
                  height: 30,
                  decoration: BoxDecoration(
                    color: aiController.gestureEnabled ? Colors.purple : Colors.grey,
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: AnimatedAlign(
                    alignment: aiController.gestureEnabled 
                        ? Alignment.centerRight 
                        : Alignment.centerLeft,
                    duration: const Duration(milliseconds: 300),
                    child: Container(
                      width: 26,
                      height: 26,
                      margin: const EdgeInsets.all(2),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        aiController.gestureEnabled ? Icons.check : Icons.close,
                        size: 16,
                        color: aiController.gestureEnabled ? Colors.purple : Colors.grey,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Gesture Recognition Area
          if (aiController.gestureEnabled) ...[
            Container(
              height: 120,
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.purple.withOpacity(0.1),
                    Colors.pink.withOpacity(0.1),
                  ],
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: Colors.purple.withOpacity(0.3),
                  style: BorderStyle.solid,
                  width: 2,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.touch_app,
                    size: 40,
                    color: Colors.purple,
                  ).animate(onPlay: (controller) => controller.repeat())
                   .scale(duration: 1500.ms, begin: const Offset(0.9, 0.9), end: const Offset(1.1, 1.1)),
                  const SizedBox(height: 8),
                  Text(
                    'Burada parmağınla çiz',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.purple,
                    ),
                  ),
                  if (aiController.gestureInput.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.purple.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        'Tanındı: ${aiController.gestureInput}',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.purple,
                        ),
                      ),
                    ).animate().fadeIn().scale(),
                  ],
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Gesture Quick Commands
            Text(
              'Çizilebilir Semboller:',
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: themeController.primaryTextColor,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                _buildGestureSymbolChip('+', 'artı'),
                _buildGestureSymbolChip('−', 'eksi'),
                _buildGestureSymbolChip('×', 'çarpı'),
                _buildGestureSymbolChip('÷', 'bölü'),
                _buildGestureSymbolChip('=', 'eşit'),
                _buildGestureSymbolChip('√', 'kök'),
                _buildGestureSymbolChip('²', 'kare'),
                _buildGestureSymbolChip('π', 'pi'),
              ],
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.grey.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Icon(
                    Icons.pan_tool_outlined,
                    size: 48,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Gesture Recognition Kapalı',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[700],
                    ),
                  ),
                  Text(
                    'Açmak için yukarıdaki switch\'e dokun',
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 500)).slideY(begin: 0.3, end: 0);
  }

  static Widget _buildGestureSymbolChip(String symbol, String name) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.purple.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.purple.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            symbol,
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.purple,
            ),
          ),
          Text(
            name,
            style: GoogleFonts.poppins(
              fontSize: 8,
              color: Colors.purple,
            ),
          ),
        ],
      ),
    );
  }

  // 🌍 MULTI-LANGUAGE SUPPORT
  static Widget buildMultiLanguageSupport(AIController aiController, ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.blue.withOpacity(0.1),
            Colors.cyan.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.blue.withOpacity(0.3),
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.blue, Colors.cyan],
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  Icons.language,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '🌍 Multi-Language AI',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: themeController.primaryTextColor,
                      ),
                    ),
                    Text(
                      'Şu an: ${aiController.supportedLanguages[aiController.currentLanguage] ?? 'Unknown'}',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: themeController.secondaryTextColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          Text(
            'Desteklenen Diller:',
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: themeController.primaryTextColor,
            ),
          ),
          
          const SizedBox(height: 12),
          
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: aiController.supportedLanguages.entries.map((entry) {
              final isSelected = entry.key == aiController.currentLanguage;
              return GestureDetector(
                onTap: () => aiController.changeLanguage(entry.key),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: isSelected ? LinearGradient(
                      colors: [Colors.blue, Colors.cyan],
                    ) : null,
                    color: !isSelected ? Colors.blue.withOpacity(0.1) : null,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? Colors.transparent : Colors.blue.withOpacity(0.3),
                    ),
                  ),
                  child: Text(
                    '${_getLanguageFlag(entry.key)} ${entry.value}',
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: isSelected ? Colors.white : Colors.blue,
                    ),
                  ),
                ),
              ).animate().scale(
                duration: 200.ms,
                curve: Curves.easeInOut,
              );
            }).toList(),
          ),
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 600));
  }

  static String _getLanguageFlag(String langCode) {
    final flags = {
      'en-US': '🇺🇸',
      'tr-TR': '🇹🇷', 
      'es-ES': '🇪🇸',
      'fr-FR': '🇫🇷',
      'de-DE': '🇩🇪',
      'it-IT': '🇮🇹',
      'pt-PT': '🇵🇹',
      'ru-RU': '🇷🇺',
      'zh-CN': '🇨🇳',
      'ja-JP': '🇯🇵',
      'ko-KR': '🇰🇷',
      'ar-SA': '🇸🇦',
    };
    return flags[langCode] ?? '🌐';
  }
}