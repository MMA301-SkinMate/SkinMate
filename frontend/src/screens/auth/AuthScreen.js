import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AtSign, Eye, EyeOff, Leaf, LockKeyhole } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useAuthSession } from '../../context/AuthSessionContext';
import { exchangeGoogleCode, getGoogleAuthorizationUrl, login } from '../../api/authApi';

const COLORS = {
  background: '#F8F8FF',
  primary: '#08B981',
  dark: '#006B50',
  text: '#111629',
  muted: '#73817A',
  icon: '#718078',
};

export default function AuthScreen({ navigation, route }) {
  const { setUserProfile } = useApp();
  const { saveAuthSession } = useAuthSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeAuthentication = async result => {
    await saveAuthSession(result);
    setUserProfile(prev => ({
      ...prev,
      name: result.user.fullName,
      email: result.user.email,
      isGuest: false,
    }));
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await login({ email: email.trim(), password });
      await completeAuthentication(result);
    } catch (error) {
      Alert.alert('Unable to sign in', error.message || 'Check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleResponse = async code => {
    if (!code || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await exchangeGoogleCode(code);
      await completeAuthentication(result);
    } catch (error) {
      Alert.alert('Google sign-in failed', error.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (route.params?.provider === 'google') {
      if (route.params.status === 'success') {
        handleGoogleResponse(route.params.code);
      } else if (route.params.status === 'error') {
        Alert.alert('Google sign-in failed', 'Please try again.');
      }
    }
  }, [route.params?.code, route.params?.provider, route.params?.status]);

  const handleGoogleSignIn = async () => {
    try {
      await Linking.openURL(getGoogleAuthorizationUrl());
    } catch (error) {
      Alert.alert('Google sign-in unavailable', error.message || 'Please try again later.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.brandMark}>
          <Leaf size={30} color={COLORS.primary} strokeWidth={2.6} />
        </View>
        <View style={styles.ritualPill}>
          <Leaf size={13} color={COLORS.dark} strokeWidth={2.2} />
          <Text style={styles.ritualText}>APOTHECARY RITUALS</Text>
        </View>

        <Text style={styles.title}>Welcome to Skincare App</Text>
        <Text style={styles.subtitle}>Your daily ritual for glowing, healthy skin</Text>

        <Text style={styles.label}>Email Address</Text>
        <InputField
          icon={<AtSign size={27} color={COLORS.icon} strokeWidth={2.2} />}
          placeholder="name@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordHeader}>
          <Text style={styles.label}>Password</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}><Text style={styles.forgot}>Forgot Password?</Text></TouchableOpacity>
        </View>
        <InputField
          icon={<LockKeyhole size={25} color={COLORS.icon} strokeWidth={2.2} />}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          rightIcon={showPassword ? <EyeOff size={25} color={COLORS.icon} /> : <Eye size={25} color={COLORS.icon} />}
          onRightIconPress={() => setShowPassword(value => !value)}
        />

        <TouchableOpacity style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]} onPress={handleSubmit} activeOpacity={0.85} disabled={isSubmitting}>
          <Text style={styles.primaryButtonText}>{isSubmitting ? 'Signing in...' : 'Sign In to Vanity'}</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR FAST UNLOCK</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <Text style={styles.appleIcon}>●</Text><Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8} onPress={handleGoogleSignIn} disabled={isSubmitting}>
            <Text style={styles.googleIcon}>G</Text><Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accent} />
        <View style={styles.signupRow}>
          <Text style={styles.signupPrompt}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InputField({ icon, rightIcon, onRightIconPress, ...inputProps }) {
  return (
    <View style={styles.inputContainer}>
      {icon}
      <TextInput {...inputProps} style={styles.input} placeholderTextColor="#718078" />
      {rightIcon && <TouchableOpacity onPress={onRightIconPress} hitSlop={10}>{rightIcon}</TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  brandMark: { width: 58, height: 58, borderRadius: 29, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: '#C9F3E8', shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4, marginBottom: 12 },
  ritualPill: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, backgroundColor: '#C9F3E8', marginBottom: 14 },
  ritualText: { color: COLORS.dark, fontSize: 12, letterSpacing: 0.2 },
  title: { color: COLORS.text, fontSize: 27, lineHeight: 32, fontWeight: '800', textAlign: 'center', letterSpacing: -0.7 },
  subtitle: { color: '#34433E', fontSize: 14, lineHeight: 18, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  label: { color: '#34433E', fontSize: 14, marginBottom: 6 },
  passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgot: { color: COLORS.primary, fontSize: 14, marginBottom: 6 },
  inputContainer: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, shadowColor: '#A8AEBB', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 14 },
  input: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 0 },
  primaryButton: { minHeight: 48, borderRadius: 24, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: COLORS.primary, shadowOpacity: 0.25, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 3, marginTop: 5 },
  buttonDisabled: { opacity: 0.65 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  arrow: { color: '#FFFFFF', fontSize: 22, lineHeight: 22 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 26 },
  divider: { flex: 1, height: 2, backgroundColor: '#DFE5FA' },
  dividerText: { color: '#66726C', fontSize: 11, letterSpacing: 0.3 },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialButton: { flex: 1, minHeight: 46, borderRadius: 23, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, shadowColor: '#A8AEBB', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  appleIcon: { color: '#111629', fontSize: 14 },
  googleIcon: { color: '#4285F4', fontSize: 15, fontWeight: '800' },
  socialText: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  accent: { alignSelf: 'center', width: 58, height: 4, borderRadius: 2, backgroundColor: '#F9D8CB', marginTop: 25, marginBottom: 19 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupPrompt: { color: '#34433E', fontSize: 13 },
  signupLink: { color: COLORS.dark, fontSize: 14, fontWeight: '700' },
});
