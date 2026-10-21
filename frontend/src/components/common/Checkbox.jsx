import { Choice } from "./Choice";
/** @param {{label: string, checked?: boolean, onChange?: Function, disabled?: boolean, error?: string}} props */
export const Checkbox = ({ checked = false, onChange, ...props }) => (
  <Choice
    {...props}
    role="checkbox"
    checked={checked}
    onPress={() => onChange?.(!checked)}
  />
);
