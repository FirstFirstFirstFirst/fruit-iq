import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";
import "react-native-reanimated";
import "../global.css"; // Import NativeWind styles

import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useEffect } from "react";

import { OfflineBanner } from "../src/components/OfflineBanner";
import { AuthProvider } from "../src/contexts/AuthContext";
import { useDepaTracking } from "../src/hooks/useDepaTracking";

// Component to handle DEPA tracking (must be inside AuthProvider)
function DepaTracker() {
  useDepaTracking();
  return null;
}

export default function RootLayout() {
  console.log("🔍 RootLayout: Component initializing with local fonts...");

  const colorScheme = useColorScheme();
  console.log("🎨 RootLayout: Color scheme detected:", colorScheme);

  const [loaded] = useFonts({
    "Kanit-Black": require("../assets/fonts/Kanit-Black.ttf"),
    "Kanit-BlackItalic": require("../assets/fonts/Kanit-BlackItalic.ttf"),
    "Kanit-Bold": require("../assets/fonts/Kanit-Bold.ttf"),
    "Kanit-BoldItalic": require("../assets/fonts/Kanit-BoldItalic.ttf"),
    "Kanit-ExtraBold": require("../assets/fonts/Kanit-ExtraBold.ttf"),
    "Kanit-ExtraBoldItalic": require("../assets/fonts/Kanit-ExtraBoldItalic.ttf"),
    "Kanit-ExtraLight": require("../assets/fonts/Kanit-ExtraLight.ttf"),
    "Kanit-ExtraLightItalic": require("../assets/fonts/Kanit-ExtraLightItalic.ttf"),
    "Kanit-Italic": require("../assets/fonts/Kanit-Italic.ttf"),
    "Kanit-Light": require("../assets/fonts/Kanit-Light.ttf"),
    "Kanit-LightItalic": require("../assets/fonts/Kanit-LightItalic.ttf"),
    "Kanit-Medium": require("../assets/fonts/Kanit-Medium.ttf"),
    "Kanit-MediumItalic": require("../assets/fonts/Kanit-MediumItalic.ttf"),
    "Kanit-Regular": require("../assets/fonts/Kanit-Regular.ttf"),
    "Kanit-SemiBold": require("../assets/fonts/Kanit-SemiBold.ttf"),
    "Kanit-SemiBoldItalic": require("../assets/fonts/Kanit-SemiBoldItalic.ttf"),
    "Kanit-Thin": require("../assets/fonts/Kanit-Thin.ttf"),
    "Kanit-ThinItalic": require("../assets/fonts/Kanit-ThinItalic.ttf"),
  });

  console.log("📦 RootLayout: Fonts loaded status:", loaded);

  useEffect(() => {
    if (loaded) {
      console.log(
        "✅ RootLayout: All local fonts have been loaded successfully"
      );
      const availableFonts = [
        "Kanit-Black",
        "Kanit-BlackItalic",
        "Kanit-Bold",
        "Kanit-BoldItalic",
        "Kanit-ExtraBold",
        "Kanit-ExtraBoldItalic",
        "Kanit-ExtraLight",
        "Kanit-ExtraLightItalic",
        "Kanit-Italic",
        "Kanit-Light",
        "Kanit-LightItalic",
        "Kanit-Medium",
        "Kanit-MediumItalic",
        "Kanit-Regular",
        "Kanit-SemiBold",
        "Kanit-SemiBoldItalic",
        "Kanit-Thin",
        "Kanit-ThinItalic",
      ];
      console.log("📝 RootLayout: Available font families:", availableFonts);
    } else {
      console.log("⏳ RootLayout: Fonts are still loading...");
    }

    // Additional Platform-specific debugging
    if (Platform.OS === "android") {
      console.log("🤖 RootLayout: Android using local font files");
    } else if (Platform.OS === "ios") {
      console.log("🍎 RootLayout: iOS using local font files");
    }
  }, [loaded]);

  if (!loaded) {
    return null; // or a loading screen component
  }

  return (
    <AuthProvider>
      <DepaTracker />
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <OfflineBanner />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
            <Stack.Screen name="farm/setup" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </View>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
