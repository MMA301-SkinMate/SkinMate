import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Button } from '../../components/common/Button';
import { profileApi } from '../../api/profileApi';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';
import { SPACING, TYPOGRAPHY, getHeadingStyle } from '../../constants/theme';
export default function ChangePasswordScreen() { const { logout } = useAuth(); const [current, setCurrent] = useState(''); const [next, setNext] = useState(''); const [busy, setBusy] = useState(false); const save = async () => { if (!current || next.length < 8) return Alert.alert('Invalid password', 'The new password must contain at least 8 characters.'); setBusy(true); try { await profileApi.changePassword({ currentPassword: current, newPassword: next }); Alert.alert('Password changed', 'Please sign in again.', [{ text: 'OK', onPress: logout }]); } catch (error) { Alert.alert('Error', error.message); } finally { setBusy(false); } }; return <ScreenWrapper><Text style={getHeadingStyle('Change password', 'title')}>Change password</Text><TextInput value={current} onChangeText={setCurrent} placeholder="Current password" placeholderTextColor={COLORS.textMuted} secureTextEntry style={styles.input} /><TextInput value={next} onChangeText={setNext} placeholder="New password" placeholderTextColor={COLORS.textMuted} secureTextEntry style={styles.input} /><Button title="Update password" loading={busy} onPress={save} style={styles.button} /></ScreenWrapper>; }
const styles = StyleSheet.create({ input: { minHeight: 50, marginTop: SPACING.md, paddingHorizontal: SPACING.md, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderDark, backgroundColor: COLORS.card, color: COLORS.textMain, ...TYPOGRAPHY.bodySmall }, button: { marginTop: SPACING.lg } });
