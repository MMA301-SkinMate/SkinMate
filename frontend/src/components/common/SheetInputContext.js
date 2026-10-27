import { createContext } from 'react';
import { TextInput } from 'react-native';

// Internal only: fields use the sheet-aware input without exposing its library.
export const SheetInputContext = createContext(TextInput);
