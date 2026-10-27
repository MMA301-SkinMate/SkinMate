import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function ShareRoutineScreen({ navigation, route }) {
  const { request } = useApp();
  const { plan } = route.params;
  const [title, setTitle] = useState(plan.title);
  const [note, setNote] = useState('');
  const [payload, setPayload] = useState(plan.planPayload);
  const [busy, setBusy] = useState(false);

  const updateProductName = (dayIndex, session, stepIndex, productName) => {
    setPayload((previous) => previous.map((day) => (
      day.dayIndex !== dayIndex
        ? day
        : {
          ...day,
          [session]: day[session].map((step, index) => (
            index === stepIndex ? { ...step, productName } : step
          )),
        }
    )));
  };

  const share = async () => {
    if (!title.trim()) {
      Alert.alert('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề bài chia sẻ.');
      return;
    }
    setBusy(true);
    try {
      await request(`/routines/plans/${plan._id}/share-payload`, {
        method: 'POST',
        body: { title: title.trim(), note: note.trim(), planPayload: payload },
      });
      Alert.alert('Đã chia sẻ', 'Chuỗi routine đã được đăng lên Cộng đồng.', [
        { text: 'Đóng', onPress: () => navigation.navigate('MainTabs') },
      ]);
    } catch (error) {
      Alert.alert('Không thể chia sẻ routine', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={Colors.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Chia sẻ routine</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Tiêu đề bài đăng</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} maxLength={120} />
        <Text style={styles.label}>Ghi chú</Text>
        <TextInput style={[styles.input, styles.multiline]} value={note} onChangeText={setNote} multiline maxLength={1000} placeholder="Chia sẻ trải nghiệm hoặc lưu ý sử dụng..." />
        <Text style={styles.sectionTitle}>Chỉnh sửa routine trước khi chia sẻ</Text>
        {payload.map((day) => (
          <View key={day.dayIndex} style={styles.dayCard}>
            <Text style={styles.dayTitle}>Ngày {day.dayIndex}</Text>
            {['morning', 'evening'].map((session) => (
              <View key={session}>
                <Text style={styles.sessionTitle}>{session === 'morning' ? 'Buổi sáng' : 'Buổi tối'}</Text>
                {day[session].map((step, index) => (
                  <View key={`${step.stepNumber}-${index}`} style={styles.step}>
                    <Text style={styles.stepLabel}>Bước {step.stepNumber} · {step.stepType}</Text>
                    <TextInput
                      style={styles.stepInput}
                      value={step.productName}
                      onChangeText={(value) => updateProductName(day.dayIndex, session, index, value)}
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
        <TouchableOpacity style={[styles.submit, busy && styles.disabled]} onPress={share} disabled={busy}>
          <Text style={styles.submitText}>{busy ? 'Đang đăng...' : 'Đăng lên Cộng đồng'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '800' },
  spacer: { width: 24 },
  content: { padding: 16, paddingBottom: 36 },
  label: { color: Colors.text, fontWeight: '700', marginBottom: 7, marginTop: 10 },
  input: { backgroundColor: '#fff', color: Colors.text, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '800', marginTop: 22, marginBottom: 10 },
  dayCard: { backgroundColor: '#fff', padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, marginBottom: 10 },
  dayTitle: { color: Colors.primaryDark, fontWeight: '800', fontSize: 15 },
  sessionTitle: { color: Colors.text, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  step: { marginBottom: 8 },
  stepLabel: { color: Colors.textSecondary, fontSize: 11, marginBottom: 4, textTransform: 'capitalize' },
  stepInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 9, color: Colors.text },
  submit: { backgroundColor: Colors.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 14 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '800' },
});
