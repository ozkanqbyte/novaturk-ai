import 'package:flutter/material.dart';
import 'dart:math';
import '../../utils/calculator_formatter.dart';

/// 🏗️ CONSTRUCTION CALCULATORS CONTROLLER
/// 6 İnşaat Hesaplayıcısı: Beton, Tuğla, Boya, Demir, Maliyet, Alan

class ConstructionCalculatorsController extends ChangeNotifier {
  // Dinamik sayı formatlama (dile göre)
  static String _formatNumber(double number, {int decimals = 2}) {
    return CalculatorFormatter.formatNumber(number, decimals: decimals);
  }

  static String _formatMoney(double amount) {
    return CalculatorFormatter.formatMoney(amount);
  }
  // Concrete Calculator
  Map<String, dynamic> calculateConcrete(
    double length,
    double width,
    double depth,
    String unit, // m3 or bags
  ) {
    // Volume in cubic meters
    double volume = length * width * (depth / 100); // depth in cm
    
    // Material ratios for M20 concrete (1:1.5:3)
    // Cement : Sand : Aggregate
    double cementBags = volume * 8; // ~8 bags per m3 for M20
    double sandM3 = volume * 0.42; // 42% sand
    double aggregateM3 = volume * 0.84; // 84% aggregate
    double waterLiters = volume * 200; // ~200 liters per m3
    
    // Weight calculations
    double cementKg = cementBags * 50; // 50kg per bag
    double sandKg = sandM3 * 1600; // 1600 kg/m3 density
    double aggregateKg = aggregateM3 * 1450; // 1450 kg/m3 density
    
    return {
      'volume_m3': volume,
      'cement_bags': cementBags,
      'cement_kg': cementKg,
      'sand_m3': sandM3,
      'sand_kg': sandKg,
      'aggregate_m3': aggregateM3,
      'aggregate_kg': aggregateKg,
      'water_liters': waterLiters,
      'display': {
        '📏 Uzunluk': '${_formatNumber(length, decimals: 2)} m',
        '📏 Genişlik': '${_formatNumber(width, decimals: 2)} m',
        '📏 Derinlik': '${_formatNumber(depth, decimals: 0)} cm',
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '📦 Toplam Hacim': '${_formatNumber(volume, decimals: 2)} m³',
        '🏗️ Çimento': '${_formatNumber(cementBags, decimals: 0)} torba (${_formatNumber(cementKg, decimals: 0)} kg)',
        '🏖️ Kum': '${_formatNumber(sandM3, decimals: 2)} m³ (${_formatNumber(sandKg, decimals: 0)} kg)',
        '🪨 Agrega': '${_formatNumber(aggregateM3, decimals: 2)} m³ (${_formatNumber(aggregateKg, decimals: 0)} kg)',
        '💧 Su': '${_formatNumber(waterLiters, decimals: 0)} litre',
      }
    };
  }

  // Brick Calculator
  Map<String, dynamic> calculateBricks(
    double wallLength,
    double wallHeight,
    double brickLength,
    double brickHeight,
    double mortarThickness,
  ) {
    // All measurements in cm
    double wallAreaCm2 = wallLength * wallHeight;
    
    // Brick with mortar dimensions
    double brickWithMortarLength = brickLength + mortarThickness;
    double brickWithMortarHeight = brickHeight + mortarThickness;
    double brickWithMortarArea = brickWithMortarLength * brickWithMortarHeight;
    
    // Number of bricks
    double bricksNeeded = wallAreaCm2 / brickWithMortarArea;
    
    // Add 5% wastage
    double bricksWithWastage = bricksNeeded * 1.05;
    
    // Mortar calculation
    // Mortar volume = Total wall volume - Brick volume
    double wallVolume = (wallLength * wallHeight * 10) / 1000000; // in m3 (10cm wall)
    double singleBrickVolume = (brickLength * brickHeight * 10) / 1000000; // in m3
    double totalBrickVolume = bricksNeeded * singleBrickVolume;
    double mortarVolume = wallVolume - totalBrickVolume;
    
    // Mortar materials (1:6 ratio - 1 cement : 6 sand)
    double cementBags = mortarVolume * 5.5; // ~5.5 bags per m3
    double sandM3 = mortarVolume * 1.3;
    
    return {
      'bricks_needed': bricksNeeded,
      'bricks_with_wastage': bricksWithWastage,
      'mortar_m3': mortarVolume,
      'cement_bags': cementBags,
      'sand_m3': sandM3,
      'wall_area_m2': wallAreaCm2 / 10000,
      'display': {
        '📏 Duvar Uzunluğu': '${_formatNumber(wallLength, decimals: 0)} cm',
        '📏 Duvar Yüksekliği': '${_formatNumber(wallHeight, decimals: 0)} cm',
        '📐 Duvar Alanı': '${_formatNumber(wallAreaCm2 / 10000, decimals: 2)} m²',
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '🧱 Gerekli Tuğla': '${_formatNumber(bricksNeeded, decimals: 0)} adet',
        '🧱 Fire Dahil': '${_formatNumber(bricksWithWastage, decimals: 0)} adet (%5 fire)',
        '🏗️ Harç Hacmi': '${_formatNumber(mortarVolume, decimals: 3)} m³',
        '🏗️ Çimento': '${_formatNumber(cementBags, decimals: 1)} torba',
        '🏖️ Kum': '${_formatNumber(sandM3, decimals: 2)} m³',
      }
    };
  }

  // Paint Calculator
  Map<String, dynamic> calculatePaint(
    double totalArea,
    int coats,
    double coveragePerLiter, // m2 per liter
  ) {
    // Standard coverage: 10-12 m2 per liter
    double paintNeeded = (totalArea * coats) / coveragePerLiter;
    
    // Add 10% wastage
    double paintWithWastage = paintNeeded * 1.1;
    
    // Paint sizes
    double bucketsOf20L = (paintWithWastage / 20).ceil().toDouble();
    double bucketsOf10L = (paintWithWastage / 10).ceil().toDouble();
    double bucketsOf5L = (paintWithWastage / 5).ceil().toDouble();
    double cansOf1L = (paintWithWastage / 1).ceil().toDouble();
    
    return {
      'paint_liters': paintNeeded,
      'paint_with_wastage': paintWithWastage,
      'buckets_20l': bucketsOf20L,
      'buckets_10l': bucketsOf10L,
      'buckets_5l': bucketsOf5L,
      'cans_1l': cansOf1L,
      'coverage_per_coat': totalArea,
      'display': {
        '📐 Toplam Alan': '${_formatNumber(totalArea, decimals: 2)} m²',
        '🎨 Kat Sayısı': '$coats kat',
        '📊 Kaplama Oranı': '${_formatNumber(coveragePerLiter, decimals: 0)} m²/litre',
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '🎨 Gerekli Boya': '${_formatNumber(paintNeeded, decimals: 1)} litre',
        '🎨 Fire Dahil': '${_formatNumber(paintWithWastage, decimals: 1)} litre (%10 fire)',
        '━━━━━━━━━━━━━━━━━━━━━ ': '',
        '🪣 20L Kova': '${_formatNumber(bucketsOf20L, decimals: 0)} adet',
        '🪣 10L Kova': '${_formatNumber(bucketsOf10L, decimals: 0)} adet',
        '🪣 5L Kova': '${_formatNumber(bucketsOf5L, decimals: 0)} adet',
        '🪣 1L Teneke': '${_formatNumber(cansOf1L, decimals: 0)} adet',
      }
    };
  }

  // Rebar (Demir) Calculator
  Map<String, dynamic> calculateRebar(
    double length,
    double width,
    double spacing, // in cm
    int diameter, // in mm
  ) {
    // Length direction rebars
    int lengthBars = (width / spacing).ceil() + 1;
    double lengthTotalMeters = lengthBars * length;
    
    // Width direction rebars
    int widthBars = (length / spacing).ceil() + 1;
    double widthTotalMeters = widthBars * width;
    
    double totalMeters = lengthTotalMeters + widthTotalMeters;
    
    // Weight calculation (kg per meter based on diameter)
    // Formula: Weight = D² / 162 (D in mm, weight in kg/m)
    double weightPerMeter = (diameter * diameter) / 162.0;
    double totalWeight = totalMeters * weightPerMeter;
    
    // Add 5% wastage
    double totalWithWastage = totalWeight * 1.05;
    
    return {
      'total_length_meters': totalMeters,
      'total_weight_kg': totalWeight,
      'total_with_wastage_kg': totalWithWastage,
      'weight_per_meter': weightPerMeter,
      'length_bars': lengthBars.toDouble(),
      'width_bars': widthBars.toDouble(),
      'total_bars': (lengthBars + widthBars).toDouble(),
      'display': {
        '📏 Uzunluk': '${_formatNumber(length, decimals: 2)} m',
        '📏 Genişlik': '${_formatNumber(width, decimals: 2)} m',
        '📏 Aralık': '${_formatNumber(spacing, decimals: 0)} cm',
        '⚙️ Demir Çapı': '$diameter mm (Ø$diameter)',
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '📊 Uzunluk Yönü': '${_formatNumber(lengthBars.toDouble(), decimals: 0)} demir',
        '📊 Genişlik Yönü': '${_formatNumber(widthBars.toDouble(), decimals: 0)} demir',
        '📊 Toplam Demir': '${_formatNumber((lengthBars + widthBars).toDouble(), decimals: 0)} adet',
        '━━━━━━━━━━━━━━━━━━━━━ ': '',
        '📏 Toplam Uzunluk': '${_formatNumber(totalMeters, decimals: 1)} m',
        '⚖️ Metre Ağırlığı': '${_formatNumber(weightPerMeter, decimals: 3)} kg/m',
        '⚖️ Toplam Ağırlık': '${_formatNumber(totalWeight, decimals: 1)} kg',
        '⚖️ Fire Dahil': '${_formatNumber(totalWithWastage, decimals: 1)} kg (%5 fire)',
      }
    };
  }

  // Construction Cost Estimator
  Map<String, dynamic> calculateConstructionCost(
    double builtUpArea, // m2
    String constructionType, // economy, standard, premium, luxury
  ) {
    // Cost per m2 based on type (in TRY - approximate 2024 prices)
    double costPerM2;
    switch (constructionType) {
      case 'economy':
        costPerM2 = 8000;
        break;
      case 'standard':
        costPerM2 = 12000;
        break;
      case 'premium':
        costPerM2 = 18000;
        break;
      case 'luxury':
        costPerM2 = 30000;
        break;
      default:
        costPerM2 = 12000;
    }
    
    // Base construction cost
    double baseCost = builtUpArea * costPerM2;
    
    // Breakdown (approximate percentages)
    double structuralCost = baseCost * 0.35; // 35%
    double finishingCost = baseCost * 0.30; // 30%
    double plumbingCost = baseCost * 0.10; // 10%
    double electricalCost = baseCost * 0.10; // 10%
    double otherCost = baseCost * 0.15; // 15%
    
    // Add contingency (10%)
    double contingency = baseCost * 0.10;
    double totalCost = baseCost + contingency;
    
    String typeText = {
      'economy': 'Ekonomik',
      'standard': 'Standart',
      'premium': 'Premium',
      'luxury': 'Lüks'
    }[constructionType] ?? 'Standart';

    return {
      'base_cost': baseCost,
      'structural': structuralCost,
      'finishing': finishingCost,
      'plumbing': plumbingCost,
      'electrical': electricalCost,
      'other': otherCost,
      'contingency': contingency,
      'total_cost': totalCost,
      'cost_per_m2': costPerM2,
      'display': {
        '🏠 İnşaat Alanı': '${_formatNumber(builtUpArea, decimals: 2)} m²',
        '🏗️ İnşaat Tipi': typeText,
        '💰 m² Fiyatı': _formatMoney(costPerM2),
        '━━━━━━━━━━━━━━━━━━━━━': '',
        '🏗️ Yapı Maliyeti': '${_formatMoney(structuralCost)} (%35)',
        '🎨 İç Mekan': '${_formatMoney(finishingCost)} (%30)',
        '🚰 Tesisat': '${_formatMoney(plumbingCost)} (%10)',
        '⚡ Elektrik': '${_formatMoney(electricalCost)} (%10)',
        '🔧 Diğer': '${_formatMoney(otherCost)} (%15)',
        '━━━━━━━━━━━━━━━━━━━━━ ': '',
        '💵 Temel Maliyet': _formatMoney(baseCost),
        '🛡️ Ek Güvenlik Payı': '${_formatMoney(contingency)} (%10)',
        '💰 TOPLAM MALİYET': _formatMoney(totalCost),
      }
    };
  }

  // Area Calculator (Complex Shapes)
  Map<String, double> calculateArea(
    String shape,
    Map<String, double> dimensions,
  ) {
    double area = 0;
    double perimeter = 0;
    
    switch (shape) {
      case 'rectangle':
        double length = dimensions['length'] ?? 0;
        double width = dimensions['width'] ?? 0;
        area = length * width;
        perimeter = 2 * (length + width);
        break;
      
      case 'circle':
        double radius = dimensions['radius'] ?? 0;
        area = pi * radius * radius;
        perimeter = 2 * pi * radius;
        break;
      
      case 'triangle':
        double base = dimensions['base'] ?? 0;
        double height = dimensions['height'] ?? 0;
        area = 0.5 * base * height;
        // For perimeter, need all three sides
        double side1 = dimensions['side1'] ?? 0;
        double side2 = dimensions['side2'] ?? 0;
        double side3 = dimensions['side3'] ?? 0;
        perimeter = side1 + side2 + side3;
        break;
      
      case 'trapezoid':
        double base1 = dimensions['base1'] ?? 0;
        double base2 = dimensions['base2'] ?? 0;
        double height = dimensions['height'] ?? 0;
        area = 0.5 * (base1 + base2) * height;
        break;
      
      case 'ellipse':
        double majorAxis = dimensions['major_axis'] ?? 0;
        double minorAxis = dimensions['minor_axis'] ?? 0;
        area = pi * majorAxis * minorAxis;
        // Ramanujan approximation for perimeter
        perimeter = pi * (3 * (majorAxis + minorAxis) - 
                   sqrt((3 * majorAxis + minorAxis) * (majorAxis + 3 * minorAxis)));
        break;
    }
    
    return {
      'area': area,
      'perimeter': perimeter,
    };
  }

  // Flooring Calculator
  Map<String, double> calculateFlooring(
    double roomLength,
    double roomWidth,
    double tileLength,
    double tileWidth,
  ) {
    double roomArea = roomLength * roomWidth;
    double tileArea = tileLength * tileWidth;
    
    double tilesNeeded = roomArea / tileArea;
    
    // Add 10% wastage for cutting and breakage
    double tilesWithWastage = tilesNeeded * 1.10;
    
    // Boxes calculation (typically 1 box = 1 m2)
    double boxesNeeded = (roomArea / 1.0).ceil().toDouble();
    
    return {
      'room_area_m2': roomArea,
      'tiles_needed': tilesNeeded,
      'tiles_with_wastage': tilesWithWastage,
      'boxes_needed': boxesNeeded,
      'tile_area_m2': tileArea,
    };
  }
}