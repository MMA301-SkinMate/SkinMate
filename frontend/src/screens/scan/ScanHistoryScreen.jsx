import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Image,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { collectionApi } from '../../api/collectionApi';
import { PRODUCT_ICONS } from '../../data/productIcons';
import { PRODUCT_TYPES } from '../../data/productTypes';
import ScreenWrapper from '../../components/ScreenWrapper';
import ScreenHeader from '../../components/scan/productInfoDetail/ScreenHeader';

const getProductIconSource = (productIcon, productType) => {
    if (productIcon) {
        const matched = PRODUCT_ICONS.find(
            (item) => item.id.toLowerCase() === String(productIcon).toLowerCase()
        );
        if (matched) return matched.image;
    }
    return PRODUCT_ICONS[0]?.image;
};

const getProductTypeLabel = (typeId) => {
    if (!typeId) return 'Sản phẩm';
    const found = PRODUCT_TYPES.find((t) => t.id.toLowerCase() === String(typeId).toLowerCase());
    return found ? found.label : typeId.charAt(0).toUpperCase() + typeId.slice(1);
};

const getScoreMeta = (score = 70) => {
    if (score >= 80) {
        return {
            color: COLORS.primary,
            bg: 'rgba(15, 118, 110, 0.08)',
            border: 'rgba(15, 118, 110, 0.2)',
            label: 'Rất phù hợp',
            icon: 'checkmark-circle',
        };
    }
    if (score >= 50) {
        return {
            color: COLORS.warning,
            bg: 'rgba(245, 158, 11, 0.08)',
            border: 'rgba(245, 158, 11, 0.2)',
            label: 'Cân nhắc',
            icon: 'alert-circle',
        };
    }
    return {
        color: COLORS.error,
        bg: 'rgba(239, 68, 68, 0.08)',
        border: 'rgba(239, 68, 68, 0.2)',
        label: 'Thận trọng',
        icon: 'close-circle',
    };
};

const ScanHistoryScreen = ({ navigation }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchHistory = async () => {
        try {
            const res = await collectionApi.getScanHistory();
            if (res && res.data) {
                setHistory(res.data);
            }
        } catch (error) {
            console.error('Error fetching scan history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchHistory();
    }, []);

    // Format ngày & giờ
    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '';
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} • ${hours}:${minutes}`;
    };

    // Filter items theo search query
    const filteredHistory = useMemo(() => {
        if (!searchQuery.trim()) return history;
        const query = searchQuery.toLowerCase().trim();
        return history.filter((item) => {
            const matchName = item.productName && item.productName.toLowerCase().includes(query);
            const matchType = item.productType && item.productType.toLowerCase().includes(query);
            return matchName || matchType;
        });
    }, [history, searchQuery]);

    const renderHistoryItem = ({ item }) => {
        const baseScore = item.analysisResult?.baseScore;
        const contextualScore = item.analysisResult?.contextualScore;
        const baseMeta = getScoreMeta(baseScore ?? 70);
        const contextualMeta = getScoreMeta(contextualScore ?? 70);
        const productIconSource = getProductIconSource(item.productIcon, item.productType);
        const ingredientCount = Array.isArray(item.ingredients) ? item.ingredients.length : 0;

        const todaySkinCondition = item.todaySkinCondition || 'Da dầu nhạy cảm • Dễ bít tắc';

        const todayInsightText =
            (typeof item.analysisResult?.verdict === 'object' && item.analysisResult?.verdict?.text) ||
            (typeof item.analysisResult?.verdict === 'string' && item.analysisResult.verdict) ||
            (contextualScore >= 80
                ? 'Công thức dịu nhẹ, tương thích rất tốt với tình trạng da hôm nay.'
                : contextualScore >= 50
                    ? 'Cần chú ý liều lượng mỏng nhẹ để tránh gây kích ứng nền da hôm nay.'
                    : 'Có thành phần chưa tối ưu cho nền da đang nhạy cảm hôm nay.');

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => {
                    navigation.navigate('AddProduct', {
                        productData: {
                            productName: item.productName,
                            productType: item.productType,
                            selectedType: item.productType,
                            productIcon: item.productIcon,
                            selectedIcon: item.productIcon,
                            ingredientList: item.ingredients,
                        },
                        analysisResult: item.analysisResult,
                    });
                }}
            >
                {/* Header Card: Icon, Tên, Loại, Badge Bản nháp */}
                <View style={styles.cardHeader}>
                    <View style={styles.iconWrapper}>
                        <Image
                            source={productIconSource}
                            style={styles.productIconImg}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.productMainInfo}>
                        <Text style={styles.productName} numberOfLines={1}>
                            {item.productName || 'Product name'}
                        </Text>
                        <View style={styles.typeBadgeRow}>
                            <View style={styles.typeTag}>
                                <Text style={styles.typeTagText}>
                                    {getProductTypeLabel(item.productType)}
                                </Text>
                            </View>
                            {ingredientCount > 0 && (
                                <View style={styles.ingredientTag}>
                                    <Ionicons name="list-outline" size={11} color={COLORS.textSecondary} />
                                    <Text style={styles.ingredientTagText}>
                                        {ingredientCount} ingredients
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Badge Bản nháp */}
                    <View style={styles.badgeDraft}>
                        <Ionicons name="create-outline" size={12} color={COLORS.warning} />
                        <Text style={styles.badgeTextDraft}>Bản nháp</Text>
                    </View>
                </View>

                {/* Phần Điểm số (Base Score & Today Context) */}
                {Boolean(item.analysisResult) && (
                    <View style={styles.scoresGrid}>
                        {/* Score 1: Base Score */}
                        <View style={[styles.scoreBox, { backgroundColor: baseMeta.bg, borderColor: baseMeta.border }]}>
                            <View style={styles.scoreBoxTop}>
                                <Text style={styles.scoreTitle}>Base Score</Text>
                                <Ionicons name={baseMeta.icon} size={14} color={baseMeta.color} />
                            </View>
                            <Text style={[styles.scoreNumber, { color: baseMeta.color }]}>
                                {baseScore ?? '--'}%
                            </Text>
                            <Text style={styles.scoreSubLabel}>Phù hợp loại da</Text>
                        </View>

                        {/* Score 2: Today Context */}
                        <View style={[styles.scoreBox, { backgroundColor: contextualMeta.bg, borderColor: contextualMeta.border }]}>
                            <View style={styles.scoreBoxTop}>
                                <Text style={styles.scoreTitle}>Today Context</Text>
                                <Ionicons name={contextualMeta.icon} size={14} color={contextualMeta.color} />
                            </View>
                            <Text style={[styles.scoreNumber, { color: contextualMeta.color }]}>
                                {contextualScore ?? '--'}%
                            </Text>
                            <Text style={styles.scoreSubLabel}>Tương thích hôm nay</Text>
                        </View>
                    </View>
                )}

                {/* PHẦN TODAY CONTEXT & TÌNH TRẠNG DA HÔM NAY */}
                <View style={styles.todayContextSection}>
                    <View style={styles.todayContextHeader}>
                        <View style={styles.todayContextTitleRow}>
                            <View style={styles.todayIconCircle}>
                                <Ionicons name="sparkles" size={13} color={COLORS.primary} />
                            </View>
                            <Text style={styles.todayContextTitle}>Today Context</Text>
                        </View>
                    </View>

                    {/* Tình trạng da hôm nay (Hardcoded mock theo yêu cầu) */}
                    <View style={styles.skinConditionRow}>
                        <View style={styles.skinConditionPill}>
                            <Ionicons name="leaf" size={12} color={COLORS.primary} />
                            <Text style={styles.skinConditionLabel}>Skin condition:</Text>
                            <Text style={styles.skinConditionValue}>{todaySkinCondition}</Text>
                        </View>
                    </View>

                    {/* AI Assessment / Lời khuyên nhanh */}
                    <Text style={styles.todayAdviceText} numberOfLines={2}>
                        {todayInsightText}
                    </Text>
                </View>

                {/* Footer: Thời gian quét & Xem chi tiết */}
                <View style={styles.cardFooter}>
                    <View style={styles.dateRow}>
                        <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
                        <Text style={styles.dateText}>
                            {formatDateTime(item.createdAt) || 'Gần đây'}
                        </Text>
                    </View>
                    <View style={styles.viewDetailRow}>
                        <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                        <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper>
            {/* Header Screen */}
            <ScreenHeader
                title="Scan history"
                onGoBack={() => navigation.goBack()}
            />
            <View style={styles.screenHeader}>
                {/* Thanh tìm kiếm */}
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search product..."
                        placeholderTextColor={COLORS.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    />
                    {Boolean(searchQuery) && (
                        <TouchableOpacity
                            onPress={() => setSearchQuery('')}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Nội dung danh sách */}
            {loading ? (
                <View style={styles.centerLoading}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Đang tải lịch sử quét...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredHistory}
                    keyExtractor={(item) => item._id || String(Math.random())}
                    renderItem={renderHistoryItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="scan-outline" size={40} color={COLORS.primary} />
                            </View>
                            <Text style={styles.emptyTitle}>
                                {searchQuery ? 'No results found' : 'No scan history yet'}
                            </Text>
                            <Text style={styles.emptyText}>
                                {searchQuery
                                    ? 'Try searching with a different keyword or clear the search box'
                                    : 'Scan product labels or ingredient lists to get in-depth analysis for your skin.'}
                            </Text>
                            {!searchQuery && (
                                <TouchableOpacity
                                    style={styles.scanNowBtn}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate('Scan')}
                                >
                                    <Ionicons name="camera-outline" size={18} color={COLORS.textLight} />
                                    <Text style={styles.scanNowBtnText}>Scan Product Now</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            )}
        </ScreenWrapper>

    );
};

export default ScanHistoryScreen;

const styles = StyleSheet.create({
    screenHeader: {
        backgroundColor: COLORS.card,
        paddingTop: SPACING.xs,
        paddingBottom: SPACING.sm + 2,
        gap: SPACING.sm,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: RADIUS.input,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    screenTitle: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.textMain,
    },
    screenSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginTop: 1,
    },
    refreshButton: {
        width: 38,
        height: 38,
        borderRadius: RADIUS.input,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.input,
        paddingHorizontal: SPACING.sm,
        height: 42,
        gap: SPACING.xs,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        fontSize: SIZES.font - 1,
        color: COLORS.textMain,
        paddingVertical: 0,
    },
    listContent: {
        paddingBottom: SPACING.xxl,
        gap: SPACING.sm + 2,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.card,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.light,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.sm + 2,
    },
    iconWrapper: {
        width: 52,
        height: 52,
        borderRadius: RADIUS.input + 2,
        backgroundColor: 'rgba(15, 118, 110, 0.07)',
        borderWidth: 1,
        borderColor: 'rgba(15, 118, 110, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    productIconImg: {
        width: 36,
        height: 36,
    },
    productMainInfo: {
        flex: 1,
        gap: SPACING.xxs,
    },
    productName: {
        fontSize: SIZES.medium,
        fontWeight: '700',
        color: COLORS.textMain,
    },
    typeBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: SPACING.xxs + 2,
    },
    typeTag: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.xs,
        paddingVertical: 2,
        borderRadius: RADIUS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    typeTagText: {
        fontSize: SIZES.small - 1,
        fontWeight: '600',
        color: COLORS.primaryDark,
    },
    ingredientTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.xs - 1,
        paddingVertical: 2,
        borderRadius: RADIUS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    ingredientTagText: {
        fontSize: SIZES.small - 1,
        color: COLORS.textSecondary,
    },
    badgeDraft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: SPACING.xs + 2,
        paddingVertical: 4,
        borderRadius: RADIUS.pill,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.25)',
    },
    badgeTextDraft: {
        fontSize: SIZES.small - 1,
        fontWeight: '600',
        color: COLORS.warning,
    },
    scoresGrid: {
        flexDirection: 'row',
        gap: SPACING.xs + 2,
        marginBottom: SPACING.sm,
    },
    scoreBox: {
        flex: 1,
        paddingVertical: SPACING.xs + 2,
        paddingHorizontal: SPACING.sm,
        borderRadius: RADIUS.input,
        borderWidth: 1,
    },
    scoreBoxTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    scoreTitle: {
        fontSize: SIZES.small - 1,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    scoreNumber: {
        fontSize: SIZES.title,
        fontWeight: '800',
    },
    scoreSubLabel: {
        fontSize: SIZES.small - 2,
        color: COLORS.textSecondary,
        marginTop: 1,
    },
    todayContextSection: {
        backgroundColor: '#F0FDFA',
        borderRadius: RADIUS.input,
        padding: SPACING.sm,
        borderWidth: 1,
        borderColor: '#CCFBF1',
        marginBottom: SPACING.sm,
        gap: SPACING.xs,
    },
    todayContextHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    todayContextTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    todayIconCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(15, 118, 110, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    todayContextTitle: {
        fontSize: SIZES.small,
        fontWeight: '700',
        color: COLORS.primary,
    },
    weatherPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: COLORS.card,
        paddingHorizontal: SPACING.xs - 1,
        paddingVertical: 2,
        borderRadius: RADIUS.pill,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    weatherPillText: {
        fontSize: SIZES.small - 2,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    skinConditionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skinConditionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: COLORS.card,
        paddingHorizontal: SPACING.xs + 1,
        paddingVertical: 5,
        borderRadius: RADIUS.small,
        borderWidth: 1,
        borderColor: 'rgba(15, 118, 110, 0.2)',
        flexWrap: 'wrap',
    },
    skinConditionLabel: {
        fontSize: SIZES.small - 1,
        fontWeight: '600',
        color: COLORS.primary,
    },
    skinConditionValue: {
        fontSize: SIZES.small - 1,
        fontWeight: '700',
        color: COLORS.textMain,
    },
    todayAdviceText: {
        fontSize: SIZES.small - 1,
        color: COLORS.textMain,
        lineHeight: 16,
        fontStyle: 'italic',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.xs,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: SIZES.small - 1,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    viewDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    viewDetailText: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.primary,
    },
    centerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.xs + 2,
    },
    loadingText: {
        fontSize: SIZES.font - 1,
        color: COLORS.textSecondary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.xxl + 10,
        paddingHorizontal: SPACING.xl,
        gap: SPACING.xs + 2,
    },
    emptyIconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: 'rgba(15, 118, 110, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xxs,
    },
    emptyTitle: {
        fontSize: SIZES.medium,
        fontWeight: '700',
        color: COLORS.textMain,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: SIZES.font - 1,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
    scanNowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xs + 2,
        borderRadius: RADIUS.pill,
        marginTop: SPACING.sm,
    },
    scanNowBtnText: {
        fontSize: SIZES.font - 1,
        fontWeight: '600',
        color: COLORS.textLight,
    },
});