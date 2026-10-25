import { Pressable, View } from "react-native";
import { COLORS } from "../../constants/colors";
import { AppText } from "./AppText";

/** @param {{options?: object[], value?: string, onChange?: Function, variant?: string, disabled?: boolean}} props */
export const SegmentedControl = ({
  options = [],
  value,
  onChange,
  variant = "pill",
  disabled = false,
  style,
  ...props
}) => (
  <View
    {...props}
    style={[
      {
        flexDirection: "row",
        backgroundColor:
          variant === "pill" ? COLORS.surface : COLORS.transparent,
        borderRadius: 24,
        padding: variant === "pill" ? 4 : 0,
        gap: 4,
      },
      style,
    ]}
  >
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <Pressable
          key={option.value}
          accessibilityRole="tab"
          accessibilityLabel={option.label}
          accessibilityState={{
            selected,
            disabled: disabled || !!option.disabled,
          }}
          disabled={disabled || option.disabled}
          onPress={() => onChange?.(option.value)}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 48,
            padding: 8,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            borderBottomWidth: variant === "underline" ? 2 : 0,
            borderBottomColor: selected ? COLORS.primary : COLORS.transparent,
            backgroundColor:
              variant === "pill" && selected
                ? COLORS.background
                : COLORS.transparent,
            opacity: disabled || option.disabled ? 0.5 : pressed ? 0.75 : 1,
          })}
        >
          <AppText
            variant="label"
            align="center"
            color={selected ? "textMain" : "textSecondary"}
          >
            {option.label}
          </AppText>
        </Pressable>
      );
    })}
  </View>
);
