import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';
import { FONT_FAMILIES, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Button } from '../../components/common/Button';

const MENU = [
  { icon: 'person-outline', title: 'Edit profile', detail: 'Name and avatar URL', screen: 'EditProfile' },
  { icon: 'lock-closed-outline', title: 'Change password', detail: 'Keep your account secure', screen: 'ChangePassword' },
  { icon: 'color-palette-outline', title: 'Skin profile', detail: 'Skin type and ingredient guide', screen: 'SkinProfile' },
  { icon: 'time-outline', title: 'Routine history', detail: 'Review and reuse past routines', screen: 'RoutineHistory' },
  { icon: 'share-social-outline', title: 'Share a routine', detail: 'Create a community post', screen: 'ShareRoutine' },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  return (
    <ScreenWrapper scroll>
      <View style={styles.hero}>
        <View style={styles.avatarFrame}>
          {user?.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={styles.avatar} /> : <Ionicons name="person" size={28} color={COLORS.primary} />}
        </View>
        <View style={styles.identity}>
          <Text style={styles.eyebrow}>YOUR SKINMATE ACCOUNT</Text>
          <Text style={styles.name} numberOfLines={1}>{user?.fullName || 'SkinMate member'}</Text>
          <Text style={styles.email} numberOfLines={1}>{user?.email || 'Welcome to your skincare space'}</Text>
        </View>
        <Ionicons name="sparkles" size={20} color={COLORS.primary} />
      </View>

      <View style={styles.sectionHeader}>
        <View><Text style={styles.sectionTitle}>Your account</Text><Text style={styles.sectionHint}>Manage your profile and skincare settings</Text></View>
      </View>
      <View style={styles.menu}>
        {MENU.map((item, index) => (
          <Pressable key={item.screen} style={({ pressed }) => [styles.menuItem, index === MENU.length - 1 && styles.lastItem, pressed && styles.pressed]} onPress={() => navigation.navigate(item.screen)}>
            <View style={styles.menuIcon}><Ionicons name={item.icon} size={20} color={COLORS.primary} /></View>
            <View style={styles.menuCopy}><Text style={styles.menuTitle}>{item.title}</Text><Text style={styles.menuDetail}>{item.detail}</Text></View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>
        ))}
      </View>
      <Button title="Sign out" variant="danger" leftIcon="log-out-outline" onPress={logout} style={styles.logout} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, marginTop: SPACING.sm, borderRadius: RADIUS.cardLarge, backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.border },
  avatarFrame: { width: 60, height: 60, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: COLORS.card },
  avatar: { width: '100%', height: '100%' }, identity: { flex: 1, marginLeft: SPACING.md, marginRight: SPACING.sm },
  eyebrow: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontFamily: FONT_FAMILIES.interSemiBold, letterSpacing: 0.7 },
  name: { ...TYPOGRAPHY.section, color: COLORS.textMain, marginTop: 3 }, email: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  sectionHeader: { marginTop: SPACING.xl, marginBottom: SPACING.sm }, sectionTitle: { ...TYPOGRAPHY.section, color: COLORS.textMain }, sectionHint: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  menu: { overflow: 'hidden', borderRadius: RADIUS.card, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  menuItem: { minHeight: 76, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border }, lastItem: { borderBottomWidth: 0 },
  menuIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  menuCopy: { flex: 1, marginHorizontal: SPACING.md }, menuTitle: { ...TYPOGRAPHY.label, color: COLORS.textMain }, menuDetail: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  pressed: { backgroundColor: COLORS.surface }, logout: { marginTop: SPACING.xl, marginBottom: SPACING.xl },
});
