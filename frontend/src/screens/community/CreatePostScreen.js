import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, findNodeHandle, Image, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/theme';
import { POST_TAGS, POST_TAG_LABELS, SKIN_TYPES, SKIN_TYPE_LABELS } from '../../constants/community';
import { getProductIcon } from '../../constants/product-icons';
import { uploadCommunityImages, updateCommunityPost } from '../../api/communityApi';
import { useCommunity } from '../../context/CommunityContext';
import { useCollection } from '../../context/CollectionContext';

const MAX_IMAGES = 5;
const SLOTS = [
  { key: 'morning', title: '☀️  Morning' },
  { key: 'evening', title: '🌙  Evening' },
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
  const [skinTypes, setSkinTypes] = useState(() => {
    if (Array.isArray(draft?.skinTypes)) return draft.skinTypes;
    return draft?.skinType ? [draft.skinType] : [];
  });
  const [images, setImages] = useState((draft?.images || []).map(uri => ({ uri, uploaded: true })));
  const [dayIndex, setDayIndex] = useState(0);
  const [routineDays, setRoutineDays] = useState(() => draftDays.map((day, index) => Object.fromEntries(SLOTS.map(slot => [slot.key, draftProducts.filter(product => product.id.startsWith(`draft-${index}-${slot.key}-`)).map(product => product.id)]))));
  const routine = routineDays[dayIndex];
  const [notes, setNotes] = useState(() => Object.fromEntries(draftDays.flatMap((day, index) => SLOTS.flatMap(slot => draftProducts.map(product => [`${index}:${slot.key}:${product.id}`, product.note || ''])))));
  const [isPublishing, setIsPublishing] = useState(false);
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});
  const [inputHeights, setInputHeights] = useState({});
  const getInputHeight = (inputKey, minHeight) => inputHeights[inputKey] || minHeight;

  const resizeInput = (inputKey, contentHeight, minHeight) => {
    const height = Math.max(minHeight, Math.ceil(contentHeight) + 12);
    setInputHeights(current => current[inputKey] === height ? current : { ...current, [inputKey]: height });
  };

  const focusedInputKey = useRef(null);
  const keyboardVisible = useRef(false);
  const scrollTimer = useRef(null);

  // Scroll only after the keyboard has opened and the window has resized.
  const scrollFocusedInput = (inputKey, delay = 120) => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const input = inputRefs.current[inputKey];
      const scrollView = scrollViewRef.current;
      if (!input?.isFocused?.() || !scrollView) return;
      const handle = findNodeHandle(input);
      if (handle && typeof scrollView.scrollToFocusedInput === 'function') {
        // This is a method supplied by KeyboardAwareScrollView.
        scrollView.scrollToFocusedInput(handle, 110, 100);
      }
    }, delay);
  };

  const focusInput = inputKey => {
    focusedInputKey.current = inputKey;
    scrollFocusedInput(inputKey, keyboardVisible.current ? 80 : 300);
  };

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      keyboardVisible.current = true;
      if (focusedInputKey.current) scrollFocusedInput(focusedInputKey.current, 100);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      keyboardVisible.current = false;
    });
    return () => {
      show.remove();
      hide.remove();
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, []);

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
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsMultipleSelection: true, selectionLimit: MAX_IMAGES - images.length });
      if (!result.canceled) {
        const selected = (result.assets || []).filter(asset => asset.uri);
        if (selected.some(asset => asset.fileSize > 5 * 1024 * 1024)) {
          Alert.alert('Image too large', 'Each image must be 5 MB or smaller.');
          return;
        }
        setImages(current => [...current, ...selected.filter(asset => !current.some(image => image.uri === asset.uri))].slice(0, MAX_IMAGES));
      }
    } catch (error) {
      Alert.alert('Unable to select photos', error.message || 'Please try again.');
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
        content: content.trim(), tags, skinTypes, skinType: skinTypes[0] || null, status,
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
      Alert.alert('Unable to save post', error.message || 'Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const canPublish = content.trim().length > 0 && !isPublishing;
  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable style={styles.header} onPress={Keyboard.dismiss}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button"><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Share your routine</Text>
        <TouchableOpacity onPress={() => publish('published')} disabled={!canPublish} accessibilityRole="button">
          {isPublishing ? <ActivityIndicator color={Colors.primary} /> : <Text style={[styles.publish, !canPublish && styles.disabled]}>Post</Text>}
        </TouchableOpacity>
      </Pressable>
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardOpeningTime={0}
        extraScrollHeight={80}
        extraHeight={100}
        enableResetScrollToCoords={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
        <TextInput
          ref={ref => { inputRefs.current.content = ref; }}
          onFocus={() => focusInput('content')}
          style={[styles.textArea, { height: getInputHeight('content', 110), flexShrink: 0 }]}
          onContentSizeChange={event => {
            resizeInput('content', event.nativeEvent.contentSize.height, 110);
            if (keyboardVisible.current && focusedInputKey.current === 'content') scrollFocusedInput('content', 120);
          }}
          scrollEnabled={false}
          multiline
          submitBehavior="newline"
          value={content}
          onChangeText={setContent}
          placeholder="What would you like to share today?"
          placeholderTextColor={Colors.textMuted}
          accessibilityLabel="Post content"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {POST_TAGS.map(tag => (
            <TouchableOpacity key={tag} style={[styles.chip, tags.includes(tag) && styles.chipActive]} onPress={() => toggleTag(tag)} accessibilityState={{ selected: tags.includes(tag) }}>
              <Text style={styles.chipText}>{POST_TAG_LABELS[tag] || tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Skin type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SKIN_TYPES.map(type => {
            const isSelected = skinTypes.includes(type);
            return (
              <TouchableOpacity key={type} style={[styles.chip, isSelected && styles.chipActive]} onPress={() => setSkinTypes(current => current.includes(type) ? current.filter(item => item !== type) : [...current, type])} accessibilityState={{ selected: isSelected }}>
                <Text style={styles.chipText}>{SKIN_TYPE_LABELS[type] || type}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionRow}>
          <View style={styles.labelLeft}><Ionicons name="images-outline" size={18} color={Colors.primaryDark} /><Text style={styles.sectionTitle}>Photos</Text></View>
          <Text style={styles.muted}>{images.length}/{MAX_IMAGES} photos</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
          {images.length < MAX_IMAGES && (
            <TouchableOpacity style={styles.addImage} onPress={pickImage} accessibilityRole="button" accessibilityLabel="Add photos">
              <View style={styles.cameraCircle}><Ionicons name="camera-outline" size={24} color={Colors.primaryDark} /></View>
              <Text style={styles.addImageText}>Add photos</Text>
              <Text style={styles.muted}>Up to 5 MB each</Text>
            </TouchableOpacity>
          )}
          {images.map(image => (
            <View key={image.uri} style={styles.evidenceImage}>
              <Image source={{ uri: image.uri }} style={StyleSheet.absoluteFill} />
              <TouchableOpacity style={styles.removeImage} onPress={() => setImages(current => current.filter(item => item.uri !== image.uri))} accessibilityLabel="Remove photo">
                <Ionicons name="close" size={16} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.routineCard}>
          <View style={styles.labelLeft}><Ionicons name="sparkles-outline" size={18} color={Colors.primaryDark} /><Text style={styles.routineTitle}>Attached routine</Text></View>
          <Text style={styles.muted}>Select products from your collection. Others can copy this routine.</Text>
          <ScrollView horizontal contentContainerStyle={styles.chips}>
            {routineDays.map((day, index) => <TouchableOpacity key={index} style={[styles.chip, dayIndex === index && styles.chipActive]} onPress={() => setDayIndex(index)} disabled={isPublishing}><Text style={styles.chipText}>Day {index + 1}</Text></TouchableOpacity>)}
            {routineDays.length < 31 && <TouchableOpacity style={styles.chip} disabled={isPublishing} onPress={() => { setRoutineDays(current => [...current, { morning: [], evening: [] }]); setDayIndex(routineDays.length); }}><Text style={styles.chipText}>+ Add day</Text></TouchableOpacity>}
          </ScrollView>
          {usableProducts.length === 0 ? (
            <Text style={styles.emptyRoutine}>Your collection has no active products yet.</Text>
          ) : SLOTS.map(slot => (
            <View key={slot.key} style={styles.routineStrip}>
              <Text style={styles.stripTitle}>{slot.title} · {routine[slot.key].length} {routine[slot.key].length === 1 ? 'step' : 'steps'}</Text>
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
                    ref={ref => { inputRefs.current[`note-${dayIndex}-${slot.key}-${id}`] = ref; }}
                    onFocus={() => focusInput(`note-${dayIndex}-${slot.key}-${id}`)}
                    style={[styles.noteInput, { height: getInputHeight(`note-${dayIndex}-${slot.key}-${id}`, 64), flexShrink: 0 }]}
                    onContentSizeChange={event => {
                      resizeInput(`note-${dayIndex}-${slot.key}-${id}`, event.nativeEvent.contentSize.height, 64);
                      if (keyboardVisible.current && focusedInputKey.current === `note-${dayIndex}-${slot.key}-${id}`) {
                        scrollFocusedInput(`note-${dayIndex}-${slot.key}-${id}`, 120);
                      }
                    }}
                    
                    scrollEnabled={false}
                    multiline
                    submitBehavior="newline"
                    value={notes[`${dayIndex}:${slot.key}:${id}`] || ''}
                    onChangeText={text => setNotes(current => ({ ...current, [`${dayIndex}:${slot.key}:${id}`]: text }))}
                    placeholder="How to use, amount, and tips..."
                    placeholderTextColor={Colors.textMuted}
                    returnKeyType="default"
                    accessibilityLabel={`Instructions for step ${index + 1} ${slot.title}`}
                    editable={!isPublishing}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
          <TouchableOpacity style={styles.draftButton} onPress={() => publish('draft')} disabled={isPublishing} accessibilityRole="button">
            <Text style={styles.publish}>Save draft</Text>
          </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
      </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  instruction: { marginTop: 10 },
  noteInput: { minHeight: 64, padding: 10, paddingBottom: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, color: Colors.text, backgroundColor: Colors.background, textAlignVertical: 'top', marginTop: 6 },
  draftButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 16, borderWidth: 1, borderColor: Colors.primary, borderRadius: 12 },
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  scrollView: { flex: 1 },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  cancel: { color: Colors.textSecondary, fontSize: 15 },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '600' },
  publish: { color: Colors.primary, fontSize: 16, fontWeight: '700' },
  disabled: { color: Colors.textMuted },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 120, flexGrow: 1 },
  textArea: { minHeight: 110, paddingBottom: 10, color: Colors.text, fontSize: 16, lineHeight: 23, textAlignVertical: 'top' },
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
