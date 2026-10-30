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
  if (!value) return 'Not updated';
  return new Intl.DateTimeFormat('en-US').format(new Date(value));
}

const TYPE_LABELS = {
  cleanser: 'Cleanser',
  toner: 'Toner',
  essences: 'Essence',
  cream: 'Cream',
  oil: 'Face oil',
  serum: 'Serum',
  treatment: 'Treatment',
  moisturizer: 'Moisturizer',
  sunscreen: 'Sunscreen',
  mask: 'Face mask',
  exfoliant: 'Exfoliant',
  others: 'Other',
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

  // Move the product to the used-up tab.
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

  // Keep the product active with a red expiry warning.
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
              <AlertTriangle size={26} color={Colors.error} />
            </View>
            <View style={styles.badgeWrap}>
              <Text style={styles.badgeText}>
                {expiredProducts.length > 1
                  ? `Expired • ${expiredProducts.length} items`
                  : 'Expired product'}
              </Text>
            </View>
          </View>

          {/* Product info banner */}
          <View style={styles.productCard}>
            <View style={styles.bottleMini}>
              <ShieldAlert size={22} color={Colors.error} />
            </View>
            <View style={styles.productDetails}>
              <Text style={styles.productName} numberOfLines={2}>
                {currentProduct.productName}
              </Text>
              <Text style={styles.productBrand} numberOfLines={1}>
                {currentProduct.brand || 'Unknown brand'} • {TYPE_LABELS[currentProduct.productType] || 'Cosmetic'}
              </Text>
              <View style={styles.expiryBadgeRow}>
                <Calendar size={13} color={Colors.error} />
                <Text style={styles.expiryDateText}>
                  Expired: {expiryDateFormatted} ({daysOverdue} days overdue)
                </Text>
              </View>
            </View>
          </View>

          {/* Question section */}
          <View style={styles.questionSection}>
            <Text style={styles.questionText}>
              This product has expired. Would you like to continue using it?
            </Text>
            <View style={styles.noticeBox}>
              <Clock size={15} color={Colors.warning} style={{ marginTop: 2 }} />
              <Text style={styles.noticeText}>
                If you continue using it, the product will be marked with a red warning on the shelf so you can pay attention to skincare safety.
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
                <ActivityIndicator size="small" color={Colors.textSecondary} />
              ) : (
                <>
                  <Text style={styles.rejectButtonText}>No</Text>
                  <Text style={styles.rejectSubtext}>Mark as used up</Text>
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
                <ActivityIndicator size="small" color={Colors.textLight} />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>Continue using</Text>
                  <Text style={styles.continueSubtext}>Red shelf warning</Text>
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
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: Math.min(screenWidth - 36, 380),
    backgroundColor: Colors.background,
    borderRadius: 26,
    padding: 22,
    shadowColor: Colors.shadow,
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
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  badgeWrap: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '700',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  bottleMini: {
    width: 46,
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 3,
  },
  productBrand: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 5,
  },
  expiryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  expiryDateText: {
    color: Colors.error,
    fontSize: 11,
    fontWeight: '700',
  },
  questionSection: {
    marginBottom: 20,
  },
  questionText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
    marginBottom: 10,
    textAlign: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderRadius: 12,
    padding: 10,
  },
  noticeText: {
    flex: 1,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  rejectButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  rejectSubtext: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  continueButton: {
    flex: 1.25,
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    shadowColor: Colors.error,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  continueButtonText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '700',
  },
  continueSubtext: {
    color: Colors.textLight,
    fontSize: 10,
    marginTop: 2,
  },
});
