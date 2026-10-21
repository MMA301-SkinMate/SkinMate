import { useCallback, useEffect, useRef } from "react";
import { BackHandler, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { COLORS } from "../../constants/colors";
import { AppText } from "./AppText";
import { IconButton } from "./IconButton";
import { SheetInputContext } from "./SheetInputContext";
import { useOverlayFocus } from "./useOverlayFocus";
import { useSheetAccessibility } from "./CommonOverlayProvider";

/** Controlled draggable sheet. Requires the root providers documented in README. */
/** @param {{visible?: boolean, title: string, onClose?: Function, onDismiss?: Function, children?: import('react').ReactNode, footer?: import('react').ReactNode, snapPoints?: Array<string|number>, dismissible?: boolean, loading?: boolean, triggerRef?: object}} props */
export const AppBottomSheet = ({
  visible = false,
  title,
  onClose,
  onDismiss,
  children,
  footer,
  snapPoints,
  dismissible = true,
  loading = false,
  triggerRef,
  testID,
}) => {
  const ref = useRef(null);
  const presented = useRef(false);
  const reasonRef = useRef(null);
  const focused = useRef(false);
  const latest = useRef({ visible, onClose, onDismiss });
  latest.current = { visible, onClose, onDismiss };
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { titleRef, focusTitle } = useOverlayFocus(visible, triggerRef);
  useSheetAccessibility(visible);
  const canDismiss = dismissible && !loading;

  useEffect(() => {
    if (visible) {
      presented.current = true;
      reasonRef.current = null;
      focused.current = false;
      ref.current?.present();
    } else if (presented.current) {
      // Dismissing an unmounted Gorhom modal can prevent its next presentation.
      presented.current = false;
      ref.current?.dismiss();
    }
  }, [visible]);

  const requestClose = useCallback(
    (reason) => {
      if (!canDismiss) return;
      reasonRef.current = reason;
      ref.current?.dismiss();
    },
    [canDismiss],
  );

  useEffect(() => {
    if (!visible) return undefined;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        requestClose("back");
        return true;
      },
    );
    return () => subscription.remove();
  }, [visible, requestClose]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior={canDismiss ? "close" : "none"}
        onPress={() => {
          reasonRef.current = "backdrop";
        }}
      />
    ),
    [canDismiss],
  );

  const renderFooter = useCallback(
    (props) =>
      footer ? (
        <BottomSheetFooter {...props}>
          <SheetInputContext.Provider value={BottomSheetTextInput}>
            <View
              style={{
                padding: 20,
                paddingBottom: Math.max(16, insets.bottom),
                gap: 8,
                backgroundColor: COLORS.background,
                borderTopWidth: 1,
                borderTopColor: "#DDE1D7",
              }}
            >
              {footer}
            </View>
          </SheetInputContext.Provider>
        </BottomSheetFooter>
      ) : null,
    [footer, insets.bottom],
  );

  return (
    <BottomSheetModal
      ref={ref}
      testID={testID}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={!snapPoints}
      maxDynamicContentSize={Math.max(160, (height - insets.top) * 0.9)}
      topInset={insets.top}
      enablePanDownToClose={canDismiss}
      backdropComponent={renderBackdrop}
      footerComponent={footer ? renderFooter : undefined}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      handleIndicatorStyle={{ backgroundColor: "#B8C0B2", width: 40 }}
      onChange={(index) => {
        if (index >= 0 && !focused.current) {
          focused.current = true;
          focusTitle();
        }
      }}
      onDismiss={() => {
        presented.current = false;
        const reason = reasonRef.current || "gesture";
        if (latest.current.visible) latest.current.onClose?.(reason);
        latest.current.onDismiss?.(reason);
      }}
    >
      <SheetInputContext.Provider value={BottomSheetTextInput}>
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          accessibilityViewIsModal
          importantForAccessibility="yes"
          onAccessibilityEscape={() => requestClose("escape")}
          enableFooterMarginAdjustment={!!footer}
          stickyHeaderIndices={[0]}
          contentContainerStyle={{
            paddingBottom: footer ? 16 : Math.max(20, insets.bottom),
          }}
        >
          <View>
            <View
              style={{
                backgroundColor: COLORS.background,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                gap: 8,
              }}
            >
              <AppText
                ref={titleRef}
                accessible
                variant="section"
                style={{ flex: 1, paddingVertical: 12 }}
              >
                {title}
              </AppText>
              {canDismiss && (
                <IconButton
                  icon="close"
                  accessibilityLabel="Đóng bảng"
                  onPress={() => requestClose("close")}
                />
              )}
            </View>
          </View>
          <View
            testID={testID ? `${testID}-content` : undefined}
            style={{ padding: 20, paddingTop: 8, gap: 12 }}
          >
            {children}
          </View>
        </BottomSheetScrollView>
      </SheetInputContext.Provider>
    </BottomSheetModal>
  );
};
