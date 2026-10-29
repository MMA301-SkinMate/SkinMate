import { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { COLORS } from "../../constants/colors";
import { AppText } from "./AppText";

/** @param {{source?: string|number|object, name?: string, size?: number, onPress?: Function}} props */
export const Avatar = ({
  source,
  name = "",
  size = 48,
  onPress,
  accessibilityLabel,
  style,
  ...props
}) => {
  const [failed, setFailed] = useState(false);
  const uri = typeof source === "string" ? source : source?.uri;
  useEffect(() => {
    setFailed(false);
  }, [uri, source]);
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((word) => Array.from(word)[0])
      .join("")
      .toUpperCase() || "?";
  const content =
    source && !failed ? (
      <Image
        source={typeof source === "string" ? { uri: source } : source}
        onError={() => setFailed(true)}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    ) : (
      <AppText variant="label" style={{ fontSize: Math.max(12, size / 3) }}>
        {initials}
      </AppText>
    );
  const appearance = [
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: COLORS.sage,
      alignItems: "center",
      justifyContent: "center",
    },
    style,
  ];
  return onPress ? (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || name || "Ảnh đại diện"}
      hitSlop={Math.max(0, (48 - size) / 2)}
      onPress={onPress}
      style={appearance}
    >
      {content}
    </Pressable>
  ) : (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel || name}
      style={appearance}
    >
      {content}
    </View>
  );
};
