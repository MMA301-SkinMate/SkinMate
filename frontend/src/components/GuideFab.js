import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { skinTypeLabel } from '../constants/skinTypes';
import { useApp } from '../context/AppContext';

export default function GuideFab() {
  const { request, userProfile } = useApp();
  const [visible, setVisible] = useState(false);
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);

  const openGuide = async () => {
    setVisible(true);
    setLoading(true);
    try {
      setGuide(await request('/skin-profile/guide'));
    } catch (error) {
      setVisible(false);
      Alert.alert('Không tải được cẩm nang', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity accessibilityLabel="Mở cẩm nang da" style={styles.fab} onPress={openGuide}>
        <BookOpen size={22} color="#fff" />
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Cẩm nang da: {skinTypeLabel(guide?.skinType || userProfile?.skinType)}</Text>
            {loading ? <Text style={styles.message}>Đang tải...</Text> : (
              <ScrollView>
                <Text style={styles.heading}>Nên dùng</Text>
                {(guide?.dos || []).map((item, index) => (
                  <Text key={`${item.ingredientName}-${index}`} style={styles.item}>
                    • {item.ingredientName}{item.purpose ? ` — ${item.purpose}` : ''}
                  </Text>
                ))}
                <Text style={[styles.heading, styles.avoidHeading]}>Nên tránh</Text>
                {(guide?.donts || []).map((item, index) => (
                  <Text key={`${item.ingredientName}-${index}`} style={styles.item}>
                    • {item.ingredientName}{item.reason ? ` — ${item.reason}` : ''}
                  </Text>
                ))}
                {!guide?.dos?.length && !guide?.donts?.length && (
                  <Text style={styles.message}>Chưa có dữ liệu cẩm nang cho hồ sơ này.</Text>
                )}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.close} onPress={() => setVisible(false)}>
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', right: 18, bottom: 82, width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5, zIndex: 5 },
  overlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 24 },
  modal: { maxHeight: '80%', backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  title: { fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 18, color: Colors.text },
  heading: { color: Colors.primary, fontWeight: '800', marginBottom: 8, marginTop: 4 },
  avoidHeading: { color: Colors.danger, marginTop: 18 },
  item: { color: Colors.text, marginBottom: 8, lineHeight: 20 },
  message: { color: Colors.textSecondary, textAlign: 'center', padding: 12 },
  close: { backgroundColor: Colors.primary, padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 14 },
  closeText: { color: '#fff', fontWeight: '800' },
});
