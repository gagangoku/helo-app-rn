# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

-dontwarn io.branch.**
-dontwarn me.pushy.**
-keep class me.pushy.** { *; }
-keep public class com.horcrux.svg.** {*;}
-keep class com.rt2zz.reactnativecontacts.** {*;}
-keepclassmembers class com.rt2zz.reactnativecontacts.** {*;}

-keep class com.google.android.gms.ads.identifier.** { *; }
-keep class com.facebook.applinks.** { *; }
-keepclassmembers class com.facebook.applinks.** { *; }
-keep class com.facebook.FacebookSdk { *; }
