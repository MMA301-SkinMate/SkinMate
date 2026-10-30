import AuthLayout from "../../components/layout/AuthLayout";
import { AlertBanner } from "../../components/common/AlertBanner";
import { Button } from "../../components/common/Button";
import { LOGIN_COPY as COPY } from "../../constants/login";
import LoginForm from "../../components/login/LoginForm";
import LoginFooter from "../../components/login/LoginFooter";
import useLogin from "../../hooks/useLogin";

export default function LoginScreen(props) {
  const login = useLogin(props);

  return (
    <AuthLayout
      title={COPY.loginTitle}
      badge={COPY.loginBadge}
      description={COPY.loginDescription}
      busy={login.busy}
      helpVisible={login.helpVisible}
      onOpenHelp={login.openHelp}
      onCloseHelp={login.closeHelp}
      footer={<LoginFooter busy={login.busy} onRegister={login.goToRegister} />}
    >
      <LoginForm form={login.form} disabled={login.disabled} />
      <Button title="Forgot password?" variant="ghost" size="sm" disabled={login.busy} onPress={() => props.navigation.navigate('ForgotPassword')} />
      {!!login.feedback && (
        <AlertBanner
          tone={login.pendingSession ? "warning" : "error"}
          description={login.feedback}
        />
      )}
      <Button
        fullWidth
        size="lg"
        loading={login.busy}
        title={login.pendingSession ? COPY.retrySession : COPY.loginAction}
        rightIcon="arrow-forward"
        onPress={login.submit}
      />
    </AuthLayout>
  );
}
