import { View, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import ScanPermissionView from '../../components/scan/ScanPermissionView';
import ScanHeader from '../../components/scan/ScanHeader';
import CameraViewfinder from '../../components/scan/CameraViewfinder';
import ScanControls from '../../components/scan/ScanControls';
import useScan from '../../hooks/useScan';
import ScanLoadingOverlay from '../../components/scan/ScanLoadingOverlay';
import ScanResultModal from '../../components/scan/ScanResultModal';

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
        handleEditIngredients,
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
                    ingredients={scannedData?.ingredients || []}
                    onEdit={handleEditIngredients}
                    onClose={handleCloseModal}
                />
            )}
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
});