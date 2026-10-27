import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { SKIN_TYPES } from '../../constants/skinTypes';
import { useApp } from '../../context/AppContext';

const concernOptions = [
  'Mụn bọc/mụn ẩn',
  'Thâm sạm, tàn nhang',
  'Lỗ chân lông to',
  'Bóng dầu vùng T',
  'Dễ ửng đỏ, kích ứng',
  'Lão hóa/nếp nhăn',
  'Khô ráp, thiếu ẩm',
];

export default function SkinProfileSetup({ navigation }) {
  const { request, userProfile, updateUserProfile } = useApp();
  const [selectedType, setSelectedType] = useState(userProfile?.skinType || 'da_dau');
  const [selectedConcerns, setSelectedConcerns] = useState(userProfile?.concerns || []);
  const [allergiesText, setAllergiesText] = useState((userProfile?.allergies || []).join(', '));
  const [busy, setBusy] = useState(false);

  const toggleConcern = (item) => {
    setSelectedConcerns((previous) => (
      previous.includes(item) ? previous.filter((concern) => concern !== item) : [...previous, item]
    ));
  };

  const saveProfile = async (cancelActivePlan = false) => {
    setBusy(true);
    try {
      const allergies = allergiesText.split(/[\n,]/).map((value) => value.trim()).filter(Boolean);
      const result = await request('/skin-profile/update', {
        method: 'PUT',
        body: { skinType: selectedType, allergies, currentConcerns: selectedConcerns, cancelActivePlan },
      });
      const savedProfile = result.user.skinProfile;
      updateUserProfile({
        skinType: savedProfile.skinType,
        skinProfile: savedProfile,
        concerns: savedProfile.currentConcerns || [],
        allergies: savedProfile.allergies || [],
      });
      if (result.evaluatedCloset?.length) {
        const evaluation = result.evaluatedCloset
          .map((item) => `${item.productName}: ${item.compatibilityScore}%${item.conflictingIngredients.length ? ` · ${item.conflictingIngredients.join(', ')}` : ''}`)
          .join('\n');
        Alert.alert('Đánh giá lại tủ đồ', evaluation);
      } else {
        Alert.alert('Thành công', 'Hồ sơ da đã được cập nhật.');
      }
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('MainTabs');
    } catch (error) {
      const warning = error.data?.activePlanWarning;
      if (error.status === 409 && warning) {
        Alert.alert('Routine đang hoạt động', warning.message, [
          { text: 'Giữ nguyên', style: 'cancel' },
          { text: 'Hủy routine và cập nhật', style: 'destructive', onPress: () => saveProfile(true) },
        ]);
      } else {
        Alert.alert('Không thể lưu hồ sơ', error.message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Thiết lập hồ sơ da</Text>
        <Text style={styles.subtitle}>Thông tin này được dùng để cá nhân hóa cẩm nang và routine.</Text>

        <Text style={styles.sectionTitle}>Loại da</Text>
        <View style={styles.grid}>
          {SKIN_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[styles.chip, selectedType === type.value && styles.chipActive]}
              onPress={() => setSelectedType(type.value)}
            >
              <Text style={[styles.chipText, selectedType === type.value && styles.chipTextActive]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Tình trạng da hiện tại</Text>
        <View style={styles.grid}>
          {concernOptions.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, selectedConcerns.includes(item) && styles.chipActive]}
              onPress={() => toggleConcern(item)}
            >
              <Text style={[styles.chipText, selectedConcerns.includes(item) && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Thành phần dị ứng</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={allergiesText}
          onChangeText={setAllergiesText}
          placeholder="Ví dụ: Fragrance, Alcohol Denat (cách nhau bằng dấu phẩy)"
          multiline
        />
        <TouchableOpacity style={[styles.submit, busy && styles.disabled]} onPress={() => saveProfile()} disabled={busy}>
          <Text style={styles.submitText}>{busy ? 'Đang lưu...' : 'Lưu hồ sơ da'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 36 },
  title: { color: Colors.text, fontSize: 23, fontWeight: '800' },
  subtitle: { color: Colors.textSecondary, marginTop: 6, marginBottom: 20, lineHeight: 20 },
  sectionTitle: { color: Colors.text, fontSize: 15, fontWeight: '700', marginTop: 18, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { color: Colors.text, fontSize: 13 },
  chipTextActive: { color: Colors.primaryDark, fontWeight: '700' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, color: Colors.text },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  submit: { backgroundColor: Colors.primary, padding: 14, alignItems: 'center', borderRadius: 12, marginTop: 24 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '800' },
});
