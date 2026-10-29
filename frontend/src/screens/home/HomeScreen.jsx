import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import routineApi from '../../api/routineApi';
import notificationService from '../../services/notificationService';
import SkinCheckinWidget from '../../components/routine/SkinCheckinWidget';
import DailyRoutineShelf from '../../components/routine/DailyRoutineShelf';
import CommunitySnippet from '../../components/routine/CommunitySnippet';

/**
 * 11. UI Home
 * - Widget check in da
 * - Daily routine hôm nay
 * - List 1 vài bài đăng từ community phù hợp với da user
 */
const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingCheckin, setSubmittingCheckin] = useState(false);
  const [homeData, setHomeData] = useState(null);

  // Fetch Home Data
  const loadHomeData = useCallback(async () => {
    try {
      const res = await routineApi.getHomeData();
      if (res && res.data) {
        setHomeData(res.data);
      }
    } catch (error) {
      console.warn('Lỗi tải dữ liệu Home:', error.message);
      // Fallback data nếu backend chưa chạy hoặc chưa đăng nhập
      setHomeData((prev) => prev || getDefaultFallbackHomeData());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
    // 12. Tự động kiểm tra và lên lịch thông báo check-in hàng ngày
    notificationService.scheduleDailyCheckinReminders({
      morningTime: '08:00',
      eveningTime: '20:00',
      isEnabled: true,
    });
  }, [loadHomeData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  // 13. Handle Check-in submit
  const handleCheckinSubmit = async (conditions) => {
    setSubmittingCheckin(true);
    try {
      const res = await routineApi.submitCheckin(conditions);
      if (res && res.dailyRoutine) {
        setHomeData((prev) => ({
          ...prev,
          todayRoutine: res.dailyRoutine,
          checkinWidget: {
            ...prev?.checkinWidget,
            hasCheckedIn: true,
            currentConditions: conditions,
          },
        }));
      } else {
        // Tải lại toàn bộ dữ liệu home để đồng bộ
        loadHomeData();
      }
    } catch (error) {
      console.warn('Lỗi gửi check-in:', error.message);
    } finally {
      setSubmittingCheckin(false);
    }
  };

  // 13. Handle Check-in Undo (10s)
  const handleCheckinUndo = async () => {
    try {
      const res = await routineApi.undoCheckin();
      if (res && res.data) {
        setHomeData((prev) => ({
          ...prev,
          todayRoutine: res.data,
          checkinWidget: {
            ...prev?.checkinWidget,
            hasCheckedIn: false,
            currentConditions: ['Bình thường'],
          },
        }));
      } else {
        loadHomeData();
      }
    } catch (error) {
      console.warn('Lỗi hoàn tác check-in:', error.message);
    }
  };

  if (loading && !homeData) {
    return (
      <View style={[styles.loadingCenter, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang chuẩn bị chu trình da hôm nay...</Text>
      </View>
    );
  }

  const profile = homeData?.profile || {
    name: 'Khách hàng SkinMate',
    skinType: 'Da_Hon_Hop',
    streak: 1,
  };
  const uvIndex = homeData?.uvIndex || { value: 6.2, warning: 'UV 6.2 - Nhớ bôi KCN phổ rộng', level: 'Cao' };
  const todayRoutine = homeData?.todayRoutine || null;
  const communityPosts = homeData?.communityPosts || [];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* ── Top Header: User Profile & Streak ── */}
        <View style={styles.topHeaderRow}>
          <View style={styles.userInfoCol}>
            <Text style={styles.greetingText}>Xin chào,</Text>
            <Text style={styles.userNameText}>{profile.name}</Text>
            <View style={styles.skinTypePill}>
              <Text style={styles.skinTypePillText}>{formatSkinTypeName(profile.skinType)}</Text>
            </View>
          </View>

          <View style={styles.headerRightCol}>
            {/* Streak Badge */}
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={18} color="#f97316" />
              <Text style={styles.streakCount}>{profile.streak || 1}</Text>
              <Text style={styles.streakLabel}>ngày</Text>
            </View>

            {/* Avatar */}
            <Image
              source={{
                uri:
                  profile.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              }}
              style={styles.avatarImg}
            />
          </View>
        </View>

        {/* ── UV Index Warning Banner ── */}
        <View style={styles.uvBanner}>
          <View style={styles.uvLeft}>
            <View style={styles.uvIconCircle}>
              <Ionicons name="sunny" size={20} color="#ea580c" />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.uvTitle}>Chỉ số tia UV hôm nay: {uvIndex.value}</Text>
              <Text style={styles.uvWarningText}>{uvIndex.warning}</Text>
            </View>
          </View>
          <View style={styles.uvLevelBadge}>
            <Text style={styles.uvLevelText}>{uvIndex.level}</Text>
          </View>
        </View>

        {/* ── 13. Widget Check-in Da ("Nhật ký làn da") ── */}
        <SkinCheckinWidget
          currentConditions={homeData?.checkinWidget?.currentConditions || ['Bình thường']}
          onCheckinSubmit={handleCheckinSubmit}
          onCheckinUndo={handleCheckinUndo}
          isSubmitting={submittingCheckin}
        />

        {/* ── 15. Daily Routine Hôm Nay (Kệ gỗ & View Detail) ── */}
        <DailyRoutineShelf
          dailyRoutine={todayRoutine}
          onViewDetail={() => {
            navigation.navigate('DailyRoutineDetail', {
              dailyRoutine: todayRoutine,
              dateStr: todayRoutine?.date,
            });
          }}
          onOpenActivePlan={() => {
            navigation.navigate('TreatmentPlanDetail', {
              planId: todayRoutine?.treatmentPlanRef,
            });
          }}
          onSuggestRoutine={() => {
            navigation.navigate('SuggestRoutine');
          }}
        />

        {/* ── 11. List bài đăng từ community phù hợp da user ── */}
        <CommunitySnippet
          posts={communityPosts}
          userSkinType={profile.skinType}
          onSeeMore={() => navigation.navigate('Community')}
          onPostPress={(post) => {
            if (post.routineData) {
              navigation.navigate('TreatmentPlanDetail', {
                planData: post.routineData,
                isFromPost: true,
              });
            }
          }}
        />
      </ScrollView>
    </View>
  );
};

function formatSkinTypeName(skinType) {
  switch (skinType) {
    case 'Da_Dau':
      return 'Da dầu';
    case 'Da_Kho':
      return 'Da khô';
    case 'Da_Hon_Hop':
      return 'Da hỗn hợp';
    case 'Da_Nhay_Cam':
      return 'Da nhạy cảm';
    case 'Da_Thuong':
      return 'Da thường';
    default:
      return 'Da hỗn hợp';
  }
}

function getDefaultFallbackHomeData() {
  return {
    profile: {
      name: 'Khánh Huyền',
      skinType: 'Da_Hon_Hop',
      streak: 3,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    uvIndex: {
      value: 6.2,
      warning: 'UV 6.2 - Nhớ bôi KCN phổ rộng',
      level: 'Cao',
    },
    checkinWidget: {
      hasCheckedIn: false,
      currentConditions: ['Bình thường'],
    },
    todayRoutine: {
      date: new Date().toISOString().split('T')[0],
      skinConditions: ['Bình thường'],
      dayInPlan: 3,
      morningSteps: [
        {
          stepNumber: 1,
          stepName: 'Làm sạch',
          category: 'cleanser',
          customProduct: { name: 'Sữa rửa mặt Simple Refreshing', brand: 'Simple' },
          reason: 'Làm sạch dịu nhẹ buổi sáng',
        },
        {
          stepNumber: 2,
          stepName: 'Cân bằng',
          category: 'toner',
          customProduct: { name: 'Nước hoa hồng Klairs Supple', brand: 'Klairs' },
          reason: 'Cân bằng độ ẩm và pH tự nhiên',
        },
        {
          stepNumber: 3,
          stepName: 'Đặc trị',
          category: 'treatment',
          customProduct: { name: 'Serum Niacinamide 10% + Zinc 1%', brand: 'The Ordinary' },
          reason: 'Kiểm soát bã nhờn vùng chữ T',
        },
        {
          stepNumber: 4,
          stepName: 'Dưỡng ẩm',
          category: 'moisturizer',
          customProduct: { name: 'Gel dưỡng ẩm Neutrogena Hydro Boost', brand: 'Neutrogena' },
          reason: 'Khóa ẩm màng nước căng mọng',
        },
        {
          stepNumber: 5,
          stepName: 'Bảo vệ',
          category: 'sunscreen',
          customProduct: { name: 'Kem chống nắng Anessa Perfect UV Milk', brand: 'Anessa' },
          reason: 'Bảo vệ da tuyệt đối trước tia UV 6.2',
        },
      ],
      eveningSteps: [
        {
          stepNumber: 1,
          stepName: 'Làm sạch kép',
          category: 'cleanser',
          customProduct: { name: 'Nước tẩy trang Bioderma Sensibio', brand: 'Bioderma' },
          reason: 'Làm sạch bụi mịn và cặn kem chống nắng',
        },
        {
          stepNumber: 2,
          stepName: 'Cân bằng',
          category: 'toner',
          customProduct: { name: 'Toner dưỡng ẩm Klairs', brand: 'Klairs' },
          reason: 'Làm dịu da sau một ngày dài',
        },
        {
          stepNumber: 3,
          stepName: 'Đặc trị phục hồi',
          category: 'treatment',
          customProduct: { name: 'Serum B5 La Roche-Posay Hyalu', brand: 'La Roche-Posay' },
          reason: 'Phục hồi biểu bì và làm dịu rào cản da',
        },
        {
          stepNumber: 4,
          stepName: 'Khóa ẩm',
          category: 'moisturizer',
          customProduct: { name: 'Kem dưỡng ẩm Neutrogena', brand: 'Neutrogena' },
          reason: 'Phục hồi màng ẩm xuyên đêm',
        },
      ],
    },
    communityPosts: [
      {
        _id: 'post_1',
        title: 'Routine 14 ngày phục hồi da sau treatment cực đỉnh',
        content: 'Da mình đỡ hẳn kích ứng và đỏ rát nhờ thay đổi sang B5 & Ceramide mỗi ngày.',
        skinType: 'Da_Hon_Hop',
        likesCount: 128,
        author: { name: 'Lê Minh', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' },
      },
      {
        _id: 'post_2',
        title: 'Cách mình kiểm soát dầu mụn mùa hè',
        content: 'Kết hợp Salicylic Acid dịu nhẹ và kem chống nắng kiềm dầu suốt 8 tiếng.',
        skinType: 'Da_Dau',
        likesCount: 95,
        author: { name: 'Thu Thảo', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
      },
    ],
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userInfoCol: {
    flex: 1,
  },
  greetingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMain,
    marginTop: 2,
  },
  skinTypePill: {
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#99f6e4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  skinTypePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 10,
  },
  streakCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ea580c',
    marginLeft: 3,
  },
  streakLabel: {
    fontSize: 10,
    color: '#c2410c',
    fontWeight: '600',
    marginLeft: 2,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  uvBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  uvLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  uvIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uvTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9a3412',
  },
  uvWarningText: {
    fontSize: 11,
    color: '#c2410c',
    marginTop: 1,
  },
  uvLevelBadge: {
    backgroundColor: '#ea580c',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  uvLevelText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
});

export default HomeScreen;