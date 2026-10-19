import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
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
import { Icon } from './components/common/Icon';

const MainAppContent = () => {
  const { currentScreen, setCurrentScreen, setIsNotificationOpen } = useSkinApp();
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Quick navigation items for all 8 required features in the Google Sheet
  const featureList = [
    { key: 'Home', label: '11. UI Home', icon: 'home' },
    { key: 'NotificationTrigger', label: '12. Thông Báo Checkin', icon: 'bell' },
    { key: 'Checkin', label: '13. Checkin Da Hàng Ngày', icon: 'checkin' },
    { key: 'Analysis', label: '14. Phân Tích Da & Routine', icon: 'zap' },
    { key: 'DailyRoutine', label: '15. View Daily Routine', icon: 'sparkles' },
    { key: 'DailyRoutineDetail', label: '16. View Routine Detail', icon: 'eye' },
    { key: 'RoutineChainDetail', label: '17. Chuỗi Routine Detail', icon: 'layers' },
    { key: 'AddEditRoutine', label: '18. Add/Edit Sản Phẩm', icon: 'plus' },
  ];

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
      <StatusBar barStyle="dark-content" />

      {/* Top Testing & Navigation Toolbar (Stitch Preview Header) */}
      <View style={styles.previewToolbar}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Icon name="sparkles" size={14} color="#e11d48" />
            <Text style={styles.brandBadgeText}>SKINCARE AI</Text>
          </View>
          <Text style={styles.previewTitleText}>
            Frontend React Native • Stitch UI Standard
          </Text>
        </View>

        {/* 8 Features Quick Switcher */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuresScroll}
        >
          {featureList.map((f) => {
            const isActive =
              currentScreen === f.key ||
              (f.key === 'NotificationTrigger' && false);

            return (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.featureTab,
                  isActive && styles.featureTabActive,
                ]}
                onPress={() => {
                  if (f.key === 'NotificationTrigger') {
                    setIsNotificationOpen(true);
                  } else {
                    setCurrentScreen(f.key);
                  }
                }}
                activeOpacity={0.8}
              >
                <Icon
                  name={f.icon}
                  size={12}
                  color={isActive ? '#ffffff' : '#94a3b8'}
                />
                <Text
                  style={[
                    styles.featureTabText,
                    isActive && styles.featureTabTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Viewport Frame Toggle */}
        <View style={styles.toolbarRight}>
          <TouchableOpacity
            style={styles.frameToggleBtn}
            onPress={() => setIsMobileFrame(!isMobileFrame)}
            activeOpacity={0.8}
          >
            <Icon
              name={isMobileFrame ? 'grid' : 'layers'}
              size={13}
              color="#cbd5e1"
            />
            <Text style={styles.frameToggleText}>
              {isMobileFrame ? 'Toàn màn hình' : 'Khung Mobile (Stitch)'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Center Phone Canvas (Stitch with Google Mobile Frame) */}
      <View style={styles.canvasCenter}>
        <View
          style={[
            styles.phoneContainer,
            !isMobileFrame && styles.phoneContainerFullscreen,
          ]}
        >
          {/* Simulated Mobile Status Bar */}
          {isMobileFrame && (
            <View style={styles.mobileStatusBar}>
              <Text style={styles.statusBarTime}>09:41</Text>
              <View style={styles.dynamicIslandPill} />
              <View style={styles.statusBarIcons}>
                <Icon name="sparkles" size={10} color="#0f172a" />
                <Icon name="zap" size={10} color="#0f766e" />
                <View style={styles.batteryIcon}>
                  <View style={styles.batteryFill} />
                </View>
              </View>
            </View>
          )}

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

          {/* iOS Bottom Home Indicator bar */}
          {isMobileFrame && (
            <View style={styles.homeIndicatorWrap}>
              <View style={styles.homeIndicatorBar} />
            </View>
          )}
        </View>
      </View>
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
    backgroundColor: '#090d16',
    height: '100%',
    width: '100%',
  },
  previewToolbar: {
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#e11d48',
    letterSpacing: 0.8,
  },
  previewTitleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
  },
  featuresScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  featureTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  featureTabActive: {
    backgroundColor: '#e11d48',
  },
  featureTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
  },
  featureTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  toolbarRight: {
    marginTop: 6,
    alignItems: 'flex-end',
  },
  frameToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  frameToggleText: {
    fontSize: 10,
    color: '#cbd5e1',
  },

  // Phone Shell & Canvas
  canvasCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  phoneContainer: {
    width: '100%',
    maxWidth: 416,
    height: '100%',
    maxHeight: 890,
    backgroundColor: '#ffffff',
    borderRadius: 44,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 25,
    borderWidth: 8,
    borderColor: '#1e293b',
    position: 'relative',
  },
  phoneContainerFullscreen: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 0,
    borderWidth: 0,
  },

  // Mobile Status Bar
  mobileStatusBar: {
    height: 44,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    zIndex: 100,
  },
  statusBarTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  dynamicIslandPill: {
    width: 90,
    height: 24,
    backgroundColor: '#0f172a',
    borderRadius: 12,
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryIcon: {
    width: 20,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#0f172a',
    padding: 1,
    justifyContent: 'center',
  },
  batteryFill: {
    width: '75%',
    height: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 1.5,
  },

  // Screen View Area
  screenViewArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // iOS Home Indicator
  homeIndicatorWrap: {
    height: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicatorBar: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0f172a',
  },
});
