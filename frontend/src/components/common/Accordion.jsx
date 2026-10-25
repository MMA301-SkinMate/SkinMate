import { Pressable, View } from "react-native";
import { COLORS } from "../../constants/colors";
import { AppText } from "./AppText";
import { Icon } from "./Icon";

/** @param {{title: string, expanded?: boolean, onToggle?: Function, children?: import('react').ReactNode}} props */
export const Accordion = ({
  title,
  expanded = false,
  onToggle,
  children,
  leading,
  style,
  ...props
}) => (
  <View
    {...props}
    style={[
      {
        borderWidth: 1,
        borderColor: COLORS.borderDark,
        borderRadius: 20,
        backgroundColor: COLORS.card,
      },
      style,
    ]}
  >
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ expanded }}
      onPress={() => onToggle?.(!expanded)}
      style={{
        minHeight: 56,
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        gap: 8,
      }}
    >
      {leading}
      <AppText variant="label" style={{ flex: 1 }}>
        {title}
      </AppText>
      <Icon
        icon={expanded ? "chevron-up" : "chevron-down"}
        color={COLORS.primary}
      />
    </Pressable>
    {expanded && (
      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        {children}
      </View>
    )}
  </View>
);
