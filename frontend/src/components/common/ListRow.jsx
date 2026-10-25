import { Pressable, View } from "react-native";
import { AppText } from "./AppText";
import { Icon } from "./Icon";
import { TONES } from "./commonTheme";
import { COLORS } from "../../constants/colors";

/** @param {{title: string, description?: string, leading?: import('react').ReactNode, trailing?: import('react').ReactNode, onPress?: Function, selected?: boolean, disabled?: boolean, destructive?: boolean}} props */
export const ListRow = ({
  title,
  description,
  leading,
  trailing,
  onPress,
  selected = false,
  disabled = false,
  destructive = false,
  style,
  ...props
}) => {
  const content = (
    <>
      {leading}
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText
          variant="label"
          color={destructive ? TONES.error.foreground : COLORS.textMain}
        >
          {title}
        </AppText>
        {!!description && (
          <AppText variant="bodySmall" color="textSecondary">
            {description}
          </AppText>
        )}
      </View>
      {trailing ??
        (onPress ? (
          <Icon icon="chevron-forward" color={COLORS.textSecondary} />
        ) : null)}
    </>
  );
  const base = {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: selected ? COLORS.sage : COLORS.transparent,
    opacity: disabled ? 0.5 : 1,
  };
  return onPress ? (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={
        props.accessibilityLabel ||
        [title, description].filter(Boolean).join(", ")
      }
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [base, pressed && { opacity: 0.7 }, style]}
    >
      {content}
    </Pressable>
  ) : (
    <View {...props} style={[base, style]}>
      {content}
    </View>
  );
};
