import 'package:flutter/material.dart';
import '../../models/converter_models.dart';

class TipCalculatorController extends ChangeNotifier {
  double _billAmount = 0;
  double _tipPercentage = 15.0;
  int _numberOfPeople = 1;
  TipCalculationResult? _result;

  double get billAmount => _billAmount;
  double get tipPercentage => _tipPercentage;
  int get numberOfPeople => _numberOfPeople;
  TipCalculationResult? get result => _result;

  final List<double> commonTipPercentages = [10, 15, 18, 20, 25];

  void setBillAmount(double amount) {
    _billAmount = amount;
    _calculate();
    notifyListeners();
  }

  void setTipPercentage(double percentage) {
    _tipPercentage = percentage;
    _calculate();
    notifyListeners();
  }

  void setNumberOfPeople(int people) {
    _numberOfPeople = people.clamp(1, 100);
    _calculate();
    notifyListeners();
  }

  void _calculate() {
    if (_billAmount <= 0) {
      _result = null;
      return;
    }

    final tipAmount = _billAmount * (_tipPercentage / 100);
    final totalAmount = _billAmount + tipAmount;
    final amountPerPerson = totalAmount / _numberOfPeople;
    final tipPerPerson = tipAmount / _numberOfPeople;

    _result = TipCalculationResult(
      billAmount: _billAmount,
      tipPercentage: _tipPercentage,
      tipAmount: tipAmount,
      totalAmount: totalAmount,
      numberOfPeople: _numberOfPeople,
      amountPerPerson: amountPerPerson,
      tipPerPerson: tipPerPerson,
    );
  }

  void incrementPeople() {
    setNumberOfPeople(_numberOfPeople + 1);
  }

  void decrementPeople() {
    if (_numberOfPeople > 1) {
      setNumberOfPeople(_numberOfPeople - 1);
    }
  }

  void clear() {
    _billAmount = 0;
    _tipPercentage = 15.0;
    _numberOfPeople = 1;
    _result = null;
    notifyListeners();
  }
}