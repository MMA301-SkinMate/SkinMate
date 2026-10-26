import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, BackHandler } from "react-native";
import { useAuth } from "../../../hooks/useAuth";
import { INTRO_COPY, INTRO_SLIDES } from "../../../constants/intro";

export default function useIntro() {
  const { completeIntro } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [helpVisible, setHelpVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const pagerRef = useRef(null);
  const helpTriggerRef = useRef(null);
  const indexRef = useRef(0);
  const finishingRef = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let motionChanged = false;
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        motionChanged = true;
        setReduceMotion(enabled);
      },
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted.current && !motionChanged) setReduceMotion(enabled);
      })
      .catch(() => {});
    return () => {
      mounted.current = false;
      listener.remove();
    };
  }, []);

  const goToSlide = useCallback(
    (index) => {
      if (finishingRef.current || helpVisible || !pageWidth) return;
      const nextIndex = Math.max(0, Math.min(INTRO_SLIDES.length - 1, index));
      indexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      pagerRef.current?.scrollTo({
        x: nextIndex * pageWidth,
        animated: !reduceMotion,
      });
    },
    [helpVisible, pageWidth, reduceMotion],
  );

  useEffect(() => {
    if (pageWidth) {
      pagerRef.current?.scrollTo({
        x: indexRef.current * pageWidth,
        animated: false,
      });
    }
  }, [pageWidth]);

  useEffect(() => {
    const listener = BackHandler.addEventListener("hardwareBackPress", () => {
      if (finishingRef.current) return true;
      if (indexRef.current === 0) return false;
      goToSlide(indexRef.current - 1);
      return true;
    });
    return () => listener.remove();
  }, [goToSlide]);

  const finish = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setBusy(true);
    setError(null);
    try {
      await completeIntro();
    } catch {
      if (mounted.current) setError(INTRO_COPY.saveFailed);
    } finally {
      finishingRef.current = false;
      if (mounted.current) setBusy(false);
    }
  }, [completeIntro]);

  const next = () => {
    if (indexRef.current === INTRO_SLIDES.length - 1) return finish();
    goToSlide(indexRef.current + 1);
  };

  const onPageLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0) setPageWidth(width);
    if (height > 0) setPageHeight(height);
  }, []);

  const onPageSettled = useCallback(
    (event) => {
      if (finishingRef.current || !pageWidth) return;
      const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      const nextIndex = Math.max(0, Math.min(INTRO_SLIDES.length - 1, index));
      indexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    },
    [pageWidth],
  );

  const openHelp = () => {
    if (!finishingRef.current) setHelpVisible(true);
  };
  const closeHelp = () => setHelpVisible(false);

  return {
    activeIndex,
    pageWidth,
    pageHeight,
    pagerRef,
    helpTriggerRef,
    helpVisible,
    busy,
    error,
    isLastSlide: activeIndex === INTRO_SLIDES.length - 1,
    goToSlide,
    next,
    finish,
    onPageLayout,
    onPageSettled,
    openHelp,
    closeHelp,
  };
}
