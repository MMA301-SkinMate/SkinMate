import AuthLayout from "../../components/layout/AuthLayout";
import { AlertBanner } from "../../components/common/AlertBanner";
import { Button } from "../../components/common/Button";
import { REGISTER_COPY as COPY, CAN_REGISTER } from "../../constants/register";
import RegisterForm from "../../components/register/RegisterForm";
import TermsConsent from "../../components/register/TermsConsent";
import RegisterFooter from "../../components/register/RegisterFooter";
import useRegister from "../../hooks/useRegister";

export default function RegisterScreen(props) {
  const register = useRegister(props);

  return (
    <AuthLayout
      title={COPY.registerTitle}
      badge={COPY.registerBadge}
      description={COPY.registerDescription}
      busy={register.busy}
      onBack={register.goToLogin}
      backLabel={COPY.back}
      helpVisible={register.helpVisible}
      onOpenHelp={register.openHelp}
      onCloseHelp={register.closeHelp}
      footer={
        <RegisterFooter busy={register.busy} onLogin={register.goToLogin} />
      }
    >
      <RegisterForm
        form={register.form}
        disabled={register.disabled}
        confirmationHelperText={register.confirmationHelperText}
      />
      <TermsConsent
        control={register.form.control}
        disabled={register.disabled}
        policy={register.policy}
        onOpenPolicy={register.openPolicy}
        onClosePolicy={register.closePolicy}
      />
      {!!register.feedback && (
        <AlertBanner
          tone={register.pendingSession ? "warning" : "error"}
          description={register.feedback}
        />
      )}
      {!CAN_REGISTER && (
        <AlertBanner tone="info" description={COPY.policiesUnavailable} />
      )}
      <Button
        fullWidth
        size="lg"
        loading={register.busy}
        disabled={!CAN_REGISTER}
        title={
          register.pendingSession ? COPY.retrySession : COPY.registerAction
        }
        rightIcon="arrow-forward"
        onPress={register.submit}
      />
    </AuthLayout>
  );
}
