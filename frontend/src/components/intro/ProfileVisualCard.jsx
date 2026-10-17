import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/theme';

const { height } = Dimensions.get('window');
const CARD_HEIGHT = Math.min(Math.max(Math.round(height * 0.43), 320), 365);

export default function ProfileVisualCard() {
  return (
    <View style={styles.cardContainer}>
      <ImageBackground
        source={require('../../assets/images/slide3.jpg')}
        style={styles.visualBox}
        resizeMode="cover"
      >
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
  visualBox: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SIZES.base * 1.75,
  },
});



