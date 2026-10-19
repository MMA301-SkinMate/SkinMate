import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Icon } from './Icon';

export const ConflictModal = ({ visible, conflict, onConfirmProceed, onCancel }) => {
  if (!conflict) return null;

  const isDanger = conflict.severity === 'danger';

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Warning Icon Badge */}
          <View style={[styles.iconBadge, isDanger ? styles.iconBadgeDanger : styles.iconBadgeWarning]}>
            <Icon
              name="alert-triangle"
              size={32}
              color={isDanger ? '#dc2626' : '#d97706'}
              strokeWidth={2.5}
            />
          </View>

          <Text style={[styles.title, isDanger ? styles.titleDanger : styles.titleWarning]}>
            {conflict.title || 'CẢNH BÁO XUNG ĐỘT HOẠT CHẤT'}
          </Text>

          <View style={styles.ingredientBox}>
            <Text style={styles.ingredientLabel}>HOẠT CHẤT CẢNH BÁO:</Text>
            <Text style={styles.ingredientValue}>{conflict.ingredient}</Text>
            <Text style={styles.productNameText}>{conflict.productName}</Text>
          </View>

          <View style={styles.reasonCard}>
            <Text style={styles.reasonText}>{conflict.reason}</Text>
          </View>

          {conflict.recommendation && (
            <View style={styles.recommendationCard}>
              <Icon name="info" size={16} color="#0f766e" />
              <Text style={styles.recommendationText}>{conflict.recommendation}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonCol}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Quay lại chọn sản phẩm khác</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.proceedBtn}
              onPress={onConfirmProceed}
              activeOpacity={0.8}
            >
              <Text style={styles.proceedBtnText}>Tôi hiểu rủi ro, vẫn muốn thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconBadgeDanger: {
    backgroundColor: '#fee2e2',
  },
  iconBadgeWarning: {
    backgroundColor: '#fef3c7',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  titleDanger: {
    color: '#b91c1c',
  },
  titleWarning: {
    color: '#b45309',
  },
  ingredientBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ingredientLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 2,
  },
  ingredientValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  productNameText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  reasonCard: {
    width: '100%',
    backgroundColor: '#fff1f2',
    borderLeftWidth: 4,
    borderLeftColor: '#e11d48',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 12,
    color: '#9f1239',
    lineHeight: 18,
    fontWeight: '500',
  },
  recommendationCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdfa',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginBottom: 18,
  },
  recommendationText: {
    flex: 1,
    fontSize: 11,
    color: '#134e4a',
    lineHeight: 16,
  },
  buttonCol: {
    width: '100%',
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  proceedBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center',
  },
  proceedBtnText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
});
