import { View } from "react-native";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { TONES } from "./commonTheme";

/** @param {{title?: string, message?: string, onRetry?: Function, retrying?: boolean, compact?: boolean}} props */
export const ErrorState = ({
  title = "Không thể tải dữ liệu",
  message,
  onRetry,
  retrying = false,
  compact = false,
  style,
  ...props
}) => (
  <View
    {...props}
    accessibilityLiveRegion="polite"
    style={[
      { alignItems: "center", padding: compact ? 12 : 24, gap: 12 },
      style,
    ]}
  >
    {!compact && (
      <Icon
        icon="alert-circle-outline"
        size={40}
        color={TONES.error.foreground}
      />
    )}
    <AppText variant={compact ? "label" : "section"} align="center">
      {title}
    </AppText>
    {!!message && (
      <AppText variant="bodySmall" color="textSecondary" align="center">
        {message}
      </AppText>
    )}
    {onRetry && (
      <Button
        title="Thử lại"
        onPress={onRetry}
        loading={retrying}
        variant="secondary"
      />
    )}
  </View>
);
