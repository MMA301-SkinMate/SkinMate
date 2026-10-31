import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createCollectionProduct } from '../../api/collectionApi';

const PRODUCT_TYPES = [
    { label: 'Sữa rửa mặt', value: 'cleanser', icon: 'water-outline' },
    { label: 'Toner / Nước hoa hồng', value: 'toner', icon: 'sparkles-outline' },
    { label: 'Serum / Tinh chất', value: 'serum', icon: 'flask-outline' },
    { label: 'Kem dưỡng ẩm', value: 'cream', icon: 'leaf-outline' },
    { label: 'Kem chống nắng', value: 'sunscreen', icon: 'sunny-outline' },
    { label: 'Đặc trị / Treatment', value: 'treatment', icon: 'shield-checkmark-outline' },
];

const QuickAddToClosetModal = ({ visible, onClose, onSuccess }) => {
    const [productName, setProductName] = useState('');
    const [productType, setProductType] = useState('serum');
    const [ingredientInput, setIngredientInput] = useState('');
    const [ingredients, setIngredients] = useState(['Centella Asiatica', 'Hyaluronic Acid']);
    const [loading, setLoading] = useState(false);

    const handleAddIngredient = () => {
        if (!ingredientInput.trim()) return;
        if (!ingredients.includes(ingredientInput.trim())) {
            setIngredients([...ingredients, ingredientInput.trim()]);
        }
        setIngredientInput('');
    };

    const handleRemoveIngredient = (ing) => {
        setIngredients(ingredients.filter(i => i !== ing));
    };

    const handleSubmit = async () => {
        if (!productName.trim()) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên sản phẩm.');
            return;
        }

        setLoading(true);
        try {
            await createCollectionProduct({
                productName: productName.trim(),
                productType,
                ingredients,
                status: 'active',
                routineUsage: {
                    morning: true,
                    evening: true,
                },
            });
            Alert.alert('Thành công', `Đã thêm sản phẩm "${productName}" vào tủ đồ của bạn!`);
            setProductName('');
            onClose();
            if (onSuccess) onSuccess();
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể thêm sản phẩm vào tủ đồ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleRow}>
                            <View style={styles.iconBadge}>
                                <Ionicons name="file-tray-full-outline" size={20} color="#006c49" />
                            </View>
                            <View>
                                <Text style={styles.title}>Thêm Vào Tủ Đồ</Text>
                                <Text style={styles.subTitle}>Khởi tạo kệ sản phẩm skincare đầu tiên</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <Ionicons name="close" size={22} color="#6c7a71" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Tên sản phẩm */}
                        <Text style={styles.fieldLabel}>Tên sản phẩm *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="cube-outline" size={18} color="#6c7a71" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ví dụ: Skin1004 Centella Ampoule"
                                placeholderTextColor="#bbcabf"
                                value={productName}
                                onChangeText={setProductName}
                            />
                        </View>

                        {/* Phân loại */}
                        <Text style={styles.fieldLabel}>Phân loại mỹ phẩm</Text>
                        <View style={styles.typeWrap}>
                            {PRODUCT_TYPES.map(type => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[
                                        styles.typeChip,
                                        productType === type.value && styles.typeChipActive,
                                    ]}
                                    onPress={() => setProductType(type.value)}
                                >
                                    <Ionicons
                                        name={type.icon}
                                        size={15}
                                        color={productType === type.value ? '#ffffff' : '#006c49'}
                                    />
                                    <Text
                                        style={[
                                            styles.typeChipText,
                                            productType === type.value && styles.typeChipTextActive,
                                        ]}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Thành phần chính */}
                        <Text style={styles.fieldLabel}>Thành phần hoạt chất (nhận diện)</Text>
                        <View style={styles.addIngRow}>
                            <TextInput
                                style={styles.ingInput}
                                placeholder="Nhập hoạt chất (vd: BHA, Niacinamide...)"
                                placeholderTextColor="#bbcabf"
                                value={ingredientInput}
                                onChangeText={setIngredientInput}
                                onSubmitEditing={handleAddIngredient}
                            />
                            <TouchableOpacity style={styles.addIngBtn} onPress={handleAddIngredient}>
                                <Ionicons name="add" size={20} color="#ffffff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.tagWrap}>
                            {ingredients.map((ing, idx) => (
                                <View key={idx} style={styles.tagChip}>
                                    <Text style={styles.tagChipText}>{ing}</Text>
                                    <TouchableOpacity onPress={() => handleRemoveIngredient(ing)}>
                                        <Ionicons name="close-circle" size={16} color="#005236" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Nút Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <>
                                <Ionicons name="bookmark-outline" size={18} color="#ffffff" />
                                <Text style={styles.submitBtnText}>Lưu vào Tủ đồ</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(20, 27, 43, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#f9f9ff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 32,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#97f5cc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#141b2b',
    },
    subTitle: {
        fontSize: 12,
        color: '#6c7a71',
        marginTop: 2,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e9edff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#141b2b',
        marginTop: 14,
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#bbcabf',
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 46,
        color: '#141b2b',
        fontSize: 14,
    },
    typeWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#e9edff',
        borderWidth: 1,
        borderColor: '#bbcabf',
    },
    typeChipActive: {
        backgroundColor: '#006c49',
        borderColor: '#006c49',
    },
    typeChipText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#006c49',
    },
    typeChipTextActive: {
        color: '#ffffff',
    },
    addIngRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ingInput: {
        flex: 1,
        height: 44,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bbcabf',
        paddingHorizontal: 12,
        fontSize: 13,
        color: '#141b2b',
    },
    addIngBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#10b981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#97f5cc',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
    },
    tagChipText: {
        fontSize: 12,
        color: '#005236',
        fontWeight: '600',
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#10b981',
        borderRadius: 16,
        paddingVertical: 14,
        marginTop: 20,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default QuickAddToClosetModal;
