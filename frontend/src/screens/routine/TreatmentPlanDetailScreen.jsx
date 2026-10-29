import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import routineApi from '../../api/routineApi';
import collectionApi from '../../api/collectionApi';

/**
 * 17. View chuỗi routine detail
 * - Giao diện hiển thị lộ trình nhiều ngày (ví dụ 14 ngày)
 * - Nút: Add / Edit sản phẩm và Thêm ngày mới
 *
 * 18. Add/Edit sản phẩm vào chuỗi routine
 * - Add thì sẽ add các sản phẩm có trong tủ đồ (My Collection)
 * - Có thể add vào ngày có sẵn hoặc thêm hẳn 1 ngày mới
 * - Check xung đột (Conflict Engine) => Popup cảnh báo trước khi cho lưu
 */
export const TreatmentPlanDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const planId = route.params?.planId;
  const initialPlanData = route.params?.planData;

  const [plan, setPlan] = useState(initialPlanData || null);
  const [loading, setLoading] = useState(!initialPlanData);
  const [selectedDay, setSelectedDay] = useState(1);

  // State cho Modal Add/Edit
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [closetProducts, setClosetProducts] = useState([]);
  const [loadingCloset, setLoadingCloset] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [targetSession, setTargetSession] = useState('evening');
  const [isNewDayOption, setIsNewDayOption] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // State cho Popup Cảnh báo xung đột (ID 18)
  const [conflictPopupVisible, setConflictPopupVisible] = useState(false);
  const [conflictsList, setConflictsList] = useState([]);
  const [pendingPayload, setPendingPayload] = useState(null);

  useEffect(() => {
    loadPlanDetail();
  }, [planId]);

  const loadPlanDetail = async () => {
    try {
      setLoading(true);
      const res = await routineApi.getTreatmentPlanDetail(planId);
      if (res && res.data) {
        setPlan(res.data);
        if (res.data.currentDay) {
          setSelectedDay(res.data.currentDay);
        }
      }
    } catch (err) {
      console.warn('Lỗi tải chi tiết chuỗi routine:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddEditModal = async (isNewDay = false) => {
    setIsNewDayOption(isNewDay);
    setSelectedProduct(null);
    setIsModalVisible(true);

    try {
      setLoadingCloset(true);
      const res = await collectionApi.getCloset('active');
      if (res && res.data) {
        setClosetProducts(res.data);
      }
    } catch (err) {
      console.warn('Lỗi tải tủ đồ:', err.message);
      // Fallback danh sách mẫu nếu chưa thêm sản phẩm
      setClosetProducts(getMockClosetProducts());
    } finally {
      setLoadingCloset(false);
    }
  };

  // 18. Handle Lưu sản phẩm vào chuỗi & kiểm tra xung đột
  const handleSaveProductToPlan = async (force = false) => {
    if (!selectedProduct) {
      Alert.alert('Chưa chọn sản phẩm', 'Vui lòng chọn 1 sản phẩm từ tủ đồ của bạn.');
      return;
    }

    const payload = pendingPayload || {
      day: selectedDay,
      session: targetSession,
      isNewDay: isNewDayOption,
      productData: {
        productId: selectedProduct._id || null,
        name: selectedProduct.productName,
        brand: selectedProduct.brand || 'Dịu nhẹ',
        category: selectedProduct.category || 'treatment',
        ingredients: selectedProduct.ingredients || [],
        stepName: selectedProduct.category === 'treatment' ? 'Đặc trị chuyên sâu' : 'Dưỡng phục hồi',
      },
    };

    try {
      setSavingProduct(true);
      const currentPlanId = plan?._id || 'default_plan';
      const res = await routineApi.addOrEditProductInPlan(currentPlanId, payload, force);

      // Nếu phát hiện xung đột y khoa và chưa force
      if (res && res.requiresConfirmation && res.conflicts?.length > 0) {
        setConflictsList(res.conflicts);
        setPendingPayload(payload);
        setConflictPopupVisible(true);
        return;
      }

      // Lưu thành công
      setConflictPopupVisible(false);
      setIsModalVisible(false);
      setPendingPayload(null);
      Alert.alert('Thành công', res.message || 'Đã thêm sản phẩm vào chuỗi routine thành công!');
      loadPlanDetail();
    } catch (err) {
      console.warn('Lỗi thêm sản phẩm vào chuỗi:', err.message);
      Alert.alert('Lỗi', err.message || 'Không thể lưu sản phẩm vào chuỗi.');
    } finally {
      setSavingProduct(false);
    }
  };

  const schedule = plan?.schedule || [];
  const currentDaySchedule = schedule.find((s) => s.day === selectedDay) || schedule[0] || { morningSteps: [], eveningSteps: [] };

  return (
    <View style={styles.container}>
      {/* ── Top Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <View style={styles.headerTitleCenter}>
          <Text style={styles.headerTitle}>Chuỗi Routine Đang Dùng</Text>
          <Text style={styles.headerSubtitle}>
            {plan?.title || 'Phác đồ điều trị chuyên sâu'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Plan Summary Card ── */}
        <View style={styles.planCard}>
          <View style={styles.planBadgeRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>ĐANG HOẠT ĐỘNG</Text>
            </View>
            <View style={styles.daysBadge}>
              <Text style={styles.daysBadgeText}>
                {plan?.totalDays || 14} Ngày • Đang ở Ngày {plan?.currentDay || 1}
              </Text>
            </View>
          </View>

          <Text style={styles.planTitle}>{plan?.title || 'Chuỗi Routine 14 Ngày'}</Text>
          <Text style={styles.planDesc}>
            {plan?.description || 'Phác đồ xen kẽ hoạt chất đặc trị và phục hồi giúp tái sinh nền da khỏe mạnh.'}
          </Text>

          {/* Override notice if history exists */}
          {plan?.isOverridden && (
            <View style={styles.overrideNoticeBox}>
              <Ionicons name="alert-circle" size={18} color="#059669" />
              <Text style={styles.overrideNoticeText}>
                Lịch trình đã được lùi lại 1 ngày và tăng thêm 1 ngày dưỡng phục hồi do check-in da khô rát/kích ứng.
              </Text>
            </View>
          )}
        </View>

        {/* ── Days Horizontal Timeline Bar ── */}
        <View style={styles.timelineSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Lịch Trình Từng Ngày</Text>
            {/* Button Thêm Ngày Mới */}
            <TouchableOpacity
              style={styles.addDayBtn}
              onPress={() => openAddEditModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color={COLORS.primary} />
              <Text style={styles.addDayBtnText}>Thêm ngày mới</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timelineScroll}
          >
            {schedule.map((item) => {
              const isSelected = item.day === selectedDay;
              const isToday = item.day === (plan?.currentDay || 1);
              return (
                <TouchableOpacity
                  key={item.day}
                  style={[
                    styles.dayChip,
                    isSelected && styles.dayChipSelected,
                    isToday && styles.dayChipToday,
                  ]}
                  onPress={() => setSelectedDay(item.day)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayChipLabel, isSelected && styles.dayChipTextSelected]}>
                    Ngày
                  </Text>
                  <Text style={[styles.dayChipNum, isSelected && styles.dayChipTextSelected]}>
                    {item.day}
                  </Text>
                  {isToday && <View style={styles.todayDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Products List for Selected Day ── */}
        <View style={styles.dayProductsCard}>
          <View style={styles.dayHeaderRow}>
            <Text style={styles.dayHeaderTitle}>
              Chi tiết Ngày thứ {selectedDay} / {plan?.totalDays || 14}
            </Text>

            {/* 17. Button: Add / Edit */}
            <TouchableOpacity
              style={styles.editProductBtn}
              onPress={() => openAddEditModal(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={15} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.editProductBtnText}>Add / Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Morning Section */}
          <Text style={styles.subSessionTitle}>☀️ Buổi Sáng ({currentDaySchedule.morningSteps?.length || 0} bước)</Text>
          {currentDaySchedule.morningSteps?.map((step, idx) => (
            <View key={idx} style={styles.stepMiniRow}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumMiniText}>{step.stepNumber}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepMiniName}>{step.product?.productName || step.customProduct?.name || step.stepName}</Text>
                <Text style={styles.stepMiniCategory}>{step.stepName}</Text>
              </View>
            </View>
          ))}

          {/* Evening Section */}
          <Text style={[styles.subSessionTitle, { marginTop: 14 }]}>🌙 Buổi Tối ({currentDaySchedule.eveningSteps?.length || 0} bước)</Text>
          {currentDaySchedule.eveningSteps?.map((step, idx) => (
            <View key={idx} style={styles.stepMiniRow}>
              <View style={[styles.stepNumCircle, { backgroundColor: '#ede9fe' }]}>
                <Text style={[styles.stepNumMiniText, { color: '#6d28d9' }]}>{step.stepNumber}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepMiniName}>{step.product?.productName || step.customProduct?.name || step.stepName}</Text>
                <Text style={styles.stepMiniCategory}>{step.stepName}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── 18. MODAL ADD / EDIT SẢN PHẨM TỪ TỦ ĐỒ (MY COLLECTION) ── */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>
                  {isNewDayOption ? 'Thêm Ngày Mới Vào Chuỗi' : `Add/Edit Ngày ${selectedDay}`}
                </Text>
                <Text style={styles.modalSubtitle}>Chọn sản phẩm từ Tủ đồ (My Collection)</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Session Chooser */}
            <View style={styles.modalSessionRow}>
              <TouchableOpacity
                style={[styles.modalSessionBtn, targetSession === 'morning' && styles.modalSessionBtnActive]}
                onPress={() => setTargetSession('morning')}
              >
                <Text style={[styles.modalSessionText, targetSession === 'morning' && { color: '#ffffff' }]}>
                  Buổi Sáng
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSessionBtn, targetSession === 'evening' && styles.modalSessionBtnActive]}
                onPress={() => setTargetSession('evening')}
              >
                <Text style={[styles.modalSessionText, targetSession === 'evening' && { color: '#ffffff' }]}>
                  Buổi Tối
                </Text>
              </TouchableOpacity>
            </View>

            {/* Closet Products List */}
            {loadingCloset ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 30 }} />
            ) : (
              <FlatList
                data={closetProducts}
                keyExtractor={(item) => item._id || String(Math.random())}
                style={{ maxHeight: 280, marginVertical: 8 }}
                renderItem={({ item }) => {
                  const isSelected = selectedProduct?._id === item._id;
                  return (
                    <TouchableOpacity
                      style={[styles.closetItemRow, isSelected && styles.closetItemRowSelected]}
                      onPress={() => setSelectedProduct(item)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.closetIcon}>
                        <Ionicons name="flask-outline" size={20} color={COLORS.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.closetNameText}>{item.productName}</Text>
                        <Text style={styles.closetBrandText}>{item.brand} • {item.category}</Text>
                        <Text style={styles.closetIngsText} numberOfLines={1}>
                          Hoạt chất: {(item.ingredients || []).join(', ') || 'Nhiều dưỡng chất'}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={() => handleSaveProductToPlan(false)}
              disabled={savingProduct}
              activeOpacity={0.85}
            >
              {savingProduct ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.modalSaveBtnText}>Kiểm tra & Lưu vào chuỗi</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── 18. POPUP CẢNH BÁO XUNG ĐỘT DƯỢC CHẤT (CONFLICT WARNING DIALOG) ── */}
      <Modal visible={conflictPopupVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.alertContent}>
            <View style={styles.alertIconCircle}>
              <Ionicons name="warning" size={32} color="#dc2626" />
            </View>
            <Text style={styles.alertTitle}>CẢNH BÁO XUNG ĐỘT Y KHOA</Text>
            <Text style={styles.alertDesc}>
              Hệ thống phát hiện hoạt chất trong sản phẩm vừa chọn có nguy cơ gây hại khi dùng chung:
            </Text>

            <ScrollView style={{ maxHeight: 180, marginVertical: 10 }}>
              {conflictsList.map((c, i) => (
                <View key={i} style={styles.conflictItem}>
                  <Ionicons name="alert-circle-outline" size={16} color="#b91c1c" style={{ marginTop: 2 }} />
                  <Text style={styles.conflictMessage}>{c.message}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.alertActionsRow}>
              <TouchableOpacity
                style={styles.alertCancelBtn}
                onPress={() => setConflictPopupVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.alertCancelText}>Hủy bỏ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.alertForceBtn}
                onPress={() => handleSaveProductToPlan(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.alertForceText}>Vẫn muốn thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

function getMockClosetProducts() {
  return [
    {
      _id: 'mock_1',
      productName: "Paula's Choice 2% BHA Liquid Exfoliant",
      brand: "Paula's Choice",
      category: 'treatment',
      ingredients: ['Salicylic Acid', 'BHA', 'Camellia Oleifera'],
    },
    {
      _id: 'mock_2',
      productName: 'The Ordinary Retinol 0.5% in Squalane',
      brand: 'The Ordinary',
      category: 'treatment',
      ingredients: ['Retinol', 'Squalane'],
    },
    {
      _id: 'mock_3',
      productName: 'Serum La Roche-Posay Hyalu B5',
      brand: 'La Roche-Posay',
      category: 'serum',
      ingredients: ['Panthenol', 'B5', 'Hyaluronic Acid', 'Madecassoside'],
    },
    {
      _id: 'mock_4',
      productName: 'Kem dưỡng rau má Skin1004 Madagascar Centella',
      brand: 'Skin1004',
      category: 'moisturizer',
      ingredients: ['Centella Asiatica', 'Ceramide', 'B5'],
    },
  ];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  planBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  daysBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  daysBadgeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  planDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  overrideNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  overrideNoticeText: {
    fontSize: 11,
    color: '#065f46',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },

  /* Timeline */
  timelineSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  addDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  addDayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 2,
  },
  timelineScroll: {
    paddingVertical: 4,
  },
  dayChip: {
    width: 60,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dayChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayChipToday: {
    borderColor: '#f59e0b',
  },
  dayChipLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  dayChipNum: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
    marginTop: 2,
  },
  dayChipTextSelected: {
    color: '#ffffff',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#f59e0b',
    marginTop: 3,
  },

  /* Day Products */
  dayProductsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  dayHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  editProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editProductBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  subSessionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  stepMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
  },
  stepMiniName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  stepMiniCategory: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 18,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalSessionRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },
  modalSessionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSessionBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modalSessionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  closetItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  closetItemRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0fdfa',
  },
  closetIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6fffa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  closetNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  closetBrandText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  closetIngsText: {
    fontSize: 10,
    color: '#0d9488',
    marginTop: 2,
  },
  modalSaveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalSaveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  /* Alert Dialog */
  alertContent: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
  },
  alertIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#dc2626',
    marginBottom: 6,
    textAlign: 'center',
  },
  alertDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  conflictItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  conflictMessage: {
    fontSize: 11,
    color: '#991b1b',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  alertActionsRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  alertCancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  alertCancelText: {
    color: COLORS.textMain,
    fontSize: 13,
    fontWeight: '700',
  },
  alertForceBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  alertForceText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default TreatmentPlanDetailScreen;
