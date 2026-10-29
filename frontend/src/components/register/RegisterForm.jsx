import { Controller, useWatch } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { AppText } from "../common/AppText";
import { AuthTextField, AuthPasswordField } from "../layout/auth-field";
import { Icon } from "../common/Icon";
import { COLORS } from "../../constants/colors";
import {
  REGISTER_COPY as COPY,
  PASSWORD_REQUIREMENTS,
} from "../../constants/register";

function PasswordRequirements({ value, requirements }) {
  return (
    <View style={styles.requirements}>
      {requirements.map((requirement) => {
        const valid = requirement.test(value);
        return (
          <View key={requirement.id} style={styles.requirementRow}>
            <Icon
              icon={valid ? "checkmark-circle" : "checkmark-circle-outline"}
              size={17}
              color={valid ? COLORS.primary : COLORS.textMuted}
            />
            <AppText
              variant="caption"
              color={valid ? COLORS.primary : "textSecondary"}
              style={styles.requirementText}
              accessibilityLabel={`${requirement.label}: ${valid ? "met" : "not met"}`}
            >
              {requirement.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

function RegisterField({
  form,
  name,
  password,
  next,
  passwordRequirements,
  passwordValue,
  ...props
}) {
  const Field = password ? AuthPasswordField : AuthTextField;
  return (
    <View>
      <Controller
        control={form.control}
        name={name}
        render={({ field, fieldState }) => {
          const passwordInvalid =
            name === "password" &&
            (field.value || fieldState.isTouched || form.formState.isSubmitted) &&
            !PASSWORD_REQUIREMENTS.every((rule) => rule.test(field.value || ""));
          return (
            <Field
              {...props}
              ref={field.ref}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={name === "password"
                ? (passwordInvalid ? COPY.validation.password : undefined)
                : fieldState.error?.message}
              required
              returnKeyType={next ? "next" : "done"}
              onSubmitEditing={next ? () => form.setFocus(next) : undefined}
            />
          );
        }}
      />
      {passwordRequirements && (
        <PasswordRequirements
          value={passwordValue || ""}
          requirements={passwordRequirements}
        />
      )}
    </View>
  );
}

export default function RegisterForm({ form, disabled, confirmationHelperText }) {
  const password = useWatch({ control: form.control, name: "password" }) || "";

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
        passwordRequirements={PASSWORD_REQUIREMENTS}
        passwordValue={password}
        disabled={disabled}
        textContentType="newPassword"
        autoComplete="new-password"
        leftIcon={<Icon icon="lock-closed-outline" color={COLORS.textSecondary} />}
      />
      <RegisterField
        form={form}
        name="confirmPassword"
        password
        label={COPY.confirmation}
        placeholder={COPY.confirmationPlaceholder}
        visibilityLabel="confirmation password"
        disabled={disabled}
        textContentType="newPassword"
        autoComplete="new-password"
        helperText={confirmationHelperText}
        leftIcon={<Icon icon="lock-closed-outline" color={COLORS.textSecondary} />}
      />
    </>
  );
}

const styles = StyleSheet.create({
  requirements: {
    marginTop: 6,
    gap: 4,
  },
  requirementText: {
    flex: 1,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
