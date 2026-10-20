import { Pressable, View } from "react-native";
import { AppText } from "./AppText";
import { Icon } from "./Icon";
import { COLORS } from "../../constants/colors";
import { TONES } from "./commonTheme";

export const Choice = ({
  role,
  checked,
  label,
  description,
  onPress,
  disabled,
  error,
  style,
  ...props
}) => (
  <Pressable
    {...props}
    accessibilityRole={role}
    accessibilityLabel={props.accessibilityLabel || label}
    accessibilityState={{ checked: !!checked, disabled: !!disabled }}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      {
        minHeight: 48,
        padding: 12,
        borderRadius: role === "radio" ? 20 : 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: error
          ? TONES.error.foreground
          : checked
            ? COLORS.primary
            : "#AAB4A4",
        backgroundColor: checked ? COLORS.sage : COLORS.card,
        opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
      },
      style,
    ]}
  >
    <Icon
      icon={
        role === "radio"
          ? checked
            ? "radio-button-on"
            : "radio-button-off"
          : checked
            ? "checkbox"
            : "square-outline"
      }
      size={24}
      color={COLORS.primary}
    />
    <View style={{ flex: 1 }}>
      <AppText variant="label">{label}</AppText>
      {!!description && (
        <AppText variant="bodySmall" color="textSecondary">
          {description}
        </AppText>
      )}
      {!!error && (
        <AppText variant="caption" color={TONES.error.foreground}>
          {error}
        </AppText>
      )}
    </View>
  </Pressable>
);
