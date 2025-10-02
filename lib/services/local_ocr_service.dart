import 'dart:io';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:image_picker/image_picker.dart';

/// 📸 Local OCR Service - Offline Text Recognition with Google ML Kit
/// Matematik problemlerini fotoğraftan okur
class LocalOCRService {
  static final LocalOCRService _instance = LocalOCRService._internal();
  factory LocalOCRService() => _instance;
  LocalOCRService._internal();

  final TextRecognizer _textRecognizer = TextRecognizer();
  final ImagePicker _imagePicker = ImagePicker();

  /// Kameradan fotoğraf çeker ve OCR yapar
  Future<String?> scanFromCamera() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image == null) return null;

      return await _recognizeText(image.path);
    } catch (e) {
      print('❌ Camera OCR error: $e');
      return null;
    }
  }

  /// Galeriden fotoğraf seçer ve OCR yapar
  Future<String?> scanFromGallery() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image == null) return null;

      return await _recognizeText(image.path);
    } catch (e) {
      print('❌ Gallery OCR error: $e');
      return null;
    }
  }

  /// Görüntüden metin tanır (Google ML Kit)
  Future<String?> _recognizeText(String imagePath) async {
    try {
      final inputImage = InputImage.fromFilePath(imagePath);
      final RecognizedText recognizedText = 
          await _textRecognizer.processImage(inputImage);

      if (recognizedText.text.isEmpty) {
        return null;
      }

      // Matematik ifadesini temizle ve düzenle
      String cleanedText = _cleanMathExpression(recognizedText.text);
      
      return cleanedText;
    } catch (e) {
      print('❌ Text recognition error: $e');
      return null;
    }
  }

  /// OCR metnini matematik ifadesine çevirir
  String _cleanMathExpression(String text) {
    String cleaned = text;

    // Gereksiz boşlukları temizle
    cleaned = cleaned.replaceAll(RegExp(r'\s+'), ' ');

    // Yaygın OCR hatalarını düzelt
    cleaned = cleaned.replaceAll('×', '*');
    cleaned = cleaned.replaceAll('÷', '/');
    cleaned = cleaned.replaceAll('x', '*'); // lowercase x to multiply
    cleaned = cleaned.replaceAll('X', '*'); // uppercase X to multiply
    cleaned = cleaned.replaceAll(':', '/');
    cleaned = cleaned.replaceAll(',', '.');
    
    // Türkçe karakterleri düzelt
    cleaned = cleaned.replaceAll('İ', 'I');
    cleaned = cleaned.replaceAll('ı', 'i');
    
    // Karekök sembolleri
    cleaned = cleaned.replaceAll('√', 'sqrt(');
    if (cleaned.contains('sqrt(') && !cleaned.contains(')')) {
      cleaned += ')';
    }

    // Üs işaretleri
    cleaned = cleaned.replaceAll('^', '**');
    
    // Parantez dengesi kontrolü
    int openCount = '('.allMatches(cleaned).length;
    int closeCount = ')'.allMatches(cleaned).length;
    if (openCount > closeCount) {
      cleaned += ')' * (openCount - closeCount);
    }

    return cleaned.trim();
  }

  /// Matematik ifadelerini filtreler
  List<String> extractMathExpressions(String text) {
    List<String> expressions = [];
    
    // Satır satır ayır
    List<String> lines = text.split('\n');
    
    for (String line in lines) {
      String cleaned = line.trim();
      
      // Matematik operatörü içeriyor mu?
      if (RegExp(r'[+\-*/=×÷]').hasMatch(cleaned)) {
        expressions.add(_cleanMathExpression(cleaned));
      }
      
      // Sadece sayılar ve operatörler mi?
      if (RegExp(r'^[\d+\-*/().×÷√^=\s]+$').hasMatch(cleaned)) {
        expressions.add(_cleanMathExpression(cleaned));
      }
    }
    
    return expressions;
  }

  /// Tanınan metnin güven skorunu döndürür (0-1 arası)
  double getConfidenceScore(String text) {
    if (text.isEmpty) return 0.0;
    
    // Matematik karakterleri var mı?
    bool hasMathChars = RegExp(r'[0-9+\-*/=()]').hasMatch(text);
    if (!hasMathChars) return 0.3;
    
    // Geçerli matematik ifadesi mi?
    bool isValid = _isValidMathExpression(text);
    if (!isValid) return 0.5;
    
    return 0.9; // Yüksek güven
  }

  /// Matematik ifadesinin geçerli olup olmadığını kontrol eder
  bool _isValidMathExpression(String text) {
    try {
      // Parantez dengesi
      int balance = 0;
      for (int i = 0; i < text.length; i++) {
        if (text[i] == '(') balance++;
        if (text[i] == ')') balance--;
        if (balance < 0) return false;
      }
      if (balance != 0) return false;
      
      // En az bir sayı ve bir operatör var mı?
      bool hasNumber = RegExp(r'\d').hasMatch(text);
      bool hasOperator = RegExp(r'[+\-*/]').hasMatch(text);
      
      return hasNumber && (hasOperator || text.contains('='));
    } catch (e) {
      return false;
    }
  }

  /// Servisi temizle
  void dispose() {
    _textRecognizer.close();
  }
}