import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { countRoutineSteps } from '../../constants/community';
import { getProductIcon } from '../../constants/product-icons';
import { getCommunityPost } from '../../api/communityApi';
import PostAuthorRow from '../../components/community/PostAuthorRow';
import { useCommunity } from '../../context/CommunityContext';
import { useCollection } from '../../context/CollectionContext';

const SLOTS = [
  { key: 'morning', title: 'Buổi sáng (AM)', icon: 'sunny-outline', color: Colors.primary, tint: Colors.primaryLight },
  { key: 'evening', title: 'Buổi tối (PM)', icon: 'moon-outline', color: Colors.primaryDark, tint: Colors.surface },
];

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params || {};
  const { posts, toggleLike, copyRoutine } = useCommunity();
  const { refreshCollection } = useCollection();
  const [post, setPost] = useState(() => posts.find(item => item.id === postId) || null);
  const [error, setError] = useState(null);
  const [isCopying, setIsCopying] = useState(false);

  const loadPost = useCallback(async () => {
    setError(null);
    try {
      const result = await getCommunityPost(postId);
      setPost(result.post);
    } catch (loadError) {
      setError(loadError.message || 'Không thể tải bài viết.');
    }
  }, [postId]);

  useEffect(() => { loadPost(); }, [loadPost]);

  const handleLike = async () => {
    try { setPost(await toggleLike(postId)); } catch (likeError) { Alert.alert('Lỗi', likeError.message || 'Không thể thích bài viết.'); }
  };

  const handleCopy = async () => {
    if (isCopying) return;
    setIsCopying(true);
    try {
      const result = await copyRoutine(postId);
      setPost(result.post);
      await refreshCollection();
      Alert.alert('Thành công', `Đã thêm ${result.copiedCount} sản phẩm vào tủ đồ của bạn.`);
    } catch (copyError) {
      Alert.alert('Lỗi', copyError.message || 'Không thể sao chép chu trình.');
    } finally {
      setIsCopying(false);
    }
  };

  const header = (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Quay lại"><Ionicons name="arrow-back" size={23} color={Colors.text} /></TouchableOpacity>
      <Text style={styles.headerTitle}>Chi Tiết Routine</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {header}
        <View style={styles.centered}>
          {error ? <><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={loadPost}><Text style={styles.retryText}>Thử lại</Text></TouchableOpacity></> : <ActivityIndicator color={Colors.primary} />}
        </View>
      </SafeAreaView>
    );
  }

  const hasRoutine = countRoutineSteps(post.sharedRoutine) > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {header}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.authorCard}>
          <PostAuthorRow post={post} />
          <Text style={styles.intro}>{post.content}</Text>
          {post.tags?.length > 0 && <Text style={styles.tags}>{post.tags.join('  ')}</Text>}
        </View>
        {post.images?.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
            {post.images.map(uri => <Image key={uri} source={{ uri }} style={styles.image} accessibilityLabel="Ảnh minh chứng" />)}
          </ScrollView>
        )}
        {(post.sharedRoutine?.days?.length ? post.sharedRoutine.days : [post.sharedRoutine || {}]).map((day, index) => <View key={index}>
          <Text style={styles.sectionTitle}>Ngày {index + 1}</Text>
          {SLOTS.map(slot => <RoutineSection key={slot.key} slot={slot} steps={day[slot.key] || []} />)}
        </View>)}
        {!hasRoutine && <Text style={styles.noRoutine}>Bài viết này không đính kèm routine.</Text>}
      </ScrollView>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomLike} onPress={handleLike} accessibilityRole="button" accessibilityLabel={post.isLiked ? 'Bỏ thích' : 'Thích'}>
          <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={21} color={Colors.error} />
          <Text style={styles.bottomCount}>{post.likesCount}</Text>
        </TouchableOpacity>
        <View style={styles.bottomLike}>
          <Ionicons name="copy-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.bottomCount}>{post.copiesCount}</Text>
        </View>
        {hasRoutine && (
          <TouchableOpacity style={styles.saveButton} onPress={handleCopy} disabled={isCopying} accessibilityRole="button">
            {isCopying ? <ActivityIndicator size="small" color={Colors.textLight} /> : <Ionicons name="download-outline" size={17} color={Colors.textLight} />}
            <Text style={styles.saveText}>Lưu Routine vào tủ</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
function RoutineSection({ slot, steps }) {
  if (!steps.length) return null;
  return (
    <View style={styles.routineSection}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: slot.tint }]}><Ionicons name={slot.icon} size={17} color={slot.color} /></View>
        <Text style={styles.sectionTitle}>{slot.title}</Text>
        <View style={[styles.timeBadge, { backgroundColor: slot.tint }]}><Text style={styles.timeText}>{steps.length} bước</Text></View>
      </View>
      {steps.map((step, index) => (
        <View key={`${step.productName}-${index}`} style={styles.detailStep}>
          <View style={styles.stepRail}>
            <View style={styles.stepCircle}><Text style={styles.stepNumber}>{index + 1}</Text></View>
            {index < steps.length - 1 && <View style={styles.rail} />}
          </View>
          <View style={styles.stepContent}>
            <Image source={getProductIcon(step.productIcon, step.productType).image} style={styles.stepImage} />
            <View style={styles.stepCopy}>
              <Text style={styles.stepType}>{step.productType.toUpperCase()}</Text>
              <Text style={styles.stepProduct}>{step.productName}</Text>
              {step.brand ? <Text style={styles.stepBrand}>{step.brand}</Text> : null}
              {step.note ? <Text style={styles.instructionText}>{step.note}</Text> : null}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  headerSpacer: { width: 23 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  errorText: { color: Colors.textSecondary, fontSize: 13 },
  retryText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  content: { padding: 15, paddingBottom: 30 },
  authorCard: { padding: 14, borderRadius: 22, backgroundColor: Colors.background, marginBottom: 14 },
  intro: { color: Colors.text, fontSize: 14, lineHeight: 21, marginTop: 12 },
  tags: { color: Colors.primary, fontSize: 12, marginTop: 8 },
  imageRow: { gap: 8, marginBottom: 14 },
  image: { width: 220, height: 220, borderRadius: 18, backgroundColor: Colors.surface },
  noRoutine: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 8 },
  routineSection: { marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 },
  sectionIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, color: Colors.text, fontSize: 16, fontWeight: '600' },
  timeBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  timeText: { color: Colors.textSecondary, fontSize: 11 },
  detailStep: { flexDirection: 'row', gap: 8 },
  stepRail: { width: 28, alignItems: 'center' },
  stepCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  stepNumber: { color: Colors.primaryDark, fontSize: 11, fontWeight: '600' },
  rail: { width: 1, flex: 1, backgroundColor: Colors.borderDark, marginTop: 3 },
  stepContent: { flex: 1, flexDirection: 'row', gap: 10, padding: 12, borderRadius: 20, backgroundColor: Colors.background, marginBottom: 8 },
  stepImage: { width: 38, height: 38, resizeMode: 'contain' },
  stepCopy: { flex: 1 },
  stepType: { color: Colors.primaryDark, fontSize: 10, letterSpacing: 0.3 },
  stepProduct: { color: Colors.text, fontSize: 14, marginTop: 3 },
  stepBrand: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  instructionText: { color: Colors.textSecondary, fontSize: 11, lineHeight: 15, marginTop: 6 },
  bottomBar: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  bottomLike: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 40, paddingHorizontal: 4 },
  bottomCount: { color: Colors.text, fontSize: 13 },
  saveButton: { flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 22, backgroundColor: Colors.primary },
  saveText: { color: Colors.textLight, fontSize: 13, fontWeight: '700' },
});
