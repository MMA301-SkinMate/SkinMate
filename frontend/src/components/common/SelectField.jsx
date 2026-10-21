import { Pressable, View } from "react-native";
import { FieldFrame } from "./FieldFrame";
import { AppText } from "./AppText";
import { Icon } from "./Icon";
import { COLORS } from "../../constants/colors";
import { TONES } from "./commonTheme";

/** Display-only selector trigger; the caller supplies the picker and options. */
/** @param {{label?: string, valueLabel?: string, placeholder?: string, onPress?: Function, error?: string, disabled?: boolean}} props */
export const SelectField = ({
  label,
  valueLabel,
  placeholder = "Chọn...",
  onPress,
  error,
  helperText,
  required,
  disabled = false,
  style,
  ...props
}) => (
  <FieldFrame
    label={label}
    required={required}
    error={error}
    helperText={helperText}
    style={style}
  >
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel || label}
      accessibilityValue={{ text: valueLabel || placeholder }}
      accessibilityHint={error || props.accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 52,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: error ? TONES.error.foreground : "#AAB4A4",
        backgroundColor: disabled ? "#ECEEE7" : COLORS.card,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View style={{ flex: 1 }}>
        <AppText color={valueLabel ? "textMain" : "textSecondary"}>
          {valueLabel || placeholder}
        </AppText>
      </View>
      <Icon icon="chevron-down" color={COLORS.textSecondary} />
    </Pressable>
  </FieldFrame>
);
