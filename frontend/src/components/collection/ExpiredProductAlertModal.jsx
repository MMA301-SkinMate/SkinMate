/**
 * ExpiredProductAlertModal.jsx
 *
 * Shown at app open when there are products with status='expired_warning'
 * and continueAfterExpiry=false.
 *
 * Cycles through each expired product one-by-one.
 * User picks:
 *   "Không" (stop)     → status='used_up'  → moves to "Đã sử dụng"
 *   "Tiếp tục dùng"    → continueAfterExpiry=true → stays in active with red badge
 */

import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AlertTriangle, Calendar, Clock } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { PRODUCT_TYPES, getProductIcon } from '../../constants/product-icons';
import { useCollection } from '../../context/CollectionContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TYPE_LABELS = Object.fromEntries(PRODUCT_TYPES.map(t => [t.id, t.label]));

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}

function daysOverdue(product) {
    if (!product.expirationDate) return 0;
    const diff = new Date() - new Date(product.expirationDate);
    return Math.max(0, Math.ceil(diff / 86_400_000));
}

export default function ExpiredProductAlertModal() {
    const { pendingExpiredAlerts, resolveExpiredAlert } = useCollection();
    const [resolvedIds, setResolvedIds] = useState(() => new Set());
    const [processing, setProcessing]  = useState(false);

    // Show products that haven't been resolved in this session yet
    const queue = useMemo(
        () => (pendingExpiredAlerts || []).filter(p => !resolvedIds.has(p._id || p.id)),
        [pendingExpiredAlerts, resolvedIds]
    );

    const current = queue[0];

    if (!current) return null;

    const productId = current._id || current.id;
    const icon      = getProductIcon(current.productIcon, current.productType);
    const overdue   = daysOverdue(current);

    const resolve = async (action) => {
        if (processing) return;
        setProcessing(true);
        try {
            await resolveExpiredAlert(productId, action);
            setResolvedIds(prev => new Set(prev).add(productId));
        } catch (err) {
            console.error('[ExpiredProductAlertModal] resolve error:', err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Modal
            visible
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Badge row */}
                    <View style={styles.badgeRow}>
                        <View style={styles.iconCircle}>
                            <AlertTriangle size={24} color={Colors.error} />
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {queue.length > 1
                                    ? `Hết hạn • ${queue.length} sản phẩm`
                                    : 'Sản phẩm hết hạn'}
                            </Text>
                        </View>
                    </View>

                    {/* Product info */}
                    <View style={styles.productRow}>
                        <View style={styles.iconWrap}>
                            <Image
                                source={icon.image}
                                style={styles.productIcon}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={2}>
                                {current.productName}
                            </Text>
                            <Text style={styles.productType} numberOfLines={1}>
                                {TYPE_LABELS[current.productType] || current.productType}
                            </Text>
                            <View style={styles.dateRow}>
                                <Calendar size={12} color={Colors.error} />
                                <Text style={styles.dateText}>
                                    Hết hạn: {formatDate(current.expirationDate)}
                                    {overdue > 0 ? ` (${overdue} ngày trước)` : ''}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Question */}
                    <Text style={styles.questionText}>
                        Sản phẩm này đã hết hạn. Bạn có muốn tiếp tục sử dụng không?
                    </Text>

                    {/* Warning note */}
                    <View style={styles.noticeBox}>
                        <Clock size={13} color={Colors.warning} style={{ marginTop: 2 }} />
                        <Text style={styles.noticeText}>
                            Nếu tiếp tục, sản phẩm sẽ được giữ trong tủ với biển báo đỏ nhắc nhở bạn về tình trạng hết hạn.
                        </Text>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.stopBtn}
                            onPress={() => resolve('stop')}
                            disabled={processing}
                            activeOpacity={0.8}
                        >
                            {processing
                                ? <ActivityIndicator size="small" color={Colors.textSecondary} />
                                : (
                                    <>
                                        <Text style={styles.stopBtnText}>Không</Text>
                                        <Text style={styles.stopBtnSub}>Chuyển vào Đã sử dụng</Text>
                                    </>
                                )
                            }
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.continueBtn}
                            onPress={() => resolve('continue')}
                            disabled={processing}
                            activeOpacity={0.8}
                        >
                            {processing
                                ? <ActivityIndicator size="small" color="#fff" />
                                : (
                                    <>
                                        <Text style={styles.continueBtnText}>Tiếp tục dùng</Text>
                                        <Text style={styles.continueBtnSub}>Hiện cảnh báo đỏ</Text>
                                    </>
                                )
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay:         { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    card:            { width: Math.min(SCREEN_WIDTH - 36, 380), backgroundColor: Colors.background, borderRadius: 26, padding: 22, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 10, gap: 14 },

    badgeRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconCircle:      { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.error },
    badge:           { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.error, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
    badgeText:       { color: Colors.error, fontSize: 12, fontWeight: '700' },

    productRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.error, borderRadius: 18, padding: 14 },
    iconWrap:        { width: 48, height: 54, borderRadius: 10, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
    productIcon:     { width: 44, height: 50 },
    productInfo:     { flex: 1, gap: 3 },
    productName:     { fontSize: 15, fontWeight: '800', color: Colors.text, lineHeight: 19 },
    productType:     { fontSize: 11, color: Colors.textSecondary },
    dateRow:         { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
    dateText:        { fontSize: 11, color: Colors.error, fontWeight: '700' },

    questionText:    { fontSize: 15, fontWeight: '700', color: Colors.error, textAlign: 'center', lineHeight: 21 },

    noticeBox:       { flexDirection: 'row', gap: 8, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.warning, borderRadius: 12, padding: 10 },
    noticeText:      { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

    buttonRow:       { flexDirection: 'row', gap: 10 },
    stopBtn:         { flex: 1, minHeight: 54, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderDark, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
    stopBtnText:     { fontSize: 14, fontWeight: '700', color: Colors.text },
    stopBtnSub:      { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
    continueBtn:     { flex: 1.3, minHeight: 54, borderRadius: 18, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, shadowColor: Colors.error, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
    continueBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
    continueBtnSub:  { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
});
