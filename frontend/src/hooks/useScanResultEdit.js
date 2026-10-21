import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

const useScanResultEdit = (ingredients, onClose) => {
    const navigation = useNavigation();
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
        resetEditState();
    }, [ingredients]);

    const resetEditState = () => {
        setIsEditing(false);
        setEditingIndex(null);
        setEditText('');
        setSelectedForDelete([]);
        setIsDeleteSelecting(false);
    };

    // Save inline edit
    const saveCurrentEdit = () => {
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
            saveCurrentEdit();
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
            saveCurrentEdit();
        }
        setIsDeleteSelecting(false);
        setSelectedForDelete([]);
        const updated = [...ingredientList, ''];
        setIngredientList(updated);
        setEditingIndex(updated.length - 1);
        setEditText('');
    };

    // Press Delete button at the bottom
    const handleDeleteBtn = () => {
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
            saveCurrentEdit();
            resetEditState();
        } else {
            if (hasIngredients) {
                if (onClose) {
                    onClose(ingredientList);
                }
                navigation.navigate('ProductInfoDetail', { ingredientList: ingredientList });
            } else {
                if (onClose) {
                    onClose([]);
                }
            }
        }
    };

    return {
        isEditing,
        ingredientList,
        editingIndex,
        editText,
        setEditText,
        selectedForDelete,
        isDeleteSelecting,
        hasIngredients,
        saveCurrentEdit,
        handleBadgePress,
        handleBadgeLongPress,
        handleAddNew,
        handleDeleteBtn,
        handleStartEdit,
        handleOk,
        resetEditState,
    };
}

export default useScanResultEdit;