import 'package:speech_to_text/speech_to_text.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:permission_handler/permission_handler.dart';

/// 🎙️ Local Voice Service - Offline Speech Recognition & TTS
/// Sesli komut ve yanıt sistemi
class LocalVoiceService {
  static final LocalVoiceService _instance = LocalVoiceService._internal();
  factory LocalVoiceService() => _instance;
  LocalVoiceService._internal();

  final SpeechToText _speechToText = SpeechToText();
  final FlutterTts _flutterTts = FlutterTts();
  
  bool _isInitialized = false;
  bool _isListening = false;
  String _lastRecognizedText = '';
  double _confidenceLevel = 0.0;

  // Getters
  bool get isInitialized => _isInitialized;
  bool get isListening => _isListening;
  String get lastRecognizedText => _lastRecognizedText;
  double get confidenceLevel => _confidenceLevel;

  /// Servisi başlatır (izinler + setup)
  Future<bool> initialize() async {
    if (_isInitialized) return true;

    try {
      // Mikrofon izni kontrol et
      var status = await Permission.microphone.status;
      if (!status.isGranted) {
        status = await Permission.microphone.request();
        if (!status.isGranted) {
          print('❌ Microphone permission denied');
          return false;
        }
      }

      // Speech-to-Text başlat
      bool available = await _speechToText.initialize(
        onError: (error) => print('❌ STT Error: $error'),
        onStatus: (status) => print('🎙️ STT Status: $status'),
      );

      if (!available) {
        print('❌ Speech recognition not available');
        return false;
      }

      // Text-to-Speech ayarla
      await _configureTTS();

      _isInitialized = true;
      print('✅ Voice service initialized');
      return true;
    } catch (e) {
      print('❌ Voice service initialization error: $e');
      return false;
    }
  }

  /// TTS ayarlarını yapar
  Future<void> _configureTTS() async {
    await _flutterTts.setLanguage('tr-TR'); // Türkçe
    await _flutterTts.setSpeechRate(0.5); // Normal hız
    await _flutterTts.setVolume(1.0); // Maksimum ses
    await _flutterTts.setPitch(1.0); // Normal ton
    
    // iOS ayarları
    await _flutterTts.setSharedInstance(true);
    await _flutterTts.setIosAudioCategory(
      IosTextToSpeechAudioCategory.playback,
      [
        IosTextToSpeechAudioCategoryOptions.allowBluetooth,
        IosTextToSpeechAudioCategoryOptions.allowBluetoothA2DP,
        IosTextToSpeechAudioCategoryOptions.mixWithOthers,
      ],
      IosTextToSpeechAudioMode.voicePrompt,
    );
  }

  /// Dinlemeyi başlatır
  Future<bool> startListening({
    required Function(String) onResult,
    Function(String)? onPartialResult,
    Function()? onComplete,
  }) async {
    if (!_isInitialized) {
      bool initialized = await initialize();
      if (!initialized) return false;
    }

    if (_isListening) return false;

    try {
      _isListening = true;
      
      await _speechToText.listen(
        onResult: (result) {
          _lastRecognizedText = result.recognizedWords;
          _confidenceLevel = result.confidence;
          
          if (result.finalResult) {
            onResult(_lastRecognizedText);
            onComplete?.call();
          } else {
            onPartialResult?.call(_lastRecognizedText);
          }
        },
        listenFor: const Duration(seconds: 30),
        pauseFor: const Duration(seconds: 3),
        partialResults: true,
        localeId: 'tr_TR', // Türkçe
        cancelOnError: true,
        listenMode: ListenMode.confirmation,
      );

      return true;
    } catch (e) {
      print('❌ Start listening error: $e');
      _isListening = false;
      return false;
    }
  }

  /// Dinlemeyi durdurur
  Future<void> stopListening() async {
    if (!_isListening) return;

    try {
      await _speechToText.stop();
      _isListening = false;
    } catch (e) {
      print('❌ Stop listening error: $e');
    }
  }

  /// Dinlemeyi iptal eder
  Future<void> cancelListening() async {
    if (!_isListening) return;

    try {
      await _speechToText.cancel();
      _isListening = false;
      _lastRecognizedText = '';
      _confidenceLevel = 0.0;
    } catch (e) {
      print('❌ Cancel listening error: $e');
    }
  }

  /// Metni sesle okur (TTS)
  Future<bool> speak(String text, {double? rate, double? pitch}) async {
    try {
      if (rate != null) await _flutterTts.setSpeechRate(rate);
      if (pitch != null) await _flutterTts.setPitch(pitch);
      
      await _flutterTts.speak(text);
      return true;
    } catch (e) {
      print('❌ TTS speak error: $e');
      return false;
    }
  }

  /// Konuşmayı durdurur
  Future<void> stopSpeaking() async {
    try {
      await _flutterTts.stop();
    } catch (e) {
      print('❌ TTS stop error: $e');
    }
  }

  /// Duraklatır
  Future<void> pauseSpeaking() async {
    try {
      await _flutterTts.pause();
    } catch (e) {
      print('❌ TTS pause error: $e');
    }
  }

  /// Kullanılabilir dilleri listeler
  Future<List<dynamic>> getAvailableLanguages() async {
    try {
      return await _flutterTts.getLanguages;
    } catch (e) {
      print('❌ Get languages error: $e');
      return [];
    }
  }

  /// Kullanılabilir sesleri listeler
  Future<List<dynamic>> getAvailableVoices() async {
    try {
      return await _flutterTts.getVoices;
    } catch (e) {
      print('❌ Get voices error: $e');
      return [];
    }
  }

  /// Speech recognition kullanılabilir mi?
  Future<bool> get isAvailable async {
    return await _speechToText.initialize();
  }

  /// Desteklenen locales
  Future<List<LocaleName>> getLocales() async {
    try {
      return await _speechToText.locales();
    } catch (e) {
      print('❌ Get locales error: $e');
      return [];
    }
  }

  /// Servisi temizle
  Future<void> dispose() async {
    await stopListening();
    await stopSpeaking();
  }
}