import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";
import { AppText } from "./AppText";
import { IconButton } from "./IconButton";
import { useOverlayFocus } from "./useOverlayFocus";
import { useOverlayBlurTarget } from "./CommonOverlayProvider";
import { OverlayBackdrop } from "./OverlayBackdrop";

/** Controlled centered modal. onClose(reason) requests a parent state change. */
/** @param {{visible?: boolean, title: string, onClose?: Function, children?: import('react').ReactNode, footer?: import('react').ReactNode, dismissible?: boolean, loading?: boolean, triggerRef?: object}} props */
export const AppModal = ({
  visible = false,
  title,
  onClose,
  children,
  footer,
  dismissible = true,
  loading = false,
  triggerRef,
  style,
  testID,
  ...props
}) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { titleRef, focusTitle } = useOverlayFocus(visible, triggerRef);
  const blurTarget = useOverlayBlurTarget();
  const canDismiss = dismissible && !loading;
  const requestClose = (reason) => {
    if (canDismiss) onClose?.(reason);
  };
  return (
    <Modal
      {...props}
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => requestClose("back")}
      onShow={focusTitle}
    >
      <View style={styles.root}>
        <Pressable
          accessible={false}
          testID={testID ? `${testID}-backdrop` : "modal-backdrop"}
          onPress={() => requestClose("backdrop")}
          style={StyleSheet.absoluteFill}
        >
          <OverlayBackdrop blurTarget={blurTarget} />
        </Pressable>
        <KeyboardAvoidingView
          pointerEvents="box-none"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[
            styles.container,
            {
              paddingTop: Math.max(20, insets.top),
              paddingBottom: Math.max(20, insets.bottom),
            },
          ]}
        >
          <View
            testID={testID}
            accessibilityViewIsModal
            importantForAccessibility="yes"
            onAccessibilityEscape={() => requestClose("escape")}
            style={[
              styles.card,
              {
                maxHeight: Math.max(
                  120,
                  height - insets.top - insets.bottom - 40,
                ),
              },
              style,
            ]}
          >
            <View style={styles.header}>
              <AppText
                ref={titleRef}
                variant="section"
                accessible
                style={{ flex: 1 }}
              >
                {title}
              </AppText>
              {canDismiss && (
                <IconButton
                  icon="close"
                  accessibilityLabel="Close dialog"
                  onPress={() => requestClose("close")}
                />
              )}
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ padding: 20, paddingTop: 4 }}
            >
              {children}
            </ScrollView>
            {!!footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    overflow: "hidden",
    flexShrink: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingLeft: 20,
    gap: 8,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
  },
});
