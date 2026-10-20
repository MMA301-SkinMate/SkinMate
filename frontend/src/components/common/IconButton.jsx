import { forwardRef } from "react";
import { Pressable } from "react-native";
import { COLORS } from "../../constants/colors";
import { Icon } from "./Icon";

/** accessibilityLabel is required for icon-only actions. */
/** @param {{icon: string|import('react').ReactNode, accessibilityLabel: string, size?: number, variant?: string, disabled?: boolean, onPress?: Function}} props */
export const IconButton = forwardRef(function IconButton(
  {
    icon,
    size = 22,
    variant = "ghost",
    accessibilityLabel,
    disabled = false,
    onPress,
    style,
    ...props
  },
  ref,
) {
  const filled = variant === "primary";
  return (
    <Pressable
      ref={ref}
      {...props}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          minWidth: 48,
          minHeight: 48,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
          backgroundColor: filled
            ? COLORS.primary
            : variant === "soft"
              ? COLORS.pink
              : "transparent",
        },
        typeof style === "function" ? style({ pressed }) : style,
      ]}
    >
      <Icon
        icon={icon}
        size={size}
        color={filled ? COLORS.background : COLORS.primary}
      />
    </Pressable>
  );
});
