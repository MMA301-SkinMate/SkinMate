import { forwardRef, useState } from "react";
import { TextField } from "./TextField";
import { IconButton } from "./IconButton";

/** @param {{label?: string, value?: string, onChangeText?: Function, initiallyVisible?: boolean, disabled?: boolean}} props */
export const PasswordField = forwardRef(function PasswordField(
  { initiallyVisible = false, disabled, ...props },
  ref,
) {
  const [visible, setVisible] = useState(initiallyVisible);
  return (
    <TextField
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      ref={ref}
      disabled={disabled}
      secureTextEntry={!visible}
      rightAction={
        <IconButton
          icon={visible ? "eye-off-outline" : "eye-outline"}
          accessibilityLabel={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          disabled={disabled}
          onPress={() => setVisible((previous) => !previous)}
        />
      }
    />
  );
});
