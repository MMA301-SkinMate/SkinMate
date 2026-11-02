import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useRoutine } from '../../context/RoutineContext';
import { getProductIcon } from '../../constants/product-icons';

export default function TreatmentPlanDetailScreen({ route, navigation }) {
  const { activePlan, suggestedPlans, activatePlan } = useRoutine();
  const passedPlan = route.params?.plan;
  const isTemplateView = Boolean(passedPlan && passedPlan.isTemplate);
  const plan = passedPlan || activePlan || suggestedPlans[0];

  const [selectedDayNumber, setSelectedDayNumber] = useState(plan?.currentDay || 1);
  const [isActivating, setIsActivating] = useState(false);

  if (!plan) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có thông tin chuỗi routine.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const days = plan.days || [];
  const currentDayData = days.find(d => d.dayNumber === selectedDayNumber) || days[0];

  const handleActivate = async () => {
    try {
      setIsActivating(true);
      await activatePlan(plan._id);
      Alert.alert('Thành công', 'Đã kích hoạt chuỗi routine! Chu trình hôm nay đã được cập nhật.', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể kích hoạt chuỗi routine.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleAddEdit = () => {
    navigation.navigate('EditPlan', {
      planId: plan._id,
      selectedDayNumber,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.screenHeaderTitle}>
          {isTemplateView ? 'Chi Tiết Gợi Ý Chuỗi' : 'Chi Tiết Chuỗi Routine'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Header Card */}
        <View style={styles.planCard}>
          <View style={styles.badgeRow}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>
                {isTemplateView ? 'GỢI Ý PHÙ HỢP' : `ĐANG ÁP DỤNG · NGÀY ${plan.currentDay || 1}/${plan.totalDays}`}
              </Text>
            </View>
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={12} color="#475569" />
              <Text style={styles.durationText}>{plan.totalDays} Ngày</Text>
            </View>
          </View>

          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>

          {plan.targetConcerns && plan.targetConcerns.length > 0 && (
            <View style={styles.tagRow}>
              {plan.targetConcerns.map((c, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>#{c}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Days Horizontal Timeline Selector */}
        <Text style={styles.sectionHeading}>Lộ trình theo ngày</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabsContent}
        >
          {days.map(d => {
            const isSelected = d.dayNumber === selectedDayNumber;
            const isCurrentDay = !isTemplateView && d.dayNumber === plan.currentDay;
            return (
              <TouchableOpacity
                key={d.dayNumber}
                style={[
                  styles.dayTab,
                  isSelected && styles.dayTabSelected,
                  isCurrentDay && styles.dayTabCurrent,
                ]}
                onPress={() => setSelectedDayNumber(d.dayNumber)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayTabNum, isSelected && styles.dayTabNumSelected]}>
                  Day {d.dayNumber}
                </Text>
                {isCurrentDay && (
                  <View style={styles.todayDot}>
                    <Text style={styles.todayDotText}>Hôm nay</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Day Information */}
        {currentDayData && (
          <View style={styles.dayDetailBox}>
            <View style={styles.dayHeader}>
              <View>
                <Text style={styles.dayTitle}>{currentDayData.title}</Text>
                <Text style={styles.dayFocus}>Trọng tâm: {currentDayData.focus}</Text>
              </View>
            </View>

            {/* List of Steps in this Day */}
            <View style={styles.stepsList}>
              {(currentDayData.steps || []).map(step => {
                const iconObj = getProductIcon(step.productIcon, step.stepKey);
                return (
                  <View key={step.stepNumber} style={styles.stepItem}>
                    <View style={styles.stepNumberCircle}>
                      <Text style={styles.stepNum}>{step.stepNumber}</Text>
                    </View>
                    <Image source={iconObj.image} style={styles.stepIcon} resizeMode="contain" />
                    <View style={styles.stepInfo}>
                      <Text style={styles.stepName}>{step.stepName}</Text>
                      <Text style={styles.productName} numberOfLines={1}>
                        {step.productName}
                      </Text>
                      {step.ingredients && step.ingredients.length > 0 && (
                        <Text style={styles.ingredientsSummary} numberOfLines={1}>
                          Hoạt chất: {step.ingredients.join(', ')}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom Sticky Action Button Bar */}
      <View style={styles.bottomBar}>
        {isTemplateView ? (
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={handleActivate}
            disabled={isActivating}
            activeOpacity={0.85}
          >
            <Ionicons name="flash" size={18} color="#ffffff" />
            <Text style={styles.primaryActionText}>
              {isActivating ? 'Đang kích hoạt...' : 'Kích hoạt chuỗi routine này'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={handleAddEdit}
            activeOpacity={0.85}
          >
            <Ionicons name="create-outline" size={18} color="#ffffff" />
            <Text style={styles.primaryActionText}>Add / Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topBar: {
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
  screenHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    padding: 16,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activeBadge: {
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  planDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  dayTabsContent: {
    gap: 8,
    paddingBottom: 14,
  },
  dayTab: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 70,
  },
  dayTabSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayTabCurrent: {
    borderColor: '#0f766e',
  },
  dayTabNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  dayTabNumSelected: {
    color: '#ffffff',
  },
  todayDot: {
    marginTop: 2,
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  todayDotText: {
    fontSize: 9,
    color: '#0f766e',
    fontWeight: '700',
  },
  dayDetailBox: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 4,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  dayFocus: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 3,
  },
  stepsList: {
    gap: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  stepNumberCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  stepIcon: {
    width: 36,
    height: 40,
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1,
  },
  ingredientsSummary: {
    fontSize: 11,
    color: '#0f766e',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});

