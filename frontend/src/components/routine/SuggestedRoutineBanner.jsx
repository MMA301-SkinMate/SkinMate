import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function SuggestedRoutineBanner({ onOpenSuggestedPlans }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="sparkles" size={24} color={COLORS.primary} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>CHƯA CÓ CHU TRÌNH HÔM NAY</Text>
          <Text style={styles.title}>Gợi ý chu trình skincare phù hợp</Text>
          <Text style={styles.description}>
            Khám phá các chuỗi routine 7 - 14 ngày được cá nhân hóa theo từng loại da và tình trạng hiện tại của bạn.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={onOpenSuggestedPlans}
        activeOpacity={0.85}
      >
        <Text style={styles.actionButtonText}>Gợi ý chuỗi routine</Text>
        <Ionicons name="arrow-forward" size={16} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0fdfa',
    borderRadius: 20,
    padding: 18,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: '#99f6e4',
    borderStyle: 'dashed',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

