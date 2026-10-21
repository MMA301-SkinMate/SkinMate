import { forwardRef } from "react";
import { Text } from "react-native";
import { COLORS } from "../../constants/colors";
import { TYPOGRAPHY, getHeadingStyle } from "../../constants/theme";
import { resolveTextStyle } from "./commonTheme";

/** @param {{variant?: string, color?: string, align?: string, children?: React.ReactNode}} props */
export const AppText = forwardRef(function AppText(
  {
    variant = "body",
    color = "textMain",
    align,
    children,
    style,
    allowFontScaling = true,
    ...props
  },
  ref,
) {
  const isHeading = ["hero", "title", "section"].includes(variant);
  const typography =
    isHeading && (typeof children === "string" || typeof children === "number")
      ? getHeadingStyle(children, variant)
      : TYPOGRAPHY[variant] || TYPOGRAPHY.body;
  return (
    <Text
      ref={ref}
      allowFontScaling={allowFontScaling}
      accessibilityRole={isHeading ? "header" : undefined}
      {...props}
      style={resolveTextStyle([
        typography,
        { color: COLORS[color] || color, textAlign: align },
        style,
      ])}
    >
      {children}
    </Text>
  );
});
