import { StyleSheet, View } from "react-native";
import ScreenWrapper from "../ScreenWrapper";
import { AppText } from "../common/AppText";
import { Icon } from "../common/Icon";
import { IconButton } from "../common/IconButton";
import { AppModal } from "../common/AppModal";
import { Button } from "../common/Button";
import { COLORS } from "../../constants/colors";
import { RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { AUTH_LAYOUT_COPY as COPY } from "../../constants/auth";

export default function AuthLayout({
  title,
  badge,
  description,
  children,
  footer,
  onBack,
  backLabel,
  busy = false,
  helpVisible = false,
  onOpenHelp,
  onCloseHelp,
}) {
  return (
    <ScreenWrapper
      scroll
      keyboardAvoiding
      edges={["top", "left", "right", "bottom"]}
      paddingHorizontal={SPACING.screen}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        {onBack ? (
          <IconButton
            icon="arrow-back"
            accessibilityLabel={backLabel}
            onPress={onBack}
            disabled={busy}
            style={styles.backButton}
          />
        ) : (
          <View style={styles.spacer} />
        )}
        <View style={styles.brand}>
          <Icon icon="leaf-outline" size={30} color={COLORS.primary} />
        </View>
        <View style={styles.spacer} />
      </View>
      <View style={styles.hero}>
        {!!badge && (
          <View style={styles.badge}>
            <Icon icon="leaf-outline" color={COLORS.primaryDark} size={16} />
            <AppText variant="caption" color={COLORS.primaryDark}>
              {badge}
            </AppText>
          </View>
        )}
        <AppText variant="hero" align="center">{title}</AppText>
        {!!description && (
          <AppText variant="bodySmall" color={COLORS.textSecondary} align="center">
            {description}
          </AppText>
        )}
      </View>
      <View style={styles.form}>{children}</View>
      <View style={styles.footer}>
        {footer}
        <View style={styles.footerBottom}>
          <View style={styles.trust}>
            <Icon
              icon="shield-checkmark-outline"
              color={COLORS.textSecondary}
              size={16}
            />
            <AppText variant="caption" color={COLORS.textSecondary}>
              {COPY.trust}
            </AppText>
          </View>
          {!!onOpenHelp && (
            <IconButton
              icon="help-circle-outline"
              disabled={busy}
              accessibilityLabel={COPY.help}
              onPress={onOpenHelp}
              style={styles.helpButton}
            />
          )}
        </View>
      </View>
      <AppModal
        visible={helpVisible}
        title={COPY.helpTitle}
        onClose={onCloseHelp}
        footer={<Button title={COPY.understood} onPress={onCloseHelp} />}
      >
        <AppText color={COLORS.textSecondary}>{COPY.helpBody}</AppText>
      </AppModal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
  },
  brand: {
    ...SHADOWS.light,
    width: 58,
    height: 58,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: { width: 48 },
  backButton: { backgroundColor: COLORS.card },
  hero: { gap: SPACING.xs, alignItems: "center" },
  badge: {
    flexDirection: "row",
    gap: SPACING.xxs,
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: COLORS.sage,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.pill,
  },
  form: { gap: SPACING.sm },
  footer: { gap: SPACING.sm },
  footerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  trust: {
    flexDirection: "row",
    gap: SPACING.xs,
    alignItems: "center",
    flexShrink: 1,
  },
  helpButton: { backgroundColor: COLORS.card },
});
