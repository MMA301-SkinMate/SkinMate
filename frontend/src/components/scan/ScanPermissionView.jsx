import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../ScreenWrapper';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/theme';

const ScanPermissionView = ({ permission, requestPermission }) => {

    const handlePress = async () => {
        // Permission denied permanently -> Open Settings
        if (permission && !permission.canAskAgain) {
            Linking.openSettings();
        } else {
            await requestPermission();
        }
    };

    const isBlocked = permission && !permission.canAskAgain;
    return (
        <ScreenWrapper style={styles.centerContainer}>
            <View style={styles.permissionBox}>
                <Ionicons name="camera" size={64} color={COLORS.primary} />
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionDesc}>
                    {isBlocked
                        ? 'Camera permission is blocked. Please open Settings to allow SkinMate to access your camera.'
                        : 'SkinMate needs camera access to scan and analyze cosmetic ingredient labels in seconds.'}
                </Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={handlePress} activeOpacity={0.85}>
                    <Text style={styles.primaryBtnText}>{isBlocked ? 'Open Settings' : 'Allow Access'}</Text>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SIZES.extraLarge,
    },
    permissionBox: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: SIZES.extraLarge + SIZES.base,
        borderRadius: SIZES.radiusLarge,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.light,
    },
    permissionTitle: {
        fontSize: SIZES.large,
        fontWeight: '800',
        color: COLORS.textMain,
        marginTop: SIZES.medium,
        textAlign: 'center',
    },
    permissionDesc: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SIZES.base,
        marginBottom: SIZES.extraLarge,
        lineHeight: 20,
    },
    primaryBtn: {
        width: '100%',
        padding: 10,
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.extraLarge,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtnText: {
        fontSize: SIZES.medium,
        fontWeight: '700',
        color: COLORS.textLight,
    },
});

export default ScanPermissionView;