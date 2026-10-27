import { forwardRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { TONES } from './commonTheme';

const variants = {
  primary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, color: COLORS.background },
  secondary: { backgroundColor: 'transparent', borderColor: COLORS.primary, color: COLORS.primary },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent', color: COLORS.primary },
  danger: { backgroundColor: TONES.error.foreground, borderColor: TONES.error.foreground, color: '#FFFFFF' },
};

/** A controlled action. Loading/disabled actions never invoke onPress. */
/** @param {{title: string, variant?: string, size?: string, loading?: boolean, disabled?: boolean, fullWidth?: boolean, onPress?: Function}} props */
export const Button = forwardRef(function Button({
  title, variant = 'primary', size = 'md', loading = false, disabled = false,
  leftIcon, rightIcon, onPress, fullWidth = false, style, accessibilityState, ...props
}, ref) {
  const blocked = disabled || loading;
  const appearance = variants[variant] || variants.primary;
  const { color: ignoredColor, ...viewAppearance } = appearance;
  const color = disabled ? COLORS.textSecondary : appearance.color;
  return (
    <Pressable ref={ref} {...props} accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel || title}
      accessibilityState={{ ...accessibilityState, disabled: blocked, busy: loading }}
      disabled={blocked} onPress={blocked ? undefined : onPress}
      style={({ pressed }) => [styles.button, viewAppearance,
        { minHeight: size === 'lg' ? 56 : size === 'sm' ? 48 : 52 },
        fullWidth && styles.fullWidth, disabled && styles.disabled,
        pressed && styles.pressed, typeof style === 'function' ? style({ pressed }) : style]}>
      <View style={[styles.content, loading && styles.hidden]} pointerEvents="none">
        <Icon icon={leftIcon} color={color} />
        <AppText variant="button" color={color} align="center" style={styles.label}>{title}</AppText>
        <Icon icon={rightIcon} color={color} />
      </View>
      {loading && <ActivityIndicator color={color} style={StyleSheet.absoluteFill} />}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: { borderWidth: 1, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm, alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs },
  label: { flexShrink: 1 }, fullWidth: { alignSelf: 'stretch' }, hidden: { opacity: 0 },
  disabled: { backgroundColor: '#E4E5DF', borderColor: '#C5CBC0' }, pressed: { opacity: 0.78 },
});
