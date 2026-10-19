import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Header } from '../common/Header';
import { Icon } from '../common/Icon';
import { useSkinApp } from '../../context/SkinAppContext';

export const CheckinScreen = () => {
  const {
    selectedConditions,
    handleToggleCondition,
    handleConfirmCheckin,
    CONDITION_DICTIONARY,
    setCurrentScreen,
  } = useSkinApp();

  const [noteText, setNoteText] = useState('Má hơi căng tức sau khi rửa mặt sáng nay.');

  const conditionKeys = ['Binh_Thuong', 'Kho_Rat', 'Kich_Ung', 'Noi_Mun', 'Bong_Dau'];

  return (
    <View style={styles.container}>
      <Header
        title="Nhật Ký Làn Da"
        subtitle="Ghi nhận tình trạng da hàng ngày để AI tối ưu chu trình"
        showBack={true}
        onBack={() => setCurrentScreen('Home')}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Title Card */}
        <View style={styles.titleCard}>
          <View style={styles.badgeRow}>
            <View style={styles.badgePill}>
              <Icon name="sparkles" size={12} color="#e11d48" />
              <Text style={styles.badgePillText}>AI REAL-TIME ADAPTATION</Text>
            </View>
            <Text style={styles.todayDate}>
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
            </Text>
          </View>

          <Text style={styles.mainHeading}>Da bạn hôm nay thế nào ?</Text>
          <Text style={styles.mainDescription}>
            Chọn các biểu hiện da đang gặp phải. Bạn có thể chọn nhiều trạng thái cùng lúc (trừ trạng thái Bình Thường).
          </Text>
        </View>

        {/* 5 Conditions Selection Cards */}
        <View style={styles.conditionsGrid}>
          {conditionKeys.map((key) => {
            const cond = CONDITION_DICTIONARY[key];
            const isSelected = selectedConditions.includes(key);

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.condCard,
                  isSelected && styles.condCardSelected,
                  isSelected && { borderColor: cond.color, backgroundColor: cond.bgColor },
                ]}
                onPress={() => handleToggleCondition(key)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTopRow}>
                  <Text style={styles.emojiText}>{cond.emoji}</Text>
                  <View
                    style={[
                      styles.checkboxCircle,
                      isSelected && { backgroundColor: cond.color, borderColor: cond.color },
                    ]}
                  >
                    {isSelected && <Icon name="check" size={12} color="#ffffff" strokeWidth={3} />}
                  </View>
                </View>

                <Text style={[styles.condLabel, isSelected && { color: cond.color }]}>
                  {cond.label}
                </Text>

                <Text style={styles.condDesc} numberOfLines={2}>
                  {cond.description}
                </Text>

                {/* Treatment / Active preview chip */}
                <View style={styles.treatmentPreviewWrap}>
                  <Text style={styles.treatmentPreviewText} numberOfLines={1}>
                    {key === 'Binh_Thuong'
                      ? '✨ Duy trì căng bóng'
                      : `⚡ Trị liệu: ${cond.treatment.slice(0, 2).join(', ')}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dynamic AI Impact Hint */}
        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <Icon name="zap" size={16} color="#d97706" />
            <Text style={styles.impactTitle}>Thuật toán phản ứng tự động:</Text>
          </View>
          {selectedConditions.includes('Kho_Rat') || selectedConditions.includes('Kích_Ung') ? (
            <Text style={styles.impactText}>
              ⚠️ <Text style={styles.boldRed}>Kích hoạt tính năng Ghi Đè (Override):</Text> Hệ thống sẽ tạm hoãn BHA/Retinol mạnh, bổ sung B5 & Ceramide từ tủ đồ và lùi lịch phác đồ 1 ngày để da phục hồi an toàn.
            </Text>
          ) : selectedConditions.includes('Binh_Thuong') ? (
            <Text style={styles.impactText}>
              🌟 <Text style={styles.boldGreen}>Làn da ổn định:</Text> Hệ thống giữ nguyên chu trình tối ưu hướng tới làn da căng bóng và ngậm nước.
            </Text>
          ) : (
            <Text style={styles.impactText}>
              🎯 <Text style={styles.boldBlue}>Điều chỉnh chuyên sâu:</Text> Cân bằng hoạt chất kháng viêm và kiểm soát dầu thừa cho ngày hôm nay.
            </Text>
          )}
        </View>

        {/* Optional Daily Skin Note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteLabel}>Ghi chú thêm về cảm giác làn da (Tùy chọn):</Text>
          <TextInput
            style={styles.noteInput}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Ví dụ: Vùng cánh mũi hơi bong tróc, buổi trưa đổ dầu nhẹ..."
            placeholderTextColor="#94a3b8"
            multiline={true}
          />
        </View>
      </ScrollView>

      {/* Fixed Bottom Confirmation Button */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmCheckin}
          activeOpacity={0.85}
        >
          <Icon name="check-circle" size={18} color="#ffffff" strokeWidth={2.5} />
          <Text style={styles.confirmButtonText}>Xác Nhận & Cập Nhật Daily Routine</Text>
          <Icon name="chevron-right" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
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
  titleCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 4,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#e11d48',
    letterSpacing: 0.8,
  },
  todayDate: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  mainDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },

  // Conditions
  conditionsGrid: {
    gap: 10,
    marginBottom: 16,
  },
  condCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  condCardSelected: {
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  emojiText: {
    fontSize: 26,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  condLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  condDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
    marginBottom: 8,
  },
  treatmentPreviewWrap: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  treatmentPreviewText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },

  // Impact Card
  impactCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginBottom: 16,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  impactTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  impactText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 18,
  },
  boldRed: {
    fontWeight: '700',
    color: '#dc2626',
  },
  boldGreen: {
    fontWeight: '700',
    color: '#059669',
  },
  boldBlue: {
    fontWeight: '700',
    color: '#0284c7',
  },

  // Note
  noteCard: {
    marginBottom: 10,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  noteInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    fontSize: 12,
    color: '#1e293b',
    minHeight: 50,
  },

  // Footer
  footerContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  confirmButton: {
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
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
