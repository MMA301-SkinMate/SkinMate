import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import routineApi from '../../api/routineApi';

/**
 * 15. Gợi ý chuỗi routine
 * Hiển thị phác đồ gợi ý (7-14 ngày) dựa trên tình trạng da
 * Cho phép kích hoạt chuỗi để trở thành Active Treatment Plan
 */
export const SuggestRoutineScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState('Nổi mụn');

  const conditionsList = ['Bình thường', 'Nổi mụn', 'Khô rát', 'Kích ứng', 'Bóng dầu'];

  useEffect(() => {
    loadSuggestion(selectedCondition);
  }, [selectedCondition]);

  const loadSuggestion = async (cond) => {
    try {
      setLoading(true);
      const res = await routineApi.suggestRoutinePlan(cond);
      if (res && res.data) {
        setSuggestion(res.data);
      }
    } catch (err) {
      console.warn('Lỗi tải gợi ý chuỗi routine:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPlan = async () => {
    if (!suggestion) return;
    try {
      setActivating(true);
      await routineApi.applySuggestedPlan(suggestion);
      Alert.alert(
        'Thành công',
        'Đã kích hoạt chuỗi routine mới! Hệ thống đã tự động sắp xếp sản phẩm vào lịch trình của bạn.',
        [{ text: 'Về trang chủ', onPress: () => navigation.navigate('Home') }]
      );
    } catch (err) {
      console.warn('Lỗi áp dụng chuỗi:', err.message);
      Alert.alert('Lỗi', err.message || 'Không thể kích hoạt chuỗi routine.');
    } finally {
      setActivating(false);
    }
  };

  const schedule = suggestion?.schedule || [];

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
        <Text style={styles.headerTitle}>Gợi Ý Chuỗi Routine</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Condition Filter Bar */}
        <Text style={styles.filterTitle}>Chọn mục tiêu cải thiện làn da:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {conditionsList.map((c) => {
            const isSelected = selectedCondition === c;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.condChip, isSelected && styles.condChipActive]}
                onPress={() => setSelectedCondition(c)}
              >
                <Text style={[styles.condChipText, isSelected && styles.condChipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <View>
            {/* Plan Info Card */}
            <View style={styles.planCard}>
              <View style={styles.daysBadge}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
                <Text style={styles.daysBadgeText}>Chu kỳ {suggestion?.totalDays || 14} ngày</Text>
              </View>
              <Text style={styles.planTitle}>{suggestion?.title}</Text>
              <Text style={styles.planDesc}>{suggestion?.description}</Text>
            </View>

            {/* Schedule Preview */}
            <Text style={styles.previewTitle}>Lộ trình mẫu từng ngày:</Text>
            {schedule.slice(0, 5).map((dayItem) => (
              <View key={dayItem.day} style={styles.dayPreviewRow}>
                <View style={styles.dayBadgeCircle}>
                  <Text style={styles.dayBadgeNum}>{dayItem.day}</Text>
                  <Text style={styles.dayBadgeSub}>NGÀY</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.dayPreviewName}>
                    Sáng: {dayItem.morningSteps?.length || 5} bước • Tối: {dayItem.eveningSteps?.length || 4} bước
                  </Text>
                  <Text style={styles.dayPreviewDetail} numberOfLines={1}>
                    Đặc trị: {dayItem.eveningSteps?.find((s) => s.category === 'treatment')?.customProduct?.name || 'Phục hồi nhẹ'}
                  </Text>
                </View>
              </View>
            ))}

            {schedule.length > 5 && (
              <Text style={styles.moreDaysNotice}>
                + còn {schedule.length - 5} ngày tiếp theo được cá nhân hóa trong chu kỳ...
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Activate Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          style={styles.activateButton}
          onPress={handleApplyPlan}
          disabled={activating || loading}
          activeOpacity={0.85}
        >
          {activating ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.activateButtonText}>Kích hoạt chuỗi routine này</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  scrollContent: {
    padding: 16,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  filterScroll: {
    marginBottom: 16,
  },
  condChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  condChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  condChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  condChipTextActive: {
    color: '#ffffff',
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  daysBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 6,
  },
  planDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 10,
  },
  dayPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  dayBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadgeNum: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  dayBadgeSub: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  dayPreviewName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  dayPreviewDetail: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  moreDaysNotice: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  activateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  activateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default SuggestRoutineScreen;
