import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import "react-native-reanimated";
import "../global.css"; // Import NativeWind styles

import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect } from "react";
import DatabaseProvider from "../src/components/DatabaseProvider";

export default function RootLayout() {
  console.log(
    "🔍 RootLayout: Component initializing with config plugin fonts..."
  );

  const colorScheme = useColorScheme();
  console.log("🎨 RootLayout: Color scheme detected:", colorScheme);

  useEffect(() => {
    // With config plugin, fonts are embedded in native code and available immediately
    const embeddedFonts = [
      "Kanit-Light",
      "Kanit-Regular",
      "Kanit-Medium",
      "Kanit-SemiBold",
      "Kanit-Bold",
      "Kanit-ExtraBold",
      "SpaceMono-Regular",
    ];

    console.log("✅ RootLayout: Using config plugin embedded fonts");
    console.log("📝 RootLayout: Available embedded fonts:", embeddedFonts);

    // Additional Android-specific debugging
    if (Platform.OS === "android") {
      console.log(
        "🤖 RootLayout: Android config plugin fonts should work in production builds"
      );
      console.log(
        "📝 RootLayout: This method requires development build, not Expo Go"
      );
    }
  }, []);

  return (
    <DatabaseProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </DatabaseProvider>
  );
}
