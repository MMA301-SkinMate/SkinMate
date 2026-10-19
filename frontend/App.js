
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './src/context/AppContext';
import { AuthSessionProvider } from './src/context/AuthSessionContext';
import RootNavigator from './src/navigation/RootNavigator';

// Deep linking configuration
const linking = {
  prefixes: ['skinmate://'],
  config: {
    screens: {
      Auth: 'auth',
      NewPassword: 'reset-password',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthSessionProvider>
        <AppProvider>
          <NavigationContainer linking={linking}>
            <StatusBar
              style="dark"
              backgroundColor="#ffffff"
            />
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </AuthSessionProvider>
    </SafeAreaProvider>
  );
}
