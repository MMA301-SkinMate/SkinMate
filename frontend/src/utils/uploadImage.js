import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const uploadImage = async () => {
    try {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                'Permission denied',
                'SkinMate needs permission to access your photo library to select cosmetic images.'
            );
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            return result.assets[0].uri;
        }

        return null;
    } catch (error) {
        console.error('Error selecting image from library:', error);
        Alert.alert('Error', 'Cannot open photo library.');
        return null;
    }
};