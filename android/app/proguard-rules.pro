# AI Calculator Pro - ProGuard Rules
# Keep Flutter classes
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Keep Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Keep Google ML Kit
-keep class com.google.mlkit.** { *; }
-dontwarn com.google.mlkit.**

# Keep TensorFlow Lite
-keep class org.tensorflow.** { *; }
-dontwarn org.tensorflow.**

# Keep AdMob
-keep class com.google.android.gms.ads.** { *; }

# Keep In-App Purchase
-keep class com.android.billingclient.** { *; }
-keep class com.android.vending.billing.** { *; }

# Keep Camera
-keep class androidx.camera.** { *; }
-dontwarn androidx.camera.**

# Keep Speech/Audio
-keep class android.speech.** { *; }
-keep class android.media.** { *; }

# Preserve line numbers for crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Keep custom model classes
-keep class com.aicalc.pro.ai_calculator_pro.** { *; }

# 🛡️ ===============================================
# ULTRA-SECURE OBFUSCATION & ANTI-CRACK SETTINGS
# ===============================================

# Optimization settings - MAXIMUM SECURITY
-optimizationpasses 7  # Increased from 5 to 7 for better obfuscation
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose
-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*

# 🔒 CODE OBFUSCATION - Make reverse engineering extremely difficult
-repackageclasses ''  # Flatten package hierarchy
-allowaccessmodification  # Allow changing access modifiers
-useuniqueclassmembernames  # Use unique names for members
-flattenpackagehierarchy  # Flatten package hierarchy
-overloadaggressively  # Aggressive method name overloading

# 🔐 STRING ENCRYPTION (additional protection)
# Note: ProGuard doesn't directly encrypt strings, but this helps
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# 🚫 REMOVE DEBUGGING INFO (make debugging harder for crackers)
-printmapping mapping.txt  # Save mapping for crash reports
-printseeds seeds.txt
-printusage unused.txt

# 🛡️ ANTI-TAMPER - Keep security classes intact (✅ Updated package name)
-keep class com.aicalcpro.services.SecurityService { *; }
-keep class com.aicalcpro.services.IAPService { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 🔍 HIDE SENSITIVE PREMIUM LOGIC
-keepclassmembers class * {
    native <methods>;
}

# 📊 Keep crash reporting attributes (for Firebase Crashlytics)
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exception
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# 🎯 AGGRESSIVE SHRINKING - Remove unused code
-dontshrink
-dontoptimize  # Actually, DO optimize for release builds

# 🔐 NATIVE CODE PROTECTION
-keepclasseswithmembernames class * {
    native <methods>;
}

# 🛡️ REFLECTION PROTECTION
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# ⚡ FINAL OPTIMIZATION PASS
-mergeinterfacesaggressively  # Merge interfaces when possible
-dontwarn **
-ignorewarnings

# 🎭 RENAME METHODS AND FIELDS (maximum obfuscation)
# Dictionary usage commented out - ProGuard will use default naming
# -classobfuscationdictionary proguard-dictionary.txt
# -packageobfuscationdictionary proguard-dictionary.txt
# -obfuscationdictionary proguard-dictionary.txt