import 'dart:ui' as ui;
import 'package:google_mlkit_digital_ink_recognition/google_mlkit_digital_ink_recognition.dart';

/// ✍️ Handwriting Recognition Service - Offline Digital Ink Recognition
/// El yazısını tanır ve matematik ifadesine çevirir
class HandwritingService {
  static final HandwritingService _instance = HandwritingService._internal();
  factory HandwritingService() => _instance;
  HandwritingService._internal();

  DigitalInkRecognizer? _recognizer;
  final List<StrokePoint> _currentStroke = [];
  final List<List<StrokePoint>> _allStrokes = [];
  bool _isInitialized = false;

  // Getters
  bool get isInitialized => _isInitialized;
  int get strokeCount => _allStrokes.length;

  /// Servisi başlatır
  Future<bool> initialize() async {
    if (_isInitialized) return true;

    try {
      // Model yöneticisi oluştur
      final modelManager = DigitalInkRecognizerModelManager();

      // Türkçe model için (yada matematiksel notasyon)
      final modelIdentifier = DigitalInkRecognitionModelIdentifier(
        languageCode: 'en-US', // İngilizce (matematik notasyonu için)
      );

      // Modeli indir (gerekirse)
      bool isDownloaded = await modelManager.isModelDownloaded(
        modelIdentifier.languageCode,
      );

      if (!isDownloaded) {
        print('📥 Downloading handwriting recognition model...');
        bool downloaded = await modelManager.downloadModel(
          modelIdentifier.languageCode,
        );
        
        if (!downloaded) {
          print('❌ Model download failed');
          return false;
        }
      }

      // Recognizer oluştur
      _recognizer = DigitalInkRecognizer(languageCode: modelIdentifier.languageCode);
      _isInitialized = true;
      
      print('✅ Handwriting service initialized');
      return true;
    } catch (e) {
      print('❌ Handwriting service initialization error: $e');
      return false;
    }
  }

  /// Yeni stroke başlatır
  void startStroke(Offset point, {int timestamp = 0}) {
    _currentStroke.clear();
    _currentStroke.add(StrokePoint(
      x: point.dx,
      y: point.dy,
      t: timestamp != 0 ? timestamp : DateTime.now().millisecondsSinceEpoch,
    ));
  }

  /// Stroke'a nokta ekler
  void addPoint(Offset point, {int timestamp = 0}) {
    if (_currentStroke.isEmpty) {
      startStroke(point, timestamp: timestamp);
      return;
    }

    _currentStroke.add(StrokePoint(
      x: point.dx,
      y: point.dy,
      t: timestamp != 0 ? timestamp : DateTime.now().millisecondsSinceEpoch,
    ));
  }

  /// Stroke'u bitirir ve kaydeder
  void endStroke() {
    if (_currentStroke.isNotEmpty) {
      _allStrokes.add(List.from(_currentStroke));
      _currentStroke.clear();
    }
  }

  /// El yazısını tanır
  Future<String?> recognize() async {
    if (!_isInitialized || _recognizer == null) {
      print('❌ Handwriting service not initialized');
      return null;
    }

    if (_allStrokes.isEmpty) {
      print('⚠️ No strokes to recognize');
      return null;
    }

    try {
      // Ink oluştur
      final ink = Ink();
      for (var stroke in _allStrokes) {
        ink.strokes.add(Stroke(points: stroke));
      }

      // Tanıma yap
      final List<RecognitionCandidate> candidates = 
          await _recognizer!.recognize(ink);

      if (candidates.isEmpty) {
        print('⚠️ No recognition candidates');
        return null;
      }

      // En yüksek skorlu sonucu al
      final bestCandidate = candidates.first;
      String recognizedText = bestCandidate.text;

      // Matematik ifadesini temizle
      recognizedText = _cleanMathExpression(recognizedText);

      print('✅ Recognized: $recognizedText (score: ${bestCandidate.score})');
      return recognizedText;
    } catch (e) {
      print('❌ Recognition error: $e');
      return null;
    }
  }

  /// Tüm alternatif sonuçları döndürür
  Future<List<String>> recognizeMultiple({int maxResults = 5}) async {
    if (!_isInitialized || _recognizer == null) return [];
    if (_allStrokes.isEmpty) return [];

    try {
      final ink = Ink();
      for (var stroke in _allStrokes) {
        ink.strokes.add(Stroke(points: stroke));
      }

      final List<RecognitionCandidate> candidates = 
          await _recognizer!.recognize(ink);

      return candidates
          .take(maxResults)
          .map((c) => _cleanMathExpression(c.text))
          .toList();
    } catch (e) {
      print('❌ Multiple recognition error: $e');
      return [];
    }
  }

  /// Matematik ifadesini temizler
  String _cleanMathExpression(String text) {
    String cleaned = text;

    // Yaygın el yazısı hataları
    cleaned = cleaned.replaceAll('×', '*');
    cleaned = cleaned.replaceAll('÷', '/');
    cleaned = cleaned.replaceAll('x', '*');
    cleaned = cleaned.replaceAll('X', '*');
    cleaned = cleaned.replaceAll(':', '/');
    cleaned = cleaned.replaceAll(',', '.');
    cleaned = cleaned.replaceAll('O', '0'); // Letter O to zero
    cleaned = cleaned.replaceAll('o', '0');
    cleaned = cleaned.replaceAll('l', '1'); // Letter l to one
    cleaned = cleaned.replaceAll('I', '1');

    // Boşlukları temizle
    cleaned = cleaned.replaceAll(RegExp(r'\s+'), '');

    return cleaned;
  }

  /// Çizimi temizler
  void clear() {
    _currentStroke.clear();
    _allStrokes.clear();
  }

  /// Son stroke'u geri alır
  void undoLastStroke() {
    if (_allStrokes.isNotEmpty) {
      _allStrokes.removeLast();
    }
  }

  /// Tüm stroke'ları döndürür (çizim için)
  List<List<Offset>> getAllStrokes() {
    return _allStrokes.map((stroke) {
      return stroke.map((point) => Offset(point.x, point.y)).toList();
    }).toList();
  }

  /// Stroke sayısını döndürür
  int getStrokeCount() => _allStrokes.length;

  /// Boş mu kontrol eder
  bool isEmpty() => _allStrokes.isEmpty;

  /// Servisi temizler
  Future<void> dispose() async {
    _recognizer?.close();
    clear();
    _isInitialized = false;
  }
}