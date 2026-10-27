import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight, RefreshCw } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { skinTypeLabel } from '../../constants/skinTypes';
import { useApp } from '../../context/AppContext';

export default function HomeScreen({ navigation }) {
  const { request, userProfile } = useApp();
  const [plans, setPlans] = useState([]);
  const [targetConcern, setTargetConcern] = useState(
    userProfile?.concerns?.[0] || 'Căng bóng cấp ẩm'
  );
  const [busy, setBusy] = useState(false);

  const loadPlans = useCallback(async () => {
    try {
      setPlans(await request('/routines/history'));
    } catch (error) {
      Alert.alert('Không tải được routine', error.message);
    }
  }, [request]);

  useFocusEffect(useCallback(() => { loadPlans(); }, [loadPlans]));

  const activePlan = plans.find((plan) => plan.status === 'active');
  const concerns = [...new Set([...(userProfile?.concerns || []), 'Căng bóng cấp ẩm', 'Phục hồi da'])];

  const generate = async () => {
    setBusy(true);
    try {
      const plan = await request('/routines/generate-chain', {
        method: 'POST',
        body: { targetConcern },
      });
      setPlans((previous) => [plan, ...previous]);
      navigation.navigate('RoutineDetail', { plan });
    } catch (error) {
      Alert.alert('Không tạo được routine', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Xin chào, {userProfile?.name}</Text>
        <Text style={styles.skinType}>{skinTypeLabel(userProfile?.skinType)}</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Routine đang dùng</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RoutineHistory')}>
            <Text style={styles.link}>Lịch sử <ChevronRight size={14} color={Colors.primary} /></Text>
          </TouchableOpacity>
        </View>
        {activePlan ? (
          <TouchableOpacity style={styles.planCard} onPress={() => navigation.navigate('RoutineDetail', { plan: activePlan })}>
            <Text style={styles.planTitle}>{activePlan.title}</Text>
            <Text style={styles.planMeta}>{activePlan.durationDays} ngày · {activePlan.targetConcern}</Text>
            <Text style={styles.link}>Xem routine theo ngày <ChevronRight size={14} color={Colors.primary} /></Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.planCard}>
            <Text style={styles.emptyText}>Chưa có routine đang hoạt động.</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tạo gợi ý routine 7 ngày</Text>
          <RefreshCw size={18} color={Colors.primary} />
        </View>
        <Text style={styles.hint}>Routine được tạo từ sản phẩm còn hạn trong tủ đồ; bước còn thiếu sẽ là gợi ý bên ngoài.</Text>
        <View style={styles.concerns}>
          {concerns.map((concern) => (
            <TouchableOpacity
              key={concern}
              onPress={() => setTargetConcern(concern)}
              style={[styles.chip, targetConcern === concern && styles.chipSelected]}
            >
              <Text style={[styles.chipText, targetConcern === concern && styles.chipTextSelected]}>{concern}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.generateButton, busy && styles.disabled]} onPress={generate} disabled={busy}>
          <Text style={styles.generateText}>{busy ? 'Đang tạo...' : 'Tạo gợi ý chuỗi routine'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 36 },
  greeting: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  skinType: { color: Colors.primary, fontWeight: '700', marginTop: 4, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 12 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  link: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  planCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 14 },
  planTitle: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  planMeta: { color: Colors.textSecondary, marginTop: 5, marginBottom: 12 },
  emptyText: { color: Colors.textSecondary },
  hint: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  concerns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border },
  chipSelected: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { color: Colors.text, fontSize: 12 },
  chipTextSelected: { color: Colors.primaryDark, fontWeight: '700' },
  generateButton: { backgroundColor: Colors.primary, padding: 14, alignItems: 'center', borderRadius: 10, marginTop: 20 },
  disabled: { opacity: 0.6 },
  generateText: { color: '#fff', fontWeight: '800' },
});
