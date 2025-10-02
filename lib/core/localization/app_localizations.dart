import 'package:flutter/material.dart';
import 'translations/tr.dart';
import 'translations/en.dart';
import 'translations/de.dart';
import 'translations/fr.dart';
import 'translations/es.dart';
import 'translations/it.dart';
import 'translations/pt.dart';
import 'translations/nl.dart';
import 'translations/pl.dart';
import 'translations/el.dart';
import 'translations/hi.dart';
import 'translations/id.dart';
import 'translations/ms.dart';
import 'translations/ja.dart';
import 'translations/ru.dart';
import 'translations/ar.dart';

/// 🌍 APP LOCALIZATIONS - Çoklu Dil Desteği (16 Dil)
/// Context extension kullanarak kolay erişim: context.loc.appName

class AppLocalizations {
  final Locale locale;
  late Map<String, String> _localizedStrings;

  AppLocalizations(this.locale) {
    _localizedStrings = _getTranslations(locale.languageCode);
  }

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  Map<String, String> _getTranslations(String languageCode) {
    switch (languageCode) {
      case 'tr':
        return TranslationsTR.values;
      case 'en':
        return TranslationsEN.values;
      case 'de':
        return TranslationsDE.values;
      case 'fr':
        return TranslationsFR.values;
      case 'es':
        return TranslationsES.values;
      case 'it':
        return TranslationsIT.values;
      case 'pt':
        return TranslationsPT.values;
      case 'nl':
        return TranslationsNL.values;
      case 'pl':
        return TranslationsPL.values;
      case 'el':
        return TranslationsEL.values;
      case 'hi':
        return TranslationsHI.values;
      case 'id':
        return TranslationsID.values;
      case 'ms':
        return TranslationsMS.values;
      case 'ja':
        return TranslationsJA.values;
      case 'ru':
        return TranslationsRU.values;
      case 'ar':
        return TranslationsAR.values;
      default:
        return TranslationsEN.values;
    }
  }

  String get(String key) => _localizedStrings[key] ?? key;

  // Quick access methods
  String get appName => get('app_name');
  String get calculator => get('calculator');
  String get scientific => get('scientific');
  String get converters => get('converters');
  String get history => get('history');
  String get profile => get('profile');
  String get settings => get('settings');
  String get language => get('language');
  
  // Calculator operations
  String get calculate => get('calculate');
  String get result => get('result');
  String get results => get('results');
  String get clear => get('clear');
  String get delete => get('delete');
  
  // Special Calculators - Finance
  String get financeCalculators => get('finance_calculators');
  String get loanCalculator => get('loan_calculator');
  String get investmentCalculator => get('investment_calculator');
  String get interestCalculator => get('interest_calculator');
  String get currencyConverter => get('currency_converter');
  String get incomeTaxCalculator => get('income_tax_calculator');
  String get vatCalculator => get('vat_calculator');
  String get retirementCalculator => get('retirement_calculator');
  
  // Special Calculators - Health
  String get healthCalculators => get('health_calculators');
  String get bmiCalculator => get('bmi_calculator');
  String get calorieCalculator => get('calorie_calculator');
  String get waterIntakeCalculator => get('water_intake_calculator');
  String get idealWeightCalculator => get('ideal_weight_calculator');
  
  // Finance Terms
  String get principal => get('principal');
  String get monthlyPayment => get('monthly_payment');
  String get totalPayment => get('total_payment');
  String get totalInterest => get('total_interest');
  String get interestRate => get('interest_rate');
  String get term => get('term');
  String get simpleInterest => get('simple_interest');
  String get compoundInterest => get('compound_interest');
  String get finalAmount => get('final_amount');
  String get difference => get('difference');
  String get displayAmount => get('display_amount');
  
  // Health Terms
  String get weight => get('weight');
  String get height => get('height');
  String get age => get('age');
  String get gender => get('gender');
  String get male => get('male');
  String get female => get('female');
  String get bmi => get('bmi');
  String get category => get('category');
  String get bmr => get('bmr');
  String get dailyCalories => get('daily_calories');
  String get protein => get('protein');
  String get carbohydrates => get('carbohydrates');
  String get fat => get('fat');
  
  // Messages
  String get loading => get('loading');
  String get error => get('error');
  String get success => get('success');
  String get cancel => get('cancel');
  String get ok => get('ok');
  String get save => get('save');
  String get search => get('search');
}

// Extension for easy access
extension LocalizationExtension on BuildContext {
  AppLocalizations get loc => AppLocalizations.of(this);
}

// Delegate for MaterialApp
class AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['tr', 'en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'el', 'hi', 'id', 'ms', 'ja', 'ru', 'ar'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(AppLocalizationsDelegate old) => false;
}