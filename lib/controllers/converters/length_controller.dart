import 'package:flutter/material.dart';
import '../../models/converter_models.dart';

class LengthController extends ChangeNotifier {
  LengthUnit _fromUnit = LengthUnit.units[1]; // Meter
  LengthUnit _toUnit = LengthUnit.units[0]; // Kilometer
  double _inputValue = 0;
  double _outputValue = 0;

  LengthUnit get fromUnit => _fromUnit;
  LengthUnit get toUnit => _toUnit;
  double get inputValue => _inputValue;
  double get outputValue => _outputValue;

  void setFromUnit(LengthUnit unit) {
    _fromUnit = unit;
    _convert();
    notifyListeners();
  }

  void setToUnit(LengthUnit unit) {
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
    // Convert to meters first, then to target unit
    final meters = _inputValue * _fromUnit.toMeterFactor;
    _outputValue = meters / _toUnit.toMeterFactor;
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