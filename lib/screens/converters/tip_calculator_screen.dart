import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/converters/tip_calculator_controller.dart';
import '../../core/theme/app_colors.dart';
import 'package:intl/intl.dart';

class TipCalculatorScreen extends StatelessWidget {
  const TipCalculatorScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => TipCalculatorController(),
      child: const _TipCalculatorContent(),
    );
  }
}

class _TipCalculatorContent extends StatefulWidget {
  const _TipCalculatorContent({Key? key}) : super(key: key);

  @override
  State<_TipCalculatorContent> createState() => _TipCalculatorContentState();
}

class _TipCalculatorContentState extends State<_TipCalculatorContent> {
  final TextEditingController _billController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TipCalculatorController>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.iosBlack : Colors.grey[100],
      appBar: AppBar(
        title: const Text('Bahşiş Hesaplayıcı'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: isDark ? AppColors.iosDarkGray : Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.clear_all),
            onPressed: () {
              controller.clear();
              _billController.clear();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Bill Amount Input
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: AppColors.successGradient),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.success.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Hesap Tutarı',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white70,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const Text(
                        '₺',
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _billController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                          decoration: const InputDecoration(
                            hintText: '0.00',
                            border: InputBorder.none,
                            hintStyle: TextStyle(color: Colors.white60),
                          ),
                          onChanged: (text) {
                            final value = double.tryParse(text) ?? 0;
                            controller.setBillAmount(value);
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 25),

            // Tip Percentage Selector
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppColors.iosDarkGray : Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Bahşiş Oranı',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 8),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(colors: AppColors.successGradient),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '%${controller.tipPercentage.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  Slider(
                    value: controller.tipPercentage,
                    min: 0,
                    max: 30,
                    divisions: 60,
                    activeColor: AppColors.success,
                    onChanged: (value) => controller.setTipPercentage(value),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 10,
                    children: controller.commonTipPercentages.map((percentage) {
                      final isSelected = controller.tipPercentage == percentage;
                      return ChoiceChip(
                        label: Text('%${percentage.toInt()}'),
                        selected: isSelected,
                        selectedColor: AppColors.success,
                        onSelected: (selected) {
                          if (selected) controller.setTipPercentage(percentage);
                        },
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 25),

            // Number of People
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppColors.iosDarkGray : Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Kişi Sayısı',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline),
                        color: AppColors.error,
                        onPressed: controller.decrementPeople,
                      ),
                      Container(
                        width: 60,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${controller.numberOfPeople}',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add_circle_outline),
                        color: AppColors.success,
                        onPressed: controller.incrementPeople,
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 25),

            // Results
            if (controller.result != null) ...[
              _buildResultCard(
                'Bahşiş Tutarı',
                controller.result!.tipAmount,
                AppColors.success,
                isDark,
              ),
              const SizedBox(height: 15),
              _buildResultCard(
                'Toplam Tutar',
                controller.result!.totalAmount,
                AppColors.primary,
                isDark,
              ),
              const SizedBox(height: 15),
              _buildResultCard(
                'Kişi Başı Tutar',
                controller.result!.amountPerPerson,
                AppColors.warning,
                isDark,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildResultCard(String title, double amount, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.iosDarkGray : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3), width: 2),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                ),
              ),
              const SizedBox(height: 5),
              Text(
                NumberFormat.currency(symbol: '₺', decimalDigits: 2).format(amount),
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          Icon(Icons.attach_money, color: color, size: 40),
        ],
      ),
    );
  }
}