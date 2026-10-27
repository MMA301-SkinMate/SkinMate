import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function RoutineHistoryScreen({ navigation }) {
  const { request } = useApp();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      setHistory(await request('/routines/history'));
    } catch (error) {
      Alert.alert('Không tải được lịch sử routine', error.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useFocusEffect(useCallback(() => { loadHistory(); }, [loadHistory]));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={Colors.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử routine</Text>
        <View style={styles.spacer} />
      </View>
      <FlatList
        data={history}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadHistory}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Đang tải...' : 'Chưa có chuỗi routine trong lịch sử.'}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RoutineDetail', { plan: item })}>
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.detail}>{item.durationDays} ngày · {item.targetConcern}</Text>
              <Text style={styles.status}>Trạng thái: {item.status}</Text>
            </View>
            <ChevronRight size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  spacer: { width: 24 },
  list: { padding: 16, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 10 },
  info: { flex: 1, paddingRight: 10 },
  title: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  detail: { color: Colors.textSecondary, marginTop: 5, fontSize: 12 },
  status: { color: Colors.primaryDark, marginTop: 5, fontSize: 12, textTransform: 'capitalize' },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: 40 },
});
