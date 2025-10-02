import 'package:intl/intl.dart';
import 'package:get/get.dart';
import '../core/localization/localization_service.dart';

/// 🎨 HESAPLAYICI SONUÇLARINI FORMATLAMA
/// Çok dilli açıklamalar, sayı formatlaması, semboller

class CalculatorFormatter {
  // Mevcut dil servisini al
  static LocalizationService? get _localizationService {
    try {
      return Get.find<LocalizationService>();
    } catch (e) {
      return null;
    }
  }

  // Dile göre locale string
  static String get _localeString {
    return _localizationService?.getLocaleString() ?? 'en_US';
  }

  // Dile göre para birimi
  static String get _defaultCurrency {
    return _localizationService?.getDefaultCurrency() ?? '\$';
  }

  // Sayı formatlaması: Dile göre otomatik format
  static String formatNumber(double number, {int decimals = 2, String? locale}) {
    final localeToUse = locale ?? _localeString;
    final formatter = NumberFormat('#,##0.${'0' * decimals}', localeToUse);
    return formatter.format(number);
  }

  // Para formatlaması - Dile göre otomatik para birimi
  static String formatMoney(double amount, {String? currency, String? locale}) {
    final currencyToUse = currency ?? _defaultCurrency;
    return '${formatNumber(amount, locale: locale)} $currencyToUse';
  }

  // Yüzde formatlaması
  static String formatPercent(double percent, {int decimals = 2, String? locale}) {
    return '${formatNumber(percent, decimals: decimals, locale: locale)}%';
  }

  // Kilo formatlaması
  static String formatWeight(double kg) {
    return '${formatNumber(kg, decimals: 1)} kg';
  }

  // Boy formatlaması
  static String formatHeight(double cm) {
    return '${formatNumber(cm, decimals: 0)} cm';
  }

  // Su formatlaması (ml ve litre)
  static String formatWater(double ml) {
    if (ml >= 1000) {
      return '${formatNumber(ml / 1000, decimals: 2)} L (${formatNumber(ml, decimals: 0)} ml)';
    }
    return '${formatNumber(ml, decimals: 0)} ml';
  }

  // Alan formatlaması
  static String formatArea(double sqm) {
    return '${formatNumber(sqm, decimals: 2)} m²';
  }

  // Hacim formatlaması
  static String formatVolume(double cubicm) {
    return '${formatNumber(cubicm, decimals: 2)} m³';
  }

  // Kalori formatlaması
  static String formatCalories(double kcal) {
    return '${formatNumber(kcal, decimals: 0)} kcal';
  }

  // Gram formatlaması (protein, yağ, karbonhidrat)
  static String formatGrams(double grams) {
    return '${formatNumber(grams, decimals: 1)} gr';
  }

  // 🏥 SAĞLIK HESAPLAYICI SONUÇLARI
  static Map<String, String> formatBMIResults(double weight, double height, double bmi, String category) {
    return {
      'title': '📊 VKİ (Vücut Kitle İndeksi)',
      'bmi': formatNumber(bmi, decimals: 1),
      'category': category,
      'weight': formatWeight(weight),
      'height': formatHeight(height),
      'description': _getBMIDescription(bmi),
      'icon': _getBMIIcon(bmi),
    };
  }

  static String _getBMIDescription(double bmi) {
    if (bmi < 18.5) return '🔵 Zayıf - Kilo almanız önerilir';
    if (bmi < 25) return '✅ Normal - İdeal kilonuzdasınız';
    if (bmi < 30) return '🟠 Fazla Kilolu - Kilo vermeniz önerilir';
    if (bmi < 35) return '🔴 Obez (1. Derece) - Diyet ve egzersiz gerekli';
    if (bmi < 40) return '🔴 Obez (2. Derece) - Doktor kontrolü önerili';
    return '⚫ Obez (3. Derece) - Acil tıbbi müdahale gerekli';
  }

  static String _getBMIIcon(double bmi) {
    if (bmi < 18.5) return '😟';
    if (bmi < 25) return '😊';
    if (bmi < 30) return '😐';
    return '😟';
  }

  static Map<String, String> formatCalorieResults(double bmr, double dailyCalories, Map<String, double> macros) {
    return {
      'title': '🔥 Günlük Kalori İhtiyacı',
      'bmr': '${formatCalories(bmr)} (Bazal Metabolizma)',
      'daily_calories': formatCalories(dailyCalories),
      'protein': '${formatGrams(macros['protein']!)} protein',
      'carbs': '${formatGrams(macros['carbs']!)} karbonhidrat',
      'fat': '${formatGrams(macros['fat']!)} yağ',
      'description': '💪 Günlük makro besin öneriniz',
    };
  }

  static Map<String, String> formatWaterResults(double ml) {
    return {
      'title': '💧 Günlük Su İhtiyacı',
      'total': formatWater(ml),
      'glasses': '${(ml / 250).ceil()} bardak (250ml)',
      'bottles': '${(ml / 500).ceil()} şişe (500ml)',
      'description': '💡 Günde ${(ml / 250).ceil()} bardak su içmelisiniz',
    };
  }

  static Map<String, String> formatIdealWeightResults(Map<String, double> weights) {
    return {
      'title': '⚖️ İdeal Kilo Hesaplama',
      'average': '${formatWeight(weights['average']!)} (Ortalama)',
      'devine': '${formatWeight(weights['devine']!)} (Devine)',
      'robinson': '${formatWeight(weights['robinson']!)} (Robinson)',
      'miller': '${formatWeight(weights['miller']!)} (Miller)',
      'hamwi': '${formatWeight(weights['hamwi']!)} (Hamwi)',
      'bmi_based': '${formatWeight(weights['bmi_based']!)} (BMI 22)',
      'description': '📊 5 farklı formüle göre ideal kilonuz',
    };
  }

  // 💰 FİNANS HESAPLAYICI SONUÇLARI
  static Map<String, String> formatLoanResults(Map<String, double> results) {
    return {
      'title': '🏦 Kredi Hesaplama Sonuçları',
      'monthly': '${formatMoney(results['monthly_payment']!)} / Ay',
      'total': formatMoney(results['total_payment']!),
      'interest': formatMoney(results['total_interest']!),
      'interest_percent': formatPercent(results['interest_percentage']!),
      'description': '💰 Toplam ${formatMoney(results['total_interest']!)} faiz ödeyeceksiniz',
      'icon': '💳',
    };
  }

  static Map<String, String> formatInvestmentResults(Map<String, double> results) {
    return {
      'title': '📈 Yatırım Hesaplama Sonuçları',
      'future_value': formatMoney(results['future_value']!),
      'invested': formatMoney(results['total_invested']!),
      'gain': formatMoney(results['total_gain']!),
      'roi': formatPercent(results['roi_percentage']!),
      'description': '✨ ${formatPercent(results['roi_percentage']!)} getiri elde edeceksiniz',
      'icon': '💎',
    };
  }

  static Map<String, String> formatTaxResults(Map<String, double> results) {
    return {
      'title': '🧾 Gelir Vergisi Hesaplama',
      'gross': formatMoney(results['gross_income']!),
      'tax': formatMoney(results['total_tax']!),
      'net': formatMoney(results['net_income']!),
      'rate': formatPercent(results['effective_rate']!),
      'monthly_net': '${formatMoney(results['monthly_net']!)} / Ay',
      'monthly_tax': '${formatMoney(results['monthly_tax']!)} / Ay',
      'description': '📊 Efektif vergi oranınız: ${formatPercent(results['effective_rate']!)}',
      'icon': '💸',
    };
  }

  static Map<String, String> formatVATResults(Map<String, double> results) {
    return {
      'title': '🧾 KDV Hesaplama',
      'net': '${formatMoney(results['net_amount']!)} (Net)',
      'vat': '${formatMoney(results['vat_amount']!)} (KDV)',
      'gross': '${formatMoney(results['gross_amount']!)} (Brüt)',
      'description': '💡 KDV tutarı: ${formatMoney(results['vat_amount']!)}',
      'icon': '📄',
    };
  }

  static Map<String, String> formatRetirementResults(Map<String, double> results) {
    return {
      'title': '🏖️ Emeklilik Planlaması',
      'total': formatMoney(results['total_at_retirement']!),
      'contributed': formatMoney(results['total_contributed']!),
      'growth': formatMoney(results['total_growth']!),
      'real_value': '${formatMoney(results['real_value']!)} (Enflasyon sonrası)',
      'monthly_income': '${formatMoney(results['monthly_income_4_percent']!)} / Ay (%4 kuralı)',
      'real_monthly': '${formatMoney(results['real_monthly_income']!)} / Ay (Reel)',
      'years': '${results['years_until_retirement']!.toInt()} yıl sonra',
      'description': '💰 Emekli olunca aylık ${formatMoney(results['real_monthly_income']!)} gelir',
      'icon': '🌴',
    };
  }

  // 🏗️ İNŞAAT HESAPLAYICI SONUÇLARI
  static Map<String, String> formatConstructionResults(String title, Map<String, dynamic> results) {
    Map<String, String> formatted = {
      'title': title,
    };

    results.forEach((key, value) {
      if (value is double) {
        // Farklı birimlere göre formatlama
        if (key.contains('area') || key.contains('alan')) {
          formatted[key] = formatArea(value);
        } else if (key.contains('volume') || key.contains('hacim')) {
          formatted[key] = formatVolume(value);
        } else if (key.contains('weight') || key.contains('agirlik') || key.contains('kg')) {
          formatted[key] = formatWeight(value);
        } else if (key.contains('cost') || key.contains('maliyet') || key.contains('price')) {
          formatted[key] = formatMoney(value);
        } else {
          formatted[key] = formatNumber(value);
        }
      } else {
        formatted[key] = value.toString();
      }
    });

    return formatted;
  }

  // 🔬 BİLİM HESAPLAYICI SONUÇLARI
  static Map<String, String> formatScienceResults(String title, Map<String, dynamic> results) {
    Map<String, String> formatted = {
      'title': title,
    };

    results.forEach((key, value) {
      if (value is double) {
        formatted[key] = formatNumber(value, decimals: 4);
      } else {
        formatted[key] = value.toString();
      }
    });

    return formatted;
  }

  // 💼 İŞ HESAPLAYICI SONUÇLARI
  static Map<String, String> formatBusinessResults(String title, Map<String, dynamic> results) {
    Map<String, String> formatted = {
      'title': title,
    };

    results.forEach((key, value) {
      if (value is double) {
        if (key.contains('percent') || key.contains('rate') || key.contains('oran')) {
          formatted[key] = formatPercent(value);
        } else if (key.contains('revenue') || key.contains('cost') || key.contains('profit') || 
                   key.contains('gelir') || key.contains('maliyet') || key.contains('kar')) {
          formatted[key] = formatMoney(value);
        } else {
          formatted[key] = formatNumber(value);
        }
      } else {
        formatted[key] = value.toString();
      }
    });

    return formatted;
  }

  // 🎓 EĞİTİM HESAPLAYICI SONUÇLARI
  static Map<String, String> formatEducationResults(String title, Map<String, dynamic> results) {
    Map<String, String> formatted = {
      'title': title,
    };

    results.forEach((key, value) {
      if (value is double) {
        if (key.contains('gpa') || key.contains('grade') || key.contains('not')) {
          formatted[key] = formatNumber(value, decimals: 2);
        } else if (key.contains('percent') || key.contains('yuzde')) {
          formatted[key] = formatPercent(value);
        } else {
          formatted[key] = formatNumber(value);
        }
      } else {
        formatted[key] = value.toString();
      }
    });

    return formatted;
  }

  // 📅 GÜNLÜK HESAPLAYICI SONUÇLARI
  static Map<String, String> formatDailyResults(String title, Map<String, dynamic> results) {
    Map<String, String> formatted = {
      'title': title,
    };

    results.forEach((key, value) {
      if (value is double) {
        formatted[key] = formatNumber(value);
      } else if (value is DateTime) {
        formatted[key] = DateFormat('dd MMMM yyyy', 'tr_TR').format(value);
      } else {
        formatted[key] = value.toString();
      }
    });

    return formatted;
  }

  // Sonuç kartını güzelce göstermek için
  static String buildResultCard(Map<String, String> results) {
    StringBuffer buffer = StringBuffer();
    
    buffer.writeln('━━━━━━━━━━━━━━━━━━━━━');
    buffer.writeln(results['title'] ?? '📊 Sonuçlar');
    buffer.writeln('━━━━━━━━━━━━━━━━━━━━━');
    
    results.forEach((key, value) {
      if (key != 'title' && key != 'description' && key != 'icon') {
        String label = _getTurkishLabel(key);
        buffer.writeln('$label: $value');
      }
    });
    
    if (results.containsKey('description')) {
      buffer.writeln('');
      buffer.writeln(results['description']);
    }
    
    buffer.writeln('━━━━━━━━━━━━━━━━━━━━━');
    
    return buffer.toString();
  }

  static String _getTurkishLabel(String key) {
    final labels = {
      // Genel
      'total': '💰 Toplam',
      'average': '📊 Ortalama',
      'result': '✅ Sonuç',
      
      // Sağlık
      'bmi': '📊 VKİ',
      'category': '📋 Kategori',
      'weight': '⚖️ Kilo',
      'height': '📏 Boy',
      'bmr': '🔥 Bazal Metabolizma',
      'daily_calories': '🍽️ Günlük Kalori',
      'protein': '🥩 Protein',
      'carbs': '🍞 Karbonhidrat',
      'fat': '🧈 Yağ',
      'glasses': '🥤 Bardak',
      'bottles': '🧴 Şişe',
      
      // Finans
      'monthly': '📅 Aylık Ödeme',
      'interest': '💸 Faiz',
      'interest_percent': '📊 Faiz Oranı',
      'future_value': '💎 Gelecek Değer',
      'invested': '💰 Yatırılan',
      'gain': '📈 Kazanç',
      'roi': '📊 Getiri Oranı',
      'gross': '💵 Brüt Gelir',
      'tax': '🧾 Vergi',
      'net': '💰 Net Gelir',
      'rate': '📊 Oran',
      'monthly_net': '💰 Aylık Net',
      'monthly_tax': '💸 Aylık Vergi',
      'contributed': '💵 Yatırılan',
      'growth': '📈 Büyüme',
      'real_value': '💎 Reel Değer',
      'monthly_income': '💰 Aylık Gelir',
      'real_monthly': '💰 Reel Aylık',
      'years': '⏳ Süre',
      
      // İnşaat
      'area': '📐 Alan',
      'volume': '📦 Hacim',
      'cost': '💰 Maliyet',
    };
    
    return labels[key] ?? key;
  }
}