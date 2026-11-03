import {
  View,
  Text,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Pressable,
  Keyboard,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { SHADOWS, SIZES } from '../../constants/theme';
import { useScanResultEdit } from '../../hooks/useScanResultEdit';
import IngredientList from './resultModal/IngredientList';
import ResultFooter from './resultModal/ResultFooter';
import ResultHeader from './resultModal/ResultHeader';
import { OverlayBackdrop } from '../common/OverlayBackdrop';
import { useOverlayBlurTarget } from '../common/CommonOverlayProvider';

const ScanResultModal = ({ ingredients, onClose }) => {
  const blurTarget = useOverlayBlurTarget();
  const {
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
  } = useScanResultEdit(ingredients, onClose);

  return (
    <Modal
      transparent
      visible
      animationType="fade"
      onRequestClose={() => {
        if (isEditing) {
          saveCurrentEdit();
          resetEditState();
        } else {
          onClose?.(ingredientList);
        }
      }}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable accessible={false} onPress={Keyboard.dismiss} style={StyleSheet.absoluteFill}>
          <OverlayBackdrop blurTarget={blurTarget} />
        </Pressable>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
          pointerEvents="box-none"
        >
          <View style={[styles.modalContainer, (hasIngredients || isEditing) && styles.modalWithIngredients]}>
            <ResultHeader
              isEditing={isEditing}
              hasIngredients={hasIngredients}
              selectedForDelete={selectedForDelete}
              isDeleteSelecting={isDeleteSelecting}
              ingredientList={ingredientList}
            />
            {hasIngredients || isEditing ? (
              <IngredientList
                ingredientList={ingredientList}
                editText={editText}
                setEditText={setEditText}
                saveCurrentEdit={saveCurrentEdit}
                handleBadgePress={handleBadgePress}
                handleBadgeLongPress={handleBadgeLongPress}
                editingIndex={editingIndex}
                selectedForDelete={selectedForDelete}
                isEditing={isEditing}
                handleAddNew={handleAddNew}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Please make sure the cosmetic ingredient label is clear, well-lit, and within the camera frame.
                </Text>
              </View>
            )}
            <ResultFooter
              isEditing={isEditing}
              selectedForDelete={selectedForDelete}
              isDeleteSelecting={isDeleteSelecting}
              handleDeleteBtn={handleDeleteBtn}
              handleOk={handleOk}
              hasIngredients={hasIngredients}
              handleStartEdit={handleStartEdit}
            />
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
});
