import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Header } from '../common/Header';
import { WoodenShelf } from '../common/WoodenShelf';
import { Icon } from '../common/Icon';
import { useSkinApp } from '../../context/SkinAppContext';

export const DailyRoutineScreen = () => {
  const {
    analysisResult,
    selectedSession,
    setSelectedSession,
    treatmentPlan,
    setCurrentScreen,
    isRoutineEmpty,
    setIsRoutineEmpty,
  } = useSkinApp();

  const currentProducts = isRoutineEmpty
    ? []
    : analysisResult?.adaptedSchedule?.[selectedSession] || [];

  return (
    <View style={styles.container}>
      <Header
        title="Daily Routine Hôm Nay"
        subtitle="Chu trình chăm sóc da được tối ưu hóa theo tình trạng thực tế"
        showBack={true}
        onBack={() => setCurrentScreen('Home')}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* State Toggle for Demo/Testing: Đã có sản phẩm vs Chưa có gì */}
        <View style={styles.stateTestingBar}>
          <View style={styles.stateTestingTextCol}>
            <Text style={styles.stateTestingTitle}>Chế độ kiểm thử (Theo Sheet Function):</Text>
            <Text style={styles.stateTestingSub}>
              {isRoutineEmpty
                ? 'Đang xem: Trạng thái chưa có sản phẩm (hiện gợi ý)'
                : 'Đang xem: Trạng thái kệ gỗ có sản phẩm'}
            </Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Trống</Text>
            <Switch
              value={!isRoutineEmpty}
              onValueChange={(val) => setIsRoutineEmpty(!val)}
              trackColor={{ false: '#cbd5e1', true: '#fca5a5' }}
              thumbColor={!isRoutineEmpty ? '#e11d48' : '#f8fafc'}
            />
            <Text style={styles.toggleLabel}>Có SP</Text>
          </View>
        </View>

        {/* Info summary card */}
        <View style={styles.statusSummaryCard}>
          <View style={styles.statusLeft}>
            <View style={styles.statusIconWrap}>
              <Icon
                name={selectedSession === 'morning' ? 'sun' : 'moon'}
                size={20}
                color={selectedSession === 'morning' ? '#d97706' : '#6366f1'}
              />
            </View>
            <View>
              <Text style={styles.statusSessionTitle}>
                Chu Trình Buổi {selectedSession === 'morning' ? 'Sáng' : 'Tối'}
              </Text>
              <Text style={styles.statusSessionMeta}>
                {currentProducts.length} bước • Dự kiến 5-8 phút
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.recheckBtn}
            onPress={() => setCurrentScreen('Checkin')}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={13} color="#e11d48" />
            <Text style={styles.recheckBtnText}>Check-in lại</Text>
          </TouchableOpacity>
        </View>

        {/* 15. The Wooden Shelf (Cái kệ gỗ với các icon và tên sản phẩm xếp theo chiều ngang) */}
        <WoodenShelf
          products={currentProducts}
          session={selectedSession}
          onSelectSession={setSelectedSession}
          isEmpty={isRoutineEmpty}
          onEmptySuggestPress={() => setCurrentScreen('RoutineChainDetail')}
          onViewDetail={() => setCurrentScreen('DailyRoutineDetail')}
          onViewChainDetail={() => setCurrentScreen('RoutineChainDetail')}
          treatmentDayNumber={treatmentPlan.currentDay}
          totalDays={treatmentPlan.totalDays}
          treatmentName={treatmentPlan.name}
        />

        {/* Quick Tips according to Session */}
        <View style={styles.tipsCard}>
          <View style={styles.tipHeader}>
            <Icon name="info" size={16} color="#0f766e" />
            <Text style={styles.tipTitle}>
              {selectedSession === 'morning'
                ? 'Lưu ý buổi sáng quan trọng'
                : 'Lưu ý phục hồi ban đêm'}
            </Text>
          </View>
          <Text style={styles.tipDesc}>
            {selectedSession === 'morning'
              ? 'Bắt buộc hoàn thành Bước 5 (Kem chống nắng SPF50+) trước khi ra đường 20 phút để bảo vệ da đang điều trị.'
              : 'Đêm nay đã thay thế BHA bằng Serum B5 làm dịu. Khóa ẩm kỹ với kem dưỡng Bioderma để nuôi dưỡng màng da suốt giấc ngủ.'}
          </Text>
        </View>

        {/* Action cards */}
        <View style={styles.linksRow}>
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => setCurrentScreen('AddEditRoutine')}
            activeOpacity={0.8}
          >
            <View style={styles.linkIconCircle}>
              <Icon name="plus" size={16} color="#ffffff" />
            </View>
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>Thêm/Sửa sản phẩm</Text>
              <Text style={styles.linkSub}>Tùy chỉnh các bước trong ngày</Text>
            </View>
            <Icon name="chevron-right" size={16} color="#94a3b8" />
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
    paddingBottom: 30,
  },
  stateTestingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  stateTestingTextCol: {
    flex: 1,
  },
  stateTestingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  stateTestingSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  statusSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  statusSessionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusSessionMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  recheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  recheckBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e11d48',
  },

  tipsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#f0fdfa',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f766e',
  },
  tipDesc: {
    fontSize: 11,
    color: '#134e4a',
    lineHeight: 16,
  },

  linksRow: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  linkIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e11d48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTextCol: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  linkSub: {
    fontSize: 11,
    color: '#64748b',
  },
});
