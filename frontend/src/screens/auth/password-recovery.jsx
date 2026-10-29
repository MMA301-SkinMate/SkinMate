import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AuthLayout from '../../components/layout/AuthLayout';
import { AuthTextField, AuthPasswordField } from '../../components/layout/auth-field';
import { AppText } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { AlertBanner } from '../../components/common/AlertBanner';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/theme';
import authApi from '../../api/authApi';
import { clearStoredSession } from '../../services/authStorage';
import { useAuth } from '../../hooks/useAuth';

const recoveryError = error => {
  const code = error.data?.error?.code;
  if (code === 'INVALID_RESET_TOKEN') return 'This link is invalid or has expired. Please request a new link.';
  if (code === 'MAIL_UNAVAILABLE') return 'Email recovery is currently unavailable. Please try again later.';
  if (error.status === 429) return 'Too many attempts. Please wait and try again.';
  if (error.status === 400) return 'Please check the information you entered.';
  return 'Unable to complete the request. Please try again.';
};

export function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [sent, setSent] = useState(false);
  const submit = async () => {
    if (inFlight.current) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 254) {
      setSent(false);
      setFeedback('Please enter a valid email address.');
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
      setFeedback('If the email belongs to an active account, a password reset link will be sent to your inbox. Check your spam folder too.');
    } catch (error) {
      setSent(false);
      setFeedback(recoveryError(error));
    } finally { inFlight.current = false; setBusy(false); }
  };
  return (
    <AuthLayout title="Forgot password?" badge="ACCOUNT RECOVERY"
      description="Enter your registered email to receive a password reset link."
      busy={busy} onBack={() => navigation.goBack()} backLabel="Back to sign in"
      footer={<Button title="Back to sign in" variant="ghost" disabled={busy} onPress={() => navigation.goBack()} />}>
      <AuthTextField label="Email address" value={email} onChangeText={setEmail}
        placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none"
        autoCorrect={false} autoComplete="email" disabled={busy}
        leftIcon={<Icon icon="mail-outline" color={COLORS.textSecondary} />} />
      <View style={styles.panel}>
        <Icon icon="shield-checkmark-outline" color={COLORS.primaryDark} />
        <AppText variant="bodySmall">The link is valid for 15 minutes and can only be used once. If you did not request it, you can ignore this email.</AppText>
      </View>
      {feedback && <AlertBanner tone={sent ? 'info' : 'error'} description={feedback} />}
      <Button title={sent ? 'Send link again' : 'Send recovery link'} loading={busy} onPress={submit} rightIcon="arrow-forward" />
    </AuthLayout>
  );
}

export function PasswordRecoveryScreen({ token, onDone }) {
  const auth = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(false);
  const validToken = /^[a-f0-9]{64}$/.test(token || '');
  const validLength = password.length >= 8 && password.length <= 128;
  const matches = Boolean(password) && password === confirmation;
  const submit = async () => {
    if (inFlight.current || !validToken || expired) return;
    if (!validLength || !matches) {
      setFeedback('Password must be 8 to 128 characters, and the confirmation must match.');
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      await authApi.resetPassword({ token, password, confirmPassword: confirmation });
      setPassword('');
      setConfirmation('');
      setSuccess(true);
    } catch (error) {
      setExpired(error.data?.error?.code === 'INVALID_RESET_TOKEN');
      setFeedback(recoveryError(error));
    } finally { inFlight.current = false; setBusy(false); }
  };
  const login = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try {
      await clearStoredSession();
      await auth.restore();
      onDone();
    } catch { setFeedback('Could not clear the previous session. Please try again.'); }
    finally { inFlight.current = false; setBusy(false); }
  };
  if (success) return (
    <AuthLayout title="Password reset successful!" badge="ACCOUNT PROTECTED"
      description="Your password has been updated. Sign in with your new password to continue."
      footer={<AppText align="center" color={COLORS.textSecondary}>Your product collection and profile have been preserved.</AppText>}>
      <View style={styles.success}><Icon icon="checkmark-circle-outline" size={64} color={COLORS.primary} /></View>
      <View style={styles.panel}><AppText variant="bodySmall">Sessions created before the password change can no longer access protected APIs.</AppText></View>
      {feedback && <AlertBanner tone="error" description={feedback} />}
      <Button title="Sign in with your new password" onPress={login} loading={busy} rightIcon="arrow-forward" />
    </AuthLayout>
  );
  return (
    <AuthLayout title="Create a new password" badge="ACCOUNT SECURITY"
      description="Create a new password to continue your skincare journey."
      footer={<Button title="Go back" variant="ghost" disabled={busy} onPress={onDone} />}>
      {!validToken || expired ? (
        <AlertBanner tone="error" description="This link is invalid or has expired. Go back to sign in and choose Forgot password to request a new link." />
      ) : <>
        <AuthPasswordField label="New password" placeholder="8 to 128 characters" value={password} onChangeText={setPassword} disabled={busy} autoComplete="new-password" textContentType="newPassword" />
        <View style={styles.panel}>
          <AppText variant="caption" color={validLength ? COLORS.primaryDark : COLORS.textSecondary}>{validLength ? '✓' : '○'} 8 to 128 characters</AppText>
          <AppText variant="caption" color={matches ? COLORS.primaryDark : COLORS.textSecondary}>{matches ? '✓' : '○'} Password confirmation matches</AppText>
        </View>
        <AuthPasswordField label="Confirm password" value={confirmation} onChangeText={setConfirmation} disabled={busy} visibilityLabel="confirmation password" autoComplete="new-password" textContentType="newPassword" />
        <Button title="Update password" loading={busy} onPress={submit} rightIcon="arrow-forward" />
      </>}
      {feedback && <AlertBanner tone="error" description={feedback} />}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: COLORS.sage, padding: SPACING.md, borderRadius: RADIUS.card, gap: SPACING.xs },
  success: { alignItems: 'center', padding: SPACING.lg },
});
