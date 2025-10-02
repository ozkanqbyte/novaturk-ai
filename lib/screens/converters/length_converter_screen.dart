import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/converters/length_controller.dart';
import '../../models/converter_models.dart';
import '../../core/theme/app_colors.dart';
import '../../core/localization/tr_TR.dart';

class LengthConverterScreen extends StatelessWidget {
  const LengthConverterScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => LengthController(),
      child: const _LengthConverterContent(),
    );
  }
}

class _LengthConverterContent extends StatefulWidget {
  const _LengthConverterContent({Key? key}) : super(key: key);

  @override
  State<_LengthConverterContent> createState() => _LengthConverterContentState();
}

class _LengthConverterContentState extends State<_LengthConverterContent> {
  final TextEditingController _inputController = TextEditingController();

  @override
  void dispose() {
    _inputController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<LengthController>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.iosBlack : Colors.grey[100],
      appBar: AppBar(
        title: const Text('Uzunluk Dönüştürücü'),
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
            // From Unit Card
            _buildUnitCard(
              context: context,
              title: 'Dönüştür',
              value: controller.inputValue,
              unit: controller.fromUnit,
              isDark: isDark,
              isInput: true,
              onUnitChange: (unit) => controller.setFromUnit(unit),
              onValueChange: (value) {
                controller.setInputValue(value);
              },
              textController: _inputController,
            ),
            
            const SizedBox(height: 20),

            // Swap Button
            FloatingActionButton(
              mini: true,
              backgroundColor: AppColors.primary,
              onPressed: () {
                controller.swap();
                _inputController.text = controller.inputValue.toStringAsFixed(4);
              },
              child: const Icon(Icons.swap_vert, color: Colors.white),
            ),

            const SizedBox(height: 20),

            // To Unit Card
            _buildUnitCard(
              context: context,
              title: 'Sonuç',
              value: controller.outputValue,
              unit: controller.toUnit,
              isDark: isDark,
              isInput: false,
              onUnitChange: (unit) => controller.setToUnit(unit),
            ),

            const SizedBox(height: 30),

            // Common Conversions Grid
            _buildCommonConversionsGrid(context, controller, isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildUnitCard({
    required BuildContext context,
    required String title,
    required double value,
    required LengthUnit unit,
    required bool isDark,
    required bool isInput,
    required Function(LengthUnit) onUnitChange,
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
                child: _buildUnitSelector(context, unit, onUnitChange, isDark),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildUnitSelector(
    BuildContext context,
    LengthUnit currentUnit,
    Function(LengthUnit) onChanged,
    bool isDark,
  ) {
    return InkWell(
      onTap: () => _showUnitPicker(context, currentUnit, onChanged),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: AppColors.primary.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                currentUnit.symbol,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ),
            const Icon(Icons.arrow_drop_down, color: AppColors.primary),
          ],
        ),
      ),
    );
  }

  void _showUnitPicker(
    BuildContext context,
    LengthUnit currentUnit,
    Function(LengthUnit) onChanged,
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
                itemCount: LengthUnit.units.length,
                itemBuilder: (context, index) {
                  final unit = LengthUnit.units[index];
                  final isSelected = unit.symbol == currentUnit.symbol;
                  return ListTile(
                    leading: Icon(
                      Icons.straighten,
                      color: isSelected ? AppColors.primary : Colors.grey,
                    ),
                    title: Text(unit.name),
                    trailing: Text(
                      unit.symbol,
                      style: TextStyle(
                        color: isSelected ? AppColors.primary : Colors.grey,
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

  Widget _buildCommonConversionsGrid(
    BuildContext context,
    LengthController controller,
    bool isDark,
  ) {
    final commonConversions = [
      {'from': 'km', 'to': 'm', 'factor': 1000.0},
      {'from': 'm', 'to': 'cm', 'factor': 100.0},
      {'from': 'cm', 'to': 'mm', 'factor': 10.0},
      {'from': 'mi', 'to': 'km', 'factor': 1.609},
      {'from': 'ft', 'to': 'm', 'factor': 0.3048},
      {'from': 'in', 'to': 'cm', 'factor': 2.54},
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
            'Hızlı Dönüşümler',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 15),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 2.5,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
            ),
            itemCount: commonConversions.length,
            itemBuilder: (context, index) {
              final conversion = commonConversions[index];
              return InkWell(
                onTap: () {
                  final fromUnit = LengthUnit.units.firstWhere(
                    (u) => u.symbol == conversion['from'],
                  );
                  final toUnit = LengthUnit.units.firstWhere(
                    (u) => u.symbol == conversion['to'],
                  );
                  controller.setFromUnit(fromUnit);
                  controller.setToUnit(toUnit);
                },
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: AppColors.purpleGradient),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      '${conversion['from']} → ${conversion['to']}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}