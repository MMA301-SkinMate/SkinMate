import { Pressable, StyleSheet, View } from "react-native";
import { AlertBanner } from "../../../components/common/AlertBanner";
import { AppText } from "../../../components/common/AppText";
import { Button } from "../../../components/common/Button";
import { PaginationDots } from "../../../components/common/PaginationDots";
import { COLORS } from "../../../constants/colors";
import { INTRO_COPY as COPY, INTRO_SLIDES } from "../../../constants/intro";
import { SPACING } from "../../../constants/theme";

export default function IntroFooter({
  activeIndex,
  isLastSlide,
  busy,
  error,
  onSelect,
  onNext,
  onFinish,
}) {
  return (
    <View style={styles.footer}>
      <View pointerEvents={busy ? "none" : "auto"}>
        <PaginationDots
          count={INTRO_SLIDES.length}
          activeIndex={activeIndex}
          onSelect={onSelect}
        />
      </View>
      {!!error && <AlertBanner tone="error" description={error} />}
      <Button
        fullWidth
        size="lg"
        title={error ? COPY.retry : isLastSlide ? COPY.start : COPY.next}
        rightIcon="arrow-forward"
        loading={busy}
        onPress={error ? onFinish : onNext}
      />
      <View style={styles.loginRow}>
        <AppText variant="bodySmall" color={COLORS.textSecondary}>
          {COPY.hasAccount}
        </AppText>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={COPY.login}
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={onFinish}
          style={({ pressed }) => [styles.login, pressed && styles.pressed]}
        >
          <AppText
            variant="label"
            color={COLORS.primary}
            style={styles.loginText}
          >
            {COPY.login}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: SPACING.screen,
    gap: SPACING.xs,
  },
  loginRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xxs,
  },
  login: {
    minHeight: 48,
    paddingHorizontal: SPACING.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: { textDecorationLine: "underline" },
  pressed: { opacity: 0.7 },
});
