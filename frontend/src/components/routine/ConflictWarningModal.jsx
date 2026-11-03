import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function ConflictWarningModal({ visible, conflicts = [], suitabilityWarnings = [], onConfirm, onCancel }) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <View style={styles.iconCircle}>
            <Ionicons name="warning" size={32} color="#dc2626" />
          </View>

          <Text style={styles.title}>Cảnh báo xung đột hoạt chất</Text>
          <Text style={styles.subtitle}>
            Hệ thống phát hiện sản phẩm này có thể tương tác không an toàn với các sản phẩm khác trong cùng chu trình:
          </Text>

          <ScrollView style={styles.scrollArea}>
            {conflicts.map((item, idx) => (
              <View key={`conf-${idx}`} style={styles.warningItem}>
                <View style={styles.warningTag}>
                  <Text style={styles.warningTagText}>
                    {item.incoming} ⚠️ {item.existing}
                  </Text>
                </View>
                <Text style={styles.warningReason}>{item.reason}</Text>
              </View>
            ))}

            {suitabilityWarnings.map((item, idx) => (
              <View key={`suit-${idx}`} style={styles.suitabilityItem}>
                <View style={styles.suitabilityTag}>
                  <Text style={styles.suitabilityTagText}>
                    Không tối ưu cho {item.skinType}
                  </Text>
                </View>
                <Text style={styles.warningReason}>{item.message}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Quay lại chỉnh sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>Vẫn lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#991b1b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 18,
  },
  scrollArea: {
    maxHeight: 220,
    width: '100%',
    marginBottom: 16,
  },
  warningItem: {
    backgroundColor: '#fff1f2',
    borderLeftWidth: 4,
    borderLeftColor: '#f43f5e',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  warningTag: {
    backgroundColor: '#fecdd3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  warningTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9f1239',
  },
  warningReason: {
    fontSize: 12,
    color: '#881337',
    lineHeight: 16,
  },
  suitabilityItem: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  suitabilityTag: {
    backgroundColor: '#fde68a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  suitabilityTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});

