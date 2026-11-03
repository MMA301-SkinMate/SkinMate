import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useRoutine } from '../../context/RoutineContext';
import { getProductIcon } from '../../constants/product-icons';

export default function DailyRoutineDetailScreen({ navigation }) {
  const { dailyRoutine } = useRoutine();
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('morning'); // 'morning' | 'evening'

  const allSteps = dailyRoutine?.steps || [];
  const steps = useMemo(() => {
    return allSteps.filter(step => {
      if (!step.timeOfDay || step.timeOfDay === 'both') return true;
      return step.timeOfDay === selectedTimeOfDay;
    });
  }, [allSteps, selectedTimeOfDay]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Chi Tiết Chu Trình Daily</Text>
          <Text style={styles.headerSubtitle}>
            {dailyRoutine?.planTitle || 'Quy trình 5 bước chăm sóc da'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => navigation.navigate('TreatmentPlanDetail')}
        >
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Routine Time Selector (Sáng / Tối) */}
      <View style={styles.timeSelectorRow}>
        <TouchableOpacity
          style={[
            styles.timeTab,
            selectedTimeOfDay === 'morning' && styles.timeTabActive,
          ]}
          onPress={() => setSelectedTimeOfDay('morning')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="sunny"
            size={16}
            color={selectedTimeOfDay === 'morning' ? '#ffffff' : '#64748b'}
          />
          <Text
            style={[
              styles.timeTabText,
              selectedTimeOfDay === 'morning' && styles.timeTabTextActive,
            ]}
          >
            Buổi sáng (Bắt buộc KCN)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.timeTab,
            selectedTimeOfDay === 'evening' && styles.timeTabActive,
          ]}
          onPress={() => setSelectedTimeOfDay('evening')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="moon"
            size={16}
            color={selectedTimeOfDay === 'evening' ? '#ffffff' : '#64748b'}
          />
          <Text
            style={[
              styles.timeTabText,
              selectedTimeOfDay === 'evening' && styles.timeTabTextActive,
            ]}
          >
            Buổi tối (Phục hồi sâu)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overridden Notification Banner if active */}
      {dailyRoutine?.isOverridden && (
        <View style={styles.overrideAlert}>
          <Ionicons name="information-circle" size={20} color="#b45309" />
          <View style={{ flex: 1 }}>
            <Text style={styles.overrideAlertTitle}>Thuật toán tự động rẽ nhánh:</Text>
            <Text style={styles.overrideAlertText}>
              {dailyRoutine.overrideReason}
            </Text>
          </View>
        </View>
      )}

      {/* Steps List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {steps.map(step => {
          const iconObj = getProductIcon(step.productIcon, step.stepKey);

          return (
            <View key={step.stepNumber} style={styles.stepCardHorizontal}>
              {/* Vertical Information Flow inside Horizontal Card */}

              {/* 1. Header flow: Step Title */}
              <View style={styles.stepHeaderRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
                </View>
                <Text style={styles.stepTitleText}>{step.stepName}</Text>
                {step.stepNumber === 3 && (
                  <View style={styles.treatBadge}>
                    <Text style={styles.treatBadgeText}>Đặc trị</Text>
                  </View>
                )}
                {step.isExternalRecommendation && (
                  <View style={styles.externalBadge}>
                    <Text style={styles.externalBadgeText}>Gợi ý ngoài tủ đồ</Text>
                  </View>
                )}
              </View>

              {/* 2. Product Icon + Product Name Flow */}
              <View style={styles.productInfoRow}>
                <View style={styles.iconContainer}>
                  <Image
                    source={iconObj.image}
                    style={styles.productIconImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.productTextCol}>
                  <Text style={styles.productName}>{step.productName}</Text>
                  {step.brand && (
                    <Text style={styles.brandName}>{step.brand}</Text>
                  )}
                  {step.ingredients && step.ingredients.length > 0 && (
                    <View style={styles.ingredientsRow}>
                      {step.ingredients.slice(0, 3).map((ing, i) => (
                        <View key={i} style={styles.ingChip}>
                          <Text style={styles.ingChipText}>{ing}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* 3. Instructions (Hướng dẫn sử dụng - nếu có) */}
              {step.instructions ? (
                <View style={styles.instructionsContainer}>
                  <Ionicons name="clipboard-outline" size={14} color="#64748b" />
                  <Text style={styles.instructionsText}>
                    {step.instructions}
                  </Text>
                </View>
              ) : null}

              {/* 4. Dynamic Reason (Lý do động) - Highlighted colored text line */}
              {step.dynamicReason ? (
                <View style={styles.dynamicReasonBox}>
                  <Ionicons name="sparkles" size={14} color={COLORS.primary} style={{ marginTop: 2 }} />
                  <Text style={styles.dynamicReasonText}>
                    {step.dynamicReason}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  headerActionBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f0fdfa',
  },
  timeSelectorRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  timeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  timeTabActive: {
    backgroundColor: COLORS.primary,
  },
  timeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  timeTabTextActive: {
    color: '#ffffff',
  },
  overrideAlert: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 14,
    padding: 12,
    margin: 16,
    marginBottom: 8,
    gap: 10,
  },
  overrideAlertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 2,
  },
  overrideAlertText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 16,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  stepCardHorizontal: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 0.3,
  },
  treatBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  treatBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  externalBadge: {
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  externalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7c3aed',
  },
  productInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconContainer: {
    width: 52,
    height: 56,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  productIconImage: {
    width: 44,
    height: 48,
  },
  productTextCol: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20,
  },
  brandName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  ingredientsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  ingChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ingChipText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    gap: 8,
  },
  instructionsText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  dynamicReasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#ccfbf1',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  dynamicReasonText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#0f766e',
    lineHeight: 18,
  },
});

