import 'package:flutter/material.dart';
import '../../models/converter_models.dart';

class TemperatureController extends ChangeNotifier {
  TemperatureUnit _fromUnit = TemperatureUnit.units[0]; // Celsius
  TemperatureUnit _toUnit = TemperatureUnit.units[1]; // Fahrenheit
  double _inputValue = 0;
  double _outputValue = 0;

  TemperatureUnit get fromUnit => _fromUnit;
  TemperatureUnit get toUnit => _toUnit;
  double get inputValue => _inputValue;
  double get outputValue => _outputValue;

  void setFromUnit(TemperatureUnit unit) {
    _fromUnit = unit;
    _convert();
    notifyListeners();
  }

  void setToUnit(TemperatureUnit unit) {
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
    _outputValue = TemperatureUnit.convert(
      _inputValue,
      _fromUnit.symbol,
      _toUnit.symbol,
    );
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