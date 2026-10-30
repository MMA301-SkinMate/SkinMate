import { Switch, View } from "react-native";
import { COLORS } from "../../constants/colors";
import { AppText } from "./AppText";

/** @param {{label: string, value?: boolean, onValueChange?: Function, description?: string, disabled?: boolean}} props */
export const SwitchField = ({
  value = false,
  onValueChange,
  label,
  description,
  disabled = false,
  style,
  ...props
}) => (
  <View
    style={[
      {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 8,
      },
      style,
    ]}
  >
    <View style={{ flex: 1 }}>
      <AppText variant="label">{label}</AppText>
      {!!description && (
        <AppText variant="bodySmall" color="textSecondary">
          {description}
        </AppText>
      )}
    </View>
    <Switch
      {...props}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={props.accessibilityLabel || label}
      accessibilityState={{ disabled, checked: value }}
      trackColor={{ false: COLORS.borderDark, true: COLORS.primary }}
      thumbColor={COLORS.textLight}
    />
  </View>
);
