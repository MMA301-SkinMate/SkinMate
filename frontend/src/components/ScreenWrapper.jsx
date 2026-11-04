import { forwardRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

// Preserve legacy padding/edges. New screens can opt into 20-point gutters.
const ScreenWrapper = forwardRef(function ScreenWrapper(
  {
    children,
    style,
    edges = ["top", "left", "right"],
    scroll = false,
    keyboardAvoiding = false,
    keyboardVerticalOffset = 0,
    contentContainerStyle,
    paddingHorizontal = 16,
    header,
    footer,
    bottomOffset = 0,
    ...props
  },
  ref,
) {
  const insets = useSafeAreaInsets();
  const Container = scroll ? ScrollView : View;
  const contentStyle = [
    scroll ? { flexGrow: 1 } : styles.inner,
    { paddingHorizontal, paddingBottom: bottomOffset },
    contentContainerStyle,
  ];
  return (
    <SafeAreaView {...props} style={[styles.container, style]} edges={edges}>
      <KeyboardAvoidingView
        style={styles.inner}
        enabled={keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {header}
        <Container
          ref={ref}
          testID={props.testID ? `${props.testID}-content` : undefined}
          style={scroll ? styles.inner : contentStyle}
          {...(scroll
            ? {
              contentContainerStyle: contentStyle,
              keyboardShouldPersistTaps: "handled",
              keyboardDismissMode: "on-drag",
              contentInsetAdjustmentBehavior: "never",
            }
            : {})}
        >
          {children}
        </Container>
        {footer && (
          <View
            testID={props.testID ? `${props.testID}-footer` : undefined}
            style={{
              paddingHorizontal,
              paddingTop: 12,
              gap: 8,
              paddingBottom: edges.includes("bottom")
                ? 16
                : Math.max(16, insets.bottom),
            }}
          >
            {footer}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
    alignSelf: "stretch",
  },
});

export default ScreenWrapper;
