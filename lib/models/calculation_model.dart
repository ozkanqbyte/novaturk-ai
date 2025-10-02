class CalculationModel {
  final String id;
  final String expression;
  final String result;
  final DateTime timestamp;
  final CalculationMode mode;
  final String? explanation;
  final List<String>? steps;
  final bool isAIGenerated;
  final String? imageUrl;
  final String? voiceInput;
  final Map<String, dynamic>? metadata;

  CalculationModel({
    required this.id,
    required this.expression,
    required this.result,
    required this.timestamp,
    this.mode = CalculationMode.basic,
    this.explanation,
    this.steps,
    this.isAIGenerated = false,
    this.imageUrl,
    this.voiceInput,
    this.metadata,
  });

  // Create from JSON
  factory CalculationModel.fromJson(Map<String, dynamic> json) {
    return CalculationModel(
      id: json['id'] ?? '',
      expression: json['expression'] ?? '',
      result: json['result'] ?? '',
      timestamp: json['timestamp'] != null 
          ? DateTime.fromMillisecondsSinceEpoch(json['timestamp'])
          : DateTime.now(),
      mode: _parseModeFromString(json['mode']),
      explanation: json['explanation'],
      steps: json['steps'] != null 
          ? List<String>.from(json['steps']) 
          : null,
      isAIGenerated: json['isAIGenerated'] ?? false,
      imageUrl: json['imageUrl'],
      voiceInput: json['voiceInput'],
      metadata: json['metadata'] != null 
          ? Map<String, dynamic>.from(json['metadata']) 
          : null,
    );
  }

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'expression': expression,
      'result': result,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'mode': mode.toString().split('.').last,
      'explanation': explanation,
      'steps': steps,
      'isAIGenerated': isAIGenerated,
      'imageUrl': imageUrl,
      'voiceInput': voiceInput,
      'metadata': metadata,
    };
  }

  // Copy with modifications
  CalculationModel copyWith({
    String? id,
    String? expression,
    String? result,
    DateTime? timestamp,
    CalculationMode? mode,
    String? explanation,
    List<String>? steps,
    bool? isAIGenerated,
    String? imageUrl,
    String? voiceInput,
    Map<String, dynamic>? metadata,
  }) {
    return CalculationModel(
      id: id ?? this.id,
      expression: expression ?? this.expression,
      result: result ?? this.result,
      timestamp: timestamp ?? this.timestamp,
      mode: mode ?? this.mode,
      explanation: explanation ?? this.explanation,
      steps: steps ?? this.steps,
      isAIGenerated: isAIGenerated ?? this.isAIGenerated,
      imageUrl: imageUrl ?? this.imageUrl,
      voiceInput: voiceInput ?? this.voiceInput,
      metadata: metadata ?? this.metadata,
    );
  }

  // Helper methods
  String get formattedTimestamp {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return '${timestamp.day}/${timestamp.month}/${timestamp.year}';
    }
  }

  String get modeDisplayName {
    switch (mode) {
      case CalculationMode.basic:
        return 'Basic';
      case CalculationMode.scientific:
        return 'Scientific';
      case CalculationMode.programming:
        return 'Programming';
      case CalculationMode.graphing:
        return 'Graphing';
    }
  }

  bool get hasExplanation => explanation != null && explanation!.isNotEmpty;
  bool get hasSteps => steps != null && steps!.isNotEmpty;
  bool get hasImage => imageUrl != null && imageUrl!.isNotEmpty;
  bool get hasVoiceInput => voiceInput != null && voiceInput!.isNotEmpty;

  // Generate shareable text
  String get shareText {
    final buffer = StringBuffer();
    buffer.writeln('🧮 AI Math Genius');
    buffer.writeln();
    
    if (hasVoiceInput) {
      buffer.writeln('🎙️ Voice: $voiceInput');
    }
    
    buffer.writeln('📝 Expression: $expression');
    buffer.writeln('✅ Result: $result');
    
    if (hasExplanation) {
      buffer.writeln();
      buffer.writeln('💡 Explanation: $explanation');
    }
    
    if (hasSteps) {
      buffer.writeln();
      buffer.writeln('📋 Steps:');
      for (int i = 0; i < steps!.length; i++) {
        buffer.writeln('${i + 1}. ${steps![i]}');
      }
    }
    
    buffer.writeln();
    buffer.writeln('📱 Created with AI Math Genius');
    
    return buffer.toString();
  }

  // Calculate difficulty level based on expression
  int get difficultyLevel {
    int level = 1;
    
    // Basic operations
    if (expression.contains(RegExp(r'[+\-*/]'))) level = 1;
    
    // Functions
    if (expression.contains(RegExp(r'(sin|cos|tan|log|ln|sqrt)'))) level = 2;
    
    // Complex expressions
    if (expression.contains(RegExp(r'[\^!%]'))) level = 3;
    
    // Programming mode
    if (mode == CalculationMode.programming) level = 4;
    
    // AI generated or multi-step
    if (isAIGenerated || (steps != null && steps!.length > 3)) level = 5;
    
    return level;
  }

  // Get difficulty emoji
  String get difficultyEmoji {
    switch (difficultyLevel) {
      case 1:
        return '🟢'; // Easy
      case 2:
        return '🟡'; // Medium
      case 3:
        return '🟠'; // Hard
      case 4:
        return '🔴'; // Very Hard
      case 5:
        return '🟣'; // Expert
      default:
        return '⚪'; // Unknown
    }
  }

  // Calculate points for gamification
  int get points {
    int basePoints = 10;
    int difficultyMultiplier = difficultyLevel;
    int aiBonus = isAIGenerated ? 20 : 0;
    int stepsBonus = (steps?.length ?? 0) * 5;
    
    return basePoints * difficultyMultiplier + aiBonus + stepsBonus;
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CalculationModel &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'CalculationModel{id: $id, expression: $expression, result: $result, timestamp: $timestamp}';
  }
}

// Helper function to parse mode from string
CalculationMode _parseModeFromString(dynamic modeString) {
  if (modeString == null) return CalculationMode.basic;
  
  switch (modeString.toString().toLowerCase()) {
    case 'basic':
      return CalculationMode.basic;
    case 'scientific':
      return CalculationMode.scientific;
    case 'programming':
      return CalculationMode.programming;
    case 'graphing':
      return CalculationMode.graphing;
    default:
      return CalculationMode.basic;
  }
}

enum CalculationMode {
  basic,
  scientific,
  programming,
  graphing,
}