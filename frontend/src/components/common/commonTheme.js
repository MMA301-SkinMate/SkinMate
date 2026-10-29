import { StyleSheet } from "react-native";
import { isLoaded } from "expo-font";
import { COLORS } from "../../constants/colors";
import { FONT_FAMILIES } from "../../constants/fonts";

// Feedback components use the same palette as every screen.
export const TONES = {
  neutral: {
    background: COLORS.surface,
    foreground: COLORS.textSecondary,
    border: COLORS.borderDark,
    icon: "information-circle-outline",
  },
  success: {
    background: COLORS.sage,
    foreground: COLORS.primaryDark,
    border: COLORS.olive,
    icon: "checkmark-circle-outline",
  },
  warning: {
    background: COLORS.background,
    foreground: COLORS.textMain,
    border: COLORS.warning,
    icon: "warning-outline",
  },
  error: {
    background: COLORS.pink,
    foreground: COLORS.error,
    border: COLORS.error,
    icon: "alert-circle-outline",
  },
  info: {
    background: COLORS.surface,
    foreground: COLORS.primaryDark,
    border: COLORS.info,
    icon: "information-circle-outline",
  },
};

export const getTone = (tone) => TONES[tone] || TONES.neutral;

/** Use a system face when a bundled font failed to load. */
export const resolveTextStyle = (style) => {
  const flattened = StyleSheet.flatten(style) || {};
  const family = flattened.fontFamily;
  if (
    !family ||
    !Object.values(FONT_FAMILIES).includes(family) ||
    isLoaded(family)
  )
    return flattened;
  const fontWeight = family.endsWith("-Bold")
    ? "700"
    : family.endsWith("-SemiBold")
      ? "600"
      : family.endsWith("-Medium")
        ? "500"
        : "400";
  return { ...flattened, fontFamily: undefined, fontWeight };
};
