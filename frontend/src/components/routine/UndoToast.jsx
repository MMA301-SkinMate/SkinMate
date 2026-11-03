import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useRoutine } from '../../context/RoutineContext';

export default function UndoToast() {
  const { isUndoVisible, undoRemaining, undoCheckIn } = useRoutine();

  if (!isUndoVisible) return null;

  return (
    <View style={styles.toastContainer}>
      <View style={styles.toastCard}>
        <View style={styles.leftInfo}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.toastTitle}>Đã ghi nhận tình trạng da</Text>
            <Text style={styles.toastSubtitle}>
              Routine đã được cập nhật • Tự động lưu sau {undoRemaining}s
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.undoBtn}
          onPress={undoCheckIn}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-undo-outline" size={15} color="#ffffff" />
          <Text style={styles.undoBtnText}>Hoàn tác</Text>
          <View style={styles.countdownPill}>
            <Text style={styles.countdownText}>{undoRemaining}s</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toastCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#064e3b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textBox: {
    flex: 1,
  },
  toastTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  toastSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 5,
  },
  undoBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  countdownPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 2,
  },
  countdownText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});

