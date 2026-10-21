import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { PRODUCT_TYPES } from '../../../data/productTypes';

const ProductTypeChips = ({ selectedType, onSelectType }) => {
    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>Product Type</Text>
            <View style={styles.typeChipsContainer}>
                {PRODUCT_TYPES.map((type, index) => {
                    const isSelected = selectedType === type.id;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.chip, isSelected && styles.chipSelected]}
                            onPress={() => onSelectType(type.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default ProductTypeChips;

const styles = StyleSheet.create({
    fieldGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMain,
        marginBottom: 10,
    },
    typeChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        backgroundColor: COLORS.card,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
});
