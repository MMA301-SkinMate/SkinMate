import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { Header } from '../common/Header';
import { Icon } from '../common/Icon';
import { ConflictModal } from '../common/ConflictModal';
import { useSkinApp } from '../../context/SkinAppContext';

export const AddEditRoutineProductScreen = () => {
  const {
    myCollection,
    treatmentPlan,
    checkProductConflict,
    saveProductToRoutineChain,
    setCurrentScreen,
  } = useSkinApp();

  // Form State
  const [targetDay, setTargetDay] = useState(treatmentPlan.currentDay); // Mặc định ngày hôm nay (Ngày 3)
  const [session, setSession] = useState('evening'); // 'morning' | 'evening'
  const [selectedProductId, setSelectedProductId] = useState('p-8'); // Mặc định chọn Obagi Retinol để test xung đột!
  const [isNewDay, setIsNewDay] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState('Ngày thứ 15 - Tăng cường đặc trị chuyên sâu');

  // Conflict Modal State
  const [detectedConflict, setDetectedConflict] = useState(null);
  const [isConflictModalVisible, setIsConflictModalVisible] = useState(false);

  // Filter valid products from closet
  const availableProducts = myCollection.filter((p) => !p.isExpired);
  const selectedProduct = availableProducts.find((p) => p.id === selectedProductId);

  // Xử lý khi nhấn nút Lưu vào chuỗi routine
  const handleSaveAttempt = () => {
    if (!selectedProduct) {
      alert('Vui lòng chọn một sản phẩm từ Tủ đồ.');
      return;
    }

    // 18. Hệ thống check xung đột (UC: Phân tích độ phù hợp với da) => Popup cảnh báo trước khi cho lưu
    const conflict = checkProductConflict(selectedProduct, targetDay, session);

    if (conflict) {
      setDetectedConflict(conflict);
      setIsConflictModalVisible(true);
    } else {
      executeSave();
    }
  };

  const executeSave = () => {
    saveProductToRoutineChain({
      dayNumber: targetDay,
      session,
      productId: selectedProductId,
      isNewDay,
      newDayTitle,
    });

    setIsConflictModalVisible(false);
    alert('Thành công! Đã lưu sản phẩm vào Chuỗi Routine.');
    setCurrentScreen('RoutineChainDetail');
  };

  return (
    <View style={styles.container}>
      <Header
        title="Thêm/Sửa Sản Phẩm"
        subtitle="Tùy chỉnh các bước trong Chuỗi Routine & Kiểm tra xung đột"
        showBack={true}
        onBack={() => setCurrentScreen('RoutineChainDetail')}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Chọn ngày hoặc Thêm hẳn ngày mới */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.numberBadge}><Text style={styles.numberBadgeText}>1</Text></View>
            <Text style={styles.sectionTitle}>CHỌN NGÀY ÁP DỤNG</Text>
          </View>

          {/* Toggle Thêm hẳn 1 ngày mới như yêu cầu trong Sheet */}
          <View style={styles.newDayToggleCard}>
            <View style={styles.newDayTextCol}>
              <Text style={styles.newDayTitle}>Thêm hẳn 1 ngày mới vào chuỗi</Text>
              <Text style={styles.newDayDesc}>
                Mở rộng chuỗi điều trị từ {treatmentPlan.totalDays} ngày lên {treatmentPlan.totalDays + 1} ngày
              </Text>
            </View>
            <Switch
              value={isNewDay}
              onValueChange={setIsNewDay}
              trackColor={{ false: '#cbd5e1', true: '#fca5a5' }}
              thumbColor={isNewDay ? '#e11d48' : '#f8fafc'}
            />
          </View>

          {isNewDay ? (
            <View style={styles.newDayInputWrap}>
              <Text style={styles.inputLabel}>Tiêu đề ngày mới:</Text>
              <TextInput
                style={styles.textInput}
                value={newDayTitle}
                onChangeText={setNewDayTitle}
                placeholder="Nhập mục tiêu của ngày mới..."
              />
            </View>
          ) : (
            <View style={styles.daySelectorRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
                {treatmentPlan.days.map((d) => (
                  <TouchableOpacity
                    key={d.dayNumber}
                    style={[
                      styles.dayButton,
                      targetDay === d.dayNumber && styles.dayButtonActive,
                    ]}
                    onPress={() => setTargetDay(d.dayNumber)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dayButtonText, targetDay === d.dayNumber && styles.dayButtonTextActive]}>
                      Ngày {d.dayNumber}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Step 2: Chọn buổi (Sáng / Tối) */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.numberBadge}><Text style={styles.numberBadgeText}>2</Text></View>
            <Text style={styles.sectionTitle}>CHỌN BUỔI SKINCARE</Text>
          </View>

          <View style={styles.sessionChoiceRow}>
            <TouchableOpacity
              style={[
                styles.sessionCard,
                session === 'morning' && styles.sessionCardActiveDay,
              ]}
              onPress={() => setSession('morning')}
              activeOpacity={0.8}
            >
              <Icon name="sun" size={20} color={session === 'morning' ? '#d97706' : '#64748b'} />
              <Text style={[styles.sessionCardLabel, session === 'morning' && styles.sessionCardLabelActiveDay]}>
                Buổi Sáng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sessionCard,
                session === 'evening' && styles.sessionCardActiveNight,
              ]}
              onPress={() => setSession('evening')}
              activeOpacity={0.8}
            >
              <Icon name="moon" size={20} color={session === 'evening' ? '#6366f1' : '#64748b'} />
              <Text style={[styles.sessionCardLabel, session === 'evening' && styles.sessionCardLabelActiveNight]}>
                Buổi Tối
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Step 3: Chọn sản phẩm từ Tủ đồ (My Collection) */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.numberBadge}><Text style={styles.numberBadgeText}>3</Text></View>
            <Text style={styles.sectionTitle}>CHỌN SẢN PHẨM TỪ TỦ ĐỒ (MY COLLECTION)</Text>
          </View>

          <View style={styles.productsList}>
            {availableProducts.map((prod) => {
              const isSelected = selectedProductId === prod.id;
              const hasActives = prod.activeIngredients.length > 0;

              return (
                <TouchableOpacity
                  key={prod.id}
                  style={[
                    styles.productItemCard,
                    isSelected && styles.productItemCardSelected,
                  ]}
                  onPress={() => setSelectedProductId(prod.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.productItemTop}>
                    <View style={styles.productItemLeft}>
                      <Text style={styles.prodBrand}>{prod.brand}</Text>
                      <Text style={styles.prodName}>{prod.name}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>

                  {/* Active Ingredients Tags */}
                  <View style={styles.prodActivesRow}>
                    <Text style={styles.prodCategoryBadge}>{prod.category}</Text>
                    {hasActives && (
                      <View style={styles.activeTagBadge}>
                        <Icon name="zap" size={10} color="#e11d48" />
                        <Text style={styles.activeTagText}>
                          {prod.activeIngredients.join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Test Hint for Conflict */}
        <View style={styles.testHintBox}>
          <Icon name="info" size={16} color="#d97706" />
          <Text style={styles.testHintText}>
            💡 <Text style={styles.bold}>Gợi ý kiểm thử:</Text> Hãy chọn sản phẩm chứa Retinol (Obagi Retinol) hoặc BHA để lưu vào Ngày 3 buổi Tối để kiểm chứng hệ thống phát hiện xung đột và hiển thị Popup cảnh báo trước khi cho lưu!
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveAttempt}
          activeOpacity={0.85}
        >
          <Icon name="check" size={18} color="#ffffff" strokeWidth={2.5} />
          <Text style={styles.saveButtonText}>Kiểm Tra & Lưu Vào Chuỗi Routine</Text>
        </TouchableOpacity>
      </View>

      {/* 18. Popup Cảnh Báo Xung Đột Trước Khi Lưu */}
      <ConflictModal
        visible={isConflictModalVisible}
        conflict={detectedConflict}
        onConfirmProceed={executeSave}
        onCancel={() => setIsConflictModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  numberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e11d48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },

  // New Day Toggle
  newDayToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff1f2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecdd3',
    marginBottom: 10,
  },
  newDayTextCol: {
    flex: 1,
    marginRight: 10,
  },
  newDayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#881337',
  },
  newDayDesc: {
    fontSize: 10,
    color: '#9f1239',
    marginTop: 2,
  },
  newDayInputWrap: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 10,
    fontSize: 13,
    color: '#0f172a',
  },

  // Days selector
  daysScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  dayButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dayButtonActive: {
    backgroundColor: '#0f766e',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  dayButtonTextActive: {
    color: '#ffffff',
  },

  // Session selector
  sessionChoiceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sessionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  sessionCardActiveDay: {
    backgroundColor: '#fffbeb',
    borderColor: '#f59e0b',
  },
  sessionCardActiveNight: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  sessionCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  sessionCardLabelActiveDay: {
    color: '#b45309',
  },
  sessionCardLabelActiveNight: {
    color: '#4338ca',
  },

  // Products
  productsList: {
    gap: 10,
  },
  productItemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  productItemCardSelected: {
    borderColor: '#e11d48',
    backgroundColor: '#fff1f2',
  },
  productItemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  productItemLeft: {
    flex: 1,
    marginRight: 10,
  },
  prodBrand: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  prodName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#e11d48',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e11d48',
  },
  prodActivesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  prodCategoryBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  activeTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#e11d48',
  },

  testHintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
    gap: 8,
    marginBottom: 10,
  },
  testHintText: {
    flex: 1,
    fontSize: 11,
    color: '#78350f',
    lineHeight: 16,
  },
  bold: {
    fontWeight: '700',
  },

  // Footer
  footerContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e11d48',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
