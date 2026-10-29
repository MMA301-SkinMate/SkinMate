import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { OVERLAY } from "../../constants/theme";

/** Shared visual layer; the modal or sheet handles backdrop presses. */
export const OverlayBackdrop = ({ blurTarget }) => (
  <View
    pointerEvents="none"
    accessible={false}
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    style={StyleSheet.absoluteFill}
  >
    {(Platform.OS !== "android" || blurTarget) && (
      <BlurView
        blurTarget={blurTarget}
        blurMethod="dimezisBlurViewSdk31Plus"
        intensity={OVERLAY.blurIntensity}
        style={StyleSheet.absoluteFill}
      />
    )}
    <View style={[StyleSheet.absoluteFill, styles.dim]} />
  </View>
);

const styles = StyleSheet.create({
  dim: { backgroundColor: OVERLAY.backdropColor },
});
