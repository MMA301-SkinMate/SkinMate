import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCommunity } from '../../context/CommunityContext';
import { COLORS } from '../../constants/colors';
import { SPACING, TYPOGRAPHY, getHeadingStyle, RADIUS } from '../../constants/theme';
import { SKIN_TYPES, SKIN_TYPE_LABELS, SKIN_CONDITIONS, SKIN_CONDITION_LABELS } from '../../constants/community';

export default function CommunityScreen({ navigation }) {
  const { posts, skinTypeFilter, setSkinTypeFilter, skinConditionFilter, setSkinConditionFilter, showMyPosts, setShowMyPosts, isCommunityLoading, communityError, refreshPosts } = useCommunity();
  const [search, setSearch] = useState('');
  useFocusEffect(useCallback(() => { refreshPosts(); }, [refreshPosts]));
  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter((post) => `${post.title || ''} ${post.content || ''} ${(post.tags || []).join(' ')} ${post.authorName || ''}`.toLowerCase().includes(query));
  }, [posts, search]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isCommunityLoading} onRefresh={refreshPosts} tintColor={COLORS.primary} />}
        ListHeaderComponent={<View>
          <View style={styles.header}><View><Text style={styles.eyebrow}>SKINMATE CIRCLE</Text><Text style={getHeadingStyle('Community', 'title')}>Community</Text><Text style={styles.intro}>Real routines, shared by people like you.</Text></View><View style={styles.headerIcon}><Ionicons name="people-outline" size={22} color={COLORS.primary} /></View></View>
          <View style={styles.feedTabs}>
            <Pressable onPress={() => setShowMyPosts(false)} style={[styles.feedTab, !showMyPosts && styles.feedTabActive]}><Ionicons name="globe-outline" size={16} color={!showMyPosts ? COLORS.textLight : COLORS.textSecondary} /><Text style={[styles.feedTabText, !showMyPosts && styles.feedTabTextActive]}>All posts</Text></Pressable>
            <Pressable onPress={() => setShowMyPosts(true)} style={[styles.feedTab, showMyPosts && styles.feedTabActive]}><Ionicons name="person-outline" size={16} color={showMyPosts ? COLORS.textLight : COLORS.textSecondary} /><Text style={[styles.feedTabText, showMyPosts && styles.feedTabTextActive]}>My posts</Text></Pressable>
          </View>
          <View style={styles.searchBox}><Ionicons name="search-outline" size={19} color={COLORS.primary} /><TextInput value={search} onChangeText={setSearch} placeholder="Search routines and skincare tips" placeholderTextColor={COLORS.textMuted} style={styles.searchInput} returnKeyType="search" /></View>
          <FilterRow title="Skin type" values={[null, ...SKIN_TYPES]} selected={skinTypeFilter} onSelect={setSkinTypeFilter} labels={{ null: 'All', ...SKIN_TYPE_LABELS }} />
          <FilterRow title="Today's condition" values={[null, ...SKIN_CONDITIONS]} selected={skinConditionFilter} onSelect={setSkinConditionFilter} labels={{ null: 'All', ...SKIN_CONDITION_LABELS }} />
          {communityError ? <View style={styles.errorBox}><Text style={styles.errorText}>{communityError}</Text><Pressable onPress={refreshPosts}><Text style={styles.retry}>Try again</Text></Pressable></View> : null}
        </View>}
        ListEmptyComponent={isCommunityLoading ? <ActivityIndicator style={styles.empty} color={COLORS.primary} /> : <Text style={styles.emptyText}>{showMyPosts ? 'You have not shared any posts yet.' : 'No community posts match your filters.'}</Text>}
        renderItem={({ item }) => <PostCard post={item} onPress={() => navigation.navigate('PostDetail', { postId: item.id })} />}
      />
    </SafeAreaView>
  );
}

function FilterRow({ title, values, selected, onSelect, labels }) {
  return <View style={styles.filterSection}><Text style={styles.filterTitle}>{title}</Text><FlatList horizontal data={values} keyExtractor={(value) => value || 'all'} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList} renderItem={({ item }) => { const active = selected === item; return <Pressable onPress={() => onSelect(item)} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{labels[item] || item || 'All'}</Text></Pressable>; }} /></View>;
}

function PostCard({ post, onPress }) {
  const stepCount = (post.sharedRoutine?.morning?.length || 0) + (post.sharedRoutine?.evening?.length || 0) + (post.sharedRoutine?.days || []).reduce((total, day) => total + (day.morning?.length || 0) + (day.evening?.length || 0), 0);
  return <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
    <View style={styles.authorRow}><View style={styles.avatar}><Ionicons name="person-outline" size={17} color={COLORS.primary} /></View><View><Text style={styles.author}>{post.authorName || 'SkinMate member'}</Text><Text style={styles.date}>{post.skinTypes?.map((type) => SKIN_TYPE_LABELS[type] || type).join(' · ') || 'Skincare routine'}</Text></View></View>
    {post.title ? <Text style={styles.postTitle}>{post.title}</Text> : null}<Text style={styles.postText} numberOfLines={4}>{post.note || post.content}</Text>
    <View style={styles.metaRow}>{stepCount > 0 && <View style={styles.meta}><Ionicons name="sparkles-outline" size={16} color={COLORS.primary} /><Text style={styles.metaText}>{stepCount} routine steps</Text></View>}<View style={styles.meta}><Ionicons name="heart-outline" size={16} color={COLORS.error} /><Text style={styles.metaText}>{post.likesCount || 0}</Text></View><View style={styles.meta}><Ionicons name="copy-outline" size={16} color={COLORS.primary} /><Text style={styles.metaText}>{post.copiesCount || 0}</Text></View></View>
  </Pressable>;
}

const styles = StyleSheet.create({
  eyebrow: { ...TYPOGRAPHY.caption, color: COLORS.primary, letterSpacing: 1.2, fontWeight: '700', marginBottom: 3 },
  intro: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 3 },
  headerIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e3f5ef' },
  postTitle: { ...TYPOGRAPHY.section, color: COLORS.textMain, marginTop: SPACING.md },
  safeArea: { flex: 1, backgroundColor: COLORS.background }, content: { paddingHorizontal: SPACING.screen, paddingBottom: SPACING.xxxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.lg },
  feedTabs: { flexDirection: 'row', padding: 4, marginBottom: SPACING.sm, borderRadius: RADIUS.pill, backgroundColor: COLORS.surface }, feedTab: { flex: 1, minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: RADIUS.pill }, feedTabActive: { backgroundColor: COLORS.primary }, feedTabText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '600' }, feedTabTextActive: { color: COLORS.textLight },
  searchBox: { minHeight: 52, borderRadius: RADIUS.card, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.035, shadowRadius: 8, elevation: 1 }, searchInput: { flex: 1, ...TYPOGRAPHY.bodySmall, color: COLORS.textMain },
  filterSection: { marginTop: SPACING.xs }, filterTitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '700' }, filterList: { gap: SPACING.xs, paddingVertical: 5 },
  filter: { borderWidth: 1, borderColor: COLORS.borderDark, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, backgroundColor: COLORS.card }, filterActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary }, filterText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary }, filterTextActive: { color: COLORS.textLight },
  card: { marginTop: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.card, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }, pressed: { opacity: 0.82 }, authorRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#d7f3ed' }, author: { ...TYPOGRAPHY.label, color: COLORS.textMain }, date: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 }, postText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMain, marginTop: SPACING.md, lineHeight: 22 }, metaRow: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border }, meta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }, metaText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary }, empty: { marginTop: SPACING.xxxl }, emptyText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xxxl }, errorBox: { padding: SPACING.sm, marginTop: SPACING.md, borderRadius: RADIUS.input, backgroundColor: '#fff1f2' }, errorText: { ...TYPOGRAPHY.caption, color: COLORS.error }, retry: { ...TYPOGRAPHY.label, color: COLORS.primary, marginTop: SPACING.xs },
});
