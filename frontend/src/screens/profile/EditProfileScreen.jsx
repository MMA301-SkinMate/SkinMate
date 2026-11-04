import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Button } from '../../components/common/Button';
import { profileApi } from '../../api/profileApi';
import { COLORS } from '../../constants/colors';
import { FONT_FAMILIES, RADIUS, SPACING, TYPOGRAPHY, getHeadingStyle } from '../../constants/theme';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    profileApi.get().then((data) => {
      if (mounted) { setName(data.fullName || ''); setAvatar(data.avatarUrl || ''); }
    }).catch((error) => Alert.alert('Unable to load profile', error.message));
    return () => { mounted = false; };
  }, []);

  const save = async () => {
    if (name.trim().length < 2) return Alert.alert('Invalid name', 'Name must contain at least 2 characters.');
    if (avatar.trim() && !/^https?:\/\//i.test(avatar.trim())) return Alert.alert('Invalid avatar URL', 'Enter a valid image URL starting with http:// or https://.');
    setBusy(true);
    try {
      await profileApi.updateAccount({ fullName: name.trim(), avatarUrl: avatar.trim() || null });
      Alert.alert('Saved', 'Your profile has been updated.');
      navigation.goBack();
    } catch (error) { Alert.alert('Unable to save', error.message); }
    finally { setBusy(false); }
  };

  return (
    <ScreenWrapper scroll>
      <Text style={styles.kicker}>ACCOUNT</Text>
      <Text style={getHeadingStyle('Edit profile', 'title')}>Edit profile</Text>
      <Text style={styles.intro}>Personalize how you appear across SkinMate.</Text>
      <View style={styles.previewCard}>
        <View style={styles.avatarFrame}>{avatar.trim() ? <Image source={{ uri: avatar.trim() }} style={styles.avatar} /> : <Ionicons name="person" size={30} color={COLORS.primary} />}</View>
        <View style={styles.previewCopy}><Text style={styles.previewLabel}>PROFILE PREVIEW</Text><Text style={styles.previewName} numberOfLines={1}>{name.trim() || 'Your name'}</Text><Text style={styles.previewHint}>Your account identity</Text></View>
      </View>
      <View style={styles.formCard}>
        <Text style={styles.label}>Display name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={COLORS.textMuted} style={styles.input} maxLength={80} />
        <Text style={[styles.label, styles.avatarLabel]}>Avatar image URL</Text>
        <TextInput value={avatar} onChangeText={setAvatar} placeholder="https://example.com/avatar.jpg" placeholderTextColor={COLORS.textMuted} autoCapitalize="none" autoCorrect={false} keyboardType="url" style={styles.input} />
        <Text style={styles.helper}>Use a public image URL. You can leave it blank to use the default avatar.</Text>
      </View>
      <Button title="Save changes" loading={busy} onPress={save} style={styles.button} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  kicker: { ...TYPOGRAPHY.caption, fontFamily: FONT_FAMILIES.interSemiBold, color: COLORS.primary, letterSpacing: 1, marginTop: SPACING.sm, marginBottom: 3 },
  intro: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginTop: SPACING.xs, lineHeight: 22 },
  previewCard: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.lg, padding: SPACING.md, borderRadius: RADIUS.card, backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.border },
  avatarFrame: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: COLORS.card }, avatar: { width: '100%', height: '100%' },
  previewCopy: { flex: 1, marginLeft: SPACING.md }, previewLabel: { ...TYPOGRAPHY.caption, color: COLORS.primary, letterSpacing: 0.7 }, previewName: { ...TYPOGRAPHY.label, color: COLORS.textMain, marginTop: 4 }, previewHint: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  formCard: { marginTop: SPACING.lg, padding: SPACING.md, borderRadius: RADIUS.card, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  label: { ...TYPOGRAPHY.label, color: COLORS.textMain, marginBottom: SPACING.xs }, avatarLabel: { marginTop: SPACING.md },
  input: { minHeight: 50, paddingHorizontal: SPACING.md, borderRadius: RADIUS.input, borderWidth: 1, borderColor: COLORS.borderDark, backgroundColor: COLORS.background, color: COLORS.textMain, ...TYPOGRAPHY.bodySmall },
  helper: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, lineHeight: 18, marginTop: SPACING.xs }, button: { marginTop: SPACING.lg, marginBottom: SPACING.xl },
});
