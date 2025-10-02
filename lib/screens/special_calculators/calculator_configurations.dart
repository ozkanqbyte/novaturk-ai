import 'package:flutter/material.dart';
import 'universal_calculator_screen.dart';
import '../../core/theme/app_colors.dart';
import '../../controllers/special_calculators/health_calculators_controller.dart';
import '../../controllers/special_calculators/finance_calculators_controller.dart';
import '../../controllers/special_calculators/construction_calculators_controller.dart';
import '../../controllers/special_calculators/science_calculators_controller.dart';
import '../../controllers/special_calculators/business_calculators_controller.dart';
import '../../controllers/special_calculators/daily_calculators_controller.dart';
import '../../controllers/special_calculators/education_calculators_controller.dart';
import 'package:provider/provider.dart';

/// 🎯 ALL CALCULATOR CONFIGURATIONS - 40+ Calculators
class CalculatorConfigurations {
  
  // 💰 FINANCE CALCULATORS (6)
  static Widget getLoanCalculator(BuildContext context) {
    final controller = Provider.of<FinanceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Kredi Hesaplayıcı',
      emoji: '💰',
      primaryColor: AppColors.goldenYellow,
      fields: [
        CalculatorField(key: 'principal', label: 'Kredi Tutarı', type: FieldType.number, suffix: '₺', defaultValue: 100000.0),
        CalculatorField(key: 'rate', label: 'Yıllık Faiz Oranı', type: FieldType.number, suffix: '%', defaultValue: 15.0),
        CalculatorField(key: 'months', label: 'Vade (Ay)', type: FieldType.integer, suffix: 'ay', defaultValue: 36),
      ],
      onCalculate: (v) => controller.calculateLoan(v['principal'], v['rate'], v['months']),
    );
  }

  static Widget getInvestmentCalculator(BuildContext context) {
    final controller = Provider.of<FinanceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Yatırım Hesaplayıcı',
      emoji: '📈',
      primaryColor: AppColors.goldenYellow,
      fields: [
        CalculatorField(key: 'principal', label: 'Başlangıç Tutarı', type: FieldType.number, suffix: '₺', defaultValue: 10000.0),
        CalculatorField(key: 'monthly', label: 'Aylık Katkı', type: FieldType.number, suffix: '₺', defaultValue: 1000.0),
        CalculatorField(key: 'rate', label: 'Yıllık Getiri', type: FieldType.number, suffix: '%', defaultValue: 10.0),
        CalculatorField(key: 'years', label: 'Yıl', type: FieldType.integer, suffix: 'yıl', defaultValue: 10),
        CalculatorField(key: 'frequency', label: 'Bileşik Sıklığı', type: FieldType.dropdown, defaultValue: 'monthly', options: [
          {'label': 'Aylık', 'value': 'monthly'},
          {'label': 'Çeyreklik', 'value': 'quarterly'},
          {'label': 'Yıllık', 'value': 'yearly'},
        ]),
      ],
      onCalculate: (v) => controller.calculateInvestment(v['principal'], v['monthly'], v['rate'], v['years'], v['frequency']),
    );
  }

  static Widget getInterestCalculator(BuildContext context) {
    final controller = Provider.of<FinanceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Faiz Hesaplayıcı',
      emoji: '💸',
      primaryColor: AppColors.goldenYellow,
      fields: [
        CalculatorField(key: 'principal', label: 'Ana Para', type: FieldType.number, suffix: '₺', defaultValue: 10000.0),
        CalculatorField(key: 'rate', label: 'Faiz Oranı', type: FieldType.number, suffix: '%', defaultValue: 5.0),
        CalculatorField(key: 'time', label: 'Süre', type: FieldType.number, suffix: 'yıl', defaultValue: 3.0),
        CalculatorField(key: 'compound', label: 'Bileşik Faiz', type: FieldType.switch_toggle, defaultValue: true),
      ],
      onCalculate: (v) => controller.calculateInterest(v['principal'], v['rate'], v['time'], v['compound']),
    );
  }

  static Widget getTaxCalculator(BuildContext context) {
    final controller = Provider.of<FinanceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Vergi Hesaplayıcı',
      emoji: '🧾',
      primaryColor: AppColors.goldenYellow,
      fields: [
        CalculatorField(key: 'income', label: 'Yıllık Gelir', type: FieldType.number, suffix: '₺', defaultValue: 500000.0),
      ],
      onCalculate: (v) => controller.calculateIncomeTax(v['income']),
    );
  }

  static Widget getRetirementCalculator(BuildContext context) {
    final controller = Provider.of<FinanceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Emeklilik Hesaplayıcı',
      emoji: '👴',
      primaryColor: AppColors.goldenYellow,
      fields: [
        CalculatorField(key: 'age', label: 'Mevcut Yaş', type: FieldType.integer, defaultValue: 30),
        CalculatorField(key: 'retirement_age', label: 'Emeklilik Yaşı', type: FieldType.integer, defaultValue: 65),
        CalculatorField(key: 'savings', label: 'Mevcut Birikim', type: FieldType.number, suffix: '₺', defaultValue: 50000.0),
        CalculatorField(key: 'monthly', label: 'Aylık Katkı', type: FieldType.number, suffix: '₺', defaultValue: 2000.0),
        CalculatorField(key: 'return', label: 'Yıllık Getiri', type: FieldType.number, suffix: '%', defaultValue: 8.0),
        CalculatorField(key: 'inflation', label: 'Enflasyon', type: FieldType.number, suffix: '%', defaultValue: 3.0),
      ],
      onCalculate: (v) => controller.calculateRetirement(v['age'], v['retirement_age'], v['savings'], v['monthly'], v['return'], v['inflation']),
    );
  }

  static Widget getROICalculator(BuildContext context) {
    final controller = Provider.of<FinanceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'ROI Hesaplayıcı',
      emoji: '📊',
      primaryColor: AppColors.goldenYellow,
      fields: [
        CalculatorField(key: 'investment', label: 'Yatırım Tutarı', type: FieldType.number, suffix: '₺', defaultValue: 50000.0),
        CalculatorField(key: 'final', label: 'Final Değer', type: FieldType.number, suffix: '₺', defaultValue: 75000.0),
        CalculatorField(key: 'costs', label: 'Ek Maliyetler', type: FieldType.number, suffix: '₺', defaultValue: 5000.0),
      ],
      onCalculate: (v) => controller.calculateROI(v['investment'], v['final'], v['costs']),
    );
  }

  // 🏥 HEALTH CALCULATORS (7)
  static Widget getBMICalculator(BuildContext context) {
    final controller = Provider.of<HealthCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'BMI Hesaplayıcı',
      emoji: '⚖️',
      primaryColor: AppColors.coralRed,
      fields: [
        CalculatorField(key: 'weight', label: 'Kilo', type: FieldType.number, suffix: 'kg', defaultValue: 70.0),
        CalculatorField(key: 'height', label: 'Boy', type: FieldType.number, suffix: 'cm', defaultValue: 170.0),
      ],
      onCalculate: (v) {
        Map<String, dynamic> result = controller.calculateBMI(v['weight'], v['height']);
        return {
          'VKİ': result['display']['📊 VKİ'],
          'Kategori': result['display']['📋 Kategori'],
          'Açıklama': result['display']['💡 Açıklama'],
        };
      },
    );
  }

  static Widget getCalorieCalculator(BuildContext context) {
    final controller = Provider.of<HealthCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Kalori Hesaplayıcı',
      emoji: '🔥',
      primaryColor: AppColors.coralRed,
      fields: [
        CalculatorField(key: 'weight', label: 'Kilo', type: FieldType.number, suffix: 'kg', defaultValue: 70.0),
        CalculatorField(key: 'height', label: 'Boy', type: FieldType.number, suffix: 'cm', defaultValue: 170.0),
        CalculatorField(key: 'age', label: 'Yaş', type: FieldType.integer, defaultValue: 30),
        CalculatorField(key: 'male', label: 'Erkek', type: FieldType.switch_toggle, defaultValue: true),
        CalculatorField(key: 'activity', label: 'Aktivite Seviyesi', type: FieldType.dropdown, defaultValue: 'moderate', options: [
          {'label': 'Hareketsiz', 'value': 'sedentary'},
          {'label': 'Az Hareketli', 'value': 'light'},
          {'label': 'Orta', 'value': 'moderate'},
          {'label': 'Aktif', 'value': 'active'},
          {'label': 'Çok Aktif', 'value': 'very_active'},
        ]),
      ],
      onCalculate: (v) {
        Map<String, dynamic> result = controller.calculateCalories(
          v['weight'], v['height'], v['age'], v['male'], v['activity'], 'maintain'
        );
        return {
          'BMR': result['display']['🔥 BMR (Bazal Metabolizma)'],
          'Günlük Kalori': result['display']['💪 Günlük Kalori İhtiyacı'],
          'Protein': result['display']['🥩 Protein'],
          'Karbonhidrat': result['display']['🍞 Karbonhidrat'],
        };
      },
    );
  }

  static Widget getWaterIntakeCalculator(BuildContext context) {
    final controller = Provider.of<HealthCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Su İhtiyacı Hesaplayıcı',
      emoji: '💧',
      primaryColor: AppColors.coralRed,
      fields: [
        CalculatorField(key: 'weight', label: 'Kilo', type: FieldType.number, suffix: 'kg', defaultValue: 70.0),
        CalculatorField(key: 'activity', label: 'Aktivite', type: FieldType.dropdown, defaultValue: 'moderate', options: [
          {'label': 'Hareketsiz', 'value': 'sedentary'},
          {'label': 'Az Hareketli', 'value': 'light'},
          {'label': 'Orta', 'value': 'moderate'},
          {'label': 'Aktif', 'value': 'active'},
        ]),
      ],
      onCalculate: (v) {
        Map<String, dynamic> result = controller.calculateWaterIntake(v['weight'], v['activity']);
        return {
          'Günlük Su İhtiyacı': result['display']['💧 Günlük Su İhtiyacı'],
          'Bardak': result['display']['🥤 Bardak (250ml)'],
          'Şişe': result['display']['🧴 Şişe (500ml)'],
        };
      },
    );
  }

  static Widget getIdealWeightCalculator(BuildContext context) {
    final controller = Provider.of<HealthCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'İdeal Kilo Hesaplayıcı',
      emoji: '🎯',
      primaryColor: AppColors.coralRed,
      fields: [
        CalculatorField(key: 'height', label: 'Boy', type: FieldType.number, suffix: 'cm', defaultValue: 170.0),
        CalculatorField(key: 'male', label: 'Erkek', type: FieldType.switch_toggle, defaultValue: true),
      ],
      onCalculate: (v) => controller.calculateIdealWeight(v['height'], v['male']),
    );
  }

  static Widget getBodyFatCalculator(BuildContext context) {
    final controller = Provider.of<HealthCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Yağ Oranı Hesaplayıcı',
      emoji: '📐',
      primaryColor: AppColors.coralRed,
      fields: [
        CalculatorField(key: 'male', label: 'Erkek', type: FieldType.switch_toggle, defaultValue: true),
        CalculatorField(key: 'neck', label: 'Boyun', type: FieldType.number, suffix: 'cm', defaultValue: 38.0),
        CalculatorField(key: 'waist', label: 'Bel', type: FieldType.number, suffix: 'cm', defaultValue: 85.0),
        CalculatorField(key: 'height', label: 'Boy', type: FieldType.number, suffix: 'cm', defaultValue: 170.0),
        CalculatorField(key: 'hip', label: 'Kalça (Kadın)', type: FieldType.number, suffix: 'cm', defaultValue: 95.0),
      ],
      onCalculate: (v) {
        double bf = controller.calculateBodyFat(v['male'], v['neck'], v['waist'], v['height'], hip: v['hip']);
        return {
          'yag_orani': bf,
          'kategori': controller.getBodyFatCategory(bf, v['male']),
        };
      },
    );
  }

  static Widget getPregnancyCalculator(BuildContext context) {
    final controller = Provider.of<HealthCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Hamilelik Hesaplayıcı',
      emoji: '🤰',
      primaryColor: AppColors.coralRed,
      fields: [
        // Note: For simplicity, using number of days ago
        CalculatorField(key: 'days_ago', label: 'Son Adet Kaç Gün Önce', type: FieldType.integer, defaultValue: 60),
      ],
      onCalculate: (v) {
        DateTime lastPeriod = DateTime.now().subtract(Duration(days: v['days_ago']));
        return controller.calculatePregnancy(lastPeriod);
      },
    );
  }

  static Widget getMedicationCalculator(BuildContext context) {
    final controller = Provider.of<HealthCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'İlaç Dozu Hesaplayıcı',
      emoji: '💊',
      primaryColor: AppColors.coralRed,
      fields: [
        CalculatorField(key: 'adult_dose', label: 'Yetişkin Dozu', type: FieldType.number, suffix: 'mg', defaultValue: 500.0),
        CalculatorField(key: 'child_weight', label: 'Çocuk Kilosu', type: FieldType.number, suffix: 'kg', defaultValue: 20.0),
        CalculatorField(key: 'method', label: 'Metot', type: FieldType.dropdown, defaultValue: 'clark', options: [
          {'label': 'Clark (Kilo)', 'value': 'clark'},
          {'label': 'Young (Yaş)', 'value': 'young'},
          {'label': 'BSA', 'value': 'bsa'},
        ]),
      ],
      onCalculate: (v) {
        double dose = controller.calculatePediatricDose(v['adult_dose'], v['child_weight'], v['method']);
        return {'cocuk_dozu_mg': dose};
      },
    );
  }

  // 🏗️ CONSTRUCTION CALCULATORS (6)
  static Widget getConcreteCalculator(BuildContext context) {
    final controller = Provider.of<ConstructionCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Beton Hesaplayıcı',
      emoji: '🏗️',
      primaryColor: AppColors.sunsetOrange,
      fields: [
        CalculatorField(key: 'length', label: 'Uzunluk', type: FieldType.number, suffix: 'm', defaultValue: 5.0),
        CalculatorField(key: 'width', label: 'Genişlik', type: FieldType.number, suffix: 'm', defaultValue: 4.0),
        CalculatorField(key: 'depth', label: 'Kalınlık', type: FieldType.number, suffix: 'cm', defaultValue: 15.0),
      ],
      onCalculate: (v) => controller.calculateConcrete(v['length'], v['width'], v['depth'], 'bags'),
    );
  }

  static Widget getBrickCalculator(BuildContext context) {
    final controller = Provider.of<ConstructionCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Tuğla Hesaplayıcı',
      emoji: '🧱',
      primaryColor: AppColors.sunsetOrange,
      fields: [
        CalculatorField(key: 'length', label: 'Duvar Uzunluğu', type: FieldType.number, suffix: 'cm', defaultValue: 500.0),
        CalculatorField(key: 'height', label: 'Duvar Yüksekliği', type: FieldType.number, suffix: 'cm', defaultValue: 300.0),
        CalculatorField(key: 'brick_l', label: 'Tuğla Uzunluğu', type: FieldType.number, suffix: 'cm', defaultValue: 20.0),
        CalculatorField(key: 'brick_h', label: 'Tuğla Yüksekliği', type: FieldType.number, suffix: 'cm', defaultValue: 10.0),
        CalculatorField(key: 'mortar', label: 'Harç Kalınlığı', type: FieldType.number, suffix: 'cm', defaultValue: 1.0),
      ],
      onCalculate: (v) => controller.calculateBricks(v['length'], v['height'], v['brick_l'], v['brick_h'], v['mortar']),
    );
  }

  static Widget getPaintCalculator(BuildContext context) {
    final controller = Provider.of<ConstructionCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Boya Hesaplayıcı',
      emoji: '🎨',
      primaryColor: AppColors.sunsetOrange,
      fields: [
        CalculatorField(key: 'area', label: 'Alan', type: FieldType.number, suffix: 'm²', defaultValue: 50.0),
        CalculatorField(key: 'coats', label: 'Kat Sayısı', type: FieldType.integer, defaultValue: 2),
        CalculatorField(key: 'coverage', label: 'Kapsama', type: FieldType.number, suffix: 'm²/L', defaultValue: 10.0),
      ],
      onCalculate: (v) => controller.calculatePaint(v['area'], v['coats'], v['coverage']),
    );
  }

  static Widget getRebarCalculator(BuildContext context) {
    final controller = Provider.of<ConstructionCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Demir Hesaplayıcı',
      emoji: '🔩',
      primaryColor: AppColors.sunsetOrange,
      fields: [
        CalculatorField(key: 'length', label: 'Uzunluk', type: FieldType.number, suffix: 'm', defaultValue: 10.0),
        CalculatorField(key: 'width', label: 'Genişlik', type: FieldType.number, suffix: 'm', defaultValue: 8.0),
        CalculatorField(key: 'spacing', label: 'Aralık', type: FieldType.number, suffix: 'cm', defaultValue: 20.0),
        CalculatorField(key: 'diameter', label: 'Çap', type: FieldType.integer, suffix: 'mm', defaultValue: 12),
      ],
      onCalculate: (v) => controller.calculateRebar(v['length'], v['width'], v['spacing'], v['diameter']),
    );
  }

  static Widget getCostCalculator(BuildContext context) {
    final controller = Provider.of<ConstructionCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Maliyet Hesaplayıcı',
      emoji: '💰',
      primaryColor: AppColors.sunsetOrange,
      fields: [
        CalculatorField(key: 'area', label: 'İnşaat Alanı', type: FieldType.number, suffix: 'm²', defaultValue: 120.0),
        CalculatorField(key: 'type', label: 'Yapı Tipi', type: FieldType.dropdown, defaultValue: 'standard', options: [
          {'label': 'Ekonomik', 'value': 'economy'},
          {'label': 'Standart', 'value': 'standard'},
          {'label': 'Premium', 'value': 'premium'},
          {'label': 'Lüks', 'value': 'luxury'},
        ]),
      ],
      onCalculate: (v) => controller.calculateConstructionCost(v['area'], v['type']),
    );
  }

  static Widget getAreaCalculator(BuildContext context) {
    final controller = Provider.of<ConstructionCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Alan Hesaplayıcı',
      emoji: '📐',
      primaryColor: AppColors.sunsetOrange,
      fields: [
        CalculatorField(key: 'shape', label: 'Şekil', type: FieldType.dropdown, defaultValue: 'rectangle', options: [
          {'label': 'Dikdörtgen', 'value': 'rectangle'},
          {'label': 'Daire', 'value': 'circle'},
          {'label': 'Üçgen', 'value': 'triangle'},
        ]),
        CalculatorField(key: 'dimension1', label: 'Boyut 1', type: FieldType.number, suffix: 'm', defaultValue: 10.0),
        CalculatorField(key: 'dimension2', label: 'Boyut 2', type: FieldType.number, suffix: 'm', defaultValue: 8.0),
      ],
      onCalculate: (v) {
        Map<String, double> dims;
        if (v['shape'] == 'rectangle') {
          dims = {'length': v['dimension1'], 'width': v['dimension2']};
        } else if (v['shape'] == 'circle') {
          dims = {'radius': v['dimension1']};
        } else {
          dims = {'base': v['dimension1'], 'height': v['dimension2']};
        }
        return controller.calculateArea(v['shape'], dims);
      },
    );
  }

  // 🔬 SCIENCE CALCULATORS (8)
  static Widget getPhysicsCalculator(BuildContext context) {
    final controller = Provider.of<ScienceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Fizik Hesaplayıcı',
      emoji: '⚛️',
      primaryColor: AppColors.electricViolet,
      fields: [
        CalculatorField(key: 'formula', label: 'Formül', type: FieldType.dropdown, defaultValue: 'force', options: [
          {'label': 'Kuvvet (F=ma)', 'value': 'force'},
          {'label': 'Kinetik Enerji', 'value': 'kinetic_energy'},
          {'label': 'Potansiyel Enerji', 'value': 'potential_energy'},
          {'label': 'Momentum', 'value': 'momentum'},
        ]),
        CalculatorField(key: 'value1', label: 'Değer 1', type: FieldType.number, defaultValue: 10.0),
        CalculatorField(key: 'value2', label: 'Değer 2', type: FieldType.number, defaultValue: 5.0),
      ],
      onCalculate: (v) {
        Map<String, double> values = {};
        if (v['formula'] == 'force') {
          values = {'mass': v['value1'], 'acceleration': v['value2']};
        } else if (v['formula'] == 'kinetic_energy') {
          values = {'mass': v['value1'], 'velocity': v['value2']};
        } else if (v['formula'] == 'potential_energy') {
          values = {'mass': v['value1'], 'height': v['value2']};
        } else {
          values = {'mass': v['value1'], 'velocity': v['value2']};
        }
        return controller.calculatePhysics(v['formula'], values);
      },
    );
  }

  static Widget getChemistryCalculator(BuildContext context) {
    final controller = Provider.of<ScienceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Kimya Hesaplayıcı',
      emoji: '🧪',
      primaryColor: AppColors.electricViolet,
      fields: [
        CalculatorField(key: 'type', label: 'Hesaplama', type: FieldType.dropdown, defaultValue: 'moles', options: [
          {'label': 'Mol Hesaplama', 'value': 'moles'},
          {'label': 'Molarite', 'value': 'molarity'},
          {'label': 'pH', 'value': 'ph'},
        ]),
        CalculatorField(key: 'value1', label: 'Değer 1', type: FieldType.number, defaultValue: 100.0),
        CalculatorField(key: 'value2', label: 'Değer 2', type: FieldType.number, defaultValue: 50.0),
      ],
      onCalculate: (v) {
        Map<String, double> values = {};
        if (v['type'] == 'moles') {
          values = {'mass': v['value1'], 'molar_mass': v['value2']};
        } else if (v['type'] == 'molarity') {
          values = {'moles': v['value1'], 'volume': v['value2']};
        } else {
          values = {'h_concentration': v['value1']};
        }
        return controller.calculateChemistry(v['type'], values);
      },
    );
  }

  static Widget getElectricalCalculator(BuildContext context) {
    final controller = Provider.of<ScienceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Elektrik Hesaplayıcı',
      emoji: '⚡',
      primaryColor: AppColors.electricViolet,
      fields: [
        CalculatorField(key: 'voltage', label: 'Voltaj', type: FieldType.number, suffix: 'V', defaultValue: 220.0),
        CalculatorField(key: 'current', label: 'Akım', type: FieldType.number, suffix: 'A', defaultValue: 10.0),
        CalculatorField(key: 'resistance', label: 'Direnç', type: FieldType.number, suffix: 'Ω', defaultValue: 22.0),
      ],
      onCalculate: (v) => controller.calculateElectrical('power', v),
    );
  }

  static Widget getOpticsCalculator(BuildContext context) {
    final controller = Provider.of<ScienceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Optik Hesaplayıcı',
      emoji: '🔭',
      primaryColor: AppColors.electricViolet,
      fields: [
        CalculatorField(key: 'focal_length', label: 'Odak Uzaklığı', type: FieldType.number, suffix: 'cm', defaultValue: 20.0),
        CalculatorField(key: 'object_distance', label: 'Cisim Mesafesi', type: FieldType.number, suffix: 'cm', defaultValue: 30.0),
      ],
      onCalculate: (v) => controller.calculateOptics('lens_equation', v),
    );
  }

  static Widget getMechanicsCalculator(BuildContext context) {
    final controller = Provider.of<ScienceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Mekanik Hesaplayıcı',
      emoji: '⚙️',
      primaryColor: AppColors.electricViolet,
      fields: [
        CalculatorField(key: 'initial_velocity', label: 'Başlangıç Hızı', type: FieldType.number, suffix: 'm/s', defaultValue: 0.0),
        CalculatorField(key: 'acceleration', label: 'İvme', type: FieldType.number, suffix: 'm/s²', defaultValue: 9.81),
        CalculatorField(key: 'time', label: 'Zaman', type: FieldType.number, suffix: 's', defaultValue: 5.0),
      ],
      onCalculate: (v) => controller.calculateMechanics('velocity', v),
    );
  }

  static Widget getThermodynamicsCalculator(BuildContext context) {
    final controller = Provider.of<ScienceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Termodinamik Hesaplayıcı',
      emoji: '🌡️',
      primaryColor: AppColors.electricViolet,
      fields: [
        CalculatorField(key: 'mass', label: 'Kütle', type: FieldType.number, suffix: 'kg', defaultValue: 1.0),
        CalculatorField(key: 'specific_heat', label: 'Özgül Isı', type: FieldType.number, suffix: 'J/kg·K', defaultValue: 4186.0),
        CalculatorField(key: 'temperature_change', label: 'Sıcaklık Değişimi', type: FieldType.number, suffix: '°C', defaultValue: 10.0),
      ],
      onCalculate: (v) => controller.calculateThermodynamics('heat_transfer', v),
    );
  }

  static Widget getAtomicCalculator(BuildContext context) {
    final controller = Provider.of<ScienceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Atom Fiziği Hesaplayıcı',
      emoji: '☢️',
      primaryColor: AppColors.electricViolet,
      fields: [
        CalculatorField(key: 'wavelength', label: 'Dalga Boyu', type: FieldType.number, suffix: 'm', defaultValue: 5e-7),
      ],
      onCalculate: (v) => controller.calculateAtomic('energy_photon', v),
    );
  }

  static Widget getWaveCalculator(BuildContext context) {
    final controller = Provider.of<ScienceCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Dalga Hesaplayıcı',
      emoji: '〰️',
      primaryColor: AppColors.electricViolet,
      fields: [
        CalculatorField(key: 'frequency', label: 'Frekans', type: FieldType.number, suffix: 'Hz', defaultValue: 440.0),
        CalculatorField(key: 'wavelength', label: 'Dalga Boyu', type: FieldType.number, suffix: 'm', defaultValue: 0.77),
      ],
      onCalculate: (v) => controller.calculateWave('wave_speed', v),
    );
  }

  // 💼 BUSINESS CALCULATORS (6)
  static Widget getSalaryCalculator(BuildContext context) {
    final controller = Provider.of<BusinessCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Maaş Hesaplayıcı',
      emoji: '💰',
      primaryColor: AppColors.oceanBlue,
      fields: [
        CalculatorField(key: 'gross', label: 'Brüt Maaş', type: FieldType.number, suffix: '₺', defaultValue: 30000.0),
        CalculatorField(key: 'children', label: 'Çocuk Var', type: FieldType.switch_toggle, defaultValue: false),
        CalculatorField(key: 'count', label: 'Çocuk Sayısı', type: FieldType.integer, defaultValue: 0),
      ],
      onCalculate: (v) => controller.calculateSalary(v['gross'], v['children'], v['count']),
    );
  }

  static Widget getProfitLossCalculator(BuildContext context) {
    final controller = Provider.of<BusinessCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Kar/Zarar Hesaplayıcı',
      emoji: '📈',
      primaryColor: AppColors.oceanBlue,
      fields: [
        CalculatorField(key: 'revenue', label: 'Gelir', type: FieldType.number, suffix: '₺', defaultValue: 1000000.0),
        CalculatorField(key: 'cogs', label: 'Satış Maliyeti', type: FieldType.number, suffix: '₺', defaultValue: 600000.0),
        CalculatorField(key: 'opex', label: 'İşletme Giderleri', type: FieldType.number, suffix: '₺', defaultValue: 200000.0),
        CalculatorField(key: 'other_income', label: 'Diğer Gelir', type: FieldType.number, suffix: '₺', defaultValue: 0.0),
        CalculatorField(key: 'other_expense', label: 'Diğer Gider', type: FieldType.number, suffix: '₺', defaultValue: 0.0),
      ],
      onCalculate: (v) => controller.calculateProfitLoss(v['revenue'], v['cogs'], v['opex'], v['other_income'], v['other_expense']),
    );
  }

  static Widget getBusinessROICalculator(BuildContext context) {
    final controller = Provider.of<BusinessCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'İş ROI Hesaplayıcı',
      emoji: '📊',
      primaryColor: AppColors.oceanBlue,
      fields: [
        CalculatorField(key: 'investment', label: 'Yatırım', type: FieldType.number, suffix: '₺', defaultValue: 50000.0),
        CalculatorField(key: 'final', label: 'Final Değer', type: FieldType.number, suffix: '₺', defaultValue: 75000.0),
        CalculatorField(key: 'costs', label: 'Ek Maliyetler', type: FieldType.number, suffix: '₺', defaultValue: 5000.0),
        CalculatorField(key: 'years', label: 'Yıl', type: FieldType.integer, defaultValue: 2),
      ],
      onCalculate: (v) => controller.calculateROI(v['investment'], v['final'], v['costs'], v['years']),
    );
  }

  static Widget getWorkingHoursCalculator(BuildContext context) {
    final controller = Provider.of<BusinessCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Çalışma Saati Hesaplayıcı',
      emoji: '⏰',
      primaryColor: AppColors.oceanBlue,
      fields: [
        CalculatorField(key: 'hours_day', label: 'Günlük Saat', type: FieldType.number, defaultValue: 8.0),
        CalculatorField(key: 'days_week', label: 'Haftalık Gün', type: FieldType.number, defaultValue: 5.0),
        CalculatorField(key: 'hourly_rate', label: 'Saatlik Ücret', type: FieldType.number, suffix: '₺', defaultValue: 100.0),
        CalculatorField(key: 'overtime_mult', label: 'Mesai Katsayısı', type: FieldType.number, defaultValue: 1.5),
        CalculatorField(key: 'overtime_hours', label: 'Haftalık Mesai', type: FieldType.number, defaultValue: 5.0),
      ],
      onCalculate: (v) => controller.calculateWorkingHours(v['hours_day'], v['days_week'], v['hourly_rate'], v['overtime_mult'], v['overtime_hours']),
    );
  }

  static Widget getCommissionCalculator(BuildContext context) {
    final controller = Provider.of<BusinessCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Prim Hesaplayıcı',
      emoji: '💸',
      primaryColor: AppColors.oceanBlue,
      fields: [
        CalculatorField(key: 'base', label: 'Taban Maaş', type: FieldType.number, suffix: '₺', defaultValue: 20000.0),
        CalculatorField(key: 'sales', label: 'Toplam Satış', type: FieldType.number, suffix: '₺', defaultValue: 500000.0),
        CalculatorField(key: 'commission', label: 'Komisyon Oranı', type: FieldType.number, suffix: '%', defaultValue: 2.0),
        CalculatorField(key: 'threshold', label: 'Bonus Eşiği', type: FieldType.number, suffix: '₺', defaultValue: 300000.0),
        CalculatorField(key: 'bonus_rate', label: 'Bonus Oranı', type: FieldType.number, suffix: '%', defaultValue: 1.0),
      ],
      onCalculate: (v) => controller.calculateCommission(v['base'], v['sales'], v['commission'], v['threshold'], v['bonus_rate']),
    );
  }

  static Widget getInvoiceCalculator(BuildContext context) {
    final controller = Provider.of<BusinessCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Fatura Hesaplayıcı',
      emoji: '🧾',
      primaryColor: AppColors.oceanBlue,
      fields: [
        CalculatorField(key: 'amount', label: 'Tutar', type: FieldType.number, suffix: '₺', defaultValue: 1000.0),
        CalculatorField(key: 'vat', label: 'KDV Oranı', type: FieldType.number, suffix: '%', defaultValue: 20.0),
        CalculatorField(key: 'discount', label: 'İndirim', type: FieldType.number, suffix: '%', defaultValue: 0.0),
        CalculatorField(key: 'shipping', label: 'Kargo', type: FieldType.number, suffix: '₺', defaultValue: 0.0),
      ],
      onCalculate: (v) {
        List<Map<String, double>> items = [{'quantity': 1.0, 'unit_price': v['amount']}];
        return controller.calculateInvoice(items, v['vat'], v['discount'], v['shipping']);
      },
    );
  }

  // 🏠 DAILY CALCULATORS (5)
  static Widget getShoppingCalculator(BuildContext context) {
    final controller = Provider.of<DailyCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Alışveriş Hesaplayıcı',
      emoji: '🛒',
      primaryColor: AppColors.royalPurple,
      fields: [
        CalculatorField(key: 'total', label: 'Toplam Tutar', type: FieldType.number, suffix: '₺', defaultValue: 500.0),
        CalculatorField(key: 'budget', label: 'Bütçe', type: FieldType.number, suffix: '₺', defaultValue: 600.0),
        CalculatorField(key: 'discount', label: 'İndirim', type: FieldType.number, suffix: '%', defaultValue: 10.0),
        CalculatorField(key: 'cashback', label: 'Para İadesi', type: FieldType.number, suffix: '%', defaultValue: 5.0),
      ],
      onCalculate: (v) {
        List<Map<String, double>> items = [{'price': v['total'], 'quantity': 1.0}];
        return controller.calculateShopping(items, v['budget'], v['discount'], v['cashback']);
      },
    );
  }

  static Widget getFuelCalculator(BuildContext context) {
    final controller = Provider.of<DailyCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Yakıt Hesaplayıcı',
      emoji: '⛽',
      primaryColor: AppColors.royalPurple,
      fields: [
        CalculatorField(key: 'distance', label: 'Mesafe', type: FieldType.number, suffix: 'km', defaultValue: 100.0),
        CalculatorField(key: 'consumption', label: 'Tüketim', type: FieldType.number, suffix: 'L/100km', defaultValue: 6.5),
        CalculatorField(key: 'price', label: 'Yakıt Fiyatı', type: FieldType.number, suffix: '₺/L', defaultValue: 40.0),
      ],
      onCalculate: (v) => controller.calculateFuel(v['distance'], v['consumption'], v['price']),
    );
  }

  static Widget getTimeCalculator(BuildContext context) {
    final controller = Provider.of<DailyCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Zaman Hesaplayıcı',
      emoji: '⏱️',
      primaryColor: AppColors.royalPurple,
      fields: [
        CalculatorField(key: 'hours', label: 'Saat', type: FieldType.integer, defaultValue: 2),
        CalculatorField(key: 'minutes', label: 'Dakika', type: FieldType.integer, defaultValue: 30),
        CalculatorField(key: 'seconds', label: 'Saniye', type: FieldType.integer, defaultValue: 0),
      ],
      onCalculate: (v) {
        Map<String, double> time1 = {'hours': v['hours'].toDouble(), 'minutes': v['minutes'].toDouble(), 'seconds': v['seconds'].toDouble()};
        return controller.calculateTime('convert', time1, null);
      },
    );
  }

  static Widget getRecipeCalculator(BuildContext context) {
    final controller = Provider.of<DailyCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Tarif Hesaplayıcı',
      emoji: '👨‍🍳',
      primaryColor: AppColors.royalPurple,
      fields: [
        CalculatorField(key: 'original', label: 'Orijinal Porsiyon', type: FieldType.number, defaultValue: 4.0),
        CalculatorField(key: 'desired', label: 'İstenen Porsiyon', type: FieldType.number, defaultValue: 6.0),
      ],
      onCalculate: (v) {
        Map<String, double> ingredients = {'un': 200.0, 'su': 100.0, 'tuz': 5.0};
        return controller.calculateRecipe(v['original'], v['desired'], ingredients);
      },
    );
  }

  static Widget getTipCalculator2(BuildContext context) {
    final controller = Provider.of<DailyCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Bahşiş Hesaplayıcı',
      emoji: '💵',
      primaryColor: AppColors.royalPurple,
      fields: [
        CalculatorField(key: 'bill', label: 'Hesap', type: FieldType.number, suffix: '₺', defaultValue: 250.0),
        CalculatorField(key: 'tip', label: 'Bahşiş', type: FieldType.slider, suffix: '%', defaultValue: 15.0, min: 0, max: 30, divisions: 60, decimals: 1),
        CalculatorField(key: 'people', label: 'Kişi Sayısı', type: FieldType.integer, defaultValue: 4),
        CalculatorField(key: 'service', label: 'Servis Ücreti', type: FieldType.number, suffix: '₺', defaultValue: 0.0),
      ],
      onCalculate: (v) => controller.calculateTip(v['bill'], v['tip'], v['people'], v['service']),
    );
  }

  // 🎓 EDUCATION CALCULATORS (5)
  static Widget getGPACalculator(BuildContext context) {
    final controller = Provider.of<EducationCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Not Ortalaması Hesaplayıcı',
      emoji: '📚',
      primaryColor: AppColors.neonPink,
      fields: [
        CalculatorField(key: 'grade1', label: 'Ders 1 Notu', type: FieldType.number, defaultValue: 3.5),
        CalculatorField(key: 'credit1', label: 'Kredi 1', type: FieldType.integer, defaultValue: 3),
        CalculatorField(key: 'grade2', label: 'Ders 2 Notu', type: FieldType.number, defaultValue: 3.0),
        CalculatorField(key: 'credit2', label: 'Kredi 2', type: FieldType.integer, defaultValue: 4),
        CalculatorField(key: 'grade3', label: 'Ders 3 Notu', type: FieldType.number, defaultValue: 4.0),
        CalculatorField(key: 'credit3', label: 'Kredi 3', type: FieldType.integer, defaultValue: 2),
      ],
      onCalculate: (v) {
        List<Map<String, dynamic>> courses = [
          {'grade': v['grade1'], 'credits': v['credit1']},
          {'grade': v['grade2'], 'credits': v['credit2']},
          {'grade': v['grade3'], 'credits': v['credit3']},
        ];
        return controller.calculateGPA(courses);
      },
    );
  }

  static Widget getPercentageCalculator(BuildContext context) {
    final controller = Provider.of<EducationCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Yüzdelik Hesaplayıcı',
      emoji: '📊',
      primaryColor: AppColors.neonPink,
      fields: [
        CalculatorField(key: 'type', label: 'Hesaplama Tipi', type: FieldType.dropdown, defaultValue: 'basic', options: [
          {'label': 'X, Y\'nin yüzde kaçı?', 'value': 'basic'},
          {'label': 'Y\'nin %X\'i kaç?', 'value': 'find_value'},
          {'label': 'X, neyin %Y\'si?', 'value': 'find_total'},
          {'label': 'Yüzde Değişim', 'value': 'percentage_change'},
        ]),
        CalculatorField(key: 'value1', label: 'Değer 1', type: FieldType.number, defaultValue: 50.0),
        CalculatorField(key: 'value2', label: 'Değer 2', type: FieldType.number, defaultValue: 200.0),
      ],
      onCalculate: (v) {
        Map<String, double> values = {};
        if (v['type'] == 'basic') {
          values = {'x': v['value1'], 'y': v['value2']};
        } else if (v['type'] == 'find_value') {
          values = {'percentage': v['value1'], 'total': v['value2']};
        } else if (v['type'] == 'find_total') {
          values = {'value': v['value1'], 'percentage': v['value2']};
        } else {
          values = {'old_value': v['value1'], 'new_value': v['value2']};
        }
        return controller.calculatePercentage(v['type'], values);
      },
    );
  }

  static Widget getGeometryCalculator(BuildContext context) {
    final controller = Provider.of<EducationCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Geometri Hesaplayıcı',
      emoji: '📐',
      primaryColor: AppColors.neonPink,
      fields: [
        CalculatorField(key: 'shape', label: 'Şekil', type: FieldType.dropdown, defaultValue: 'square', options: [
          {'label': 'Kare', 'value': 'square'},
          {'label': 'Dikdörtgen', 'value': 'rectangle'},
          {'label': 'Daire', 'value': 'circle'},
          {'label': 'Üçgen', 'value': 'triangle'},
          {'label': 'Küp', 'value': 'cube'},
          {'label': 'Küre', 'value': 'sphere'},
        ]),
        CalculatorField(key: 'dimension1', label: 'Boyut 1', type: FieldType.number, defaultValue: 10.0),
        CalculatorField(key: 'dimension2', label: 'Boyut 2', type: FieldType.number, defaultValue: 5.0),
      ],
      onCalculate: (v) {
        Map<String, double> dims = {};
        if (v['shape'] == 'square' || v['shape'] == 'cube') {
          dims = {'side': v['dimension1']};
        } else if (v['shape'] == 'circle' || v['shape'] == 'sphere') {
          dims = {'radius': v['dimension1']};
        } else if (v['shape'] == 'rectangle') {
          dims = {'length': v['dimension1'], 'width': v['dimension2']};
        } else {
          dims = {'base': v['dimension1'], 'height': v['dimension2']};
        }
        return controller.calculateGeometry(v['shape'], dims);
      },
    );
  }

  static Widget getStatisticsCalculator2(BuildContext context) {
    final controller = Provider.of<EducationCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'İstatistik Hesaplayıcı',
      emoji: '📈',
      primaryColor: AppColors.neonPink,
      fields: [
        CalculatorField(key: 'data', label: 'Veri (virgülle ayrılmış)', type: FieldType.number, defaultValue: 0.0),
      ],
      onCalculate: (v) {
        // Simplified - in real app would parse comma-separated values
        List<double> data = [85, 90, 78, 92, 88, 95, 82, 89];
        return controller.calculateStatistics(data);
      },
    );
  }

  static Widget getProbabilityCalculator(BuildContext context) {
    final controller = Provider.of<EducationCalculatorsController>(context, listen: false);
    return UniversalCalculatorScreen(
      title: 'Olasılık Hesaplayıcı',
      emoji: '🎲',
      primaryColor: AppColors.neonPink,
      fields: [
        CalculatorField(key: 'type', label: 'Hesaplama Tipi', type: FieldType.dropdown, defaultValue: 'basic', options: [
          {'label': 'Temel Olasılık', 'value': 'basic'},
          {'label': 'Ve (AND)', 'value': 'and'},
          {'label': 'Veya (OR)', 'value': 'or'},
          {'label': 'Değil (NOT)', 'value': 'not'},
          {'label': 'Zar', 'value': 'dice'},
        ]),
        CalculatorField(key: 'value1', label: 'Değer 1', type: FieldType.number, defaultValue: 1.0),
        CalculatorField(key: 'value2', label: 'Değer 2', type: FieldType.number, defaultValue: 6.0),
      ],
      onCalculate: (v) {
        Map<String, double> values = {};
        if (v['type'] == 'basic') {
          values = {'favorable': v['value1'], 'total': v['value2']};
        } else if (v['type'] == 'and' || v['type'] == 'or') {
          values = {'p_a': v['value1'], 'p_b': v['value2']};
        } else if (v['type'] == 'not') {
          values = {'p_a': v['value1']};
        } else {
          values = {'dice': v['value1'], 'target': v['value2']};
        }
        return controller.calculateProbability(v['type'], values);
      },
    );
  }
}