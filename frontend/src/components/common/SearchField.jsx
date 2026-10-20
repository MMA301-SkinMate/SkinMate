import { forwardRef } from "react";
import { TextField } from "./TextField";
import { IconButton } from "./IconButton";

/** @param {{value?: string, onChangeText?: Function, placeholder?: string, onClear?: Function}} props */
export const SearchField = forwardRef(function SearchField(
  {
    value = "",
    onChangeText,
    onClear,
    placeholder = "Tìm kiếm...",
    disabled,
    ...props
  },
  ref,
) {
  return (
    <TextField
      {...props}
      ref={ref}
      value={value}
      onChangeText={onChangeText}
      disabled={disabled}
      accessibilityLabel={props.accessibilityLabel || props.label || "Tìm kiếm"}
      placeholder={placeholder}
      leftIcon="search-outline"
      returnKeyType="search"
      rightAction={
        value ? (
          <IconButton
            icon="close-circle-outline"
            accessibilityLabel="Xóa tìm kiếm"
            disabled={disabled}
            onPress={() => {
              onChangeText?.("");
              onClear?.();
            }}
          />
        ) : null
      }
    />
  );
});
