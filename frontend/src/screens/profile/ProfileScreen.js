import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, History, LogOut } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useAuthSession } from '../../context/AuthSessionContext';
import { logout } from '../../api/authApi';

export default function ProfileScreen({ navigation }) {
  const { userProfile, setUserProfile } = useApp();
  const { clearAuthSession, session } = useAuthSession();
  const [name, setName] = useState(userProfile.name);

  const handleUpdate = () => {
    setUserProfile(prev => ({ ...prev, name }));
    Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân');
  };

  const handleLogout = async () => {
    try {
      await logout(session?.refreshToken);
    } catch {
      // Clearing the local session is still required when the network request fails.
    } finally {
      await clearAuthSession();
      navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Hồ Sơ Cá Nhân</Text></View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarBox}>
          <View style={styles.avatarCircle}><User size={36} color={Colors.primary} /></View>
          <Text style={styles.emailTxt}>{userProfile.email}</Text>
        </View>

        <Text style={styles.label}>Họ và tên</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('SkinProfileSetup')}>
          <Shield size={18} color={Colors.text} />
          <Text style={styles.menuTxt}>Thiết lập lại hồ sơ da ({userProfile.skinType})</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('RoutineHistory')}>
          <History size={18} color={Colors.text} />
          <Text style={styles.menuTxt}>Lịch sử các chuỗi routine đã dùng</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
          <Text style={styles.saveBtnTxt}>Lưu thông tin</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={16} color={Colors.danger} />
          <Text style={styles.logoutTxt}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  content: { padding: 16 },
  avatarBox: { alignItems: 'center', marginBottom: 20 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  emailTxt: { fontSize: 13, color: Colors.textSecondary },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 10, marginBottom: 14, fontSize: 14 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, marginBottom: 10 },
  menuTxt: { fontSize: 14, fontWeight: '600', color: Colors.text },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveBtnTxt: { color: '#fff', fontWeight: '700' },
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 24 },
  logoutTxt: { color: Colors.danger, fontWeight: '700', fontSize: 14 },
});