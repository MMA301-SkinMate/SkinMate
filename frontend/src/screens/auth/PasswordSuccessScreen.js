import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Leaf,
  LogOut,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

const COLORS = {
  background: '#F8F8FF',
  primary: '#08B981',
  dark: '#006B50',
  text: '#111629',
  muted: '#73817A',
};

export default function PasswordSuccessScreen({ navigation }) {
  const { userProfile } = useApp();

  const goToLogin = () => navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.closeButton} onPress={goToLogin} hitSlop={8}>
          <X size={21} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.securedPill}>
          <Leaf size={13} color={COLORS.dark} />
          <Text style={styles.securedText}>RITUAL VAULT SECURED</Text>
        </View>

        <View style={styles.successBadge}>
          <View style={styles.successInner}>
            <ShieldCheck size={34} color={COLORS.dark} strokeWidth={2.1} />
          </View>
          <View style={styles.statusDot}>
            <CheckCircle2 size={18} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>Password Updated!</Text>
        <Text style={styles.description}>
          Your skincare credentials have been securely refreshed. You can now effortlessly resume your personal beauty rituals.
        </Text>

        <View style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>Security Event Log</Text>
            <View style={styles.activeBadge}><Text style={styles.activeText}>Active</Text></View>
          </View>

          <InfoRow label="Account Email" value={userProfile.email || 'name@example.com'} />
          <InfoRow label="Timestamp" value="Just now" />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Session Health</Text>
            <View style={styles.sessionBadge}>
              <LogOut size={13} color={COLORS.dark} />
              <Text style={styles.sessionBadgeText}>Other devices signed out</Text>
            </View>
          </View>

          <View style={styles.twoFactorPanel}>
            <Smartphone size={19} color={COLORS.dark} />
            <Text style={styles.twoFactorText}>Two-Factor Authentication remains active for routine logs and replenishment orders.</Text>
          </View>
        </View>

        <View style={styles.intactPanel}>
          <View style={styles.intactIcon}><Leaf size={22} color={COLORS.dark} /></View>
          <View style={styles.intactCopy}>
            <Text style={styles.intactTitle}>Vanity Rituals Intact</Text>
            <Text style={styles.intactText}>Your AM/PM routines, skin barrier milestones, and dermatological records are safe and waiting.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={goToLogin} activeOpacity={0.85}>
          <Text style={styles.primaryText}>Log In to Your Vanity</Text>
          <ArrowRight size={21} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.footerSpacer} />
        <View style={styles.helpRow}>
          <CircleHelp size={14} color={COLORS.dark} />
          <Text style={styles.helpText}>Didn’t request this change? </Text>
          <Text style={styles.helpLink}>Contact Skin Concierge</Text>
        </View>
        <View style={styles.protocolPill}>
          <ShieldCheck size={14} color={COLORS.dark} />
          <Text style={styles.protocolText}>BotanicaGuard™ 256-bit Apothecary Protocol</Text>
        </View>
        <View style={styles.homeIndicator} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 },
  closeButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#A8AEBB', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: -34 },
  securedPill: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, backgroundColor: '#9BEFD2', marginBottom: 23 },
  securedText: { color: COLORS.dark, fontSize: 11, letterSpacing: 0.3 },
  successBadge: { width: 88, height: 88, borderRadius: 44, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: '#B9F3DF', shadowColor: COLORS.primary, shadowOpacity: 0.16, shadowRadius: 15, elevation: 3, marginBottom: 17 },
  successInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  statusDot: { position: 'absolute', right: -4, bottom: -2, width: 31, height: 31, borderRadius: 16, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center' },
  title: { color: COLORS.text, fontSize: 27, lineHeight: 32, fontWeight: '800', textAlign: 'center' },
  description: { color: COLORS.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6, marginHorizontal: 12, marginBottom: 18 },
  eventCard: { padding: 15, backgroundColor: '#FFFFFF', shadowColor: '#A8AEBB', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 13 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  eventTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  activeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#9BEFD2' },
  activeText: { color: COLORS.dark, fontSize: 10, fontWeight: '600' },
  infoRow: { minHeight: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  infoLabel: { color: COLORS.muted, fontSize: 11 },
  infoValue: { flex: 1, color: COLORS.text, fontSize: 11, textAlign: 'right', fontWeight: '500' },
  sessionBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#E7ECFF' },
  sessionBadgeText: { color: COLORS.dark, fontSize: 10 },
  twoFactorPanel: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, backgroundColor: '#F0F2FF', marginTop: 8 },
  twoFactorText: { flex: 1, color: '#34433E', fontSize: 10, lineHeight: 14 },
  intactPanel: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14, backgroundColor: '#D1F6EA', marginBottom: 17 },
  intactIcon: { width: 37, height: 37, borderRadius: 19, backgroundColor: '#9BEFD2', alignItems: 'center', justifyContent: 'center' },
  intactCopy: { flex: 1 },
  intactTitle: { color: COLORS.dark, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  intactText: { color: '#34433E', fontSize: 10, lineHeight: 14 },
  primaryButton: { minHeight: 50, borderRadius: 25, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: COLORS.primary, shadowOpacity: 0.22, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  footerSpacer: { flex: 1, minHeight: 54 },
  helpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  helpText: { color: '#34433E', fontSize: 10, marginLeft: 4 },
  helpLink: { color: COLORS.dark, fontSize: 10, fontWeight: '600' },
  protocolPill: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 16, backgroundColor: '#E7ECFF', marginTop: 12 },
  protocolText: { color: COLORS.muted, fontSize: 9 },
  homeIndicator: { alignSelf: 'center', width: 100, height: 4, borderRadius: 2, backgroundColor: '#D7DFF5', marginTop: 23 },
});
