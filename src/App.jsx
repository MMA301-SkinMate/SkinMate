import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SkinAppProvider, useSkinApp } from './context/SkinAppContext';
import { HomeScreen } from './components/screens/HomeScreen';
import { CheckinScreen } from './components/screens/CheckinScreen';
import { AnalysisScreen } from './components/screens/AnalysisScreen';
import { DailyRoutineScreen } from './components/screens/DailyRoutineScreen';
import { DailyRoutineDetailScreen } from './components/screens/DailyRoutineDetailScreen';
import { RoutineChainDetailScreen } from './components/screens/RoutineChainDetailScreen';
import { AddEditRoutineProductScreen } from './components/screens/AddEditRoutineProductScreen';
import { NotificationModal } from './components/screens/NotificationModal';
import { BottomNav } from './components/common/BottomNav';
import { UndoSnackbar } from './components/common/UndoSnackbar';
import { FABGuide } from './components/common/FABGuide';

const MainAppContent = () => {
  const { currentScreen } = useSkinApp();

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen />;
      case 'Checkin':
        return <CheckinScreen />;
      case 'Analysis':
        return <AnalysisScreen />;
      case 'DailyRoutine':
        return <DailyRoutineScreen />;
      case 'DailyRoutineDetail':
        return <DailyRoutineDetailScreen />;
      case 'RoutineChainDetail':
        return <RoutineChainDetailScreen />;
      case 'AddEditRoutine':
        return <AddEditRoutineProductScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Active Screen View */}
      <View style={styles.screenViewArea}>
        {renderCurrentScreen()}
      </View>

      {/* 13. Undo Toast Bar (10s countdown) */}
      <UndoSnackbar />

      {/* 10. FAB Guide Button (Cẩm nang da Do's & Don'ts) */}
      <FABGuide />

      {/* 12. Modal Thông Báo Check-in Da */}
      <NotificationModal />

      {/* Bottom Tab Navigation */}
      <BottomNav />
    </View>
  );
};

export default function App() {
  return (
    <SkinAppProvider>
      <MainAppContent />
    </SkinAppProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  screenViewArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
