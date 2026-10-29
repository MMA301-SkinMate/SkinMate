import { forwardRef, useState } from "react";
import { TextField } from "./TextField";
import { IconButton } from "./IconButton";

/** @param {{label?: string, value?: string, onChangeText?: Function, initiallyVisible?: boolean, disabled?: boolean}} props */
export const PasswordField = forwardRef(function PasswordField(
  {
    initiallyVisible = false,
    disabled,
    visibilityLabel = "mật khẩu",
    ...props
  },
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
          accessibilityLabel={`${visible ? "Ẩn" : "Hiện"} ${visibilityLabel}`}
          disabled={disabled}
          onPress={() => setVisible((previous) => !previous)}
        />
      }
    />
  );
});
