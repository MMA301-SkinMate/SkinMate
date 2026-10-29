import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function MyCollectionScreen({ navigation }) {
  const { request } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await request('/collection'));
    } catch (error) {
      Alert.alert('Không tải được tủ đồ', error.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useFocusEffect(useCallback(() => { loadProducts(); }, [loadProducts]));

  const deleteProduct = (product) => {
    Alert.alert('Xóa sản phẩm', `Xóa ${product.productName} khỏi tủ đồ?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await request(`/collection/${product._id}`, { method: 'DELETE' });
            setProducts((current) => current.filter((item) => item._id !== product._id));
          } catch (error) {
            Alert.alert('Không thể xóa sản phẩm', error.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tủ đồ skincare</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ProductForm')}>
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadProducts}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Đang tải...' : 'Tủ đồ chưa có sản phẩm. Thêm sản phẩm để tạo routine.'}</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity style={styles.productInfo} onPress={() => navigation.navigate('ProductForm', { product: item })}>
              <Text style={styles.productName}>{item.productName}</Text>
              <Text style={styles.detail}>{item.productType} · {item.status}</Text>
              {item.expirationDate && <Text style={styles.detail}>HSD: {new Date(item.expirationDate).toLocaleDateString()}</Text>}
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel="Xóa sản phẩm" onPress={() => deleteProduct(item)} style={styles.deleteButton}>
              <Trash2 size={18} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  addButton: { width: 40, height: 40, backgroundColor: Colors.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 10 },
  productInfo: { flex: 1 },
  productName: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  detail: { color: Colors.textSecondary, fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
  deleteButton: { padding: 8 },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 42, lineHeight: 20 },
});
