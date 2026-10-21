import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SIZES, SHADOWS } from '../../../constants/theme';

const SubmitFooter = ({ onSubmit, loading }) => {
    return (
        <View style={styles.footer}>
            <TouchableOpacity
                style={styles.submitBtn}
                onPress={onSubmit}
                disabled={loading}
                activeOpacity={0.8}
            >
                <Ionicons name="sparkles" size={20} color="#FFF" />
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitText}>Analyze Product Matching Skin</Text>
                )}

            </TouchableOpacity>
        </View>
    );
};

export default SubmitFooter;

const styles = StyleSheet.create({
    footer: {
        padding: SIZES.medium,
        backgroundColor: COLORS.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    submitBtn: {
        height: 50,
        backgroundColor: COLORS.primary,
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        ...SHADOWS.medium,
    },
    submitText: {
        color: COLORS.card,
        fontSize: 15,
        fontWeight: '700',
    },
});
