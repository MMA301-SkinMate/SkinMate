import { Controller } from "react-hook-form";
import { TextField } from "../common/TextField";
import { PasswordField } from "../common/PasswordField";
import { Icon } from "../common/Icon";
import { COLORS } from "../../constants/colors";
import { REGISTER_COPY as COPY } from "../../constants/register";

function RegisterField({ form, name, password, next, ...props }) {
  const Field = password ? PasswordField : TextField;
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          {...props}
          ref={field.ref}
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
          required
          returnKeyType={next ? "next" : "done"}
          onSubmitEditing={next ? () => form.setFocus(next) : undefined}
        />
      )}
    />
  );
}

export default function RegisterForm({
  form,
  disabled,
  passwordHelperText,
  confirmationHelperText,
}) {
  return (
    <>
      <RegisterField
        form={form}
        name="fullName"
        next="email"
        label={COPY.fullName}
        placeholder={COPY.namePlaceholder}
        helperText={COPY.nameHint}
        textContentType="name"
        autoComplete="name"
        autoCapitalize="words"
        disabled={disabled}
        leftIcon={<Icon icon="person-outline" color={COLORS.textSecondary} />}
      />
      <RegisterField
        form={form}
        name="email"
        next="password"
        label={COPY.registerEmail}
        placeholder={COPY.emailPlaceholder}
        helperText={COPY.emailHint}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect={false}
        disabled={disabled}
        leftIcon={<Icon icon="mail-outline" color={COLORS.textSecondary} />}
      />
      <RegisterField
        form={form}
        name="password"
        password
        next="confirmPassword"
        label={COPY.password}
        placeholder={COPY.passwordPlaceholder}
        helperText={passwordHelperText}
        disabled={disabled}
        textContentType="newPassword"
        autoComplete="new-password"
        leftIcon={
          <Icon icon="lock-closed-outline" color={COLORS.textSecondary} />
        }
      />
      <RegisterField
        form={form}
        name="confirmPassword"
        password
        label={COPY.confirmation}
        placeholder={COPY.confirmationPlaceholder}
        visibilityLabel="mật khẩu xác nhận"
        disabled={disabled}
        textContentType="newPassword"
        autoComplete="new-password"
        helperText={confirmationHelperText}
        leftIcon={
          <Icon icon="lock-closed-outline" color={COLORS.textSecondary} />
        }
      />
    </>
  );
}
