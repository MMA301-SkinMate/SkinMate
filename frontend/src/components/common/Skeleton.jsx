import { COLORS } from "../../constants/colors";
import { useEffect } from "react";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/** @param {{width?: number|string, height?: number, radius?: number, animated?: boolean}} props */
export const Skeleton = ({
  width = "100%",
  height = 16,
  radius = 8,
  animated = true,
  style,
  ...props
}) => {
  const opacity = useSharedValue(1);
  const reduced = useReducedMotion();
  useEffect(() => {
    opacity.value =
      animated && !reduced
        ? withRepeat(withTiming(0.45, { duration: 800 }), -1, true)
        : 1;
    return () => cancelAnimation(opacity);
  }, [animated, reduced, opacity]);
  const animation = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      {...props}
      accessible={false}
      importantForAccessibility="no"
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: COLORS.borderDark,
        },
        animation,
        style,
      ]}
    />
  );
};
