import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Header } from '../common/Header';
import { WoodenShelf } from '../common/WoodenShelf';
import { Icon } from '../common/Icon';
import { useSkinApp } from '../../context/SkinAppContext';

export const HomeScreen = () => {
  const {
    userProfile,
    selectedConditions,
    hasCheckedInToday,
    analysisResult,
    selectedSession,
    setSelectedSession,
    treatmentPlan,
    communityPosts,
    setCurrentScreen,
    CONDITION_DICTIONARY,
    isRoutineEmpty,
    setIsRoutineEmpty,
  } = useSkinApp();

  const currentProducts = isRoutineEmpty
    ? []
    : analysisResult?.adaptedSchedule?.[selectedSession] || [];

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Active Treatment Plan Quick Widget */}
        <TouchableOpacity
          style={styles.planWidgetCard}
          onPress={() => setCurrentScreen('RoutineChainDetail')}
          activeOpacity={0.85}
        >
          <View style={styles.planWidgetLeft}>
            <View style={styles.planDotRing}>
              <View style={styles.planDotInner} />
            </View>
            <View>
              <Text style={styles.planWidgetTag}>PHÁC ĐỒ ĐANG CHẠY</Text>
              <Text style={styles.planWidgetTitle}>{treatmentPlan.name}</Text>
            </View>
          </View>
          <View style={styles.planWidgetDayBadge}>
            <Text style={styles.planWidgetDayText}>
              Ngày {treatmentPlan.currentDay}/{treatmentPlan.totalDays}
            </Text>
            <Icon name="chevron-right" size={14} color="#0f766e" />
          </View>
        </TouchableOpacity>

        {/* 11.1 Widget Check in Da ("Nhật ký làn da") */}
        <View style={styles.checkinWidgetCard}>
          <View style={styles.checkinTopRow}>
            <View style={styles.checkinBadgeWrap}>
              <Icon name="sparkles" size={13} color="#e11d48" />
              <Text style={styles.checkinBadgeText}>NHẬT KÝ LÀN DA</Text>
            </View>
            <Text style={styles.checkinStatusText}>
              {hasCheckedInToday ? '✅ Đã ghi nhận hôm nay' : '⏳ Chưa check-in'}
            </Text>
          </View>

          <Text style={styles.checkinTitle}>Da bạn hôm nay thế nào ?</Text>

          {/* Quick mood preview chips */}
          <View style={styles.moodChipsRow}>
            {['Binh_Thuong', 'Kho_Rat', 'Kich_Ung', 'Noi_Mun', 'Bong_Dau'].map((key) => {
              const cond = CONDITION_DICTIONARY[key];
              const isSelected = selectedConditions.includes(key);

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.moodChip,
                    isSelected && { backgroundColor: cond.bgColor, borderColor: cond.color },
                  ]}
                  onPress={() => setCurrentScreen('Checkin')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.moodEmoji}>{cond.emoji}</Text>
                  <Text style={[styles.moodLabel, isSelected && { color: cond.color, fontWeight: '700' }]}>
                    {cond.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Today's check-in summary & CTA */}
          <View style={styles.checkinFooter}>
            {hasCheckedInToday ? (
              <View style={styles.checkinRecordedInfo}>
                <Icon name="zap" size={14} color="#e11d48" />
                <Text style={styles.checkinRecordedText}>
                  Đã tự động tối ưu hóa routine theo tình trạng da hôm nay
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.checkinActionBtn}
              onPress={() => setCurrentScreen('Checkin')}
              activeOpacity={0.8}
            >
              <Text style={styles.checkinActionBtnText}>
                {hasCheckedInToday ? 'Cập nhật lại tình trạng da' : 'Check-in ngay'}
              </Text>
              <Icon name="chevron-right" size={14} color="#e11d48" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 11.2 Daily Routine Hôm Nay (Wooden Shelf) */}
        <WoodenShelf
          products={currentProducts}
          session={selectedSession}
          onSelectSession={setSelectedSession}
          isEmpty={isRoutineEmpty}
          onEmptySuggestPress={() => setCurrentScreen('RoutineChainDetail')}
          onViewDetail={() => setCurrentScreen('DailyRoutineDetail')}
          onViewChainDetail={() => setCurrentScreen('RoutineChainDetail')}
          treatmentDayNumber={treatmentPlan.currentDay}
          totalDays={treatmentPlan.totalDays}
          treatmentName={treatmentPlan.name}
        />

        {/* 11.3 List 1 vài bài đăng từ Community phù hợp với da user */}
        <View style={styles.communitySection}>
          <View style={styles.communityHeaderRow}>
            <View>
              <Text style={styles.communitySub}>CỘNG ĐỒNG SKINCARE</Text>
              <Text style={styles.communityTitle}>Phù hợp với làn da của bạn</Text>
            </View>
            <TouchableOpacity
              onPress={() => alert('Đang mở thư viện kinh nghiệm chăm da')}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.postsList}>
            {communityPosts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                {/* Author Info */}
                <View style={styles.postAuthorRow}>
                  <Image source={{ uri: post.author.avatar }} style={styles.authorAvatar} />
                  <View style={styles.authorCol}>
                    <Text style={styles.authorName}>{post.author.name}</Text>
                    <View style={styles.authorBadgeRow}>
                      <Text style={styles.authorTag}>{post.author.tag}</Text>
                      <Text style={styles.dotSeparator}>•</Text>
                      <Text style={styles.postTime}>{post.timeAgo}</Text>
                    </View>
                  </View>

                  <View style={styles.skinMatchBadge}>
                    <Text style={styles.skinMatchText}>{post.skinTag}</Text>
                  </View>
                </View>

                {/* Content */}
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postContent} numberOfLines={3}>
                  {post.content}
                </Text>

                {/* Routine Tag in Post */}
                <View style={styles.postRoutinePill}>
                  <Icon name="layers" size={12} color="#0f766e" />
                  <Text style={styles.postRoutineName}>{post.routineName}</Text>
                </View>

                {/* Post Footer Actions */}
                <View style={styles.postFooterRow}>
                  <View style={styles.likesCommentsRow}>
                    <TouchableOpacity
                      style={styles.likeBtn}
                      onPress={() => alert(`Đã thả tim bài viết của ${post.author.name}!`)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name="heart"
                        size={15}
                        color={post.isLiked ? '#e11d48' : '#94a3b8'}
                      />
                      <Text style={[styles.likeCount, post.isLiked && styles.likeCountActive]}>
                        {post.likesCount}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.commentBtn}
                      onPress={() => alert('Mở bình luận')}
                      activeOpacity={0.7}
                    >
                      <Icon name="share" size={14} color="#94a3b8" />
                      <Text style={styles.commentCount}>Chia sẻ</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Copy Routine Button (as noted in Sheet: "lượt tym và lượt copy") */}
                  <TouchableOpacity
                    style={styles.copyRoutineBtn}
                    onPress={() => {
                      alert(`Đã sao chép "${post.routineName}" vào Tủ đồ / Lịch trình dự thảo của bạn!`);
                      setCurrentScreen('RoutineChainDetail');
                    }}
                    activeOpacity={0.8}
                  >
                    <Icon name="plus" size={13} color="#ffffff" />
                    <Text style={styles.copyRoutineBtnText}>Sao chép chuỗi ({post.copyCount})</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Active Plan Widget
  planWidgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdfa',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  planWidgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  planDotRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0f766e',
  },
  planWidgetTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f766e',
    letterSpacing: 0.8,
  },
  planWidgetTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1,
  },
  planWidgetDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 4,
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  planWidgetDayText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f766e',
  },

  // 11.1 Checkin Widget Card
  checkinWidgetCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  checkinTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  checkinBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkinBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#e11d48',
    letterSpacing: 1,
  },
  checkinStatusText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  checkinTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  moodChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 12,
  },
  moodChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  moodEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  moodLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  checkinFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  checkinRecordedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 6,
  },
  checkinRecordedText: {
    fontSize: 10,
    color: '#e11d48',
    fontWeight: '600',
  },
  checkinActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  checkinActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e11d48',
  },

  // Community
  communitySection: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  communityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  communitySub: {
    fontSize: 9,
    fontWeight: '800',
    color: '#e11d48',
    letterSpacing: 1.2,
  },
  communityTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e11d48',
  },
  postsList: {
    gap: 12,
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  authorCol: {
    flex: 1,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  authorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  authorTag: {
    fontSize: 10,
    color: '#e11d48',
    fontWeight: '600',
  },
  dotSeparator: {
    marginHorizontal: 4,
    color: '#cbd5e1',
    fontSize: 10,
  },
  postTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
  skinMatchBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  skinMatchText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  postTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 18,
    marginBottom: 4,
  },
  postContent: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
    marginBottom: 8,
  },
  postRoutinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  postRoutineName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f766e',
  },
  postFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  likesCommentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  likeCountActive: {
    color: '#e11d48',
    fontWeight: '700',
  },
  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentCount: {
    fontSize: 11,
    color: '#64748b',
  },
  copyRoutineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f766e',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  copyRoutineBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});
