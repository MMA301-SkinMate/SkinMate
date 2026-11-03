import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { Colors } from '../../constants/theme';
import { getProductIcon } from '../../constants/product-icons';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = Math.max((screenWidth - 62) / 3, 92);

export default function WoodenShelf({ routine, activePlan, onViewDetail, onViewActivePlan }) {
  const steps = routine?.steps || [];

  return (
    <View style={styles.container}>
      {/* Header section above cabinet */}
      <View style={styles.header}>
        <View style={styles.titleWrapper}>
          <Text style={styles.sectionSubtitle}>DAILY ROUTINE HÔM NAY</Text>
          <Text style={styles.sectionTitle}>
            {routine?.planTitle ? routine.planTitle : 'Chu trình chăm sóc da'}
          </Text>
        </View>

        {routine?.dayNumber ? (
          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>Ngày {routine.dayNumber}</Text>
          </View>
        ) : null}
      </View>

      {/* Dynamic Override Alert if routine was shifted or replaced */}
      {routine?.isOverridden && (
        <View style={styles.overrideBanner}>
          <Ionicons name="shield-checkmark" size={16} color="#d97706" />
          <Text style={styles.overrideBannerText} numberOfLines={2}>
            {routine.overrideReason || 'Chu trình được tự động điều chỉnh theo tình trạng da hôm nay.'}
          </Text>
        </View>
      )}

      {/* Stitch Wooden Cabinet & Shelf Component */}
      <View style={styles.cabinet}>
        {/* Cabinet Top Molding */}
        <View style={styles.cabinetTop}>
          <View style={styles.cabinetKnob} />
        </View>

        {/* Shelf Heading */}
        <View style={styles.shelfHeading}>
          <View style={styles.shelfTitleWrap}>
            <View style={styles.shelfAccent} />
            <Text style={styles.shelfTitle}>Kệ Skincare Hôm Nay</Text>
          </View>
          <Text style={styles.shelfCount}>{steps.length} bước</Text>
        </View>

        {/* Product Items Standing on Shelf */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productRow}
        >
          {steps.map((step, index) => {
            const iconObj = getProductIcon(step.productIcon, step.stepKey);
            return (
              <View key={`${step.stepNumber}-${index}`} style={styles.productSlot}>
                {/* Step badge pill */}
                <View style={styles.stepChip}>
                  <Text style={styles.stepChipText}>B{step.stepNumber}</Text>
                </View>

                {/* Bottle Icon */}
                <View style={styles.productIconWrap}>
                  <Image
                    source={iconObj.image}
                    style={styles.productIconImage}
                    resizeMode="contain"
                  />
                  {step.isExternalRecommendation && (
                    <View style={styles.externalBadge}>
                      <Ionicons name="sparkles" size={8} color="#ffffff" />
                      <Text style={styles.externalBadgeText}>Gợi ý ngoài</Text>
                    </View>
                  )}
                </View>

                {/* Product Name Label on Shelf */}
                <Text style={styles.productName} numberOfLines={2}>
                  {step.productName}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Wood Shelf Ledge */}
        <View style={styles.woodShelf}>
          <View style={styles.woodHighlight} />
        </View>

        {/* Cabinet Bottom Molding */}
        <View style={styles.cabinetBottom} />
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionRow}>
        {/* Primary: View Detail Button (Requirement 5) */}
        <TouchableOpacity
          style={styles.viewDetailButton}
          onPress={onViewDetail}
          activeOpacity={0.85}
        >
          <Ionicons name="eye-outline" size={17} color="#ffffff" />
          <Text style={styles.viewDetailText}>Xem chi tiết (View Detail)</Text>
        </TouchableOpacity>

        {/* Small Companion Button opening Active Plan Detail (Requirement 5) */}
        <TouchableOpacity
          style={styles.planCompanionButton}
          onPress={onViewActivePlan}
          activeOpacity={0.8}
          accessibilityLabel="Chuỗi routine đang dùng"
        >
          <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
          <Text style={styles.planCompanionText} numberOfLines={1}>
            {activePlan ? 'Chuỗi đang dùng' : 'Lộ trình chuỗi'}
          </Text>
          <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 8,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  dayBadge: {
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#ccfbf1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  overrideBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
    gap: 6,
  },
  overrideBannerText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
    flex: 1,
  },
  // Authentic Stitch Wood Cabinet
  cabinet: {
    marginHorizontal: -4,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: '#8B3F0A',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6C2F08',
    shadowColor: '#482006',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 14,
  },
  cabinetTop: {
    height: 12,
    borderRadius: 5,
    backgroundColor: '#B65B17',
    marginBottom: 8,
    borderTopWidth: 2,
    borderTopColor: '#D47A2C',
  },
  cabinetKnob: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#F2BC65',
    marginLeft: 8,
    marginTop: 1,
  },
  shelfHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  shelfTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shelfAccent: {
    width: 4,
    height: 13,
    borderRadius: 2,
    backgroundColor: '#F4A261',
    marginRight: 6,
  },
  shelfTitle: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '700',
  },
  shelfCount: {
    color: '#FDE7CF',
    fontSize: 11,
    fontWeight: '600',
  },
  productRow: {
    gap: 10,
    paddingHorizontal: 2,
    paddingTop: 4,
    paddingBottom: 4,
    alignItems: 'flex-end',
  },
  productSlot: {
    width: CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  stepChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  stepChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textLight,
  },
  productIconWrap: {
    width: 58,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  productIconImage: {
    width: '100%',
    height: '100%',
  },
  externalBadge: {
    position: 'absolute',
    top: -2,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  externalBadgeText: {
    fontSize: 7,
    fontWeight: '700',
    color: '#ffffff',
  },
  productName: {
    width: '100%',
    color: Colors.textLight,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
    textAlign: 'center',
    minHeight: 24,
  },
  woodShelf: {
    height: 11,
    borderRadius: 3,
    backgroundColor: '#A8470A',
    marginTop: 4,
    shadowColor: '#7F3504',
    shadowOpacity: 0.27,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  woodHighlight: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CB6720',
    marginHorizontal: 1,
  },
  cabinetBottom: {
    height: 10,
    marginHorizontal: -1,
    marginTop: 4,
    borderRadius: 4,
    backgroundColor: '#A94A0B',
    borderTopWidth: 2,
    borderTopColor: '#D47A2C',
  },
  // Buttons
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewDetailButton: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  viewDetailText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  planCompanionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#99f6e4',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  planCompanionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});

