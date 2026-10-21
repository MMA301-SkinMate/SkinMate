import React, { useState } from 'react';
import { Alert, ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions, Modal, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Check, CheckCircle2, Leaf, Plus, Upload, X, AlertCircle, UserRound, ChevronDown, Calendar, Trash2 } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/theme';
import { useCollection } from '../../context/CollectionContext';
import { uploadCollectionProductImage } from '../../api/collectionApi';
import { getDefaultIconForType, PRODUCT_TYPES } from '../../constants/product-icons';

const { width } = Dimensions.get('window');

const formatDate = date => date ? date.toLocaleDateString('vi-VN') : 'Chưa chọn';

const EXPIRY_DURATIONS = [
  { months: 3, label: '3 tháng' },
  { months: 6, label: '6 tháng' },
  { months: 12, label: '12 tháng' },
  { months: 18, label: '18 tháng' },
  { months: 24, label: '24 tháng' },
];

const parseDate = value => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const addMonths = (date, months) => {
  const result = new Date(date);
  const originalDay = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(originalDay, lastDay));
  return result;
};

const getRoutineValue = routineUsage => {
  if (routineUsage?.morning && routineUsage?.evening) return 'Cả hai';
  if (routineUsage?.morning) return 'Sáng (AM)';
  if (routineUsage?.evening) return 'Tối (PM)';
  return 'Cả hai';
};

export default function AddProductScreen({ route, navigation }) {
  const product = route?.params?.product;
  const isEditing = Boolean(product?.id);
  const { addProductToCollection, updateProduct } = useCollection();
  const today = new Date();
  const initialOpenedDate = parseDate(product?.openedDate) || (product ? null : today);
  const initialExpiryDate = parseDate(product?.expirationDate) || new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  // Form state
  const [brand, setBrand] = useState(product?.brand || '');
  const [name, setName] = useState(product?.productName || product?.name || '');
  const [ingredients, setIngredients] = useState(Array.isArray(product?.ingredients) ? product.ingredients : []);
  const [newIngredient, setNewIngredient] = useState('');
  const [type, setType] = useState(product?.productType || product?.type || 'serum');
  const [note, setNote] = useState(product?.note || '');
  const [remaining, setRemaining] = useState(product?.remainingPercent ?? 100);
  const [isEditingPercent, setIsEditingPercent] = useState(false);
  const [percentDraft, setPercentDraft] = useState('');

  const startEditPercent = () => {
    setPercentDraft(String(remaining));
    setIsEditingPercent(true);
  };

  const commitPercentDraft = () => {
    setIsEditingPercent(false);
    const parsed = Number.parseInt(percentDraft, 10);
    if (Number.isNaN(parsed)) return;
    setRemaining(Math.min(100, Math.max(0, parsed)));
  };

  const [routine, setRoutine] = useState(getRoutineValue(product?.routineUsage));
  const [openedDate, setOpenedDate] = useState(initialOpenedDate);
  const [expiryDate, setExpiryDate] = useState(initialExpiryDate);
  const [expiryMode, setExpiryMode] = useState('date');
  const [expiryMonths, setExpiryMonths] = useState(6);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(product?.productImageUrl || null);
  const [imageChanged, setImageChanged] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showOpenedDatePicker, setShowOpenedDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [tempOpenedDate, setTempOpenedDate] = useState(initialOpenedDate || today);
  const [tempExpiryDate, setTempExpiryDate] = useState(initialExpiryDate);

  const selectedType = PRODUCT_TYPES.find(item => item.id === type) || PRODUCT_TYPES[0];

  const pickImageFromLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Cần cấp quyền', 'Vui lòng cho phép truy cập thư viện ảnh để chọn ảnh sản phẩm.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setImageChanged(true);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện.');
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần cấp quyền', 'Ứng dụng cần quyền truy cập máy ảnh để chụp ảnh sản phẩm.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setImageChanged(true);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể khởi động máy ảnh.');
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImageChanged(true);
  };

  const getPreservedProductImage = () => {
    if (!isEditing || !product.productImageUrl || selectedImage !== product.productImageUrl) {
      return null;
    }
    return product.productImageUrl;
  };

  const addIngredient = () => {
    const ingredient = newIngredient.trim();
    if (!ingredient || ingredients.includes(ingredient)) return;
    setIngredients(current => [...current, ingredient]);
    setNewIngredient('');
  };

  const handleOpenedDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setTempOpenedDate(selectedDate);
    }
  };

  const handleExpiryDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setTempExpiryDate(selectedDate);
    }
  };

  const confirmOpenedDate = () => {
    setOpenedDate(tempOpenedDate);
    if (expiryMode === 'duration') {
      setExpiryDate(addMonths(tempOpenedDate, expiryMonths));
    } else if (expiryDate < tempOpenedDate) {
      setExpiryDate(tempOpenedDate);
      setTempExpiryDate(tempOpenedDate);
    }
    setShowOpenedDatePicker(false);
  };

  const confirmExpiryDate = () => {
    setExpiryDate(tempExpiryDate);
    setShowExpiryDatePicker(false);
  };

  const cancelOpenedDatePicker = () => {
    setTempOpenedDate(openedDate || today);
    setShowOpenedDatePicker(false);
  };

  const cancelExpiryDatePicker = () => {
    setTempExpiryDate(expiryDate);
    setShowExpiryDatePicker(false);
  };

  const selectExpiryMode = mode => {
    setExpiryMode(mode);
    if (mode === 'duration' && openedDate) {
      setExpiryDate(addMonths(openedDate, expiryMonths));
    }
  };

  const selectExpiryDuration = months => {
    setExpiryMonths(months);
    if (openedDate && months > 0) {
      setExpiryDate(addMonths(openedDate, months));
    }
  };

  const changeExpiryDuration = value => {
    const months = Number.parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    selectExpiryDuration(Math.min(months, 120));
  };

  const clearOpenedDate = () => {
    if (expiryMode === 'duration') {
      Alert.alert('Không thể xoá ngày mở nắp', 'Hạn dùng theo khoảng thời gian bắt buộc phải có ngày mở nắp.');
      return;
    }
    setOpenedDate(null);
  };

  const saveProduct = async () => {
    if (!name.trim() || isSaving) {
      if (!name.trim()) Alert.alert('Thiếu tên sản phẩm', 'Vui lòng nhập tên sản phẩm.');
      return;
    }

    if (expiryMode === 'duration' && !openedDate) {
      Alert.alert('Thiếu ngày mở nắp', 'Vui lòng chọn ngày mở nắp để tính hạn dùng theo khoảng thời gian.');
      return;
    }

    if (expiryMode === 'duration' && expiryMonths < 1) {
      Alert.alert('Khoảng thời gian không hợp lệ', 'Vui lòng nhập khoảng thời gian từ 1 đến 120 tháng.');
      return;
    }

    if (expiryMode === 'date' && openedDate && expiryDate < openedDate) {
      Alert.alert('Ngày hết hạn không hợp lệ', 'Ngày hết hạn phải bằng hoặc sau ngày mở nắp.');
      return;
    }

    setIsSaving(true);
    let productImageUrl = getPreservedProductImage();

    try {
      if (selectedImage && imageChanged) {
        try {
          const uploadRes = await uploadCollectionProductImage(selectedImage);
          productImageUrl = uploadRes?.imageUrl || null;
        } catch (uploadErr) {
          console.warn('Lỗi tải ảnh lên:', uploadErr);
          setIsSaving(false);
          Alert.alert(
            'Lỗi tải ảnh',
            'Không thể tải ảnh sản phẩm lên máy chủ. Bạn có muốn tiếp tục lưu sản phẩm mà không có ảnh không?',
            [
              { text: 'Huỷ', style: 'cancel' },
              {
                text: getPreservedProductImage() ? 'Lưu với ảnh cũ' : 'Lưu không kèm ảnh',
                onPress: async () => {
                  setIsSaving(true);
                  try {
                    await submitProduct(isEditing ? product.productImageUrl || null : null);
                  } catch (e) {
                    Alert.alert('Không thể lưu sản phẩm', e.message || 'Vui lòng thử lại.');
                    setIsSaving(false);
                  }
                },
              },
            ]
          );
          return;
        }
      }

      if (!selectedImage && imageChanged) {
        productImageUrl = null;
      }

      await submitProduct(productImageUrl);
    } catch (error) {
      Alert.alert('Không thể lưu sản phẩm', error.message || 'Vui lòng thử lại.');
      setIsSaving(false);
    }
  };

  const submitProduct = async (productImageUrl) => {
    const expirationDate = expiryMode === 'duration'
      ? addMonths(openedDate, expiryMonths)
      : expiryDate;
    const payload = {
      productName: name.trim(),
      brand: brand.trim() || null,
      productType: type,
      productIcon: getDefaultIconForType(type),
      productImageUrl,
      ingredients,
      openedDate: openedDate ? openedDate.toISOString() : null,
      expirationDate: expirationDate ? expirationDate.toISOString() : null,
      paoDays: expiryMode === 'duration' ? expiryMonths * 30 : null,
      remainingPercent: remaining,
      note: note.trim() || null,
      routineUsage: {
        morning: routine === 'Sáng (AM)' || routine === 'Cả hai',
        evening: routine === 'Tối (PM)' || routine === 'Cả hai',
        step: product?.routineUsage?.step || null,
      },
    };

    if (isEditing) {
      await updateProduct(product.id, payload);
    } else {
      await addProductToCollection({ ...payload, status: 'active' });
    }
    setIsSaving(false);
    navigation.navigate('MainTabs', { screen: 'Collection' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}</Text>
        <View style={styles.profile}>
          <UserRound size={19} color="#FFFFFF" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Product Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ảnh sản phẩm</Text>

          {selectedImage ? (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} resizeMode="cover" />
              <View style={styles.imageBadge}>
                <Check size={14} color="#FFFFFF" strokeWidth={3} />
                <Text style={styles.imageBadgeText}>Đã chụp ảnh</Text>
              </View>
              <View style={styles.imageActionRow}>
                <TouchableOpacity
                  style={styles.imageActionBtn}
                  onPress={takePhotoWithCamera}
                  activeOpacity={0.8}
                >
                  <Camera size={16} color={Colors.primaryDark} />
                  <Text style={styles.imageActionBtnText}>Chụp lại</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imageActionBtn}
                  onPress={pickImageFromLibrary}
                  activeOpacity={0.8}
                >
                  <Upload size={16} color={Colors.primaryDark} />
                  <Text style={styles.imageActionBtnText}>Đổi ảnh khác</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.imageActionBtn, styles.imageDeleteBtn]}
                  onPress={removeSelectedImage}
                  activeOpacity={0.8}
                >
                  <Trash2 size={16} color="#DC2626" />
                  <Text style={[styles.imageActionBtnText, { color: '#DC2626' }]}>Xoá</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.imageSection}>
              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={takePhotoWithCamera}
                  activeOpacity={0.8}
                >
                  <View style={styles.imageButtonIconWrapper}>
                    <Camera size={36} color={Colors.primary} strokeWidth={1.8} />
                  </View>
                  <Text style={styles.imageButtonLabel}>Chụp ảnh</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={pickImageFromLibrary}
                  activeOpacity={0.8}
                >
                  <View style={styles.imageButtonIconWrapper}>
                    <Upload size={36} color={Colors.primary} strokeWidth={1.8} />
                  </View>
                  <Text style={styles.imageButtonLabel}>Tải ảnh lên</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.imageHintText}>Chụp hoặc chọn ảnh sản phẩm thật để lưu vào tủ đồ</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Thương hiệu</Text>
            <TextInput
              style={styles.input}
              value={brand}
              onChangeText={setBrand}
              placeholder="VD: The Ordinary, Cetaphil..."
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tên sản phẩm <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nhập tên sản phẩm"
              placeholderTextColor={Colors.textSecondary}
            />
            {!name.trim() && <Text style={styles.errorText}>Bắt buộc</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Loại sản phẩm</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowTypeModal(true)}
            >
              <Text style={styles.selectButtonText}>{selectedType.label}</Text>
              <ChevronDown size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thời gian sử dụng</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ngày mở nắp</Text>
            <View style={styles.dateActionRow}>
              <TouchableOpacity
                style={[styles.dateButton, styles.dateButtonGrow]}
                onPress={() => {
                  setTempOpenedDate(openedDate || today);
                  setShowOpenedDatePicker(true);
                }}
              >
                <Calendar size={18} color={Colors.primary} />
                <Text style={styles.dateButtonText}>{formatDate(openedDate)}</Text>
              </TouchableOpacity>
              {openedDate ? (
                <TouchableOpacity style={styles.clearDateButton} onPress={clearOpenedDate}>
                  <X size={18} color={Colors.danger} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cách tính ngày hết hạn</Text>
            <View style={styles.expiryModeRow}>
              <TouchableOpacity
                style={[styles.expiryModeButton, expiryMode === 'date' && styles.expiryModeButtonActive]}
                onPress={() => selectExpiryMode('date')}
              >
                <Text style={[styles.expiryModeText, expiryMode === 'date' && styles.expiryModeTextActive]}>Ngày cụ thể</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.expiryModeButton, expiryMode === 'duration' && styles.expiryModeButtonActive]}
                onPress={() => selectExpiryMode('duration')}
              >
                <Text style={[styles.expiryModeText, expiryMode === 'duration' && styles.expiryModeTextActive]}>Sau khi mở nắp</Text>
              </TouchableOpacity>
            </View>
          </View>

          {expiryMode === 'date' ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ngày hết hạn</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowExpiryDatePicker(true)}
              >
                <Calendar size={18} color={Colors.primary} />
                <Text style={styles.dateButtonText}>{formatDate(expiryDate)}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Khoảng thời gian sử dụng <Text style={styles.required}>*</Text></Text>
              <View style={styles.durationGrid}>
                {EXPIRY_DURATIONS.map(item => (
                  <TouchableOpacity
                    key={item.months}
                    style={[styles.durationButton, expiryMonths === item.months && styles.durationButtonActive]}
                    onPress={() => selectExpiryDuration(item.months)}
                  >
                    <Text style={[styles.durationButtonText, expiryMonths === item.months && styles.durationButtonTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.customDurationRow}>
                <TextInput
                  style={styles.customDurationInput}
                  value={expiryMonths ? String(expiryMonths) : ''}
                  onChangeText={changeExpiryDuration}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="Số tháng"
                  placeholderTextColor={Colors.textSecondary}
                />
                <Text style={styles.customDurationUnit}>tháng sau ngày mở nắp</Text>
              </View>
              {!openedDate ? (
                <Text style={styles.errorText}>Phải chọn ngày mở nắp để tính ngày hết hạn.</Text>
              ) : (
                <Text style={styles.expiryPreviewText}>Ngày hết hạn dự kiến: {formatDate(addMonths(openedDate, expiryMonths))}</Text>
              )}
            </View>
          )}
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thành phần sản phẩm</Text>

          {ingredients.length > 0 && (
            <View style={styles.ingredientsList}>
              {ingredients.map(item => (
                <View key={item} style={styles.ingredientItem}>
                  <Leaf size={16} color={Colors.primary} />
                  <Text style={styles.ingredientItemText}>{item}</Text>
                  <TouchableOpacity
                    onPress={() => setIngredients(current => current.filter(value => value !== item))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {ingredients.length === 0 && (
            <View style={styles.emptyState}>
              <AlertCircle size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>Chưa có thành phần nào</Text>
            </View>
          )}

          <View style={styles.ingredientInputGroup}>
            <TextInput
              style={styles.ingredientInput}
              value={newIngredient}
              onChangeText={setNewIngredient}
              onSubmitEditing={addIngredient}
              placeholder="Nhập thành phần"
              placeholderTextColor={Colors.textSecondary}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addIngredient}
              disabled={!newIngredient.trim()}
            >
              <Plus size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Usage Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết sử dụng</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Lượng còn lại</Text>
            {isEditingPercent ? (
              <View style={styles.percentEditRow}>
                <TextInput
                  style={[styles.percentDisplay, styles.percentInput]}
                  value={percentDraft}
                  onChangeText={text => setPercentDraft(text.replace(/[^0-9]/g, '').slice(0, 3))}
                  onBlur={commitPercentDraft}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  maxLength={3}
                  autoFocus
                  selectTextOnFocus
                  accessibilityLabel="Nhập phần trăm dung tích còn lại"
                />
                <Text style={styles.percentDisplay}>%</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.percentDisplayTouch}
                onPress={startEditPercent}
                accessibilityRole="button"
                accessibilityLabel={`Lượng còn lại ${remaining}%, chạm để nhập`}
              >
                <Text style={styles.percentDisplay}>{remaining}%</Text>
              </TouchableOpacity>
            )}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${remaining}%` }]} />
            </View>
            <View style={styles.percentGrid}>
              {[25, 50, 75, 100].map(value => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.percentButton,
                    remaining === value && styles.percentButtonActive
                  ]}
                  onPress={() => setRemaining(value)}
                >
                  <Text style={[
                    styles.percentButtonText,
                    remaining === value && styles.percentButtonTextActive
                  ]}>
                    {value}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Sử dụng khi nào</Text>
            <View style={styles.routineGrid}>
              {['Sáng (AM)', 'Tối (PM)', 'Cả hai'].map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.routineButton,
                    routine === item && styles.routineButtonActive
                  ]}
                  onPress={() => setRoutine(item)}
                >
                  <Text style={[
                    styles.routineButtonText,
                    routine === item && styles.routineButtonTextActive
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ghi chú cá nhân</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="VD: Bảo quản trong tủ lạnh..."
              placeholderTextColor={Colors.textSecondary}
              multiline
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={saveProduct}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Check size={20} color="#FFFFFF" />
          )}
          <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>
            {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Lưu sản phẩm'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Type Modal */}
      <Modal
        visible={showTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn loại sản phẩm</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={PRODUCT_TYPES}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item.id === type && styles.modalItemActive
                  ]}
                  onPress={() => {
                    setType(item.id);
                    setShowTypeModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    item.id === type && styles.modalItemTextActive
                  ]}>
                    {item.label}
                  </Text>
                  {item.id === type && (
                    <CheckCircle2 size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 380 }}
            />
          </View>
        </View>
      </Modal>

      {/* Date Pickers Modal */}
      <Modal
        visible={showOpenedDatePicker}
        transparent
        animationType="fade"
        onRequestClose={cancelOpenedDatePicker}
      >
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Chọn ngày mở nắp</Text>
            </View>
            <DateTimePicker
              value={tempOpenedDate}
              mode="date"
              display="spinner"
              onChange={handleOpenedDateChange}
              maximumDate={new Date()}
              textColor={Colors.primaryDark}
            />
            <View style={styles.datePickerFooter}>
              <TouchableOpacity
                style={[styles.datePickerButton, styles.datePickerButtonCancel]}
                onPress={cancelOpenedDatePicker}
              >
                <Text style={styles.datePickerButtonCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.datePickerButton, styles.datePickerButtonOK]}
                onPress={confirmOpenedDate}
              >
                <Text style={styles.datePickerButtonOKText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showExpiryDatePicker}
        transparent
        animationType="fade"
        onRequestClose={cancelExpiryDatePicker}
      >
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Chọn ngày hết hạn</Text>
            </View>
            <DateTimePicker
              value={tempExpiryDate}
              mode="date"
              display="spinner"
              onChange={handleExpiryDateChange}
              minimumDate={openedDate || undefined}
              textColor={Colors.primaryDark}
            />
            <View style={styles.datePickerFooter}>
              <TouchableOpacity
                style={[styles.datePickerButton, styles.datePickerButtonCancel]}
                onPress={cancelExpiryDatePicker}
              >
                <Text style={styles.datePickerButtonCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.datePickerButton, styles.datePickerButtonOK]}
                onPress={confirmExpiryDate}
              >
                <Text style={styles.datePickerButtonOKText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFF'
  },
  header: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F7'
  },
  headerTitle: {
    flex: 1,
    color: '#111629',
    fontSize: 18,
    fontWeight: '600'
  },
  profile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center'
  },

  content: {
    padding: 16,
    paddingBottom: 100,
    gap: 24
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111629'
  },

  // Image Section
  imageSection: {
    minHeight: 180,
    backgroundColor: '#F0F4FF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#DDE5FD',
    borderStyle: 'dashed',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 32,
    justifyContent: 'center',
  },
  imageButton: {
    alignItems: 'center',
    gap: 10,
  },
  imageButtonIconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A3BA8',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  imageButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  imageHintText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 14,
    textAlign: 'center',
  },
  imagePreviewWrapper: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    backgroundColor: '#F1F5F9',
  },
  imageBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  imageActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  imageActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F0F4FF',
  },
  imageDeleteBtn: {
    backgroundColor: '#FEE2E2',
  },
  imageActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryDark,
  },

  // Form
  formGroup: {
    gap: 8
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111629'
  },
  required: {
    color: '#FF6B6B'
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F0F2FF',
    color: '#111629',
    fontSize: 14
  },
  noteInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingVertical: 12
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4
  },
  selectButton: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F0F2FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  selectButtonText: {
    fontSize: 14,
    color: '#111629',
    fontWeight: '500'
  },
  dateButton: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F0F2FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  dateButtonText: {
    fontSize: 14,
    color: Colors.primaryDark,
    fontWeight: '500'
  },
  dateActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateButtonGrow: {
    flex: 1,
  },
  clearDateButton: {
    width: 48,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiryModeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  expiryModeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F2FF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expiryModeButtonActive: {
    backgroundColor: '#9BEFD2',
    borderColor: Colors.primaryDark,
  },
  expiryModeText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  expiryModeTextActive: {
    color: Colors.primaryDark,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    minWidth: 74,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F0F2FF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: '#9BEFD2',
    borderColor: Colors.primaryDark,
  },
  durationButtonText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  durationButtonTextActive: {
    color: Colors.primaryDark,
  },
  customDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customDurationInput: {
    width: 92,
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F0F2FF',
    color: '#111629',
    fontSize: 14,
    textAlign: 'center',
  },
  customDurationUnit: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  expiryPreviewText: {
    color: Colors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },

  // Ingredients
  ingredientsList: {
    gap: 8
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F0F2FF',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary
  },
  ingredientItemText: {
    flex: 1,
    fontSize: 13,
    color: '#111629'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8
  },
  emptyStateText: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  ingredientInputGroup: {
    flexDirection: 'row',
    gap: 8
  },
  ingredientInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F0F2FF',
    color: '#111629',
    fontSize: 14
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Percent & Routine
  percentDisplay: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8
  },
  percentDisplayTouch: {
    alignSelf: 'flex-start'
  },
  percentEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start'
  },
  percentInput: {
    minWidth: 48,
    paddingVertical: 0,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DCE2F6',
    overflow: 'hidden',
    marginBottom: 12
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.primary
  },
  percentGrid: {
    flexDirection: 'row',
    gap: 8
  },
  percentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F0F2FF',
    alignItems: 'center'
  },
  percentButtonActive: {
    backgroundColor: '#9BEFD2'
  },
  percentButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary
  },
  percentButtonTextActive: {
    color: Colors.primaryDark
  },
  routineGrid: {
    flexDirection: 'row',
    gap: 8
  },
  routineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F0F2FF',
    alignItems: 'center'
  },
  routineButtonActive: {
    backgroundColor: '#9BEFD2'
  },
  routineButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary
  },
  routineButtonTextActive: {
    color: Colors.primaryDark
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF0F7'
  },
  saveButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.primary
  },
  saveButtonDisabled: {
    opacity: 0.5
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF'
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F7'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111629'
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2FF'
  },
  modalItemActive: {
    backgroundColor: '#F9FFFD'
  },
  modalItemText: {
    fontSize: 14,
    color: Colors.textSecondary
  },
  modalItemTextActive: {
    color: Colors.primary,
    fontWeight: '500'
  },

  // DateTimePicker
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  datePickerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    maxWidth: 320,
  },
  datePickerHeader: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F0F2FF',
    alignItems: 'center',
  },
  datePickerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  datePickerFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F7',
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerButtonCancel: {
    backgroundColor: '#F0F2FF',
  },
  datePickerButtonCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  datePickerButtonOK: {
    backgroundColor: Colors.primary,
  },
  datePickerButtonOKText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
