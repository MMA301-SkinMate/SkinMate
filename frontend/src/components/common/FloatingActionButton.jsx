import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import { Button } from "./Button";
import { IconButton } from "./IconButton";

/** @param {{icon?: string, label?: string, onPress?: Function, bottomOffset?: number, disabled?: boolean}} props */
export const FloatingActionButton = ({
  icon = "help",
  label,
  onPress,
  bottomOffset = 0,
  disabled = false,
  style,
  ...props
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          position: "absolute",
          right: 20,
          bottom: Math.max(insets.bottom, 12) + bottomOffset,
        },
        style,
      ]}
    >
      {label ? (
        <Button
          {...props}
          title={label}
          leftIcon={icon}
          onPress={onPress}
          disabled={disabled}
        />
      ) : (
        <IconButton
          {...props}
          icon={icon}
          accessibilityLabel={props.accessibilityLabel || "Trợ giúp"}
          variant="primary"
          onPress={onPress}
          disabled={disabled}
          style={{ width: 56, height: 56 }}
        />
      )}
    </View>
  );
};
