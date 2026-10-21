import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SHADOWS, SIZES } from '../../../constants/theme';

const getScoreStyle = (score = 70) => {
    if (score >= 80) {
        return {
            color: COLORS.primary,
            bg: 'rgba(15, 118, 110, 0.08)',
            border: 'rgba(15, 118, 110, 0.25)',
            label: 'Rất phù hợp',
            icon: 'checkmark-circle-outline',
        };
    }
    if (score >= 50) {
        return {
            color: COLORS.warning,
            bg: 'rgba(245, 158, 11, 0.08)',
            border: 'rgba(245, 158, 11, 0.25)',
            label: 'Cân nhắc',
            icon: 'alert-circle-outline',
        };
    }
    return {
        color: COLORS.error,
        bg: 'rgba(239, 68, 68, 0.08)',
        border: 'rgba(239, 68, 68, 0.25)',
        label: 'Không khuyên dùng',
        icon: 'close-circle-outline',
    };
};

const getBadgeStyle = (badgeLevel = 'success') => {
    switch (badgeLevel) {
        case 'danger':
            return {
                bg: 'rgba(239, 68, 68, 0.12)',
                color: COLORS.error,
                border: 'rgba(239, 68, 68, 0.3)',
                icon: 'warning-outline',
                label: 'Cần lưu ý cao',
            };
        case 'warning':
            return {
                bg: 'rgba(245, 158, 11, 0.12)',
                color: COLORS.warning,
                border: 'rgba(245, 158, 11, 0.3)',
                icon: 'alert-circle-outline',
                label: 'Thận trọng khi dùng',
            };
        case 'success':
        default:
            return {
                bg: 'rgba(15, 118, 110, 0.12)',
                color: COLORS.primary,
                border: 'rgba(15, 118, 110, 0.3)',
                icon: 'checkmark-circle-outline',
                label: 'Tương thích tốt',
            };
    }
};

const AnalysisResultView = ({ data }) => {
    if (!data) return null;

    const baseScore = data.baseScore ?? 70;
    const contextualScore = data.contextualScore ?? 70;
    const baseStyle = getScoreStyle(baseScore);
    const contextualStyle = getScoreStyle(contextualScore);

    // Extract verdict
    const verdictObj = typeof data.verdict === 'object' && data.verdict !== null ? data.verdict : null;
    const verdictText = verdictObj?.text || (typeof data.verdict === 'string' ? data.verdict : '');
    const verdictBadge = getBadgeStyle(verdictObj?.badgeLevel || (contextualScore >= 80 ? 'success' : contextualScore >= 50 ? 'warning' : 'danger'));

    // Extract conflict resolution
    const conflictObj = typeof data.conflictResolution === 'object' && data.conflictResolution !== null ? data.conflictResolution : null;
    const hasConflict = conflictObj ? Boolean(conflictObj.hasConflict) : false;
    const conflictDetails = conflictObj?.details || (typeof data.conflictResolution === 'string' ? data.conflictResolution : '');

    // Extract pairing recommendation
    const pairingObj = typeof data.pairingRecommendation === 'object' && data.pairingRecommendation !== null ? data.pairingRecommendation : null;
    const matchedClosetProduct = pairingObj?.matchedProductInCloset || data.bestPairingInCloset || null;
    const pairingAdvice = pairingObj?.advice || (typeof data.pairingRecommendation === 'string' ? data.pairingRecommendation : (typeof data.bestPairingInCloset === 'string' ? data.bestPairingInCloset : ''));
    const ingredientsToAdd = Array.isArray(pairingObj?.ingredientsToAdd) ? pairingObj.ingredientsToAdd : [];
    const ingredientsToAvoid = Array.isArray(pairingObj?.ingredientsToAvoid) ? pairingObj.ingredientsToAvoid : [];

    // Extract future plan
    const futureObj = typeof data.futurePlan === 'object' && data.futurePlan !== null ? data.futurePlan : null;
    const planFrequency = futureObj?.frequency || '2 - 3 lần / tuần';
    const planTiming = futureObj?.timing || 'Buổi tối';
    const planNotes = futureObj?.notes || (typeof data.futurePlan === 'string' ? data.futurePlan : '');

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <View style={styles.headerIconWrapper}>
                    <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Result Analyze Product</Text>
                    <Text style={styles.headerSubtitle}>AI-based evaluation according to skin condition and wardrobe.</Text>
                </View>
            </View>

            {/* Score Cards (Side-by-side) */}
            <View style={styles.scoresGrid}>
                {/* Score 1: Skin Type */}
                <View style={[styles.scoreCard, { backgroundColor: baseStyle.bg, borderColor: baseStyle.border }]}>
                    <View style={styles.scoreCardTop}>
                        <Ionicons name={baseStyle.icon} size={16} color={baseStyle.color} />
                        <Text style={[styles.scoreBadgeText, { color: baseStyle.color }]}>{baseStyle.label}</Text>
                    </View>
                    <Text style={[styles.scoreValue, { color: baseStyle.color }]}>{baseScore}%</Text>
                    <Text style={styles.scoreLabel}>Score Skin Type</Text>
                    <View style={styles.scoreBarTrack}>
                        <View style={[styles.scoreBarFill, { width: `${Math.min(100, Math.max(0, baseScore))}%`, backgroundColor: baseStyle.color }]} />
                    </View>
                </View>

                {/* Score 2: Skin Condition */}
                <View style={[styles.scoreCard, { backgroundColor: contextualStyle.bg, borderColor: contextualStyle.border }]}>
                    <View style={styles.scoreCardTop}>
                        <Ionicons name={contextualStyle.icon} size={16} color={contextualStyle.color} />
                        <Text style={[styles.scoreBadgeText, { color: contextualStyle.color }]}>{contextualStyle.label}</Text>
                    </View>
                    <Text style={[styles.scoreValue, { color: contextualStyle.color }]}>{contextualScore}%</Text>
                    <Text style={styles.scoreLabel}>Score Skin Condition</Text>
                    <View style={styles.scoreBarTrack}>
                        <View style={[styles.scoreBarFill, { width: `${Math.min(100, Math.max(0, contextualScore))}%`, backgroundColor: contextualStyle.color }]} />
                    </View>
                </View>
            </View>

            {/* 1. Feedback / Verdict */}
            {Boolean(verdictText) && (
                <View style={styles.cardSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="chatbubble-ellipses-outline" size={17} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>Feedback</Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: verdictBadge.bg, borderColor: verdictBadge.border }]}>
                            <Ionicons name={verdictBadge.icon} size={12} color={verdictBadge.color} />
                            <Text style={[styles.statusPillText, { color: verdictBadge.color }]}>{verdictBadge.label}</Text>
                        </View>
                    </View>
                    <Text style={styles.feedbackBody}>{verdictText}</Text>
                </View>
            )}

            {/* 2. Conflict Resolution */}
            {Boolean(conflictDetails) && (
                <View style={[
                    styles.cardSection,
                    hasConflict ? styles.conflictCardAlert : styles.conflictCardSafe
                ]}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons
                                name={hasConflict ? 'warning-outline' : 'shield-checkmark-outline'}
                                size={18}
                                color={hasConflict ? COLORS.error : COLORS.primary}
                            />
                            <Text style={[styles.sectionTitle, hasConflict && { color: COLORS.error }]}>
                                {hasConflict ? 'Conflict Alert' : 'Product Compatibility'}
                            </Text>
                        </View>
                        <View style={[
                            styles.statusPill,
                            {
                                backgroundColor: hasConflict ? 'rgba(239, 68, 68, 0.12)' : 'rgba(15, 118, 110, 0.12)',
                                borderColor: hasConflict ? 'rgba(239, 68, 68, 0.25)' : 'rgba(15, 118, 110, 0.25)'
                            }
                        ]}>
                            <Text style={[
                                styles.statusPillText,
                                { color: hasConflict ? COLORS.error : COLORS.primary }
                            ]}>
                                {hasConflict ? 'Xung đột' : 'An toàn'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.conflictBody}>{conflictDetails}</Text>
                </View>
            )}

            {/* 3. Best Pairing & Ingredients */}
            {(Boolean(matchedClosetProduct) || Boolean(pairingAdvice) || ingredientsToAdd.length > 0 || ingredientsToAvoid.length > 0) && (
                <View style={styles.cardSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="git-compare-outline" size={17} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>Best Pairing & Ingredients</Text>
                        </View>
                    </View>

                    {/* Matched product from closet if exists */}
                    {Boolean(matchedClosetProduct && typeof matchedClosetProduct === 'string') && (
                        <View style={styles.matchedClosetBox}>
                            <View style={styles.closetIconWrap}>
                                <Ionicons name="cube-outline" size={16} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.closetSub}>Best product in your closet:</Text>
                                <Text style={styles.closetName}>{matchedClosetProduct}</Text>
                            </View>
                        </View>
                    )}

                    {Boolean(pairingAdvice) && (
                        <Text style={styles.pairingAdviceText}>{pairingAdvice}</Text>
                    )}

                    {/* Ingredients to Add */}
                    {ingredientsToAdd.length > 0 && (
                        <View style={styles.tagGroup}>
                            <Text style={styles.tagGroupLabel}>Recommended ingredients:</Text>
                            <View style={styles.chipsContainer}>
                                {ingredientsToAdd.map((ing, i) => (
                                    <View key={i} style={styles.addChip}>
                                        <Ionicons name="add-circle" size={13} color={COLORS.primary} />
                                        <Text style={styles.addChipText}>{ing}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Ingredients to Avoid */}
                    {ingredientsToAvoid.length > 0 && (
                        <View style={styles.tagGroup}>
                            <Text style={[styles.tagGroupLabel, { color: COLORS.error }]}>Ingredients to avoid:</Text>
                            <View style={styles.chipsContainer}>
                                {ingredientsToAvoid.map((ing, i) => (
                                    <View key={i} style={styles.avoidChip}>
                                        <Ionicons name="close-circle" size={13} color={COLORS.error} />
                                        <Text style={styles.avoidChipText}>{ing}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            )}

            {/* 4. Future Plan */}
            {(Boolean(planFrequency) || Boolean(planTiming) || Boolean(planNotes)) && (
                <View style={styles.cardSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="calendar-outline" size={17} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>Future Plan</Text>
                        </View>
                    </View>

                    <View style={styles.planBadgesContainer}>
                        <View style={styles.planBadge}>
                            <Ionicons name="repeat-outline" size={15} color={COLORS.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.planBadgeLabel}>Frequency</Text>
                                <Text style={styles.planBadgeValue}>{planFrequency}</Text>
                            </View>
                        </View>

                        <View style={styles.planBadge}>
                            <Ionicons name="time-outline" size={15} color={COLORS.primary} />
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={styles.planBadgeLabel}>Timing</Text>
                                <Text style={styles.planBadgeValue}>{planTiming}</Text>
                            </View>
                        </View>
                    </View>

                    {Boolean(planNotes) && (
                        <View style={styles.planNotesBox}>
                            <Ionicons name="bulb-outline" size={16} color={COLORS.primary} style={{ marginTop: 2 }} />
                            <Text style={styles.planNotesText}>{planNotes}</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

export default AnalysisResultView;

const styles = StyleSheet.create({
    container: {
        marginTop: 22,
        marginBottom: 20,
        gap: 14,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 2,
        marginBottom: 2,
    },
    headerIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: SIZES.radiusLarge,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: SIZES.font,
        fontWeight: '700',
        color: COLORS.textMain,
    },
    headerSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    scoresGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    scoreCard: {
        flex: 1,
        borderRadius: SIZES.radius + 4,
        padding: 14,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 6,
    },
    scoreBadgeText: {
        fontSize: SIZES.small,
        fontWeight: '600',
    },
    scoreValue: {
        fontSize: SIZES.extraLarge,
        fontWeight: '800',
        lineHeight: 34,
        marginBottom: 2,
    },
    scoreLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: COLORS.textSecondary,
        marginBottom: 8,
        textAlign: 'center',
    },
    scoreBarTrack: {
        width: '100%',
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
    },
    scoreBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    cardSection: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radius + 3,
        padding: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.light,
    },
    conflictCardAlert: {
        backgroundColor: '#FFF7F7',
        borderColor: 'rgba(239, 68, 68, 0.25)',
    },
    conflictCardSafe: {
        backgroundColor: '#F8FDFB',
        borderColor: 'rgba(15, 118, 110, 0.2)',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: SIZES.font,
        fontWeight: '700',
        color: COLORS.textMain,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusPillText: {
        fontSize: SIZES.small,
        fontWeight: '600',
    },
    feedbackBody: {
        fontSize: SIZES.small + 1,
        color: COLORS.textMain,
        lineHeight: 20,
    },
    conflictBody: {
        fontSize: SIZES.small + 1,
        color: COLORS.textMain,
        lineHeight: 20,
    },
    matchedClosetBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(15, 118, 110, 0.06)',
        borderRadius: SIZES.radius,
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgba(15, 118, 110, 0.15)',
        marginBottom: 10,
    },
    closetIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closetSub: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    closetName: {
        fontSize: SIZES.small + 1,
        fontWeight: '700',
        color: COLORS.primary,
        marginTop: 1,
    },
    pairingAdviceText: {
        fontSize: SIZES.small + 1,
        color: COLORS.textMain,
        lineHeight: 19,
        marginBottom: 10,
    },
    tagGroup: {
        marginTop: 6,
    },
    tagGroupLabel: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    addChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(15, 118, 110, 0.08)',
        borderColor: 'rgba(15, 118, 110, 0.25)',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
    },
    addChipText: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.primary,
    },
    avoidChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderColor: 'rgba(239, 68, 68, 0.25)',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
    },
    avoidChipText: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.error,
    },
    planBadgesContainer: {
        flexDirection: 'column',
        gap: 8,
        marginBottom: 10,
    },
    planBadge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
    },
    planBadgeLabel: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    planBadgeValue: {
        fontSize: SIZES.small,
        fontWeight: '500',
        color: COLORS.textMain,
        marginTop: 1,
    },
    planNotesBox: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    planNotesText: {
        flex: 1,
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
});
