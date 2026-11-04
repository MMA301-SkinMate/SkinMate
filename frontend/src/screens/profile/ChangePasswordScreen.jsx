import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Button } from '../../components/common/Button';
import { profileApi } from '../../api/profileApi';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING, TYPOGRAPHY, getHeadingStyle } from '../../constants/theme';

export default function ChangePasswordScreen() {
  const { logout } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!current || next.length < 8) return Alert.alert('Invalid password', 'The new password must contain at least 8 characters.');
    setBusy(true);
    try { await profileApi.changePassword({ currentPassword: current, newPassword: next }); Alert.alert('Password changed', 'Please sign in again.', [{ text: 'OK', onPress: logout }]); }
    catch (error) { Alert.alert('Unable to update password', error.message); }
    finally { setBusy(false); }
  };
  return <ScreenWrapper scroll>
    <View style={styles.hero}><View style={styles.heroIcon}><Ionicons name="shield-checkmark-outline" size={25} color={COLORS.primary} /></View><View style={styles.heroCopy}><Text style={styles.eyebrow}>ACCOUNT SECURITY</Text><Text style={getHeadingStyle('Change password', 'title')}>Change password</Text></View></View>
    <Text style={styles.intro}>Use a strong password you do not use for other accounts.</Text>
    <View style={styles.form}><Text style={styles.label}>Current password</Text><TextInput value={current} onChangeText={setCurrent} placeholder="Enter current password" placeholderTextColor={COLORS.textMuted} secureTextEntry autoCapitalize="none" style={styles.input} /><Text style={[styles.label, styles.nextLabel]}>New password</Text><TextInput value={next} onChangeText={setNext} placeholder="At least 8 characters" placeholderTextColor={COLORS.textMuted} secureTextEntry autoCapitalize="none" style={styles.input} /><View style={styles.hintRow}><Ionicons name="information-circle-outline" size={16} color={COLORS.primary} /><Text style={styles.hint}>You will be asked to sign in again after changing it.</Text></View></View>
    <Button title="Update password" loading={busy} onPress={save} style={styles.button} />
  </ScreenWrapper>;
}

const styles = StyleSheet.create({ hero: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm }, heroIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryLight }, heroCopy: { marginLeft: SPACING.sm }, eyebrow: { ...TYPOGRAPHY.caption, color: COLORS.primary, letterSpacing: 0.6 }, intro: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, lineHeight: 22, marginTop: SPACING.md }, form: { marginTop: SPACING.lg, padding: SPACING.md, borderRadius: RADIUS.card, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }, label: { ...TYPOGRAPHY.label, color: COLORS.textMain, marginBottom: SPACING.xs }, nextLabel: { marginTop: SPACING.md }, input: { minHeight: 50, paddingHorizontal: SPACING.md, borderRadius: RADIUS.input, borderWidth: 1, borderColor: COLORS.borderDark, backgroundColor: COLORS.background, color: COLORS.textMain, ...TYPOGRAPHY.bodySmall }, hintRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.md }, hint: { ...TYPOGRAPHY.caption, flex: 1, color: COLORS.textSecondary }, button: { marginTop: SPACING.lg }, });
