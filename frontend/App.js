import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from './src/constants/colors';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { FONT_ASSETS } from './src/constants/fonts';
import { CommonOverlayProvider } from './src/components/common/CommonOverlayProvider';

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

SplashScreen.preventAutoHideAsync().catch(error => {
  console.warn('Unable to keep the splash screen visible.', error);
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  useEffect(() => {
    if (fontError) console.warn('Unable to load custom fonts; using system fonts.', fontError);
  }, [fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <CommonOverlayProvider>
            <StatusBar style="dark" backgroundColor={COLORS.card} />
            <AuthProvider>
              <NavigationContainer theme={navigationTheme} onReady={() => {
                SplashScreen.hideAsync().catch(error => console.warn('Unable to hide splash screen.', error));
              }}>
                <AppNavigator />
              </NavigationContainer>
            </AuthProvider>
          </CommonOverlayProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
