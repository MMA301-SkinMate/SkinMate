import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/theme';

const ScanResultModal = ({ ingredients, onEdit, onClose }) => {

    const ingredientList = Array.isArray(ingredients) ? ingredients : [];
    const hasIngredients = ingredientList.length > 0;

    return (
        <Modal
            transparent
            visible={true}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, hasIngredients && styles.modalWithIngredients]}>
                    {/* Status Icon */}
                    <View style={styles.iconHeader}>
                        <Ionicons
                            name={hasIngredients ? 'checkmark-circle' : 'alert-circle'}
                            size={32}
                            color={hasIngredients ? COLORS.success : COLORS.warning}
                        />
                    </View>

                    {/* Title & Subtitle */}
                    <Text style={styles.title}>
                        {hasIngredients ? 'Scan Successful' : 'Scan Completed'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {hasIngredients
                            ? `Found ${ingredientList.length} ingredients:`
                            : 'No cosmetic ingredients detected'}
                    </Text>

                    {/* Ingredients List or Empty Notice */}
                    {hasIngredients ? (
                        <ScrollView
                            style={styles.listContainer}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={true}
                        >
                            <View style={styles.badgeContainer}>
                                {ingredientList.map((item, index) => (
                                    <View key={index} style={styles.badge}>
                                        <Text style={styles.badgeText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Please make sure the cosmetic ingredient label is clear, well-lit, and within the camera frame.
                            </Text>
                        </View>
                    )}

                    {/* Bottom Buttons */}
                    <View style={styles.buttonRow}>
                        {hasIngredients && (
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={onEdit}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="create-outline" size={SIZES.large} color={COLORS.primary} />
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.okBtn}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.okText}>
                                {hasIngredients ? 'OK' : 'Try Again'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default ScanResultModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.radiusLarge,
    },
    modalContainer: {
        width: '84%',
        maxWidth: 330,
        maxHeight: '88%',
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radiusLarge,
        padding: SIZES.medium,
        ...SHADOWS.medium,
    },
    modalWithIngredients: {
        minHeight: 450,
        justifyContent: 'space-between',
    },
    iconHeader: {
        alignItems: 'center',
        marginBottom: SIZES.base,
    },
    title: {
        fontSize: SIZES.large,
        fontWeight: '800',
        color: COLORS.textMain,
        textAlign: 'center',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 12,
    },
    listContainer: {
        flex: 1,
        minHeight: 100,
        maxHeight: 460,
        marginBottom: SIZES.base,
    },
    scrollContent: {
        paddingVertical: 2,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SIZES.base - 2,
    },
    badge: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: 5,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.borderDark,
    },
    badgeText: {
        fontSize: SIZES.small,
        color: COLORS.textMain,
        fontWeight: '500',
    },
    emptyContainer: {
        marginBottom: SIZES.base,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 18,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: SIZES.base,
        marginTop: SIZES.base,
    },
    editBtn: {
        height: 38,
        paddingHorizontal: 12,
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.extraLarge,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
        gap: 4,
    },
    editText: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.primary,
    },
    okBtn: {
        height: 38,
        paddingHorizontal: 14,
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.extraLarge,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.light,
    },
    okText: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.textLight,
    },
});