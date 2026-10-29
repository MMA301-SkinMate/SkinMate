import { Pressable, View } from "react-native";
import { COLORS } from "../../constants/colors";
import { RADIUS, SHADOWS, SPACING } from "../../constants/theme";

/** @param {{variant?: string, padding?: number, onPress?: Function, children?: import('react').ReactNode}} props */
export const Card = ({
  variant = "default",
  padding = SPACING.md,
  onPress,
  children,
  style,
  ...props
}) => {
  const base = {
    padding,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    backgroundColor:
      { cream: COLORS.background, pink: COLORS.pink, sage: COLORS.sage }[
        variant
      ] || COLORS.card,
    ...(variant !== "outlined" ? SHADOWS.light : {}),
  };
  if (!onPress)
    return (
      <View {...props} style={[base, style]}>
        {children}
      </View>
    );
  return (
    <Pressable
      {...props}
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [base, pressed && { opacity: 0.8 }, style]}
    >
      {children}
    </Pressable>
  );
};
