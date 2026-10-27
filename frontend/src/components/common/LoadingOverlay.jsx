import { StyleSheet, View } from "react-native";
import { LoadingState } from "./LoadingState";
import { COLORS } from "../../constants/colors";

/** @param {{visible?: boolean, message?: string}} props */
export const LoadingOverlay = ({
  visible = false,
  message = "Đang xử lý...",
  style,
  ...props
}) =>
  visible ? (
    <View
      {...props}
      accessibilityViewIsModal
      importantForAccessibility="yes"
      style={[
        StyleSheet.absoluteFillObject,
        {
          zIndex: 100,
          backgroundColor: "rgba(41,56,45,0.45)",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <View
        style={{
          maxWidth: "90%",
          borderRadius: 24,
          backgroundColor: COLORS.background,
        }}
      >
        <LoadingState message={message} />
      </View>
    </View>
  ) : null;
