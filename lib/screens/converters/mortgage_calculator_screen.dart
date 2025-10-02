import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/converters/mortgage_calculator_controller.dart';
import '../../core/theme/app_colors.dart';
import 'package:intl/intl.dart';

class MortgageCalculatorScreen extends StatelessWidget {
  const MortgageCalculatorScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => MortgageCalculatorController(),
      child: const _MortgageCalculatorContent(),
    );
  }
}

class _MortgageCalculatorContent extends StatefulWidget {
  const _MortgageCalculatorContent({Key? key}) : super(key: key);

  @override
  State<_MortgageCalculatorContent> createState() => _MortgageCalculatorContentState();
}

class _MortgageCalculatorContentState extends State<_MortgageCalculatorContent> {
  final TextEditingController _loanController = TextEditingController();
  final TextEditingController _rateController = TextEditingController();
  final TextEditingController _termController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<MortgageCalculatorController>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.iosBlack : Colors.grey[100],
      appBar: AppBar(
        title: const Text('Kredi Hesaplayıcı'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: isDark ? AppColors.iosDarkGray : Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.clear_all),
            onPressed: () {
              controller.clear();
              _loanController.clear();
              _rateController.clear();
              _termController.clear();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Loan Amount
            _buildInputCard(
              title: 'Kredi Tutarı',
              hint: '0',
              suffix: '₺',
              icon: Icons.account_balance,
              color: AppColors.primary,
              isDark: isDark,
              controller: _loanController,
              onChanged: (value) => controller.setLoanAmount(double.tryParse(value) ?? 0),
            ),

            const SizedBox(height: 15),

            // Interest Rate
            _buildInputCard(
              title: 'Yıllık Faiz Oranı',
              hint: '0.00',
              suffix: '%',
              icon: Icons.percent,
              color: AppColors.warning,
              isDark: isDark,
              controller: _rateController,
              onChanged: (value) => controller.setInterestRate(double.tryParse(value) ?? 0),
            ),

            const SizedBox(height: 15),

            // Loan Term
            _buildInputCard(
              title: 'Kredi Vadesi',
              hint: '0',
              suffix: 'Yıl',
              icon: Icons.calendar_today,
              color: AppColors.success,
              isDark: isDark,
              controller: _termController,
              onChanged: (value) => controller.setLoanTermYears(int.tryParse(value) ?? 0),
            ),

            const SizedBox(height: 30),

            // Results
            if (controller.result != null) ...[
              // Monthly Payment
              Container(
                padding: const EdgeInsets.all(25),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: AppColors.premiumGradient),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.premium.withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    const Text(
                      'AYLIK TAKSİT',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white70,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      NumberFormat.currency(symbol: '₺', decimalDigits: 2)
                          .format(controller.result!.monthlyPayment),
                      style: const TextStyle(
                        fontSize: 42,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      '${controller.result!.loanTermMonths} ay boyunca',
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Summary Cards
              Row(
                children: [
                  Expanded(
                    child: _buildSummaryCard(
                      'Toplam Ödeme',
                      controller.result!.totalPayment,
                      Icons.payments,
                      AppColors.primary,
                      isDark,
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: _buildSummaryCard(
                      'Toplam Faiz',
                      controller.result!.totalInterest,
                      Icons.trending_up,
                      AppColors.error,
                      isDark,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Payment Breakdown Chart
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
                      'Ödeme Dağılımı',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          flex: (controller.result!.loanAmount / 
                                controller.result!.totalPayment * 100).round(),
                          child: Container(
                            height: 40,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(colors: AppColors.successGradient),
                              borderRadius: const BorderRadius.horizontal(
                                left: Radius.circular(10),
                              ),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'Ana Para',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          flex: (controller.result!.totalInterest / 
                                controller.result!.totalPayment * 100).round(),
                          child: Container(
                            height: 40,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(colors: AppColors.errorGradient),
                              borderRadius: const BorderRadius.horizontal(
                                right: Radius.circular(10),
                              ),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'Faiz',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildLegendItem(
                          'Ana Para',
                          controller.result!.loanAmount,
                          AppColors.success,
                        ),
                        _buildLegendItem(
                          'Faiz',
                          controller.result!.totalInterest,
                          AppColors.error,
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Amortization Schedule Button
              ElevatedButton.icon(
                onPressed: () => _showAmortizationSchedule(context, controller, isDark),
                icon: const Icon(Icons.table_chart),
                label: const Text('Amortisman Tablosunu Görüntüle'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInputCard({
    required String title,
    required String hint,
    required String suffix,
    required IconData icon,
    required Color color,
    required bool isDark,
    required TextEditingController controller,
    required Function(String) onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.iosDarkGray : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  decoration: InputDecoration(
                    hintText: hint,
                    border: InputBorder.none,
                    hintStyle: TextStyle(color: Colors.grey[400]),
                  ),
                  onChanged: onChanged,
                ),
              ),
              Text(
                suffix,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(
    String title,
    double amount,
    IconData icon,
    Color color,
    bool isDark,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.iosDarkGray : Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 10),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 5),
          Text(
            NumberFormat.compact().format(amount) + '₺',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, double value, Color color) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 12),
            ),
            Text(
              NumberFormat.compact().format(value) + '₺',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _showAmortizationSchedule(
    BuildContext context,
    MortgageCalculatorController controller,
    bool isDark,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        builder: (context, scrollController) => Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.iosDarkGray : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(25)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 10),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Amortisman Tablosu',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: const [
                    Expanded(child: Text('Ay', style: TextStyle(fontWeight: FontWeight.bold))),
                    Expanded(child: Text('Taksit', style: TextStyle(fontWeight: FontWeight.bold))),
                    Expanded(child: Text('Ana Para', style: TextStyle(fontWeight: FontWeight.bold))),
                    Expanded(child: Text('Faiz', style: TextStyle(fontWeight: FontWeight.bold))),
                    Expanded(child: Text('Kalan', style: TextStyle(fontWeight: FontWeight.bold))),
                  ],
                ),
              ),
              const Divider(),
              Expanded(
                child: ListView.builder(
                  controller: scrollController,
                  itemCount: controller.result!.amortizationSchedule.length,
                  itemBuilder: (context, index) {
                    final entry = controller.result!.amortizationSchedule[index];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      child: Row(
                        children: [
                          Expanded(child: Text('${entry.month}')),
                          Expanded(child: Text(NumberFormat.compact().format(entry.payment))),
                          Expanded(child: Text(NumberFormat.compact().format(entry.principal))),
                          Expanded(child: Text(NumberFormat.compact().format(entry.interest))),
                          Expanded(child: Text(NumberFormat.compact().format(entry.balance))),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}