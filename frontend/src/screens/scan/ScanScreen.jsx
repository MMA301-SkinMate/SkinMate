import { View, StyleSheet, StatusBar, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import ScanPermissionView from '../../components/scan/ScanPermissionView';
import ScanHeader from '../../components/scan/ScanHeader';
import CameraViewfinder from '../../components/scan/CameraViewfinder';
import ScanControls from '../../components/scan/ScanControls';
import useScan from '../../hooks/useScan';
import ScanLoadingOverlay from '../../components/scan/ScanLoadingOverlay';
import ScanResultModal from '../../components/scan/ScanResultModal';
import { Ionicons } from '@expo/vector-icons';

const ScanScreen = ({ navigation }) => {
    const {
        cameraRef,
        facing,
        flash,
        permission,
        isLoading,
        isModalVisible,
        scannedData,
        capturedImageUri,
        requestPermission,
        toggleFlash,
        toggleFacing,
        handleCapture,
        handleCloseModal,
        handleUploadImage,
        handleScanHistory,
    } = useScan(navigation);

    const insets = useSafeAreaInsets();

    // Loading permission state
    if (!permission) {
        return <View style={styles.container} />;
    }

    // Permission not granted -> Request access view
    if (!permission.granted) {
        return (
            <ScanPermissionView
                permission={permission}
                requestPermission={requestPermission}
            />
        );
    }

    const handleTestWithMockData = () => {
        const mockIngredients = [
            'Water',
            'Glycerin',
            'Niacinamide',
            'Hyaluronic Acid',
            'Salicylic Acid',
            'Phenoxyethanol'
        ];

        navigation.navigate('ProductInfoDetail', { ingredientList: mockIngredients });
    };

    console.log(scannedData)
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* ── Top Header ── */}
            <ScanHeader
                insets={insets}
                flash={flash}
                toggleFlash={toggleFlash}
                toggleFacing={toggleFacing}
            />

            {/* ── Center Camera Area ── */}
            <CameraViewfinder
                cameraRef={cameraRef}
                facing={facing}
                flash={flash}
                capturedImageUri={capturedImageUri}
            />

            {/* ── Bottom Controls Bar ── */}
            <ScanControls
                insets={insets}
                handleUploadImage={handleUploadImage}
                handleCapture={handleCapture}
                handleScanHistory={handleScanHistory}
            />

            <ScanLoadingOverlay visible={isLoading} />

            {isModalVisible && (
                <ScanResultModal
                    ingredients={
                        Array.isArray(scannedData)
                            ? scannedData
                            : (scannedData?.ingredients || scannedData?.ingredientList || [])
                    }
                    onClose={handleCloseModal}
                />
            )}

            <TouchableOpacity
                style={styles.devMockBtn}
                onPress={handleTestWithMockData}
                activeOpacity={0.8}
            >
                <Ionicons name="bug-outline" size={18} color="#FFF" />
                <Text style={styles.devMockText}>Test Nhanh (Mock Data)</Text>
            </TouchableOpacity>
        </View>
    );
}

export default ScanScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.shadow,
        justifyContent: 'space-between',
    },
    devMockBtn: {
        position: 'absolute',
        top: 60,
        right: 20,
        flexDirection: 'row',
        backgroundColor: 'rgba(239, 68, 68, 0.85)', // Màu đỏ nổi bật cho chế độ dev
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
        gap: 6,
        zIndex: 999,
    },
    devMockText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
});