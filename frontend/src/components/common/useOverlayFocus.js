import { useCallback, useEffect, useRef } from "react";
import { AccessibilityInfo, findNodeHandle } from "react-native";

const focus = (ref) => {
  const node = ref?.current && findNodeHandle(ref.current);
  if (typeof node === "number") AccessibilityInfo.setAccessibilityFocus(node);
};

export const useOverlayFocus = (visible, triggerRef) => {
  const titleRef = useRef(null);
  const previous = useRef(false);
  useEffect(() => {
    let timer;
    if (previous.current && !visible)
      timer = setTimeout(() => focus(triggerRef), 250);
    previous.current = visible;
    return () => clearTimeout(timer);
  }, [visible, triggerRef]);
  const focusTitle = useCallback(() => focus(titleRef), []);
  return { titleRef, focusTitle };
};
