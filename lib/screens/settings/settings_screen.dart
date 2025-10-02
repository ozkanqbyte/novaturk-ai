import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import '../../controllers/theme_controller.dart';
import '../../controllers/premium_controller.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../core/localization/localization_service.dart';
import '../../widgets/premium_logo.dart';
import '../premium/premium_store_screen.dart';

/// ⚙️ Modern Settings & About Screen
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    return Consumer2<ThemeController, PremiumController>(
      builder: (context, theme, premium, child) {
        return Scaffold(
          body: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  const Color(0xFF0A0A0A),
                  const Color(0xFF1A1A2E),
                  AppColors.electricViolet.withOpacity(0.1),
                ],
              ),
            ),
            child: SafeArea(
              child: CustomScrollView(
                physics: const BouncingScrollPhysics(),
                slivers: [
                  _buildAppBar(context, theme),
                  SliverPadding(
                    padding: const EdgeInsets.all(20),
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        // App Info Card
                        _buildAppInfoCard(theme, premium),
                        const SizedBox(height: 16),
                        
                        // Language Section
                        _buildSectionTitle('🌍 Dil / Language', theme),
                        _buildLanguageSelector(context, theme),
                        const SizedBox(height: 24),
                        
                        // Features Section
                        _buildSectionTitle('✨ Özellikler', theme),
                        _buildFeaturesList(theme),
                        const SizedBox(height: 24),
                        
                        // Developer Section
                        _buildSectionTitle('👨‍💻 Geliştirici', theme),
                        _buildDeveloperCard(context, theme),
                        const SizedBox(height: 24),
                        
                        // Support Section
                        _buildSectionTitle('💬 İletişim', theme),
                        _buildSupportCard(context, theme),
                        const SizedBox(height: 24),
                        
                        // Rate & Share
                        _buildActionButtons(context, theme),
                        const SizedBox(height: 40),
                        
                        // Version Info
                        _buildVersionInfo(theme),
                        const SizedBox(height: 20),
                      ]),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildAppBar(BuildContext context, ThemeController theme) {
    return SliverAppBar(
      expandedHeight: 120,
      floating: false,
      pinned: true,
      backgroundColor: Colors.transparent,
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        title: Text(
          '⚙️ Ayarlar',
          style: GoogleFonts.inter(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            foreground: Paint()
              ..shader = LinearGradient(
                colors: AppColors.primaryGradient,
              ).createShader(const Rect.fromLTWH(0, 0, 200, 70)),
          ),
        ),
        centerTitle: false,
        titlePadding: const EdgeInsets.only(left: 20, bottom: 16),
      ),
    );
  }

  Widget _buildAppInfoCard(ThemeController theme, PremiumController premium) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: AppColors.primaryGradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.electricViolet.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: const Icon(
              Icons.calculate_rounded,
              size: 40,
              color: Color(0xFF6C5DD3),
            ),
          ),
          const SizedBox(height: 16),
          
          Text(
            AppConstants.appName,
            style: GoogleFonts.inter(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          
          if (premium.isPremiumActive)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.workspace_premium, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Premium Üye',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            )
          else
            Text(
              AppConstants.appDescription,
              style: GoogleFonts.inter(
                fontSize: 13,
                color: Colors.white.withOpacity(0.9),
                height: 1.5,
              ),
              textAlign: TextAlign.center,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.2, end: 0);
  }

  Widget _buildSectionTitle(String title, ThemeController theme) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _buildLanguageSelector(BuildContext context, ThemeController theme) {
    final localizationService = Provider.of<LocalizationService>(context);
    final currentLanguage = localizationService.currentLanguageCode;
    
    final languages = [
      {'code': 'tr', 'name': 'Türkçe', 'flag': '🇹🇷'},
      {'code': 'en', 'name': 'English', 'flag': '🇬🇧'},
      {'code': 'de', 'name': 'Deutsch', 'flag': '🇩🇪'},
      {'code': 'fr', 'name': 'Français', 'flag': '🇫🇷'},
      {'code': 'es', 'name': 'Español', 'flag': '🇪🇸'},
      {'code': 'it', 'name': 'Italiano', 'flag': '🇮🇹'},
      {'code': 'pt', 'name': 'Português', 'flag': '🇵🇹'},
      {'code': 'nl', 'name': 'Nederlands', 'flag': '🇳🇱'},
      {'code': 'pl', 'name': 'Polski', 'flag': '🇵🇱'},
      {'code': 'el', 'name': 'Ελληνικά', 'flag': '🇬🇷'},
      {'code': 'hi', 'name': 'हिन्दी (Hindi)', 'flag': '🇮🇳'},
      {'code': 'id', 'name': 'Bahasa Indonesia', 'flag': '🇮🇩'},
      {'code': 'ms', 'name': 'Bahasa Melayu', 'flag': '🇲🇾'},
      {'code': 'ja', 'name': '日本語 (Japanese)', 'flag': '🇯🇵'},
      {'code': 'ru', 'name': 'Русский (Russian)', 'flag': '🇷🇺'},
      {'code': 'ar', 'name': 'العربية (Arabic)', 'flag': '🇸🇦'},
    ];
    
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        children: languages.asMap().entries.map((entry) {
          final index = entry.key;
          final lang = entry.value;
          final isSelected = currentLanguage == lang['code'];
          
          return Column(
            children: [
              if (index > 0) Divider(color: Colors.white.withOpacity(0.1), height: 1),
              InkWell(
                onTap: () async {
                  await localizationService.changeLanguage(lang['code']!);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          '${lang['flag']} Dil değiştirildi: ${lang['name']}',
                          style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                        ),
                        backgroundColor: AppColors.electricViolet,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  child: Row(
                    children: [
                      // Flag
                      Text(
                        lang['flag']!,
                        style: const TextStyle(fontSize: 28),
                      ),
                      const SizedBox(width: 16),
                      
                      // Language Name
                      Expanded(
                        child: Text(
                          lang['name']!,
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                            color: isSelected ? AppColors.electricViolet : Colors.white,
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1,
                        ),
                      ),
                      
                      // Selected Indicator
                      if (isSelected)
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.electricViolet.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.check,
                            color: AppColors.electricViolet,
                            size: 20,
                          ),
                        )
                      else
                        Icon(
                          Icons.chevron_right,
                          color: Colors.white.withOpacity(0.3),
                          size: 24,
                        ),
                    ],
                  ),
                ),
              ),
            ],
          );
        }).toList(),
      ),
    ).animate().fadeIn(duration: 300.ms).slideX(begin: 0.1, end: 0);
  }

  Widget _buildFeaturesList(ThemeController theme) {
    final features = [
      {'icon': Icons.calculate_rounded, 'title': 'Temel & Bilimsel Hesap Makinesi'},
      {'icon': Icons.library_books_rounded, 'title': '40+ Özel Hesaplayıcı'},
      {'icon': Icons.swap_horiz_rounded, 'title': 'Birim Dönüştürücüler'},
      {'icon': Icons.mic_rounded, 'title': 'Sesli Komut Tanıma'},
      {'icon': Icons.camera_alt_rounded, 'title': 'OCR - Fotoğraftan Matematik'},
      {'icon': Icons.gesture_rounded, 'title': 'El Yazısı Tanıma'},
      {'icon': Icons.history_rounded, 'title': 'Akıllı Geçmiş Sistemi'},
      {'icon': Icons.smart_toy_rounded, 'title': 'Yapay Zeka Asistanı'},
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        children: features.asMap().entries.map((entry) {
          final index = entry.key;
          final feature = entry.value;
          return Column(
            children: [
              if (index > 0) Divider(color: Colors.white.withOpacity(0.1), height: 1),
              ListTile(
                leading: Icon(
                  feature['icon'] as IconData,
                  color: AppColors.electricViolet,
                ),
                title: Text(
                  feature['title'] as String,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                  ),
                ),
                trailing: const Icon(
                  Icons.check_circle,
                  color: Color(0xFF4CAF50),
                  size: 20,
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildDeveloperCard(BuildContext context, ThemeController theme) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.electricViolet.withOpacity(0.1),
            AppColors.neonPink.withOpacity(0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.electricViolet.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          CircleAvatar(
            radius: 40,
            backgroundColor: AppColors.electricViolet.withOpacity(0.2),
            child: Text(
              'ÖA',
              style: GoogleFonts.inter(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: AppColors.electricViolet,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            AppConstants.developerName,
            style: GoogleFonts.inter(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            AppConstants.companyName,
            style: GoogleFonts.inter(
              fontSize: 14,
              color: AppColors.electricViolet,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Mobile App Developer & AI Enthusiast',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: Colors.white.withOpacity(0.6),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _launchEmail(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.electricViolet,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  icon: const Icon(Icons.email_rounded, size: 18),
                  label: Text(
                    'Email',
                    style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _launchGitHub(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black87,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  icon: const Icon(Icons.code_rounded, size: 18),
                  label: Text(
                    'GitHub',
                    style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSupportCard(BuildContext context, ThemeController theme) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          _buildListTile(
            icon: Icons.email_rounded,
            title: 'E-posta',
            subtitle: AppConstants.supportEmail,
            onTap: () => _launchEmail(),
          ),
          Divider(color: Colors.white.withOpacity(0.1), height: 1),
          _buildListTile(
            icon: Icons.code_rounded,
            title: 'GitHub',
            subtitle: 'Kaynak kodları ve dökümantasyon',
            onTap: () => _launchGitHub(),
          ),
          Divider(color: Colors.white.withOpacity(0.1), height: 1),
          _buildListTile(
            icon: Icons.privacy_tip_rounded,
            title: 'Gizlilik Politikası',
            subtitle: 'Verileriniz nasıl korunuyor?',
            onTap: () => _launchURL(AppConstants.privacyUrl),
          ),
          Divider(color: Colors.white.withOpacity(0.1), height: 1),
          _buildListTile(
            icon: Icons.description_rounded,
            title: 'Kullanım Koşulları',
            subtitle: 'Şartlar ve koşullar',
            onTap: () => _launchURL(AppConstants.termsUrl),
          ),
          Divider(color: Colors.white.withOpacity(0.1), height: 1),
          _buildListTile(
            icon: Icons.bug_report_rounded,
            title: 'Hata Bildir',
            subtitle: 'Sorun mu yaşıyorsunuz?',
            onTap: () => _launchEmail(subject: 'Hata Bildirimi'),
          ),
          Divider(color: Colors.white.withOpacity(0.1), height: 1),
          _buildListTile(
            icon: Icons.lightbulb_rounded,
            title: 'Öneri Gönder',
            subtitle: 'Fikirlerinizi paylaşın',
            onTap: () => _launchEmail(subject: 'Öneri'),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, ThemeController theme) {
    return Row(
      children: [
        Expanded(
          child: _buildActionButton(
            icon: Icons.star_rounded,
            label: 'Puan Ver',
            color: AppColors.goldenYellow,
            onTap: () => _launchURL(AppConstants.websiteUrl),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildActionButton(
            icon: Icons.share_rounded,
            label: 'Paylaş',
            color: AppColors.oceanBlue,
            onTap: () => _shareApp(),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [color.withOpacity(0.2), color.withOpacity(0.1)],
          ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVersionInfo(ThemeController theme) {
    return Column(
      children: [
        Text(
          AppConstants.appName,
          style: GoogleFonts.inter(
            fontSize: 14,
            color: Colors.white.withOpacity(0.4),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Versiyon ${AppConstants.appVersion}',
          style: GoogleFonts.inter(
            fontSize: 12,
            color: Colors.white.withOpacity(0.3),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '© 2024 ${AppConstants.developerName}',
          style: GoogleFonts.inter(
            fontSize: 11,
            color: Colors.white.withOpacity(0.3),
          ),
        ),
      ],
    );
  }

  Widget _buildListTile({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.electricViolet),
      title: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: Colors.white,
        ),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: Colors.white.withOpacity(0.6),
              ),
            )
          : null,
      trailing: const Icon(
        Icons.arrow_forward_ios,
        color: Colors.white54,
        size: 16,
      ),
      onTap: onTap,
    );
  }

  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Bağlantı açılamadı: $url'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _launchEmail({String? subject}) async {
    final emailUri = Uri(
      scheme: 'mailto',
      path: AppConstants.supportEmail,
      query: subject != null ? 'subject=$subject' : null,
    );
    
    if (await canLaunchUrl(emailUri)) {
      await launchUrl(emailUri);
    } else {
      // Fallback: Copy email to clipboard
      await Clipboard.setData(const ClipboardData(text: AppConstants.supportEmail));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('E-posta adresi panoya kopyalandı'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  Future<void> _launchGitHub() async {
    final url = Uri.parse(AppConstants.githubUrl);
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      // Fallback: Copy URL to clipboard
      await Clipboard.setData(const ClipboardData(text: AppConstants.githubUrl));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('GitHub linki panoya kopyalandı'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  Future<void> _shareApp() async {
    await Share.share(
      '${AppConstants.appName} uygulamasını keşfet! Yapay zeka destekli, modern hesap makinesi.\n\n${AppConstants.websiteUrl}',
      subject: AppConstants.appName,
    );
  }
}