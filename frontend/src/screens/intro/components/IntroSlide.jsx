import { Image, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "../../../components/common/AppText";
import { Icon } from "../../../components/common/Icon";
import { COLORS, withOpacity } from "../../../constants/colors";
import { RADIUS, SHADOWS, SPACING } from "../../../constants/theme";

export default function IntroSlide({ slide, width, height, active }) {
  const accent = COLORS[slide.accent];
  // Leave room for the copy and controls; short screens can still scroll vertically.
  const illustrationWidth = Math.min(
    310,
    width - SPACING.screen * 2,
    Math.max(180, height - 240) / (3.8 / 4),
  );
  return (
    <ScrollView
      style={[styles.page, { width }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? "auto" : "no-hide-descendants"}
      testID={`intro-slide-${slide.id}`}
    >
      <View style={[styles.illustration, { width: illustrationWidth }]}>
        <View
          pointerEvents="none"
          style={[
            styles.frameAccent,
            { backgroundColor: withOpacity(accent, 0.5) },
          ]}
        />
        <View style={styles.frame}>
          <Image
            source={slide.image}
            accessibilityLabel={slide.imageLabel}
            accessible
            resizeMode="cover"
            style={styles.image}
          />
        </View>
        <View style={styles.sticker} accessible={false}>
          <Icon icon={slide.icon} size={24} color={COLORS.primary} />
        </View>
        <View style={[styles.caption, { backgroundColor: accent }]}>
          <Icon icon={slide.captionIcon} size={16} color={COLORS.primaryDark} />
          <AppText
            variant="caption"
            color={COLORS.primaryDark}
            style={styles.captionText}
          >
            {slide.caption}
          </AppText>
        </View>
      </View>
      <View style={styles.copy}>
        <View style={[styles.badge, { backgroundColor: accent }]}>
          <AppText variant="caption" color={COLORS.primaryDark}>
            {slide.badge}
          </AppText>
        </View>
        <AppText variant="hero" align="center">
          {slide.title}
        </AppText>
        <AppText
          variant="bodySmall"
          color={COLORS.textSecondary}
          align="center"
        >
          {slide.description}
        </AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 0, flexShrink: 0 },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: SPACING.screen,
    paddingVertical: SPACING.md,
    gap: SPACING.xl,
  },
  illustration: { width: "100%", maxWidth: 310, aspectRatio: 4 / 3.8 },
  frameAccent: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.cardLarge,
    transform: [{ rotate: "-3deg" }, { scale: 0.97 }],
  },
  frame: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.cardLarge,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    ...SHADOWS.light,
  },
  image: { width: "100%", height: "100%", borderRadius: RADIUS.card },
  sticker: {
    position: "absolute",
    top: -SPACING.sm,
    right: -SPACING.xs,
    padding: SPACING.sm,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    backgroundColor: COLORS.background,
  },
  caption: {
    position: "absolute",
    bottom: -SPACING.xs,
    left: -SPACING.xs,
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  captionText: { flexShrink: 1 },
  copy: { width: "100%", maxWidth: 360, alignItems: "center", gap: SPACING.sm },
  badge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
  },
});
