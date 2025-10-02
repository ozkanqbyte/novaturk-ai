import 'package:flutter/material.dart';
import '../../utils/calculator_formatter.dart';

/// 🏠 DAILY CALCULATORS CONTROLLER
/// 5 Günlük Hesaplayıcı: Alışveriş, Bahşiş, Tarif, Yakıt, Zaman

class DailyCalculatorsController extends ChangeNotifier {
  // Dinamik sayı formatlama (dile göre)
  static String _formatNumber(double number, {int decimals = 2}) {
    return CalculatorFormatter.formatNumber(number, decimals: decimals);
  }

  static String _formatMoney(double amount) {
    return CalculatorFormatter.formatMoney(amount);
  }

  static String _formatPercent(double percent) {
    return CalculatorFormatter.formatPercent(percent);
  }
  // Shopping Calculator (Budget & Savings)
  Map<String, double> calculateShopping(
    List<Map<String, double>> items, // {price, quantity}
    double budget,
    double couponDiscount, // percentage
    double cashbackRate, // percentage
  ) {
    double subtotal = 0;
    int itemCount = 0;
    
    for (var item in items) {
      double price = item['price'] ?? 0;
      double quantity = item['quantity'] ?? 1;
      subtotal += price * quantity;
      itemCount++;
    }
    
    double discountAmount = subtotal * (couponDiscount / 100);
    double totalAfterDiscount = subtotal - discountAmount;
    
    double cashbackAmount = totalAfterDiscount * (cashbackRate / 100);
    double finalTotal = totalAfterDiscount - cashbackAmount;
    
    double budgetRemaining = budget - finalTotal;
    double budgetUsedPercentage = (finalTotal / budget) * 100;
    
    double totalSavings = discountAmount + cashbackAmount;
    double savingsPercentage = (totalSavings / subtotal) * 100;
    
    return {
      'subtotal': subtotal,
      'items_count': itemCount.toDouble(),
      'discount_amount': discountAmount,
      'cashback_amount': cashbackAmount,
      'total_savings': totalSavings,
      'savings_percentage': savingsPercentage,
      'final_total': finalTotal,
      'budget': budget,
      'budget_remaining': budgetRemaining,
      'budget_used_percentage': budgetUsedPercentage,
      'average_item_price': subtotal / itemCount,
    };
  }

  // Tip Calculator (Enhanced - already exists but adding more features)
  Map<String, double> calculateTip(
    double billAmount,
    double tipPercentage,
    int numberOfPeople,
    double serviceCharge, // flat rate
  ) {
    double tipAmount = billAmount * (tipPercentage / 100);
    double totalWithTip = billAmount + tipAmount + serviceCharge;
    
    double perPersonTotal = totalWithTip / numberOfPeople;
    double perPersonTip = (tipAmount + serviceCharge) / numberOfPeople;
    double perPersonBill = billAmount / numberOfPeople;
    
    return {
      'bill_amount': billAmount,
      'tip_percentage': tipPercentage,
      'tip_amount': tipAmount,
      'service_charge': serviceCharge,
      'total_tip_and_service': tipAmount + serviceCharge,
      'total_amount': totalWithTip,
      'number_of_people': numberOfPeople.toDouble(),
      'per_person_bill': perPersonBill,
      'per_person_tip': perPersonTip,
      'per_person_total': perPersonTotal,
    };
  }

  // Recipe Calculator (Scaling)
  Map<String, double> calculateRecipe(
    double originalServings,
    double desiredServings,
    Map<String, double> ingredients, // {ingredient_name: amount}
  ) {
    double scaleFactor = desiredServings / originalServings;
    
    Map<String, double> scaledIngredients = {};
    for (var entry in ingredients.entries) {
      scaledIngredients[entry.key] = entry.value * scaleFactor;
    }
    
    return {
      'original_servings': originalServings,
      'desired_servings': desiredServings,
      'scale_factor': scaleFactor,
      'ingredients_count': ingredients.length.toDouble(),
      ...scaledIngredients,
    };
  }

  // Fuel Calculator
  Map<String, double> calculateFuel(
    double distance,
    double fuelConsumption, // L/100km
    double fuelPrice, // per liter
  ) {
    // Fuel needed
    double fuelNeeded = (distance / 100) * fuelConsumption;
    
    // Total cost
    double totalCost = fuelNeeded * fuelPrice;
    
    // Cost per km
    double costPerKm = totalCost / distance;
    
    // Efficiency metrics
    double kmPerLiter = 100 / fuelConsumption;
    double litersPer100Km = fuelConsumption;
    
    return {
      'distance_km': distance,
      'fuel_consumption_l_per_100km': fuelConsumption,
      'fuel_price_per_liter': fuelPrice,
      'fuel_needed_liters': fuelNeeded,
      'total_cost': totalCost,
      'cost_per_km': costPerKm,
      'km_per_liter': kmPerLiter,
      'liters_per_100km': litersPer100Km,
    };
  }

  // Fuel Cost Comparison
  Map<String, double> compareFuelCosts(
    double distance,
    double car1Consumption,
    double car2Consumption,
    double fuelPrice,
  ) {
    var car1 = calculateFuel(distance, car1Consumption, fuelPrice);
    var car2 = calculateFuel(distance, car2Consumption, fuelPrice);
    
    double costDifference = (car1['total_cost'] ?? 0) - (car2['total_cost'] ?? 0);
    double fuelDifference = (car1['fuel_needed_liters'] ?? 0) - (car2['fuel_needed_liters'] ?? 0);
    
    return {
      'car1_total_cost': car1['total_cost'] ?? 0,
      'car2_total_cost': car2['total_cost'] ?? 0,
      'cost_difference': costDifference,
      'car1_fuel_needed': car1['fuel_needed_liters'] ?? 0,
      'car2_fuel_needed': car2['fuel_needed_liters'] ?? 0,
      'fuel_difference': fuelDifference,
      'percentage_savings': ((costDifference.abs() / (car1['total_cost'] ?? 1)) * 100),
    };
  }

  // Time Calculator
  Map<String, double> calculateTime(
    String operation, // add, subtract, multiply, convert
    Map<String, double> time1, // {hours, minutes, seconds}
    Map<String, double>? time2,
  ) {
    // Convert to seconds
    double seconds1 = (time1['hours'] ?? 0) * 3600 + 
                     (time1['minutes'] ?? 0) * 60 + 
                     (time1['seconds'] ?? 0);
    
    double resultSeconds = seconds1;
    
    if (time2 != null && (operation == 'add' || operation == 'subtract')) {
      double seconds2 = (time2['hours'] ?? 0) * 3600 + 
                       (time2['minutes'] ?? 0) * 60 + 
                       (time2['seconds'] ?? 0);
      
      if (operation == 'add') {
        resultSeconds = seconds1 + seconds2;
      } else if (operation == 'subtract') {
        resultSeconds = seconds1 - seconds2;
      }
    } else if (operation == 'multiply' && time2 != null) {
      double multiplier = time2['multiplier'] ?? 1;
      resultSeconds = seconds1 * multiplier;
    }
    
    // Convert back to hours, minutes, seconds
    int hours = (resultSeconds / 3600).floor();
    int minutes = ((resultSeconds % 3600) / 60).floor();
    int seconds = (resultSeconds % 60).floor();
    
    return {
      'total_seconds': resultSeconds,
      'hours': hours.toDouble(),
      'minutes': minutes.toDouble(),
      'seconds': seconds.toDouble(),
      'total_minutes': resultSeconds / 60,
      'total_hours': resultSeconds / 3600,
      'days': resultSeconds / 86400,
      'weeks': resultSeconds / 604800,
    };
  }

  // Travel Time Calculator
  Map<String, double> calculateTravelTime(
    double distance,
    double speed,
  ) {
    double timeHours = distance / speed;
    double timeMinutes = timeHours * 60;
    
    int hours = timeHours.floor();
    int minutes = ((timeHours - hours) * 60).floor();
    
    return {
      'distance_km': distance,
      'speed_kmh': speed,
      'time_hours': timeHours,
      'time_minutes': timeMinutes,
      'hours_part': hours.toDouble(),
      'minutes_part': minutes.toDouble(),
    };
  }

  // Age Calculator
  Map<String, dynamic> calculateAge(DateTime birthDate) {
    DateTime now = DateTime.now();
    
    int years = now.year - birthDate.year;
    int months = now.month - birthDate.month;
    int days = now.day - birthDate.day;
    
    if (days < 0) {
      months--;
      days += DateTime(now.year, now.month, 0).day;
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    int totalDays = now.difference(birthDate).inDays;
    int totalWeeks = (totalDays / 7).floor();
    int totalMonths = years * 12 + months;
    
    // Next birthday
    DateTime nextBirthday = DateTime(now.year, birthDate.month, birthDate.day);
    if (nextBirthday.isBefore(now)) {
      nextBirthday = DateTime(now.year + 1, birthDate.month, birthDate.day);
    }
    int daysUntilBirthday = nextBirthday.difference(now).inDays;
    
    return {
      'years': years.toDouble(),
      'months': months.toDouble(),
      'days': days.toDouble(),
      'total_days': totalDays.toDouble(),
      'total_weeks': totalWeeks.toDouble(),
      'total_months': totalMonths.toDouble(),
      'days_until_birthday': daysUntilBirthday.toDouble(),
      'next_birthday': nextBirthday,
    };
  }

  // Sleep Calculator (Sleep Cycles)
  Map<String, dynamic> calculateSleep(
    DateTime bedTime,
    int desiredCycles, // Each cycle ~90 minutes
  ) {
    int cycleMinutes = 90;
    int totalSleepMinutes = desiredCycles * cycleMinutes + 14; // 14 min to fall asleep
    
    DateTime wakeTime = bedTime.add(Duration(minutes: totalSleepMinutes));
    
    return {
      'bed_time': bedTime,
      'wake_time': wakeTime,
      'sleep_cycles': desiredCycles.toDouble(),
      'total_sleep_minutes': totalSleepMinutes.toDouble(),
      'total_sleep_hours': (totalSleepMinutes / 60),
    };
  }
}