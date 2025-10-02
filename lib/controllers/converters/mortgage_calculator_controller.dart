import 'dart:math';
import 'package:flutter/material.dart';
import '../../models/converter_models.dart';

class MortgageCalculatorController extends ChangeNotifier {
  double _loanAmount = 0;
  double _interestRate = 0;
  int _loanTermYears = 0;
  MortgageCalculationResult? _result;

  double get loanAmount => _loanAmount;
  double get interestRate => _interestRate;
  int get loanTermYears => _loanTermYears;
  MortgageCalculationResult? get result => _result;

  void setLoanAmount(double amount) {
    _loanAmount = amount;
    _calculate();
    notifyListeners();
  }

  void setInterestRate(double rate) {
    _interestRate = rate;
    _calculate();
    notifyListeners();
  }

  void setLoanTermYears(int years) {
    _loanTermYears = years;
    _calculate();
    notifyListeners();
  }

  void _calculate() {
    if (_loanAmount <= 0 || _interestRate <= 0 || _loanTermYears <= 0) {
      _result = null;
      return;
    }

    final monthlyRate = _interestRate / 100 / 12;
    final numberOfPayments = _loanTermYears * 12;

    // Calculate monthly payment using formula:
    // M = P * [r(1+r)^n] / [(1+r)^n - 1]
    final monthlyPayment = _loanAmount *
        (monthlyRate * pow(1 + monthlyRate, numberOfPayments)) /
        (pow(1 + monthlyRate, numberOfPayments) - 1);

    final totalPayment = monthlyPayment * numberOfPayments;
    final totalInterest = totalPayment - _loanAmount;

    // Generate amortization schedule
    final schedule = _generateAmortizationSchedule(
      _loanAmount,
      monthlyRate,
      numberOfPayments.toInt(),
      monthlyPayment,
    );

    _result = MortgageCalculationResult(
      loanAmount: _loanAmount,
      interestRate: _interestRate,
      loanTermMonths: numberOfPayments.toInt(),
      monthlyPayment: monthlyPayment,
      totalPayment: totalPayment,
      totalInterest: totalInterest,
      amortizationSchedule: schedule,
    );
  }

  List<AmortizationEntry> _generateAmortizationSchedule(
    double principal,
    double monthlyRate,
    int numberOfPayments,
    double monthlyPayment,
  ) {
    final schedule = <AmortizationEntry>[];
    double balance = principal;

    for (int month = 1; month <= numberOfPayments && month <= 360; month++) {
      final interestPayment = balance * monthlyRate;
      final principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      // Prevent negative balance due to rounding
      if (balance < 0) balance = 0;

      schedule.add(AmortizationEntry(
        month: month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: balance,
      ));

      if (balance == 0) break;
    }

    return schedule;
  }

  void clear() {
    _loanAmount = 0;
    _interestRate = 0;
    _loanTermYears = 0;
    _result = null;
    notifyListeners();
  }
}