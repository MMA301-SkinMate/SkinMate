import {
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/theme';
import IngredientSummaryCard from '../../components/scan/productInfoDetail/IngredientSummaryCard';
import ProductNameField from '../../components/scan/productInfoDetail/ProductNameField';
import ProductShapePicker from '../../components/scan/productInfoDetail/ProductShapePicker';
import ProductTypeChips from '../../components/scan/productInfoDetail/ProductTypeChips';
import ScreenHeader from '../../components/scan/productInfoDetail/ScreenHeader';
import AnalysisResultView from '../../components/scan/productInfoDetail/AnalysisResultView';
import { useState, useRef } from 'react';
import { collectionApi } from '../../api/collectionApi';
import { parseToISODate } from '../../utils/formatDate';

const AddProductScreen = ({ route, navigation }) => {
    const { productData, analysisResult } = route.params;
    const scrollViewRef = useRef(null);

    const [productName, setProductName] = useState(productData.productName);
    const [selectedIcon, setSelectedIcon] = useState(productData.selectedIcon);
    const [selectedType, setSelectedType] = useState(productData.selectedType);
    const [openedDate, setOpenedDate] = useState('');
    const [expiryType, setExpiryType] = useState('date');
    const [expiryDateValue, setExpiryDateValue] = useState('');
    const [paoMonths, setPaoMonths] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirmAdd = async () => {
        if (expiryType === 'months' && paoMonths.trim() !== '') {
            if (!openedDate.trim()) {
                Alert.alert(
                    'Missing information',
                    'Because you entered the expiry period in months, please enter the Opening Date to calculate accurately!'
                );
                return;
            }
        }

        const formattedOpenedDate = parseToISODate(openedDate.trim());

        let finalExpirationDate = null;
        if (expiryType === 'date' && expiryDateValue.trim()) {
            finalExpirationDate = parseToISODate(expiryDateValue.trim());
        } else if (expiryType === 'months' && openedDate.trim() && paoMonths.trim()) {
            const opened = new Date(formattedOpenedDate);
            if (!isNaN(opened.getTime())) {
                const monthsToAdd = parseInt(paoMonths) || 0;
                opened.setMonth(opened.getMonth() + monthsToAdd);
                finalExpirationDate = opened.toISOString().split('T')[0];
            }
        }


        const payload = {
            userId: "65b123456789abcdef123456", // ID test tạm thời
            productName: productName,
            productType: selectedType,
            productIcon: selectedIcon,
            ingredients: productData.ingredientList,
            analysisResult: analysisResult,
            openedDate: formattedOpenedDate,
            expiryDate: expiryType === 'date' ? parseToISODate(expiryDateValue.trim()) : null,
            paoMonths: expiryType === 'months' ? parseInt(paoMonths) || null : null,
            finalExpiryDate: finalExpirationDate,
            notes: notes.trim(),
            status: 'active'
        };
        console.log(payload)

        try {
            setLoading(true);
            const result = await collectionApi.addProduct(payload);

            if (result) {
                Alert.alert('Success', 'Added product to your collection successfully!', [
                    { text: 'OK', onPress: () => navigation.navigate('MyCollection') }
                ]);
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Unable to add product to your collection');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <ScreenHeader
                title="Product Information"
                onGoBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollForm}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >
                    <IngredientSummaryCard ingredientList={productData.ingredientList} />

                    <ProductNameField
                        value={productName}
                        onChangeText={setProductName}
                    />

                    <ProductShapePicker
                        selectedIcon={selectedIcon}
                        onSelectIcon={setSelectedIcon}
                    />

                    <ProductTypeChips
                        selectedType={selectedType}
                        onSelectType={setSelectedType}
                    />

                    <Text style={styles.label}>Expiration Type</Text>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabBtn, expiryType === 'date' && styles.activeTabBtn]}
                            onPress={() => setExpiryType('date')}
                        >
                            <Text style={[styles.tabText, expiryType === 'date' && styles.activeTabText]}>
                                Specific Date
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tabBtn, expiryType === 'months' && styles.activeTabBtn]}
                            onPress={() => setExpiryType('months')}
                        >
                            <Text style={[styles.tabText, expiryType === 'months' && styles.activeTabText]}>
                                Months after opening
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rowFields}>
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text style={styles.label}>
                                Opened Date {expiryType === 'months' && <Text style={{ color: 'red' }}>*</Text>}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="DD-MM-YYYY"
                                placeholderTextColor={COLORS.textMuted}
                                value={openedDate}
                                onChangeText={setOpenedDate}
                            />
                        </View>

                        {expiryType === 'date' ? (
                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Expiry Date</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="DD-MM-YYYY"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={expiryDateValue}
                                    onChangeText={setExpiryDateValue}
                                />
                            </View>
                        ) : (
                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                <Text style={styles.label}>PAO (Months)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 6, 12"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={paoMonths}
                                    onChangeText={setPaoMonths}
                                    keyboardType="numeric"
                                />
                            </View>
                        )}
                    </View>

                    {/* Personal Notes */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Personal notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Write your notes here..."
                            placeholderTextColor={COLORS.textMuted}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {analysisResult && <AnalysisResultView data={analysisResult} />}

                    <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleConfirmAdd}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>Save</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddProductScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollForm: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SIZES.medium,
        paddingTop: SIZES.medium,
        paddingBottom: 40,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textMain,
        marginBottom: 6,
        marginTop: 12,
    },
    tabContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background,
        alignItems: 'center',
    },
    activeTabBtn: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    tabText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    rowFields: {
        flexDirection: 'row',
        gap: 12,
    },
    fieldGroup: {
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: COLORS.textMain,
        backgroundColor: '#FFFFFF',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 20,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});