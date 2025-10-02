import 'package:flutter/material.dart';
import 'dart:math';
import '../../utils/calculator_formatter.dart';

/// 🏥 HEALTH CALCULATORS CONTROLLER
/// 7 Sağlık Hesaplayıcısı: BMI, Kalori, Su İhtiyacı, İdeal Kilo, Yağ Oranı, Hamilelik, İlaç Dozu
/// ✨ Türkçe formatlanmış sonuçlar ve detaylı açıklamalar

class HealthCalculatorsController extends ChangeNotifier {
  // 📊 VKİ (BMI) Hesaplayıcı
  Map<String, dynamic> calculateBMI(double weight, double height) {
    // height in cm, weight in kg
    double heightInMeters = height / 100;
    double bmi = weight / (heightInMeters * heightInMeters);
    String category = getBMICategory(bmi);
    Color color = getBMIColor(bmi);
    
    return {
      'bmi': bmi,
      'category': category,
      'color': color,
      'formatted': CalculatorFormatter.formatBMIResults(weight, height, bmi, category),
      'display': {
        '⚖️ Kilo': CalculatorFormatter.formatWeight(weight),
        '📏 Boy': CalculatorFormatter.formatHeight(height),
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '📊 VKİ': CalculatorFormatter.formatNumber(bmi, decimals: 1),
        '📋 Kategori': category,
        '💡 Açıklama': _getBMIDescription(bmi),
        '🎯 İdeal VKİ Aralığı': '18.5 - 24.9',
      }
    };
  }

  String getBMICategory(double bmi) {
    if (bmi < 18.5) return 'Zayıf';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Fazla Kilolu';
    if (bmi < 35) return 'Obez (Sınıf I)';
    if (bmi < 40) return 'Obez (Sınıf II)';
    return 'Obez (Sınıf III)';
  }

  Color getBMIColor(double bmi) {
    if (bmi < 18.5) return Colors.blue;
    if (bmi < 25) return Colors.green;
    if (bmi < 30) return Colors.orange;
    return Colors.red;
  }

  String _getBMIDescription(double bmi) {
    if (bmi < 18.5) return '🔵 Zayıf - Kilo almanız önerilir';
    if (bmi < 25) return '✅ Normal - İdeal kilonuzdasınız';
    if (bmi < 30) return '🟠 Fazla Kilolu - Kilo vermeniz önerilir';
    if (bmi < 35) return '🔴 Obez (1. Derece) - Diyet ve egzersiz gerekli';
    if (bmi < 40) return '🔴 Obez (2. Derece) - Doktor kontrolü önerili';
    return '⚫ Obez (3. Derece) - Acil tıbbi müdahale gerekli';
  }

  // 🔥 Kalori Hesaplayıcı (BMR + Aktivite Seviyesi)
  Map<String, dynamic> calculateCalories(
    double weight,
    double height,
    int age,
    bool isMale,
    String activityLevel,
    String goal,
  ) {
    // Mifflin-St Jeor Equation
    double bmr;
    if (isMale) {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    String activityText;
    double activityMultiplier;
    switch (activityLevel) {
      case 'sedentary':
        activityMultiplier = 1.2;
        activityText = 'Hareketsiz (ofis işi, egzersiz yok)';
        break;
      case 'light':
        activityMultiplier = 1.375;
        activityText = 'Az Hareketli (haftada 1-3 gün hafif egzersiz)';
        break;
      case 'moderate':
        activityMultiplier = 1.55;
        activityText = 'Orta Hareketli (haftada 3-5 gün orta egzersiz)';
        break;
      case 'active':
        activityMultiplier = 1.725;
        activityText = 'Aktif (haftada 6-7 gün yoğun egzersiz)';
        break;
      case 'very_active':
        activityMultiplier = 1.9;
        activityText = 'Çok Aktif (günde 2 kez yoğun egzersiz, fiziksel iş)';
        break;
      default:
        activityMultiplier = 1.2;
        activityText = 'Hareketsiz';
    }

    double dailyCalories = bmr * activityMultiplier;

    // Hedefe göre kalori ayarlaması
    double targetCalories;
    String goalText;
    Map<String, double> macros;

    switch (goal) {
      case 'lose':
        targetCalories = dailyCalories - 500;
        goalText = '🔥 Kilo Kaybı (-0.5 kg/hafta)';
        macros = {
          'protein': (targetCalories * 0.30) / 4, // 30% protein
          'carbs': (targetCalories * 0.40) / 4,   // 40% carbs
          'fat': (targetCalories * 0.30) / 9,     // 30% fat
        };
        break;
      case 'gain':
        targetCalories = dailyCalories + 500;
        goalText = '💪 Kilo Alma (+0.5 kg/hafta)';
        macros = {
          'protein': (targetCalories * 0.25) / 4,
          'carbs': (targetCalories * 0.50) / 4,
          'fat': (targetCalories * 0.25) / 9,
        };
        break;
      default:
        targetCalories = dailyCalories;
        goalText = '⚖️ Kilo Koruma';
        macros = {
          'protein': (targetCalories * 0.25) / 4,
          'carbs': (targetCalories * 0.50) / 4,
          'fat': (targetCalories * 0.25) / 9,
        };
    }

    return {
      'bmr': bmr,
      'daily_calories': dailyCalories,
      'target_calories': targetCalories,
      'protein': macros['protein']!,
      'carbs': macros['carbs']!,
      'fat': macros['fat']!,
      'display': {
        '👤 Profil': '${isMale ? 'Erkek' : 'Kadın'}, $age yaş',
        '⚖️ Kilo': CalculatorFormatter.formatWeight(weight),
        '📏 Boy': CalculatorFormatter.formatHeight(height),
        '🏃 Aktivite': activityText,
        '🎯 Hedef': goalText,
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '🔥 BMR (Bazal Metabolizma)': CalculatorFormatter.formatCalories(bmr),
        '💪 Günlük Kalori İhtiyacı': CalculatorFormatter.formatCalories(dailyCalories),
        '🎯 Hedef Kalori': CalculatorFormatter.formatCalories(targetCalories),
        '━━━━━━━━━━━━━━━━━━━━━ ': '',
        '🥩 Protein': CalculatorFormatter.formatGrams(macros['protein']!),
        '🍞 Karbonhidrat': CalculatorFormatter.formatGrams(macros['carbs']!),
        '🧈 Yağ': CalculatorFormatter.formatGrams(macros['fat']!),
      }
    };
  }

  // 💧 Su İhtiyacı Hesaplayıcı
  Map<String, dynamic> calculateWaterIntake(double weight, String activityLevel) {
    // Base formula: 30-40ml per kg of body weight
    double baseWater = weight * 35; // ml
    
    // Adjust for activity
    double activityMultiplier;
    String activityText;
    
    switch (activityLevel) {
      case 'sedentary':
        activityMultiplier = 1.0;
        activityText = 'Hareketsiz';
        break;
      case 'light':
        activityMultiplier = 1.1;
        activityText = 'Az Hareketli';
        break;
      case 'moderate':
        activityMultiplier = 1.3;
        activityText = 'Orta Hareketli';
        break;
      case 'active':
        activityMultiplier = 1.5;
        activityText = 'Aktif';
        break;
      case 'very_active':
        activityMultiplier = 1.7;
        activityText = 'Çok Aktif';
        break;
      default:
        activityMultiplier = 1.0;
        activityText = 'Hareketsiz';
    }
    
    double totalWater = baseWater * activityMultiplier;
    
    return {
      'water_ml': totalWater,
      'water_liters': totalWater / 1000,
      'glasses': (totalWater / 250).ceil(),
      'bottles': (totalWater / 500).ceil(),
      'display': {
        '⚖️ Kilo': CalculatorFormatter.formatWeight(weight),
        '🏃 Aktivite': activityText,
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '💧 Günlük Su İhtiyacı': CalculatorFormatter.formatWater(totalWater),
        '🥤 Bardak (250ml)': '${(totalWater / 250).ceil()} bardak',
        '🧴 Şişe (500ml)': '${(totalWater / 500).ceil()} şişe',
        '💡 Not': 'Egzersiz sırasında ekstra su tüketin',
      }
    };
  }

  // ⚖️ İdeal Kilo Hesaplayıcı (5 Farklı Formül)
  Map<String, dynamic> calculateIdealWeight(double height, bool isMale) {
    double heightInCm = height;
    double heightInInches = height / 2.54;
    
    // Devine Formula
    double devine = isMale
        ? 50 + 2.3 * (heightInInches - 60)
        : 45.5 + 2.3 * (heightInInches - 60);
    
    // Robinson Formula
    double robinson = isMale
        ? 52 + 1.9 * (heightInInches - 60)
        : 49 + 1.7 * (heightInInches - 60);
    
    // Miller Formula
    double miller = isMale
        ? 56.2 + 1.41 * (heightInInches - 60)
        : 53.1 + 1.36 * (heightInInches - 60);
    
    // Hamwi Formula
    double hamwi = isMale
        ? 48 + 2.7 * (heightInInches - 60)
        : 45.5 + 2.2 * (heightInInches - 60);
    
    // BMI-Based (BMI 22)
    double heightInMeters = heightInCm / 100;
    double bmiBased = 22 * heightInMeters * heightInMeters;
    
    double average = (devine + robinson + miller + hamwi + bmiBased) / 5;
    
    return {
      'devine': devine,
      'robinson': robinson,
      'miller': miller,
      'hamwi': hamwi,
      'bmi_based': bmiBased,
      'average': average,
      'display': {
        '📏 Boy': CalculatorFormatter.formatHeight(height),
        '👤 Cinsiyet': isMale ? 'Erkek' : 'Kadın',
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '✨ Ortalama İdeal Kilo': CalculatorFormatter.formatWeight(average),
        '━━━━━━━━━━━━━━━━━━━━━ ': '',
        '📊 Devine Formülü': CalculatorFormatter.formatWeight(devine),
        '📊 Robinson Formülü': CalculatorFormatter.formatWeight(robinson),
        '📊 Miller Formülü': CalculatorFormatter.formatWeight(miller),
        '📊 Hamwi Formülü': CalculatorFormatter.formatWeight(hamwi),
        '📊 BMI Bazlı (VKİ 22)': CalculatorFormatter.formatWeight(bmiBased),
        '💡 Not': '5 farklı formülün ortalaması alınmıştır',
      }
    };
  }

  // Body Fat Percentage (US Navy Method)
  double calculateBodyFat(
    bool isMale,
    double neck,
    double waist,
    double height, {
    double? hip, // Required for females
  }) {
    // Measurements in cm
    if (isMale) {
      double value = 86.010 * log(waist - neck) - 70.041 * log(height) + 36.76;
      return value;
    } else {
      if (hip == null) return 0;
      double value = 163.205 * log(waist + hip - neck) - 97.684 * log(height) - 78.387;
      return value;
    }
  }

  String getBodyFatCategory(double bodyFat, bool isMale) {
    if (isMale) {
      if (bodyFat < 6) return 'Esansiyel Yağ';
      if (bodyFat < 14) return 'Atlet';
      if (bodyFat < 18) return 'Fitness';
      if (bodyFat < 25) return 'Ortalama';
      return 'Obez';
    } else {
      if (bodyFat < 14) return 'Esansiyel Yağ';
      if (bodyFat < 21) return 'Atlet';
      if (bodyFat < 25) return 'Fitness';
      if (bodyFat < 32) return 'Ortalama';
      return 'Obez';
    }
  }

  // Pregnancy Calculator
  Map<String, dynamic> calculatePregnancy(DateTime lastPeriod) {
    DateTime now = DateTime.now();
    DateTime dueDate = lastPeriod.add(const Duration(days: 280)); // 40 weeks
    
    int daysPregnant = now.difference(lastPeriod).inDays;
    int weeksPregnant = (daysPregnant / 7).floor();
    int daysInWeek = daysPregnant % 7;
    
    int trimester = weeksPregnant < 13 ? 1 : (weeksPregnant < 27 ? 2 : 3);
    
    int daysRemaining = dueDate.difference(now).inDays;
    int weeksRemaining = (daysRemaining / 7).floor();
    
    return {
      'due_date': dueDate,
      'weeks_pregnant': weeksPregnant,
      'days_in_week': daysInWeek,
      'trimester': trimester,
      'days_remaining': daysRemaining,
      'weeks_remaining': weeksRemaining,
      'conception_date': lastPeriod.add(const Duration(days: 14)),
      'percent_complete': (daysPregnant / 280 * 100).clamp(0, 100),
    };
  }

  // Medication Dose Calculator (Pediatric)
  double calculatePediatricDose(
    double adultDose,
    double childWeight,
    String method,
  ) {
    // method: clark, young, fried
    switch (method) {
      case 'clark': // Clark's Rule (weight-based)
        // Dose = (Weight in kg / 70) × Adult Dose
        return (childWeight / 70) * adultDose;
      
      case 'young': // Young's Rule (age-based, but using weight as proxy)
        // Dose = (Age / (Age + 12)) × Adult Dose
        // Approximating age from weight: rough estimate
        int estimatedAge = (childWeight / 3).round().clamp(1, 12);
        return (estimatedAge / (estimatedAge + 12)) * adultDose;
      
      case 'bsa': // Body Surface Area (Mosteller formula)
        // BSA = sqrt((weight_kg × height_cm) / 3600)
        // Simplified using weight only: BSA ≈ sqrt(weight_kg / 36)
        double bsa = sqrt(childWeight / 36);
        double adultBSA = 1.73; // Average adult BSA
        return (bsa / adultBSA) * adultDose;
      
      default:
        return (childWeight / 70) * adultDose;
    }
  }

  Map<String, double> calculateDoseByWeight(
    double weightKg,
    double dosePerKg,
  ) {
    double totalDose = weightKg * dosePerKg;
    
    return {
      'total_dose': totalDose,
      'single_dose': totalDose,
      'daily_dose_2x': totalDose * 2,
      'daily_dose_3x': totalDose * 3,
      'daily_dose_4x': totalDose * 4,
    };
  }
}