import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Header } from '../common/Header';
import { Icon } from '../common/Icon';
import { useSkinApp } from '../../context/SkinAppContext';

export const AnalysisScreen = () => {
  const {
    analysisResult,
    treatmentPlan,
    selectedConditions,
    CONDITION_DICTIONARY,
    setCurrentScreen,
    addExternalProductToCollection,
  } = useSkinApp();

  if (!analysisResult) return null;

  const activePlan = treatmentPlan;
  const isOverridden = analysisResult.isOverridden;

  return (
    <View style={styles.container}>
      <Header
        title="Phân Tích Da & Routine"
        subtitle="Hệ thống đối chiếu phác đồ điều trị với tình trạng da hôm nay"
        showBack={true}
        onBack={() => setCurrentScreen('Home')}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. Active Treatment Plan Banner */}
        <View style={styles.planBanner}>
          <View style={styles.planHeaderRow}>
            <View style={styles.planBadge}>
              <Icon name="layers" size={13} color="#0f766e" />
              <Text style={styles.planBadgeText}>PHÁC ĐỒ ĐANG KÍCH HOẠT</Text>
            </View>
            <Text style={styles.planDayBadge}>
              Ngày {activePlan.currentDay}/{activePlan.totalDays}
            </Text>
          </View>
          <Text style={styles.planName}>{activePlan.name}</Text>
          <Text style={styles.planTarget}>Mục tiêu: {activePlan.targetGoal}</Text>
        </View>

        {/* 2. Today's Checkin Reflection */}
        <View style={styles.reflectionCard}>
          <View style={styles.reflectionRow}>
            <Text style={styles.reflectionTitle}>Check-in hôm nay:</Text>
            <View style={styles.chipsContainer}>
              {selectedConditions.map((cKey) => {
                const cond = CONDITION_DICTIONARY[cKey];
                return (
                  <View key={cKey} style={[styles.condChip, { backgroundColor: cond?.bgColor || '#f1f5f9' }]}>
                    <Text style={styles.condEmoji}>{cond?.emoji}</Text>
                    <Text style={[styles.condLabel, { color: cond?.color || '#1e293b' }]}>
                      {cond?.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* 3. AI Override / Adaptation Engine Card (Mục 14 cốt lõi) */}
        {isOverridden ? (
          <View style={styles.overrideAlertCard}>
            <View style={styles.overrideHeader}>
              <View style={styles.overrideIconPulse}>
                <Icon name="zap" size={18} color="#ffffff" />
              </View>
              <View style={styles.overrideTitleCol}>
                <Text style={styles.overrideTag}>THUẬT TOÁN ĐÃ KÍCH HOẠT GHI ĐÈ (OVERRIDE)</Text>
                <Text style={styles.overrideStatusTitle}>Bảo vệ phục hồi hàng rào màng lipid</Text>
              </View>
            </View>

            <Text style={styles.overrideExplanation}>
              {analysisResult.overrideReason}
            </Text>

            {/* Shift Days Badge */}
            <View style={styles.shiftBadgeRow}>
              <Icon name="calendar" size={14} color="#b45309" />
              <Text style={styles.shiftBadgeText}>
                Lùi toàn bộ lịch trình hôm nay và sau này xuống <Text style={styles.boldText}>1 ngày</Text>
              </Text>
            </View>

            {/* Replacement Details */}
            {analysisResult.suggestedReplacements.map((item, idx) => (
              <View key={idx} style={styles.replacementCompareCard}>
                <View style={styles.replaceSide}>
                  <Text style={styles.replaceSideLabel}>KẾ HOẠCH GỐC (BỊ HỦY)</Text>
                  <Text style={styles.cancelledProduct}>{item.originalName}</Text>
                  <Text style={styles.cancelledSub}>⚠️ Chứa BHA - Nguy cơ làm nặng thêm tình trạng khô rát</Text>
                </View>

                <View style={styles.replaceArrowBox}>
                  <Icon name="chevron-right" size={18} color="#e11d48" />
                </View>

                <View style={[styles.replaceSide, styles.replaceSideActive]}>
                  <Text style={styles.activeSideLabel}>GHI ĐÈ THAY THẾ (ĐÃ CHỌN)</Text>
                  <Text style={styles.activeProduct}>{item.replacedWithName}</Text>
                  <Text style={styles.activeSub}>✅ Lấy từ Tủ đồ: {item.reason}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.normalCard}>
            <View style={styles.normalHeader}>
              <Icon name="check-circle" size={18} color="#10b981" />
              <Text style={styles.normalTitle}>Kế hoạch phác đồ giữ nguyên an toàn</Text>
            </View>
            <Text style={styles.normalDesc}>
              Tình trạng da của bạn ổn định. Daily routine hôm nay tiếp tục tuân theo tiến độ phác đồ chuẩn Ngày {activePlan.currentDay}.
            </Text>
          </View>
        )}

        {/* 4. Closet Audit & External Recommendations (Mục 14) */}
        {analysisResult.externalRecommendations.length > 0 && (
          <View style={styles.externalSection}>
            <View style={styles.externalSectionHeader}>
              <View style={styles.starWrap}>
                <Icon name="sparkles" size={16} color="#d97706" />
              </View>
              <View>
                <Text style={styles.externalTitle}>Gợi ý sản phẩm bổ sung bên ngoài tủ đồ</Text>
                <Text style={styles.externalSub}>
                  Tủ đồ của bạn thiếu kem dưỡng phục hồi chuyên sâu cho nền da kích ứng
                </Text>
              </View>
            </View>

            {analysisResult.externalRecommendations.map((prod) => (
              <View key={prod.id} style={styles.externalCard}>
                <View style={styles.extIconPlaceholder}>
                  <Icon name="shield" size={24} color="#0f766e" />
                </View>
                <View style={styles.extContent}>
                  <Text style={styles.extBrand}>{prod.brand}</Text>
                  <Text style={styles.extName}>{prod.name}</Text>
                  <Text style={styles.extReason}>{prod.matchReason}</Text>
                  <View style={styles.extPriceRow}>
                    <Text style={styles.extPrice}>{prod.price}</Text>
                    <TouchableOpacity
                      style={styles.addExtBtn}
                      onPress={() => {
                        addExternalProductToCollection(prod);
                        alert(`Đã thêm ${prod.name} vào Tủ đồ của bạn!`);
                      }}
                      activeOpacity={0.8}
                    >
                      <Icon name="plus" size={12} color="#ffffff" />
                      <Text style={styles.addExtBtnText}>Thêm vào tủ đồ</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 5. Navigation Buttons */}
        <View style={styles.actionButtonsCol}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => setCurrentScreen('DailyRoutineDetail')}
            activeOpacity={0.85}
          >
            <Icon name="sparkles" size={18} color="#ffffff" />
            <Text style={styles.btnPrimaryText}>Xem Chi Tiết 5 Bước Hôm Nay</Text>
            <Icon name="chevron-right" size={18} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => setCurrentScreen('DailyRoutine')}
            activeOpacity={0.8}
          >
            <Icon name="eye" size={16} color="#1e293b" />
            <Text style={styles.btnSecondaryText}>Xem Kệ Gỗ Daily Routine</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnTertiary}
            onPress={() => setCurrentScreen('RoutineChainDetail')}
            activeOpacity={0.8}
          >
            <Icon name="layers" size={16} color="#0f766e" />
            <Text style={styles.btnTertiaryText}>Xem Chuỗi Routine 14 Ngày</Text>
          </TouchableOpacity>
        </View>
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
  planBanner: {
    backgroundColor: '#f0fdfa',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#99f6e4',
    marginBottom: 12,
  },
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f766e',
    letterSpacing: 0.8,
  },
  planDayBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#134e4a',
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  planName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  planTarget: {
    fontSize: 11,
    color: '#475569',
  },

  reflectionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  reflectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reflectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  condChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  condEmoji: {
    fontSize: 12,
  },
  condLabel: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Override Alert
  overrideAlertCard: {
    backgroundColor: '#fff1f2',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#fecdd3',
    marginBottom: 16,
  },
  overrideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  overrideIconPulse: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e11d48',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  overrideTitleCol: {
    flex: 1,
  },
  overrideTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#e11d48',
    letterSpacing: 0.8,
  },
  overrideStatusTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#881337',
  },
  overrideExplanation: {
    fontSize: 12,
    color: '#9f1239',
    lineHeight: 18,
    marginBottom: 12,
  },
  shiftBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    marginBottom: 12,
  },
  shiftBadgeText: {
    fontSize: 11,
    color: '#92400e',
  },
  boldText: {
    fontWeight: '800',
  },

  // Replacement comparison
  replacementCompareCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  replaceSide: {
    marginBottom: 8,
  },
  replaceSideActive: {
    marginTop: 8,
    marginBottom: 0,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  replaceSideLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  activeSideLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  cancelledProduct: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  cancelledSub: {
    fontSize: 10,
    color: '#ef4444',
    marginTop: 2,
  },
  activeProduct: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  activeSub: {
    fontSize: 10,
    color: '#059669',
    marginTop: 2,
  },
  replaceArrowBox: {
    alignItems: 'center',
  },

  // Normal Card
  normalCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 16,
  },
  normalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  normalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803d',
  },
  normalDesc: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 17,
  },

  // External recommendations
  externalSection: {
    marginBottom: 18,
  },
  externalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  starWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  externalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
  },
  externalSub: {
    fontSize: 10,
    color: '#64748b',
  },
  externalCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    gap: 12,
  },
  extIconPlaceholder: {
    width: 48,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  extContent: {
    flex: 1,
  },
  extBrand: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  extName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginVertical: 2,
  },
  extReason: {
    fontSize: 10,
    color: '#0f766e',
    lineHeight: 14,
    marginBottom: 6,
  },
  extPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  extPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#e11d48',
  },
  addExtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f766e',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  addExtBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Action Buttons
  actionButtonsCol: {
    gap: 10,
    marginTop: 6,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e11d48',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  btnTertiary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#99f6e4',
    gap: 6,
  },
  btnTertiaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f766e',
  },
});
