import { useState, useRef } from 'react';
import { useCameraPermissions } from 'expo-camera';
import { Alert } from 'react-native';
import scanApi from '../api/scanApi';

const useScan = (navigation) => {
    const [facing, setFacing] = useState('back');
    const [flash, setFlash] = useState('off');
    const [isLoading, setIsLoading] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [capturedImageUri, setCapturedImageUri] = useState(null);

    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);

    const toggleFlash = () => setFlash(prev => (prev === 'off' ? 'on' : 'off'));
    const toggleFacing = () => setFacing(prev => (prev === 'back' ? 'front' : 'back'));

    const handleCapture = async () => {
        if (!cameraRef.current) return;

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                skipProcessing: true,
            });
            setCapturedImageUri(photo.uri);
            setIsLoading(true);

            const result = await scanApi.scanIngredientImage(photo.uri);
            console.log('Result from Backend:', result);

            setScannedData(result?.data)
            setIsModalVisible(true);
        } catch (error) {
            Alert.alert('Error', error?.message || 'Cannot send image to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditIngredients = () => {
        setIsModalVisible(false);
        setCapturedImageUri(null);
        Alert.alert('Edit Mode', 'Chuyển sang màn hình chỉnh sửa danh sách thành phần.');
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setCapturedImageUri(null);
    };

    const handleScanHistory = () => {
        Alert.alert('Scan History', 'View your previously scanned cosmetic products.');
    };

    const handleUploadImage = () => {
        Alert.alert('Upload Image', 'Select an image from gallery to scan ingredients.');
    };

    return {
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
    };
};

export default useScan;