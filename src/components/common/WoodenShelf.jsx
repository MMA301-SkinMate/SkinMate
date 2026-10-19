import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ProductBottle } from './ProductBottle';
import { Icon } from './Icon';

export const WoodenShelf = ({
  products = [],
  session = 'morning',
  onSelectSession,
  onViewDetail,
  onViewChainDetail,
  isEmpty = false,
  onEmptySuggestPress,
  treatmentDayNumber = 3,
  totalDays = 14,
  treatmentName = 'Chuỗi Trị Mụn 14 ngày',
}) => {
  return (
    <View style={styles.wrapper}>
      {/* Shelf Header & Session Switcher */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.sectionSubtitle}>DAILY ROUTINE HÔM NAY</Text>
          <Text style={styles.sectionTitle}>Kệ Dưỡng Da Cá Nhân</Text>
        </View>

        {/* Morning / Evening Toggle */}
        <View style={styles.sessionToggle}>
          <TouchableOpacity
            style={[styles.sessionBtn, session === 'morning' && styles.sessionBtnActive]}
            onPress={() => onSelectSession('morning')}
            activeOpacity={0.8}
          >
            <Icon
              name="sun"
              size={14}
              color={session === 'morning' ? '#d97706' : '#94a3b8'}
            />
            <Text
              style={[
                styles.sessionBtnText,
                session === 'morning' && styles.sessionBtnTextActive,
              ]}
            >
              Sáng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sessionBtn, session === 'evening' && styles.sessionBtnActiveNight]}
            onPress={() => onSelectSession('evening')}
            activeOpacity={0.8}
          >
            <Icon
              name="moon"
              size={14}
              color={session === 'evening' ? '#6366f1' : '#94a3b8'}
            />
            <Text
              style={[
                styles.sessionBtnText,
                session === 'evening' && styles.sessionBtnTextActiveNight,
              ]}
            >
              Tối
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Case 1: Empty state (Chưa có gì thì hiện 'Gợi ý chu trình skincare phù hợp') */}
      {isEmpty || products.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Icon name="sparkles" size={28} color="#e11d48" />
          </View>
          <Text style={styles.emptyTitle}>Chưa có sản phẩm trong chu trình hôm nay</Text>
          <Text style={styles.emptyDesc}>
            Hãy để AI phân tích và đề xuất bộ sản phẩm chuẩn y khoa phù hợp với hồ sơ da của bạn.
          </Text>
          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={onEmptySuggestPress}
            activeOpacity={0.85}
          >
            <Icon name="zap" size={16} color="#ffffff" />
            <Text style={styles.emptyActionBtnText}>Gợi ý chu trình skincare phù hợp</Text>
            <Icon name="chevron-right" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : (
        /* Case 2: Populated Wooden Shelf */
        <View style={styles.shelfContainer}>
          {/* Bottles Row sitting on the shelf */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bottlesScroll}
          >
            {products.map((prod, index) => (
              <ProductBottle
                key={`${prod.id}-${index}`}
                product={prod}
                stepNumber={index + 1}
                onPress={onViewDetail}
              />
            ))}
          </ScrollView>

          {/* Luxury 3D Wooden Plank Representation */}
          <View style={styles.woodPlankStructure}>
            {/* Top highlight chamfer edge */}
            <View style={styles.woodTopBevel} />
            {/* Front wooden face with grain stripes */}
            <View style={styles.woodPlankFace}>
              <View style={styles.woodGrainLine1} />
              <View style={styles.woodGrainLine2} />
              <Text style={styles.woodBrandTag}>SKINCARE COLLECTION • WOODEN SHELF</Text>
            </View>
            {/* Bottom depth drop shadow */}
            <View style={styles.woodBottomShadow} />
          </View>

          {/* Action Row below shelf */}
          <View style={styles.actionRow}>
            {/* Main Button: View Daily Routine Detail */}
            <TouchableOpacity
              style={styles.mainDetailBtn}
              onPress={onViewDetail}
              activeOpacity={0.85}
            >
              <Icon name="eye" size={16} color="#ffffff" />
              <Text style={styles.mainDetailBtnText}>Xem Chi Tiết Chu Trình</Text>
              <Icon name="chevron-right" size={16} color="#ffffff" />
            </TouchableOpacity>

            {/* Sub Button: Nút nhỏ cạnh View routine daily detail mở ra Chuỗi routine đang dùng */}
            <TouchableOpacity
              style={styles.chainQuickBtn}
              onPress={onViewChainDetail}
              activeOpacity={0.85}
            >
              <View style={styles.chainDotPulse} />
              <View style={styles.chainTextCol}>
                <Text style={styles.chainLabel}>CHUỖI ĐANG DÙNG</Text>
                <Text style={styles.chainProgress}>
                  Ngày {treatmentDayNumber}/{totalDays}
                </Text>
              </View>
              <Icon name="layers" size={16} color="#0f766e" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleGroup: {
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#e11d48',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  sessionToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 3,
  },
  sessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    gap: 4,
  },
  sessionBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sessionBtnActiveNight: {
    backgroundColor: '#1e1b4b',
  },
  sessionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  sessionBtnTextActive: {
    color: '#b45309',
  },
  sessionBtnTextActiveNight: {
    color: '#ffffff',
  },

  // Populated Shelf
  shelfContainer: {
    paddingTop: 8,
    position: 'relative',
  },
  bottlesScroll: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },

  // Wood Plank
  woodPlankStructure: {
    marginTop: -4,
    marginHorizontal: 12,
  },
  woodTopBevel: {
    height: 6,
    backgroundColor: '#e6c89c', // light honey oak highlight
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  woodPlankFace: {
    height: 22,
    backgroundColor: '#b8864e', // rich natural warm wood
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  woodGrainLine1: {
    position: 'absolute',
    top: 5,
    left: '10%',
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  woodGrainLine2: {
    position: 'absolute',
    bottom: 5,
    left: '15%',
    width: '70%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  woodBrandTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6e451c',
    letterSpacing: 1.5,
    opacity: 0.8,
  },
  woodBottomShadow: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    marginTop: 1,
    marginHorizontal: 6,
  },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  mainDetailBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  mainDetailBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  chainQuickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ccfbf1',
    borderWidth: 1,
    borderColor: '#99f6e4',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 6,
  },
  chainDotPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0d9488',
  },
  chainTextCol: {
    flex: 1,
  },
  chainLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#0f766e',
    letterSpacing: 0.5,
  },
  chainProgress: {
    fontSize: 11,
    fontWeight: '700',
    color: '#134e4a',
  },

  // Empty State Card
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e11d48',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  emptyActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
