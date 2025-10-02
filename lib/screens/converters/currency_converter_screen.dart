import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/converters/currency_controller.dart';
import '../../models/converter_models.dart';
import '../../core/theme/app_colors.dart';
import 'package:intl/intl.dart';

class CurrencyConverterScreen extends StatelessWidget {
  const CurrencyConverterScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => CurrencyController()..fetchExchangeRates(),
      child: const _CurrencyConverterContent(),
    );
  }
}

class _CurrencyConverterContent extends StatefulWidget {
  const _CurrencyConverterContent({Key? key}) : super(key: key);

  @override
  State<_CurrencyConverterContent> createState() => _CurrencyConverterContentState();
}

class _CurrencyConverterContentState extends State<_CurrencyConverterContent> {
  final TextEditingController _inputController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<CurrencyController>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.iosBlack : Colors.grey[100],
      appBar: AppBar(
        title: const Text('Döviz Dönüştürücü'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: isDark ? AppColors.iosDarkGray : Colors.white,
        actions: [
          IconButton(
            icon: controller.isLoading 
                ? const SizedBox(
                    width: 20, 
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh),
            onPressed: controller.isLoading ? null : () => controller.fetchExchangeRates(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Last Update Info
            if (controller.lastUpdate != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.check_circle, color: AppColors.success, size: 16),
                    const SizedBox(width: 8),
                    Text(
                      'Son güncelleme: ${_formatDateTime(controller.lastUpdate!)}',
                      style: const TextStyle(
                        color: AppColors.success,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),

            if (controller.error != null)
              Container(
                margin: const EdgeInsets.only(top: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning, color: AppColors.error, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        controller.error!,
                        style: const TextStyle(color: AppColors.error, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 20),

            _buildCurrencyCard(
              context: context,
              title: 'Dönüştür',
              value: controller.inputValue,
              currency: controller.fromCurrency,
              isDark: isDark,
              isInput: true,
              onCurrencyChange: (currency) => controller.setFromCurrency(currency),
              onValueChange: (value) => controller.setInputValue(value),
              textController: _inputController,
            ),
            
            const SizedBox(height: 20),

            FloatingActionButton(
              mini: true,
              backgroundColor: AppColors.premium,
              onPressed: () {
                controller.swap();
                _inputController.text = controller.inputValue.toStringAsFixed(2);
              },
              child: const Icon(Icons.swap_vert, color: Colors.white),
            ),

            const SizedBox(height: 20),

            _buildCurrencyCard(
              context: context,
              title: 'Sonuç',
              value: controller.outputValue,
              currency: controller.toCurrency,
              isDark: isDark,
              isInput: false,
              onCurrencyChange: (currency) => controller.setToCurrency(currency),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    final format = DateFormat('HH:mm');
    return format.format(dateTime);
  }

  Widget _buildCurrencyCard({
    required BuildContext context,
    required String title,
    required double value,
    required Currency currency,
    required bool isDark,
    required bool isInput,
    required Function(Currency) onCurrencyChange,
    Function(double)? onValueChange,
    TextEditingController? textController,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: isInput ? LinearGradient(colors: AppColors.premiumGradient) : null,
        color: isInput ? null : (isDark ? AppColors.iosDarkGray : Colors.white),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: (isInput ? AppColors.premium : Colors.black).withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              color: isInput ? Colors.white70 : (isDark ? Colors.grey[400] : Colors.grey[600]),
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 15),
          Row(
            children: [
              Expanded(
                flex: 3,
                child: isInput
                    ? TextField(
                        controller: textController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        style: TextStyle(
                          fontSize: 36, 
                          fontWeight: FontWeight.bold,
                          color: isInput ? Colors.white : null,
                        ),
                        decoration: InputDecoration(
                          hintText: '0.00',
                          border: InputBorder.none,
                          hintStyle: TextStyle(
                            color: isInput ? Colors.white60 : Colors.grey[400],
                          ),
                        ),
                        onChanged: (text) {
                          final value = double.tryParse(text) ?? 0;
                          onValueChange?.call(value);
                        },
                      )
                    : Text(
                        NumberFormat('#,##0.00').format(value),
                        style: const TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          InkWell(
            onTap: () => _showCurrencyPicker(context, currency, onCurrencyChange),
            child: Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: isInput 
                    ? Colors.white.withOpacity(0.2) 
                    : AppColors.premium.withOpacity(0.1),
                borderRadius: BorderRadius.circular(15),
                border: Border.all(
                  color: isInput ? Colors.white30 : AppColors.premium.withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  Text(
                    currency.flag,
                    style: const TextStyle(fontSize: 28),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          currency.code,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: isInput ? Colors.white : AppColors.premium,
                          ),
                        ),
                        Text(
                          currency.name,
                          style: TextStyle(
                            fontSize: 12,
                            color: isInput ? Colors.white70 : Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.arrow_drop_down, 
                    color: isInput ? Colors.white : AppColors.premium,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showCurrencyPicker(
    BuildContext context,
    Currency currentCurrency,
    Function(Currency) onChanged,
  ) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        builder: (context, scrollController) => Container(
          decoration: BoxDecoration(
            color: Theme.of(context).brightness == Brightness.dark
                ? AppColors.iosDarkGray
                : Colors.white,
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
                'Para Birimi Seç',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              Expanded(
                child: ListView.builder(
                  controller: scrollController,
                  itemCount: Currency.currencies.length,
                  itemBuilder: (context, index) {
                    final currency = Currency.currencies[index];
                    final isSelected = currency.code == currentCurrency.code;
                    return ListTile(
                      leading: Text(
                        currency.flag,
                        style: const TextStyle(fontSize: 32),
                      ),
                      title: Text(currency.name),
                      subtitle: Text(currency.code),
                      trailing: isSelected
                          ? const Icon(Icons.check_circle, color: AppColors.premium)
                          : null,
                      selected: isSelected,
                      onTap: () {
                        onChanged(currency);
                        Navigator.pop(context);
                      },
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