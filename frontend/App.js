import { COLORS } from "./src/constants/colors";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { FONT_ASSETS } from "./src/constants/fonts";
import { ENV } from "./src/constants/env";
import { CommonOverlayProvider } from "./src/components/common/CommonOverlayProvider";

const ComponentPreviewScreen = __DEV__
  ? require("./src/screens/ComponentPreviewScreen").default
  : null;

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.card,
    text: COLORS.textMain,
    border: COLORS.border,
    notification: COLORS.error,
  },
};

SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn("Unable to keep the splash screen visible.", error);
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  useEffect(() => {
    if (fontError) {
      console.warn(
        "Unable to load custom fonts; using system fonts.",
        fontError,
      );
    }
  }, [fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handleReady = () => {
    SplashScreen.hideAsync().catch((error) => {
      console.warn("Unable to hide the splash screen.", error);
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <CommonOverlayProvider>
            <StatusBar style="dark" backgroundColor={COLORS.card} />
            {__DEV__ && ENV.SHOW_COMPONENT_PREVIEW ? (
              <View style={{ flex: 1 }} onLayout={handleReady}>
                <ComponentPreviewScreen />
              </View>
            ) : (
              <AuthProvider>
                <NavigationContainer
                  theme={navigationTheme}
                  onReady={handleReady}
                >
                  <AppNavigator />
                </NavigationContainer>
              </AuthProvider>
            )}
          </CommonOverlayProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
