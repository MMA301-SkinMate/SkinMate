import { View } from "react-native";
import { AppText } from "./AppText";
import { Icon } from "./Icon";
import { getTone } from "./commonTheme";

/** @param {{label: string, tone?: string, icon?: string, size?: string}} props */
export const Badge = ({
  label,
  tone = "neutral",
  icon,
  size = "md",
  style,
  ...props
}) => {
  const colors = getTone(tone);
  return (
    <View
      {...props}
      style={[
        {
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 4,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: size === "sm" ? 2 : 4,
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      <Icon icon={icon} size={16} color={colors.foreground} />
      <AppText
        variant="caption"
        color={colors.foreground}
        style={{ flexShrink: 1 }}
      >
        {label}
      </AppText>
    </View>
  );
};
