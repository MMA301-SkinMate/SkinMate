import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Users } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function CommunityFeedScreen() {
  const { request } = useApp();
  const [posts, setPosts] = useState([]);
  const [expandedPost, setExpandedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await request('/community/posts'));
    } catch (error) {
      Alert.alert('Không tải được Cộng đồng', error.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useFocusEffect(useCallback(() => { loadPosts(); }, [loadPosts]));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Users size={21} color={Colors.primary} />
        <Text style={styles.headerTitle}>Cộng đồng SkinMate</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadPosts}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Đang tải...' : 'Chưa có bài chia sẻ routine nào.'}</Text>}
        renderItem={({ item }) => {
          const expanded = expandedPost === item._id;
          return (
            <View style={styles.card}>
              <Text style={styles.author}>{item.userId?.fullName || 'Thành viên SkinMate'}</Text>
              <Text style={styles.title}>{item.title}</Text>
              {!!item.note && <Text style={styles.note}>{item.note}</Text>}
              <TouchableOpacity onPress={() => setExpandedPost(expanded ? null : item._id)} style={styles.expandButton}>
                <Text style={styles.expandText}>{expanded ? 'Thu gọn routine' : 'Xem routine đã chia sẻ'}</Text>
              </TouchableOpacity>
              {expanded && item.planPayload?.map((day) => (
                <View key={day.dayIndex} style={styles.day}>
                  <Text style={styles.dayTitle}>Ngày {day.dayIndex}</Text>
                  {['morning', 'evening'].map((session) => (
                    <View key={session} style={styles.session}>
                      <Text style={styles.sessionTitle}>{session === 'morning' ? 'Sáng' : 'Tối'}</Text>
                      {day[session]?.map((step, index) => (
                        <Text key={`${step.stepNumber}-${index}`} style={styles.step}>
                          {step.stepNumber}. {step.productName}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 16 },
  headerTitle: { color: Colors.text, fontSize: 19, fontWeight: '800' },
  list: { padding: 16, paddingTop: 4, flexGrow: 1 },
  card: { backgroundColor: '#fff', borderRadius: 13, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 12 },
  author: { color: Colors.primaryDark, fontWeight: '700', fontSize: 12 },
  title: { color: Colors.text, fontSize: 16, fontWeight: '800', marginTop: 5 },
  note: { color: Colors.textSecondary, marginTop: 7, lineHeight: 19 },
  expandButton: { alignSelf: 'flex-start', marginTop: 10 },
  expandText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  day: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 10, paddingTop: 9 },
  dayTitle: { color: Colors.text, fontWeight: '800' },
  session: { marginTop: 6 },
  sessionTitle: { color: Colors.primaryDark, fontWeight: '700', fontSize: 12 },
  step: { color: Colors.textSecondary, fontSize: 12, marginTop: 3 },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: 42 },
});
