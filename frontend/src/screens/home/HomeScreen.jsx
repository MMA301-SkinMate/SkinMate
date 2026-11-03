import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useRoutine } from '../../context/RoutineContext';
import { useCommunity } from '../../context/CommunityContext';
import { useAuth } from '../../hooks/useAuth';
import SkinCheckInWidget from '../../components/routine/SkinCheckInWidget';
import UndoToast from '../../components/routine/UndoToast';
import WoodenShelf from '../../components/routine/WoodenShelf';
import SuggestedRoutineBanner from '../../components/routine/SuggestedRoutineBanner';
import { SKIN_TYPE_LABELS, countRoutineSteps } from '../../constants/community';
import { useApp } from '../../context/AppContext';

export default function HomeScreen({ navigation }) {
  const {
    dailyRoutine,
    activePlan,
    isRoutineLoading,
    routineError,
    refreshDailyRoutine,
    refreshActivePlan,
    triggerCheckInReminder,
  } = useRoutine();

  const { posts, isCommunityLoading, communityError, refreshPosts } = useCommunity();
  const { userProfile, profileLoading, profileError, refreshUserProfile } = useApp();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      refreshDailyRoutine(),
      refreshActivePlan(),
      refreshPosts(),
      refreshUserProfile(),
    ]);
    setRefreshing(false);
  };

  const rawSkinType = userProfile?.skinProfile?.skinType || user?.skinProfile?.skinType;
  const userSkinType = ({ da_dau: 'oily', da_kho: 'dry', da_hon_hop: 'combination', da_nhay_cam: 'sensitive', da_thuong: 'normal' })[rawSkinType] || rawSkinType;
  const communitySkinType = ({ oily: 'Da dầu mụn', dry: 'Da khô', combination: 'Da hỗn hợp', sensitive: 'Da nhạy cảm' })[userSkinType];
  const userSkinLabel = userSkinType === 'normal'
    ? 'Normal'
    : SKIN_TYPE_LABELS[communitySkinType] || SKIN_TYPE_LABELS[rawSkinType]
      || (profileLoading ? 'Đang tải...' : profileError ? 'Không thể tải hồ sơ da' : 'Chưa thiết lập');

  // Filter 2-3 community posts suitable for user's skin type
  const matchedCommunityPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    const matched = posts.filter(
      p => p.skinType === communitySkinType || !p.skinType
    );
    return (matched.length > 0 ? matched : posts).slice(0, 3);
  }, [posts, communitySkinType]);

  const handleSendReminderTest = async () => {
    try {
      await triggerCheckInReminder();
      Alert.alert(
        'Thông báo nhắc nhở',
        'Đã gửi thông báo nhắc check-in làn da về thiết bị của bạn!'
      );
    } catch (err) {
      Alert.alert('Không thể gửi thông báo', err.message || 'Vui lòng kiểm tra quyền thông báo của thiết bị.');
    }
  };

  const hasRoutineProducts =
    dailyRoutine && dailyRoutine.steps && dailyRoutine.steps.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Greeting Header */}
      <View style={styles.topHeader}>
        <View style={styles.userGreeting}>
          <Text style={styles.greetingSub}>XIN CHÀO,</Text>
          <Text style={styles.userName}>{user?.fullName || 'SkinMate Member'}</Text>
          <View style={styles.skinProfilePill}>
            <Ionicons name="sparkles" size={12} color={COLORS.primary} />
            <Text style={styles.skinProfileText}>Nền da: {userSkinLabel}</Text>
          </View>
        </View>

        {/* Daily Check-in Notification Reminder Action Button */}
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={handleSendReminderTest}
          activeOpacity={0.8}
          accessibilityLabel="Nhắc nhở checkin da"
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Floating 10s Undo Toast (Requirement 3) */}
      <UndoToast />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isRoutineLoading}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* 1. Widget Check-in Da ("Nhật ký làn da") (Requirement 1 & 3) */}
        <SkinCheckInWidget />

        {/* 2. Daily Routine Hôm Nay (Requirement 1 & 5) */}
        {routineError ? (
          <View style={styles.emptyCommunityBox}>
            <Text style={styles.emptyCommunityText}>Không thể tải routine: {routineError}</Text>
          </View>
        ) : isRoutineLoading && !dailyRoutine ? (
          <ActivityIndicator color={COLORS.primary} accessibilityLabel="Đang tải routine" />
        ) : hasRoutineProducts ? (
          <WoodenShelf
            routine={dailyRoutine}
            activePlan={activePlan}
            onViewDetail={() => navigation.navigate('DailyRoutineDetail')}
            onViewActivePlan={() =>
              navigation.navigate('TreatmentPlanDetail', { plan: activePlan })
            }
          />
        ) : (
          <SuggestedRoutineBanner
            onOpenSuggestedPlans={() => navigation.navigate('SuggestedPlans')}
          />
        )}

        {/* 3. List 1 vài bài đăng từ community phù hợp với da user (Requirement 1) */}
        <View style={styles.communitySection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionPreTitle}>CỘNG ĐỒNG SKINCARE</Text>
              <Text style={styles.sectionMainTitle}>
                Phù hợp với làn {userSkinLabel}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Community')}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {communityError ? (
            <View style={styles.emptyCommunityBox}>
              <Text style={styles.emptyCommunityText}>Không thể tải bài đăng: {communityError}</Text>
            </View>
          ) : isCommunityLoading && matchedCommunityPosts.length === 0 ? (
            <ActivityIndicator color={COLORS.primary} accessibilityLabel="Đang tải bài đăng" />
          ) : matchedCommunityPosts.length > 0 ? (
            <View style={styles.communityList}>
              {matchedCommunityPosts.map(post => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.postCard}
                  onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                  activeOpacity={0.85}
                >
                  <View style={styles.postHeader}>
                    <View style={styles.authorRow}>
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>
                          {post.authorName ? post.authorName[0].toUpperCase() : 'U'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.authorName}>
                          {post.authorName || 'Ẩn danh'}
                        </Text>
                        <Text style={styles.postSkinTag}>
                          {SKIN_TYPE_LABELS[post.skinType] || 'Chưa thiết lập'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.likesPill}>
                      <Ionicons name="heart" size={12} color="#ec4899" />
                      <Text style={styles.likesCount}>{post.likesCount || 0}</Text>
                    </View>
                  </View>

                  <Text style={styles.postTitle} numberOfLines={1}>
                    {post.title || post.content}
                  </Text>
                  <Text style={styles.postSnippet} numberOfLines={2}>
                    {post.content}
                  </Text>

                  {countRoutineSteps(post.routine) > 0 && (
                    <View style={styles.routineStepCount}>
                      <Ionicons name="list" size={12} color="#0f766e" />
                      <Text style={styles.routineStepCountText}>
                        Chu trình chia sẻ: {countRoutineSteps(post.routine)} bước
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCommunityBox}>
              <Text style={styles.emptyCommunityText}>
                Chưa có bài đăng nào dành riêng cho loại da này. Hãy ghé thăm tab Community nhé!
              </Text>
            </View>
          )}
        </View>

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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userGreeting: {
    flex: 1,
  },
  greetingSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 1,
  },
  skinProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  skinProfileText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  communitySection: {
    marginTop: 14,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionPreTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  sectionMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  communityList: {
    gap: 10,
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  postSkinTag: {
    fontSize: 10,
    color: '#64748b',
  },
  likesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  likesCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#db2777',
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  postSnippet: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  routineStepCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 4,
  },
  routineStepCountText: {
    fontSize: 11,
    color: '#0f766e',
    fontWeight: '600',
  },
  emptyCommunityBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyCommunityText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});
