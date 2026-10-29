import { Controller } from "react-hook-form";
import { TextField } from "../../components/common/TextField";
import { PasswordField } from "../../components/common/PasswordField";
import { Icon } from "../../components/common/Icon";
import { COLORS as C } from "../../constants/colors";
import { LOGIN_COPY as COPY } from "../../constants/login";

const LoginField = ({ form, name, password, next, ...props }) => {
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
};

export default function LoginForm({ form, disabled }) {
  return (
    <>
      <LoginField
        form={form}
        name="email"
        next="password"
        label={COPY.email}
        placeholder={COPY.emailPlaceholder}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect={false}
        disabled={disabled}
        leftIcon={<Icon icon="mail-outline" color={C.textSecondary} />}
      />
      <LoginField
        form={form}
        name="password"
        password
        label={COPY.password}
        placeholder={COPY.passwordPlaceholder}
        disabled={disabled}
        textContentType="password"
        autoComplete="current-password"
        leftIcon={<Icon icon="lock-closed-outline" color={C.textSecondary} />}
      />
    </>
  );
}
