import { View } from "react-native";
import { COLORS } from "../../constants/colors";
import { AppText } from "./AppText";
import { getTone } from "./commonTheme";

/** @param {{value?: number, label?: string, showPercentage?: boolean, tone?: string}} props */
export const ProgressBar = ({
  value = 0,
  label,
  showPercentage = false,
  tone = "success",
  style,
  ...props
}) => {
  const percent = Math.round(
    Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0)) * 100,
  );
  return (
    <View
      {...props}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label || "Tiến độ"}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={[{ gap: 8 }, style]}
    >
      {!!(label || showPercentage) && (
        <AppText variant="caption">
          {label}
          {showPercentage ? `${label ? " · " : ""}${percent}%` : ""}
        </AppText>
      )}
      <View
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: COLORS.border,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${percent}%`,
            backgroundColor:
              tone === "success" ? COLORS.olive : getTone(tone).foreground,
          }}
        />
      </View>
    </View>
  );
};
