import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Header } from '../common/Header';
import { ProductBottle } from '../common/ProductBottle';
import { Icon } from '../common/Icon';
import { useSkinApp } from '../../context/SkinAppContext';

export const RoutineChainDetailScreen = () => {
  const {
    treatmentPlan,
    getProductById,
    setCurrentScreen,
  } = useSkinApp();

  const [activeDayIndex, setActiveDayIndex] = useState(treatmentPlan.currentDay - 1); // 0-indexed (Ngày 3 -> index 2)

  const selectedDay = treatmentPlan.days[activeDayIndex] || treatmentPlan.days[0];
  const morningProducts = (selectedDay.morning || []).map(getProductById).filter(Boolean);
  const eveningProducts = (selectedDay.evening || []).map(getProductById).filter(Boolean);

  const isToday = selectedDay.dayNumber === treatmentPlan.currentDay;

  return (
    <View style={styles.container}>
      <Header
        title="Chuỗi Routine Điều Trị"
        subtitle={`${treatmentPlan.name} • ${treatmentPlan.totalDays} Ngày`}
        showBack={true}
        onBack={() => setCurrentScreen('Home')}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Plan Header Card */}
        <View style={styles.planCard}>
          <View style={styles.planTopRow}>
            <View style={styles.planTagWrap}>
              <Icon name="layers" size={13} color="#0f766e" />
              <Text style={styles.planTagText}>PHÁC ĐỒ CHUẨN DA LIỄU</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>
                Đang ở Ngày {treatmentPlan.currentDay}/{treatmentPlan.totalDays}
              </Text>
            </View>
          </View>

          <Text style={styles.planTitle}>{treatmentPlan.name}</Text>
          <Text style={styles.planGoal}>Mục tiêu: {treatmentPlan.targetGoal}</Text>

          {/* Timeline Days Picker (Horizontal Scroll) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysScroll}
          >
            {treatmentPlan.days.map((day, idx) => {
              const isSelectedDay = idx === activeDayIndex;
              const isTodayDay = day.dayNumber === treatmentPlan.currentDay;
              const isPastDay = day.dayNumber < treatmentPlan.currentDay;

              return (
                <TouchableOpacity
                  key={day.dayNumber}
                  style={[
                    styles.dayChip,
                    isSelectedDay && styles.dayChipActive,
                    isTodayDay && styles.dayChipTodayBorder,
                  ]}
                  onPress={() => setActiveDayIndex(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayChipNum, isSelectedDay && styles.dayChipNumActive]}>
                    N.{day.dayNumber}
                  </Text>
                  {isTodayDay && <View style={styles.todaySmallDot} />}
                  {isPastDay && (
                    <Icon name="check" size={10} color="#10b981" strokeWidth={3} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Selected Day Header Detail */}
        <View style={styles.selectedDayHeader}>
          <View style={styles.selectedDayTitleRow}>
            <Text style={styles.selectedDayNum}>NGÀY THỨ {selectedDay.dayNumber}</Text>
            {isToday && (
              <View style={styles.todayBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.todayBadgeText}>Hôm nay</Text>
              </View>
            )}
          </View>
          <Text style={styles.selectedDayFocusTitle}>{selectedDay.title}</Text>
          <Text style={styles.selectedDayFocusSub}>Trọng tâm: {selectedDay.focus}</Text>
        </View>

        {/* 17. Hiển thị chuỗi routine theo ngày và mỗi ngày chia theo buổi sáng, tối */}
        {/* SECTION 1: BUỔI SÁNG */}
        <View style={styles.sessionSection}>
          <View style={styles.sessionHeaderRow}>
            <View style={styles.sessionIconDay}>
              <Icon name="sun" size={16} color="#d97706" />
            </View>
            <View style={styles.sessionHeaderTextCol}>
              <Text style={styles.sessionName}>Buổi Sáng ({morningProducts.length} bước)</Text>
              <Text style={styles.sessionSub}>Bảo vệ & Kiềm dầu</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sessionBottlesScroll}
          >
            {morningProducts.map((prod, pIdx) => (
              <ProductBottle
                key={`${prod.id}-m-${pIdx}`}
                product={prod}
                stepNumber={pIdx + 1}
                compact={false}
                onPress={() => setCurrentScreen('DailyRoutineDetail')}
              />
            ))}
          </ScrollView>
        </View>

        {/* SECTION 2: BUỔI TỐI */}
        <View style={styles.sessionSection}>
          <View style={styles.sessionHeaderRow}>
            <View style={styles.sessionIconNight}>
              <Icon name="moon" size={16} color="#6366f1" />
            </View>
            <View style={styles.sessionHeaderTextCol}>
              <Text style={styles.sessionName}>Buổi Tối ({eveningProducts.length} bước)</Text>
              <Text style={styles.sessionSub}>Thanh lọc sâu & Phục hồi biểu bì</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sessionBottlesScroll}
          >
            {eveningProducts.map((prod, pIdx) => (
              <ProductBottle
                key={`${prod.id}-e-${pIdx}`}
                product={prod}
                stepNumber={pIdx + 1}
                compact={false}
                onPress={() => setCurrentScreen('DailyRoutineDetail')}
              />
            ))}
          </ScrollView>
        </View>

        {/* 17. Distinct Button: Add / Edit (Mở màn hình 18) */}
        <View style={styles.actionButtonGroup}>
          <TouchableOpacity
            style={styles.addEditBtn}
            onPress={() => setCurrentScreen('AddEditRoutine')}
            activeOpacity={0.85}
          >
            <Icon name="edit" size={18} color="#ffffff" />
            <Text style={styles.addEditBtnText}>Add / Edit Sản Phẩm Vào Chuỗi</Text>
            <Icon name="chevron-right" size={18} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity
              style={styles.actionOutlineBtn}
              onPress={() => setCurrentScreen('DailyRoutineDetail')}
              activeOpacity={0.8}
            >
              <Icon name="eye" size={15} color="#1e293b" />
              <Text style={styles.actionOutlineText}>Xem Chi Tiết 5 Bước</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionOutlineBtn}
              onPress={() => alert('Đã sao chép liên kết chia sẻ chuỗi routine lên Community!')}
              activeOpacity={0.8}
            >
              <Icon name="share" size={15} color="#0f766e" />
              <Text style={[styles.actionOutlineText, { color: '#0f766e' }]}>Chia Sẻ Chuỗi</Text>
            </TouchableOpacity>
          </View>
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
  planCard: {
    backgroundColor: '#f0fdfa',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#99f6e4',
    marginBottom: 16,
  },
  planTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  planTagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f766e',
    letterSpacing: 0.8,
  },
  streakBadge: {
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#134e4a',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  planGoal: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 14,
  },

  daysScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  dayChip: {
    width: 44,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    position: 'relative',
  },
  dayChipActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
    shadowColor: '#0f766e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  dayChipTodayBorder: {
    borderColor: '#e11d48',
  },
  dayChipNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  dayChipNumActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  todaySmallDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#e11d48',
    marginTop: 2,
  },

  // Selected Day Header
  selectedDayHeader: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  selectedDayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  selectedDayNum: {
    fontSize: 10,
    fontWeight: '800',
    color: '#e11d48',
    letterSpacing: 1,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    gap: 4,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#e11d48',
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#e11d48',
  },
  selectedDayFocusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  selectedDayFocusSub: {
    fontSize: 11,
    color: '#64748b',
  },

  // Sessions
  sessionSection: {
    marginBottom: 16,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sessionIconDay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionIconNight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionHeaderTextCol: {
    flex: 1,
  },
  sessionName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
  },
  sessionSub: {
    fontSize: 10,
    color: '#64748b',
  },
  sessionBottlesScroll: {
    paddingVertical: 4,
  },

  // Actions
  actionButtonGroup: {
    marginTop: 8,
    gap: 10,
  },
  addEditBtn: {
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
    elevation: 4,
  },
  addEditBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionOutlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  actionOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
});
