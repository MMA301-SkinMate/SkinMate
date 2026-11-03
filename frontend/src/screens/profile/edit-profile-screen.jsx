import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { getAccountProfile, saveAccountProfile } from '../../api/account-profile';

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || null);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getAccountProfile().then(res => {
      if (!active) return;
      setFullName(res.data.user.fullName);
      setPhoneNumber(res.data.user.phoneNumber || '');
      setAvatarUrl(res.data.user.avatarUrl);
    }).catch(err => { if (active) setError(err.message || 'Unable to load profile.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const pickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert('Permission required', 'Allow photo library access to choose an avatar.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset.fileSize > 5 * 1024 * 1024) return Alert.alert('Image too large', 'Choose an image smaller than 5 MB.');
      setAvatar(asset);
    } catch (err) { Alert.alert('Unable to select photo', err.message || 'Please try again.'); }
  };

  const save = async () => {
    if (saving) return;
    if (fullName.trim().length < 2 || fullName.trim().length > 100) return Alert.alert('Invalid name', 'Enter 2–100 characters.');
    if (phoneNumber.trim() && !/^\+?[0-9]{7,15}$/.test(phoneNumber.trim())) return Alert.alert('Invalid phone number', 'Enter 7–15 digits, optionally starting with +.');
    setSaving(true);
    try {
      const res = await saveAccountProfile({ fullName, phoneNumber, avatar });
      await updateUser(res.data.user);
      Alert.alert('Profile updated', 'Your changes have been saved.', [{ text: 'Done', onPress: () => navigation.goBack() }]);
    } catch (err) { Alert.alert('Unable to save profile', err.message || 'Please try again.'); }
    finally { setSaving(false); }
  };

  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} disabled={saving} accessibilityLabel="Go back" style={styles.back}><Ionicons name="arrow-back" size={23} color={Colors.text} /></TouchableOpacity>
      <Text style={styles.title}>Edit profile</Text>
      <TouchableOpacity style={styles.back} onPress={save} disabled={loading || saving || !!error} accessibilityLabel="Save profile"><Text style={styles.headerSave}>Save</Text></TouchableOpacity>
    </View>
    {loading ? <ActivityIndicator style={styles.loader} color={Colors.primary} /> : <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity disabled={saving || !!error} onPress={pickAvatar} style={styles.avatarButton} accessibilityLabel="Change profile photo">
        {avatar?.uri || avatarUrl ? <Image source={{ uri: avatar?.uri || avatarUrl }} style={styles.avatar} /> : <View style={styles.avatarPlaceholder}><Ionicons name="person" size={48} color={Colors.primaryDark} /></View>}
        <View style={styles.camera}><Ionicons name="camera" size={19} color={Colors.textLight} /></View>
      </TouchableOpacity>
      <TouchableOpacity onPress={pickAvatar} disabled={saving || !!error} style={styles.photoAction} accessibilityLabel="Choose a new avatar">
        <Ionicons name="image-outline" size={15} color={Colors.primaryDark} /><Text style={styles.photoLabel}>Change profile photo</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>JPG, PNG or WebP · Maximum 5 MB</Text>
      <View style={styles.card}>
        <View style={styles.labelRow}><Text style={styles.label}>Full name *</Text><Ionicons name="person-outline" size={16} color={Colors.primaryDark} /></View>
        <TextInput value={fullName} onChangeText={setFullName} maxLength={100} editable={!saving && !error} style={styles.input} autoComplete="name" accessibilityLabel="Full name" />
        <View style={styles.labelRow}><Text style={styles.label}>Phone number</Text><Text style={styles.optional}>Optional</Text></View>
        <TextInput value={phoneNumber} onChangeText={setPhoneNumber} maxLength={16} editable={!saving && !error} keyboardType="phone-pad" autoComplete="tel" placeholder="e.g. +84901234567" placeholderTextColor={Colors.textSecondary} style={styles.input} accessibilityLabel="Phone number" />
        <View style={styles.labelRow}><Text style={styles.label}>Linked email</Text><Ionicons name="lock-closed-outline" size={15} color={Colors.textSecondary} /></View>
        <View style={styles.emailRow}><Ionicons name="mail-outline" size={17} color={Colors.textSecondary} /><Text style={styles.email}>{user?.email}</Text></View>
        <Text style={styles.hint}>Your sign-in email cannot be changed here.</Text>
      </View>
      <TouchableOpacity onPress={save} disabled={saving || !!error} style={[styles.save, (saving || !!error) && styles.disabled]}>
        {saving ? <ActivityIndicator color={Colors.textLight} /> : <Text style={styles.saveText}>Save changes</Text>}
      </TouchableOpacity>
    </ScrollView>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, backgroundColor: Colors.background },
  back: { width: 44, height: 52, justifyContent: 'center' },
  headerSave: { color: Colors.primary, fontWeight: '700', textAlign: 'right' },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 8 },
  optional: { fontSize: 11, color: Colors.textSecondary },
  photoAction: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 16, marginTop: 14, marginBottom: 6, borderRadius: 22, backgroundColor: Colors.primaryLight },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, backgroundColor: Colors.surface, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  loader: { marginTop: 40 },
  content: { padding: 20, paddingBottom: 40 },
  avatarButton: { alignSelf: 'center', marginTop: 18, padding: 4, borderWidth: 2, borderColor: Colors.primaryLight, borderRadius: 76, backgroundColor: Colors.background },
  avatar: { width: 128, height: 128, borderRadius: 64 },
  avatarPlaceholder: { width: 128, height: 128, borderRadius: 64, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  camera: { position: 'absolute', right: 0, bottom: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  photoLabel: { color: Colors.primaryDark, fontWeight: '600', fontSize: 12 },
  hint: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  card: { paddingHorizontal: 18, paddingBottom: 20, borderRadius: 20, backgroundColor: Colors.background, marginTop: 26, borderWidth: 1, borderColor: Colors.border },
  label: { color: Colors.text, fontWeight: '600', fontSize: 13 },
  input: { minHeight: 48, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, color: Colors.text, backgroundColor: Colors.surface },
  email: { color: Colors.textSecondary, paddingVertical: 12 },
  save: { minHeight: 50, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  saveText: { color: Colors.textLight, fontWeight: '700', fontSize: 15 },
  disabled: { opacity: 0.5 },
  error: { color: Colors.error, marginBottom: 16 },
});
