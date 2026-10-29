import { forwardRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { FieldFrame } from "../common/FieldFrame";
import { IconButton } from "../common/IconButton";
import { COLORS } from "../../constants/colors";
import { RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../../constants/theme";

export const AuthTextField = forwardRef(function AuthTextField(
  { label, required, error, helperText, disabled, leftIcon, rightAction, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  return (
    <FieldFrame label={label} required={required} error={error} helperText={helperText}>
      <View style={[
        styles.container,
        focused && styles.focused,
        error && styles.error,
        disabled && styles.disabled,
      ]}>
        {leftIcon}
        <TextInput
          {...props}
          ref={ref}
          editable={!disabled}
          accessibilityLabel={props.accessibilityLabel || `${label}${required ? ", required" : ""}`}
          accessibilityHint={error || props.accessibilityHint}
          accessibilityState={{ disabled: Boolean(disabled) }}
          placeholderTextColor={COLORS.textMuted}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          style={styles.input}
        />
        {rightAction}
      </View>
    </FieldFrame>
  );
});

export const AuthPasswordField = forwardRef(function AuthPasswordField(
  { disabled, visibilityLabel = "password", ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  return (
    <AuthTextField
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      ref={ref}
      disabled={disabled}
      secureTextEntry={!visible}
      rightAction={
        <IconButton
          icon={visible ? "eye-off-outline" : "eye-outline"}
          accessibilityLabel={`${visible ? "Hide" : "Show"} ${visibilityLabel}`}
          disabled={disabled}
          onPress={() => setVisible((value) => !value)}
        />
      }
    />
  );
});

const styles = StyleSheet.create({
  container: {
    ...SHADOWS.light,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.card,
    backgroundColor: COLORS.card,
  },
  focused: { borderColor: COLORS.primary },
  error: { borderColor: COLORS.error },
  disabled: { opacity: 0.6 },
  input: {
    ...TYPOGRAPHY.bodySmall,
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    color: COLORS.textMain,
    paddingVertical: SPACING.sm,
  },
});
