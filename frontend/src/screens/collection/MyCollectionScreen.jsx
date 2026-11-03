/**
 * MyCollectionScreen.jsx  —  "Tủ đồ"
 *
 * Features:
 *  • 2 tabs: "Đang sử dụng" (active + expired_warning) / "Đã sử dụng" (used_up)
 *  • Kệ đồ (wooden shelf) UI — shelves grouped by product category, horizontal scroll
 *  • Long-press product → Action sheet: "Xóa" or "Đánh dấu dùng hết"
 *  • On delete/finish: shows routine-conflict warning if wasInRoutine
 *  • Product card tap → ProductDetailModal
 */

import { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, Plus, Trash2, CheckCircle } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { getProductIcon } from '../../constants/product-icons';
import { useCollection } from '../../context/CollectionContext';
import ProductDetailModal from './ProductDetailModal';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = Math.max((screenWidth - 76) / 4, 64);

// ── Shelf definition — maps productType groups to shelf titles ───────────────
const SHELVES = [
    {
        id: 'treat',
        title: 'Kệ 1 — Đặc trị & Serum',
        types: ['serum', 'treatment', 'essences', 'oil', 'exfoliant', 'mask'],
    },
    {
        id: 'moisture',
        title: 'Kệ 2 — Dưỡng ẩm & Chống nắng',
        types: ['cream', 'moisturizer', 'sunscreen'],
    },
    {
        id: 'cleanse',
        title: 'Kệ 3 — Làm sạch & Toner',
        types: ['cleanser', 'toner', 'others', 'other'],
    },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysLeft(product) {
    if (!product.expirationDate) return null;
    const diff = new Date(product.expirationDate) - new Date();
    return Math.ceil(diff / 86_400_000);
}

function isExpiredWarning(product) {
    return product.status === 'expired_warning';
}

function isRedAlert(product) {
    // Red badge: expired_warning AND user chose to continue using
    return product.status === 'expired_warning' && product.continueAfterExpiry === true;
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function MyCollectionScreen({ navigation }) {
    const {
        activeProducts,
        usedProducts,
        productsForTab,
        loading,
        error,
        tab,
        setTab,
        load,
        deleteProduct,
        markAsUsedUp,
    } = useCollection();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [actionTarget, setActionTarget] = useState(null); // product for action sheet
    const [actionLoading, setActionLoading] = useState(false);

    // Shelves are purely visual: preserve collection order and start a new
    // shelf after every four products. No product type is used for grouping.
    const shelves = useMemo(() => {
        const result = [];
        for (let index = 0; index < productsForTab.length; index += 4) {
            result.push(productsForTab.slice(index, index + 4));
        }
        if (result.length === 0 || result[result.length - 1].length === 4) {
            result.push([]);
        }
        return result;
    }, [productsForTab]);

    // Group products into shelves
    const expiredActiveCount = useMemo(
        () => activeProducts.filter(p => isExpiredWarning(p) && !p.continueAfterExpiry).length,
        [activeProducts]
    );

    const expiringSoonCount = useMemo(
        () => activeProducts.filter(p => {
            const d = daysLeft(p);
            return d !== null && d > 0 && d <= 30 && p.status !== 'expired_warning';
        }).length,
        [activeProducts]
    );

    // ── Long-press handler ─────────────────────────────────────────────────────
    const handleLongPress = useCallback((product) => {
        setActionTarget(product);
    }, []);

    const handleCloseActionSheet = useCallback(() => {
        setActionTarget(null);
    }, []);

    // ── Delete ────────────────────────────────────────────────────────────────
    const confirmDelete = useCallback(async () => {
        const product = actionTarget;
        if (!product) return;
        handleCloseActionSheet();

        const doDelete = async () => {
            setActionLoading(true);
            try {
                const result = await deleteProduct(product._id || product.id);
                if (result?.wasInRoutine) {
                    Alert.alert(
                        'Product deleted',
                        result.replacedWith
                            ? `Replaced with "${result.replacedWith.productName}" in your routine.`
                            : 'This product was removed from your routine because no suitable replacement was found.'
                    );
                }
            } catch (err) {
                Alert.alert('Error', err?.message || 'Unable to delete the product. Please try again.');
            } finally {
                setActionLoading(false);
            }
        };

        Alert.alert(
            'Delete product?',
            'This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: doDelete },
            ]
        );
    }, [actionTarget, deleteProduct, handleCloseActionSheet]);

    // ── Mark as used up ───────────────────────────────────────────────────────
    const confirmUsedUp = useCallback(async () => {
        const product = actionTarget;
        if (!product) return;
        handleCloseActionSheet();

        setActionLoading(true);
        try {
            const result = await markAsUsedUp(product._id || product.id);
            if (result?.wasInRoutine) {
                Alert.alert(
                    'Product marked as used',
                    result.replacedWith
                        ? `Replaced with "${result.replacedWith.productName}" in your routine.`
                        : 'This product was removed from your routine because no replacement was found.'
                );
            }
        } catch (err) {
            Alert.alert('Error', err?.message || 'Unable to update the product. Please try again.');
        } finally {
            setActionLoading(false);
        }
    }, [actionTarget, markAsUsedUp, handleCloseActionSheet]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <View style={styles.titleRow}>
                        <Text style={styles.title}>My collection</Text>
                            <View style={styles.countBadge}>
                                <Text style={styles.countBadgeText}>{activeProducts.length + usedProducts.length} products</Text>
                            </View>
                        </View>
                        <Text style={styles.subtitle}>Track and manage your skincare products</Text>
                    </View>
                </View>

                {/* Tab bar */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tabItem, tab === 'active' && styles.tabItemActive]}
                        onPress={() => setTab('active')}
                    >
                        <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>
                            In use
                        </Text>
                        <View style={styles.tabCountBadge}>
                            <Text style={styles.tabCountText}>{activeProducts.length}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabItem, tab === 'used' && styles.tabItemActive]}
                        onPress={() => setTab('used')}
                    >
                        <Text style={[styles.tabText, tab === 'used' && styles.tabTextActive]}>
                            Used
                        </Text>
                        <View style={[styles.tabCountBadge, styles.tabCountUsed]}>
                            <Text style={[styles.tabCountText, { color: Colors.textSecondary }]}>
                                {usedProducts.length}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Status banners */}
                {expiredActiveCount > 0 && (
                    <View style={styles.alertBanner}>
                        <AlertTriangle size={14} color={Colors.error} />
                        <Text style={styles.alertBannerText}>
                            <Text style={styles.alertBannerBold}>{expiredActiveCount} expired products</Text>
                            {' '}are still in your collection. Please review them.
                        </Text>
                    </View>
                )}
                {expiringSoonCount > 0 && expiredActiveCount === 0 && (
                    <View style={styles.warnBanner}>
                        <View style={styles.warnDot} />
                        <Text style={styles.warnBannerText}>
                            <Text style={styles.warnBannerBold}>{expiringSoonCount} products</Text>
                            {' '}will expire within the next 30 days.
                        </Text>
                    </View>
                )}

                {/* Content */}
                {loading ? (
                    <View style={styles.stateBox}>
                        <ActivityIndicator color={Colors.primary} />
                        <Text style={styles.stateText}>Loading your collection...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.stateBox}>
                        <Text style={styles.stateText}>{error}</Text>
                        <TouchableOpacity onPress={load}>
                            <Text style={styles.retryText}>Try again</Text>
                        </TouchableOpacity>
                    </View>
                ) : productsForTab.length === 0 ? (
                    <View style={styles.stateBox}>
                        <Text style={styles.emptyTitle}>
                            {tab === 'active' ? 'Your collection is empty' : 'No used products yet'}
                        </Text>
                        <Text style={styles.stateText}>
                            {tab === 'active'
                                ? 'Scan and add your first product.'
                                : 'Products marked as used will appear here.'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.collectionCabinet}>
                        {shelves.map((products, index) => (
                            <ProductShelf
                                key={`shelf-${index}`}
                                products={products}
                                showAdd={index === shelves.length - 1}
                                onAdd={() => navigation.navigate('ScanTab')}
                                onPressProduct={setSelectedProduct}
                                onLongPressProduct={handleLongPress}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* FAB: go to Scan to add product */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('ScanTab')}
                activeOpacity={0.85}
            >
                <Plus size={20} color={Colors.textLight} />
                <Text style={styles.fabText}>Add product</Text>
            </TouchableOpacity>

            {/* Product detail modal */}
            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onLongPress={handleLongPress}
                />
            )}

            {/* Long-press action sheet */}
            {actionTarget && (
                <ActionSheet
                    product={actionTarget}
                    loading={actionLoading}
                    onDelete={confirmDelete}
                    onUsedUp={confirmUsedUp}
                    onClose={handleCloseActionSheet}
                />
            )}
        </SafeAreaView>
    );
}

// ---------------------------------------------------------------------------
// ShelfRow
// ---------------------------------------------------------------------------

function ProductShelf({ products, showAdd, onAdd, onPressProduct, onLongPressProduct }) {
    return (
        <View style={styles.shelfSection}>
            {/* Shelf label */}
            {/* Product cards — horizontal scroll */}
            <View style={styles.productRow}>
                {products.map((product, idx) => (
                    <ProductCard
                        key={product._id || product.id || idx}
                        product={product}
                        onPress={() => onPressProduct(product)}
                        onLongPress={() => onLongPressProduct(product)}
                    />
                ))}
                {showAdd && <AddProductSlot onPress={onAdd} />}
            </View>

            {/* Wood plank */}
            <View style={styles.woodShelf}>
                <View style={styles.woodHighlight} />
            </View>
        </View>
    );
}

function AddProductSlot({ onPress }) {
    return (
        <TouchableOpacity
            style={styles.addProductSlot}
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add product"
        >
            <View style={styles.addProductIcon}>
                <Plus size={25} color={Colors.primary} />
            </View>
            <Text style={styles.addProductText}>Add product</Text>
        </TouchableOpacity>
    );
}

function ProductRow({ product, onPress, onLongPress }) {
    const icon = getProductIcon(product.productIcon, product.productType);
    const redAlert = isRedAlert(product);
    const pendingAlert = isExpiredWarning(product) && !product.continueAfterExpiry;

    return (
        <TouchableOpacity
            style={[styles.productRowCard, redAlert && styles.productRowCardAlert]}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={500}
            activeOpacity={0.8}
        >
            <View style={styles.productRowIcon}>
                <Image source={icon.image} style={styles.productRowImage} resizeMode="contain" />
            </View>
            <View style={styles.productRowInfo}>
                <Text style={styles.productRowName} numberOfLines={2}>{product.productName}</Text>
                <Text style={styles.productRowType}>{product.productType}</Text>
            </View>
            {pendingAlert && <AlertTriangle size={18} color={Colors.warning} />}
            {redAlert && <AlertTriangle size={18} color={Colors.error} />}
        </TouchableOpacity>
    );
}

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------

function ProductCard({ product, onPress, onLongPress }) {
    const icon = getProductIcon(product.productIcon, product.productType);
    const redAlert = isRedAlert(product);
    const pendingAlert = isExpiredWarning(product) && !product.continueAfterExpiry;
    const isUsedUp = product.status === 'used_up';

    return (
        <TouchableOpacity
            style={[
                styles.productCard,
                isUsedUp && styles.productCardDimmed,
                redAlert && styles.productCardRedAlert,
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={500}
            activeOpacity={0.75}
        >
            <View style={styles.productIconWrap}>
                <Image
                    source={icon.image}
                    style={styles.productIconImg}
                    resizeMode="contain"
                />
                {/* Status badge overlay */}
                {isUsedUp && (
                    <View style={styles.badgeDimmed}>
                        <Text style={styles.badgeDimmedText}>Used</Text>
                    </View>
                )}
                {redAlert && (
                    <View style={styles.badgeExpired}>
                        <AlertTriangle size={7} color="#fff" />
                        <Text style={styles.badgeExpiredText}>HH</Text>
                    </View>
                )}
                {pendingAlert && !redAlert && (
                    <View style={styles.badgePending}>
                        <Text style={styles.badgePendingText}>!</Text>
                    </View>
                )}
            </View>
            <Text
                style={[styles.productName, redAlert && styles.productNameExpired]}
                numberOfLines={2}
            >
                {product.productName}
            </Text>
        </TouchableOpacity>
    );
}

// ---------------------------------------------------------------------------
// ActionSheet (bottom modal for long-press actions)
// ---------------------------------------------------------------------------

function ActionSheet({ product, loading, onDelete, onUsedUp, onClose }) {
    return (
        <Modal transparent animationType="none" onRequestClose={onClose}>
            <Pressable style={styles.actionOverlay} onPress={onClose}>
                <View style={styles.actionSheet} onStartShouldSetResponder={() => true}>
                    <View style={styles.actionHandle} />
                    <Text style={styles.actionTitle} numberOfLines={1}>
                        {product.productName}
                    </Text>
                    <Text style={styles.actionSub}>{product.productType}</Text>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={onUsedUp}
                        disabled={loading}
                    >
                        <CheckCircle size={20} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Mark as used</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnDanger]}
                        onPress={onDelete}
                        disabled={loading}
                    >
                        <Trash2 size={20} color={Colors.error} />
                        <Text style={[styles.actionBtnText, styles.actionBtnTextDanger]}>
                            Delete product
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCancel} onPress={onClose}>
                        <Text style={styles.actionCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { paddingHorizontal: 20, paddingBottom: 110 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 18 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: { fontSize: 25, fontWeight: '800', color: Colors.text },
    countBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
    countBadgeText: { fontSize: 11, color: Colors.primaryDark, fontWeight: '700' },
    subtitle: { color: Colors.muted, fontSize: 13, marginTop: 5 },

    // Tab bar
    tabBar: { flexDirection: 'row', backgroundColor: '#eaf1ed', borderRadius: 18, padding: 4, marginBottom: 16 },
    tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 38, borderRadius: 20 },
    tabItemActive: { backgroundColor: Colors.card, shadowColor: Colors.shadow, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2 },
    tabText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
    tabTextActive: { color: Colors.text, fontWeight: '700' },
    tabCountBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
    tabCountUsed: { backgroundColor: Colors.borderDark },
    tabCountText: { fontSize: 11, color: Colors.primaryDark, fontWeight: '700' },

    // Banners
    alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.error, marginBottom: 10 },
    alertBannerText: { flex: 1, fontSize: 12, color: Colors.error },
    alertBannerBold: { fontWeight: '800' },
    warnBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, backgroundColor: Colors.background, marginBottom: 10 },
    warnDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.warning },
    warnBannerText: { flex: 1, fontSize: 12, color: Colors.text },
    warnBannerBold: { fontWeight: '700', color: Colors.warning },

    // State cards
    stateBox: { alignItems: 'center', gap: 10, padding: 30, borderRadius: 18, backgroundColor: Colors.background, marginTop: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
    stateText: { fontSize: 13, color: Colors.muted, textAlign: 'center', lineHeight: 19 },
    retryText: { fontSize: 14, fontWeight: '700', color: Colors.primary },

    // Cabinet shell
    collectionCabinet: { marginHorizontal: -2, padding: 12, paddingBottom: 5, borderRadius: 22, backgroundColor: '#e1f2eb', borderWidth: 1, borderColor: '#d2e8de' },
    productRowCard: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 18, backgroundColor: 'rgba(219, 245, 239, 0.72)', borderWidth: 1, borderColor: 'rgba(51, 153, 136, 0.25)' },
    productRowCardAlert: { borderColor: Colors.error, backgroundColor: 'rgba(255, 235, 235, 0.88)' },
    productRowIcon: { width: 62, height: 62, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)' },
    productRowImage: { width: 52, height: 56 },
    productRowInfo: { flex: 1, gap: 4 },
    productRowName: { fontSize: 15, fontWeight: '800', color: Colors.text },
    productRowType: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
    cabinetTop: { height: 13, borderRadius: 5, backgroundColor: '#B65B17', marginBottom: 7, borderTopWidth: 2, borderTopColor: '#D47A2C' },
    cabinetKnob: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#F2BC65', marginLeft: 7, marginTop: 1 },
    cabinetBottom: { height: 13, marginHorizontal: -1, marginTop: -15, borderRadius: 4, backgroundColor: '#A94A0B', borderTopWidth: 2, borderTopColor: '#D47A2C' },

    // Shelf row
    shelfSection: { marginBottom: 12 },
    shelfHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, paddingHorizontal: 2, gap: 5 },
    shelfAccent: { width: 4, height: 14, borderRadius: 3, backgroundColor: '#F4A261' },
    shelfTitle: { flex: 1, fontSize: 12, fontWeight: '700', color: Colors.textLight },
    shelfCount: { fontSize: 10, color: '#FDE7CF' },
    productRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4, paddingHorizontal: 1, paddingTop: 8, paddingBottom: 5 },

    // Wood plank
    woodShelf: { height: 8, borderRadius: 5, backgroundColor: '#9acdbb', marginTop: 7 },
    woodHighlight: { height: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.65)', marginHorizontal: 1 },

    // Product card
    productCard: { width: CARD_WIDTH, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2, backgroundColor: 'transparent' },
    productCardDimmed: { opacity: 0.5 },
    productCardRedAlert: { borderRadius: 8 },
    productIconWrap: { width: 58, height: 63, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 5, position: 'relative' },
    productIconImg: { width: '100%', height: '100%' },

    // Badges
    badgeDimmed: { position: 'absolute', top: 2, backgroundColor: Colors.overlay, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
    badgeDimmedText: { color: '#fff', fontSize: 7, fontWeight: '700' },
    badgeExpired: { position: 'absolute', top: 2, flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.error, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
    badgeExpiredText: { color: '#fff', fontSize: 7, fontWeight: '800' },
    badgePending: { position: 'absolute', top: 2, right: 2, width: 13, height: 13, borderRadius: 7, backgroundColor: Colors.warning, alignItems: 'center', justifyContent: 'center' },
    badgePendingText: { color: '#fff', fontSize: 8, fontWeight: '900' },

    productName: { width: '100%', fontSize: 10, lineHeight: 13, fontWeight: '700', textAlign: 'center', color: Colors.text },
    productNameExpired: { color: Colors.error, fontWeight: '800' },

    // FAB
    // Kept for compatibility with older saved layouts; the add action now
    // lives at the end of the last shelf.
    fab: { display: 'none' },
    fabText: { display: 'none' },
    addProductSlot: { width: CARD_WIDTH, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 },
    addProductIcon: { width: 58, height: 63, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 4, backgroundColor: 'rgba(255,255,255,0.75)' },
    addProductText: { width: '100%', fontSize: 10, lineHeight: 13, fontWeight: '700', textAlign: 'center', color: Colors.primary },

    // Action sheet
    actionOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    actionSheet: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, gap: 4 },
    actionHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.borderDark, alignSelf: 'center', marginBottom: 12 },
    actionTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 2 },
    actionSub: { fontSize: 12, color: Colors.muted, marginBottom: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, backgroundColor: Colors.surface, marginVertical: 4 },
    actionBtnDanger: { backgroundColor: '#fff0f0' },
    actionBtnText: { fontSize: 15, fontWeight: '600', color: Colors.text },
    actionBtnTextDanger: { color: Colors.error },
    actionCancel: { alignItems: 'center', padding: 14, marginTop: 4 },
    actionCancelText: { fontSize: 15, color: Colors.muted, fontWeight: '600' },
});

