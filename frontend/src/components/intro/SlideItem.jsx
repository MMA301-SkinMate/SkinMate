import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScanVisualCard from './ScanVisualCard';
import RoutineVisualCard from './RoutineVisualCard';
import ProfileVisualCard from './ProfileVisualCard';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const VISUAL_SLIDERS = {
  scan: ScanVisualCard,
  routine: RoutineVisualCard,
  profile: ProfileVisualCard,
};

const getTagColor = (type) => {
  switch (type) {
    case 'warning':
      return COLORS.warning;
    case 'danger':
      return COLORS.error;
    default:
      return COLORS.primary;
  }
};

const SlideItem = ({ item }) => {
  const VisualComponent = VISUAL_SLIDERS[item.slideType];

  return (
    <View style={styles.slideItem}>
      {/* Top Visual Card */}
      {VisualComponent ? <VisualComponent /> : null}

      {/* Text & Feature Highlights */}
      <View style={styles.contentSection}>
        {/* Badge */}
        <View style={styles.badgeWrapper}>
          <View style={styles.badge}>
            <Ionicons name={item.badgeIcon} size={SIZES.small + 1} color={COLORS.primary} />
            <Text style={styles.badgeText}>{item.badgeText}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.slideTitle}>{item.title}</Text>

        {/* Description */}
        <Text style={styles.slideDesc}>{item.description}</Text>

        {/* Feature Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag) => {
              const color = getTagColor(tag.type);
              return (
                <View
                  key={tag.id}
                  style={[
                    styles.tagPill,
                    tag.type === 'warning' && styles.tagWarning,
                    tag.type === 'danger' && styles.tagDanger,
                  ]}
                >
                  <Ionicons name={tag.icon} size={SIZES.small} color={color} />
                  <Text style={[styles.tagText, { color }]}>{tag.text}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slideItem: {
    width,
    flex: 1,
    paddingHorizontal: SIZES.base * 2.5,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  contentSection: {
    width: '100%',
    alignItems: 'center',
  },
  badgeWrapper: {
    marginBottom: SIZES.base * 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base - 2,
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.base * 0.75,
    paddingHorizontal: SIZES.base * 1.75,
    borderRadius: SIZES.radiusLarge,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  badgeText: {
    fontSize: SIZES.small,
    fontWeight: '800',
    color: COLORS.primary,
  },
  slideTitle: {
    fontSize: SIZES.title,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.base,
    marginTop: SIZES.base * 1.5,
  },
  slideDesc: {
    fontSize: SIZES.font,
    lineHeight: SIZES.font * 1.55,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.base * 2.5,
    paddingHorizontal: SIZES.base,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SIZES.base,
    marginTop: SIZES.base / 2,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base - 2,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.base * 1.5,
    paddingVertical: SIZES.base * 0.5,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  tagWarning: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.warning,
  },
  tagDanger: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.error,
  },
  tagText: {
    fontSize: SIZES.small,
    fontWeight: '600',
  },
});

export default SlideItem;
