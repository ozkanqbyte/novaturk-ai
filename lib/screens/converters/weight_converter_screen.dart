import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/converters/weight_controller.dart';
import '../../models/converter_models.dart';
import '../../core/theme/app_colors.dart';

class WeightConverterScreen extends StatelessWidget {
  const WeightConverterScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => WeightController(),
      child: const _WeightConverterContent(),
    );
  }
}

class _WeightConverterContent extends StatefulWidget {
  const _WeightConverterContent({Key? key}) : super(key: key);

  @override
  State<_WeightConverterContent> createState() => _WeightConverterContentState();
}

class _WeightConverterContentState extends State<_WeightConverterContent> {
  final TextEditingController _inputController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<WeightController>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.iosBlack : Colors.grey[100],
      appBar: AppBar(
        title: const Text('Ağırlık Dönüştürücü'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: isDark ? AppColors.iosDarkGray : Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.clear_all),
            onPressed: () {
              controller.clear();
              _inputController.clear();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildUnitCard(
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
              backgroundColor: AppColors.success,
              onPressed: () {
                controller.swap();
                _inputController.text = controller.inputValue.toStringAsFixed(4);
              },
              child: const Icon(Icons.swap_vert, color: Colors.white),
            ),

            const SizedBox(height: 20),

            _buildUnitCard(
              context: context,
              title: 'Sonuç',
              value: controller.outputValue,
              unit: controller.toUnit,
              isDark: isDark,
              isInput: false,
              onUnitChange: (unit) => controller.setToUnit(unit),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUnitCard({
    required BuildContext context,
    required String title,
    required double value,
    required WeightUnit unit,
    required bool isDark,
    required bool isInput,
    required Function(WeightUnit) onUnitChange,
    Function(double)? onValueChange,
    TextEditingController? textController,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.iosDarkGray : Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
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
              color: isDark ? Colors.grey[400] : Colors.grey[600],
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
                        style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
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
                        value.toStringAsFixed(4),
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
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
                      gradient: LinearGradient(colors: AppColors.successGradient),
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            unit.symbol,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        const Icon(Icons.arrow_drop_down, color: Colors.white),
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
    WeightUnit currentUnit,
    Function(WeightUnit) onChanged,
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
        child: Column(
          mainAxisSize: MainAxisSize.min,
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
              'Birim Seç',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView.builder(
                itemCount: WeightUnit.units.length,
                itemBuilder: (context, index) {
                  final unit = WeightUnit.units[index];
                  final isSelected = unit.symbol == currentUnit.symbol;
                  return ListTile(
                    leading: Icon(
                      Icons.scale,
                      color: isSelected ? AppColors.success : Colors.grey,
                    ),
                    title: Text(unit.name),
                    trailing: Text(
                      unit.symbol,
                      style: TextStyle(
                        color: isSelected ? AppColors.success : Colors.grey,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    selected: isSelected,
                    onTap: () {
                      onChanged(unit);
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}