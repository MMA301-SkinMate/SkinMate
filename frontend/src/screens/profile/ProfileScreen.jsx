import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { useCollection } from '../../context/CollectionContext';
import { useRoutine } from '../../context/RoutineContext';
import { SKIN_TYPE_LABELS } from '../../constants/community';

export default function ProfileScreen({ navigation }) {
  const { session, logout } = useAuth();
  const { collection } = useCollection();
  const { activePlan, todayCheckIn, triggerCheckInReminder } = useRoutine();
  const user = session?.user;

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(true);
  const [expiryWarningEnabled, setExpiryWarningEnabled] = useState(true);

  const skinTypeKey = user?.skinProfile?.skinType || 'oily';
  const skinTypeLabel = SKIN_TYPE_LABELS[skinTypeKey] || 'Da Dầu';

  const handleToggleDailyReminder = async (value) => {
    setDailyReminderEnabled(value);
    if (value) {
      await triggerCheckInReminder();
      Alert.alert('Nhắc nhở hằng ngày', 'Đã bật thông báo nhắc nhở check-in da lúc 08:00 sáng mỗi ngày.');
    } else {
      Alert.alert('Thông báo', 'Đã tắt nhắc nhở check-in.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất tài khoản',
      'Bạn có chắc chắn muốn đăng xuất khỏi SkinMate không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa phiên đăng nhập. Vui lòng thử lại.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Hồ Sơ Cá Nhân</Text>
        <TouchableOpacity
          style={styles.headerSettingsBtn}
          onPress={() => Alert.alert('Cài đặt', 'Phiên bản SkinMate v1.0.0')}
        >
          <Ionicons name="settings-outline" size={22} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.fullName ? user.fullName[0].toUpperCase() : 'S'}
                </Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="sparkles" size={12} color="#ffffff" />
            </View>
          </View>

          <View style={styles.userInfoBox}>
            <Text style={styles.userName}>{user?.fullName || 'SkinMate Member'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@skinmate.vn'}</Text>

            <View style={styles.membershipPill}>
              <Ionicons name="shield-checkmark" size={12} color="#0d9488" />
              <Text style={styles.membershipText}>Thành viên SkinMate Chuyên Sâu</Text>
            </View>
          </View>
        </View>

        {/* Skincare Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Collection')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#f0fdfa' }]}>
              <Ionicons name="cube-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>{collection?.length || 0}</Text>
            <Text style={styles.statLabel}>Sản phẩm tủ đồ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('TreatmentPlanDetail')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="calendar-outline" size={20} color="#d97706" />
            </View>
            <Text style={styles.statNumber}>
              {activePlan?.currentDay || 1}/{activePlan?.totalDays || 14}
            </Text>
            <Text style={styles.statLabel}>Ngày chuỗi routine</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="checkmark-done-circle-outline" size={20} color="#10b981" />
            </View>
            <Text style={styles.statNumber}>
              {todayCheckIn?.length > 0 ? 'Đã ghi' : 'Chưa'}
            </Text>
            <Text style={styles.statLabel}>Check-in hôm nay</Text>
          </View>
        </View>

        {/* Skin Profile Summary Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="heart-circle" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Hồ sơ làn da của bạn</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Hồ sơ làn da',
                  `Loại da hiện tại: ${skinTypeLabel}\n\nHệ thống luôn tự động tối ưu hóa chu trình dưỡng da và cảnh báo xung đột theo đúng hồ sơ này.`
                )
              }
            >
              <Text style={styles.editLink}>Chi tiết</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.skinProfileGrid}>
            <View style={styles.profileItem}>
              <Text style={styles.profileItemLabel}>Nền da chính</Text>
              <View style={styles.skinTypeBadge}>
                <Ionicons name="water" size={13} color={COLORS.primary} />
                <Text style={styles.skinTypeBadgeText}>{skinTypeLabel}</Text>
              </View>
            </View>

            <View style={styles.profileItem}>
              <Text style={styles.profileItemLabel}>Mối quan tâm hàng đầu</Text>
              <View style={styles.tagsWrap}>
                <View style={styles.tagPill}>
                  <Text style={styles.tagText}>Kháng viêm & Mụn</Text>
                </View>
                <View style={styles.tagPill}>
                  <Text style={styles.tagText}>Phục hồi màng ẩm</Text>
                </View>
              </View>
            </View>

            <View style={styles.profileItem}>
              <Text style={styles.profileItemLabel}>Tránh thành phần (Allergies)</Text>
              <View style={styles.tagsWrap}>
                <View style={[styles.tagPill, { backgroundColor: '#fee2e2' }]}>
                  <Text style={[styles.tagText, { color: '#dc2626' }]}>Cồn khô</Text>
                </View>
                <View style={[styles.tagPill, { backgroundColor: '#fee2e2' }]}>
                  <Text style={[styles.tagText, { color: '#dc2626' }]}>Hương liệu nồng</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Settings & Preferences Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.groupHeading}>CÀI ĐẶT & THÔNG BÁO</Text>

          {/* Daily Reminder Setting */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIconBox, { backgroundColor: '#f0fdfa' }]}>
                <Ionicons name="notifications" size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Nhắc nhở check-in hằng ngày</Text>
                <Text style={styles.settingDesc}>Nhận thông báo lúc 08:00 sáng</Text>
              </View>
            </View>
            <Switch
              value={dailyReminderEnabled}
              onValueChange={handleToggleDailyReminder}
              trackColor={{ false: '#cbd5e1', true: '#99f6e4' }}
              thumbColor={dailyReminderEnabled ? COLORS.primary : '#f8fafc'}
            />
          </View>

          <View style={styles.divider} />

          {/* Expiry Warning Setting */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIconBox, { backgroundColor: '#fff7ed' }]}>
                <Ionicons name="alert-circle" size={18} color="#f97316" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Cảnh báo hạn sử dụng mỹ phẩm</Text>
                <Text style={styles.settingDesc}>Báo trước 30 ngày và khi quá hạn</Text>
              </View>
            </View>
            <Switch
              value={expiryWarningEnabled}
              onValueChange={setExpiryWarningEnabled}
              trackColor={{ false: '#cbd5e1', true: '#fed7aa' }}
              thumbColor={expiryWarningEnabled ? '#ea580c' : '#f8fafc'}
            />
          </View>
        </View>

        {/* Quick Links Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.groupHeading}>LỘ TRÌNH & HỖ TRỢ</Text>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('DailyRoutineDetail')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="sparkles-outline" size={19} color="#475569" />
              <Text style={styles.menuTitle}>Chi tiết chu trình Daily hôm nay</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('TreatmentPlanDetail')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="calendar-outline" size={19} color="#475569" />
              <Text style={styles.menuTitle}>Chuỗi routine điều trị đang áp dụng</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('SuggestedPlans')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="library-outline" size={19} color="#475569" />
              <Text style={styles.menuTitle}>Khám phá kho lộ trình gợi ý</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              Alert.alert('Chính sách bảo mật', 'SkinMate cam kết bảo mật 100% dữ liệu làn da và quyền riêng tư cá nhân của bạn.')
            }
          >
            <View style={styles.menuLeft}>
              <Ionicons name="shield-checkmark-outline" size={19} color="#475569" />
              <Text style={styles.menuTitle}>Chính sách bảo mật & Điều khoản</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.85}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#dc2626" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
            </>
          )}
        </TouchableOpacity>

        {/* App Version Info */}
        <Text style={styles.versionText}>SkinMate v1.0.0 • Công nghệ Expo & MongoDB</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSettingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 14,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userInfoBox: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  membershipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 5,
  },
  membershipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f766e',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  editLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  skinProfileGrid: {
    gap: 12,
  },
  profileItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 8,
  },
  profileItemLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skinTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  skinTypeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  groupHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  settingDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#dc2626',
  },
  versionText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
