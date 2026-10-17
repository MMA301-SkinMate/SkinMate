import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/theme';

const IntroFooter = ({ currentIndex = 0, totalCount = 3, handleNext, isLastSlide }) => {
  return (
    <View style={styles.bottomSection}>
      {/* Pagination Dots */}
      <View style={styles.paginationRow}>
        {Array.from({ length: totalCount }).map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          );
        })}
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        style={[styles.primaryBtn, isLastSlide && styles.primaryBtnLast]}
        onPress={handleNext}
        activeOpacity={0.85}
        accessibilityLabel={isLastSlide ? 'Get started with SkinMate' : 'Continue to next page'}
      >
        <Text style={styles.primaryBtnText}>
          {isLastSlide ? 'Get Started' : 'Continue'}
        </Text>
        <Ionicons
          name={isLastSlide ? 'sparkles' : 'arrow-forward'}
          size={SIZES.large}
          color={COLORS.textLight}
          style={styles.btnIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSection: {
    paddingHorizontal: SIZES.base * 2.5,
    paddingBottom: SIZES.base * 2.5,
    paddingTop: SIZES.base + 2,
    gap: SIZES.medium,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.base - 2,
  },
  dot: {
    height: SIZES.base - 1,
    borderRadius: (SIZES.base - 1) / 2,
  },
  activeDot: {
    width: SIZES.extraLarge + 2,
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    width: SIZES.base - 1,
    backgroundColor: COLORS.borderDark,
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusLarge * 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  primaryBtnLast: {
    backgroundColor: COLORS.primaryDark,
  },
  primaryBtnText: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.3,
  },
  btnIcon: {
    marginLeft: SIZES.base,
  },
});

export default IntroFooter;


