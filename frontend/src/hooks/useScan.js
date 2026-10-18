import { useState, useRef } from 'react';
import { useCameraPermissions } from 'expo-camera';
import { Alert } from 'react-native';
import scanApi from '../api/scanApi';
import { uploadImage } from '../utils/uploadImage';

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

    const processImageScan = async (imageUri) => {
        try {
            setCapturedImageUri(imageUri);
            setIsLoading(true);

            const result = await scanApi.scanIngredientImage(imageUri);

            setScannedData(result?.data);
            setIsModalVisible(true);
        } catch (error) {
            Alert.alert('Error', error?.message || 'Cannot send image to server. Please try again.');
            setCapturedImageUri(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCapture = async () => {
        if (!cameraRef.current) return;

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                skipProcessing: true,
            });
            await processImageScan(photo.uri);
        } catch (error) {
            Alert.alert('Error', error?.message || 'Cannot send image to server. Please try again.');
        }
    };

    const handleUploadImage = async () => {
        const imageUri = await uploadImage();
        if (imageUri) {
            await processImageScan(imageUri);
        }
    };

    const handleCloseModal = (updatedIngredients) => {
        if (updatedIngredients && Array.isArray(updatedIngredients)) {
            setScannedData(prev => ({
                ...prev,
                ingredients: updatedIngredients,
            }));
        }
        setIsModalVisible(false);
        setCapturedImageUri(null);
    };

    const handleScanHistory = () => {
        Alert.alert('Scan History', 'View your previously scanned cosmetic products.');
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
        handleCloseModal,
        handleUploadImage,
        handleScanHistory,
    };
};

export default useScan;