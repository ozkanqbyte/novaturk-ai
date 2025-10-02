import 'package:flutter/material.dart';
import '../../models/converter_models.dart';

class DateCalculatorController extends ChangeNotifier {
  DateTime _startDate = DateTime.now();
  DateTime _endDate = DateTime.now().add(const Duration(days: 365));
  DateCalculationResult? _result;

  DateTime get startDate => _startDate;
  DateTime get endDate => _endDate;
  DateCalculationResult? get result => _result;

  void setStartDate(DateTime date) {
    _startDate = date;
    _calculate();
    notifyListeners();
  }

  void setEndDate(DateTime date) {
    _endDate = date;
    _calculate();
    notifyListeners();
  }

  void _calculate() {
    // Calculate difference
    final difference = _endDate.difference(_startDate);
    
    // Calculate years, months, days
    int years = 0;
    int months = 0;
    int days = difference.inDays;

    DateTime tempDate = _startDate;
    
    // Calculate years
    while (tempDate.add(Duration(days: 365)).isBefore(_endDate) ||
           tempDate.add(Duration(days: 365)).isAtSameMomentAs(_endDate)) {
      years++;
      tempDate = tempDate.add(Duration(days: 365));
    }

    // Calculate months
    while (tempDate.month < _endDate.month ||
           (tempDate.month == _endDate.month && tempDate.day <= _endDate.day)) {
      if (tempDate.month == 12) {
        tempDate = DateTime(tempDate.year + 1, 1, tempDate.day);
      } else {
        tempDate = DateTime(tempDate.year, tempDate.month + 1, tempDate.day);
      }
      
      if (tempDate.isBefore(_endDate) || tempDate.isAtSameMomentAs(_endDate)) {
        months++;
      } else {
        break;
      }
    }

    // Remaining days
    final remainingDays = _endDate.difference(tempDate).inDays;

    _result = DateCalculationResult(
      years: years,
      months: months,
      days: remainingDays,
      totalDays: difference.inDays,
      weeks: (difference.inDays / 7).floor(),
      hours: difference.inHours,
      minutes: difference.inMinutes,
    );
  }

  void addDaysToStart(int days) {
    _endDate = _startDate.add(Duration(days: days));
    _calculate();
    notifyListeners();
  }

  void subtractDaysFromEnd(int days) {
    _startDate = _endDate.subtract(Duration(days: days));
    _calculate();
    notifyListeners();
  }

  void reset() {
    _startDate = DateTime.now();
    _endDate = DateTime.now().add(const Duration(days: 365));
    _calculate();
    notifyListeners();
  }
}