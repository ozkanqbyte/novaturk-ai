import 'package:flutter/material.dart';
import 'dart:math';
import '../../utils/calculator_formatter.dart';

/// 💼 BUSINESS CALCULATORS CONTROLLER
/// 6 İş Hesaplayıcısı: Maaş, Kar/Zarar, ROI, Çalışma Saati, Prim, Fatura

class BusinessCalculatorsController extends ChangeNotifier {
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
  // Salary Calculator (Turkish Tax System)
  Map<String, double> calculateSalary(
    double grossSalary,
    bool hasChildren,
    int childrenCount,
  ) {
    // SSK (SGK) Deductions
    double ssk = grossSalary * 0.14; // 14% employee contribution
    
    // Unemployment Insurance
    double unemploymentInsurance = grossSalary * 0.01; // 1%
    
    // Taxable Income
    double taxableIncome = grossSalary - ssk - unemploymentInsurance;
    
    // Income Tax (Progressive Brackets - 2024)
    double incomeTax = 0;
    if (taxableIncome <= 70000) {
      incomeTax = taxableIncome * 0.15;
    } else if (taxableIncome <= 150000) {
      incomeTax = 70000 * 0.15 + (taxableIncome - 70000) * 0.20;
    } else if (taxableIncome <= 550000) {
      incomeTax = 70000 * 0.15 + 80000 * 0.20 + (taxableIncome - 150000) * 0.27;
    } else if (taxableIncome <= 1900000) {
      incomeTax = 70000 * 0.15 + 80000 * 0.20 + 400000 * 0.27 + (taxableIncome - 550000) * 0.35;
    } else {
      incomeTax = 70000 * 0.15 + 80000 * 0.20 + 400000 * 0.27 + 1350000 * 0.35 + (taxableIncome - 1900000) * 0.40;
    }
    
    // Stamp Tax
    double stampTax = grossSalary * 0.00759; // 0.759%
    
    // Total Deductions
    double totalDeductions = ssk + unemploymentInsurance + incomeTax + stampTax;
    
    // Net Salary
    double netSalary = grossSalary - totalDeductions;
    
    // Employer Costs
    double employerSSK = grossSalary * 0.155; // 15.5% employer SGK
    double employerUnemployment = grossSalary * 0.02; // 2%
    double totalEmployerCost = grossSalary + employerSSK + employerUnemployment;
    
    return {
      'gross_salary': grossSalary,
      'ssk_employee': ssk,
      'unemployment_insurance': unemploymentInsurance,
      'income_tax': incomeTax,
      'stamp_tax': stampTax,
      'total_deductions': totalDeductions,
      'net_salary': netSalary,
      'employer_ssk': employerSSK,
      'employer_unemployment': employerUnemployment,
      'total_employer_cost': totalEmployerCost,
      'take_home_percentage': (netSalary / grossSalary) * 100,
    };
  }

  // Profit/Loss Calculator
  Map<String, double> calculateProfitLoss(
    double revenue,
    double costOfGoodsSold,
    double operatingExpenses,
    double otherIncome,
    double otherExpenses,
  ) {
    double grossProfit = revenue - costOfGoodsSold;
    double grossProfitMargin = (grossProfit / revenue) * 100;
    
    double operatingProfit = grossProfit - operatingExpenses;
    double operatingProfitMargin = (operatingProfit / revenue) * 100;
    
    double netProfitBeforeTax = operatingProfit + otherIncome - otherExpenses;
    
    // Corporate Tax (Turkey - 25% for 2024)
    double corporateTax = netProfitBeforeTax > 0 ? netProfitBeforeTax * 0.25 : 0;
    
    double netProfit = netProfitBeforeTax - corporateTax;
    double netProfitMargin = (netProfit / revenue) * 100;
    
    return {
      'revenue': revenue,
      'cogs': costOfGoodsSold,
      'gross_profit': grossProfit,
      'gross_profit_margin': grossProfitMargin,
      'operating_expenses': operatingExpenses,
      'operating_profit': operatingProfit,
      'operating_profit_margin': operatingProfitMargin,
      'other_income': otherIncome,
      'other_expenses': otherExpenses,
      'profit_before_tax': netProfitBeforeTax,
      'corporate_tax': corporateTax,
      'net_profit': netProfit,
      'net_profit_margin': netProfitMargin,
    };
  }

  // ROI Calculator (Return on Investment)
  Map<String, double> calculateROI(
    double initialInvestment,
    double finalValue,
    double additionalCosts,
    int years,
  ) {
    double totalInvestment = initialInvestment + additionalCosts;
    double netReturn = finalValue - totalInvestment;
    double roiPercentage = (netReturn / totalInvestment) * 100;
    
    // Annualized ROI
    double annualizedROI = 0;
    if (years > 0) {
      annualizedROI = (pow((finalValue / totalInvestment), 1 / years) - 1) * 100;
    }
    
    return {
      'initial_investment': initialInvestment,
      'additional_costs': additionalCosts,
      'total_investment': totalInvestment,
      'final_value': finalValue,
      'net_return': netReturn,
      'roi_percentage': roiPercentage,
      'annualized_roi': annualizedROI,
      'payback_period_years': totalInvestment / (netReturn / years.toDouble()),
    };
  }

  // Working Hours Calculator
  Map<String, double> calculateWorkingHours(
    double hoursPerDay,
    double daysPerWeek,
    double hourlyRate,
    double overtimeMultiplier,
    double overtimeHours,
  ) {
    // Regular hours
    double regularWeeklyHours = hoursPerDay * daysPerWeek;
    double regularMonthlyHours = regularWeeklyHours * 4.33; // Average weeks per month
    double regularYearlyHours = regularWeeklyHours * 52;
    
    // Regular pay
    double regularWeeklyPay = regularWeeklyHours * hourlyRate;
    double regularMonthlyPay = regularMonthlyHours * hourlyRate;
    double regularYearlyPay = regularYearlyHours * hourlyRate;
    
    // Overtime pay
    double overtimeRate = hourlyRate * overtimeMultiplier;
    double weeklyOvertimePay = overtimeHours * overtimeRate;
    double monthlyOvertimePay = weeklyOvertimePay * 4.33;
    double yearlyOvertimePay = weeklyOvertimePay * 52;
    
    // Total pay
    double totalWeeklyPay = regularWeeklyPay + weeklyOvertimePay;
    double totalMonthlyPay = regularMonthlyPay + monthlyOvertimePay;
    double totalYearlyPay = regularYearlyPay + yearlyOvertimePay;
    
    return {
      'regular_weekly_hours': regularWeeklyHours,
      'regular_monthly_hours': regularMonthlyHours,
      'regular_yearly_hours': regularYearlyHours,
      'regular_weekly_pay': regularWeeklyPay,
      'regular_monthly_pay': regularMonthlyPay,
      'regular_yearly_pay': regularYearlyPay,
      'overtime_rate': overtimeRate,
      'weekly_overtime_pay': weeklyOvertimePay,
      'monthly_overtime_pay': monthlyOvertimePay,
      'yearly_overtime_pay': yearlyOvertimePay,
      'total_weekly_pay': totalWeeklyPay,
      'total_monthly_pay': totalMonthlyPay,
      'total_yearly_pay': totalYearlyPay,
    };
  }

  // Commission Calculator
  Map<String, double> calculateCommission(
    double baseSalary,
    double totalSales,
    double commissionRate,
    double threshold,
    double bonusRate,
  ) {
    double commission = totalSales * (commissionRate / 100);
    
    // Bonus if sales exceed threshold
    double bonus = 0;
    if (totalSales > threshold) {
      double excessSales = totalSales - threshold;
      bonus = excessSales * (bonusRate / 100);
    }
    
    double totalCommission = commission + bonus;
    double totalEarnings = baseSalary + totalCommission;
    
    // Performance metrics
    double commissionPercentageOfSalary = (totalCommission / baseSalary) * 100;
    double totalEarningsIncrease = ((totalEarnings - baseSalary) / baseSalary) * 100;
    
    return {
      'base_salary': baseSalary,
      'total_sales': totalSales,
      'commission': commission,
      'bonus': bonus,
      'total_commission': totalCommission,
      'total_earnings': totalEarnings,
      'commission_percentage_of_salary': commissionPercentageOfSalary,
      'earnings_increase_percentage': totalEarningsIncrease,
    };
  }

  // Invoice Calculator (with VAT)
  Map<String, double> calculateInvoice(
    List<Map<String, double>> items, // {quantity, unit_price}
    double vatRate,
    double discountPercentage,
    double shippingCost,
  ) {
    // Calculate subtotal
    double subtotal = 0;
    for (var item in items) {
      double quantity = item['quantity'] ?? 0;
      double unitPrice = item['unit_price'] ?? 0;
      subtotal += quantity * unitPrice;
    }
    
    // Apply discount
    double discountAmount = subtotal * (discountPercentage / 100);
    double subtotalAfterDiscount = subtotal - discountAmount;
    
    // Add shipping
    double subtotalWithShipping = subtotalAfterDiscount + shippingCost;
    
    // Calculate VAT
    double vatAmount = subtotalWithShipping * (vatRate / 100);
    
    // Total
    double total = subtotalWithShipping + vatAmount;
    
    return {
      'subtotal': subtotal,
      'discount_percentage': discountPercentage,
      'discount_amount': discountAmount,
      'subtotal_after_discount': subtotalAfterDiscount,
      'shipping_cost': shippingCost,
      'subtotal_with_shipping': subtotalWithShipping,
      'vat_rate': vatRate,
      'vat_amount': vatAmount,
      'total': total,
      'items_count': items.length.toDouble(),
    };
  }

  // Break-even Analysis
  Map<String, double> calculateBreakEven(
    double fixedCosts,
    double variableCostPerUnit,
    double sellingPricePerUnit,
  ) {
    double contributionMarginPerUnit = sellingPricePerUnit - variableCostPerUnit;
    double contributionMarginRatio = (contributionMarginPerUnit / sellingPricePerUnit) * 100;
    
    double breakEvenUnits = fixedCosts / contributionMarginPerUnit;
    double breakEvenRevenue = breakEvenUnits * sellingPricePerUnit;
    
    // Safety margin calculations
    double targetProfit = fixedCosts * 0.2; // 20% target
    double unitsForTargetProfit = (fixedCosts + targetProfit) / contributionMarginPerUnit;
    
    return {
      'fixed_costs': fixedCosts,
      'variable_cost_per_unit': variableCostPerUnit,
      'selling_price_per_unit': sellingPricePerUnit,
      'contribution_margin_per_unit': contributionMarginPerUnit,
      'contribution_margin_ratio': contributionMarginRatio,
      'break_even_units': breakEvenUnits,
      'break_even_revenue': breakEvenRevenue,
      'units_for_20_percent_profit': unitsForTargetProfit,
    };
  }
}