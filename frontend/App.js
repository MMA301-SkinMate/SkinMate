import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import BottomTabNavigator from './src/navigation/BottomTabNav';
import { FONT_ASSETS } from './src/constants/fonts';
import './src/constants/env';

SplashScreen.preventAutoHideAsync().catch(error => {
  console.warn('Unable to keep the splash screen visible.', error);
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  useEffect(() => {
    if (fontError) {
      console.warn('Unable to load custom fonts; using system fonts.', fontError);
    }
  }, [fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handleReady = () => {
    SplashScreen.hideAsync().catch(error => {
      console.warn('Unable to hide the splash screen.', error);
    });
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer onReady={handleReady}>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
