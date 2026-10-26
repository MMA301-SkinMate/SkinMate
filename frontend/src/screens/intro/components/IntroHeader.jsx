import { StyleSheet, View } from "react-native";
import { AppText } from "../../../components/common/AppText";
import { Button } from "../../../components/common/Button";
import { Icon } from "../../../components/common/Icon";
import { IconButton } from "../../../components/common/IconButton";
import { COLORS } from "../../../constants/colors";
import { INTRO_COPY as COPY } from "../../../constants/intro";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../constants/theme";

export default function IntroHeader({
  isLastSlide,
  busy,
  onSkip,
  onHelp,
  helpTriggerRef,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Icon icon="leaf-outline" color={COLORS.background} size={20} />
        </View>
        <AppText variant="brand" color={COLORS.primary} style={styles.wordmark}>
          {COPY.brand}
        </AppText>
      </View>
      <View style={styles.actions}>
        {!isLastSlide && (
          <Button
            title={COPY.skip}
            variant="ghost"
            size="sm"
            disabled={busy}
            onPress={onSkip}
            style={styles.skip}
          />
        )}
        <IconButton
          ref={helpTriggerRef}
          icon="help-circle-outline"
          accessibilityLabel={COPY.help}
          disabled={busy}
          onPress={onHelp}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.screen,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    flexShrink: 1,
  },
  logo: {
    width: SPACING.xxl,
    height: SPACING.xxl,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontSize: TYPOGRAPHY.section.fontSize,
    lineHeight: TYPOGRAPHY.section.lineHeight,
    flexShrink: 1,
  },
  actions: { flexDirection: "row", alignItems: "center" },
  skip: { paddingHorizontal: SPACING.xs },
});
