import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import routineApi from '../../api/routineApi';

/**
 * 16. View Daily Routine Detail
 * - Theo 5 bước:
 *    Bước 1: Làm sạch (Tẩy trang / Sữa rửa mặt)
 *    Bước 2: Cân bằng (Toner / Nước hoa hồng)
 *    Bước 3: Đặc trị (Tẩy da chết / Serum / Chấm mụn) - Rẽ nhánh nhiều nhất theo Check-in
 *    Bước 4: Dưỡng / Phục hồi (Kem dưỡng / Gel)
 *    Bước 5: Bảo vệ (Kem chống nắng - bắt buộc nếu là chu trình Buổi sáng)
 *
 * - Mỗi bước render thành một Card nằm ngang, chứa 3 luồng thông tin xếp dọc:
 *    1. Tiêu đề bước: BƯỚC 1 - LÀM SẠCH
 *    2. Icon đại diện + Tên sản phẩm + Hướng dẫn sử dụng (nếu có)
 *    3. Lý do động: Dòng text màu làm điểm nhấn, sinh ra từ trạng thái Check-in
 */
export const DailyRoutineDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const passedRoutine = route.params?.dailyRoutine;
  const dateStr = route.params?.dateStr;

  const [routine, setRoutine] = useState(passedRoutine || null);
  const [loading, setLoading] = useState(!passedRoutine);
  const [session, setSession] = useState('morning'); // 'morning' | 'evening'

  useEffect(() => {
    if (!routine) {
      loadRoutine();
    }
  }, []);

  const loadRoutine = async () => {
    try {
      setLoading(true);
      const res = await routineApi.getTodayDailyRoutine(dateStr);
      if (res && res.data) {
        setRoutine(res.data);
      }
    } catch (err) {
      console.warn('Lỗi tải chi tiết routine:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStep = async (stepNumber) => {
    try {
      // Optimistic update
      setRoutine((prev) => {
        if (!prev) return prev;
        const stepsKey = session === 'morning' ? 'morningSteps' : 'eveningSteps';
        const updatedSteps = (prev[stepsKey] || []).map((s) =>
          s.stepNumber === stepNumber ? { ...s, isCompleted: !s.isCompleted } : s
        );
        return { ...prev, [stepsKey]: updatedSteps };
      });

      await routineApi.toggleStepCompletion(session, stepNumber);
    } catch (err) {
      console.warn('Lỗi cập nhật hoàn thành bước:', err.message);
      loadRoutine(); // revert on error
    }
  };

  const morningSteps = routine?.morningSteps || [];
  const eveningSteps = routine?.eveningSteps || [];
  const stepsToRender = session === 'morning' ? morningSteps : eveningSteps;

  const conditions = routine?.skinConditions || ['Bình thường'];
  const isOverridden = routine?.isOverridden;

  return (
    <View style={styles.container}>
      {/* ── Top Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <View style={styles.headerTitleCenter}>
          <Text style={styles.headerTitle}>Chi Tiết Daily Routine</Text>
          <Text style={styles.headerDate}>
            {routine?.date || new Date().toISOString().split('T')[0]} • Ngày {routine?.dayInPlan || 1} trong chuỗi
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Check-in status pill ── */}
        <View style={styles.conditionBanner}>
          <View style={styles.conditionLeft}>
            <Ionicons name="heart-circle" size={22} color={COLORS.primary} />
            <Text style={styles.conditionLabel}>Trạng thái da hôm nay:</Text>
          </View>
          <View style={styles.conditionsPillRow}>
            {conditions.map((cond, i) => (
              <View key={i} style={styles.conditionPill}>
                <Text style={styles.conditionPillText}>{cond}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Override Alert if algorithm intervened ── */}
        {isOverridden && (
          <View style={styles.overrideCard}>
            <View style={styles.overrideCardHeader}>
              <Ionicons name="sparkles" size={16} color="#059669" />
              <Text style={styles.overrideCardTitle}>Thuật toán tự động ghi đè (AI Override)</Text>
            </View>
            <Text style={styles.overrideCardBody}>
              {routine?.overrideReason ||
                'Nền da đang khô rát/kích ứng. Hệ thống đã tạm hoãn BHA/Retinol, thay thế bằng hoạt chất phục hồi (B5/Ceramide) và lùi lịch 1 ngày.'}
            </Text>
          </View>
        )}

        {/* ── Session Switcher: Buổi Sáng (5 bước) / Buổi Tối ── */}
        <View style={styles.sessionTabs}>
          <TouchableOpacity
            style={[styles.sessionTab, session === 'morning' && styles.sessionTabActive]}
            onPress={() => setSession('morning')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="sunny"
              size={18}
              color={session === 'morning' ? '#d97706' : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.sessionTabText,
                session === 'morning' && { color: '#d97706', fontWeight: '700' },
              ]}
            >
              Chu trình Buổi Sáng (5 bước)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sessionTab, session === 'evening' && styles.sessionTabActive]}
            onPress={() => setSession('evening')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="moon"
              size={18}
              color={session === 'evening' ? '#4f46e5' : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.sessionTabText,
                session === 'evening' && { color: '#4f46e5', fontWeight: '700' },
              ]}
            >
              Chu trình Buổi Tối
            </Text>
          </TouchableOpacity>
        </View>

        {session === 'morning' && (
          <View style={styles.sunscreenNotice}>
            <Ionicons name="information-circle" size={16} color="#0284c7" />
            <Text style={styles.sunscreenNoticeText}>
              Bước 5 (Bảo vệ - Kem chống nắng) là bắt buộc vào ban ngày để bảo vệ hàng rào da.
            </Text>
          </View>
        )}

        {/* ── 5 Bước Render Dạng Card Nằm Ngang ── */}
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.stepsList}>
            {stepsToRender.map((step, index) => {
              const product = step.product || step.customProduct || {};
              const productName = product.name || product.productName || 'Sản phẩm chăm sóc';
              const brand = product.brand || 'Dịu nhẹ';
              const usage =
                step.usage ||
                (step.category === 'cleanser'
                  ? 'Tạo bọt với nước ấm, massage nhẹ nhàng 60s'
                  : step.category === 'toner'
                  ? 'Vỗ nhẹ 3-5 giọt lên nền da ẩm'
                  : step.category === 'serum' || step.category === 'treatment'
                  ? 'Thoa 2-3 giọt tinh chất, vỗ đều cho thẩm thấu'
                  : step.category === 'moisturizer'
                  ? 'Thoa một lượng bằng hạt đậu, massage khóa ẩm'
                  : 'Bôi đủ lượng 2 ngón tay trước khi ra nắng 20 phút');

              // Dynamic AI Reason
              const dynamicReason =
                step.reason ||
                `Hoạt chất chuyên biệt giúp duy trì hàng rào bảo vệ cho làn da ${conditions.join(', ')}`;

              return (
                <View
                  key={step._id || index}
                  style={[
                    styles.stepCard,
                    step.isCompleted && styles.stepCardCompleted,
                  ]}
                >
                  {/* LUỒNG 1: Tiêu đề bước (BƯỚC X - TÊN BƯỚC) */}
                  <View style={styles.stream1Row}>
                    <View style={styles.stepTitleWrapper}>
                      <View style={[styles.stepNumberBadge, { backgroundColor: getCategoryBg(step.category) }]}>
                        <Text style={[styles.stepNumberBadgeText, { color: getCategoryTextCol(step.category) }]}>
                          BƯỚC {step.stepNumber}
                        </Text>
                      </View>
                      <Text style={styles.stepNameTitle}>
                        {step.stepName ? step.stepName.toUpperCase() : getStepStandardTitle(step.stepNumber, session)}
                      </Text>
                    </View>

                    {/* Completion Toggle Button */}
                    <TouchableOpacity
                      style={[
                        styles.checkCircle,
                        step.isCompleted && styles.checkCircleActive,
                      ]}
                      onPress={() => handleToggleStep(step.stepNumber)}
                      activeOpacity={0.8}
                    >
                      {step.isCompleted && (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* LUỒNG 2: Icon đại diện + Tên sản phẩm + Hướng dẫn sử dụng */}
                  <View style={styles.stream2Row}>
                    <View style={[styles.productIconBox, { backgroundColor: getCategoryBg(step.category) }]}>
                      <Ionicons
                        name={getCategoryIonicIcon(step.category)}
                        size={26}
                        color={getCategoryTextCol(step.category)}
                      />
                    </View>

                    <View style={styles.productDetailsCol}>
                      <View style={styles.nameAndTagRow}>
                        <Text style={styles.productNameText} numberOfLines={2}>
                          {productName}
                        </Text>
                      </View>
                      <Text style={styles.productBrandText}>{brand}</Text>

                      {/* Hướng dẫn sử dụng */}
                      <View style={styles.usageGuideRow}>
                        <Ionicons name="hand-left-outline" size={12} color={COLORS.textSecondary} />
                        <Text style={styles.usageGuideText} numberOfLines={2}>
                          HDSD: {usage}
                        </Text>
                      </View>

                      {/* External Suggestion Badge if not in closet */}
                      {step.isSuggestedOutside && (
                        <View style={styles.outsideSuggestBadge}>
                          <Ionicons name="cart-outline" size={12} color="#2563eb" />
                          <Text style={styles.outsideSuggestText}>Gợi ý mua ngoài tủ đồ</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* LUỒNG 3: Lý do động (Dynamic AI Reason từ Check-in) */}
                  <View style={styles.stream3ReasonBox}>
                    <Ionicons name="bulb" size={15} color="#d97706" style={{ marginTop: 1 }} />
                    <Text style={styles.dynamicReasonText}>
                      {dynamicReason}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

function getStepStandardTitle(stepNum, session) {
  switch (stepNum) {
    case 1:
      return 'LÀM SẠCH';
    case 2:
      return 'CÂN BẰNG (TONER)';
    case 3:
      return 'ĐẶC TRỊ (SERUM / TREATMENT)';
    case 4:
      return 'DƯỠNG / PHỤC HỒI';
    case 5:
      return 'BẢO VỆ (KEM CHỐNG NẮNG)';
    default:
      return `BƯỚC ${stepNum}`;
  }
}

function getCategoryIonicIcon(cat) {
  switch (cat) {
    case 'cleanser':
      return 'sparkles';
    case 'toner':
      return 'water';
    case 'serum':
    case 'treatment':
      return 'flask';
    case 'moisturizer':
      return 'shield-checkmark';
    case 'sunscreen':
      return 'sunny';
    default:
      return 'cube';
  }
}

function getCategoryBg(cat) {
  switch (cat) {
    case 'cleanser':
      return '#e0f2fe';
    case 'toner':
      return '#e0e7ff';
    case 'serum':
    case 'treatment':
      return '#ffe4e6';
    case 'moisturizer':
      return '#dcfce7';
    case 'sunscreen':
      return '#fef3c7';
    default:
      return '#f1f5f9';
  }
}

function getCategoryTextCol(cat) {
  switch (cat) {
    case 'cleanser':
      return '#0284c7';
    case 'toner':
      return '#4f46e5';
    case 'serum':
    case 'treatment':
      return '#e11d48';
    case 'moisturizer':
      return '#16a34a';
    case 'sunscreen':
      return '#d97706';
    default:
      return '#475569';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  headerDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
  },
  conditionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  conditionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
    marginLeft: 6,
  },
  conditionsPillRow: {
    flexDirection: 'row',
  },
  conditionPill: {
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 4,
  },
  conditionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  overrideCard: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1.5,
    borderColor: '#6ee7b7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  overrideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  overrideCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065f46',
    marginLeft: 6,
  },
  overrideCardBody: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 18,
  },
  sessionTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  sessionTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  sessionTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionTabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  sunscreenNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  sunscreenNoticeText: {
    fontSize: 11,
    color: '#0369a1',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },

  /* Steps List */
  stepsList: {
    marginTop: 4,
  },
  stepCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#edf2f7',
  },
  stepCardCompleted: {
    borderColor: '#a7f3d0',
    backgroundColor: '#fafefc',
  },

  /* Stream 1: Header Row */
  stream1Row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  stepNumberBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  stepNameTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: 0.5,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  /* Stream 2: Icon + Name + Usage */
  stream2Row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productDetailsCol: {
    flex: 1,
  },
  nameAndTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  productNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
    lineHeight: 20,
  },
  productBrandText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  usageGuideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  usageGuideText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 4,
    lineHeight: 16,
    flex: 1,
  },
  outsideSuggestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  outsideSuggestText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563eb',
    marginLeft: 4,
  },

  /* Stream 3: Dynamic AI Reason */
  stream3ReasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  dynamicReasonText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

export default DailyRoutineDetailScreen;
