import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/converters/temperature_controller.dart';
import '../../models/converter_models.dart';
import '../../core/theme/app_colors.dart';

class TemperatureConverterScreen extends StatelessWidget {
  const TemperatureConverterScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => TemperatureController(),
      child: const _TemperatureConverterContent(),
    );
  }
}

class _TemperatureConverterContent extends StatefulWidget {
  const _TemperatureConverterContent({Key? key}) : super(key: key);

  @override
  State<_TemperatureConverterContent> createState() => _TemperatureConverterContentState();
}

class _TemperatureConverterContentState extends State<_TemperatureConverterContent> {
  final TextEditingController _inputController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TemperatureController>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.iosBlack : Colors.grey[100],
      appBar: AppBar(
        title: const Text('Sıcaklık Dönüştürücü'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: isDark ? AppColors.iosDarkGray : Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildTempCard(
              context: context,
              title: 'Dönüştür',
              value: controller.inputValue,
              unit: controller.fromUnit,
              isDark: isDark,
              isInput: true,
              onUnitChange: (unit) => controller.setFromUnit(unit),
              onValueChange: (value) => controller.setInputValue(value),
              textController: _inputController,
            ),
            
            const SizedBox(height: 20),

            FloatingActionButton(
              mini: true,
              backgroundColor: AppColors.error,
              onPressed: () {
                controller.swap();
                _inputController.text = controller.inputValue.toStringAsFixed(2);
              },
              child: const Icon(Icons.swap_vert, color: Colors.white),
            ),

            const SizedBox(height: 20),

            _buildTempCard(
              context: context,
              title: 'Sonuç',
              value: controller.outputValue,
              unit: controller.toUnit,
              isDark: isDark,
              isInput: false,
              onUnitChange: (unit) => controller.setToUnit(unit),
            ),

            const SizedBox(height: 30),

            // Common temperatures
            _buildCommonTemperatures(context, isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildTempCard({
    required BuildContext context,
    required String title,
    required double value,
    required TemperatureUnit unit,
    required bool isDark,
    required bool isInput,
    required Function(TemperatureUnit) onUnitChange,
    Function(double)? onValueChange,
    TextEditingController? textController,
  }) {
    // Get color based on temperature in Celsius
    Color getTempColor(double celsius) {
      if (celsius < 0) return Colors.blue;
      if (celsius < 15) return Colors.cyan;
      if (celsius < 25) return Colors.green;
      if (celsius < 35) return Colors.orange;
      return Colors.red;
    }

    double celsius = TemperatureUnit.convert(value, unit.symbol, '°C');
    Color tempColor = getTempColor(celsius);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.iosDarkGray : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: tempColor.withOpacity(0.3), width: 2),
        boxShadow: [
          BoxShadow(
            color: tempColor.withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
              Icon(
                Icons.thermostat,
                color: tempColor,
                size: 24,
              ),
            ],
          ),
          const SizedBox(height: 15),
          Row(
            children: [
              Expanded(
                flex: 3,
                child: isInput
                    ? TextField(
                        controller: textController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
                        style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: tempColor),
                        decoration: InputDecoration(
                          hintText: '0',
                          border: InputBorder.none,
                          hintStyle: TextStyle(color: Colors.grey[400]),
                        ),
                        onChanged: (text) {
                          final value = double.tryParse(text) ?? 0;
                          onValueChange?.call(value);
                        },
                      )
                    : Text(
                        value.toStringAsFixed(2),
                        style: TextStyle(
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                          color: tempColor,
                        ),
                      ),
              ),
              const SizedBox(width: 10),
              Expanded(
                flex: 2,
                child: InkWell(
                  onTap: () => _showUnitPicker(context, unit, onUnitChange),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
                    decoration: BoxDecoration(
                      color: tempColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(color: tempColor.withOpacity(0.5)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            unit.symbol,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: tempColor,
                            ),
                          ),
                        ),
                        Icon(Icons.arrow_drop_down, color: tempColor),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showUnitPicker(
    BuildContext context,
    TemperatureUnit currentUnit,
    Function(TemperatureUnit) onChanged,
  ) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: BoxDecoration(
          color: Theme.of(context).brightness == Brightness.dark
              ? AppColors.iosDarkGray
              : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(25)),
        ),
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Sıcaklık Birimi Seç',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            ...TemperatureUnit.units.map((unit) {
              final isSelected = unit.symbol == currentUnit.symbol;
              return ListTile(
                leading: Icon(
                  Icons.thermostat,
                  color: isSelected ? AppColors.error : Colors.grey,
                ),
                title: Text(unit.name),
                trailing: Text(
                  unit.symbol,
                  style: TextStyle(
                    color: isSelected ? AppColors.error : Colors.grey,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
                selected: isSelected,
                onTap: () {
                  onChanged(unit);
                  Navigator.pop(context);
                },
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildCommonTemperatures(BuildContext context, bool isDark) {
    final temps = [
      {'name': 'Donma Noktası', 'c': 0.0},
      {'name': 'Oda Sıcaklığı', 'c': 20.0},
      {'name': 'Vücut Sıcaklığı', 'c': 37.0},
      {'name': 'Kaynama Noktası', 'c': 100.0},
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.iosDarkGray : Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Önemli Sıcaklıklar',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 15),
          ...temps.map((temp) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  temp['name'] as String,
                  style: const TextStyle(fontSize: 16),
                ),
                Text(
                  '${temp['c']}°C',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          )).toList(),
        ],
      ),
    );
  }
}