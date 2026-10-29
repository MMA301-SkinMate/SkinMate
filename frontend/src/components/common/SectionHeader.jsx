import { View } from "react-native";
import { AppText } from "./AppText";
import { Button } from "./Button";

/** @param {{title: string, subtitle?: string, actionLabel?: string, onAction?: Function, trailing?: import('react').ReactNode}} props */
export const SectionHeader = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  trailing,
  style,
}) => (
  <View
    style={[
      { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
      style,
    ]}
  >
    <View style={{ flex: 1, minWidth: 120 }}>
      <AppText variant="section">{title}</AppText>
      {!!subtitle && (
        <AppText variant="caption" color="textSecondary">
          {subtitle}
        </AppText>
      )}
    </View>
    {trailing}
    {!!actionLabel && (
      <Button
        title={actionLabel}
        variant="ghost"
        size="sm"
        onPress={onAction}
      />
    )}
  </View>
);
