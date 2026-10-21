import { useRef } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { getTone } from "./commonTheme";
import { useSnackbarTimer } from "./useSnackbarTimer";

/** @param {{id: string|number, visible: boolean, message: string, tone?: string, duration?: number, actionLabel?: string, onAction?: Function, onDismiss?: Function, bottomOffset?: number}} props */
export const Snackbar = ({
  id,
  visible,
  message,
  tone = "info",
  actionLabel,
  onAction,
  duration = 4000,
  onDismiss,
  bottomOffset = 0,
  style,
  ...props
}) => {
  const deadline = useRef({ id, expiresAt: null });
  if (deadline.current.id !== id) deadline.current = { id, expiresAt: null };
  if (visible && deadline.current.expiresAt === null)
    deadline.current.expiresAt = Date.now() + duration;
  const colors = getTone(tone);
  const insets = useSafeAreaInsets();
  const { active, settle } = useSnackbarTimer({
    id,
    visible,
    expiresAt: deadline.current.expiresAt ?? Infinity,
    onResolve: (reason) => {
      if (reason === "action") onAction?.();
      onDismiss?.(reason);
    },
  });
  if (!active) return null;
  return (
    <View
      {...props}
      accessibilityLiveRegion="polite"
      style={[
        {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: Math.max(12, insets.bottom) + bottomOffset,
          zIndex: 50,
          padding: 12,
          borderRadius: 20,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        style,
      ]}
    >
      <Icon icon={colors.icon} color={colors.foreground} />
      <AppText
        variant="bodySmall"
        color={colors.foreground}
        style={{ flex: 1 }}
      >
        {message}
      </AppText>
      {!!actionLabel && (
        <Button
          title={actionLabel}
          variant="ghost"
          size="sm"
          onPress={() => settle("action")}
        />
      )}
    </View>
  );
};
