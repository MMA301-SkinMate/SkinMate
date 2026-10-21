import { View } from "react-native";
import { Chip } from "./Chip";

/** options: { value: string, label: string, disabled?: boolean }[] */
/** @param {{options?: object[], value?: string|string[], onChange?: Function, multiple?: boolean, maxSelected?: number, disabled?: boolean}} props */
export const ChipGroup = ({
  options = [],
  value,
  onChange,
  multiple = false,
  maxSelected = Infinity,
  disabled = false,
  style,
  ...props
}) => {
  const selected = multiple ? (Array.isArray(value) ? value : []) : [value];
  return (
    <View
      {...props}
      style={[{ flexDirection: "row", flexWrap: "wrap", gap: 8 }, style]}
    >
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <Chip
            key={option.value}
            label={option.label}
            icon={option.icon}
            selected={active}
            disabled={
              disabled ||
              option.disabled ||
              (multiple && !active && selected.length >= maxSelected)
            }
            onPress={() =>
              onChange?.(
                multiple
                  ? active
                    ? selected.filter((item) => item !== option.value)
                    : [...selected, option.value]
                  : option.value,
              )
            }
          />
        );
      })}
    </View>
  );
};
