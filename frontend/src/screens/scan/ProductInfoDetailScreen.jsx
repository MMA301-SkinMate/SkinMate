import {
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/theme';
import IngredientSummaryCard from '../../components/scan/productInfoDetail/IngredientSummaryCard';
import ProductNameField from '../../components/scan/productInfoDetail/ProductNameField';
import ProductShapePicker from '../../components/scan/productInfoDetail/ProductShapePicker';
import ProductTypeChips from '../../components/scan/productInfoDetail/ProductTypeChips';
import ScreenHeader from '../../components/scan/productInfoDetail/ScreenHeader';
import SubmitFooter from '../../components/scan/productInfoDetail/SubmitFooter';
import AnalysisResultView from '../../components/scan/productInfoDetail/AnalysisResultView';
import useAnalyzeProduct from '../../hooks/useAnalyzeProduct';
import { useState, useRef } from 'react';
import { collectionApi } from '../../api/collectionApi';

const ProductInfoDetailScreen = ({ route, navigation }) => {
    const { ingredientList = [] } = route.params || {};

    const [productName, setProductName] = useState('');
    const [selectedType, setSelectedType] = useState('serum');
    const [selectedIcon, setSelectedIcon] = useState('serum');

    const [analysisResult, setAnalysisResult] = useState(null);
    const { analyze, loading } = useAnalyzeProduct();
    const scrollViewRef = useRef(null);

    const handleAnalyze = async () => {
        if (!productName.trim()) {
            Alert.alert('Notice', 'Product Name is required!');
            return;
        }

        const productPayload = {
            productName: productName.trim(),
            productType: selectedType,
            ingredientList,
        };

        try {
            // const result = await analyze(productPayload);

            const result = {
                "data": {
                    "baseScore": 80,
                    "conflictResolution":
                    {
                        "details": "Tủ đồ hiện tại của bạn chưa có sản phẩm nào, do đó hoàn toàn không có xung đột hoạt chất. Toner này rất lành tính và dễ dàng tích hợp vào chu trình chăm sóc da cơ bản.",
                        "hasConflict": false
                    },
                    "contextualScore": 100,
                    "futurePlan": {
                        "frequency": "Sử dụng hàng ngày, 2 lần/ngày (Sáng và Tối)",
                        "notes": "Nên vỗ nhẹ để toner thẩm thấu tốt hơn vào da. Ban ngày nhớ sử dụng kem chống nắng có phổ rộng để bảo vệ da toàn diện.",
                        "timing": "Sáng và Tối, ngay sau bước làm sạch (tẩy trang và sữa rửa mặt)"
                    },
                    "pairingRecommendation": {
                        "advice": "Vì da đang ở trạng thái bình thường, bạn nên kết hợp toner này với các sản phẩm cấp ẩm sâu chứa Hyaluronic Acid hoặc kem dưỡng chứa Ceramide để duy trì làn da khỏe mạnh, căng bóng.",
                        "ingredientsToAdd": ["Hyaluronic Acid", "Ceramides", "Peptides"],
                        "ingredientsToAvoid": ["Retinoids nồng độ cao (nếu da chưa quen)", "AHA/BHA liều lượng quá mạnh dùng cùng lúc"],
                        "matchedProductInCloset": null
                    },
                    "verdict": {
                        "badgeLevel": "success",
                        "text": "Sản phẩm toner Emmié by Happy Skin rất phù hợp với làn da thường và tình trạng da ổn định hiện tại. Công thức giàu dưỡng chất lên men và Niacinamide giúp cân bằng độ ẩm, làm sáng và củng cố hàng rào bảo vệ da hiệu quả."
                    }
                }
            }

            if (result && result.data) {
                setAnalysisResult(result.data);
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 300);
            }
        } catch (err) {
            Alert.alert('Analysis Failed', err.message || 'Unable to analyze product.');
        }
    };

    const handleSaveDraft = async () => {
        try {
            const draftPayload = {
                userId: "65b123456789abcdef123456", // (Tạm thời cho test khi chưa có Auth)
                productName: productName.trim(),
                productType: selectedType,
                productIcon: selectedIcon,
                ingredients: ingredientList,
                status: 'draft',
                analysisResult: analysisResult
            };

            const result = await collectionApi.saveDraft(draftPayload);

            if (result) {
                Alert.alert('Success', 'Save product to draft!', [
                    { text: 'OK', onPress: () => navigation.navigate('ScanTab') }
                ]);
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Unable to save product to draft!');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <ScreenHeader
                title="Information Product"
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
                    <IngredientSummaryCard ingredientList={ingredientList} />

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

                    {Boolean(analysisResult && (analysisResult.baseScore !== undefined || analysisResult.contextualScore !== undefined)) && (
                        <AnalysisResultView data={analysisResult} />
                    )}
                </ScrollView>

                <SubmitFooter
                    onSubmit={handleAnalyze}
                    loading={loading}
                    analysisResult={analysisResult}
                    handleSaveDraft={handleSaveDraft}
                    productData={{ productName, selectedType, selectedIcon, ingredientList }}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProductInfoDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardAvoid: {
        flex: 1,
        justifyContent: 'space-between',
    },
    scrollForm: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SIZES.medium,
        paddingTop: SIZES.medium,
        paddingBottom: 40,
    },
});