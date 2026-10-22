import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { SIZES } from '../../../constants/theme';

const ResultHeader = ({ isEditing, hasIngredients, selectedForDelete, isDeleteSelecting, ingredientList }) => {
    return (
        <>
            <View style={styles.iconHeader}>
                <Ionicons
                    name={
                        isEditing
                            ? 'create'
                            : hasIngredients
                                ? 'checkmark-circle'
                                : 'alert-circle'
                    }
                    size={32}
                    color={
                        isEditing
                            ? COLORS.primary
                            : hasIngredients
                                ? COLORS.success
                                : COLORS.warning
                    }
                />
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>
                {isEditing
                    ? 'Edit Ingredients'
                    : hasIngredients
                        ? 'Scan Successful'
                        : 'Scan Completed'}
            </Text>
            <Text style={styles.subtitle}>
                {isEditing
                    ? selectedForDelete.length > 0 || isDeleteSelecting
                        ? `Tap items to delete (${selectedForDelete.length} selected)`
                        : 'Tap item to edit, or (+) to add'
                    : hasIngredients
                        ? `Found ${ingredientList.length} ingredients:`
                        : 'No cosmetic ingredients detected'}
            </Text>
        </>
    )
}

export default ResultHeader

const styles = StyleSheet.create({
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
})