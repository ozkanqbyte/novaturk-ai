import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/converters/date_calculator_controller.dart';
import '../../core/theme/app_colors.dart';
import 'package:intl/intl.dart';

class DateCalculatorScreen extends StatelessWidget {
  const DateCalculatorScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => DateCalculatorController(),
      child: const _DateCalculatorContent(),
    );
  }
}

class _DateCalculatorContent extends StatelessWidget {
  const _DateCalculatorContent({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<DateCalculatorController>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.iosBlack : Colors.grey[100],
      appBar: AppBar(
        title: const Text('Tarih Hesaplayıcı'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: isDark ? AppColors.iosDarkGray : Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: controller.reset,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Start Date Card
            _buildDateCard(
              context: context,
              title: 'Başlangıç Tarihi',
              date: controller.startDate,
              isDark: isDark,
              onDateSelected: (date) => controller.setStartDate(date),
              color: AppColors.primary,
            ),

            const SizedBox(height: 20),

            // End Date Card
            _buildDateCard(
              context: context,
              title: 'Bitiş Tarihi',
              date: controller.endDate,
              isDark: isDark,
              onDateSelected: (date) => controller.setEndDate(date),
              color: AppColors.success,
            ),

            const SizedBox(height: 30),

            // Results
            if (controller.result != null) ...[
              // Main Result
              Container(
                padding: const EdgeInsets.all(25),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: AppColors.purpleGradient),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    const Text(
                      'TOPLAM SÜRE',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white70,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 15),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildTimeUnit('${controller.result!.years}', 'YIL'),
                        _buildTimeSeparator(),
                        _buildTimeUnit('${controller.result!.months}', 'AY'),
                        _buildTimeSeparator(),
                        _buildTimeUnit('${controller.result!.days}', 'GÜN'),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Alternative Units
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.iosDarkGray : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Alternatif Birimler',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 20),
                    _buildAlternativeUnit(
                      'Toplam Gün',
                      '${NumberFormat('#,###').format(controller.result!.totalDays)} gün',
                      Icons.calendar_today,
                      AppColors.primary,
                    ),
                    const Divider(height: 30),
                    _buildAlternativeUnit(
                      'Hafta',
                      '${NumberFormat('#,###').format(controller.result!.weeks)} hafta',
                      Icons.date_range,
                      AppColors.success,
                    ),
                    const Divider(height: 30),
                    _buildAlternativeUnit(
                      'Saat',
                      '${NumberFormat('#,###').format(controller.result!.hours)} saat',
                      Icons.access_time,
                      AppColors.warning,
                    ),
                    const Divider(height: 30),
                    _buildAlternativeUnit(
                      'Dakika',
                      '${NumberFormat('#,###').format(controller.result!.minutes)} dakika',
                      Icons.timer,
                      AppColors.error,
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDateCard({
    required BuildContext context,
    required String title,
    required DateTime date,
    required bool isDark,
    required Function(DateTime) onDateSelected,
    required Color color,
  }) {
    return InkWell(
      onTap: () async {
        final selectedDate = await showDatePicker(
          context: context,
          initialDate: date,
          firstDate: DateTime(1900),
          lastDate: DateTime(2100),
        );
        if (selectedDate != null) {
          onDateSelected(selectedDate);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark ? AppColors.iosDarkGray : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.3), width: 2),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Icon(Icons.calendar_month, color: color, size: 32),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    DateFormat('dd MMMM yyyy, EEEE', 'tr_TR').format(date),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.edit, color: color),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeUnit(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 5),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.white70,
            letterSpacing: 1,
          ),
        ),
      ],
    );
  }

  Widget _buildTimeSeparator() {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 15),
      child: Text(
        ':',
        style: TextStyle(
          fontSize: 36,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _buildAlternativeUnit(String label, String value, IconData icon, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(width: 12),
            Text(
              label,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }
}