import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * 11. UI Home: List 1 vài bài đăng từ community phù hợp với da user
 */
export const CommunitySnippet = ({ posts = [], userSkinType = 'Da_Hon_Hop', onSeeMore, onPostPress }) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  const renderPost = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => onPostPress && onPostPress(item)}
        activeOpacity={0.8}
      >
        {/* Author row */}
        <View style={styles.authorRow}>
          <Image
            source={{
              uri: item.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            }}
            style={styles.avatar}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName} numberOfLines={1}>
              {item.author?.name || 'Thành viên SkinMate'}
            </Text>
            <View style={styles.skinTag}>
              <Text style={styles.skinTagText}>
                {formatSkinType(item.skinType || userSkinType)}
              </Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Content snippet */}
        <Text style={styles.postContent} numberOfLines={2}>
          {item.content}
        </Text>

        {/* Footer info: Likes */}
        <View style={styles.footerRow}>
          <View style={styles.likeBadge}>
            <Ionicons name="heart" size={13} color="#ef4444" />
            <Text style={styles.likeText}>{item.likesCount || 0} lượt thích</Text>
          </View>

          {item.routineData && (
            <View style={styles.routineBadge}>
              <Ionicons name="layers-outline" size={12} color={COLORS.primary} />
              <Text style={styles.routineBadgeText}>Đính kèm chuỗi routine</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>CỘNG ĐỒNG CHIA SẺ</Text>
          </View>
          <Text style={styles.title}>Dành Riêng Cho Da Của Bạn</Text>
        </View>
        <TouchableOpacity onPress={onSeeMore} activeOpacity={0.7}>
          <Text style={styles.seeMoreText}>Tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id || String(Math.random())}
        renderItem={renderPost}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

function formatSkinType(skinType) {
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

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  tagBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7c3aed',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  seeMoreText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  postCard: {
    width: 250,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  authorInfo: {
    marginLeft: 8,
    flex: 1,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  skinTag: {
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  skinTagText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    lineHeight: 18,
    marginBottom: 6,
  },
  postContent: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 8,
  },
  likeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  routineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  routineBadgeText: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: 3,
  },
});

export default CommunitySnippet;
