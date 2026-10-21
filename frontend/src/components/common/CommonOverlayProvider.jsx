import { createContext, useCallback, useContext, useEffect, useId, useState } from 'react';
import { View } from 'react-native';

const SheetAccessibilityContext = createContext(null);

/** Keep the app behind portal-based sheets out of the accessibility tree. */
export const CommonOverlayProvider = ({ children }) => {
  const [sheets, setSheets] = useState([]);
  const register = useCallback(id => setSheets(current => current.includes(id) ? current : [...current, id]), []);
  const unregister = useCallback(id => setSheets(current => current.filter(item => item !== id)), []);
  return <SheetAccessibilityContext.Provider value={{ register, unregister }}>
    <View collapsable={false} style={{ flex: 1 }} accessibilityElementsHidden={sheets.length > 0}
      importantForAccessibility={sheets.length ? 'no-hide-descendants' : 'auto'}>{children}</View>
  </SheetAccessibilityContext.Provider>;
};

export const useSheetAccessibility = visible => {
  const id = useId();
  const context = useContext(SheetAccessibilityContext);
  const register = context?.register;
  const unregister = context?.unregister;
  useEffect(() => {
    if (!visible || !register) return undefined;
    register(id);
    return () => unregister(id);
  }, [id, visible, register, unregister]);
};
