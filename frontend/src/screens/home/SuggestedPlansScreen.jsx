import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useRoutine } from '../../context/RoutineContext';

export default function SuggestedPlansScreen({ navigation }) {
  const { suggestedPlans, isRoutineLoading } = useRoutine();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gợi Ý Chuỗi Routine</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introBox}>
          <Text style={styles.introHeading}>Lộ trình Skincare Chuyên Sâu</Text>
          <Text style={styles.introDesc}>
            Các chuỗi routine được thiết kế khoa học, xen kẽ ngày điều trị hoạt chất mạnh và phục hồi màng ẩm để tối ưu hiệu quả cho từng loại da.
          </Text>
        </View>

        {isRoutineLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.planList}>
            {suggestedPlans.map(plan => (
              <TouchableOpacity
                key={plan._id}
                style={styles.planCard}
                onPress={() => navigation.navigate('TreatmentPlanDetail', { plan })}
                activeOpacity={0.88}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.durationTag}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
                    <Text style={styles.durationTagText}>{plan.totalDays} ngày</Text>
                  </View>
                  <View style={styles.skinTypeTag}>
                    <Text style={styles.skinTypeTagText}>
                      {(plan.targetSkinTypes || []).join(', ')}
                    </Text>
                  </View>
                </View>

                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planDescription} numberOfLines={3}>
                  {plan.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.stepsCount}>
                    <Ionicons name="layers-outline" size={14} color="#64748b" />
                    <Text style={styles.stepsCountText}>
                      {plan.days?.length || plan.totalDays} ngày lộ trình
                    </Text>
                  </View>

                  <View style={styles.detailBtn}>
                    <Text style={styles.detailBtnText}>Xem chi tiết</Text>
                    <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    padding: 16,
  },
  introBox: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  introHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  introDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    lineHeight: 19,
  },
  planList: {
    gap: 14,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  durationTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  skinTypeTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skinTypeTagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  planDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 10,
  },
  stepsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepsCountText: {
    fontSize: 12,
    color: '#64748b',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

