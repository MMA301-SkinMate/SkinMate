import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { SIZES } from '../../../constants/theme';

const IngredientList = ({ ingredientList, editText, setEditText, saveCurrentEdit, handleBadgePress, handleBadgeLongPress, editingIndex, selectedForDelete, isEditing, handleAddNew }) => {
    return (
        <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
        >
            <View style={styles.badgeContainer}>
                {ingredientList.map((item, index) => {
                    const isCurrentlyEditing = isEditing && editingIndex === index;
                    const isMarkedForDelete = isEditing && selectedForDelete.includes(index);

                    if (isCurrentlyEditing) {
                        return (
                            <View key={index} style={[styles.badge, styles.badgeEditing]}>
                                <TextInput
                                    style={styles.badgeInput}
                                    value={editText}
                                    onChangeText={setEditText}
                                    autoFocus
                                    returnKeyType="done"
                                    onSubmitEditing={saveCurrentEdit}
                                    onBlur={saveCurrentEdit}
                                    selectTextOnFocus
                                />
                            </View>
                        );
                    }

                    if (isEditing) {
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.badge,
                                    isMarkedForDelete && styles.badgeMarkedForDelete,
                                ]}
                                onPress={() => handleBadgePress(index)}
                                onLongPress={() => handleBadgeLongPress(index)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.badgeText,
                                        isMarkedForDelete && styles.badgeTextDeleted,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <View key={index} style={styles.badge}>
                            <Text style={styles.badgeText}>{item}</Text>
                        </View>
                    );
                })}

                {/* Add button at the end */}
                {isEditing && (
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={handleAddNew}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    )
}

export default IngredientList

const styles = StyleSheet.create({
    listContainer: {
        flex: 1,
        minHeight: 200,
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
    badgeMarkedForDelete: {
        borderColor: COLORS.error,
        borderWidth: 1,
        backgroundColor: '#fef2f2',
    },
    badgeTextDeleted: {
        color: COLORS.error,
        fontWeight: '600',
    },
    badgeEditing: {
        borderColor: COLORS.primary,
        borderWidth: 1.5,
        backgroundColor: COLORS.card,
        paddingVertical: 2,
        paddingHorizontal: 6,
    },
    badgeInput: {
        fontSize: SIZES.small,
        color: COLORS.textMain,
        fontWeight: '500',
        padding: 0,
        minWidth: 50,
    },
    addBtn: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
