import { View } from "react-native";
import { AppText } from "./AppText";
import { IconButton } from "./IconButton";

/** @param {{title: string, subtitle?: string, onBack?: Function, onClose?: Function, rightActions?: object[]}} props */
export const AppHeader = ({
  title,
  subtitle,
  onBack,
  onClose,
  rightActions = [],
  style,
  ...props
}) => (
  <View
    {...props}
    style={[
      {
        minHeight: 56,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 4,
      },
      style,
    ]}
  >
    {onBack && (
      <IconButton
        icon="arrow-back"
        accessibilityLabel="Quay lại"
        onPress={onBack}
      />
    )}
    <View style={{ flex: 1, minWidth: 0 }}>
      <AppText variant="section">{title}</AppText>
      {!!subtitle && (
        <AppText variant="caption" color="textSecondary">
          {subtitle}
        </AppText>
      )}
    </View>
    {rightActions.map((action) => (
      <IconButton key={action.id || action.accessibilityLabel} {...action} />
    ))}
    {onClose && (
      <IconButton icon="close" accessibilityLabel="Đóng" onPress={onClose} />
    )}
  </View>
);
