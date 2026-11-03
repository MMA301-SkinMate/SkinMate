import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING, TYPOGRAPHY, getHeadingStyle } from '../../constants/theme';
import { Button } from '../../components/common/Button';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const items = [
    ['person-outline', 'Personal information', 'Edit your name and avatar', 'EditProfile'],
    ['lock-closed-outline', 'Change password', 'Update your account password', 'ChangePassword'],
    ['color-palette-outline', 'Skin profile', 'Update skin type and skincare guide', 'SkinProfile'],
    ['time-outline', 'Routine history', 'Review, copy, or share previous routines', 'RoutineHistory'],
    ['share-social-outline', 'Share a routine', 'Create a community post from your routine', 'ShareRoutine'],
  ];
  return <ScreenWrapper scroll><View style={styles.profileHero}><View style={styles.avatar}><Ionicons name="person" size={25} color={COLORS.primary} /></View><View style={styles.profileCopy}><Text style={styles.hello}>YOUR ACCOUNT</Text><Text style={styles.name}>{user?.fullName || 'SkinMate member'}</Text><Text style={styles.email}>{user?.email || ''}</Text></View></View><Text style={styles.sectionHeading}>Account settings</Text><View style={styles.menu}>{items.map(([icon, title, description, screen]) => <Pressable key={screen} style={({ pressed }) => [styles.item, pressed && styles.pressed]} onPress={() => navigation.navigate(screen)}><View style={styles.icon}><Ionicons name={icon} size={20} color={COLORS.primary} /></View><View style={styles.copy}><Text style={styles.itemTitle}>{title}</Text><Text style={styles.description}>{description}</Text></View><Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} /></Pressable>)}</View><Button title="Sign out" variant="danger" leftIcon="log-out-outline" onPress={logout} style={styles.logout} /></ScreenWrapper>;
}

const styles = StyleSheet.create({ profileHero: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, marginTop: SPACING.sm, borderRadius: RADIUS.cardLarge, backgroundColor: '#e3f5ef', borderWidth: 1, borderColor: '#d3ebe2' }, avatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.82)' }, profileCopy: { flex: 1, marginLeft: SPACING.md }, hello: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: '700', letterSpacing: 1 }, name: { ...TYPOGRAPHY.section, color: COLORS.textMain, marginTop: 2 }, email: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 }, sectionHeading: { ...TYPOGRAPHY.label, color: COLORS.textSecondary, marginTop: SPACING.xl, marginBottom: SPACING.xs }, menu: { gap: SPACING.sm }, item: { minHeight: 72, flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.card, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }, pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] }, icon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e7f5f0' }, copy: { flex: 1, marginLeft: SPACING.md }, itemTitle: { ...TYPOGRAPHY.label, color: COLORS.textMain }, description: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 3 }, logout: { marginTop: SPACING.xl, marginBottom: SPACING.xl } });
