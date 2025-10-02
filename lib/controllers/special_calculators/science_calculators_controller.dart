import 'package:flutter/material.dart';
import 'dart:math';
import '../../utils/calculator_formatter.dart';

/// 🔬 SCIENCE CALCULATORS CONTROLLER
/// 8 Bilim Hesaplayıcısı: Fizik, Kimya, Elektrik, Optik, Mekanik, Termodinamik, Atom, Dalga

class ScienceCalculatorsController extends ChangeNotifier {
  // Dinamik sayı formatlama (bilimsel hesaplamalar için)
  static String _formatNumber(double number, {int decimals = 4}) {
    if (number.abs() >= 1e6 || (number.abs() < 0.001 && number != 0)) {
      // Bilimsel notasyon
      return number.toStringAsExponential(decimals);
    }
    return CalculatorFormatter.formatNumber(number, decimals: decimals);
  }
  // Physics Calculator - Common formulas
  Map<String, double> calculatePhysics(String formula, Map<String, dynamic> values) {
    switch (formula) {
      case 'force': // F = ma
        double mass = values['mass'] ?? 0;
        double acceleration = values['acceleration'] ?? 0;
        return {'force': mass * acceleration};
      
      case 'kinetic_energy': // KE = 0.5 * m * v²
        double mass = values['mass'] ?? 0;
        double velocity = values['velocity'] ?? 0;
        return {'kinetic_energy': 0.5 * mass * velocity * velocity};
      
      case 'potential_energy': // PE = mgh
        double mass = values['mass'] ?? 0;
        double gravity = values['gravity'] ?? 9.81;
        double height = values['height'] ?? 0;
        return {'potential_energy': mass * gravity * height};
      
      case 'work': // W = F * d * cos(θ)
        double force = values['force'] ?? 0;
        double distance = values['distance'] ?? 0;
        double angle = values['angle'] ?? 0; // in degrees
        double angleRad = angle * pi / 180;
        return {'work': force * distance * cos(angleRad)};
      
      case 'power': // P = W / t
        double work = values['work'] ?? 0;
        double time = values['time'] ?? 1;
        return {'power': work / time};
      
      case 'momentum': // p = mv
        double mass = values['mass'] ?? 0;
        double velocity = values['velocity'] ?? 0;
        return {'momentum': mass * velocity};
      
      case 'gravity': // F = G * (m1 * m2) / r²
        double m1 = values['mass1'] ?? 0;
        double m2 = values['mass2'] ?? 0;
        double distance = values['distance'] ?? 1;
        double G = 6.674e-11; // Gravitational constant
        return {'gravitational_force': G * m1 * m2 / (distance * distance)};
      
      default:
        return {};
    }
  }

  // Chemistry Calculator
  Map<String, double> calculateChemistry(String calculation, Map<String, dynamic> values) {
    switch (calculation) {
      case 'molar_mass': // From atomic weights
        // This would need a periodic table lookup - simplified
        return {};
      
      case 'moles': // n = mass / molar_mass
        double mass = values['mass'] ?? 0;
        double molarMass = values['molar_mass'] ?? 1;
        return {'moles': mass / molarMass};
      
      case 'molarity': // M = moles / liters
        double moles = values['moles'] ?? 0;
        double volume = values['volume'] ?? 1; // in liters
        return {'molarity': moles / volume};
      
      case 'ph': // pH = -log[H+]
        double hConcentration = values['h_concentration'] ?? 1e-7;
        return {'ph': -log(hConcentration) / ln10};
      
      case 'dilution': // M1V1 = M2V2
        double m1 = values['initial_molarity'] ?? 0;
        double v1 = values['initial_volume'] ?? 0;
        double m2 = values['final_molarity'] ?? 1;
        return {'final_volume': (m1 * v1) / m2};
      
      case 'ideal_gas': // PV = nRT
        double? pressure = values['pressure'];
        double? volume = values['volume'];
        double? moles = values['moles'];
        double? temperature = values['temperature'];
        double R = 8.314; // Gas constant J/(mol·K)
        
        if (pressure == null && volume != null && moles != null && temperature != null) {
          return {'pressure': (moles * R * temperature) / volume};
        } else if (volume == null && pressure != null && moles != null && temperature != null) {
          return {'volume': (moles * R * temperature) / pressure};
        }
        return {};
      
      default:
        return {};
    }
  }

  // Electrical Calculator
  Map<String, double> calculateElectrical(String formula, Map<String, dynamic> values) {
    switch (formula) {
      case 'ohms_law_voltage': // V = IR
        double current = values['current'] ?? 0;
        double resistance = values['resistance'] ?? 0;
        return {'voltage': current * resistance};
      
      case 'ohms_law_current': // I = V/R
        double voltage = values['voltage'] ?? 0;
        double resistance = values['resistance'] ?? 1;
        return {'current': voltage / resistance};
      
      case 'ohms_law_resistance': // R = V/I
        double voltage = values['voltage'] ?? 0;
        double current = values['current'] ?? 1;
        return {'resistance': voltage / current};
      
      case 'power': // P = VI = I²R = V²/R
        if (values.containsKey('voltage') && values.containsKey('current')) {
          return {'power': values['voltage']! * values['current']!};
        } else if (values.containsKey('current') && values.containsKey('resistance')) {
          double current = values['current']!;
          return {'power': current * current * values['resistance']!};
        } else if (values.containsKey('voltage') && values.containsKey('resistance')) {
          double voltage = values['voltage']!;
          return {'power': (voltage * voltage) / values['resistance']!};
        }
        return {};
      
      case 'series_resistance': // Rtotal = R1 + R2 + ...
        double r1 = values['r1'] ?? 0;
        double r2 = values['r2'] ?? 0;
        double r3 = values['r3'] ?? 0;
        return {'total_resistance': r1 + r2 + r3};
      
      case 'parallel_resistance': // 1/Rtotal = 1/R1 + 1/R2 + ...
        double r1 = values['r1'] ?? 1;
        double r2 = values['r2'] ?? 1;
        return {'total_resistance': 1 / (1/r1 + 1/r2)};
      
      case 'capacitance': // C = Q/V
        double charge = values['charge'] ?? 0;
        double voltage = values['voltage'] ?? 1;
        return {'capacitance': charge / voltage};
      
      case 'energy_capacitor': // E = 0.5 * C * V²
        double capacitance = values['capacitance'] ?? 0;
        double voltage = values['voltage'] ?? 0;
        return {'energy': 0.5 * capacitance * voltage * voltage};
      
      default:
        return {};
    }
  }

  // Optics Calculator
  Map<String, double> calculateOptics(String formula, Map<String, dynamic> values) {
    switch (formula) {
      case 'lens_equation': // 1/f = 1/u + 1/v
        double? f = values['focal_length'];
        double? u = values['object_distance'];
        double? v = values['image_distance'];
        
        if (f == null && u != null && v != null) {
          return {'focal_length': 1 / (1/u + 1/v)};
        } else if (u == null && f != null && v != null) {
          return {'object_distance': 1 / (1/f - 1/v)};
        } else if (v == null && f != null && u != null) {
          return {'image_distance': 1 / (1/f - 1/u)};
        }
        return {};
      
      case 'magnification': // m = v/u = h'/h
        double u = values['object_distance'] ?? 1;
        double v = values['image_distance'] ?? 0;
        return {
          'magnification': v / u,
          'lateral_magnification': -(v / u),
        };
      
      case 'snells_law': // n1 * sin(θ1) = n2 * sin(θ2)
        double n1 = values['n1'] ?? 1.0;
        double theta1 = values['theta1'] ?? 0; // degrees
        double n2 = values['n2'] ?? 1.5;
        double theta1Rad = theta1 * pi / 180;
        double sinTheta2 = (n1 * sin(theta1Rad)) / n2;
        double theta2Rad = asin(sinTheta2);
        return {'theta2': theta2Rad * 180 / pi};
      
      case 'critical_angle': // θc = arcsin(n2/n1)
        double n1 = values['n1'] ?? 1.5;
        double n2 = values['n2'] ?? 1.0;
        double criticalAngle = asin(n2 / n1) * 180 / pi;
        return {'critical_angle': criticalAngle};
      
      default:
        return {};
    }
  }

  // Mechanics Calculator
  Map<String, double> calculateMechanics(String formula, Map<String, dynamic> values) {
    switch (formula) {
      case 'velocity': // v = u + at
        double u = values['initial_velocity'] ?? 0;
        double a = values['acceleration'] ?? 0;
        double t = values['time'] ?? 0;
        return {'final_velocity': u + a * t};
      
      case 'displacement': // s = ut + 0.5at²
        double u = values['initial_velocity'] ?? 0;
        double t = values['time'] ?? 0;
        double a = values['acceleration'] ?? 0;
        return {'displacement': u * t + 0.5 * a * t * t};
      
      case 'velocity_squared': // v² = u² + 2as
        double u = values['initial_velocity'] ?? 0;
        double a = values['acceleration'] ?? 0;
        double s = values['displacement'] ?? 0;
        return {'final_velocity': sqrt(u * u + 2 * a * s)};
      
      case 'centripetal_force': // F = mv²/r
        double mass = values['mass'] ?? 0;
        double velocity = values['velocity'] ?? 0;
        double radius = values['radius'] ?? 1;
        return {'centripetal_force': mass * velocity * velocity / radius};
      
      case 'angular_velocity': // ω = v/r
        double velocity = values['velocity'] ?? 0;
        double radius = values['radius'] ?? 1;
        return {'angular_velocity': velocity / radius};
      
      case 'torque': // τ = F * r * sin(θ)
        double force = values['force'] ?? 0;
        double radius = values['radius'] ?? 0;
        double angle = values['angle'] ?? 90; // degrees
        double angleRad = angle * pi / 180;
        return {'torque': force * radius * sin(angleRad)};
      
      default:
        return {};
    }
  }

  // Thermodynamics Calculator
  Map<String, double> calculateThermodynamics(String formula, Map<String, dynamic> values) {
    switch (formula) {
      case 'heat_transfer': // Q = mcΔT
        double mass = values['mass'] ?? 0;
        double specificHeat = values['specific_heat'] ?? 4186; // Water default
        double deltaT = values['temperature_change'] ?? 0;
        return {'heat': mass * specificHeat * deltaT};
      
      case 'thermal_expansion_linear': // ΔL = αL₀ΔT
        double alpha = values['expansion_coefficient'] ?? 0;
        double initialLength = values['initial_length'] ?? 0;
        double deltaT = values['temperature_change'] ?? 0;
        return {'length_change': alpha * initialLength * deltaT};
      
      case 'thermal_expansion_volume': // ΔV = βV₀ΔT
        double beta = values['expansion_coefficient'] ?? 0;
        double initialVolume = values['initial_volume'] ?? 0;
        double deltaT = values['temperature_change'] ?? 0;
        return {'volume_change': beta * initialVolume * deltaT};
      
      case 'efficiency': // η = (W_out / Q_in) * 100
        double workOut = values['work_output'] ?? 0;
        double heatIn = values['heat_input'] ?? 1;
        return {'efficiency': (workOut / heatIn) * 100};
      
      case 'carnot_efficiency': // η = 1 - (Tc/Th)
        double coldTemp = values['cold_temperature'] ?? 273; // Kelvin
        double hotTemp = values['hot_temperature'] ?? 373;
        return {'carnot_efficiency': (1 - coldTemp / hotTemp) * 100};
      
      default:
        return {};
    }
  }

  // Atomic Physics Calculator
  Map<String, double> calculateAtomic(String formula, Map<String, dynamic> values) {
    switch (formula) {
      case 'energy_photon': // E = hf = hc/λ
        double h = 6.626e-34; // Planck's constant
        double c = 3e8; // Speed of light
        
        if (values.containsKey('frequency')) {
          double frequency = values['frequency']!;
          return {'energy': h * frequency};
        } else if (values.containsKey('wavelength')) {
          double wavelength = values['wavelength']!;
          return {'energy': (h * c) / wavelength};
        }
        return {};
      
      case 'de_broglie': // λ = h/p = h/(mv)
        double h = 6.626e-34;
        double mass = values['mass'] ?? 0;
        double velocity = values['velocity'] ?? 0;
        return {'wavelength': h / (mass * velocity)};
      
      case 'rydberg': // 1/λ = R(1/n₁² - 1/n₂²)
        double R = 1.097e7; // Rydberg constant
        double n1 = values['n1'] ?? 1;
        double n2 = values['n2'] ?? 2;
        double invLambda = R * (1/(n1*n1) - 1/(n2*n2));
        return {'wavelength': 1 / invLambda};
      
      case 'half_life': // N = N₀ * (1/2)^(t/t_half)
        double n0 = values['initial_amount'] ?? 1;
        double t = values['time'] ?? 0;
        double tHalf = values['half_life'] ?? 1;
        return {'remaining_amount': n0 * pow(0.5, t / tHalf)};
      
      default:
        return {};
    }
  }

  // Wave Calculator
  Map<String, double> calculateWave(String formula, Map<String, dynamic> values) {
    switch (formula) {
      case 'wave_speed': // v = fλ
        if (values.containsKey('frequency') && values.containsKey('wavelength')) {
          return {'speed': values['frequency']! * values['wavelength']!};
        } else if (values.containsKey('speed') && values.containsKey('frequency')) {
          return {'wavelength': values['speed']! / values['frequency']!};
        } else if (values.containsKey('speed') && values.containsKey('wavelength')) {
          return {'frequency': values['speed']! / values['wavelength']!};
        }
        return {};
      
      case 'period': // T = 1/f
        double frequency = values['frequency'] ?? 1;
        return {'period': 1 / frequency};
      
      case 'angular_frequency': // ω = 2πf
        double frequency = values['frequency'] ?? 0;
        return {'angular_frequency': 2 * pi * frequency};
      
      case 'wave_number': // k = 2π/λ
        double wavelength = values['wavelength'] ?? 1;
        return {'wave_number': 2 * pi / wavelength};
      
      case 'sound_level': // β = 10 * log10(I/I₀)
        double intensity = values['intensity'] ?? 1e-12;
        double i0 = 1e-12; // Reference intensity
        return {'decibels': 10 * log(intensity / i0) / ln10};
      
      case 'doppler_effect': // f' = f * (v + v_observer) / (v + v_source)
        double f = values['frequency'] ?? 0;
        double v = values['wave_speed'] ?? 343; // Sound in air
        double vObserver = values['observer_velocity'] ?? 0;
        double vSource = values['source_velocity'] ?? 0;
        return {'observed_frequency': f * (v + vObserver) / (v + vSource)};
      
      default:
        return {};
    }
  }
}