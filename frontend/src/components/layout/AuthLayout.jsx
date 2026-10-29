import { StyleSheet, View } from "react-native";
import ScreenWrapper from "../ScreenWrapper";
import { AppText } from "../common/AppText";
import { Icon } from "../common/Icon";
import { IconButton } from "../common/IconButton";
import { AppModal } from "../common/AppModal";
import { Button } from "../common/Button";
import { COLORS } from "../../constants/colors";
import { RADIUS, SPACING } from "../../constants/theme";
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
      <View
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={styles.pinkShape}
      />
      <View
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={styles.sageShape}
      />
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
          <Icon icon="leaf-outline" size={24} color={COLORS.primary} />
          <AppText color={COLORS.primary} variant="brand">
            {COPY.brand}
          </AppText>
        </View>
        <View style={styles.spacer} />
      </View>
      <View style={styles.hero}>
        {!!badge && (
          <View style={styles.badge}>
            <Icon icon="leaf-outline" color={COLORS.success} size={16} />
            <AppText variant="caption" color={COLORS.success}>
              {badge}
            </AppText>
          </View>
        )}
        <AppText variant="hero">{title}</AppText>
        {!!description && (
          <AppText variant="bodySmall" color={COLORS.textSecondary}>
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
    gap: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  spacer: { width: 48 },
  backButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hero: { gap: SPACING.sm },
  badge: {
    flexDirection: "row",
    gap: SPACING.xs,
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.sage,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.pill,
  },
  form: { gap: SPACING.md },
  footer: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  footerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.xs,
  },
  trust: {
    flexDirection: "row",
    gap: SPACING.xxs,
    alignItems: "center",
    flexShrink: 1,
  },
  helpButton: { backgroundColor: COLORS.pink },
  pinkShape: {
    position: "absolute",
    right: -60,
    top: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.pink,
    opacity: 0.3,
  },
  sageShape: {
    position: "absolute",
    left: -110,
    top: 300,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.sage,
    opacity: 0.25,
  },
});
