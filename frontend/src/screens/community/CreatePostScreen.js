import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/theme';
import { POST_TAGS, SKIN_TYPES } from '../../constants/community';
import { getProductIcon } from '../../constants/product-icons';
import { uploadCommunityImages, updateCommunityPost } from '../../api/communityApi';
import { useCommunity } from '../../context/CommunityContext';
import { useCollection } from '../../context/CollectionContext';

const MAX_IMAGES = 5;
const SLOTS = [
  { key: 'morning', title: '☀️  Buổi sáng' },
  { key: 'evening', title: '🌙  Buổi tối' },
];

const toStep = product => ({
  productName: product.productName,
  productType: product.productType,
  productIcon: product.productIcon || null,
  brand: product.brand || null,
  note: null,
});

export default function CreatePostScreen({ navigation, route }) {
  const draft = route.params?.draft;
  const { addPost, refreshPosts } = useCommunity();
  const { collection } = useCollection();
  const draftDays = useMemo(() => draft?.sharedRoutine?.days?.length ? draft.sharedRoutine.days : [draft?.sharedRoutine || {}], [draft]);
  const draftProducts = useMemo(() => draftDays.flatMap((day, dayIndex) => SLOTS.flatMap(slot => (day[slot.key] || []).map((step, index) => ({ ...step, id: `draft-${dayIndex}-${slot.key}-${index}`, status: 'active' })))), [draftDays]);
  const [content, setContent] = useState(draft?.content || '');
  const [tags, setTags] = useState(draft?.tags || []);
  const [skinType, setSkinType] = useState(draft?.skinType || null);
  const [images, setImages] = useState((draft?.images || []).map(uri => ({ uri, uploaded: true })));
  const [dayIndex, setDayIndex] = useState(0);
  const [routineDays, setRoutineDays] = useState(() => draftDays.map((day, index) => Object.fromEntries(SLOTS.map(slot => [slot.key, draftProducts.filter(product => product.id.startsWith(`draft-${index}-${slot.key}-`)).map(product => product.id)]))));
  const routine = routineDays[dayIndex];
  const [notes, setNotes] = useState(() => Object.fromEntries(draftDays.flatMap((day, index) => SLOTS.flatMap(slot => draftProducts.map(product => [`${index}:${slot.key}:${product.id}`, product.note || ''])))));
  const [isPublishing, setIsPublishing] = useState(false);

  const usableProducts = useMemo(() => [...draftProducts, ...collection.filter(product => product.status === 'active')], [collection, draftProducts]);

  const toggleTag = tag => setTags(current => current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag]);
  const toggleProduct = (slot, productId) => setRoutineDays(current => current.map((day, index) => index !== dayIndex ? day : {
    ...day,
    [slot]: day[slot].includes(productId) ? day[slot].filter(id => id !== productId) : [...day[slot], productId].slice(0, 15),
  }));

  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh.');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsMultipleSelection: true, selectionLimit: MAX_IMAGES - images.length });
      if (!result.canceled) {
        const selected = (result.assets || []).filter(asset => asset.uri);
        if (selected.some(asset => asset.fileSize > 5 * 1024 * 1024)) {
          Alert.alert('Ảnh quá lớn', 'Mỗi ảnh phải nhỏ hơn hoặc bằng 5MB.');
          return;
        }
        setImages(current => [...current, ...selected.filter(asset => !current.some(image => image.uri === asset.uri))].slice(0, MAX_IMAGES));
      }
    } catch (error) {
      Alert.alert('Không thể chọn ảnh', error.message || 'Vui lòng thử lại.');
    }
  };

  const publish = async (status = 'published') => {
    if ((status === 'published' && !content.trim()) || isPublishing) return;
    setIsPublishing(true);
    try {
      const pending = images.filter(image => !image.uploaded);
      const result = pending.length ? await uploadCommunityImages(pending) : { images: [] };
      let uploadedIndex = 0;
      const uploaded = images.map(image => image.uploaded ? image : { uri: result.images[uploadedIndex++], uploaded: true });
      setImages(uploaded);
      const findProducts = (day, index, slot) => day[slot].map(id => {
        const product = usableProducts.find(item => item.id === id);
        return product ? { ...toStep(product), note: notes[`${index}:${slot}:${id}`]?.trim() || null } : null;
      }).filter(Boolean);
      const days = routineDays.map((day, index) => ({ morning: findProducts(day, index, 'morning'), evening: findProducts(day, index, 'evening') }));
      const payload = {
        content: content.trim(), tags, skinType, status,
        images: uploaded.map(image => image.uri),
        sharedRoutine: { ...days[0], days },
      };
      if (draft) {
        await updateCommunityPost(draft.id, payload);
        await refreshPosts();
      } else {
        await addPost(payload);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Không thể đăng bài', error.message || 'Vui lòng thử lại.');
    } finally {
      setIsPublishing(false);
    }
  };

  const canPublish = content.trim().length > 0 && !isPublishing;
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button"><Text style={styles.cancel}>Hủy</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Chia Sẻ Routine</Text>
        <TouchableOpacity onPress={() => publish('published')} disabled={!canPublish} accessibilityRole="button">
          {isPublishing ? <ActivityIndicator color={Colors.primary} /> : <Text style={[styles.publish, !canPublish && styles.disabled]}>Đăng</Text>}
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.textArea}
          multiline
          maxLength={2000}
          value={content}
          onChangeText={setContent}
          placeholder="Bạn muốn chia sẻ điều gì hôm nay?"
          placeholderTextColor={Colors.textMuted}
          accessibilityLabel="Nội dung bài viết"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {POST_TAGS.map(tag => (
            <TouchableOpacity key={tag} style={[styles.chip, tags.includes(tag) && styles.chipActive]} onPress={() => toggleTag(tag)} accessibilityState={{ selected: tags.includes(tag) }}>
              <Text style={styles.chipText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Loại da</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SKIN_TYPES.map(type => (
            <TouchableOpacity key={type} style={[styles.chip, skinType === type && styles.chipActive]} onPress={() => setSkinType(current => current === type ? null : type)} accessibilityState={{ selected: skinType === type }}>
              <Text style={styles.chipText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionRow}>
          <View style={styles.labelLeft}><Ionicons name="images-outline" size={18} color={Colors.primaryDark} /><Text style={styles.sectionTitle}>Hình ảnh minh chứng</Text></View>
          <Text style={styles.muted}>{images.length}/{MAX_IMAGES} ảnh</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
          {images.length < MAX_IMAGES && (
            <TouchableOpacity style={styles.addImage} onPress={pickImage} accessibilityRole="button" accessibilityLabel="Thêm ảnh">
              <View style={styles.cameraCircle}><Ionicons name="camera-outline" size={24} color={Colors.primaryDark} /></View>
              <Text style={styles.addImageText}>Thêm ảnh</Text>
              <Text style={styles.muted}>Tối đa 5MB</Text>
            </TouchableOpacity>
          )}
          {images.map(image => (
            <View key={image.uri} style={styles.evidenceImage}>
              <Image source={{ uri: image.uri }} style={StyleSheet.absoluteFill} />
              <TouchableOpacity style={styles.removeImage} onPress={() => setImages(current => current.filter(item => item.uri !== image.uri))} accessibilityLabel="Xóa ảnh">
                <Ionicons name="close" size={16} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.routineCard}>
          <View style={styles.labelLeft}><Ionicons name="sparkles-outline" size={18} color={Colors.primaryDark} /><Text style={styles.routineTitle}>Routine đính kèm</Text></View>
          <Text style={styles.muted}>Chọn sản phẩm từ tủ đồ của bạn. Người xem có thể sao chép chu trình này.</Text>
          <ScrollView horizontal contentContainerStyle={styles.chips}>
            {routineDays.map((day, index) => <TouchableOpacity key={index} style={[styles.chip, dayIndex === index && styles.chipActive]} onPress={() => setDayIndex(index)} disabled={isPublishing}><Text style={styles.chipText}>Ngày {index + 1}</Text></TouchableOpacity>)}
            {routineDays.length < 31 && <TouchableOpacity style={styles.chip} disabled={isPublishing} onPress={() => { setRoutineDays(current => [...current, { morning: [], evening: [] }]); setDayIndex(routineDays.length); }}><Text style={styles.chipText}>+ Thêm ngày</Text></TouchableOpacity>}
          </ScrollView>
          {usableProducts.length === 0 ? (
            <Text style={styles.emptyRoutine}>Tủ đồ chưa có sản phẩm đang dùng.</Text>
          ) : SLOTS.map(slot => (
            <View key={slot.key} style={styles.routineStrip}>
              <Text style={styles.stripTitle}>{slot.title} · {routine[slot.key].length} bước</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stripSteps}>
                {usableProducts.map(product => {
                  const order = routine[slot.key].indexOf(product.id);
                  const isSelected = order !== -1;
                  return (
                    <TouchableOpacity key={product.id} style={styles.routineStep} onPress={() => toggleProduct(slot.key, product.id)} accessibilityState={{ selected: isSelected }} accessibilityLabel={product.productName}>
                      <View style={[styles.stepIcon, isSelected && styles.stepIconActive]}>
                        <Image source={getProductIcon(product.productIcon, product.productType).image} style={styles.stepImage} />
                        {isSelected && <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>{order + 1}</Text></View>}
                      </View>
                      <Text style={styles.stepName} numberOfLines={2}>{product.productName}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {routine[slot.key].map((id, index) => (
                <View key={id} style={styles.instruction}>
                  <Text style={styles.sectionTitle}>{index + 1}. {usableProducts.find(product => product.id === id)?.productName}</Text>
                  <TextInput
                    style={styles.noteInput}
                    multiline
                    maxLength={300}
                    value={notes[`${dayIndex}:${slot.key}:${id}`] || ''}
                    onChangeText={text => setNotes(current => ({ ...current, [`${dayIndex}:${slot.key}:${id}`]: text }))}
                    placeholder="Cách sử dụng, lượng dùng và lưu ý..."
                    placeholderTextColor={Colors.textMuted}
                    accessibilityLabel={`Cách sử dụng bước ${index + 1} ${slot.title}`}
                    editable={!isPublishing}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.draftButton} onPress={() => publish('draft')} disabled={isPublishing} accessibilityRole="button">
          <Text style={styles.publish}>Lưu bản nháp</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  instruction: { marginTop: 10 },
  noteInput: { minHeight: 64, padding: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, color: Colors.text, backgroundColor: Colors.background, textAlignVertical: 'top', marginTop: 6 },
  draftButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 16, borderWidth: 1, borderColor: Colors.primary, borderRadius: 12 },
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  cancel: { color: Colors.textSecondary, fontSize: 15 },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '600' },
  publish: { color: Colors.primary, fontSize: 16, fontWeight: '700' },
  disabled: { color: Colors.textMuted },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },
  textArea: { minHeight: 110, color: Colors.text, fontSize: 16, lineHeight: 23, textAlignVertical: 'top' },
  chips: { gap: 7, paddingVertical: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 17, backgroundColor: Colors.surface },
  chipActive: { backgroundColor: Colors.primaryLight },
  chipText: { color: Colors.primaryDark, fontSize: 12 },
  sectionTitle: { color: Colors.text, fontSize: 14, fontWeight: '500', marginTop: 10 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 6 },
  labelLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  muted: { color: Colors.textSecondary, fontSize: 11 },
  imageRow: { gap: 8, paddingBottom: 8 },
  addImage: { width: 105, height: 130, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  cameraCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  addImageText: { color: Colors.text, fontSize: 13, marginTop: 7 },
  evidenceImage: { width: 105, height: 130, borderRadius: 22, overflow: 'hidden', backgroundColor: Colors.surface },
  removeImage: { position: 'absolute', top: 7, right: 7, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.overlay },
  routineCard: { gap: 6, padding: 14, marginTop: 12, borderRadius: 20, backgroundColor: Colors.background },
  routineTitle: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  emptyRoutine: { color: Colors.textSecondary, fontSize: 12, marginTop: 6 },
  routineStrip: { padding: 10, marginTop: 6, borderRadius: 16, backgroundColor: Colors.surface },
  stripTitle: { color: Colors.text, fontSize: 13, marginBottom: 8 },
  stripSteps: { gap: 12 },
  routineStep: { alignItems: 'center', width: 64 },
  stepIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, borderWidth: 2, borderColor: 'transparent' },
  stepIconActive: { borderColor: Colors.primary },
  stepImage: { width: 30, height: 30, resizeMode: 'contain' },
  stepBadge: { position: 'absolute', right: -4, top: -4, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
  stepBadgeText: { color: Colors.textLight, fontSize: 10, fontWeight: '700' },
  stepName: { color: Colors.text, fontSize: 10, marginTop: 5, textAlign: 'center' },
});
