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
            // productIcon: selectedIcon,
            ingredientList,
        };

        try {
            const result = await analyze(productPayload);
            if (result) {
                setAnalysisResult(result?.data || result);
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 300);
            }
        } catch (err) {
            Alert.alert('Analysis Failed', err.message || 'Unable to analyze product.');
        }
    };

    const displayData = analysisResult?.analysisResult || analysisResult?.data?.analysisResult || analysisResult?.data || analysisResult;

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

                    {Boolean(displayData && (displayData.baseScore !== undefined || displayData.contextualScore !== undefined)) && (
                        <AnalysisResultView data={displayData} />
                    )}
                </ScrollView>

                <SubmitFooter onSubmit={handleAnalyze} loading={loading} />
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