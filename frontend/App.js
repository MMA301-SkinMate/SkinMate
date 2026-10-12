import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import BottomTabNavigator from './src/navigation/BottomTabNav';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}