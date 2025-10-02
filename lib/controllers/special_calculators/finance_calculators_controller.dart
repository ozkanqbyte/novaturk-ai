import 'package:flutter/material.dart';
import 'dart:math';
import '../../services/currency_service.dart';
import '../../utils/calculator_formatter.dart';

/// 💰 FINANCE CALCULATORS CONTROLLER
/// 6 Finans Hesaplayıcısı: Kredi, Yatırım, Faiz, Döviz, Vergi, Emeklilik
/// ✨ Güncel döviz kurları ve Türkçe formatlanmış sonuçlar

class FinanceCalculatorsController extends ChangeNotifier {
  final CurrencyService _currencyService = CurrencyService();

  FinanceCalculatorsController() {
    // Uygulama açıldığında kurları çek
    _currencyService.fetchRates();
  }

  // 🏦 Kredi Hesaplayıcı (Tüketici/Konut Kredisi)
  Map<String, dynamic> calculateLoan(
    double principal,
    double annualRate,
    int months,
  ) {
    double monthlyRate = annualRate / 100 / 12;
    double monthlyPayment = principal *
        (monthlyRate * pow(1 + monthlyRate, months)) /
        (pow(1 + monthlyRate, months) - 1);
    
    double totalPayment = monthlyPayment * months;
    double totalInterest = totalPayment - principal;
    
    final results = {
      'monthly_payment': monthlyPayment,
      'total_payment': totalPayment,
      'total_interest': totalInterest,
      'interest_percentage': (totalInterest / principal) * 100,
    };

    // Türkçe formatlanmış sonuçlar
    return {
      ...results,
      'formatted': CalculatorFormatter.formatLoanResults(results),
      'display': {
        '📊 Ana Para': CalculatorFormatter.formatMoney(principal),
        '💳 Aylık Ödeme': CalculatorFormatter.formatMoney(monthlyPayment),
        '💰 Toplam Ödeme': CalculatorFormatter.formatMoney(totalPayment),
        '💸 Toplam Faiz': CalculatorFormatter.formatMoney(totalInterest),
        '📈 Faiz Oranı': CalculatorFormatter.formatPercent(results['interest_percentage']!),
        '⏳ Vade': '$months ay (${(months / 12).toStringAsFixed(1)} yıl)',
      }
    };
  }

  // 📈 Yatırım Hesaplayıcı (Bileşik Faiz)
  Map<String, dynamic> calculateInvestment(
    double principal,
    double monthlyContribution,
    double annualRate,
    int years,
    String compoundFrequency, // monthly, quarterly, yearly
  ) {
    int n;
    String frequencyText;
    switch (compoundFrequency) {
      case 'monthly':
        n = 12;
        frequencyText = 'Aylık';
        break;
      case 'quarterly':
        n = 4;
        frequencyText = 'Üç Aylık';
        break;
      case 'yearly':
        n = 1;
        frequencyText = 'Yıllık';
        break;
      default:
        n = 12;
        frequencyText = 'Aylık';
    }
    
    double r = annualRate / 100;
    int t = years;
    
    // Future Value of Initial Principal
    double fvPrincipal = principal * pow(1 + r / n, n * t);
    
    // Future Value of Monthly Contributions
    double fvContributions = 0;
    if (monthlyContribution > 0) {
      double monthlyRate = r / 12;
      int totalMonths = years * 12;
      fvContributions = monthlyContribution *
          ((pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    }
    
    double futureValue = fvPrincipal + fvContributions;
    double totalInvested = principal + (monthlyContribution * years * 12);
    double totalGain = futureValue - totalInvested;
    
    final results = {
      'future_value': futureValue,
      'total_invested': totalInvested,
      'total_gain': totalGain,
      'roi_percentage': (totalGain / totalInvested) * 100,
    };

    return {
      ...results,
      'formatted': CalculatorFormatter.formatInvestmentResults(results),
      'display': {
        '💵 Başlangıç Tutarı': CalculatorFormatter.formatMoney(principal),
        '💰 Aylık Katkı': CalculatorFormatter.formatMoney(monthlyContribution),
        '📊 Yıllık Getiri': CalculatorFormatter.formatPercent(annualRate),
        '⏳ Süre': '$years yıl',
        '🔄 Bileşik Sıklığı': frequencyText,
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '💎 Gelecek Değer': CalculatorFormatter.formatMoney(futureValue),
        '💵 Toplam Yatırılan': CalculatorFormatter.formatMoney(totalInvested),
        '📈 Toplam Kazanç': CalculatorFormatter.formatMoney(totalGain),
        '✨ Getiri Oranı': CalculatorFormatter.formatPercent(results['roi_percentage']!),
      }
    };
  }

  // 💹 Basit & Bileşik Faiz Hesaplayıcı
  Map<String, dynamic> calculateInterest(
    double principal,
    double rate,
    double time, // in years
    bool isCompound,
    {int compoundsPerYear = 12}
  ) {
    Map<String, dynamic> displayResults = {
      '💰 Ana Para': CalculatorFormatter.formatMoney(principal),
      '📊 Yıllık Faiz': CalculatorFormatter.formatPercent(rate),
      '⏳ Süre': '$time yıl',
    };

    if (isCompound) {
      // A = P(1 + r/n)^(nt)
      double amount = principal * pow(1 + rate / 100 / compoundsPerYear, compoundsPerYear * time);
      double compoundInterest = amount - principal;
      double simpleInterest = principal * rate * time / 100;
      double difference = compoundInterest - simpleInterest;
      
      displayResults.addAll({
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '📈 Basit Faiz': CalculatorFormatter.formatMoney(simpleInterest),
        '💎 Bileşik Faiz': CalculatorFormatter.formatMoney(compoundInterest),
        '💰 Toplam Tutar': CalculatorFormatter.formatMoney(amount),
        '✨ Fark (Bileşik - Basit)': CalculatorFormatter.formatMoney(difference),
      });

      return {
        'simple_interest': simpleInterest,
        'compound_interest': compoundInterest,
        'final_amount': amount,
        'difference': difference,
        'display': displayResults,
      };
    } else {
      // Simple Interest: I = P × r × t
      double interest = principal * rate * time / 100;
      double amount = principal + interest;
      
      displayResults.addAll({
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '💸 Basit Faiz': CalculatorFormatter.formatMoney(interest),
        '💰 Toplam Tutar': CalculatorFormatter.formatMoney(amount),
      });

      return {
        'simple_interest': interest,
        'final_amount': amount,
        'display': displayResults,
      };
    }
  }

  // 💱 Döviz Çevirici (GÜNCEL KURLAR - TCMB)
  Map<String, dynamic> convertCurrency(
    double amount,
    String fromCurrency,
    String toCurrency,
  ) {
    // Güncel kurları kullan
    final result = _currencyService.convert(
      amount: amount,
      from: fromCurrency,
      to: toCurrency,
    );

    final fromRate = _currencyService.getRate(fromCurrency);
    final toRate = _currencyService.getRate(toCurrency);
    final lastUpdate = _currencyService.lastUpdate;

    return {
      'result': result,
      'from_rate': fromRate,
      'to_rate': toRate,
      'last_update': lastUpdate,
      'display': {
        '💵 Çevrilecek Miktar': '${CalculatorFormatter.formatNumber(amount)} ${CurrencyService.currencySymbols[fromCurrency] ?? fromCurrency}',
        '🔄 Para Birimi': '${CurrencyService.currencyNames[fromCurrency] ?? fromCurrency} → ${CurrencyService.currencyNames[toCurrency] ?? toCurrency}',
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '💎 Sonuç': '${CalculatorFormatter.formatNumber(result)} ${CurrencyService.currencySymbols[toCurrency] ?? toCurrency}',
        '📊 Kur ($fromCurrency)': '1 ${CurrencyService.currencySymbols[fromCurrency] ?? fromCurrency} = ${CalculatorFormatter.formatNumber(fromRate, decimals: 4)} ₺',
        '📊 Kur ($toCurrency)': '1 ${CurrencyService.currencySymbols[toCurrency] ?? toCurrency} = ${CalculatorFormatter.formatNumber(toRate, decimals: 4)} ₺',
        '🕐 Son Güncelleme': lastUpdate != null 
            ? '${lastUpdate.day}.${lastUpdate.month}.${lastUpdate.year} ${lastUpdate.hour.toString().padLeft(2, '0')}:${lastUpdate.minute.toString().padLeft(2, '0')}'
            : 'Varsayılan kurlar',
      }
    };
  }

  // Tüm güncel kurları göster
  Map<String, String> getAllCurrentRates() {
    return _currencyService.getAllRatesFormatted();
  }

  // Kurları yenile
  Future<void> refreshRates() async {
    await _currencyService.forceRefresh();
    notifyListeners();
  }

  // 🧾 Gelir Vergisi Hesaplayıcı (Türkiye 2024)
  Map<String, dynamic> calculateIncomeTax(double annualIncome) {
    double tax = 0;
    double netIncome = annualIncome;
    
    // Turkish income tax brackets (2024)
    List<Map<String, dynamic>> brackets = [
      {'limit': 70000, 'rate': 15, 'name': '₺0 - ₺70.000'},
      {'limit': 150000, 'rate': 20, 'name': '₺70.000 - ₺150.000'},
      {'limit': 550000, 'rate': 27, 'name': '₺150.000 - ₺550.000'},
      {'limit': 1900000, 'rate': 35, 'name': '₺550.000 - ₺1.900.000'},
      {'limit': double.infinity, 'rate': 40, 'name': '₺1.900.000+'},
    ];
    
    double remaining = annualIncome;
    double previousLimit = 0;
    StringBuffer bracketDetails = StringBuffer();
    
    for (var bracket in brackets) {
      double limit = bracket['limit']!;
      double rate = bracket['rate']!;
      String name = bracket['name']!;
      
      if (remaining <= 0) break;
      
      double taxableInBracket = min(remaining, limit - previousLimit);
      double taxInBracket = taxableInBracket * rate / 100;
      tax += taxInBracket;
      
      if (taxableInBracket > 0) {
        bracketDetails.writeln('   $name: ${CalculatorFormatter.formatMoney(taxableInBracket)} × %$rate = ${CalculatorFormatter.formatMoney(taxInBracket)}');
      }
      
      remaining -= taxableInBracket;
      previousLimit = limit;
      
      if (limit == double.infinity) break;
    }
    
    netIncome = annualIncome - tax;
    double effectiveRate = (tax / annualIncome) * 100;
    
    final results = {
      'gross_income': annualIncome,
      'total_tax': tax,
      'net_income': netIncome,
      'effective_rate': effectiveRate,
      'monthly_net': netIncome / 12,
      'monthly_tax': tax / 12,
    };

    return {
      ...results,
      'formatted': CalculatorFormatter.formatTaxResults(results),
      'display': {
        '💵 Brüt Yıllık Gelir': CalculatorFormatter.formatMoney(annualIncome),
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '🧾 Toplam Vergi': CalculatorFormatter.formatMoney(tax),
        '💰 Net Gelir': CalculatorFormatter.formatMoney(netIncome),
        '📊 Efektif Vergi Oranı': CalculatorFormatter.formatPercent(effectiveRate),
        '━━━━━━━━━━━━━━━━━━━━━ ': '',
        '💰 Aylık Net': CalculatorFormatter.formatMoney(netIncome / 12),
        '💸 Aylık Vergi': CalculatorFormatter.formatMoney(tax / 12),
      },
      'bracket_details': bracketDetails.toString(),
    };
  }

  // 📄 KDV Hesaplayıcı
  Map<String, dynamic> calculateVAT(
    double amount,
    double vatRate,
    bool isPriceIncludesVAT,
  ) {
    Map<String, dynamic> displayResults = {};

    if (isPriceIncludesVAT) {
      // Extract VAT from total
      double netAmount = amount / (1 + vatRate / 100);
      double vatAmount = amount - netAmount;
      
      displayResults = {
        '💰 Brüt Tutar (KDV Dahil)': CalculatorFormatter.formatMoney(amount),
        '📊 KDV Oranı': CalculatorFormatter.formatPercent(vatRate),
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '💵 Net Tutar': CalculatorFormatter.formatMoney(netAmount),
        '📄 KDV Tutarı': CalculatorFormatter.formatMoney(vatAmount),
      };

      return {
        'net_amount': netAmount,
        'vat_amount': vatAmount,
        'gross_amount': amount,
        'display': displayResults,
      };
    } else {
      // Add VAT to net price
      double vatAmount = amount * vatRate / 100;
      double grossAmount = amount + vatAmount;
      
      displayResults = {
        '💵 Net Tutar': CalculatorFormatter.formatMoney(amount),
        '📊 KDV Oranı': CalculatorFormatter.formatPercent(vatRate),
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '📄 KDV Tutarı': CalculatorFormatter.formatMoney(vatAmount),
        '💰 Brüt Tutar (KDV Dahil)': CalculatorFormatter.formatMoney(grossAmount),
      };

      return {
        'net_amount': amount,
        'vat_amount': vatAmount,
        'gross_amount': grossAmount,
        'display': displayResults,
      };
    }
  }

  // 🏖️ Emeklilik Planlaması
  Map<String, dynamic> calculateRetirement(
    int currentAge,
    int retirementAge,
    double currentSavings,
    double monthlyContribution,
    double annualReturn,
    double inflationRate,
  ) {
    int yearsUntilRetirement = retirementAge - currentAge;
    double monthlyReturn = annualReturn / 100 / 12;
    int totalMonths = yearsUntilRetirement * 12;
    
    // Future value of current savings
    double fvCurrentSavings = currentSavings * pow(1 + monthlyReturn, totalMonths);
    
    // Future value of monthly contributions
    double fvContributions = monthlyContribution *
        ((pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
    
    double totalAtRetirement = fvCurrentSavings + fvContributions;
    double totalContributed = currentSavings + (monthlyContribution * totalMonths);
    double totalGrowth = totalAtRetirement - totalContributed;
    
    // Adjust for inflation
    double realValue = totalAtRetirement / pow(1 + inflationRate / 100, yearsUntilRetirement);
    
    // Safe withdrawal rate (4% rule)
    double safeMonthlyIncome = (totalAtRetirement * 0.04) / 12;
    double realMonthlyIncome = (realValue * 0.04) / 12;
    
    final results = {
      'total_at_retirement': totalAtRetirement,
      'total_contributed': totalContributed,
      'total_growth': totalGrowth,
      'real_value': realValue,
      'monthly_income_4_percent': safeMonthlyIncome,
      'real_monthly_income': realMonthlyIncome,
      'years_until_retirement': yearsUntilRetirement.toDouble(),
    };

    return {
      ...results,
      'formatted': CalculatorFormatter.formatRetirementResults(results),
      'display': {
        '👤 Mevcut Yaş': '$currentAge yaş',
        '🎂 Emeklilik Yaşı': '$retirementAge yaş',
        '⏳ Kalan Süre': '$yearsUntilRetirement yıl',
        '💰 Mevcut Birikim': CalculatorFormatter.formatMoney(currentSavings),
        '💵 Aylık Katkı': CalculatorFormatter.formatMoney(monthlyContribution),
        '📊 Yıllık Getiri': CalculatorFormatter.formatPercent(annualReturn),
        '📉 Enflasyon': CalculatorFormatter.formatPercent(inflationRate),
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '💎 Emeklilik Birikimi': CalculatorFormatter.formatMoney(totalAtRetirement),
        '💵 Toplam Yatırılan': CalculatorFormatter.formatMoney(totalContributed),
        '📈 Toplam Kazanç': CalculatorFormatter.formatMoney(totalGrowth),
        '💰 Reel Değer (Enflasyon Sonrası)': CalculatorFormatter.formatMoney(realValue),
        '━━━━━━━━━━━━━━━━━━━━━ ': '',
        '🏖️ Aylık Gelir (%4 Kuralı)': CalculatorFormatter.formatMoney(safeMonthlyIncome),
        '💰 Reel Aylık Gelir': CalculatorFormatter.formatMoney(realMonthlyIncome),
      }
    };
  }

  // 📊 Başabaş Noktası Analizi
  Map<String, dynamic> calculateBreakEven(
    double fixedCosts,
    double pricePerUnit,
    double variableCostPerUnit,
  ) {
    double contributionMargin = pricePerUnit - variableCostPerUnit;
    double breakEvenUnits = fixedCosts / contributionMargin;
    double breakEvenRevenue = breakEvenUnits * pricePerUnit;
    double contributionMarginRatio = (contributionMargin / pricePerUnit) * 100;
    
    return {
      'break_even_units': breakEvenUnits,
      'break_even_revenue': breakEvenRevenue,
      'contribution_margin': contributionMargin,
      'contribution_margin_ratio': contributionMarginRatio,
      'display': {
        '💰 Sabit Maliyetler': CalculatorFormatter.formatMoney(fixedCosts),
        '💵 Birim Satış Fiyatı': CalculatorFormatter.formatMoney(pricePerUnit),
        '💸 Birim Değişken Maliyet': CalculatorFormatter.formatMoney(variableCostPerUnit),
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '📦 Başabaş Satış Miktarı': '${CalculatorFormatter.formatNumber(breakEvenUnits, decimals: 0)} adet',
        '💰 Başabaş Ciro': CalculatorFormatter.formatMoney(breakEvenRevenue),
        '📊 Katkı Payı': CalculatorFormatter.formatMoney(contributionMargin),
        '📈 Katkı Payı Oranı': CalculatorFormatter.formatPercent(contributionMarginRatio),
      }
    };
  }

  // 📈 Yatırım Getirisi (ROI)
  Map<String, dynamic> calculateROI(
    double initialInvestment,
    double finalValue,
    double additionalCosts,
  ) {
    double netProfit = finalValue - initialInvestment - additionalCosts;
    double totalInvestment = initialInvestment + additionalCosts;
    double roi = (netProfit / totalInvestment) * 100;
    
    return {
      'net_profit': netProfit,
      'roi_percentage': roi,
      'total_return': finalValue,
      'total_investment': totalInvestment,
      'display': {
        '💰 İlk Yatırım': CalculatorFormatter.formatMoney(initialInvestment),
        '💸 Ek Maliyetler': CalculatorFormatter.formatMoney(additionalCosts),
        '💵 Toplam Yatırım': CalculatorFormatter.formatMoney(totalInvestment),
        '💎 Nihai Değer': CalculatorFormatter.formatMoney(finalValue),
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '📈 Net Kar': CalculatorFormatter.formatMoney(netProfit),
        '✨ ROI (Yatırım Getirisi)': CalculatorFormatter.formatPercent(roi),
      }
    };
  }
}