import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react-native';
import { resetPassword } from '../../api/authApi';

const COLORS = {
  background: '#F8F8FF',
  primary: '#08B981',
  dark: '#006B50',
  text: '#111629',
  muted: '#73817A',
  icon: '#718078',
};

export default function NewPasswordScreen({ navigation, route }) {
  const resetToken = route.params?.token;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checks = useMemo(() => ({
    length: password.length >= 8,
    upperNumber: /[A-Z]/.test(password) && /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  }), [password, confirmPassword]);

  const completedChecks = [checks.length, checks.upperNumber, checks.symbol, checks.match];
  const isValid = completedChecks.every(Boolean);

  const handleSubmit = async () => {
    if (!resetToken || !isValid || isSubmitting) {
      if (!resetToken) Alert.alert('Invalid reset link', 'Please request a new password reset link.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(resetToken, password);
      navigation.replace('PasswordSuccess');
    } catch (error) {
      Alert.alert('Unable to reset password', error.message || 'Your reset link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.securityPill}>
          <ShieldCheck size={15} color={COLORS.dark} />
          <Text style={styles.pillText}>ACCOUNT SECURITY</Text>
        </View>

        <View style={styles.lockBadge}>
          <View style={styles.lockInner}>
            <LockKeyhole size={27} color={COLORS.primary} />
          </View>
          <View style={styles.leafBadge}>
            <Leaf size={16} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.description}>
          Your new password must be distinct from past credentials to protect your personalized ritual records.
        </Text>

        <FieldLabel label="New Password" hint="Min. 8 characters" />
        <PasswordInput
          value={password}
          onChangeText={setPassword}
          placeholder="Create a strong password"
          visible={showPassword}
          onToggle={() => setShowPassword(value => !value)}
        />

        <View style={styles.evaluation}>
          <View style={styles.evaluationHeader}>
            <Text style={styles.evaluationTitle}>Security Evaluation</Text>
            <View style={styles.strong}>
              <CheckCircle2 size={16} color={COLORS.dark} />
              <Text style={styles.strongText}>{isValid ? 'Strong Protection' : 'Build Protection'}</Text>
            </View>
          </View>
          <View style={styles.progressRow}>
            {completedChecks.map((active, index) => (
              <View key={index} style={[styles.progress, active && styles.progressActive]} />
            ))}
          </View>
        </View>

        <View style={styles.chips}>
          <Requirement label="8+ characters" active={checks.length} />
          <Requirement label="1 uppercase & 1 number" active={checks.upperNumber} />
          <Requirement label="1 special symbol" active={checks.symbol} />
        </View>

        <FieldLabel label="Confirm Password" hint={checks.match ? 'Matches' : undefined} />
        <PasswordInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repeat your password"
          visible={showConfirmPassword}
          onToggle={() => setShowConfirmPassword(value => !value)}
          confirm
        />

        <View style={styles.sessionPanel}>
          <View style={styles.sessionIcon}>
            <LockKeyhole size={21} color={COLORS.dark} />
          </View>
          <View style={styles.sessionCopy}>
            <Text style={styles.sessionTitle}>Other devices will be signed out</Text>
            <Text style={styles.sessionText}>
              Updating your password revokes existing sessions. Sign in again with your new password to continue.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !isValid && styles.disabled]}
          disabled={!isValid || isSubmitting}
          activeOpacity={0.85}
          onPress={handleSubmit}
        >
          <Text style={styles.primaryText}>{isSubmitting ? 'Updating...' : 'Update Password & Continue'}</Text>
          <ArrowRight size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.assistance}>
          Need assistance? <Text style={styles.assistanceLink}>Contact Skin Concierge</Text>
        </Text>
        <View style={styles.encryption}>
          <ShieldCheck size={17} color={COLORS.dark} />
          <Text style={styles.encryptionText}>BotanicaGuard™ 256-bit Encryption</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldLabel({ label, hint }) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function Requirement({ label, active }) {
  return (
    <View style={[styles.chip, active && styles.chipActive]}>
      {active ? (
        <Check size={14} color={COLORS.dark} strokeWidth={3} />
      ) : (
        <CheckCircle2 size={14} color={COLORS.muted} />
      )}
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function PasswordInput({ value, onChangeText, placeholder, visible, onToggle, confirm }) {
  return (
    <View style={styles.inputContainer}>
      {confirm ? (
        <ShieldCheck size={23} color={COLORS.icon} />
      ) : (
        <LockKeyhole size={23} color={COLORS.icon} />
      )}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9BA7A1"
        secureTextEntry={!visible}
      />
      <TouchableOpacity onPress={onToggle} hitSlop={10}>
        {visible ? <EyeOff size={23} color={COLORS.icon} /> : <Eye size={23} color={COLORS.icon} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  backButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#A8AEBB', shadowOpacity: 0.12, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: -23 },
  securityPill: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 19, backgroundColor: '#9BEFD2', marginBottom: 18 },
  pillText: { color: COLORS.dark, fontSize: 13, letterSpacing: 0.4 },
  lockBadge: { width: 82, height: 82, borderRadius: 41, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: '#B9F3DF', marginBottom: 17 },
  lockInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  leafBadge: { position: 'absolute', right: -5, bottom: -5, width: 29, height: 29, borderRadius: 15, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center' },
  title: { color: COLORS.text, fontSize: 27, lineHeight: 32, fontWeight: '800', textAlign: 'center' },
  description: { color: '#34433E', fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 6, marginBottom: 18 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { color: COLORS.text, fontSize: 14 },
  hint: { color: '#34433E', fontSize: 12 },
  inputContainer: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, backgroundColor: '#FFFFFF', shadowColor: '#A8AEBB', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 11 },
  input: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 0 },
  evaluation: { padding: 11, backgroundColor: '#F0F2FF', marginBottom: 8 },
  evaluationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 },
  evaluationTitle: { color: '#34433E', fontSize: 12 },
  strong: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  strongText: { color: COLORS.dark, fontSize: 12, fontWeight: '600' },
  progressRow: { flexDirection: 'row', gap: 6 },
  progress: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#D7DFF5' },
  progressActive: { backgroundColor: COLORS.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 17 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 15, backgroundColor: '#E7ECFF' },
  chipActive: { backgroundColor: '#9BEFD2' },
  chipText: { color: '#243830', fontSize: 11 },
  sessionPanel: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: '#9BEFD2', marginTop: 2, marginBottom: 14 },
  sessionIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  sessionCopy: { flex: 1 },
  sessionTitle: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  sessionText: { color: COLORS.dark, fontSize: 11, lineHeight: 16 },
  primaryButton: { minHeight: 50, borderRadius: 25, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, shadowColor: COLORS.primary, shadowOpacity: 0.22, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  disabled: { opacity: 0.55 },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  assistance: { color: '#34433E', fontSize: 12, textAlign: 'center', marginTop: 16 },
  assistanceLink: { color: COLORS.dark, fontWeight: '600' },
  encryption: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 17, backgroundColor: '#E7ECFF', marginTop: 11 },
  encryptionText: { color: '#34433E', fontSize: 11 },
});
