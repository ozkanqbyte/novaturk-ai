import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../services/admob_service.dart';

/// 📺 AdMob Test Ekranı
/// Tüm reklam tiplerini test etmek için
class AdMobTestScreen extends StatefulWidget {
  const AdMobTestScreen({Key? key}) : super(key: key);

  @override
  State<AdMobTestScreen> createState() => _AdMobTestScreenState();
}

class _AdMobTestScreenState extends State<AdMobTestScreen> {
  final AdMobService _adMobService = AdMobService();
  
  String _statusMessage = 'AdMob hazır ✅';
  bool _isRewardEarned = false;

  @override
  void initState() {
    super.initState();
    _checkAdStatus();
  }

  void _checkAdStatus() {
    setState(() {
      _statusMessage = 'Banner: ${_adMobService.isBannerAdLoaded ? "✅" : "❌"}\n'
          'Interstitial: ${_adMobService.isInterstitialAdLoaded ? "✅" : "❌"}\n'
          'Rewarded: ${_adMobService.isRewardedAdLoaded ? "✅" : "❌"}';
    });
  }

  Future<void> _showInterstitial() async {
    setState(() => _statusMessage = 'Interstitial gösteriliyor...');
    await _adMobService.showInterstitialAd();
    _checkAdStatus();
  }

  Future<void> _showRewarded() async {
    setState(() {
      _statusMessage = 'Rewarded gösteriliyor...';
      _isRewardEarned = false;
    });

    bool success = await _adMobService.showRewardedAd(
      onRewarded: () {
        setState(() {
          _isRewardEarned = true;
          _statusMessage = '🎁 Ödül Kazanıldı! ✅';
        });
      },
    );

    if (!success) {
      setState(() => _statusMessage = 'Rewarded ad gösterilemedi ❌');
    }
    
    _checkAdStatus();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('📺 AdMob Test'),
        backgroundColor: Colors.deepPurple,
      ),
      body: Column(
        children: [
          // Status Panel
          Container(
            width: double.infinity,
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.deepPurple.shade50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.deepPurple, width: 2),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '📊 Reklam Durumu',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.deepPurple,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  _statusMessage,
                  style: const TextStyle(fontSize: 16, height: 1.5),
                ),
                if (_isRewardEarned) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.green.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.stars, color: Colors.green),
                        SizedBox(width: 8),
                        Text(
                          'Ödül Kazanıldı! 🎉',
                          style: TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Test Buttons
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildTestCard(
                  icon: Icons.panorama,
                  title: '1. Banner Ad',
                  description: 'Alt kısımda görünüyor',
                  color: Colors.blue,
                  status: _adMobService.isBannerAdLoaded,
                  onPressed: null, // Banner zaten gösteriliyor
                ),
                const SizedBox(height: 16),
                _buildTestCard(
                  icon: Icons.fullscreen,
                  title: '2. Interstitial Ad',
                  description: 'Tam ekran reklam\n(Her 3 işlemde 1 + 2 dk bekleme)',
                  color: Colors.orange,
                  status: _adMobService.isInterstitialAdLoaded,
                  onPressed: _showInterstitial,
                ),
                const SizedBox(height: 16),
                _buildTestCard(
                  icon: Icons.card_giftcard,
                  title: '3. Rewarded Ad',
                  description: 'Ödül kazandıran reklam\n(Video izleyip ödül kazan)',
                  color: Colors.green,
                  status: _adMobService.isRewardedAdLoaded,
                  onPressed: _showRewarded,
                ),
              ],
            ),
          ),

          // Banner Ad Widget
          if (_adMobService.isBannerAdLoaded)
            Container(
              color: Colors.grey.shade200,
              height: 60,
              child: Center(
                child: SizedBox(
                  height: 50,
                  child: AdWidget(ad: _adMobService.getBannerAd()!),
                ),
              ),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _checkAdStatus,
        backgroundColor: Colors.deepPurple,
        child: const Icon(Icons.refresh),
      ),
    );
  }

  Widget _buildTestCard({
    required IconData icon,
    required String title,
    required String description,
    required Color color,
    required bool status,
    required VoidCallback? onPressed,
  }) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color, size: 32),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: color,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        description,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.shade600,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: status ? Colors.green.shade100 : Colors.red.shade100,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    status ? Icons.check : Icons.close,
                    color: status ? Colors.green : Colors.red,
                    size: 20,
                  ),
                ),
              ],
            ),
            if (onPressed != null) ...[
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: status ? onPressed : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: color,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    status ? 'TEST ET' : 'YÜKLEME BEKLENİYOR...',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}