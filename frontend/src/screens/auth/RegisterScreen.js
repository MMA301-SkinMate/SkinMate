import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AtSign,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useAuthSession } from '../../context/AuthSessionContext';
import { getGoogleAuthorizationUrl, register } from '../../api/authApi';
import { Linking } from 'react-native';

const AUTH_BACKGROUND = '#F8F8FF';
const AUTH_PRIMARY = '#08B981';
const AUTH_PRIMARY_DARK = '#006B50';
const MUTED = '#73817A';
const INPUT_ICON = '#718078';
const CHIP_BACKGROUND = '#E7ECFF';
const PANEL_BACKGROUND = '#F0F2FF';

const requirements = [
  { key: 'length', label: '8+ characters' },
  { key: 'number', label: '1 number' },
  { key: 'match', label: 'Passwords match' },
];

export default function RegisterScreen({ navigation }) {
  const { setUserProfile } = useApp();
  const { saveAuthSession } = useAuthSession();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('Hydration & Dew');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRequirements = useMemo(() => ({
    length: password.length >= 8,
    number: /\d/.test(password),
    match: password.length > 0 && password === confirmPassword,
  }), [password, confirmPassword]);

  const handleSubmit = async () => {
    if (!acceptedTerms || !fullName.trim() || !email.trim() || !passwordRequirements.length || !passwordRequirements.number || !passwordRequirements.match || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await register({ fullName: fullName.trim(), email: email.trim(), password });
      await saveAuthSession(result);
      setUserProfile(prev => ({
        ...prev,
        name: result.user.fullName,
        email: result.user.email,
        isGuest: false,
        skinGoal: selectedTarget,
      }));
      navigation.navigate('SkinProfileSetup');
    } catch (error) {
      Alert.alert('Unable to create account', error.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await Linking.openURL(getGoogleAuthorizationUrl());
    } catch (error) {
      Alert.alert('Google sign-in unavailable', error.message || 'Please try again later.');
    }
  };

  const handleLogIn = () => {
    navigation.navigate('Auth');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandMark}>
            <Leaf size={29} color={AUTH_PRIMARY} strokeWidth={2.6} />
          </View>

          <View style={styles.ritualPill}>
            <Leaf size={12} color={AUTH_PRIMARY_DARK} strokeWidth={2.2} />
            <Text style={styles.ritualText}>APOTHECARY RITUALS</Text>
          </View>

          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Begin your personalized daily skin ritual</Text>

          <FieldLabel label="Full Name" hint="Required" />
          <InputField
            icon={<UserRound size={25} color={INPUT_ICON} strokeWidth={2.2} />}
            placeholder="e.g. Elena Rostova"
            value={fullName}
            onChangeText={setFullName}
          />

          <FieldLabel label="Email Address" hint="For routine reminders" />
          <InputField
            icon={<AtSign size={27} color={INPUT_ICON} strokeWidth={2.2} />}
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FieldLabel label="Password" />
          <InputField
            icon={<LockKeyhole size={25} color={INPUT_ICON} strokeWidth={2.2} />}
            placeholder="Create strong password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? <EyeOff size={25} color={INPUT_ICON} /> : <Eye size={25} color={INPUT_ICON} />}
            onRightIconPress={() => setShowPassword(value => !value)}
          />

          <FieldLabel label="Confirm Password" />
          <InputField
            icon={<ShieldCheck size={25} color={INPUT_ICON} strokeWidth={2.2} />}
            placeholder="Repeat password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            rightIcon={showConfirmPassword ? <EyeOff size={25} color={INPUT_ICON} /> : undefined}
            onRightIconPress={() => setShowConfirmPassword(value => !value)}
          />

          <View style={styles.requirementsRow}>
            {requirements.map(requirement => (
              <View key={requirement.key} style={styles.requirementChip}>
                <CheckCircle2
                  size={16}
                  color={passwordRequirements[requirement.key] ? AUTH_PRIMARY_DARK : MUTED}
                  strokeWidth={2}
                />
                <Text style={styles.requirementText}>{requirement.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.goalPanel}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleRow}>
                <Leaf size={13} color={AUTH_PRIMARY_DARK} strokeWidth={2.2} />
                <Text style={styles.goalTitle}>Skin Barrier Target</Text>
              </View>
              <Text style={styles.optionalText}>Optional</Text>
            </View>
            <View style={styles.goalOptions}>
              {['Hydration & Dew', 'Calm Redness', 'Clarify Pores'].map(target => (
                <TouchableOpacity
                  key={target}
                  style={[styles.goalChip, selectedTarget === target && styles.goalChipSelected]}
                  onPress={() => setSelectedTarget(target)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.goalChipText}>{target}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAcceptedTerms(value => !value)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxSelected]}>
              {acceptedTerms && <Check size={17} color="#FFFFFF" strokeWidth={3} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, (!acceptedTerms || !fullName || !email || !passwordRequirements.length || !passwordRequirements.number || !passwordRequirements.match) && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            disabled={!acceptedTerms || !fullName.trim() || !email.trim() || !passwordRequirements.length || !passwordRequirements.number || !passwordRequirements.match || isSubmitting}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>{isSubmitting ? 'Creating account...' : 'Join Vanity Ritual'}</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR FAST SIGN UP</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <Text style={styles.appleIcon}>●</Text>
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8} onPress={handleGoogleSignIn} disabled={isSubmitting}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.verifiedPanel}>
            <View style={styles.verifiedIcon}>
              <ShieldCheck size={17} color={AUTH_PRIMARY_DARK} strokeWidth={2.2} />
            </View>
            <View style={styles.verifiedCopy}>
              <Text style={styles.verifiedTitle}>Dermatology Verified</Text>
              <Text style={styles.verifiedSubtitle}>Formulated routines free of synthetic irritants</Text>
            </View>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogIn}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldLabel({ label, hint }) {
  return (
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

function InputField({ icon, rightIcon, onRightIconPress, ...inputProps }) {
  return (
    <View style={styles.inputContainer}>
      {icon}
      <TextInput
        {...inputProps}
        style={styles.input}
        placeholderTextColor="#9BA7A1"
      />
      {rightIcon ? (
        <TouchableOpacity onPress={onRightIconPress} hitSlop={10}>
          {rightIcon}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AUTH_BACKGROUND,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  brandMark: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: AUTH_PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
    marginBottom: 8,
  },
  ritualPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#C9F3E8',
    marginBottom: 8,
  },
  ritualText: {
    color: AUTH_PRIMARY_DARK,
    fontSize: 12,
    letterSpacing: 0.4,
    fontWeight: '400',
  },
  title: {
    color: '#111629',
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1.2,
  },
  subtitle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 14,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  fieldLabel: {
    color: '#111629',
    fontSize: 14,
    fontWeight: '500',
  },
  fieldHint: {
    color: MUTED,
    fontSize: 11,
  },
  inputContainer: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 38,
    shadowColor: '#A8AEBB',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 11,
  },
  input: {
    flex: 1,
    color: '#111629',
    fontSize: 14,
    paddingVertical: 0,
  },
  requirementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: -4,
    marginBottom: 12,
  },
  requirementChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 19,
    backgroundColor: CHIP_BACKGROUND,
  },
  requirementText: {
    color: '#263343',
    fontSize: 11,
  },
  goalPanel: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: PANEL_BACKGROUND,
    marginBottom: 13,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  goalTitle: {
    color: '#33423D',
    fontSize: 12,
  },
  optionalText: {
    color: AUTH_PRIMARY_DARK,
    fontSize: 12,
    fontWeight: '600',
  },
  goalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  goalChip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#A8AEBB',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  goalChipSelected: {
    borderWidth: 1,
    borderColor: '#C6D7FF',
  },
  goalChipText: {
    color: '#111629',
    fontSize: 11,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#A8AEBB',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: AUTH_PRIMARY,
  },
  termsText: {
    flex: 1,
    color: '#35423E',
    fontSize: 12,
    lineHeight: 16,
  },
  linkText: {
    color: AUTH_PRIMARY_DARK,
    textDecorationLine: 'underline',
  },
  primaryButton: {
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: AUTH_PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    shadowColor: AUTH_PRIMARY,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 13,
  },
  divider: {
    flex: 1,
    height: 2,
    backgroundColor: '#DFE5FA',
  },
  dividerText: {
    color: '#66726C',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  socialButton: {
    flex: 1,
    minHeight: 39,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    shadowColor: '#A8AEBB',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  appleIcon: {
    color: '#111629',
    fontSize: 12,
  },
  googleIcon: {
    color: '#4285F4',
    fontSize: 12,
    fontWeight: '800',
  },
  socialText: {
    color: '#111629',
    fontSize: 13,
    fontWeight: '500',
  },
  verifiedPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: PANEL_BACKGROUND,
    marginBottom: 16,
  },
  verifiedIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B8F5E3',
  },
  verifiedCopy: {
    flex: 1,
  },
  verifiedTitle: {
    color: '#111629',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  verifiedSubtitle: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 14,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    color: MUTED,
    fontSize: 12,
  },
  loginLink: {
    color: AUTH_PRIMARY_DARK,
    fontSize: 12,
    fontWeight: '700',
  },
});
