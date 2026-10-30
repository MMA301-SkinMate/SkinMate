import { Ionicons } from '@expo/vector-icons';
import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-aware-scroll-view';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect, useRef } from 'react';
import { COLORS } from '../../../constants/colors';
import { SIZES } from '../../../constants/theme';

const IngredientList = ({
  ingredientList,
  editText,
  setEditText,
  saveCurrentEdit,
  handleBadgePress,
  handleBadgeLongPress,
  editingIndex,
  selectedForDelete,
  isEditing,
  handleAddNew,
}) => {
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (editingIndex !== null) {
      const timeout = setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [editingIndex]);

  return (
    <KeyboardAwareScrollView
      ref={scrollViewRef}
      style={styles.listContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      nestedScrollEnabled
      enableOnAndroid
      enableAutomaticScroll
      extraScrollHeight={Platform.OS === 'ios' ? 40 : 60}
      extraHeight={Platform.OS === 'ios' ? 40 : 60}
      enableResetScrollToCoords
    >
      <Pressable
        onPress={() => {
          if (isEditing) saveCurrentEdit();
          Keyboard.dismiss();
        }}
        style={styles.badgeContainer}
      >
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
                style={[styles.badge, isMarkedForDelete && styles.badgeMarkedForDelete]}
                onPress={() => handleBadgePress(index)}
                onLongPress={() => handleBadgeLongPress(index)}
                activeOpacity={0.7}
              >
                <Text style={[styles.badgeText, isMarkedForDelete && styles.badgeTextDeleted]}>
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
        {isEditing && (
          <TouchableOpacity style={styles.addBtn} onPress={handleAddNew} activeOpacity={0.7}>
            <Ionicons name="add" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </Pressable>
    </KeyboardAwareScrollView>
  );
};

export default IngredientList;

const styles = StyleSheet.create({
  listContainer: { flex: 1, minHeight: 100, maxHeight: 360, marginBottom: SIZES.base },
  scrollContent: { paddingVertical: 2, flexGrow: 1 },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.base - 2, flex: 1 },
  badge: { backgroundColor: COLORS.surface, paddingHorizontal: 5, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.borderDark },
  badgeEditing: { borderColor: COLORS.primary, borderWidth: 1.5, backgroundColor: COLORS.card, paddingVertical: 2, paddingHorizontal: 6 },
  badgeMarkedForDelete: { borderColor: COLORS.error, borderWidth: 1, backgroundColor: '#fef2f2' },
  badgeText: { color: COLORS.textMain, fontSize: SIZES.small, fontWeight: '500' },
  badgeTextDeleted: { color: COLORS.error, fontWeight: '600' },
  badgeInput: { minWidth: 50, padding: 0, color: COLORS.textMain, fontSize: SIZES.small, fontWeight: '500' },
  addBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed', backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
});
