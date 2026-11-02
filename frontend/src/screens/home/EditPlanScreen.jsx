import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useRoutine } from '../../context/RoutineContext';
import { useCollection } from '../../context/CollectionContext';
import { getProductIcon } from '../../constants/product-icons';
import ConflictWarningModal from '../../components/routine/ConflictWarningModal';

const STEPS = [
  { stepNumber: 1, label: 'Bước 1: Làm sạch', key: 'cleanse' },
  { stepNumber: 2, label: 'Bước 2: Cân bằng', key: 'tone' },
  { stepNumber: 3, label: 'Bước 3: Đặc trị', key: 'treat' },
  { stepNumber: 4, label: 'Bước 4: Dưỡng / Phục hồi', key: 'moisturize' },
  { stepNumber: 5, label: 'Bước 5: Bảo vệ (KCN)', key: 'protect' },
];

export default function EditPlanScreen({ route, navigation }) {
  const { planId, selectedDayNumber: initialDay } = route.params || {};
  const { activePlan, updateProductInPlan, addDayToPlan, checkConflict } = useRoutine();
  const { collection } = useCollection();

  const plan = activePlan || {};
  const days = plan.days || [];

  // Active form state
  const [activeTab, setActiveTab] = useState('editStep'); // 'editStep' | 'addDay'
  const [selectedDayNumber, setSelectedDayNumber] = useState(initialDay || 1);
  const [selectedStepNumber, setSelectedStepNumber] = useState(3);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // New Day form state
  const [newDayTitle, setNewDayTitle] = useState('');
  const [newDayFocus, setNewDayFocus] = useState('');

  // Conflict modal state
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [conflictsData, setConflictsData] = useState([]);
  const [suitabilityWarnings, setSuitabilityWarnings] = useState([]);
  const [pendingSavePayload, setPendingSavePayload] = useState(null);

  // Filter usable products from collection (exclude expired)
  const usableCollection = collection.filter(p => {
    if (p.status === 'expired' || p.status === 'finished') return false;
    if (p.expirationDate && new Date(p.expirationDate) < new Date()) return false;
    return true;
  });

  const handleSaveStep = async () => {
    if (!selectedProduct) {
      Alert.alert('Chưa chọn sản phẩm', 'Vui lòng chọn 1 sản phẩm từ tủ đồ của bạn.');
      return;
    }

    try {
      setIsCheckingConflict(true);

      // UC: Phân tích độ phù hợp với da & check xung đột
      const conflictRes = await checkConflict({
        dayNumber: selectedDayNumber,
        newProduct: {
          ingredients: selectedProduct.ingredients || [],
        },
        planId: plan._id,
      });

      const hasConflict = conflictRes.data ? conflictRes.data.hasConflict : conflictRes.hasConflict;
      const conflicts = conflictRes.data ? conflictRes.data.conflicts : conflictRes.conflicts;
      const suitWarnings = conflictRes.data ? conflictRes.data.suitabilityWarnings : conflictRes.suitabilityWarnings;

      if (hasConflict && ((conflicts && conflicts.length > 0) || (suitWarnings && suitWarnings.length > 0))) {
        // Show Conflict Warning Popup before allowing to save!
        setConflictsData(conflicts || []);
        setSuitabilityWarnings(suitWarnings || []);
        setPendingSavePayload({
          planId: plan._id,
          payload: {
            dayNumber: selectedDayNumber,
            stepNumber: selectedStepNumber,
            productId: selectedProduct.id || selectedProduct._id,
          },
        });
        setConflictModalVisible(true);
      } else {
        // Save immediately
        await executeSave({
          planId: plan._id,
          payload: {
            dayNumber: selectedDayNumber,
            stepNumber: selectedStepNumber,
            productId: selectedProduct.id || selectedProduct._id,
          },
        });
      }
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể kiểm tra xung đột.');
    } finally {
      setIsCheckingConflict(false);
    }
  };

  const executeSave = async dataToSave => {
    try {
      await updateProductInPlan(dataToSave.planId, dataToSave.payload);
      setConflictModalVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật sản phẩm vào chuỗi routine!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Lỗi lưu sản phẩm', err.message || 'Không thể lưu.');
    }
  };

  const handleAddNewDay = async () => {
    if (!newDayTitle.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên cho ngày mới.');
      return;
    }

    try {
      setIsCheckingConflict(true);
      const nextDayNum = days.length > 0 ? Math.max(...days.map(d => d.dayNumber)) + 1 : 1;
      await addDayToPlan(plan._id, {
        title: newDayTitle.trim(),
        focus: newDayFocus.trim() || 'Chăm sóc toàn diện',
        steps: [
          {
            stepNumber: 1,
            stepKey: 'cleanse',
            stepName: 'BƯỚC 1 - LÀM SẠCH',
            productName: 'Sữa rửa mặt dịu nhẹ',
            productIcon: 'tuyp',
            ingredients: ['B5'],
          },
          {
            stepNumber: 2,
            stepKey: 'tone',
            stepName: 'BƯỚC 2 - CÂN BẰNG',
            productName: 'Toner cân bằng',
            productIcon: 'chai_to',
            ingredients: ['Centella'],
          },
          {
            stepNumber: 3,
            stepKey: 'treat',
            stepName: 'BƯỚC 3 - ĐẶC TRỊ',
            productName: selectedProduct ? selectedProduct.productName : 'Serum phục hồi',
            productIcon: selectedProduct ? selectedProduct.productIcon : 'serum',
            productId: selectedProduct ? (selectedProduct.id || selectedProduct._id) : null,
            ingredients: selectedProduct ? selectedProduct.ingredients : ['B5'],
          },
          {
            stepNumber: 4,
            stepKey: 'moisturize',
            stepName: 'BƯỚC 4 - DƯỠNG / PHỤC HỒI',
            productName: 'Kem dưỡng ẩm',
            productIcon: 'hu',
            ingredients: ['Ceramide'],
          },
          {
            stepNumber: 5,
            stepKey: 'protect',
            stepName: 'BƯỚC 5 - BẢO VỆ',
            productName: 'Kem chống nắng',
            productIcon: 'tuyp_xanh',
            ingredients: ['Zinc Oxide'],
          },
        ],
      });
      Alert.alert('Thành công', `Đã thêm Ngày ${nextDayNum} vào chuỗi routine!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể thêm ngày mới.');
    } finally {
      setIsCheckingConflict(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add / Edit Chuỗi Routine</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'editStep' && styles.tabActive]}
          onPress={() => setActiveTab('editStep')}
        >
          <Text style={[styles.tabText, activeTab === 'editStep' && styles.tabTextActive]}>
            Thêm sản phẩm vào ngày
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'addDay' && styles.tabActive]}
          onPress={() => setActiveTab('addDay')}
        >
          <Text style={[styles.tabText, activeTab === 'addDay' && styles.tabTextActive]}>
            + Thêm hẳn 1 ngày mới
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'editStep' ? (
          <>
            {/* 1. Select Day */}
            <Text style={styles.sectionLabel}>1. Chọn ngày áp dụng</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayChips}>
              {days.map(d => (
                <TouchableOpacity
                  key={d.dayNumber}
                  style={[styles.dayChip, selectedDayNumber === d.dayNumber && styles.dayChipSelected]}
                  onPress={() => setSelectedDayNumber(d.dayNumber)}
                >
                  <Text style={[styles.dayChipText, selectedDayNumber === d.dayNumber && styles.dayChipTextSelected]}>
                    Ngày {d.dayNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 2. Select Step */}
            <Text style={styles.sectionLabel}>2. Chọn bước trong chu trình</Text>
            <View style={styles.stepsGrid}>
              {STEPS.map(s => (
                <TouchableOpacity
                  key={s.stepNumber}
                  style={[styles.stepSelectCard, selectedStepNumber === s.stepNumber && styles.stepSelectCardActive]}
                  onPress={() => setSelectedStepNumber(s.stepNumber)}
                >
                  <Text style={[styles.stepSelectNum, selectedStepNumber === s.stepNumber && styles.stepSelectNumActive]}>
                    B{s.stepNumber}
                  </Text>
                  <Text style={[styles.stepSelectLabel, selectedStepNumber === s.stepNumber && styles.stepSelectLabelActive]} numberOfLines={1}>
                    {s.label.split(':')[1]?.trim() || s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 3. Select Product from Closet */}
            <View style={styles.closetHeaderRow}>
              <Text style={styles.sectionLabel}>3. Chọn sản phẩm từ Tủ đồ (My Collection)</Text>
              <Text style={styles.closetCount}>({usableCollection.length} sản phẩm)</Text>
            </View>

            {usableCollection.length === 0 ? (
              <View style={styles.emptyCloset}>
                <Ionicons name="cube-outline" size={32} color="#94a3b8" />
                <Text style={styles.emptyClosetText}>
                  Tủ đồ chưa có sản phẩm hợp lệ hoặc các sản phẩm đã hết hạn.
                </Text>
                <TouchableOpacity
                  style={styles.addClosetBtn}
                  onPress={() => navigation.navigate('AddProduct')}
                >
                  <Text style={styles.addClosetBtnText}>+ Thêm vào Tủ đồ</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.productsList}>
                {usableCollection.map(prod => {
                  const isSelected = selectedProduct && (selectedProduct.id === prod.id || selectedProduct._id === prod._id);
                  const iconObj = getProductIcon(prod.productIcon, prod.productType);

                  return (
                    <TouchableOpacity
                      key={prod.id || prod._id}
                      style={[styles.productItem, isSelected && styles.productItemSelected]}
                      onPress={() => setSelectedProduct(prod)}
                      activeOpacity={0.8}
                    >
                      <Image source={iconObj.image} style={styles.productIcon} resizeMode="contain" />
                      <View style={styles.productDetails}>
                        <Text style={styles.productTitle}>{prod.productName}</Text>
                        <Text style={styles.productType}>Loại: {prod.productType}</Text>
                        {prod.ingredients && prod.ingredients.length > 0 && (
                          <Text style={styles.productIngs} numberOfLines={1}>
                            Thành phần: {prod.ingredients.join(', ')}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSaveStep}
              disabled={isCheckingConflict}
              activeOpacity={0.85}
            >
              {isCheckingConflict ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Kiểm tra xung đột & Lưu vào Ngày {selectedDayNumber}</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.addDayForm}>
            <Text style={styles.sectionLabel}>Tên ngày mới (ví dụ: Ngày 15: Phục hồi B5)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên ngày..."
              placeholderTextColor="#94a3b8"
              value={newDayTitle}
              onChangeText={setNewDayTitle}
            />

            <Text style={styles.sectionLabel}>Trọng tâm điều trị (Focus)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Phục hồi chuyên sâu, Kiềm dầu..."
              placeholderTextColor="#94a3b8"
              value={newDayFocus}
              onChangeText={setNewDayFocus}
            />

            <Text style={styles.sectionLabel}>Gán sản phẩm đặc trị từ tủ đồ (Tùy chọn)</Text>
            <View style={styles.productsList}>
              {usableCollection.slice(0, 5).map(prod => {
                const isSelected = selectedProduct && (selectedProduct.id === prod.id || selectedProduct._id === prod._id);
                const iconObj = getProductIcon(prod.productIcon, prod.productType);
                return (
                  <TouchableOpacity
                    key={prod.id || prod._id}
                    style={[styles.productItem, isSelected && styles.productItemSelected]}
                    onPress={() => setSelectedProduct(prod)}
                  >
                    <Image source={iconObj.image} style={styles.productIcon} resizeMode="contain" />
                    <View style={styles.productDetails}>
                      <Text style={styles.productTitle}>{prod.productName}</Text>
                      <Text style={styles.productType}>{prod.productType}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleAddNewDay}
              disabled={isCheckingConflict}
              activeOpacity={0.85}
            >
              {isCheckingConflict ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Thêm ngày mới vào chuỗi</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Conflict Warning Popup (Requirement 8) */}
      <ConflictWarningModal
        visible={conflictModalVisible}
        conflicts={conflictsData}
        suitabilityWarnings={suitabilityWarnings}
        onCancel={() => setConflictModalVisible(false)}
        onConfirm={() => {
          if (pendingSavePayload) {
            executeSave(pendingSavePayload);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 8,
  },
  dayChips: {
    gap: 8,
    paddingBottom: 4,
  },
  dayChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  dayChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  dayChipTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepSelectCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepSelectCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0fdfa',
  },
  stepSelectNum: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stepSelectNumActive: {
    backgroundColor: COLORS.primary,
    color: '#ffffff',
  },
  stepSelectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  stepSelectLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  closetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8,
  },
  closetCount: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyCloset: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 6,
  },
  emptyClosetText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  addClosetBtn: {
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addClosetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  productsList: {
    gap: 10,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  productItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0fdfa',
  },
  productIcon: {
    width: 44,
    height: 48,
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  productType: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  productIngs: {
    fontSize: 10,
    color: '#0f766e',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 10,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 20,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  addDayForm: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});

