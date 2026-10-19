import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { COLORS } from '../../../constants/colors';
import { SIZES, SHADOWS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const ResultFooter = ({ isEditing, selectedForDelete, isDeleteSelecting, handleDeleteBtn, handleOk, hasIngredients, handleStartEdit }) => {
    return (
        <View style={styles.buttonRow}>
            {isEditing ? (
                <>
                    <TouchableOpacity
                        style={[
                            styles.editBtn,
                            { borderColor: COLORS.error },
                            (selectedForDelete.length > 0 || isDeleteSelecting) && styles.deleteBtnActive,
                        ]}
                        onPress={handleDeleteBtn}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={SIZES.large}
                            color={
                                selectedForDelete.length > 0 || isDeleteSelecting
                                    ? COLORS.textLight
                                    : COLORS.error
                            }
                        />
                        <Text
                            style={[
                                styles.editText,
                                selectedForDelete.length > 0 || isDeleteSelecting
                                    ? styles.deleteTextActive
                                    : styles.deleteTextInactive,
                            ]}
                        >
                            {selectedForDelete.length > 0
                                ? `Delete (${selectedForDelete.length})`
                                : 'Delete'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.okBtn}
                        onPress={handleOk}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.okText}>OK</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    {hasIngredients && (
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={handleStartEdit}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="create-outline" size={SIZES.large} color={COLORS.primary} />
                            <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.okBtn}
                        onPress={handleOk}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.okText}>
                            {hasIngredients ? 'OK' : 'Try Again'}
                        </Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    )
}

export default ResultFooter

const styles = StyleSheet.create({
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
    deleteBtnActive: {
        backgroundColor: COLORS.error,
        borderColor: COLORS.error,
    },
    deleteTextActive: {
        color: COLORS.textLight,
    },
    deleteTextInactive: {
        color: COLORS.error,
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
