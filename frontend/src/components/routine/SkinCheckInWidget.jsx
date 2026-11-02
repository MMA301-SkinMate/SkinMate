import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SKIN_CONDITIONS } from '../../constants/skinDictionaries';
import { useRoutine } from '../../context/RoutineContext';

export default function SkinCheckInWidget() {
  const { todayCheckIn, checkInSkin } = useRoutine();

  const handleToggleCondition = (conditionCode) => {
    let nextSelected = [];

    if (conditionCode === 'binh_thuong') {
      // "Bình thường" is mutually exclusive with all other conditions
      if (todayCheckIn.includes('binh_thuong')) {
        nextSelected = [];
      } else {
        nextSelected = ['binh_thuong'];
      }
    } else {
      // Any problem condition automatically deselects "Bình thường"
      const filtered = todayCheckIn.filter(c => c !== 'binh_thuong');
      if (filtered.includes(conditionCode)) {
        nextSelected = filtered.filter(c => c !== conditionCode);
      } else {
        nextSelected = [...filtered, conditionCode];
      }
    }

    checkInSkin(nextSelected);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.badgeDot} />
          <Text style={styles.subTitle}>NHẬT KÝ LÀN DA HÔM NAY</Text>
        </View>
        <Text style={styles.hintText}>Chọn tình trạng da</Text>
      </View>

      <Text style={styles.questionTitle}>Hôm nay da bạn cảm thấy thế nào?</Text>

      <View style={styles.conditionsRow}>
        {SKIN_CONDITIONS.map((cond) => {
          const isSelected = todayCheckIn.includes(cond.code);

          return (
            <TouchableOpacity
              key={cond.code}
              style={[
                styles.conditionBtn,
                isSelected && {
                  borderColor: cond.color,
                  backgroundColor: cond.bgColor,
                  transform: [{ scale: 1.04 }],
                },
              ]}
              onPress={() => handleToggleCondition(cond.code)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.iconWrap,
                  isSelected && { backgroundColor: cond.color },
                ]}
              >
                <Ionicons
                  name={cond.icon}
                  size={24}
                  color={isSelected ? '#ffffff' : cond.color}
                />
              </View>

              <Text
                style={[
                  styles.conditionLabel,
                  isSelected && { color: cond.color, fontWeight: '800' },
                ]}
                numberOfLines={1}
              >
                {cond.label}
              </Text>

              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: cond.color }]}>
                  <Ionicons name="checkmark" size={10} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  subTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  hintText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },
  conditionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  conditionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
    position: 'relative',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  conditionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

