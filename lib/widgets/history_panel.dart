import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:get/get.dart';
import 'package:share_plus/share_plus.dart';
import '../controllers/calculator_controller.dart';
import '../controllers/theme_controller.dart';
import '../models/calculation_model.dart';
import 'package:intl/intl.dart';

class HistoryPanel extends StatefulWidget {
  const HistoryPanel({super.key});

  @override
  State<HistoryPanel> createState() => _HistoryPanelState();
}

class _HistoryPanelState extends State<HistoryPanel>
    with TickerProviderStateMixin {
  late TabController _tabController;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<CalculatorController, ThemeController>(
      builder: (context, calcController, themeController, child) {
        return Column(
          children: [
            // Header with search
            _buildHeader(themeController),
            
            // Tab bar
            _buildTabBar(themeController),
            
            // Content
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildHistoryTab(calcController, themeController),
                  _buildFavoritesTab(calcController, themeController),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildHeader(ThemeController themeController) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            themeController.accentColor,
            themeController.successColor,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: themeController.accentColor.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.history_rounded,
                  color: Colors.white,
                  size: 32,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Calculation History',
                      style: GoogleFonts.poppins(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'View, reuse, and manage your calculations',
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Search bar
          Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (value) {
                setState(() {
                  _searchQuery = value.toLowerCase();
                });
              },
              style: GoogleFonts.poppins(
                color: Colors.white,
                fontSize: 14,
              ),
              decoration: InputDecoration(
                hintText: 'Search calculations...',
                hintStyle: GoogleFonts.poppins(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 14,
                ),
                prefixIcon: const Icon(
                  Icons.search_rounded,
                  color: Colors.white,
                ),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(
                          Icons.clear_rounded,
                          color: Colors.white,
                        ),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _searchQuery = '';
                          });
                        },
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn().slideY(begin: -0.3, end: 0);
  }

  Widget _buildTabBar(ThemeController themeController) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: themeController.cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          gradient: LinearGradient(
            colors: [themeController.accentColor, themeController.successColor],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        labelColor: Colors.white,
        unselectedLabelColor: themeController.secondaryTextColor,
        labelStyle: GoogleFonts.poppins(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        tabs: const [
          Tab(icon: Icon(Icons.history), text: 'History'),
          Tab(icon: Icon(Icons.star), text: 'Favorites'),
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 100));
  }

  Widget _buildHistoryTab(
    CalculatorController calcController,
    ThemeController themeController,
  ) {
    final filteredHistory = _filterCalculations(calcController.history);
    
    if (filteredHistory.isEmpty) {
      return _buildEmptyState(
        'No calculations yet',
        'Start calculating to see your history here',
        Icons.calculate_rounded,
        themeController,
      );
    }

    return Column(
      children: [
        // Stats row
        _buildStatsRow(calcController, themeController),
        
        // List
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: filteredHistory.length,
            itemBuilder: (context, index) {
              final calculation = filteredHistory[index];
              return _buildCalculationCard(
                calculation,
                calcController,
                themeController,
                showFavoriteButton: true,
              ).animate().fadeIn(delay: Duration(milliseconds: index * 50))
                .slideX(begin: 0.3, end: 0);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFavoritesTab(
    CalculatorController calcController,
    ThemeController themeController,
  ) {
    final filteredFavorites = _filterCalculations(calcController.favorites);
    
    if (filteredFavorites.isEmpty) {
      return _buildEmptyState(
        'No favorites yet',
        'Tap the star icon on calculations to add them to favorites',
        Icons.star_border_rounded,
        themeController,
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: filteredFavorites.length,
      itemBuilder: (context, index) {
        final calculation = filteredFavorites[index];
        return _buildCalculationCard(
          calculation,
          calcController,
          themeController,
          showFavoriteButton: false,
          isFavoritesList: true,
        ).animate().fadeIn(delay: Duration(milliseconds: index * 50))
          .slideX(begin: 0.3, end: 0);
      },
    );
  }

  Widget _buildStatsRow(
    CalculatorController calcController,
    ThemeController themeController,
  ) {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            themeController.primaryColor.withOpacity(0.1),
            themeController.secondaryColor.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: themeController.primaryColor.withOpacity(0.2),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem(
            'Total',
            calcController.history.length.toString(),
            Icons.calculate_rounded,
            themeController.primaryColor,
          ),
          _buildStatItem(
            'Favorites',
            calcController.favorites.length.toString(),
            Icons.star_rounded,
            themeController.warningColor,
          ),
          _buildStatItem(
            'Today',
            _getTodayCalculationsCount(calcController.history).toString(),
            Icons.today_rounded,
            themeController.successColor,
          ),
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 200));
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 8),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 12,
            color: color.withOpacity(0.8),
          ),
        ),
      ],
    );
  }

  Widget _buildCalculationCard(
    CalculationModel calculation,
    CalculatorController calcController,
    ThemeController themeController, {
    bool showFavoriteButton = true,
    bool isFavoritesList = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: themeController.cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
        border: calculation.isAIGenerated
            ? Border.all(
                color: themeController.primaryColor.withOpacity(0.3),
                width: 1,
              )
            : null,
      ),
      child: InkWell(
        onTap: () => _useCalculation(calculation, calcController),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header row
              Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        // AI indicator
                        if (calculation.isAIGenerated) ...[
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: themeController.primaryGradient,
                              ),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.auto_awesome_rounded,
                                  color: Colors.white,
                                  size: 12,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'AI',
                                  style: GoogleFonts.poppins(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                        ],
                        
                        // Mode badge
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: _getModeColor(calculation.mode).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: _getModeColor(calculation.mode).withOpacity(0.3),
                            ),
                          ),
                          child: Text(
                            calculation.modeDisplayName,
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: _getModeColor(calculation.mode),
                            ),
                          ),
                        ),
                        
                        const SizedBox(width: 8),
                        
                        // Difficulty indicator
                        Text(
                          calculation.difficultyEmoji,
                          style: const TextStyle(fontSize: 16),
                        ),
                        
                        const Spacer(),
                        
                        // Timestamp
                        Text(
                          calculation.formattedTimestamp,
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: themeController.secondaryTextColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Expression
              Text(
                calculation.expression,
                style: GoogleFonts.robotoMono(
                  fontSize: 16,
                  color: themeController.secondaryTextColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
              
              const SizedBox(height: 8),
              
              // Result
              Row(
                children: [
                  Expanded(
                    child: Text(
                      '= ${calculation.result}',
                      style: GoogleFonts.robotoMono(
                        fontSize: 20,
                        color: themeController.primaryTextColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  
                  // Points
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: themeController.successColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${calculation.points}pts',
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: themeController.successColor,
                      ),
                    ),
                  ),
                ],
              ),
              
              // Voice input if available
              if (calculation.hasVoiceInput) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: themeController.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.mic_rounded,
                        size: 16,
                        color: themeController.primaryColor,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '"${calculation.voiceInput}"',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontStyle: FontStyle.italic,
                            color: themeController.primaryColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              
              // Action buttons
              const SizedBox(height: 12),
              Row(
                children: [
                  // Use button
                  Expanded(
                    child: _buildActionButton(
                      'Use',
                      Icons.play_arrow_rounded,
                      () => _useCalculation(calculation, calcController),
                      themeController.accentColor,
                    ),
                  ),
                  
                  const SizedBox(width: 8),
                  
                  // Share button
                  _buildIconButton(
                    Icons.share_rounded,
                    () => _shareCalculation(calculation),
                    themeController.successColor,
                  ),
                  
                  const SizedBox(width: 8),
                  
                  // Favorite/Remove button
                  if (showFavoriteButton)
                    _buildIconButton(
                      calcController.isFavorite(calculation.id)
                          ? Icons.star_rounded
                          : Icons.star_border_rounded,
                      () => _toggleFavorite(calculation, calcController),
                      themeController.warningColor,
                    )
                  else
                    _buildIconButton(
                      Icons.delete_outline_rounded,
                      () => _removeFromFavorites(calculation, calcController),
                      themeController.errorColor,
                    ),
                  
                  const SizedBox(width: 8),
                  
                  // Delete button
                  if (!isFavoritesList)
                    _buildIconButton(
                      Icons.delete_outline_rounded,
                      () => _deleteCalculation(calculation, calcController),
                      themeController.errorColor,
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton(
    String text,
    IconData icon,
    VoidCallback onPressed,
    Color color,
  ) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: color.withOpacity(0.3),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(width: 6),
            Text(
              text,
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIconButton(
    IconData icon,
    VoidCallback onPressed,
    Color color,
  ) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 16, color: color),
      ),
    );
  }

  Widget _buildEmptyState(
    String title,
    String subtitle,
    IconData icon,
    ThemeController themeController,
  ) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 80,
              color: themeController.secondaryTextColor.withOpacity(0.5),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: themeController.secondaryTextColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: themeController.secondaryTextColor.withOpacity(0.7),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn();
  }

  // Helper methods
  List<CalculationModel> _filterCalculations(List<CalculationModel> calculations) {
    if (_searchQuery.isEmpty) return calculations;
    
    return calculations.where((calc) {
      return calc.expression.toLowerCase().contains(_searchQuery) ||
             calc.result.toLowerCase().contains(_searchQuery) ||
             (calc.voiceInput?.toLowerCase().contains(_searchQuery) ?? false);
    }).toList();
  }

  int _getTodayCalculationsCount(List<CalculationModel> calculations) {
    final today = DateTime.now();
    return calculations.where((calc) {
      return calc.timestamp.year == today.year &&
             calc.timestamp.month == today.month &&
             calc.timestamp.day == today.day;
    }).length;
  }

  Color _getModeColor(dynamic mode) {
    // Handle both enum types by string comparison
    final modeString = mode.toString().split('.').last;
    switch (modeString) {
      case 'basic':
        return Colors.blue;
      case 'scientific':
        return Colors.purple;
      case 'programming':
        return Colors.green;
      case 'graphing':
        return Colors.orange;
      default:
        return Colors.blue;
    }
  }

  // Event handlers
  void _useCalculation(CalculationModel calculation, CalculatorController calcController) {
    HapticFeedback.lightImpact();
    calcController.useFromHistory(calculation);
    Get.back(); // Go back to calculator
  }

  void _shareCalculation(CalculationModel calculation) {
    HapticFeedback.lightImpact();
    Share.share(calculation.shareText);
  }

  void _toggleFavorite(CalculationModel calculation, CalculatorController calcController) {
    HapticFeedback.mediumImpact();
    if (calcController.isFavorite(calculation.id)) {
      calcController.removeFromFavorites(calculation.id);
    } else {
      calcController.addToFavorites(calculation);
    }
  }

  void _removeFromFavorites(CalculationModel calculation, CalculatorController calcController) {
    HapticFeedback.mediumImpact();
    calcController.removeFromFavorites(calculation.id);
  }

  void _deleteCalculation(CalculationModel calculation, CalculatorController calcController) {
    HapticFeedback.mediumImpact();
    Get.dialog(
      AlertDialog(
        title: const Text('Delete Calculation'),
        content: const Text('Are you sure you want to delete this calculation?'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              calcController.deleteFromHistory(calculation.id);
              Get.back();
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}