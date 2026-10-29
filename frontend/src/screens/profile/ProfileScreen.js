import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History, RefreshCw, Shield, User } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { skinTypeLabel } from '../../constants/skinTypes';
import { useApp } from '../../context/AppContext';

export default function ProfileScreen({ navigation }) {
  const { userProfile, profileError, profileLoading, refreshUserProfile } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Hồ sơ cá nhân</Text></View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarBox}>
          <View style={styles.avatarCircle}><User size={36} color={Colors.primary} /></View>
          <Text style={styles.name}>{userProfile?.name || 'Hồ sơ da'}</Text>
          <Text style={styles.email}>{userProfile?.email}</Text>
        </View>
        {profileError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{profileError}</Text>
            <TouchableOpacity style={styles.retry} onPress={refreshUserProfile} disabled={profileLoading}>
              <RefreshCw size={16} color={Colors.primary} />
              <Text style={styles.retryText}>{profileLoading ? 'Đang tải...' : 'Thử lại'}</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('SkinProfileSetup')}>
          <Shield size={18} color={Colors.text} />
          <Text style={styles.menuText}>Hồ sơ da: {skinTypeLabel(userProfile?.skinType)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('RoutineHistory')}>
          <History size={18} color={Colors.text} />
          <Text style={styles.menuText}>Lịch sử routine</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  content: { padding: 16 },
  avatarBox: { alignItems: 'center', marginBottom: 22 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '800', color: Colors.text },
  email: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  errorCard: { backgroundColor: Colors.dangerLight, borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { color: Colors.danger, lineHeight: 19 },
  retry: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  retryText: { color: Colors.primaryDark, fontWeight: '700' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, marginBottom: 10 },
  menuText: { fontSize: 14, fontWeight: '600', color: Colors.text },
});
