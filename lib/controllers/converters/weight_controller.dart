import 'package:flutter/material.dart';
import '../../models/converter_models.dart';

class WeightController extends ChangeNotifier {
  WeightUnit _fromUnit = WeightUnit.units[1]; // Kilogram
  WeightUnit _toUnit = WeightUnit.units[2]; // Gram
  double _inputValue = 0;
  double _outputValue = 0;

  WeightUnit get fromUnit => _fromUnit;
  WeightUnit get toUnit => _toUnit;
  double get inputValue => _inputValue;
  double get outputValue => _outputValue;

  void setFromUnit(WeightUnit unit) {
    _fromUnit = unit;
    _convert();
    notifyListeners();
  }

  void setToUnit(WeightUnit unit) {
    _toUnit = unit;
    _convert();
    notifyListeners();
  }

  void setInputValue(double value) {
    _inputValue = value;
    _convert();
    notifyListeners();
  }

  void _convert() {
    // Convert to kilograms first, then to target unit
    final kilograms = _inputValue * _fromUnit.toKilogramFactor;
    _outputValue = kilograms / _toUnit.toKilogramFactor;
  }

  void swap() {
    final temp = _fromUnit;
    _fromUnit = _toUnit;
    _toUnit = temp;
    _inputValue = _outputValue;
    _convert();
    notifyListeners();
  }

  void clear() {
    _inputValue = 0;
    _outputValue = 0;
    notifyListeners();
  }
}