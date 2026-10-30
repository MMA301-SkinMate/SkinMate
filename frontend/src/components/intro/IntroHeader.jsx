import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/theme';

const IntroHeader = ({ currentIndex, handleBack, handleSkip }) => {
  return (
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={handleBack}
        style={[styles.headerIconBtn, currentIndex === 0 && styles.headerBtnHidden]}
        disabled={currentIndex === 0}
        activeOpacity={0.7}
        accessibilityLabel="Back"
      >
        <Ionicons name="arrow-back" size={SIZES.title} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Skip Button */}
      <TouchableOpacity
        onPress={handleSkip}
        style={styles.skipBtn}
        activeOpacity={0.7}
        accessibilityLabel="Skip intro"
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.base * 2.5,
    height: 52,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtnHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: SIZES.base * 0.75,
    paddingHorizontal: SIZES.base,
  },
  skipText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});

export default IntroHeader;


