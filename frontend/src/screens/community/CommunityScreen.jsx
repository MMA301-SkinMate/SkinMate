import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { listCommunityPosts } from '../../api/communityApi';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { SKIN_TYPES, countRoutineSteps } from '../../constants/community';
import PostAuthorRow from '../../components/community/PostAuthorRow';
import { useCommunity } from '../../context/CommunityContext';
import { useCollection } from '../../context/CollectionContext';

const FILTERS = [null, ...SKIN_TYPES];

export default function CommunityScreen({ navigation }) {
  const { posts, skinTypeFilter, setSkinTypeFilter, isCommunityLoading, communityError, refreshPosts, toggleLike, copyRoutine } = useCommunity();
  const { refreshCollection } = useCollection();
  const [copyingId, setCopyingId] = useState(null);
  const [drafts, setDrafts] = useState([]);
  useFocusEffect(useCallback(() => {
    let active = true;
    listCommunityPosts({ mine: 'true', status: 'draft' })
      .then(result => { if (active) setDrafts(result.posts || []); })
      .catch(error => { if (active) Alert.alert('Không thể tải bản nháp', error.message); });
    return () => { active = false; };
  }, []));

  const handleLike = async id => {
    try { await toggleLike(id); } catch (error) { Alert.alert('Lỗi', error.message || 'Không thể thích bài viết.'); }
  };

  const handleCopy = async id => {
    if (copyingId) return;
    setCopyingId(id);
    try {
      const result = await copyRoutine(id);
      await refreshCollection();
      Alert.alert('Đã sao chép', `Đã thêm ${result.copiedCount} sản phẩm vào tủ đồ của bạn.`);
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể sao chép chu trình.');
    } finally {
      setCopyingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isCommunityLoading && posts.length > 0} onRefresh={refreshPosts} tintColor={Colors.primary} />}
        ListHeaderComponent={<View>
          <CommunityHeader activeFilter={skinTypeFilter} onFilter={setSkinTypeFilter} onCompose={() => navigation.navigate('CreatePost')} />
          {drafts.map(draft => <TouchableOpacity key={draft.id} style={styles.postCard} onPress={() => navigation.navigate('CreatePost', { draft })} accessibilityRole="button">
            <Text style={styles.routineTitle}>Bản nháp · Tiếp tục chỉnh sửa</Text>
            <Text style={styles.postText} numberOfLines={2}>{draft.content || 'Routine chưa có nội dung'}</Text>
          </TouchableOpacity>)}
        </View>}
        ListEmptyComponent={<FeedEmpty isLoading={isCommunityLoading} error={communityError} onRetry={refreshPosts} />}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            isCopying={copyingId === item.id}
            onOpen={() => navigation.navigate('PostDetail', { postId: item.id })}
            onLike={() => handleLike(item.id)}
            onCopy={() => handleCopy(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

function CommunityHeader({ activeFilter, onFilter, onCompose }) {
  return (
    <View>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Community</Text>
      </View>
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={item => item || 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => {
          const isActive = activeFilter === item;
          return (
            <TouchableOpacity style={[styles.filter, isActive && styles.filterActive]} onPress={() => onFilter(item)} accessibilityRole="button" accessibilityState={{ selected: isActive }}>
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{isActive && '• '}{item || 'Tất cả'}</Text>
            </TouchableOpacity>
          );
        }}
      />
      <TouchableOpacity style={styles.composer} onPress={onCompose} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Tạo bài viết mới">
        <View style={styles.avatarPlaceholder}><Ionicons name="people-outline" size={20} color={Colors.primaryDark} /></View>
        <View style={styles.composerPlaceholder}><Text style={styles.composerPlaceholderText}>Chia sẻ chu trình dưỡng da...</Text></View>
        <Ionicons name="camera-outline" size={20} color={Colors.primaryDark} />
        <View style={styles.composerAction}><Ionicons name="add" size={20} color={Colors.primaryDark} /></View>
      </TouchableOpacity>
    </View>
  );
}

function FeedEmpty({ isLoading, error, onRetry }) {
  if (isLoading) return <ActivityIndicator style={styles.emptyState} color={Colors.primary} />;
  return (
    <View style={styles.emptyState}>
      <Ionicons name={error ? 'cloud-offline-outline' : 'chatbubbles-outline'} size={36} color={Colors.textMuted} />
      <Text style={styles.emptyText}>{error || 'Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ routine!'}</Text>
      {error && <TouchableOpacity onPress={onRetry}><Text style={styles.retryText}>Thử lại</Text></TouchableOpacity>}
    </View>
  );
}
function PostCard({ post, isCopying, onOpen, onLike, onCopy }) {
  const morning = post.sharedRoutine?.morning || [];
  const evening = post.sharedRoutine?.evening || [];
  const preview = morning.length ? { title: '☀️ Buổi sáng (AM)', steps: morning } : evening.length ? { title: '🌙 Buổi tối (PM)', steps: evening } : null;
  const hasRoutine = countRoutineSteps(post.sharedRoutine) > 0;

  return (
    <TouchableOpacity style={styles.postCard} activeOpacity={0.95} onPress={onOpen}>
      <PostAuthorRow post={post} />
      <Text style={styles.postText} numberOfLines={4}>{post.content}</Text>
      {post.tags?.length > 0 && <Text style={styles.tags}>{post.tags.join('  ')}</Text>}
      {post.images?.length > 0 && <Image source={{ uri: post.images[0] }} style={styles.postImage} accessibilityLabel="Ảnh minh chứng" />}
      {preview && (
        <View style={styles.routinePreview}>
          <View style={styles.routineTitleRow}>
            <Text style={styles.routineTitle}>{preview.title}</Text>
            <Text style={styles.stepCount}>{preview.steps.length} bước</Text>
          </View>
          <FlatList
            horizontal
            data={preview.steps}
            keyExtractor={(step, index) => `${step.productName}-${index}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stepList}
            renderItem={({ item, index }) => (
              <View style={styles.stepCard}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
                <Text style={styles.stepType}>{item.productType.toUpperCase()}</Text>
                <Text style={styles.stepProduct} numberOfLines={2}>{item.productName}</Text>
                {item.note ? <Text style={styles.stepNote} numberOfLines={1}>{item.note}</Text> : null}
              </View>
            )}
          />
        </View>
      )}
      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.metric} onPress={onLike} accessibilityRole="button" accessibilityLabel={post.isLiked ? 'Bỏ thích' : 'Thích'}>
          <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={19} color={post.isLiked ? Colors.error : Colors.text} />
          <Text style={styles.metricText}>{post.likesCount}</Text>
        </TouchableOpacity>
        <View style={styles.metric}>
          <Ionicons name="copy-outline" size={17} color={Colors.primaryDark} />
          <Text style={styles.metricText}>{post.copiesCount}</Text>
        </View>
        {hasRoutine && (
          <TouchableOpacity style={styles.copyButton} onPress={onCopy} disabled={isCopying} accessibilityRole="button">
            {isCopying ? <ActivityIndicator size="small" color={Colors.textLight} /> : <Ionicons name="copy" size={15} color={Colors.textLight} />}
            <Text style={styles.copyText}>Sao chép chu trình</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingBottom: 22, flexGrow: 1 },
  topBar: { minHeight: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 19, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pageTitle: { color: Colors.text, fontSize: 22, fontWeight: '600' },
  filters: { gap: 8, paddingHorizontal: 19, paddingVertical: 10 },
  filter: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 19, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  filterActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  filterText: { color: Colors.text, fontSize: 12 },
  filterTextActive: { color: Colors.primaryDark, fontWeight: '600' },
  composer: { minHeight: 63, flexDirection: 'row', alignItems: 'center', gap: 11, marginHorizontal: 19, marginTop: 4, marginBottom: 14, paddingHorizontal: 12, borderRadius: 20, backgroundColor: Colors.background },
  avatarPlaceholder: { width: 37, height: 37, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },
  composerPlaceholder: { flex: 1, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 20, backgroundColor: Colors.surface },
  composerPlaceholderText: { color: Colors.textMuted, fontSize: 12 },
  composerAction: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  emptyState: { alignItems: 'center', gap: 10, paddingHorizontal: 32, paddingTop: 48 },
  emptyText: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  retryText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  postCard: { marginHorizontal: 19, marginBottom: 14, padding: 14, borderRadius: 20, backgroundColor: Colors.background },
  postText: { color: Colors.text, fontSize: 13, lineHeight: 20, marginTop: 12 },
  tags: { color: Colors.primary, fontSize: 12, marginTop: 6 },
  postImage: { width: '100%', height: 180, borderRadius: 16, marginTop: 12, backgroundColor: Colors.surface },
  routinePreview: { marginTop: 13 },
  routineTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  routineTitle: { color: Colors.text, fontSize: 12 },
  stepCount: { color: Colors.textSecondary, fontSize: 10 },
  stepList: { gap: 7 },
  stepCard: { width: 108, minHeight: 108, borderRadius: 22, padding: 10, backgroundColor: Colors.surface },
  stepNumber: { width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, marginBottom: 5 },
  stepNumberText: { color: Colors.background, fontSize: 10, fontWeight: '700' },
  stepType: { color: Colors.textSecondary, fontSize: 9 },
  stepProduct: { color: Colors.text, fontSize: 12, lineHeight: 16, marginTop: 4 },
  stepNote: { color: Colors.textSecondary, fontSize: 9, marginTop: 'auto' },
  postFooter: { flexDirection: 'row', alignItems: 'center', gap: 17, marginTop: 14, paddingTop: 11, borderTopWidth: 1, borderTopColor: Colors.border },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 32 },
  metricText: { color: Colors.text, fontSize: 12 },
  copyButton: { flex: 1, minHeight: 39, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 10, borderRadius: 22, backgroundColor: Colors.primary },
  copyText: { color: Colors.background, fontSize: 12, fontWeight: '700' },
});
