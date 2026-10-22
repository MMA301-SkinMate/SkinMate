import { ActivityIndicator, View } from "react-native";
import { COLORS } from "../../constants/colors";
import { AppText } from "./AppText";

/** @param {{message?: string, size?: string, fullScreen?: boolean}} props */
export const LoadingState = ({
  message = "Đang tải...",
  size = "large",
  fullScreen = false,
  style,
  ...props
}) => (
  <View
    {...props}
    accessibilityState={{ busy: true }}
    accessibilityLiveRegion="polite"
    style={[
      { alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
      fullScreen && { flex: 1 },
      style,
    ]}
  >
    <ActivityIndicator size={size} color={COLORS.primary} />
    {!!message && (
      <AppText variant="bodySmall" align="center" color="textSecondary">
        {message}
      </AppText>
    )}
  </View>
);
