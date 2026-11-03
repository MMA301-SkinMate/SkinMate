import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

const PRODUCT_TYPES = [
  ['cleanser', 'Sữa rửa mặt'],
  ['toner', 'Toner'],
  ['serum', 'Serum'],
  ['cream', 'Kem dưỡng'],
  ['sunscreen', 'Chống nắng'],
  ['treatment', 'Đặc trị'],
];

export default function ProductFormScreen({ navigation, route }) {
  const { request } = useApp();
  const product = route.params?.product;
  const [name, setName] = useState(product?.productName || '');
  const [type, setType] = useState(product?.productType || 'cleanser');
  const [ingredients, setIngredients] = useState((product?.ingredientsList || []).join(', '));
  const [expirationDate, setExpirationDate] = useState(product?.expirationDate?.slice(0, 10) || '');
  const [note, setNote] = useState(product?.note || '');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Thiếu tên sản phẩm', 'Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (expirationDate && !/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) {
      Alert.alert('Ngày không hợp lệ', 'Nhập ngày theo định dạng YYYY-MM-DD.');
      return;
    }
    setBusy(true);
    try {
      const body = {
        productName: name.trim(),
        productType: type,
        ingredientsList: ingredients.split(',').map((item) => item.trim()).filter(Boolean),
        expirationDate: expirationDate || null,
        note: note.trim() || null,
      };
      await request(product ? `/collection/${product._id}` : '/collection', {
        method: product ? 'PUT' : 'POST',
        body,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Không thể lưu sản phẩm', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={Colors.text} /></TouchableOpacity>
        <Text style={styles.title}>{product ? 'Sửa sản phẩm' : 'Thêm vào tủ đồ'}</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Tên sản phẩm *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ví dụ: Sữa rửa mặt dịu nhẹ" />
        <Text style={styles.label}>Loại sản phẩm</Text>
        <View style={styles.types}>
          {PRODUCT_TYPES.map(([value, label]) => (
            <TouchableOpacity key={value} onPress={() => setType(value)} style={[styles.chip, type === value && styles.chipActive]}>
              <Text style={[styles.chipText, type === value && styles.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Thành phần (phân cách bằng dấu phẩy)</Text>
        <TextInput style={[styles.input, styles.multiline]} value={ingredients} onChangeText={setIngredients} multiline placeholder="Niacinamide, Ceramide..." />
        <Text style={styles.label}>Ngày hết hạn (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={expirationDate} onChangeText={setExpirationDate} placeholder="2027-12-31" />
        <Text style={styles.label}>Ghi chú</Text>
        <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="Cách sử dụng..." />
        <TouchableOpacity style={[styles.submit, busy && styles.disabled]} onPress={save} disabled={busy}>
          <Text style={styles.submitText}>{busy ? 'Đang lưu...' : 'Lưu sản phẩm'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { color: Colors.text, fontSize: 17, fontWeight: '800' },
  spacer: { width: 24 },
  content: { padding: 16, paddingBottom: 32 },
  label: { color: Colors.text, fontWeight: '700', marginTop: 12, marginBottom: 7 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, color: Colors.text },
  multiline: { minHeight: 85, textAlignVertical: 'top' },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { color: Colors.text, fontSize: 12 },
  chipTextActive: { color: Colors.primaryDark, fontWeight: '700' },
  submit: { backgroundColor: Colors.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '800' },
});
