import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/theme';
import { useState, useEffect } from 'react';

const ScanResultModal = ({ ingredients, onClose }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [ingredientList, setIngredientList] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editText, setEditText] = useState('');
    const [selectedForDelete, setSelectedForDelete] = useState([]);
    const [isDeleteSelecting, setIsDeleteSelecting] = useState(false);

    const hasIngredients = ingredientList.length > 0;

    useEffect(() => {
        if (ingredients && Array.isArray(ingredients)) {
            setIngredientList(ingredients);
        } else {
            setIngredientList([]);
        }
        setIsEditing(false);
        setEditingIndex(null);
        setEditText('');
        setSelectedForDelete([]);
        setIsDeleteSelecting(false);
    }, [ingredients]);

    // Save inline edit
    const commitCurrentEdit = () => {
        if (editingIndex === null) return;
        const trimmed = editText.trim();
        if (trimmed) {
            setIngredientList(prev => {
                const copy = [...prev];
                copy[editingIndex] = trimmed;
                return copy;
            });
        } else {
            // Remove empty item
            setIngredientList(prev => prev.filter((_, idx) => idx !== editingIndex));
            setSelectedForDelete(prev =>
                prev.filter(i => i !== editingIndex).map(i => (i > editingIndex ? i - 1 : i))
            );
        }
        setEditingIndex(null);
        setEditText('');
    };

    // Tap on a badge in Edit Mode
    const handleBadgePress = (index) => {
        if (!isEditing) return;

        // If currently in delete selection mode (or has items selected for delete)
        if (isDeleteSelecting || selectedForDelete.length > 0) {
            setSelectedForDelete(prev => {
                const next = prev.includes(index)
                    ? prev.filter(i => i !== index)
                    : [...prev, index];
                if (next.length === 0) {
                    setIsDeleteSelecting(false);
                }
                return next;
            });
            return;
        }

        // Edit text mode
        if (editingIndex !== null && editingIndex !== index) {
            commitCurrentEdit();
        }
        setEditingIndex(index);
        setEditText(ingredientList[index] || '');
    };

    // Long press on a badge starts delete selection
    const handleBadgeLongPress = (index) => {
        if (!isEditing) return;
        setIsDeleteSelecting(true);
        setSelectedForDelete(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    // Add new ingredient
    const handleAddNew = () => {
        if (editingIndex !== null) {
            commitCurrentEdit();
        }
        setIsDeleteSelecting(false);
        setSelectedForDelete([]);
        const updated = [...ingredientList, ''];
        setIngredientList(updated);
        setEditingIndex(updated.length - 1);
        setEditText('');
    };

    // Press Delete button at the bottom
    const handleDeletePress = () => {
        if (selectedForDelete.length > 0) {
            // Delete marked items
            setIngredientList(prev => prev.filter((_, idx) => !selectedForDelete.includes(idx)));
            setSelectedForDelete([]);
            setIsDeleteSelecting(false);
            if (editingIndex !== null) {
                setEditingIndex(null);
                setEditText('');
            }
        } else {
            // Toggle delete selection mode
            setIsDeleteSelecting(prev => !prev);
        }
    };

    // Enter Edit Mode
    const handleStartEdit = () => {
        setIsEditing(true);
        setSelectedForDelete([]);
        setIsDeleteSelecting(false);
        setEditingIndex(null);
        setEditText('');
    };

    // Press OK button
    const handleOk = () => {
        if (isEditing) {
            commitCurrentEdit();
            setSelectedForDelete([]);
            setIsDeleteSelecting(false);
            setIsEditing(false);
        } else {
            if (onClose) {
                onClose(ingredientList);
            }
        }
    };

    return (
        <Modal
            transparent
            visible={true}
            animationType="fade"
            onRequestClose={() => {
                if (isEditing) {
                    commitCurrentEdit();
                    setIsEditing(false);
                    setSelectedForDelete([]);
                    setIsDeleteSelecting(false);
                } else if (onClose) {
                    onClose(ingredientList);
                }
            }}
            statusBarTranslucent
        >
            {/* Full-screen overlay */}
            <View style={styles.overlay}>
                {/* Backdrop: dismiss keyboard on tap outside card */}
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>

                {/* Keyboard-aware wrapper — sits above backdrop */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoid}
                    pointerEvents="box-none"
                >
                    <View style={[
                        styles.modalContainer,
                        (hasIngredients || isEditing) && styles.modalWithIngredients,
                    ]}>
                        {/* Status Icon */}
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

                        {/* Ingredients List or Empty Notice */}
                        {hasIngredients || isEditing ? (
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
                                                        onSubmitEditing={commitCurrentEdit}
                                                        onBlur={commitCurrentEdit}
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

                                    {/* '+' button at the end in Edit mode */}
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
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    Please make sure the cosmetic ingredient label is clear, well-lit, and within the camera frame.
                                </Text>
                            </View>
                        )}

                        {/* Bottom Buttons */}
                        <View style={styles.buttonRow}>
                            {isEditing ? (
                                <>
                                    <TouchableOpacity
                                        style={[
                                            styles.editBtn,
                                            { borderColor: COLORS.error },
                                            (selectedForDelete.length > 0 || isDeleteSelecting) && styles.deleteBtnActive,
                                        ]}
                                        onPress={handleDeletePress}
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
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default ScanResultModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyboardAvoid: {
        width: '84%',
        maxWidth: 330,
        alignItems: 'stretch',
        justifyContent: 'center',
    },
    modalContainer: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radiusLarge,
        padding: SIZES.medium,
        ...SHADOWS.medium,
    },
    modalWithIngredients: {
        minHeight: 450,
        maxHeight: '88%',
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