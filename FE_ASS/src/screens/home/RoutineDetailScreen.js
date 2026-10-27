import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function RoutineDetailScreen({ navigation, route }) {
  const { request } = useApp();
  const [plan, setPlan] = useState(route.params.plan);
  const currentDay = plan.status === 'active' && plan.startDate
    ? Math.min(
      plan.durationDays,
      Math.max(1, Math.floor((Date.now() - new Date(plan.startDate).getTime()) / (24 * 60 * 60 * 1000)) + 1)
    )
    : 1;
  const [dayIndex, setDayIndex] = useState(currentDay);
  const [session, setSession] = useState('morning');
  const day = plan.planPayload?.find((item) => item.dayIndex === dayIndex);
  const steps = day?.[session] || [];

  const activate = async () => {
    try {
      const activePlan = await request(`/routines/plans/${plan._id}/activate`, { method: 'PUT' });
      setPlan(activePlan);
      Alert.alert('Đã thêm routine', 'Chuỗi routine đã được kích hoạt.');
    } catch (error) {
      Alert.alert('Không thể kích hoạt routine', error.message);
    }
  };

  const skip = () => {
    Alert.alert('Bỏ qua gợi ý', 'Gợi ý này sẽ được ẩn khỏi danh sách routine.', [
      { text: 'Giữ lại', style: 'cancel' },
      {
        text: 'Bỏ qua',
        onPress: async () => {
          try {
            await request(`/routines/plans/${plan._id}/skip`, { method: 'PUT' });
            navigation.goBack();
          } catch (error) {
            Alert.alert('Không thể bỏ qua routine', error.message);
          }
        },
      },
    ]);
  };

  const copy = async (overrideActive = false) => {
    try {
      const result = await request(`/routines/history/${plan._id}/copy`, {
        method: 'POST',
        body: { overrideActive },
      });
      if (result.needConfirmOverride) {
        Alert.alert('Routine đang hoạt động', result.message, [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Dừng routine cũ và copy', style: 'destructive', onPress: () => copy(true) },
        ]);
        return;
      }
      setPlan(result.copiedPlan);
      const replacements = result.replacedItems || [];
      const message = replacements.length
        ? `Đã thay thế sản phẩm:\n${replacements.map((item) => `${item.oldProduct} → ${item.replacedWith}`).join('\n')}`
        : 'Chuỗi routine đã được sao chép và kích hoạt.';
      Alert.alert('Đã copy routine', message);
    } catch (error) {
      Alert.alert('Không thể copy routine', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={Colors.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết routine</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{plan.title}</Text>
        <Text style={styles.meta}>{plan.durationDays} ngày · {plan.targetConcern} · {plan.status}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
          {plan.planPayload?.map((item) => (
            <TouchableOpacity key={item.dayIndex} onPress={() => setDayIndex(item.dayIndex)} style={[styles.dayChip, dayIndex === item.dayIndex && styles.selected]}>
              <Text style={[styles.dayText, dayIndex === item.dayIndex && styles.selectedText]}>Ngày {item.dayIndex}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.sessionRow}>
          {['morning', 'evening'].map((value) => (
            <TouchableOpacity key={value} onPress={() => setSession(value)} style={[styles.session, session === value && styles.sessionSelected]}>
              <Text style={[styles.sessionText, session === value && styles.selectedText]}>{value === 'morning' ? 'Buổi sáng' : 'Buổi tối'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {steps.map((step, index) => (
          <View key={`${step.stepNumber}-${index}`} style={styles.stepCard}>
            <Text style={styles.stepNumber}>Bước {step.stepNumber} · {step.stepType}</Text>
            <Text style={styles.product}>{step.productName}</Text>
            {step.isExternalSuggestion && <Text style={styles.external}>Gợi ý sản phẩm ngoài tủ đồ</Text>}
            {!!step.usageNote && <Text style={styles.note}>{step.usageNote}</Text>}
          </View>
        ))}
        {plan.status === 'draft' && (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={activate}><Text style={styles.primaryText}>Thêm vào routine của tôi</Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={skip}><Text style={styles.secondaryText}>Bỏ qua gợi ý</Text></TouchableOpacity>
          </>
        )}
        {plan.status !== 'draft' && (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={() => copy()}><Text style={styles.primaryText}>Copy chuỗi routine này</Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('ShareRoutine', { plan })}>
              <Text style={styles.secondaryText}>Chia sẻ lên Cộng đồng</Text>
            </TouchableOpacity>
          </>
        )}
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
  title: { color: Colors.text, fontSize: 19, fontWeight: '800' },
  meta: { color: Colors.textSecondary, marginTop: 6, textTransform: 'capitalize' },
  dayRow: { gap: 8, paddingVertical: 18 },
  dayChip: { padding: 9, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: Colors.border },
  selected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayText: { color: Colors.text, fontSize: 12, fontWeight: '700' },
  selectedText: { color: '#fff', fontWeight: '800' },
  sessionRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  session: { flex: 1, alignItems: 'center', padding: 11, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  sessionSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sessionText: { color: Colors.text, fontWeight: '700' },
  stepCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 10 },
  stepNumber: { color: Colors.primary, fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },
  product: { color: Colors.text, fontSize: 15, fontWeight: '700', marginTop: 5 },
  external: { color: Colors.warning, fontSize: 12, marginTop: 5 },
  note: { color: Colors.textSecondary, fontSize: 12, marginTop: 5 },
  primaryButton: { backgroundColor: Colors.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  primaryText: { color: '#fff', fontWeight: '800' },
  secondaryButton: { padding: 13, alignItems: 'center', marginTop: 6 },
  secondaryText: { color: Colors.primaryDark, fontWeight: '700' },
});
