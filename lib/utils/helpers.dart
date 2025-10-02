import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'constants.dart';
import 'dart:math' as math;

class MathHelpers {
  /// Validates if a string is a valid number
  static bool isValidNumber(String input) {
    return RegExp(AppConstants.numberRegex).hasMatch(input);
  }
  
  /// Validates if a string is a valid mathematical expression
  static bool isValidExpression(String input) {
    return RegExp(AppConstants.expressionRegex).hasMatch(input);
  }
  
  /// Formats a number for display
  static String formatNumber(double number, {int? decimalPlaces}) {
    if (number.isInfinite) return AppConstants.infinitySymbol;
    if (number.isNaN) return 'Error';
    
    decimalPlaces ??= 10;
    
    // If it's a whole number, don't show decimal places
    if (number == number.toInt()) {
      return number.toInt().toString();
    }
    
    // For very large or very small numbers, use scientific notation
    if (number.abs() >= 1e15 || (number.abs() < 1e-6 && number != 0)) {
      return number.toStringAsExponential(6);
    }
    
    // Format with specified decimal places and remove trailing zeros
    String formatted = number.toStringAsFixed(decimalPlaces);
    formatted = formatted.replaceAll(RegExp(r'\.?0+$'), '');
    
    return formatted;
  }
  
  /// Converts degrees to radians
  static double degreesToRadians(double degrees) {
    return degrees * math.pi / 180;
  }
  
  /// Converts radians to degrees
  static double radiansToDegrees(double radians) {
    return radians * 180 / math.pi;
  }
  
  /// Calculates factorial of a number
  static int factorial(int n) {
    if (n < 0) throw ArgumentError('Factorial of negative number is undefined');
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  }
  
  /// Calculates greatest common divisor
  static int gcd(int a, int b) {
    while (b != 0) {
      int temp = b;
      b = a % b;
      a = temp;
    }
    return a.abs();
  }
  
  /// Calculates least common multiple
  static int lcm(int a, int b) {
    return (a * b).abs() ~/ gcd(a, b);
  }
  
  /// Checks if a number is prime
  static bool isPrime(int n) {
    if (n < 2) return false;
    if (n == 2) return true;
    if (n % 2 == 0) return false;
    
    for (int i = 3; i <= math.sqrt(n); i += 2) {
      if (n % i == 0) return false;
    }
    return true;
  }
  
  /// Generates fibonacci sequence up to n terms
  static List<int> fibonacciSequence(int n) {
    if (n <= 0) return [];
    if (n == 1) return [0];
    
    List<int> sequence = [0, 1];
    for (int i = 2; i < n; i++) {
      sequence.add(sequence[i - 1] + sequence[i - 2]);
    }
    return sequence;
  }
}

class UIHelpers {
  /// Shows a snackbar with custom styling
  static void showSnackBar(
    BuildContext context,
    String message, {
    Color? backgroundColor,
    Color? textColor,
    IconData? icon,
    Duration duration = const Duration(seconds: 3),
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            if (icon != null) ...[
              Icon(icon, color: textColor ?? Colors.white),
              const SizedBox(width: 12),
            ],
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: textColor ?? Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: backgroundColor ?? const Color(AppConstants.primaryColorValue),
        duration: duration,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.mediumRadius),
        ),
        margin: const EdgeInsets.all(AppConstants.mediumSpacing),
      ),
    );
  }
  
  /// Shows a loading dialog
  static void showLoadingDialog(BuildContext context, {String? message}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        content: Row(
          children: [
            const CircularProgressIndicator(),
            const SizedBox(width: 20),
            Expanded(
              child: Text(
                message ?? 'Processing...',
                style: const TextStyle(fontSize: AppConstants.mediumFontSize),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  /// Dismisses any showing dialog
  static void dismissDialog(BuildContext context) {
    Navigator.of(context).pop();
  }
  
  /// Shows a confirmation dialog
  static Future<bool?> showConfirmationDialog(
    BuildContext context,
    String title,
    String message, {
    String confirmText = 'Yes',
    String cancelText = 'No',
  }) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(cancelText),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(confirmText),
          ),
        ],
      ),
    );
  }
  
  /// Triggers haptic feedback based on intensity
  static void hapticFeedback(HapticFeedbackType type) {
    switch (type) {
      case HapticFeedbackType.light:
        HapticFeedback.lightImpact();
        break;
      case HapticFeedbackType.medium:
        HapticFeedback.mediumImpact();
        break;
      case HapticFeedbackType.heavy:
        HapticFeedback.heavyImpact();
        break;
      case HapticFeedbackType.selection:
        HapticFeedback.selectionClick();
        break;
    }
  }
}

enum HapticFeedbackType { light, medium, heavy, selection }

class ShareHelpers {
  /// Shares text content
  static Future<void> shareText(String text) async {
    await Share.share(text);
  }
  
  /// Shares calculation with formatted text
  static Future<void> shareCalculation(
    String expression,
    String result, {
    String? explanation,
  }) async {
    final StringBuffer buffer = StringBuffer();
    buffer.writeln('🧮 ${AppConstants.appName}');
    buffer.writeln();
    buffer.writeln('📝 Expression: $expression');
    buffer.writeln('✅ Result: $result');
    
    if (explanation != null && explanation.isNotEmpty) {
      buffer.writeln();
      buffer.writeln('💡 Explanation: $explanation');
    }
    
    buffer.writeln();
    buffer.writeln('📱 Download ${AppConstants.appName} for smart calculations!');
    
    await Share.share(buffer.toString());
  }
}

class UrlHelpers {
  /// Opens a URL in the default browser
  static Future<void> launchURL(String url) async {
    final Uri uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      throw 'Could not launch $url';
    }
  }
  
  /// Opens email client
  static Future<void> sendEmail(String email, {String? subject, String? body}) async {
    final Uri emailUri = Uri(
      scheme: 'mailto',
      path: email,
      queryParameters: {
        if (subject != null) 'subject': subject,
        if (body != null) 'body': body,
      },
    );
    
    await launchUrl(emailUri);
  }
}

class ValidationHelpers {
  /// Validates email format
  static bool isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }
  
  /// Validates phone number format
  static bool isValidPhoneNumber(String phone) {
    return RegExp(r'^\+?[1-9]\d{1,14}$').hasMatch(phone.replaceAll(RegExp(r'\s+'), ''));
  }
  
  /// Validates if string is not empty and has minimum length
  static bool isValidString(String input, {int minLength = 1}) {
    return input.trim().length >= minLength;
  }
}

class DateTimeHelpers {
  /// Formats DateTime to relative time string (e.g., "2 hours ago")
  static String getRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return '${weeks}w ago';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return '${months}mo ago';
    } else {
      final years = (difference.inDays / 365).floor();
      return '${years}y ago';
    }
  }
  
  /// Formats DateTime to readable string
  static String formatDateTime(DateTime dateTime, {bool includeTime = true}) {
    if (includeTime) {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year} at ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
    } else {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    }
  }
  
  /// Checks if date is today
  static bool isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }
  
  /// Checks if date is yesterday
  static bool isYesterday(DateTime date) {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return date.year == yesterday.year && 
           date.month == yesterday.month && 
           date.day == yesterday.day;
  }
}

class ColorHelpers {
  /// Creates a color from hex string
  static Color fromHex(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }
  
  /// Converts color to hex string
  static String toHex(Color color) {
    return '#${color.value.toRadixString(16).padLeft(8, '0').substring(2)}';
  }
  
  /// Creates a color with specified opacity
  static Color withOpacity(Color color, double opacity) {
    return color.withOpacity(opacity.clamp(0.0, 1.0));
  }
  
  /// Lightens a color by the given amount
  static Color lighten(Color color, [double amount = 0.1]) {
    assert(amount >= 0 && amount <= 1, 'Amount must be between 0 and 1');
    final hsl = HSLColor.fromColor(color);
    final lightness = (hsl.lightness + amount).clamp(0.0, 1.0);
    return hsl.withLightness(lightness).toColor();
  }
  
  /// Darkens a color by the given amount
  static Color darken(Color color, [double amount = 0.1]) {
    assert(amount >= 0 && amount <= 1, 'Amount must be between 0 and 1');
    final hsl = HSLColor.fromColor(color);
    final lightness = (hsl.lightness - amount).clamp(0.0, 1.0);
    return hsl.withLightness(lightness).toColor();
  }
}

class DeviceHelpers {
  /// Gets screen width
  static double getScreenWidth(BuildContext context) {
    return MediaQuery.of(context).size.width;
  }
  
  /// Gets screen height
  static double getScreenHeight(BuildContext context) {
    return MediaQuery.of(context).size.height;
  }
  
  /// Checks if device is in landscape mode
  static bool isLandscape(BuildContext context) {
    return MediaQuery.of(context).orientation == Orientation.landscape;
  }
  
  /// Checks if device is a tablet
  static bool isTablet(BuildContext context) {
    final shortestSide = MediaQuery.of(context).size.shortestSide;
    return shortestSide >= 600;
  }
  
  /// Gets device pixel ratio
  static double getPixelRatio(BuildContext context) {
    return MediaQuery.of(context).devicePixelRatio;
  }
  
  /// Gets status bar height
  static double getStatusBarHeight(BuildContext context) {
    return MediaQuery.of(context).padding.top;
  }
  
  /// Gets bottom padding (for devices with home indicator)
  static double getBottomPadding(BuildContext context) {
    return MediaQuery.of(context).padding.bottom;
  }
}