import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../controllers/calculator_controller.dart';
import '../../controllers/theme_controller.dart';
import '../../controllers/premium_controller.dart';
import '../../core/theme/app_colors.dart';
import '../../models/calculation_model.dart';

/// 📜 Modern History Screen
/// Beautiful, functional calculation history with search, filter, and export
class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  String _searchQuery = '';
  String _filterType = 'all'; // 'all', 'today', 'week', 'month'
  bool _isSelectionMode = false;
  final List<int> _selectedIndices = [];

  @override
  Widget build(BuildContext context) {
    return Consumer3<CalculatorController, ThemeController, PremiumController>(
      builder: (context, calculator, theme, premium, child) {
        final history = _getFilteredHistory(calculator.history);

        return Scaffold(
          body: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  const Color(0xFF0A0A0A),
                  const Color(0xFF1A1A2E),
                  AppColors.oceanBlue.withOpacity(0.1),
                ],
              ),
            ),
            child: SafeArea(
              child: Column(
                children: [
                  _buildHeader(context, theme, premium),
                  _buildSearchBar(theme),
                  _buildFilterChips(theme),
                  Expanded(
                    child: history.isEmpty
                        ? _buildEmptyState(theme)
                        : _buildHistoryList(history, calculator, theme, premium),
                  ),
                ],
              ),
            ),
          ),
          floatingActionButton: _isSelectionMode
              ? _buildSelectionFAB()
              : history.isNotEmpty
                  ? _buildActionFAB(context, history, premium)
                  : null,
        );
      },
    );
  }

  Widget _buildHeader(BuildContext context, ThemeController theme, PremiumController premium) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          if (_isSelectionMode)
            IconButton(
              icon: const Icon(Icons.close, color: Colors.white),
              onPressed: () {
                setState(() {
                  _isSelectionMode = false;
                  _selectedIndices.clear();
                });
              },
            )
          else
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: AppColors.primaryGradient),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.oceanBlue.withOpacity(0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Icon(Icons.history, color: Colors.white, size: 24),
            ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ShaderMask(
                  shaderCallback: (bounds) => LinearGradient(
                    colors: AppColors.primaryGradient,
                  ).createShader(bounds),
                  child: Text(
                    _isSelectionMode
                        ? '${_selectedIndices.length} Seçili'
                        : 'Geçmiş',
                    style: GoogleFonts.poppins(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
                if (!_isSelectionMode)
                  Text(
                    'Tüm hesaplamalarınız',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      color: Colors.white70,
                    ),
                  ),
              ],
            ),
          ),
          if (!_isSelectionMode && !premium.isPremiumActive)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.goldenYellow, AppColors.sunsetOrange],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '👑 PRO',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            )
                .animate(onPlay: (controller) => controller.repeat())
                .shimmer(duration: 1500.ms),
        ],
      ),
    ).animate().fadeIn().slideY(begin: -0.2, end: 0);
  }

  Widget _buildSearchBar(ThemeController theme) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      decoration: BoxDecoration(
        color: theme.surfaceColor.withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: TextField(
        style: GoogleFonts.poppins(color: Colors.white),
        decoration: InputDecoration(
          hintText: 'Ara...',
          hintStyle: GoogleFonts.poppins(color: Colors.white54),
          prefixIcon: const Icon(Icons.search, color: Colors.white54),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, color: Colors.white54),
                  onPressed: () {
                    setState(() => _searchQuery = '');
                  },
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        ),
        onChanged: (value) {
          setState(() => _searchQuery = value);
        },
      ),
    ).animate().fadeIn(delay: 100.ms);
  }

  Widget _buildFilterChips(ThemeController theme) {
    final filters = [
      {'id': 'all', 'label': 'Tümü', 'icon': Icons.all_inclusive},
      {'id': 'today', 'label': 'Bugün', 'icon': Icons.today},
      {'id': 'week', 'label': 'Bu Hafta', 'icon': Icons.date_range},
      {'id': 'month', 'label': 'Bu Ay', 'icon': Icons.calendar_month},
    ];

    return Container(
      height: 50,
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final filter = filters[index];
          final isSelected = _filterType == filter['id'];

          return GestureDetector(
            onTap: () {
              setState(() => _filterType = filter['id'] as String);
            },
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                gradient: isSelected
                    ? LinearGradient(colors: AppColors.primaryGradient)
                    : null,
                color: isSelected ? null : theme.surfaceColor.withOpacity(0.3),
                borderRadius: BorderRadius.circular(25),
                border: Border.all(
                  color: isSelected
                      ? Colors.transparent
                      : Colors.white.withOpacity(0.1),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    filter['icon'] as IconData,
                    color: Colors.white,
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    filter['label'] as String,
                    style: GoogleFonts.poppins(
                      color: Colors.white,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    ).animate().fadeIn(delay: 200.ms);
  }

  Widget _buildHistoryList(
    List<CalculationModel> history,
    CalculatorController calculator,
    ThemeController theme,
    PremiumController premium,
  ) {
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: history.length,
      itemBuilder: (context, index) {
        final calculation = history[index];
        final isSelected = _selectedIndices.contains(index);

        return _buildHistoryItem(
          calculation,
          index,
          isSelected,
          calculator,
          theme,
          premium,
        );
      },
    );
  }

  Widget _buildHistoryItem(
    CalculationModel calculation,
    int index,
    bool isSelected,
    CalculatorController calculator,
    ThemeController theme,
    PremiumController premium,
  ) {
    return GestureDetector(
      onTap: () {
        if (_isSelectionMode) {
          setState(() {
            if (isSelected) {
              _selectedIndices.remove(index);
            } else {
              _selectedIndices.add(index);
            }
          });
        } else {
          // Copy result to clipboard
          Clipboard.setData(ClipboardData(text: calculation.result));
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${calculation.result} kopyalandı'),
              backgroundColor: AppColors.successGreen,
            ),
          );
        }
      },
      onLongPress: () {
        setState(() {
          _isSelectionMode = true;
          _selectedIndices.add(index);
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: isSelected
              ? LinearGradient(
                  colors: [
                    AppColors.oceanBlue.withOpacity(0.3),
                    AppColors.electricViolet.withOpacity(0.3),
                  ],
                )
              : null,
          color: isSelected ? null : theme.surfaceColor.withOpacity(0.3),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? AppColors.oceanBlue
                : Colors.white.withOpacity(0.1),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            if (_isSelectionMode)
              Container(
                width: 24,
                height: 24,
                margin: const EdgeInsets.only(right: 12),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white54, width: 2),
                  color: isSelected ? AppColors.oceanBlue : Colors.transparent,
                ),
                child: isSelected
                    ? const Icon(Icons.check, color: Colors.white, size: 16)
                    : null,
              ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    calculation.expression,
                    style: GoogleFonts.robotoMono(
                      fontSize: 16,
                      color: Colors.white70,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '= ${calculation.result}',
                    style: GoogleFonts.robotoMono(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _formatDate(calculation.timestamp),
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: Colors.white54,
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
              onPressed: () {
                calculator.deleteFromHistory(calculation.id);
              },
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: (index * 50).ms).slideX(begin: 0.2, end: 0);
  }

  Widget _buildEmptyState(ThemeController theme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: AppColors.primaryGradient),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.history, size: 60, color: Colors.white),
          )
              .animate(onPlay: (controller) => controller.repeat(reverse: true))
              .scale(duration: 2000.ms),
          const SizedBox(height: 24),
          Text(
            'Henüz hesaplama yok',
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Hesaplamalarınız burada görünecek',
            style: GoogleFonts.poppins(
              fontSize: 16,
              color: Colors.white54,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectionFAB() {
    return FloatingActionButton.extended(
      onPressed: () {
        // Delete selected items
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Sil'),
            content: Text('${_selectedIndices.length} öğe silinecek. Emin misiniz?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('İptal'),
              ),
              TextButton(
                onPressed: () {
                  final calculator = context.read<CalculatorController>();
                  final history = calculator.history;
                  _selectedIndices.sort((a, b) => b.compareTo(a));
                  for (final index in _selectedIndices) {
                    if (index < history.length) {
                      calculator.deleteFromHistory(history[index].id);
                    }
                  }
                  setState(() {
                    _isSelectionMode = false;
                    _selectedIndices.clear();
                  });
                  Navigator.pop(context);
                },
                child: const Text('Sil', style: TextStyle(color: Colors.red)),
              ),
            ],
          ),
        );
      },
      backgroundColor: Colors.redAccent,
      icon: const Icon(Icons.delete),
      label: const Text('Sil'),
    );
  }

  Widget _buildActionFAB(BuildContext context, List<CalculationModel> history, PremiumController premium) {
    return FloatingActionButton.extended(
      onPressed: () {
        showModalBottomSheet(
          context: context,
          backgroundColor: Colors.transparent,
          builder: (context) => Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Color(0xFF1A1A2E),
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ListTile(
                  leading: const Icon(Icons.select_all, color: Colors.white),
                  title: const Text('Seçim Modu', style: TextStyle(color: Colors.white)),
                  onTap: () {
                    Navigator.pop(context);
                    setState(() => _isSelectionMode = true);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.delete_forever, color: Colors.redAccent),
                  title: const Text('Tümünü Sil', style: TextStyle(color: Colors.white)),
                  onTap: () {
                    Navigator.pop(context);
                    _confirmClearAll(context);
                  },
                ),
              ],
            ),
          ),
        );
      },
      backgroundColor: AppColors.oceanBlue,
      icon: const Icon(Icons.more_vert),
      label: const Text('İşlemler'),
    );
  }

  List<CalculationModel> _getFilteredHistory(List<CalculationModel> history) {
    List<CalculationModel> filtered = history;

    // Apply search filter
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((calc) {
        return calc.expression.contains(_searchQuery) ||
            calc.result.contains(_searchQuery);
      }).toList();
    }

    // Apply date filter
    final now = DateTime.now();
    switch (_filterType) {
      case 'today':
        filtered = filtered.where((calc) {
          final diff = now.difference(calc.timestamp);
          return diff.inDays == 0;
        }).toList();
        break;
      case 'week':
        filtered = filtered.where((calc) {
          final diff = now.difference(calc.timestamp);
          return diff.inDays <= 7;
        }).toList();
        break;
      case 'month':
        filtered = filtered.where((calc) {
          final diff = now.difference(calc.timestamp);
          return diff.inDays <= 30;
        }).toList();
        break;
    }

    return filtered;
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) {
      return 'Bugün ${DateFormat('HH:mm').format(date)}';
    } else if (diff.inDays == 1) {
      return 'Dün ${DateFormat('HH:mm').format(date)}';
    } else if (diff.inDays < 7) {
      return '${diff.inDays} gün önce';
    } else {
      return DateFormat('dd MMM yyyy HH:mm', 'tr_TR').format(date);
    }
  }

  void _confirmClearAll(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tümünü Sil'),
        content: const Text('Tüm geçmiş silinecek. Emin misiniz?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          TextButton(
            onPressed: () {
              context.read<CalculatorController>().clearHistory();
              Navigator.pop(context);
            },
            child: const Text('Sil', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}