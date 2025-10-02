import 'package:flutter/material.dart';
import 'dart:math';
import '../../utils/calculator_formatter.dart';

/// 🎓 EDUCATION CALCULATORS CONTROLLER
/// 5 Eğitim Hesaplayıcısı: Not Ortalaması, Yüzdelik, Geometri, İstatistik, Olasılık

class EducationCalculatorsController extends ChangeNotifier {
  // Dinamik sayı formatlama (dile göre)
  static String _formatNumber(double number, {int decimals = 2}) {
    return CalculatorFormatter.formatNumber(number, decimals: decimals);
  }
  // GPA Calculator (Grade Point Average)
  Map<String, double> calculateGPA(
    List<Map<String, dynamic>> courses, // {grade: double, credits: int}
  ) {
    double totalPoints = 0;
    int totalCredits = 0;
    
    for (var course in courses) {
      double grade = (course['grade'] ?? 0.0) as double;
      int credits = (course['credits'] ?? 0) as int;
      totalPoints += grade * credits;
      totalCredits += credits;
    }
    
    double gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    
    // Letter grade equivalent
    String letterGrade = getLetterGrade(gpa);
    
    // Performance level
    String performance = getPerformanceLevel(gpa);
    
    return {
      'gpa': gpa,
      'total_credits': totalCredits.toDouble(),
      'total_points': totalPoints,
      'courses_count': courses.length.toDouble(),
    };
  }

  String getLetterGrade(double gpa) {
    if (gpa >= 4.0) return 'AA';
    if (gpa >= 3.5) return 'BA';
    if (gpa >= 3.0) return 'BB';
    if (gpa >= 2.5) return 'CB';
    if (gpa >= 2.0) return 'CC';
    if (gpa >= 1.5) return 'DC';
    if (gpa >= 1.0) return 'DD';
    return 'FF';
  }

  String getPerformanceLevel(double gpa) {
    if (gpa >= 3.5) return 'Mükemmel';
    if (gpa >= 3.0) return 'Çok İyi';
    if (gpa >= 2.5) return 'İyi';
    if (gpa >= 2.0) return 'Orta';
    return 'Zayıf';
  }

  // Percentage Calculator (Multiple use cases)
  Map<String, double> calculatePercentage(
    String type,
    Map<String, double> values,
  ) {
    switch (type) {
      case 'basic': // X is what % of Y?
        double x = values['x'] ?? 0;
        double y = values['y'] ?? 1;
        return {'percentage': (x / y) * 100};
      
      case 'find_value': // What is X% of Y?
        double percentage = values['percentage'] ?? 0;
        double total = values['total'] ?? 0;
        return {'value': (percentage / 100) * total};
      
      case 'find_total': // X is Y% of what?
        double value = values['value'] ?? 0;
        double percentage = values['percentage'] ?? 1;
        return {'total': (value / percentage) * 100};
      
      case 'percentage_change': // % change from X to Y
        double oldValue = values['old_value'] ?? 1;
        double newValue = values['new_value'] ?? 0;
        double change = newValue - oldValue;
        double percentageChange = (change / oldValue) * 100;
        return {
          'change': change,
          'percentage_change': percentageChange,
          'increase': change > 0 ? 1.0 : 0.0,
        };
      
      case 'percentage_difference': // % difference between X and Y
        double value1 = values['value1'] ?? 0;
        double value2 = values['value2'] ?? 0;
        double average = (value1 + value2) / 2;
        double difference = (value1 - value2).abs();
        return {'percentage_difference': (difference / average) * 100};
      
      default:
        return {};
    }
  }

  // Geometry Calculator
  Map<String, double> calculateGeometry(
    String shape,
    Map<String, double> dimensions,
  ) {
    switch (shape) {
      case 'square':
        double side = dimensions['side'] ?? 0;
        return {
          'area': side * side,
          'perimeter': 4 * side,
          'diagonal': side * sqrt(2),
        };
      
      case 'rectangle':
        double length = dimensions['length'] ?? 0;
        double width = dimensions['width'] ?? 0;
        return {
          'area': length * width,
          'perimeter': 2 * (length + width),
          'diagonal': sqrt(length * length + width * width),
        };
      
      case 'circle':
        double radius = dimensions['radius'] ?? 0;
        return {
          'area': pi * radius * radius,
          'circumference': 2 * pi * radius,
          'diameter': 2 * radius,
        };
      
      case 'triangle':
        double base = dimensions['base'] ?? 0;
        double height = dimensions['height'] ?? 0;
        double side1 = dimensions['side1'] ?? 0;
        double side2 = dimensions['side2'] ?? 0;
        double side3 = dimensions['side3'] ?? 0;
        
        double area = 0.5 * base * height;
        double perimeter = side1 + side2 + side3;
        
        // Heron's formula for area if all sides known
        if (side1 > 0 && side2 > 0 && side3 > 0) {
          double s = perimeter / 2;
          double heronArea = sqrt(s * (s - side1) * (s - side2) * (s - side3));
          area = heronArea;
        }
        
        return {
          'area': area,
          'perimeter': perimeter,
        };
      
      case 'parallelogram':
        double base = dimensions['base'] ?? 0;
        double height = dimensions['height'] ?? 0;
        double side = dimensions['side'] ?? 0;
        return {
          'area': base * height,
          'perimeter': 2 * (base + side),
        };
      
      case 'trapezoid':
        double base1 = dimensions['base1'] ?? 0;
        double base2 = dimensions['base2'] ?? 0;
        double height = dimensions['height'] ?? 0;
        double side1 = dimensions['side1'] ?? 0;
        double side2 = dimensions['side2'] ?? 0;
        return {
          'area': 0.5 * (base1 + base2) * height,
          'perimeter': base1 + base2 + side1 + side2,
        };
      
      case 'cube':
        double side = dimensions['side'] ?? 0;
        return {
          'surface_area': 6 * side * side,
          'volume': side * side * side,
          'diagonal': side * sqrt(3),
        };
      
      case 'sphere':
        double radius = dimensions['radius'] ?? 0;
        return {
          'surface_area': 4 * pi * radius * radius,
          'volume': (4 / 3) * pi * radius * radius * radius,
        };
      
      case 'cylinder':
        double radius = dimensions['radius'] ?? 0;
        double height = dimensions['height'] ?? 0;
        return {
          'surface_area': 2 * pi * radius * (radius + height),
          'volume': pi * radius * radius * height,
          'lateral_area': 2 * pi * radius * height,
        };
      
      case 'cone':
        double radius = dimensions['radius'] ?? 0;
        double height = dimensions['height'] ?? 0;
        double slantHeight = sqrt(radius * radius + height * height);
        return {
          'surface_area': pi * radius * (radius + slantHeight),
          'volume': (1 / 3) * pi * radius * radius * height,
          'slant_height': slantHeight,
        };
      
      case 'rectangular_prism':
        double length = dimensions['length'] ?? 0;
        double width = dimensions['width'] ?? 0;
        double height = dimensions['height'] ?? 0;
        return {
          'surface_area': 2 * (length * width + length * height + width * height),
          'volume': length * width * height,
          'diagonal': sqrt(length * length + width * width + height * height),
        };
      
      default:
        return {};
    }
  }

  // Statistics Calculator (Enhanced - already exists but more formulas)
  Map<String, double> calculateStatistics(List<double> data) {
    if (data.isEmpty) return {};
    
    data.sort();
    int n = data.length;
    
    // Mean
    double mean = data.reduce((a, b) => a + b) / n;
    
    // Median
    double median;
    if (n % 2 == 0) {
      median = (data[n ~/ 2 - 1] + data[n ~/ 2]) / 2;
    } else {
      median = data[n ~/ 2];
    }
    
    // Mode
    Map<double, int> frequency = {};
    for (var value in data) {
      frequency[value] = (frequency[value] ?? 0) + 1;
    }
    int maxFreq = frequency.values.reduce((a, b) => a > b ? a : b);
    double mode = frequency.entries.firstWhere((e) => e.value == maxFreq).key;
    
    // Variance
    double sumSquaredDiff = data.map((x) => pow(x - mean, 2).toDouble()).reduce((a, b) => a + b);
    double variance = sumSquaredDiff / n;
    
    // Standard Deviation
    double stdDev = sqrt(variance);
    
    // Range
    double range = data.last - data.first;
    
    // Quartiles
    double q1, q3;
    if (n % 2 == 0) {
      List<double> lowerHalf = data.sublist(0, n ~/ 2);
      List<double> upperHalf = data.sublist(n ~/ 2);
      q1 = lowerHalf[lowerHalf.length ~/ 2];
      q3 = upperHalf[upperHalf.length ~/ 2];
    } else {
      List<double> lowerHalf = data.sublist(0, n ~/ 2);
      List<double> upperHalf = data.sublist(n ~/ 2 + 1);
      q1 = lowerHalf.length % 2 == 0
          ? (lowerHalf[lowerHalf.length ~/ 2 - 1] + lowerHalf[lowerHalf.length ~/ 2]) / 2
          : lowerHalf[lowerHalf.length ~/ 2];
      q3 = upperHalf.length % 2 == 0
          ? (upperHalf[upperHalf.length ~/ 2 - 1] + upperHalf[upperHalf.length ~/ 2]) / 2
          : upperHalf[upperHalf.length ~/ 2];
    }
    
    double iqr = q3 - q1;
    
    // Coefficient of Variation
    double cv = (stdDev / mean) * 100;
    
    return {
      'mean': mean,
      'median': median,
      'mode': mode,
      'variance': variance,
      'std_dev': stdDev,
      'range': range,
      'min': data.first,
      'max': data.last,
      'q1': q1,
      'q3': q3,
      'iqr': iqr,
      'cv': cv,
      'sum': data.reduce((a, b) => a + b),
      'count': n.toDouble(),
    };
  }

  // Probability Calculator
  Map<String, double> calculateProbability(
    String type,
    Map<String, double> values,
  ) {
    switch (type) {
      case 'basic': // P(A) = favorable / total
        double favorable = values['favorable'] ?? 0;
        double total = values['total'] ?? 1;
        return {'probability': favorable / total};
      
      case 'and': // P(A and B) = P(A) × P(B) for independent events
        double pA = values['p_a'] ?? 0;
        double pB = values['p_b'] ?? 0;
        return {'probability': pA * pB};
      
      case 'or': // P(A or B) = P(A) + P(B) - P(A and B)
        double pA = values['p_a'] ?? 0;
        double pB = values['p_b'] ?? 0;
        double pAandB = values['p_a_and_b'] ?? 0;
        return {'probability': pA + pB - pAandB};
      
      case 'not': // P(not A) = 1 - P(A)
        double pA = values['p_a'] ?? 0;
        return {'probability': 1 - pA};
      
      case 'conditional': // P(A|B) = P(A and B) / P(B)
        double pAandB = values['p_a_and_b'] ?? 0;
        double pB = values['p_b'] ?? 1;
        return {'probability': pAandB / pB};
      
      case 'binomial': // Binomial probability
        int n = values['n']?.toInt() ?? 0; // trials
        int k = values['k']?.toInt() ?? 0; // successes
        double p = values['p'] ?? 0; // probability of success
        
        double nCk = _combination(n, k);
        double probability = nCk * pow(p, k) * pow(1 - p, n - k);
        
        return {'probability': probability};
      
      case 'dice': // Rolling dice
        int dice = values['dice']?.toInt() ?? 1;
        int target = values['target']?.toInt() ?? 7;
        // Simplified - exact calculation would need recursive approach
        double probability = _calculateDiceProbability(dice, target);
        return {'probability': probability};
      
      case 'cards': // Drawing cards
        int drawn = values['drawn']?.toInt() ?? 1;
        int desired = values['desired']?.toInt() ?? 1;
        int deckSize = values['deck_size']?.toInt() ?? 52;
        int desiredInDeck = values['desired_in_deck']?.toInt() ?? 4;
        
        // Hypergeometric distribution
        double probability = _combination(desiredInDeck, desired) *
                           _combination(deckSize - desiredInDeck, drawn - desired) /
                           _combination(deckSize, drawn);
        
        return {'probability': probability};
      
      default:
        return {};
    }
  }

  // Combination formula: nCr = n! / (r! * (n-r)!)
  double _combination(int n, int r) {
    if (r > n) return 0;
    if (r == 0 || r == n) return 1;
    
    double result = 1;
    for (int i = 0; i < r; i++) {
      result *= (n - i);
      result /= (i + 1);
    }
    return result;
  }

  // Simplified dice probability (for common cases)
  double _calculateDiceProbability(int dice, int target) {
    if (dice == 1) {
      return (target >= 1 && target <= 6) ? 1/6 : 0;
    } else if (dice == 2) {
      // Common 2-dice probabilities
      Map<int, int> combinations = {
        2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6,
        8: 5, 9: 4, 10: 3, 11: 2, 12: 1
      };
      return (combinations[target] ?? 0) / 36;
    }
    // For more dice, use approximation
    return 1 / pow(6, dice); // Simplified
  }

  // Expected Value Calculator
  Map<String, double> calculateExpectedValue(
    List<Map<String, double>> outcomes, // {value, probability}
  ) {
    double expectedValue = 0;
    double totalProbability = 0;
    
    for (var outcome in outcomes) {
      double value = outcome['value'] ?? 0;
      double probability = outcome['probability'] ?? 0;
      expectedValue += value * probability;
      totalProbability += probability;
    }
    
    return {
      'expected_value': expectedValue,
      'total_probability': totalProbability,
      'outcomes_count': outcomes.length.toDouble(),
    };
  }
}