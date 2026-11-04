import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Button } from '../../components/common/Button';
import { profileApi } from '../../api/profileApi';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING, TYPOGRAPHY, getHeadingStyle } from '../../constants/theme';

const TYPES = [['Da_Dau', 'Da dầu', 'water-outline'], ['Da_Kho', 'Da khô', 'sunny-outline'], ['Da_Hon_Hop_Thien_Dau', 'Da hỗn hợp thiên dầu', 'partly-sunny-outline'], ['Da_Hon_Hop_Thien_Kho', 'Da hỗn hợp thiên khô', 'cloud-outline'], ['Da_Thuong', 'Da thường', 'leaf-outline'], ['Da_Nhay_Cam', 'Da nhạy cảm', 'heart-outline']];

export default function SkinProfileScreen() {
  const [selected, setSelected] = useState('Da_Thuong');
  const [busy, setBusy] = useState(false);
  useEffect(() => { profileApi.get().then((data) => setSelected(data.skinProfile?.skinType || 'Da_Thuong')).catch((error) => Alert.alert('Unable to load profile', error.message)); }, []);
  const save = async (confirmCancelActivePlan = false) => {
    setBusy(true);
    try {
      const data = await profileApi.resetSkinProfile({ skinType: selected, confirmCancelActivePlan });
      Alert.alert('Skin profile updated', `${data.reevaluatedCount || 0} collection products were re-evaluated.`);
    } catch (error) {
      if (error.data?.error?.code === 'ACTIVE_PLAN_REQUIRES_CONFIRM') Alert.alert('Active routine', 'Changing your skin profile will cancel the active routine.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', style: 'destructive', onPress: () => save(true) }]);
      else Alert.alert('Unable to update profile', error.message);
    } finally { setBusy(false); }
  };
  return <ScreenWrapper scroll>
    <View style={styles.hero}><View style={styles.heroIcon}><Ionicons name="leaf-outline" size={25} color={COLORS.primary} /></View><View style={styles.heroCopy}><Text style={styles.eyebrow}>PERSONALIZED CARE</Text><Text style={getHeadingStyle('Skin profile', 'title')}>Skin profile</Text></View></View>
    <Text style={styles.intro}>Your skin type updates your ingredient guide and helps re-evaluate product compatibility.</Text>
    <View style={styles.grid}>{TYPES.map(([value, label, icon]) => { const active = selected === value; return <Pressable key={value} onPress={() => setSelected(value)} style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.pressed]}><View style={[styles.choiceIcon, active && styles.choiceIconActive]}><Ionicons name={icon} size={20} color={active ? COLORS.textLight : COLORS.primary} /></View><Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text>{active && <Ionicons name="checkmark-circle" size={17} color={COLORS.primary} />}</Pressable>; })}</View>
    <View style={styles.notice}><Ionicons name="sparkles-outline" size={18} color={COLORS.primary} /><Text style={styles.noticeText}>Khi lưu loại da, thành phần nên dùng và cần tránh sẽ được cập nhật vào hồ sơ da; độ phù hợp sản phẩm cũng được tính lại.</Text></View>
    <Button title="Save skin profile" loading={busy} onPress={() => save(false)} style={styles.button} />
  </ScreenWrapper>;
}

const styles = StyleSheet.create({ hero: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm }, heroIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryLight }, heroCopy: { marginLeft: SPACING.sm }, eyebrow: { ...TYPOGRAPHY.caption, color: COLORS.primary, letterSpacing: 0.6 }, intro: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, lineHeight: 22, marginTop: SPACING.md }, grid: { gap: SPACING.sm, marginTop: SPACING.lg }, choice: { minHeight: 62, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, borderRadius: RADIUS.card, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card }, choiceActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight }, choiceIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface }, choiceIconActive: { backgroundColor: COLORS.primary }, choiceText: { ...TYPOGRAPHY.label, flex: 1, color: COLORS.textMain, marginLeft: SPACING.sm }, choiceTextActive: { color: COLORS.primaryDark }, pressed: { opacity: 0.8 }, notice: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.xs, marginTop: SPACING.lg, padding: SPACING.md, borderRadius: RADIUS.input, backgroundColor: COLORS.surface }, noticeText: { ...TYPOGRAPHY.caption, flex: 1, color: COLORS.textSecondary, lineHeight: 18 }, button: { marginTop: SPACING.lg, marginBottom: SPACING.xl }, });
