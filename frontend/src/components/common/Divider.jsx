import { COLORS } from "../../constants/colors";
import { View } from "react-native";
/** @param {{spacing?: number, inset?: number}} props */
export const Divider = ({ spacing = 12, inset = 0, style, ...props }) => (
  <View
    {...props}
    style={[
      {
        height: 1,
        backgroundColor: COLORS.borderDark,
        marginVertical: spacing,
        marginHorizontal: inset,
      },
      style,
    ]}
  />
);
