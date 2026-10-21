import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlertTriangle, Calendar, Clock, ShieldAlert, X } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useCollection } from '../../context/CollectionContext';

const { width: screenWidth } = Dimensions.get('window');

function getDaysLeft(product) {
  const expiration = product.expirationDate || product.manufacturerExpirationDate;
  if (!expiration) return null;
  return Math.ceil((new Date(expiration) - new Date()) / 86400000);
}

function formatDate(value) {
  if (!value) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}

const TYPE_LABELS = {
  cleanser: 'Sữa rửa mặt',
  toner: 'Toner & Nước hoa hồng',
  essences: 'Essence & Tinh chất lỏng',
  cream: 'Kem dưỡng',
  oil: 'Dầu dưỡng',
  serum: 'Serum & Tinh chất đậm đặc',
  treatment: 'Đặc trị / Treatment',
  moisturizer: 'Kem dưỡng ẩm',
  sunscreen: 'Kem chống nắng',
  mask: 'Mặt nạ',
  exfoliant: 'Tẩy tế bào chết',
  others: 'Khác',
};

export default function ExpiredProductAlertModal() {
  const { collection, isCollectionLoading, markAsEmpty, updateProduct } = useCollection();
  const [resolvedIds, setResolvedIds] = useState(() => new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter products that are active/expired, and haven't chosen continueAfterExpiry or been resolved
  const expiredProducts = useMemo(() => {
    if (isCollectionLoading || !collection.length) return [];
    return collection.filter(product => {
      if (product.status === 'finished' || product.status === 'draft') return false;
      if (product.continueAfterExpiry === true) return false;
      if (resolvedIds.has(product.id)) return false;
      const daysLeft = getDaysLeft(product);
      return (daysLeft !== null && daysLeft < 0) || product.status === 'expired';
    });
  }, [collection, isCollectionLoading, resolvedIds]);

  const currentProduct = expiredProducts[0];
  const isVisible = Boolean(currentProduct);

  if (!isVisible) return null;

  const daysLeft = getDaysLeft(currentProduct);
  const daysOverdue = daysLeft !== null ? Math.abs(daysLeft) : 0;
  const expiryDateFormatted = formatDate(currentProduct.expirationDate || currentProduct.manufacturerExpirationDate);

  // Button "Không": Cho sản phẩm vào tab đã sử dụng (đã dùng hết)
  const handleReject = async () => {
    if (isProcessing || !currentProduct) return;
    setIsProcessing(true);
    try {
      await markAsEmpty(currentProduct.id);
      setResolvedIds(prev => new Set(prev).add(currentProduct.id));
    } catch (error) {
      console.error('Error marking product as empty:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Button "Tiếp tục sử dụng": Vẫn để sản phẩm ở tab đang sử dụng nhưng có trạng thái cảnh báo đỏ
  const handleContinue = async () => {
    if (isProcessing || !currentProduct) return;
    setIsProcessing(true);
    try {
      await updateProduct(currentProduct.id, { continueAfterExpiry: true, status: 'active' });
      setResolvedIds(prev => new Set(prev).add(currentProduct.id));
    } catch (error) {
      console.error('Error updating product continueAfterExpiry:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header icon & badge */}
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={26} color="#DC2626" />
            </View>
            <View style={styles.badgeWrap}>
              <Text style={styles.badgeText}>
                {expiredProducts.length > 1
                  ? `Hết hạn • Còn ${expiredProducts.length} món`
                  : 'Sản phẩm hết hạn'}
              </Text>
            </View>
          </View>

          {/* Product info banner */}
          <View style={styles.productCard}>
            <View style={styles.bottleMini}>
              <ShieldAlert size={22} color="#DC2626" />
            </View>
            <View style={styles.productDetails}>
              <Text style={styles.productName} numberOfLines={2}>
                {currentProduct.productName}
              </Text>
              <Text style={styles.productBrand} numberOfLines={1}>
                {currentProduct.brand || 'Chưa rõ thương hiệu'} • {TYPE_LABELS[currentProduct.productType] || 'Mỹ phẩm'}
              </Text>
              <View style={styles.expiryBadgeRow}>
                <Calendar size={13} color="#991B1B" />
                <Text style={styles.expiryDateText}>
                  Hết hạn: {expiryDateFormatted} (Quá hạn {daysOverdue} ngày)
                </Text>
              </View>
            </View>
          </View>

          {/* Question section */}
          <View style={styles.questionSection}>
            <Text style={styles.questionText}>
              Sản phẩm này đã hết hạn, bạn có muốn tiếp tục sử dụng?
            </Text>
            <View style={styles.noticeBox}>
              <Clock size={15} color="#B45309" style={{ marginTop: 2 }} />
              <Text style={styles.noticeText}>
                Nếu tiếp tục dùng, sản phẩm sẽ được đánh dấu cảnh báo đỏ trên kệ để bạn chú ý an toàn da liễu.
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={handleReject}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#4B5563" />
              ) : (
                <>
                  <Text style={styles.rejectButtonText}>Không</Text>
                  <Text style={styles.rejectSubtext}>Cho vào đã dùng hết</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>Tiếp tục sử dụng</Text>
                  <Text style={styles.continueSubtext}>Cảnh báo đỏ trên kệ</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: Math.min(screenWidth - 36, 380),
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  badgeWrap: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  bottleMini: {
    width: 46,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    color: '#111629',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 3,
  },
  productBrand: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 5,
  },
  expiryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  expiryDateText: {
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '600',
  },
  questionSection: {
    marginBottom: 20,
  },
  questionText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
    marginBottom: 10,
    textAlign: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 10,
  },
  noticeText: {
    flex: 1,
    color: '#92400E',
    fontSize: 11.5,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  rejectButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  rejectSubtext: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  continueButton: {
    flex: 1.25,
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    shadowColor: '#DC2626',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  continueSubtext: {
    color: '#FEE2E2',
    fontSize: 10,
    marginTop: 2,
  },
});
