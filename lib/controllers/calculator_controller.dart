import 'package:flutter/material.dart';
import 'package:function_tree/function_tree.dart';
import 'dart:math' as math;
import '../services/storage_service.dart';
import '../models/calculation_model.dart';

class CalculatorController extends ChangeNotifier {
  String _expression = '';
  String _result = '0';
  String _previousResult = '';
  List<CalculationModel> _history = [];
  List<CalculationModel> _favorites = [];
  bool _isNewCalculation = true;
  bool _hasError = false;
  String _errorMessage = '';
  CalculationMode _mode = CalculationMode.basic;
  
  // Getters
  String get expression => _expression;
  String get result => _result;
  String get previousResult => _previousResult;
  List<CalculationModel> get history => _history;
  List<CalculationModel> get favorites => _favorites;
  bool get isNewCalculation => _isNewCalculation;
  bool get hasError => _hasError;
  String get errorMessage => _errorMessage;
  CalculationMode get mode => _mode;
  
  CalculatorController() {
    _loadData();
  }
  
  void _loadData() {
    _loadHistory();
    _loadFavorites();
  }
  
  void _loadHistory() {
    final historyData = StorageService.getCalculationHistory();
    _history = historyData.map((data) => CalculationModel.fromJson(data)).toList();
    notifyListeners();
  }
  
  void _loadFavorites() {
    final favoritesData = StorageService.getFavorites();
    _favorites = favoritesData.map((data) => CalculationModel.fromJson(data)).toList();
    notifyListeners();
  }
  
  // Mode switching
  void setMode(CalculationMode newMode) {
    _mode = newMode;
    clear();
    notifyListeners();
  }
  
  // Input handling
  void addToExpression(String value) {
    _hasError = false;
    _errorMessage = '';
    
    if (_isNewCalculation && _isOperator(value)) {
      _expression = _result + value;
      _isNewCalculation = false;
    } else if (_isNewCalculation) {
      _expression = value;
      _isNewCalculation = false;
    } else {
      _expression += value;
    }
    
    _autoCalculate();
    notifyListeners();
  }
  
  // Alias methods for ModernCalculatorScreen compatibility
  void appendNumber(String number) => addToExpression(number);
  void appendOperator(String operator) => addToExpression(operator);
  void appendDecimal() => addToExpression('.');
  void backspace() => deleteLast();
  void addParenthesis() {
    // Smart parenthesis handling
    int openCount = '('.allMatches(_expression).length;
    int closeCount = ')'.allMatches(_expression).length;
    if (openCount > closeCount && _expression.isNotEmpty && !_isOperator(_expression[_expression.length - 1])) {
      addToExpression(')');
    } else {
      addToExpression('(');
    }
  }
  void appendFunction(String func) {
    if (_isNewCalculation) {
      _expression = '$func(';
      _isNewCalculation = false;
    } else {
      _expression += '$func(';
    }
    notifyListeners();
  }
  void appendConstant(String constant) {
    String value = constant;
    if (constant == 'π') value = 'pi';
    else if (constant == 'e') value = 'e';
    addToExpression(value);
  }
  
  void deleteLast() {
    if (_expression.isNotEmpty) {
      _expression = _expression.substring(0, _expression.length - 1);
      if (_expression.isEmpty) {
        _result = '0';
      } else {
        _autoCalculate();
      }
    }
    notifyListeners();
  }
  
  void clear() {
    _expression = '';
    _result = '0';
    _hasError = false;
    _errorMessage = '';
    _isNewCalculation = true;
    notifyListeners();
  }
  
  void allClear() {
    clear();
    _previousResult = '';
    notifyListeners();
  }
  
  // Calculation methods
  void calculate() {
    if (_expression.isEmpty) return;
    
    try {
      final result = _evaluateExpression(_expression);
      _previousResult = _result;
      _result = _formatResult(result);
      
      // Save to history
      final calculation = CalculationModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        expression: _expression,
        result: _result,
        timestamp: DateTime.now(),
        mode: _mode,
      );
      
      _saveCalculation(calculation);
      StorageService.incrementStat('total_calculations');
      
      _isNewCalculation = true;
      _hasError = false;
      _errorMessage = '';
      
    } catch (e) {
      _hasError = true;
      _errorMessage = _getErrorMessage(e);
      _result = 'Error';
    }
    
    notifyListeners();
  }
  
  void _autoCalculate() {
    if (_expression.isEmpty) {
      _result = '0';
      return;
    }
    
    try {
      // Only auto-calculate if expression seems complete
      if (!RegExp(r'[+\-*/^√(]$').hasMatch(_expression)) {
        final result = _evaluateExpression(_expression);
        _result = _formatResult(result);
      }
    } catch (e) {
      // Don't show errors during auto-calculation
    }
  }
  
  double _evaluateExpression(String expr) {
    // Replace mathematical symbols
    String processedExpr = expr
        .replaceAll('×', '*')
        .replaceAll('÷', '/')
        .replaceAll('π', '${math.pi}')
        .replaceAll('e', '${math.e}')
        .replaceAll('√', 'sqrt');
    
    // Handle percentage
    processedExpr = _handlePercentage(processedExpr);
    
    // Handle factorial
    processedExpr = _handleFactorial(processedExpr);
    
    switch (_mode) {
      case CalculationMode.basic:
        return processedExpr.interpret().toDouble();
        
      case CalculationMode.scientific:
        return _evaluateScientific(processedExpr);
        
      case CalculationMode.programming:
        return _evaluateProgramming(processedExpr);
        
      default:
        return processedExpr.interpret().toDouble();
    }
  }
  
  double _evaluateScientific(String expr) {
    // Handle scientific functions
    expr = expr
        .replaceAll('sin(', 'sin(')
        .replaceAll('cos(', 'cos(')
        .replaceAll('tan(', 'tan(')
        .replaceAll('log(', 'log(')
        .replaceAll('ln(', 'ln(')
        .replaceAll('asin(', 'asin(')
        .replaceAll('acos(', 'acos(')
        .replaceAll('atan(', 'atan(');
    
    return expr.interpret().toDouble();
  }
  
  double _evaluateProgramming(String expr) {
    // Handle programming functions like binary, hex operations
    return expr.interpret().toDouble();
  }
  
  String _handlePercentage(String expr) {
    return expr.replaceAllMapped(
      RegExp(r'(\d+(?:\.\d+)?)%'),
      (match) => '(${match.group(1)}/100)',
    );
  }
  
  String _handleFactorial(String expr) {
    return expr.replaceAllMapped(
      RegExp(r'(\d+)!'),
      (match) {
        final num = int.parse(match.group(1)!);
        return _factorial(num).toString();
      },
    );
  }
  
  int _factorial(int n) {
    if (n <= 1) return 1;
    return n * _factorial(n - 1);
  }
  
  String _formatResult(double result) {
    if (result.isInfinite) return '∞';
    if (result.isNaN) return 'Error';
    
    // Remove unnecessary decimals
    if (result == result.toInt()) {
      return result.toInt().toString();
    }
    
    // Format with appropriate precision
    String formatted = result.toStringAsFixed(10);
    formatted = formatted.replaceAll(RegExp(r'\.?0+$'), '');
    
    // Handle scientific notation for very large/small numbers
    if (result.abs() >= 1e15 || (result.abs() < 1e-6 && result != 0)) {
      return result.toStringAsExponential(6);
    }
    
    return formatted;
  }
  
  String _getErrorMessage(dynamic error) {
    if (error.toString().contains('Division by zero')) {
      return 'Cannot divide by zero';
    } else if (error.toString().contains('Invalid')) {
      return 'Invalid expression';
    } else if (error.toString().contains('Overflow')) {
      return 'Number too large';
    }
    return 'Calculation error';
  }
  
  bool _isOperator(String value) {
    return ['+', '-', '×', '÷', '*', '/'].contains(value);
  }
  
  // History management
  void _saveCalculation(CalculationModel calculation) {
    _history.insert(0, calculation);
    if (_history.length > 100) {
      _history.removeRange(100, _history.length);
    }
    StorageService.saveCalculation(calculation.toJson());
  }
  
  void deleteFromHistory(String id) {
    _history.removeWhere((calc) => calc.id == id);
    StorageService.deleteCalculation(id);
    notifyListeners();
  }
  
  void clearHistory() {
    _history.clear();
    StorageService.clearCalculationHistory();
    notifyListeners();
  }
  
  void useFromHistory(CalculationModel calculation) {
    _expression = calculation.expression;
    _result = calculation.result;
    _isNewCalculation = false;
    notifyListeners();
  }
  
  // Favorites management
  void addToFavorites(CalculationModel calculation) {
    if (!_favorites.any((fav) => fav.id == calculation.id)) {
      _favorites.insert(0, calculation);
      StorageService.addToFavorites(calculation.toJson());
      StorageService.incrementStat('favorites_count');
      notifyListeners();
    }
  }
  
  void removeFromFavorites(String id) {
    _favorites.removeWhere((fav) => fav.id == id);
    StorageService.removeFromFavorites(id);
    notifyListeners();
  }
  
  bool isFavorite(String id) {
    return _favorites.any((fav) => fav.id == id);
  }
  
  // Special functions
  void addFunction(String function) {
    switch (function) {
      case 'sin':
      case 'cos':
      case 'tan':
      case 'log':
      case 'ln':
      case 'sqrt':
        addToExpression('$function(');
        break;
      case 'π':
      case 'e':
        addToExpression(function);
        break;
      case 'x²':
        addToExpression('^2');
        break;
      case 'x³':
        addToExpression('^3');
        break;
      case '1/x':
        if (_result != '0') {
          _expression = '1/($_result)';
          calculate();
        }
        break;
      case '√':
        addToExpression('√(');
        break;
      case '!':
        addToExpression('!');
        break;
      case '%':
        addToExpression('%');
        break;
    }
  }
  
  // Memory functions
  String _memory = '0';
  String get memory => _memory;
  
  void memoryStore() {
    _memory = _result;
    notifyListeners();
  }
  
  void memoryRecall() {
    addToExpression(_memory);
  }
  
  void memoryClear() {
    _memory = '0';
    notifyListeners();
  }
  
  void memoryAdd() {
    final current = double.tryParse(_memory) ?? 0;
    final toAdd = double.tryParse(_result) ?? 0;
    _memory = (current + toAdd).toString();
    notifyListeners();
  }
  
  void memorySubtract() {
    final current = double.tryParse(_memory) ?? 0;
    final toSubtract = double.tryParse(_result) ?? 0;
    _memory = (current - toSubtract).toString();
    notifyListeners();
  }
}

