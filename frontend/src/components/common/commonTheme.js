import { StyleSheet } from "react-native";
import { isLoaded } from "expo-font";
import { COLORS } from "../../constants/colors";
import { FONT_FAMILIES } from "../../constants/fonts";

// Accessible foregrounds for new common components; legacy colors stay intact.
export const TONES = {
  neutral: {
    background: "#F2F0E9",
    foreground: COLORS.textSecondary,
    border: "#D8DCD2",
    icon: "information-circle-outline",
  },
  success: {
    background: "#E6F0E1",
    foreground: "#31583A",
    border: "#B8CFB3",
    icon: "checkmark-circle-outline",
  },
  warning: {
    background: "#FFF0DC",
    foreground: "#845000",
    border: "#D6B780",
    icon: "warning-outline",
  },
  error: {
    background: "#FCE8E9",
    foreground: "#A7283D",
    border: "#D98C98",
    icon: "alert-circle-outline",
  },
  info: {
    background: "#E8EFF4",
    foreground: "#34556B",
    border: "#A9BECD",
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
