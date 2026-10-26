import { ScrollView, StyleSheet, View } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { AppModal } from "../../components/common/AppModal";
import { AppText } from "../../components/common/AppText";
import { Button } from "../../components/common/Button";
import { COLORS } from "../../constants/colors";
import { INTRO_COPY as COPY, INTRO_SLIDES } from "../../constants/intro";
import IntroHeader from "./components/IntroHeader";
import IntroSlide from "./components/IntroSlide";
import IntroFooter from "./components/IntroFooter";
import useIntro from "./hooks/useIntro";

export default function IntroScreen() {
  const intro = useIntro();
  return (
    <ScreenWrapper
      testID="intro-screen"
      edges={["top", "left", "right", "bottom"]}
      paddingHorizontal={0}
      header={
        <IntroHeader
          isLastSlide={intro.isLastSlide}
          busy={intro.busy}
          onSkip={intro.finish}
          onHelp={intro.openHelp}
          helpTriggerRef={intro.helpTriggerRef}
        />
      }
      footer={
        <IntroFooter
          activeIndex={intro.activeIndex}
          isLastSlide={intro.isLastSlide}
          busy={intro.busy}
          error={intro.error}
          onSelect={intro.goToSlide}
          onNext={intro.next}
          onFinish={intro.finish}
        />
      }
    >
      <View
        style={styles.pager}
        onLayout={intro.onPageLayout}
        testID="intro-pager-viewport"
      >
        <View pointerEvents="none" style={styles.pinkShape} />
        <View pointerEvents="none" style={styles.sageShape} />
        {!!intro.pageWidth && (
          <ScrollView
            ref={intro.pagerRef}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={!intro.busy && !intro.helpVisible}
            onMomentumScrollEnd={intro.onPageSettled}
            testID="intro-pager"
            style={styles.pager}
          >
            {INTRO_SLIDES.map((slide, index) => (
              <IntroSlide
                key={slide.id}
                slide={slide}
                width={intro.pageWidth}
                height={intro.pageHeight}
                active={index === intro.activeIndex}
              />
            ))}
          </ScrollView>
        )}
      </View>
      <AppModal
        visible={intro.helpVisible}
        title={COPY.helpTitle}
        triggerRef={intro.helpTriggerRef}
        onClose={intro.closeHelp}
        footer={<Button title={COPY.understood} onPress={intro.closeHelp} />}
      >
        <AppText color={COLORS.textSecondary}>{COPY.helpBody}</AppText>
      </AppModal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  pager: { flex: 1 },
  pinkShape: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -40,
    left: -80,
    opacity: 0.3,
    backgroundColor: COLORS.pink,
  },
  sageShape: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    right: -100,
    bottom: 100,
    opacity: 0.25,
    backgroundColor: COLORS.sage,
  },
});
