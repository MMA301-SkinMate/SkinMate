import { Choice } from "./Choice";
/** @param {{label: string, selected?: boolean, onSelect?: Function, description?: string, disabled?: boolean}} props */
export const RadioOption = ({ selected = false, onSelect, ...props }) => (
  <Choice {...props} role="radio" checked={selected} onPress={onSelect} />
);
