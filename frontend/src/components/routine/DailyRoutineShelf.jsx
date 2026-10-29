import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * 15. View Daily Routine
 * - Chưa có gì thì hiện 'Gợi ý chu trình skincare phù hợp' => click vào => 'Gợi ý chuỗi routine'
 * - Có sản phẩm trong daily routine => cái kệ gỗ với các icon sản phẩm và tên sản phẩm xếp theo chiều ngang => Button View Detail
 * - Có một nút nhỏ cạnh View routine daily detail mở ra Chuỗi routine đang dùng => chuyển đến View chuỗi routine detail
 */
export const DailyRoutineShelf = ({
  dailyRoutine,
  onViewDetail,
  onOpenActivePlan,
  onSuggestRoutine,
}) => {
  const [activeTab, setActiveTab] = useState('morning'); // 'morning' | 'evening'

  const morningSteps = dailyRoutine?.morningSteps || [];
  const eveningSteps = dailyRoutine?.eveningSteps || [];
  const currentSteps = activeTab === 'morning' ? morningSteps : eveningSteps;

  const hasProducts = currentSteps.length > 0;

  // Trạng thái chưa có routine
  if (!dailyRoutine || (!morningSteps.length && !eveningSteps.length)) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="sparkles" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>Chưa có chu trình hôm nay</Text>
        <Text style={styles.emptySubtitle}>
          Hãy khám phá phác đồ chăm sóc da chuẩn y khoa dành riêng cho tình trạng da của bạn.
        </Text>
        <TouchableOpacity
          style={styles.suggestButton}
          onPress={onSuggestRoutine}
          activeOpacity={0.85}
        >
          <Ionicons name="bulb-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.suggestButtonText}>Gợi ý chu trình skincare phù hợp</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.shelfWrapper}>
      {/* Shelf Header */}
      <View style={styles.shelfHeaderRow}>
        <View>
          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>DAILY ROUTINE HÔM NAY</Text>
          </View>
          <Text style={styles.shelfTitle}>Kệ Dưỡng Da Của Bạn</Text>
        </View>

        {/* Morning / Evening Switch */}
        <View style={styles.sessionToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'morning' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('morning')}
          >
            <Ionicons
              name="sunny"
              size={14}
              color={activeTab === 'morning' ? '#d97706' : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.toggleBtnText,
                activeTab === 'morning' && { color: '#d97706', fontWeight: '700' },
              ]}
            >
              Sáng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'evening' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('evening')}
          >
            <Ionicons
              name="moon"
              size={14}
              color={activeTab === 'evening' ? '#4f46e5' : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.toggleBtnText,
                activeTab === 'evening' && { color: '#4f46e5', fontWeight: '700' },
              ]}
            >
              Tối
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Override Alert Banner if daily routine is overridden */}
      {dailyRoutine.isOverridden && (
        <View style={styles.overrideAlert}>
          <Ionicons name="shield-checkmark" size={16} color="#059669" />
          <Text style={styles.overrideAlertText} numberOfLines={2}>
            {dailyRoutine.overrideReason ||
              'Thuật toán đã tự động thay thế hoạt chất mạnh bằng serum làm dịu phục hồi da.'}
          </Text>
        </View>
      )}

      {/* Cái kệ gỗ với các icon và tên sản phẩm xếp theo chiều ngang */}
      <View style={styles.woodShelfContainer}>
        {/* Top items on shelf */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shelfItemsContent}
        >
          {currentSteps.map((step, idx) => {
            const product = step.product || step.customProduct || {};
            const productName = product.name || product.productName || step.stepName;
            const brand = product.brand || 'Dịu nhẹ';

            return (
              <View key={step._id || idx} style={styles.productSlot}>
                {/* Step badge */}
                <View style={styles.stepNumBadge}>
                  <Text style={styles.stepNumText}>B{step.stepNumber}</Text>
                </View>

                {/* Product bottle/jar illustration */}
                <View style={styles.bottleVisual}>
                  <View style={styles.bottleCap} />
                  <View style={[styles.bottleBody, { backgroundColor: getCategoryColor(step.category) }]}>
                    <Ionicons
                      name={getCategoryIcon(step.category)}
                      size={20}
                      color="#ffffff"
                    />
                  </View>
                </View>

                {/* Product Name */}
                <Text style={styles.slotProductName} numberOfLines={2}>
                  {productName}
                </Text>
                <Text style={styles.slotBrand} numberOfLines={1}>
                  {brand}
                </Text>

                {/* External Suggestion Tag if outside closet */}
                {step.isSuggestedOutside && (
                  <View style={styles.suggestTag}>
                    <Text style={styles.suggestTagText}>Gợi ý ngoài</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* The Wooden Shelf Surface (Mặt kệ gỗ) */}
        <View style={styles.woodPlank}>
          <View style={styles.woodGrainLine} />
        </View>
        <View style={styles.woodPlankShadow} />
      </View>

      {/* Bottom Actions: Button View Detail & Button Chuỗi Routine */}
      <View style={styles.actionRow}>
        {/* Button View Detail */}
        <TouchableOpacity
          style={styles.viewDetailBtn}
          onPress={onViewDetail}
          activeOpacity={0.85}
        >
          <Text style={styles.viewDetailBtnText}>Xem chi tiết chu trình</Text>
          <Ionicons name="arrow-forward" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {/* Nút nhỏ cạnh View routine daily detail mở ra Chuỗi routine đang dùng */}
        <TouchableOpacity
          style={styles.planShortcutBtn}
          onPress={onOpenActivePlan}
          activeOpacity={0.85}
          accessibilityLabel="Chuỗi routine đang dùng"
        >
          <Ionicons name="calendar" size={18} color={COLORS.primary} />
          <Text style={styles.planShortcutText}>Chuỗi</Text>
          <View style={styles.miniBadge}>
            <Text style={styles.miniBadgeText}>N{dailyRoutine.dayInPlan || 1}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function getCategoryIcon(cat) {
  switch (cat) {
    case 'cleanser':
      return 'sparkles-outline';
    case 'toner':
      return 'water-outline';
    case 'serum':
    case 'treatment':
      return 'color-wand-outline';
    case 'moisturizer':
      return 'shield-checkmark-outline';
    case 'sunscreen':
      return 'sunny-outline';
    default:
      return 'flask-outline';
  }
}

function getCategoryColor(cat) {
  switch (cat) {
    case 'cleanser':
      return '#38bdf8';
    case 'toner':
      return '#818cf8';
    case 'serum':
    case 'treatment':
      return '#f43f5e';
    case 'moisturizer':
      return '#34d399';
    case 'sunscreen':
      return '#fbbf24';
    default:
      return '#0f766e';
  }
}

const styles = StyleSheet.create({
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e6fffa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  suggestButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  shelfWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  shelfHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
    letterSpacing: 0.6,
  },
  shelfTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  sessionToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleBtnText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },

  overrideAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  overrideAlertText: {
    fontSize: 11,
    color: '#065f46',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },

  /* Wood shelf design */
  woodShelfContainer: {
    marginVertical: 6,
    paddingTop: 8,
  },
  shelfItemsContent: {
    paddingHorizontal: 6,
    alignItems: 'flex-end',
  },
  productSlot: {
    width: 100,
    alignItems: 'center',
    marginRight: 14,
    paddingBottom: 6,
  },
  stepNumBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  stepNumText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  bottleVisual: {
    alignItems: 'center',
    marginBottom: 8,
  },
  bottleCap: {
    width: 14,
    height: 8,
    backgroundColor: '#cbd5e1',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  bottleBody: {
    width: 38,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  slotProductName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMain,
    textAlign: 'center',
    lineHeight: 14,
    height: 28,
  },
  slotBrand: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  suggestTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 4,
  },
  suggestTagText: {
    fontSize: 8,
    color: '#2563eb',
    fontWeight: '700',
  },

  /* Wooden Plank */
  woodPlank: {
    height: 14,
    backgroundColor: '#b45309', // warm wooden tone
    borderRadius: 3,
    marginTop: 4,
    justifyContent: 'center',
    shadowColor: '#78350f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  woodGrainLine: {
    height: 1,
    backgroundColor: '#92400e',
    marginHorizontal: 10,
  },
  woodPlankShadow: {
    height: 6,
    backgroundColor: '#451a03',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    opacity: 0.35,
  },

  /* Action Buttons */
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  viewDetailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 12,
    marginRight: 10,
  },
  viewDetailBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  planShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  planShortcutText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
    marginRight: 4,
  },
  miniBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  miniBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default DailyRoutineShelf;
