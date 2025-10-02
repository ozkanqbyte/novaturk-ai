import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/converters/statistics_controller.dart';
import '../../core/theme/app_colors.dart';
import 'package:intl/intl.dart';

class StatisticsCalculatorScreen extends StatelessWidget {
  const StatisticsCalculatorScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => StatisticsController(),
      child: const _StatisticsCalculatorContent(),
    );
  }
}

class _StatisticsCalculatorContent extends StatefulWidget {
  const _StatisticsCalculatorContent({Key? key}) : super(key: key);

  @override
  State<_StatisticsCalculatorContent> createState() => _StatisticsCalculatorContentState();
}

class _StatisticsCalculatorContentState extends State<_StatisticsCalculatorContent> {
  final TextEditingController _valueController = TextEditingController();
  final TextEditingController _bulkController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<StatisticsController>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.iosBlack : Colors.grey[100],
      appBar: AppBar(
        title: const Text('İstatistik Hesaplayıcı'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: isDark ? AppColors.iosDarkGray : Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.clear_all),
            onPressed: () {
              controller.clear();
              _valueController.clear();
              _bulkController.clear();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Add Single Value
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: AppColors.purpleGradient),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Tek Değer Ekle',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white70,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _valueController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                          decoration: const InputDecoration(
                            hintText: 'Sayı girin',
                            border: InputBorder.none,
                            hintStyle: TextStyle(color: Colors.white60),
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add_circle, color: Colors.white, size: 32),
                        onPressed: () {
                          final value = double.tryParse(_valueController.text);
                          if (value != null) {
                            controller.addValue(value);
                            _valueController.clear();
                          }
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 15),

            // Bulk Add
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppColors.iosDarkGray : Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Toplu Ekle (virgül, noktalı virgül veya boşlukla ayırın)',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _bulkController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'Örn: 10, 20, 30, 40, 50',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton.icon(
                    onPressed: () {
                      controller.addValuesFromText(_bulkController.text);
                      _bulkController.clear();
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Toplu Ekle'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Data List
            if (controller.data.isNotEmpty) ...[
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
                        Text(
                          'Veriler (${controller.data.length})',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_sweep, color: AppColors.error),
                          onPressed: controller.clear,
                        ),
                      ],
                    ),
                    const SizedBox(height: 15),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: controller.data.asMap().entries.map((entry) {
                        return Chip(
                          label: Text('${entry.value}'),
                          deleteIcon: const Icon(Icons.close, size: 18),
                          onDeleted: () => controller.removeValueAt(entry.key),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Statistics Results
              if (controller.result != null) ...[
                // Main Stats
                _buildStatGrid(
                  [
                    _StatItem('Ortalama', controller.result!.mean, Icons.analytics, AppColors.primary),
                    _StatItem('Medyan', controller.result!.median, Icons.show_chart, AppColors.success),
                    _StatItem('Mod', controller.result!.mode, Icons.repeat, AppColors.warning),
                    _StatItem('Std. Sapma', controller.result!.standardDeviation, Icons.trending_up, AppColors.error),
                  ],
                  isDark,
                ),

                const SizedBox(height: 15),

                // Secondary Stats
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
                        'Detaylı İstatistikler',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 20),
                      _buildStatRow('Varyans', controller.result!.variance, Icons.square_foot),
                      const Divider(),
                      _buildStatRow('Toplam', controller.result!.sum, Icons.add_circle_outline),
                      const Divider(),
                      _buildStatRow('Minimum', controller.result!.min, Icons.arrow_downward),
                      const Divider(),
                      _buildStatRow('Maksimum', controller.result!.max, Icons.arrow_upward),
                      const Divider(),
                      _buildStatRow('Aralık', controller.result!.range, Icons.swap_vert),
                      const Divider(),
                      _buildStatRow('Q1 (1. Çeyrek)', controller.result!.q1, Icons.looks_one),
                      const Divider(),
                      _buildStatRow('Q3 (3. Çeyrek)', controller.result!.q3, Icons.looks_3),
                      const Divider(),
                      _buildStatRow('IQR (Çeyrekler Arası)', controller.result!.iqr, Icons.compare_arrows),
                    ],
                  ),
                ),

                const SizedBox(height: 15),

                // Visualization
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.iosDarkGray : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Dağılım Görünümü',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 20),
                      _buildDistributionChart(controller.result!, isDark),
                    ],
                  ),
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatGrid(List<_StatItem> items, bool isDark) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 1.3,
        crossAxisSpacing: 15,
        mainAxisSpacing: 15,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: isDark ? AppColors.iosDarkGray : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: item.color.withOpacity(0.3)),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(item.icon, color: item.color, size: 32),
              const SizedBox(height: 10),
              Text(
                item.label,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 5),
              Text(
                item.value.toStringAsFixed(2),
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: item.color,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatRow(String label, double value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: AppColors.primary),
              const SizedBox(width: 10),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          Text(
            value.toStringAsFixed(2),
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDistributionChart(var result, bool isDark) {
    // Simple box plot visualization
    final min = result.min;
    final max = result.max;
    final q1 = result.q1;
    final median = result.median;
    final q3 = result.q3;
    final range = max - min;

    return Column(
      children: [
        SizedBox(
          height: 80,
          child: Stack(
            children: [
              // Min to Max line
              Positioned(
                left: 20,
                right: 20,
                top: 40,
                child: Container(
                  height: 2,
                  color: Colors.grey,
                ),
              ),
              // Box (Q1 to Q3)
              Positioned(
                left: ((q1 - min) / range * 100 * 0.6 + 20).clamp(20.0, double.infinity),
                right: ((max - q3) / range * 100 * 0.6 + 20).clamp(20.0, double.infinity),
                top: 20,
                bottom: 20,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: AppColors.purpleGradient),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.primary, width: 2),
                  ),
                ),
              ),
              // Median line
              Positioned(
                left: ((median - min) / range * 100 * 0.6 + 20).clamp(20.0, double.infinity),
                top: 15,
                bottom: 15,
                child: Container(
                  width: 3,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 15),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildChartLabel('Min\n${min.toStringAsFixed(1)}'),
            _buildChartLabel('Q1\n${q1.toStringAsFixed(1)}'),
            _buildChartLabel('Med\n${median.toStringAsFixed(1)}'),
            _buildChartLabel('Q3\n${q3.toStringAsFixed(1)}'),
            _buildChartLabel('Max\n${max.toStringAsFixed(1)}'),
          ],
        ),
      ],
    );
  }

  Widget _buildChartLabel(String text) {
    return Text(
      text,
      textAlign: TextAlign.center,
      style: const TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w500,
      ),
    );
  }
}

class _StatItem {
  final String label;
  final double value;
  final IconData icon;
  final Color color;

  _StatItem(this.label, this.value, this.icon, this.color);
}