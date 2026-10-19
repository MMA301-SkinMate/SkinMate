export const Colors = {
  primary: '#10B981',
  primaryLight: '#D1FAE5',
  primaryDark: '#047857',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  woodShelf: '#B45309',
  woodDark: '#92400E',
};
import { COLORS } from './colors';

export const SIZES = {
    base: 8,
    small: 12,
    font: 14,
    medium: 16,
    large: 18,
    extraLarge: 24,
    title: 20,
    radius: 12,
    radiusLarge: 20,
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
};

export const THEME = { COLORS, SIZES, SHADOWS };
