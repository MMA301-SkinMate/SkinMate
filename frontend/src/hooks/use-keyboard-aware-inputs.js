import { useEffect, useRef, useState } from 'react';
import { findNodeHandle, Keyboard } from 'react-native';

export default function useKeyboardAwareInputs() {
  const scrollViewRef = useRef(null);
  const inputs = useRef({});
  const focusedKey = useRef(null);
  const keyboardVisible = useRef(false);
  const timer = useRef(null);
  const [heights, setHeights] = useState({});

  const scrollInput = (key, delay = 120) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const input = inputs.current[key];
      const scrollView = scrollViewRef.current;
      if (!input?.isFocused?.() || !scrollView) return;
      const handle = findNodeHandle(input);
      if (handle && typeof scrollView.scrollToFocusedInput === 'function') {
        scrollView.scrollToFocusedInput(handle, 110, 100);
      }
    }, delay);
  };

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      keyboardVisible.current = true;
      if (focusedKey.current) scrollInput(focusedKey.current, 100);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => { keyboardVisible.current = false; });
    return () => {
      show.remove();
      hide.remove();
      clearTimeout(timer.current);
    };
  }, []);

  const inputProps = (key, minHeight) => ({
    ref: ref => { inputs.current[key] = ref; },
    onFocus: () => {
      focusedKey.current = key;
      scrollInput(key, keyboardVisible.current ? 80 : 300);
    },
    ...(minHeight === undefined ? {} : {
      multiline: true,
      scrollEnabled: false,
      submitBehavior: 'newline',
      onContentSizeChange: event => {
        const height = Math.max(minHeight, Math.ceil(event.nativeEvent.contentSize.height) + 12);
        setHeights(current => current[key] === height ? current : { ...current, [key]: height });
        if (keyboardVisible.current && focusedKey.current === key) scrollInput(key);
      },
    }),
  });

  const inputStyle = (key, minHeight) => ({ height: heights[key] || minHeight, flexShrink: 0, textAlignVertical: 'top' });
  return { scrollViewRef, inputProps, inputStyle };
}
