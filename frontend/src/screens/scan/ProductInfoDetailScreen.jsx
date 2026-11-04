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
            const result = await analyze(productPayload);
            console.log(result)
            const data = result?.data || result;
            if (data && (data.baseScore !== undefined || data.contextualScore !== undefined || data.verdict)) {
                setAnalysisResult(data);
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
                // userId handled by auth
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