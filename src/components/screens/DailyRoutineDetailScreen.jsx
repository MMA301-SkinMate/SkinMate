import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Header } from '../common/Header';
import { Icon } from '../common/Icon';
import { useSkinApp } from '../../context/SkinAppContext';

export const DailyRoutineDetailScreen = () => {
  const {
    analysisResult,
    selectedSession,
    setSelectedSession,
    completedSteps,
    toggleStepCompleted,
    treatmentPlan,
    setCurrentScreen,
  } = useSkinApp();

  // 5 Skincare Steps Standard Schema
  const STEPS_CONFIG = [
    {
      stepNumber: 1,
      title: 'BƯỚC 1 - LÀM SẠCH',
      category: 'Làm sạch (Tẩy trang / Sữa rửa mặt)',
      icon: 'droplets',
      iconColor: '#0284c7',
      iconBg: '#e0f2fe',
    },
    {
      stepNumber: 2,
      title: 'BƯỚC 2 - CÂN BẰNG',
      category: 'Cân bằng (Toner / Nước hoa hồng)',
      icon: 'sparkles',
      iconColor: '#9333ea',
      iconBg: '#faf5ff',
    },
    {
      stepNumber: 3,
      title: 'BƯỚC 3 - ĐẶC TRỊ',
      category: 'Đặc trị (Tẩy da chết / Serum / Chấm mụn)',
      icon: 'zap',
      iconColor: '#ea580c',
      iconBg: '#fff7ed',
    },
    {
      stepNumber: 4,
      title: 'BƯỚC 4 - DƯỠNG / PHỤC HỒI',
      category: 'Dưỡng / Phục hồi (Kem dưỡng / Gel)',
      icon: 'shield',
      iconColor: '#059669',
      iconBg: '#f0fdf4',
    },
    {
      stepNumber: 5,
      title: 'BƯỚC 5 - BẢO VỆ',
      category: 'Bảo vệ (Kem chống nắng – bắt buộc Buổi sáng)',
      icon: 'sun',
      iconColor: '#ca8a04',
      iconBg: '#fefce8',
    },
  ];

  const currentProducts = analysisResult?.adaptedSchedule?.[selectedSession] || [];
  const dynamicReasons = analysisResult?.dynamicReasons || {};

  // Tính số bước đã hoàn thành
  const sessionCompleted = completedSteps[selectedSession] || {};
  const completedCount = Object.values(sessionCompleted).filter(Boolean).length;
  const totalStepCount = selectedSession === 'morning' ? 5 : 4;
  const progressPercent = Math.round((completedCount / totalStepCount) * 100);

  return (
    <View style={styles.container}>
      <Header
        title="Chi Tiết Daily Routine"
        subtitle={`Phác đồ 5 bước chuẩn y khoa • Buổi ${selectedSession === 'morning' ? 'Sáng' : 'Tối'}`}
        showBack={true}
        onBack={() => setCurrentScreen('DailyRoutine')}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Session Switcher & Treatment Plan Tag */}
        <View style={styles.topControlRow}>
          <View style={styles.planInfoPill}>
            <View style={styles.planPulseDot} />
            <Text style={styles.planInfoText}>
              Ngày {treatmentPlan.currentDay}/{treatmentPlan.totalDays}
            </Text>
          </View>

          <View style={styles.sessionToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, selectedSession === 'morning' && styles.toggleBtnActiveDay]}
              onPress={() => setSelectedSession('morning')}
              activeOpacity={0.8}
            >
              <Icon
                name="sun"
                size={14}
                color={selectedSession === 'morning' ? '#d97706' : '#94a3b8'}
              />
              <Text
                style={[
                  styles.toggleBtnText,
                  selectedSession === 'morning' && styles.toggleBtnTextActiveDay,
                ]}
              >
                Buổi Sáng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, selectedSession === 'evening' && styles.toggleBtnActiveNight]}
              onPress={() => setSelectedSession('evening')}
              activeOpacity={0.8}
            >
              <Icon
                name="moon"
                size={14}
                color={selectedSession === 'evening' ? '#ffffff' : '#94a3b8'}
              />
              <Text
                style={[
                  styles.toggleBtnText,
                  selectedSession === 'evening' && styles.toggleBtnTextActiveNight,
                ]}
              >
                Buổi Tối
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Tracker Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Tiến độ skincare hôm nay</Text>
            <Text style={styles.progressPercent}>{progressPercent}% ({completedCount}/{totalStepCount} bước)</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* 16. The 5 Skincare Step Horizontal Cards with 3 Vertical Stream Sections */}
        <View style={styles.stepsList}>
          {STEPS_CONFIG.map((stepConf) => {
            // Bước 5 (Chống nắng) chỉ bắt buộc vào Buổi Sáng
            if (selectedSession === 'evening' && stepConf.stepNumber === 5) {
              return null;
            }

            const product = currentProducts[stepConf.stepNumber - 1];
            const isCompleted = sessionCompleted[stepConf.stepNumber];
            const dynamicReason = dynamicReasons[stepConf.stepNumber];

            return (
              <View
                key={stepConf.stepNumber}
                style={[
                  styles.stepCard,
                  isCompleted && styles.stepCardCompleted,
                ]}
              >
                {/* Luồng 1: Tiêu đề bước + Icon đại diện sản phẩm + Checkbox hoàn thành */}
                <View style={styles.stream1Row}>
                  <View style={styles.stream1Left}>
                    <View style={[styles.stepIconBox, { backgroundColor: stepConf.iconBg }]}>
                      <Icon name={stepConf.icon} size={18} color={stepConf.iconColor} />
                    </View>
                    <View>
                      <Text style={styles.stepTitleBadge}>{stepConf.title}</Text>
                      <Text style={styles.stepCategoryText}>{stepConf.category}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.checkboxBtn,
                      isCompleted && styles.checkboxBtnChecked,
                    ]}
                    onPress={() => toggleStepCompleted(selectedSession, stepConf.stepNumber)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="check"
                      size={14}
                      color={isCompleted ? '#ffffff' : '#cbd5e1'}
                      strokeWidth={3}
                    />
                  </TouchableOpacity>
                </View>

                {/* Luồng 2: Tên sản phẩm + Thương hiệu + Hướng dẫn sử dụng */}
                <View style={styles.stream2Product}>
                  <View style={styles.productNameRow}>
                    <Text style={styles.brandName}>{product?.brand || 'Sản phẩm đề xuất'}</Text>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{product?.category || 'Chăm sóc da'}</Text>
                    </View>
                  </View>
                  <Text style={styles.productName}>
                    {product?.name || `Sản phẩm ${stepConf.category}`}
                  </Text>
                  <View style={styles.usageGuideBox}>
                    <Icon name="info" size={13} color="#64748b" />
                    <Text style={styles.usageGuideText}>
                      {product?.usageTip || 'Thoa nhẹ nhàng và vỗ đều lên da.'}
                    </Text>
                  </View>
                </View>

                {/* Luồng 3: Lý do động (Một dòng text màu làm điểm nhấn, sinh ra từ Check-in) */}
                {dynamicReason ? (
                  <View
                    style={[
                      styles.stream3Reason,
                      stepConf.stepNumber === 3 && styles.stream3ReasonSpecial,
                    ]}
                  >
                    <View style={styles.reasonTop}>
                      <Icon
                        name="sparkles"
                        size={13}
                        color={stepConf.stepNumber === 3 ? '#e11d48' : '#0f766e'}
                      />
                      <Text
                        style={[
                          styles.reasonTag,
                          stepConf.stepNumber === 3 && styles.reasonTagSpecial,
                        ]}
                      >
                        LÝ DO ĐỘNG TỪ CHECK-IN DA HÔM NAY:
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.reasonText,
                        stepConf.stepNumber === 3 && styles.reasonTextSpecial,
                      ]}
                    >
                      "{dynamicReason}"
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Action Button: To Routine Streak Detail */}
        <TouchableOpacity
          style={styles.viewStreakBtn}
          onPress={() => setCurrentScreen('RoutineChainDetail')}
          activeOpacity={0.85}
        >
          <Icon name="layers" size={16} color="#ffffff" />
          <Text style={styles.viewStreakBtnText}>Xem Chuỗi Routine Đang Dùng (14 Ngày)</Text>
          <Icon name="chevron-right" size={16} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  planInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    gap: 6,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  planPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0f766e',
  },
  planInfoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f766e',
  },
  sessionToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 3,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    gap: 4,
  },
  toggleBtnActiveDay: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleBtnActiveNight: {
    backgroundColor: '#1e1b4b',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  toggleBtnTextActiveDay: {
    color: '#b45309',
    fontWeight: '700',
  },
  toggleBtnTextActiveNight: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // Progress
  progressCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#e11d48',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#e11d48',
    borderRadius: 3,
  },

  // Steps List
  stepsList: {
    gap: 14,
    marginBottom: 20,
  },
  stepCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stepCardCompleted: {
    borderColor: '#bbf7d0',
    backgroundColor: '#fafffd',
  },

  // Luồng 1
  stream1Row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  stream1Left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  stepIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitleBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.6,
  },
  stepCategoryText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  checkboxBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBtnChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },

  // Luồng 2
  stream2Product: {
    paddingVertical: 12,
  },
  productNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  productName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 19,
    marginBottom: 8,
  },
  usageGuideBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 10,
    gap: 6,
  },
  usageGuideText: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },

  // Luồng 3: Lý do động
  stream3Reason: {
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0f766e',
  },
  stream3ReasonSpecial: {
    backgroundColor: '#fff1f2',
    borderLeftColor: '#e11d48',
  },
  reasonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  reasonTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f766e',
    letterSpacing: 0.5,
  },
  reasonTagSpecial: {
    color: '#e11d48',
  },
  reasonText: {
    fontSize: 11,
    color: '#134e4a',
    lineHeight: 16,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  reasonTextSpecial: {
    color: '#9f1239',
  },

  // Bottom action
  viewStreakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  viewStreakBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
