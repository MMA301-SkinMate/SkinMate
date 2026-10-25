import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import RootNavigator from './src/navigation/RootNavigator';
import ExpiredProductAlertModal from './src/components/collection/ExpiredProductAlertModal';
import { CollectionProvider } from './src/context/CollectionContext';
import { CommunityProvider } from './src/context/CommunityContext';
// import { usePushNotifications } from './src/hooks/usePushNotifications';

function AppContent() {
  // usePushNotifications();
  return <RootNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <CollectionProvider>
          <CommunityProvider>
            <AppContent />
            <ExpiredProductAlertModal />
          </CommunityProvider>
        </CollectionProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}