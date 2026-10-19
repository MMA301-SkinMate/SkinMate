import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { useSkinApp } from '../../context/SkinAppContext';

export const UndoSnackbar = () => {
  const {
    undoActive,
    undoTimeRemaining,
    handleUndoCheckin,
    selectedConditions,
    CONDITION_DICTIONARY,
    setCurrentScreen,
  } = useSkinApp();

  if (!undoActive) return null;

  const conditionLabels = selectedConditions
    .map((c) => CONDITION_DICTIONARY[c]?.label)
    .filter(Boolean)
    .join(', ');

  const progressPercentage = (undoTimeRemaining / 10) * 100;

  return (
    <View style={styles.floatingContainer}>
      {/* Top Countdown Progress Line */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
      </View>

      <View style={styles.contentRow}>
        <View style={styles.iconCircle}>
          <Icon name="check-circle" size={18} color="#10b981" />
        </View>

        <View style={styles.textColumn}>
          <Text style={styles.titleText}>Đã ghi nhận tình trạng da</Text>
          <Text numberOfLines={1} style={styles.descText}>
            Hôm nay: <Text style={styles.conditionText}>{conditionLabels}</Text>
          </Text>
        </View>

        {/* Undo Action Button */}
        <TouchableOpacity
          style={styles.undoButton}
          onPress={handleUndoCheckin}
          activeOpacity={0.8}
        >
          <Icon name="undo" size={14} color="#ffffff" />
          <Text style={styles.undoButtonText}>Hoàn tác ({undoTimeRemaining}s)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 74,
    left: 16,
    right: 16,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 999,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#e11d48',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  descText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  conditionText: {
    color: '#fca5a5',
    fontWeight: '600',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e11d48',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  undoButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});
