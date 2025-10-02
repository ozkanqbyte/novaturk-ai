import 'dart:math';
import 'package:flutter/material.dart';
import '../../models/converter_models.dart';

class StatisticsController extends ChangeNotifier {
  final List<double> _data = [];
  StatisticsResult? _result;

  List<double> get data => List.unmodifiable(_data);
  StatisticsResult? get result => _result;

  void addValue(double value) {
    _data.add(value);
    _calculate();
    notifyListeners();
  }

  void removeValueAt(int index) {
    if (index >= 0 && index < _data.length) {
      _data.removeAt(index);
      _calculate();
      notifyListeners();
    }
  }

  void setData(List<double> newData) {
    _data.clear();
    _data.addAll(newData);
    _calculate();
    notifyListeners();
  }

  void clear() {
    _data.clear();
    _result = null;
    notifyListeners();
  }

  void _calculate() {
    if (_data.isEmpty) {
      _result = null;
      return;
    }

    final sortedData = List<double>.from(_data)..sort();
    final n = _data.length;

    // Calculate mean
    final sum = _data.reduce((a, b) => a + b);
    final mean = sum / n;

    // Calculate median
    double median;
    if (n % 2 == 0) {
      median = (sortedData[n ~/ 2 - 1] + sortedData[n ~/ 2]) / 2;
    } else {
      median = sortedData[n ~/ 2];
    }

    // Calculate mode (most frequent value)
    final frequencyMap = <double, int>{};
    for (var value in _data) {
      frequencyMap[value] = (frequencyMap[value] ?? 0) + 1;
    }
    final maxFrequency = frequencyMap.values.reduce(max);
    final mode = frequencyMap.entries
        .firstWhere((entry) => entry.value == maxFrequency)
        .key;

    // Calculate variance and standard deviation
    final variance =
        _data.map((x) => pow(x - mean, 2)).reduce((a, b) => a + b) / n;
    final standardDeviation = sqrt(variance);

    // Calculate range, min, max
    final minValue = sortedData.first;
    final maxValue = sortedData.last;
    final range = maxValue - minValue;

    // Calculate quartiles
    double q1, q3;
    if (n >= 4) {
      final q1Index = (n * 0.25).floor();
      final q3Index = (n * 0.75).floor();
      q1 = sortedData[q1Index];
      q3 = sortedData[q3Index];
    } else {
      q1 = minValue;
      q3 = maxValue;
    }
    final iqr = q3 - q1;

    _result = StatisticsResult(
      data: List.unmodifiable(_data),
      mean: mean,
      median: median,
      mode: mode,
      standardDeviation: standardDeviation,
      variance: variance,
      range: range,
      min: minValue,
      max: maxValue,
      sum: sum,
      count: n,
      q1: q1,
      q3: q3,
      iqr: iqr,
    );
  }

  // Helper method to add multiple values from text
  void addValuesFromText(String text) {
    final values = text
        .split(RegExp(r'[,;\s]+'))
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .map((s) => double.tryParse(s))
        .where((v) => v != null)
        .cast<double>()
        .toList();

    _data.addAll(values);
    _calculate();
    notifyListeners();
  }
}