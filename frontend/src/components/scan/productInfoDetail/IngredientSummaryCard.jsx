import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SIZES, SHADOWS } from '../../../constants/theme';

const IngredientSummaryCard = ({ ingredientList = [] }) => {
    return (
        <View style={styles.ingredientsSummaryCard}>
            <View style={styles.summaryHeader}>
                <Ionicons name="flask-outline" size={20} color={COLORS.primary} />
                <Text style={styles.summaryTitle}>
                    Confirmed ingredients ({ingredientList.length})
                </Text>
            </View>

            <ScrollView
                style={styles.badgeVerticalScroll}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.badgeContainer}
                nestedScrollEnabled={true}
            >
                {ingredientList.map((item, index) => (
                    <View key={index} style={styles.badge}>
                        <Text style={styles.badgeText}>{item}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default IngredientSummaryCard;

const styles = StyleSheet.create({
    ingredientsSummaryCard: {
        backgroundColor: COLORS.card || '#FFFFFF',
        borderRadius: SIZES.radius || 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border || '#E2E8F0',
        ...SHADOWS.light,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    summaryTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    badgeVerticalScroll: {
        maxHeight: 110,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        paddingBottom: 4,
    },
    badge: {
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    badgeText: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: '600',
    },
});
