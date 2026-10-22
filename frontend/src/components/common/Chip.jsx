import { Pressable, View } from "react-native";
import { COLORS } from "../../constants/colors";
import { AppText } from "./AppText";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { getTone } from "./commonTheme";

/** @param {{label: string, selected?: boolean, tone?: string, onPress?: Function, onRemove?: Function, disabled?: boolean}} props */
export const Chip = ({
  label,
  selected = false,
  tone = "neutral",
  icon,
  onPress,
  onRemove,
  disabled = false,
  style,
  ...props
}) => {
  const colors = getTone(tone);
  const content = (
    <>
      <Icon
        icon={icon || (selected ? "checkmark" : undefined)}
        color={colors.foreground}
        size={18}
      />
      <AppText
        variant="label"
        color={colors.foreground}
        style={{ flexShrink: 1 }}
      >
        {label}
      </AppText>
    </>
  );
  const base = {
    minHeight: onPress || onRemove ? 48 : 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: selected ? COLORS.primary : colors.border,
    backgroundColor: selected ? COLORS.sage : colors.background,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  };
  return (
    <View
      style={[
        {
          flexDirection: "row",
          maxWidth: "100%",
          alignItems: "center",
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {onPress ? (
        <Pressable
          {...props}
          accessibilityRole="button"
          accessibilityLabel={props.accessibilityLabel || label}
          accessibilityState={{ selected, disabled }}
          disabled={disabled}
          onPress={onPress}
          style={({ pressed }) => [
            base,
            { flexShrink: 1 },
            pressed && { opacity: 0.75 },
          ]}
        >
          {content}
        </Pressable>
      ) : (
        <View {...props} style={[base, { flexShrink: 1 }]}>
          {content}
        </View>
      )}
      {onRemove && (
        <IconButton
          icon="close"
          size={18}
          disabled={disabled}
          accessibilityLabel={`Xóa ${label}`}
          onPress={onRemove}
        />
      )}
    </View>
  );
};
