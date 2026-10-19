import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';

export const ProductBottle = ({ product, stepNumber, onPress, isSelected = false, compact = false }) => {
  if (!product) return null;

  // Bottle color scheme depending on step category
  const getCategoryTheme = (step) => {
    switch (step) {
      case 1:
        return { cap: '#64748b', body: '#e0f2fe', accent: '#0284c7', icon: 'droplets' }; // Làm sạch (xanh nước)
      case 2:
        return { cap: '#c084fc', body: '#faf5ff', accent: '#9333ea', icon: 'sparkles' }; // Cân bằng (tím dịu)
      case 3:
        return { cap: '#fb923c', body: '#fff7ed', accent: '#ea580c', icon: 'zap' }; // Đặc trị (cam năng lượng)
      case 4:
        return { cap: '#34d399', body: '#f0fdf4', accent: '#059669', icon: 'shield' }; // Phục hồi (xanh lá mướt)
      case 5:
        return { cap: '#facc15', body: '#fefce8', accent: '#ca8a04', icon: 'sun' }; // Chống nắng (vàng rực rỡ)
      default:
        return { cap: '#94a3b8', body: '#f8fafc', accent: '#475569', icon: 'package' };
    }
  };

  const theme = getCategoryTheme(stepNumber || product.stepNumber || 1);

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, isSelected && styles.selectedRing]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.compactBottle, { backgroundColor: theme.body, borderColor: theme.accent }]}>
          <View style={[styles.compactCap, { backgroundColor: theme.cap }]} />
          <Icon name={theme.icon} size={14} color={theme.accent} />
        </View>
        <Text style={styles.compactStep}>B.{stepNumber || product.stepNumber}</Text>
        <Text numberOfLines={1} style={styles.compactName}>{product.name}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Visual Skincare Bottle Simulation */}
      <View style={styles.bottleIllustration}>
        {/* Cap / Pump */}
        <View style={[styles.cap, { backgroundColor: theme.cap }]} />
        <View style={[styles.nozzle, { backgroundColor: theme.cap }]} />

        {/* Bottle Body with Glass Highlight */}
        <View style={[styles.bottleBody, { backgroundColor: theme.body, borderColor: theme.accent }]}>
          <View style={styles.glassReflection} />
          <View style={[styles.iconCircle, { backgroundColor: '#ffffff' }]}>
            <Icon name={theme.icon} size={18} color={theme.accent} />
          </View>
          <Text style={[styles.stepBadgeText, { color: theme.accent }]}>
            BƯỚC {stepNumber || product.stepNumber}
          </Text>
        </View>

        {/* Base shadow */}
        <View style={styles.bottleShadow} />
      </View>

      {/* Product Details */}
      <View style={styles.infoWrapper}>
        <Text numberOfLines={1} style={styles.brandText}>
          {product.brand}
        </Text>
        <Text numberOfLines={2} style={styles.nameText}>
          {product.name}
        </Text>
        <View style={styles.activeTag}>
          <Text numberOfLines={1} style={styles.activeTagText}>
            {product.activeIngredients[0] || product.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 130,
    marginRight: 14,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedContainer: {
    borderColor: '#e11d48',
    backgroundColor: '#fff1f2',
    transform: [{ scale: 1.02 }],
  },
  bottleIllustration: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    height: 94,
    justifyContent: 'flex-end',
  },
  nozzle: {
    width: 6,
    height: 5,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  cap: {
    width: 24,
    height: 10,
    borderRadius: 3,
    marginBottom: 1,
  },
  bottleBody: {
    width: 58,
    height: 72,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  glassReflection: {
    position: 'absolute',
    top: 0,
    left: 4,
    width: 6,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 3,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  stepBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottleShadow: {
    width: 44,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 999,
    marginTop: 2,
  },
  infoWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  brandText: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 28,
    marginBottom: 4,
  },
  activeTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: '100%',
  },
  activeTagText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '600',
  },

  // Compact mode
  compactContainer: {
    alignItems: 'center',
    marginRight: 10,
    width: 64,
  },
  selectedRing: {
    opacity: 0.8,
  },
  compactBottle: {
    width: 40,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  compactCap: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 4,
    borderRadius: 2,
  },
  compactStep: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  compactName: {
    fontSize: 10,
    color: '#1e293b',
    textAlign: 'center',
  },
});
