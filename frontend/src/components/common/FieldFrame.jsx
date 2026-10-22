import { View } from "react-native";
import { AppText } from "./AppText";
import { TONES } from "./commonTheme";

export const FieldFrame = ({
  label,
  required,
  error,
  helperText,
  children,
  style,
}) => (
  <View style={[{ gap: 6 }, style]}>
    {!!label && (
      <AppText variant="label">
        {label}
        {required ? " *" : ""}
      </AppText>
    )}
    {children}
    {!!(error || helperText) && (
      <AppText
        variant="caption"
        accessibilityLiveRegion={error ? "polite" : "none"}
        color={error ? TONES.error.foreground : "textSecondary"}
      >
        {error || helperText}
      </AppText>
    )}
  </View>
);
