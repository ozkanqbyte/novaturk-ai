// Converter Models
// Ultra modern converter models for professional app

// ============================================
// LENGTH CONVERTER MODEL
// ============================================
class LengthUnit {
  final String name;
  final String symbol;
  final double toMeterFactor; // Conversion factor to meters

  const LengthUnit({
    required this.name,
    required this.symbol,
    required this.toMeterFactor,
  });

  static const List<LengthUnit> units = [
    LengthUnit(name: 'Kilometre', symbol: 'km', toMeterFactor: 1000),
    LengthUnit(name: 'Metre', symbol: 'm', toMeterFactor: 1),
    LengthUnit(name: 'Santimetre', symbol: 'cm', toMeterFactor: 0.01),
    LengthUnit(name: 'Milimetre', symbol: 'mm', toMeterFactor: 0.001),
    LengthUnit(name: 'Mikrometre', symbol: 'μm', toMeterFactor: 0.000001),
    LengthUnit(name: 'Nanometre', symbol: 'nm', toMeterFactor: 0.000000001),
    LengthUnit(name: 'Mil', symbol: 'mi', toMeterFactor: 1609.344),
    LengthUnit(name: 'Yard', symbol: 'yd', toMeterFactor: 0.9144),
    LengthUnit(name: 'Feet', symbol: 'ft', toMeterFactor: 0.3048),
    LengthUnit(name: 'İnç', symbol: 'in', toMeterFactor: 0.0254),
    LengthUnit(name: 'Deniz Mili', symbol: 'nmi', toMeterFactor: 1852),
  ];
}

// ============================================
// WEIGHT CONVERTER MODEL
// ============================================
class WeightUnit {
  final String name;
  final String symbol;
  final double toKilogramFactor; // Conversion factor to kilograms

  const WeightUnit({
    required this.name,
    required this.symbol,
    required this.toKilogramFactor,
  });

  static const List<WeightUnit> units = [
    WeightUnit(name: 'Ton', symbol: 't', toKilogramFactor: 1000),
    WeightUnit(name: 'Kilogram', symbol: 'kg', toKilogramFactor: 1),
    WeightUnit(name: 'Gram', symbol: 'g', toKilogramFactor: 0.001),
    WeightUnit(name: 'Miligram', symbol: 'mg', toKilogramFactor: 0.000001),
    WeightUnit(name: 'Mikrogram', symbol: 'μg', toKilogramFactor: 0.000000001),
    WeightUnit(name: 'Pound (lb)', symbol: 'lb', toKilogramFactor: 0.45359237),
    WeightUnit(name: 'Ons', symbol: 'oz', toKilogramFactor: 0.028349523125),
    WeightUnit(name: 'Karat', symbol: 'ct', toKilogramFactor: 0.0002),
    WeightUnit(name: 'İngiliz Tonu', symbol: 'ton (UK)', toKilogramFactor: 1016.0469088),
    WeightUnit(name: 'Amerika Tonu', symbol: 'ton (US)', toKilogramFactor: 907.18474),
  ];
}

// ============================================
// TEMPERATURE CONVERTER MODEL
// ============================================
class TemperatureUnit {
  final String name;
  final String symbol;

  const TemperatureUnit({
    required this.name,
    required this.symbol,
  });

  static const List<TemperatureUnit> units = [
    TemperatureUnit(name: 'Celsius', symbol: '°C'),
    TemperatureUnit(name: 'Fahrenheit', symbol: '°F'),
    TemperatureUnit(name: 'Kelvin', symbol: 'K'),
    TemperatureUnit(name: 'Rankine', symbol: '°R'),
  ];

  // Temperature conversion requires special formulas
  static double convert(double value, String fromUnit, String toUnit) {
    // First convert to Celsius
    double celsius;
    switch (fromUnit) {
      case '°C':
        celsius = value;
        break;
      case '°F':
        celsius = (value - 32) * 5 / 9;
        break;
      case 'K':
        celsius = value - 273.15;
        break;
      case '°R':
        celsius = (value - 491.67) * 5 / 9;
        break;
      default:
        celsius = value;
    }

    // Then convert from Celsius to target unit
    switch (toUnit) {
      case '°C':
        return celsius;
      case '°F':
        return celsius * 9 / 5 + 32;
      case 'K':
        return celsius + 273.15;
      case '°R':
        return celsius * 9 / 5 + 491.67;
      default:
        return celsius;
    }
  }
}

// ============================================
// CURRENCY MODEL
// ============================================
class Currency {
  final String code;
  final String name;
  final String symbol;
  final String flag;

  const Currency({
    required this.code,
    required this.name,
    required this.symbol,
    required this.flag,
  });

  static const List<Currency> currencies = [
    Currency(code: 'TRY', name: 'Türk Lirası', symbol: '₺', flag: '🇹🇷'),
    Currency(code: 'USD', name: 'Amerikan Doları', symbol: '\$', flag: '🇺🇸'),
    Currency(code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺'),
    Currency(code: 'GBP', name: 'İngiliz Sterlini', symbol: '£', flag: '🇬🇧'),
    Currency(code: 'JPY', name: 'Japon Yeni', symbol: '¥', flag: '🇯🇵'),
    Currency(code: 'CHF', name: 'İsviçre Frangı', symbol: 'CHF', flag: '🇨🇭'),
    Currency(code: 'CAD', name: 'Kanada Doları', symbol: 'C\$', flag: '🇨🇦'),
    Currency(code: 'AUD', name: 'Avustralya Doları', symbol: 'A\$', flag: '🇦🇺'),
    Currency(code: 'CNY', name: 'Çin Yuanı', symbol: '¥', flag: '🇨🇳'),
    Currency(code: 'INR', name: 'Hint Rupisi', symbol: '₹', flag: '🇮🇳'),
    Currency(code: 'RUB', name: 'Rus Rublesi', symbol: '₽', flag: '🇷🇺'),
    Currency(code: 'KRW', name: 'Güney Kore Wonu', symbol: '₩', flag: '🇰🇷'),
    Currency(code: 'BRL', name: 'Brezilya Reali', symbol: 'R\$', flag: '🇧🇷'),
    Currency(code: 'MXN', name: 'Meksika Pesosu', symbol: 'MX\$', flag: '🇲🇽'),
    Currency(code: 'SAR', name: 'Suudi Riyali', symbol: 'SR', flag: '🇸🇦'),
    Currency(code: 'AED', name: 'BAE Dirhemi', symbol: 'د.إ', flag: '🇦🇪'),
  ];
}

// ============================================
// DATE CALCULATION RESULT
// ============================================
class DateCalculationResult {
  final int years;
  final int months;
  final int days;
  final int totalDays;
  final int weeks;
  final int hours;
  final int minutes;

  DateCalculationResult({
    required this.years,
    required this.months,
    required this.days,
    required this.totalDays,
    required this.weeks,
    required this.hours,
    required this.minutes,
  });
}

// ============================================
// TIP CALCULATION RESULT
// ============================================
class TipCalculationResult {
  final double billAmount;
  final double tipPercentage;
  final double tipAmount;
  final double totalAmount;
  final int numberOfPeople;
  final double amountPerPerson;
  final double tipPerPerson;

  TipCalculationResult({
    required this.billAmount,
    required this.tipPercentage,
    required this.tipAmount,
    required this.totalAmount,
    required this.numberOfPeople,
    required this.amountPerPerson,
    required this.tipPerPerson,
  });
}

// ============================================
// MORTGAGE CALCULATION RESULT
// ============================================
class MortgageCalculationResult {
  final double loanAmount;
  final double interestRate;
  final int loanTermMonths;
  final double monthlyPayment;
  final double totalPayment;
  final double totalInterest;
  final List<AmortizationEntry> amortizationSchedule;

  MortgageCalculationResult({
    required this.loanAmount,
    required this.interestRate,
    required this.loanTermMonths,
    required this.monthlyPayment,
    required this.totalPayment,
    required this.totalInterest,
    required this.amortizationSchedule,
  });
}

class AmortizationEntry {
  final int month;
  final double payment;
  final double principal;
  final double interest;
  final double balance;

  AmortizationEntry({
    required this.month,
    required this.payment,
    required this.principal,
    required this.interest,
    required this.balance,
  });
}

// ============================================
// STATISTICS CALCULATION RESULT
// ============================================
class StatisticsResult {
  final List<double> data;
  final double mean;
  final double median;
  final double mode;
  final double standardDeviation;
  final double variance;
  final double range;
  final double min;
  final double max;
  final double sum;
  final int count;
  final double q1; // First quartile
  final double q3; // Third quartile
  final double iqr; // Interquartile range

  StatisticsResult({
    required this.data,
    required this.mean,
    required this.median,
    required this.mode,
    required this.standardDeviation,
    required this.variance,
    required this.range,
    required this.min,
    required this.max,
    required this.sum,
    required this.count,
    required this.q1,
    required this.q3,
    required this.iqr,
  });
}