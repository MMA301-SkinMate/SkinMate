import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { SIZES } from '../../../constants/theme';

const ProductNameField = ({ value, onChangeText }) => {
    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>Product Name <Text style={styles.required}>*</Text></Text>
            <TextInput
                style={styles.input}
                placeholder="Serum La Roche-Posay Effaclar..."
                placeholderTextColor={COLORS.textMuted}
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
};

export default ProductNameField;

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
    required: {
        color: COLORS.error,
    },
    input: {
        backgroundColor: COLORS.card,
        height: 46,
        borderRadius: SIZES.radius,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        fontSize: 14,
        color: COLORS.textMain,
    },
});
