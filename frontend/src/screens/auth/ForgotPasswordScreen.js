import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, AtSign, CheckCircle2, Leaf, LockKeyhole, ShieldCheck } from 'lucide-react-native';

const COLORS = {
  background: '#F8F8FF',
  primary: '#08B981',
  dark: '#006B50',
  text: '#111629',
  muted: '#73817A',
  icon: '#718078',
};

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeft size={25} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.accessPill}>
          <Leaf size={15} color={COLORS.dark} strokeWidth={2.2} />
          <Text style={styles.accessText}>SECURE ACCESS</Text>
        </View>

        <View style={styles.lockBadge}>
          <View style={styles.lockInner}><LockKeyhole size={28} color={COLORS.dark} strokeWidth={2.2} /></View>
          <View style={styles.leafBadge}><Leaf size={17} color="#FFFFFF" strokeWidth={2.4} /></View>
        </View>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.description}>Enter your registered email to receive a recovery link and restore your daily ritual journey.</Text>

        <View style={styles.fieldHeader}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.verified}><CheckCircle2 size={16} color={COLORS.dark} /><Text style={styles.verifiedText}>Verified</Text></View>
        </View>
        <View style={styles.inputContainer}>
          <AtSign size={26} color={COLORS.icon} strokeWidth={2.2} />
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor="#718078"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.privacyPanel}>
          <View style={styles.privacyIcon}><ShieldCheck size={22} color={COLORS.dark} strokeWidth={2.1} /></View>
          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>Apothecary Privacy Guarantee</Text>
            <Text style={styles.privacyText}>Single-use tokens expire in 15 minutes. Your personal botanical skin data remains encrypted and safe.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={() => navigation.navigate('NewPassword')}>
          <Text style={styles.primaryButtonText}>Send Recovery Link</Text>
          <ArrowRight size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.helpPanel}>
          <View style={styles.helpIcon}><Leaf size={24} color={COLORS.dark} /></View>
          <View style={styles.helpCopy}>
            <Text style={styles.helpTitle}>Need instant assistance?</Text>
            <Text style={styles.helpText}>Skin Ritual Concierge is online 24/7</Text>
          </View>
          <View style={styles.assistantIcon}><ShieldCheck size={19} color={COLORS.dark} /></View>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Remember your password? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Auth')}><Text style={styles.loginLink}>Log In</Text></TouchableOpacity>
        </View>
        <Text style={styles.footer}>Protected by BotanicaGuard™  •  Privacy Ritual</Text>
        <View style={styles.homeIndicator} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 18 },
  backButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#A8AEBB', shadowOpacity: 0.12, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: -25 },
  accessPill: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 19, paddingVertical: 9, borderRadius: 22, backgroundColor: '#9BEFD2', marginBottom: 30 },
  accessText: { color: COLORS.dark, fontSize: 16, letterSpacing: 0.4 },
  lockBadge: { width: 98, height: 98, borderRadius: 49, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: '#C9F3E8', marginBottom: 25 },
  lockInner: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 10, borderColor: '#9BEFD2' },
  leafBadge: { position: 'absolute', right: -7, top: -7, width: 33, height: 33, borderRadius: 17, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  title: { color: COLORS.text, fontSize: 31, lineHeight: 37, fontWeight: '800', textAlign: 'center' },
  description: { color: '#34433E', fontSize: 16, lineHeight: 27, textAlign: 'center', marginTop: 8, marginBottom: 30 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: COLORS.text, fontSize: 16 },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  verifiedText: { color: COLORS.dark, fontSize: 14 },
  inputContainer: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 29, shadowColor: '#A8AEBB', shadowOpacity: 0.12, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 18 },
  input: { flex: 1, color: COLORS.text, fontSize: 16, paddingVertical: 0 },
  privacyPanel: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 18, backgroundColor: '#C9F3E8', marginBottom: 20 },
  privacyIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  privacyCopy: { flex: 1 },
  privacyTitle: { color: COLORS.dark, fontSize: 15, fontWeight: '600', marginBottom: 3 },
  privacyText: { color: COLORS.dark, fontSize: 13, lineHeight: 18 },
  primaryButton: { minHeight: 56, borderRadius: 28, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: COLORS.primary, shadowOpacity: 0.25, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 3, marginBottom: 22 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  helpPanel: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18, backgroundColor: '#FFFFFF', shadowColor: '#A8AEBB', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 24 },
  helpIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F2FF' },
  helpCopy: { flex: 1 },
  helpTitle: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  helpText: { color: '#34433E', fontSize: 13, marginTop: 3 },
  assistantIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F2FF' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginPrompt: { color: '#34433E', fontSize: 14 },
  loginLink: { color: COLORS.dark, fontSize: 15, fontWeight: '700' },
  footer: { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginTop: 12 },
  homeIndicator: { alignSelf: 'center', width: 115, height: 4, borderRadius: 2, backgroundColor: '#D7DFF5', marginTop: 25 },
});
