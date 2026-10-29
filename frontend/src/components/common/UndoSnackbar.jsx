import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { AppText } from './AppText';
import { Button } from './Button';
import { useSnackbarTimer } from './useSnackbarTimer';

/** @param {{id: string|number, visible: boolean, message: string, expiresAt: number, onUndo?: Function, onExpire?: Function, bottomOffset?: number}} props */
export const UndoSnackbar = ({ id, visible, message, expiresAt, onUndo, onExpire, bottomOffset = 0, style, ...props }) => {
  const insets = useSafeAreaInsets();
  const { active, remainingSeconds, settle } = useSnackbarTimer({ id, visible, expiresAt,
    onResolve: reason => { if (reason === 'undo') onUndo?.(); else onExpire?.(); } });
  if (!active) return null;
  return <View {...props} style={[{ position: 'absolute', left: 16, right: 16,
    bottom: Math.max(12, insets.bottom) + bottomOffset, zIndex: 50, padding: 12,
    borderRadius: 24, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>
    <View style={{ flex: 1 }}>
      <AppText variant="bodySmall" color={COLORS.background} accessibilityLiveRegion="polite">{message}</AppText>
      <AppText variant="caption" color={COLORS.sage} accessible={false} importantForAccessibility="no">{remainingSeconds}s</AppText>
    </View>
    <Button title="Hoàn tác" variant="secondary" size="sm" onPress={() => settle('undo')}
      style={{ backgroundColor: COLORS.background }} />
  </View>;
};
