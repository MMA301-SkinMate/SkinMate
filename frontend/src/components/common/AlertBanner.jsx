import { View } from "react-native";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { getTone } from "./commonTheme";

/** @param {{tone?: string, title?: string, description?: string, icon?: string, action?: object, children?: import('react').ReactNode}} props */
export const AlertBanner = ({
  tone = "info",
  title,
  description,
  icon,
  action,
  children,
  style,
  ...props
}) => {
  const colors = getTone(tone);
  return (
    <View
      {...props}
      accessibilityLiveRegion={tone === "error" ? "polite" : "none"}
      style={[
        {
          padding: 16,
          gap: 8,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
        <Icon icon={icon || colors.icon} color={colors.foreground} size={24} />
        <View style={{ flex: 1, gap: 4 }}>
          {!!title && (
            <AppText variant="label" color={colors.foreground}>
              {title}
            </AppText>
          )}
          {!!description && (
            <AppText variant="bodySmall" color={colors.foreground}>
              {description}
            </AppText>
          )}
        </View>
      </View>
      {children}
      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          disabled={action.disabled}
          variant="secondary"
          size="sm"
        />
      )}
    </View>
  );
};
