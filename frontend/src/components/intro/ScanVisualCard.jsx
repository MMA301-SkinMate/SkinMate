import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/theme';

const { height } = Dimensions.get('window');
const CARD_HEIGHT = Math.min(Math.max(Math.round(height * 0.43), 320), 365);

export default function ScanVisualCard() {
  return (
    <View style={styles.cardContainer}>
      <ImageBackground
        source={require('../../assets/images/slide1.jpg')}
        style={styles.scanVisualBox}
        resizeMode="cover"
      >
        {/* Subtle overlay */}
        <View style={styles.overlay} />

        {/* Bottom Status Bar */}
        <View style={styles.cardBottomStatusBar}>
          <View style={styles.liveIndicatorRow}>
            <View style={styles.greenDot} />
            <Text style={styles.liveText}>AI VISION LIVE</Text>
          </View>
          <View style={styles.accuracyRow}>
            <Ionicons name="shield-checkmark" size={13} color={COLORS.primary} />
            <Text style={styles.accuracyText}>99.8% Accuracy</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: SIZES.radiusLarge,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
    overflow: 'hidden',
    marginTop: SIZES.base / 2,
    marginBottom: SIZES.base * 2,
    ...SHADOWS.medium,
  },
  scanVisualBox: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SIZES.base * 1.75,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
  },
  cardBottomStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.base + 1,
    paddingHorizontal: SIZES.base * 1.75,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    ...SHADOWS.light,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base - 1,
  },
  greenDot: {
    width: SIZES.base,
    height: SIZES.base,
    borderRadius: SIZES.base / 2,
    backgroundColor: COLORS.success,
  },
  liveText: {
    fontSize: SIZES.small - 1,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base / 2,
  },
  accuracyText: {
    fontSize: SIZES.small - 1,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

