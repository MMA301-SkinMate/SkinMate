import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { useSkinApp } from '../../context/SkinAppContext';

export const BottomNav = () => {
  const { currentScreen, setCurrentScreen } = useSkinApp();

  const navItems = [
    { key: 'Home', label: 'Trang chủ', icon: 'home' },
    { key: 'Checkin', label: 'Nhật ký da', icon: 'checkin' },
    { key: 'DailyRoutine', label: 'Routine ngày', icon: 'sparkles' },
    { key: 'RoutineChainDetail', label: 'Chuỗi Routine', icon: 'layers' },
    { key: 'AddEditRoutine', label: 'Thêm/Sửa', icon: 'plus' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive =
          currentScreen === item.key ||
          (item.key === 'DailyRoutine' && currentScreen === 'DailyRoutineDetail') ||
          (item.key === 'Checkin' && currentScreen === 'Analysis');

        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.navButton, item.key === 'AddEditRoutine' && styles.addButtonSpecial]}
            onPress={() => setCurrentScreen(item.key)}
            activeOpacity={0.7}
          >
            {item.key === 'AddEditRoutine' ? (
              <View style={styles.addIconCircle}>
                <Icon name="plus" size={20} color="#ffffff" strokeWidth={2.5} />
              </View>
            ) : (
              <>
                <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                  <Icon
                    name={item.icon}
                    size={20}
                    color={isActive ? '#e11d48' : '#64748b'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 62,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: '#ffe4e6',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#e11d48',
    fontWeight: '700',
  },
  addButtonSpecial: {
    marginTop: -16,
  },
  addIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e11d48',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
});
