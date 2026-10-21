import { forwardRef, useContext, useState } from "react";
import { View } from "react-native";
import { COLORS } from "../../constants/colors";
import { TYPOGRAPHY } from "../../constants/theme";
import { FieldFrame } from "./FieldFrame";
import { SheetInputContext } from "./SheetInputContext";
import { Icon } from "./Icon";
import { resolveTextStyle, TONES } from "./commonTheme";

/** Controlled TextInput. style targets the field frame; inputStyle targets text. */
/** @param {{label?: string, value?: string, onChangeText?: Function, onBlur?: Function, error?: string, helperText?: string, required?: boolean, editable?: boolean, disabled?: boolean, multiline?: boolean}} props */
export const TextField = forwardRef(function TextField(
  {
    label,
    value,
    onChangeText,
    onBlur,
    onFocus,
    error,
    helperText,
    required = false,
    editable = true,
    disabled = false,
    multiline = false,
    leftIcon,
    rightAction,
    style,
    inputStyle,
    ...props
  },
  ref,
) {
  const Input = useContext(SheetInputContext);
  const [focused, setFocused] = useState(false);
  return (
    <FieldFrame
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      style={style}
    >
      <View
        style={{
          minHeight: multiline ? 112 : 52,
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          borderRadius: 12,
          borderWidth: focused ? 2 : 1,
          borderColor: error
            ? TONES.error.foreground
            : focused
              ? COLORS.primary
              : "#AAB4A4",
          backgroundColor: disabled ? "#ECEEE7" : COLORS.card,
          paddingHorizontal: 12,
          gap: 8,
        }}
      >
        {leftIcon && (
          <View style={{ paddingTop: multiline ? 12 : 0 }}>
            <Icon icon={leftIcon} color={COLORS.textSecondary} />
          </View>
        )}
        <Input
          {...props}
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          editable={editable && !disabled}
          multiline={multiline}
          accessibilityLabel={
            props.accessibilityLabel ||
            (label ? `${label}${required ? ", bắt buộc" : ""}` : undefined)
          }
          accessibilityHint={error || props.accessibilityHint}
          accessibilityState={{ ...props.accessibilityState, disabled }}
          placeholderTextColor={COLORS.textSecondary}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={resolveTextStyle([
            TYPOGRAPHY.body,
            {
              color: COLORS.textMain,
              flex: 1,
              minWidth: 0,
              minHeight: multiline ? 110 : 50,
              paddingVertical: 12,
              textAlignVertical: multiline ? "top" : "center",
            },
            inputStyle,
          ])}
        />
        {rightAction}
      </View>
    </FieldFrame>
  );
});
