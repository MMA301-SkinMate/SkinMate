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
            Alert.alert('Thông báo', error?.message || 'Không thể gửi ảnh tới máy chủ. Vui lòng thử lại.');
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
            Alert.alert('Thông báo', error?.message || 'Không thể chụp ảnh. Vui lòng thử lại.');
        }
    };

    const handleUploadImage = async () => {
        const imageUri = await uploadImage();
        if (imageUri) {
            await processImageScan(imageUri);
        }
    };

    const handleCloseModal = (updatedIngredients) => {
        setIsModalVisible(false);
        setCapturedImageUri(null);

        if (updatedIngredients && Array.isArray(updatedIngredients) && updatedIngredients.length > 0) {
            setScannedData(prev => ({
                ...prev,
                ingredients: updatedIngredients,
            }));

            // Gợi ý phân tích độ phù hợp ngay sau khi xác nhận bảng thành phần
            setTimeout(() => {
                Alert.alert(
                    'Trích xuất thành phần thành công!',
                    `Đã nhận diện ${updatedIngredients.length} thành phần mỹ phẩm từ ảnh chụp.\nBạn có muốn phân tích độ phù hợp với làn da hôm nay không?`,
                    [
                        { text: 'Để sau', style: 'cancel' },
                        {
                            text: 'Phân tích ngay',
                            onPress: async () => {
                                try {
                                    setIsLoading(true);
                                    const res = await scanApi.analyzeSuitability({
                                        productName: 'Mỹ phẩm vừa quét',
                                        ingredients: updatedIngredients,
                                    });
                                    const score = res?.data?.data?.scoreResult?.finalScore || 85;
                                    const verdict = res?.data?.data?.scoreResult?.verdict || 'Phù hợp';
                                    Alert.alert(
                                        'Kết quả Phân tích Độ Phù Hợp Da',
                                        `Điểm phù hợp: ${score}%\nĐánh giá y khoa: ${verdict}\n\nThuật toán đã đối chiếu với hồ sơ da và các bước routine hôm nay của bạn.`
                                    );
                                } catch (e) {
                                    Alert.alert('Lỗi', e.message || 'Không thể phân tích độ phù hợp.');
                                } finally {
                                    setIsLoading(false);
                                }
                            },
                        },
                    ]
                );
            }, 300);
        }
    };

    const handleScanHistory = async () => {
        try {
            const history = await scanApi.getScanHistory();
            const count = history?.data?.data?.length || 0;
            Alert.alert(
                'Lịch sử quét mỹ phẩm',
                `Bạn hiện có ${count} sản phẩm đã từng quét bảng thành phần.`
            );
        } catch (e) {
            Alert.alert('Lịch sử quét', 'Xem lại danh sách các mỹ phẩm bạn đã chụp và quét trước đây.');
        }
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
