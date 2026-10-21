import { View } from "react-native";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { COLORS } from "../../constants/colors";

/** @param {{title?: string, description?: string, illustration?: import('react').ReactNode, actionLabel?: string, onAction?: Function}} props */
export const EmptyState = ({
  title = "Chưa có dữ liệu",
  description,
  illustration,
  actionLabel,
  onAction,
  style,
  ...props
}) => (
  <View
    {...props}
    style={[
      { alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
      style,
    ]}
  >
    {illustration || (
      <Icon icon="leaf-outline" size={48} color={COLORS.primary} />
    )}
    <AppText variant="section" align="center">
      {title}
    </AppText>
    {!!description && (
      <AppText variant="bodySmall" color="textSecondary" align="center">
        {description}
      </AppText>
    )}
    {!!actionLabel && <Button title={actionLabel} onPress={onAction} />}
  </View>
);
