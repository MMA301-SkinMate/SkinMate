import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SIZES, SHADOWS } from '../../../constants/theme';
import { useNavigation } from '@react-navigation/native';

const SubmitFooter = ({ onSubmit, loading, analysisResult, productData, handleSaveDraft }) => {
    const navigation = useNavigation();
    return (
        <View style={styles.footer}>
            {!analysisResult ? (
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

                </TouchableOpacity>)
                : (
                    <View style={styles.actionRow}>

                        <TouchableOpacity
                            style={styles.draftBtn}
                            onPress={handleSaveDraft}
                        >
                            <Text style={styles.draftBtnText}>Save Draft</Text>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() => navigation.navigate('AddProduct', { productData, analysisResult })}
                        >
                            <Text style={styles.btnText}>Add to My Collection</Text>
                        </TouchableOpacity>
                    </View>
                )}

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
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    draftBtn: {
        flex: 1,
        backgroundColor: COLORS.secondary,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 14,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    draftBtnText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    primaryBtn: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: 14,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        color: COLORS.card,
        fontWeight: 'bold',
        fontSize: 14,
    },
});
