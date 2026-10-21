import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/theme';

const PRODUCT_TYPES = [
    'Cleansers', 'Toners', 'Essences', 'Cream',
    'Oil', 'Serums', 'Treatments', 'Moisturizers',
    'Exfoliators', 'Sunscreens', 'Masks', 'Others',
];

// Khai báo đường dẫn đến các ảnh icon sản phẩm
const PRODUCT_ICONS = [
    { id: 'serum', image: require('../../assets/icons/serum.png') },
    { id: 'chai_to', image: require('../../assets/icons/chaito.png') },
    { id: 'hu', image: require('../../assets/icons/hu.png') },
    { id: 'tuyp_xanh', image: require('../../assets/icons/tuypxanh.png') },
    { id: 'oil', image: require('../../assets/icons/oil.png') },
    { id: 'pum', image: require('../../assets/icons/pum.png') },
    { id: 'mask', image: require('../../assets/icons/mask.png') },
    { id: 'tuyp', image: require('../../assets/icons/tuyp.png') },
];

const AddProductScreen = ({ route, navigation }) => {
    const { ingredientList = [] } = route.params || {};

    const [productName, setProductName] = useState('');
    const [selectedType, setSelectedType] = useState(0);
    const [expiryDate, setExpiryDate] = useState('');
    const [paoMonths, setPaoMonths] = useState('12');
    const [notes, setNotes] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('tube');

    const handleAnalyze = () => {
        if (!productName.trim()) {
            alert('Vui lòng nhập tên sản phẩm!');
            return;
        }

        const productPayload = {
            productName: productName.trim(),
            productType: selectedType,
            productIcon: selectedIcon,
            expiryDate,
            paoMonths,
            notes,
            ingredientList,
        };

        console.log('Dữ liệu gửi đi phân tích:', productPayload);


    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.inner}>
                        {/* Header Bar */}
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                                <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Information Product</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <ScrollView
                            style={styles.scrollForm}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Box hiển thị tóm tắt thành phần đã quét */}
                            <View style={styles.ingredientsSummaryCard}>
                                <View style={styles.summaryHeader}>
                                    <Ionicons name="flask-outline" size={20} color={COLORS.primary} />
                                    <Text style={styles.summaryTitle}>
                                        Confirmed ingredients ({ingredientList.length})
                                    </Text>
                                </View>

                                <ScrollView
                                    style={styles.badgeVerticalScroll}
                                    showsVerticalScrollIndicator={true}
                                    contentContainerStyle={styles.badgeContainer}
                                    nestedScrollEnabled={true}
                                >
                                    {ingredientList.map((item, index) => (
                                        <View key={index} style={styles.badge}>
                                            <Text style={styles.badgeText}>{item}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Field 1: Tên sản phẩm */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Product Name <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Serum La Roche-Posay Effaclar..."
                                    placeholderTextColor={COLORS.textMuted}
                                    value={productName}
                                    onChangeText={setProductName}
                                />
                            </View>

                            {/* Field: Product Shape */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Product Shape</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.shelfScrollContent}
                                >
                                    {PRODUCT_ICONS.map((item) => {
                                        const isSelected = selectedIcon === item.id;
                                        return (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={[
                                                    styles.iconCard,
                                                    isSelected && styles.iconCardSelected
                                                ]}
                                                onPress={() => setSelectedIcon(item.id)}
                                                activeOpacity={0.8}
                                            >
                                                <Image
                                                    source={item.image}
                                                    style={styles.iconImage}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                {/* Đường thẳng chiếc kệ với bóng đổ đen bên dưới */}
                                <View style={styles.shelfLine} />
                            </View>

                            {/* Field 2: Loại sản phẩm (Chips Select) */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Product Type</Text>
                                <View style={styles.typeChipsContainer}>
                                    {PRODUCT_TYPES.map((type, index) => {
                                        const isSelected = selectedType === type;
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.chip, isSelected && styles.chipSelected]}
                                                onPress={() => setSelectedType(type)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                                    {type}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Field 3 & 4: HSD & Ngày mở nắp (2 cột) */}
                            {/* <View style={styles.rowFields}>
                                <View style={[styles.fieldGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Hạn sử dụng</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="MM/YYYY"
                                        placeholderTextColor={COLORS.textMuted || '#94A3B8'}
                                        value={expiryDate}
                                        onChangeText={setExpiryDate}
                                    />
                                </View>

                                <View style={[styles.fieldGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Dùng sau mở nắp</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ví dụ: 6 tháng, 12 tháng"
                                        placeholderTextColor={COLORS.textMuted || '#94A3B8'}
                                        value={paoMonths}
                                        onChangeText={setPaoMonths}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View> */}

                            {/* Field 5: Ghi chú */}
                            {/* <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Ghi chú cá nhân</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Cảm nhận ban đầu, mua ở đâu, lưu ý..."
                                    placeholderTextColor={COLORS.textMuted || '#94A3B8'}
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View> */}
                        </ScrollView>

                        {/* Footer Submit Button */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={handleAnalyze}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="sparkles" size={20} color="#FFF" />
                                <Text style={styles.submitText}>Analyze Product Matching Skin</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>

    );
}

export default AddProductScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    inner: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.medium || 16,
        backgroundColor: COLORS.card || '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border || '#E2E8F0',
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textMain,
    },
    scrollForm: {
        flex: 1,
        padding: SIZES.medium || 16,
    },
    // Thay thế hoặc bổ sung các style này trong StyleSheet.create
    ingredientsSummaryCard: {
        backgroundColor: COLORS.card || '#FFFFFF',
        borderRadius: SIZES.radius || 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border || '#E2E8F0',
        ...SHADOWS.light,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    summaryTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    // Thêm style cho ScrollView dọc và container chứa badge
    badgeVerticalScroll: {
        maxHeight: 110, // Giới hạn chiều cao khung chứa (tương đương khoảng 3 dòng thẻ), nhiều hơn sẽ cuộn dọc
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Giúp các thẻ tự động xuống dòng
        gap: 6,           // Khoảng cách giữa các thẻ badge
        paddingBottom: 4,
    },
    badge: {
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    badgeText: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: '600',
    },
    iconScroll: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    // Thêm hoặc thay thế các style này trong StyleSheet.create
    shelfScrollContent: {
        alignItems: 'flex-end',
        paddingHorizontal: 4,
        gap: 12,
        paddingBottom: 4, // Khoảng cách nhỏ từ đáy icon xuống mặt kệ
    },
    iconCard: {
        width: 58,
        height: 58,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'transparent', // Mặc định không có viền
    },
    // Khi được chọn: Chỉ tô màu viền bao quanh, không tô nền
    iconCardSelected: {
        borderColor: COLORS.primary,
    },
    iconImage: {
        width: 36,
        height: 36,
    },
    // Đường thẳng mặt kệ và hiệu ứng đổ bóng đen xuống dưới
    shelfLine: {
        height: 1,
        backgroundColor: COLORS.border,
        width: '100%',
        marginTop: 2,
        marginBottom: 8,
        // Đổ bóng đen hắt xuống dưới cho cả iOS và Android
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, // Tăng độ đậm bóng đen cho rõ giống cái kệ
        shadowRadius: 3,
        elevation: 4,
    },
    fieldGroup: {
        marginBottom: 24,
    },
    rowFields: {
        flexDirection: 'row',
        gap: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMain,
        marginBottom: 10,
    },
    required: {
        color: COLORS.error || '#EF4444',
    },
    input: {
        backgroundColor: COLORS.card,
        height: 46,
        borderRadius: SIZES.radius,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        fontSize: 14,
        color: COLORS.textMain,
    },
    textArea: {
        height: 80,
        paddingTop: 10,
        textAlignVertical: 'top',
    },
    typeChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        backgroundColor: COLORS.card,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
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
});