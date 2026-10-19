import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/theme';

const ScanControls = ({ insets, handleUploadImage, handleCapture, handleScanHistory }) => {
    return (
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + SIZES.medium }]}>
            <View style={styles.controlBar}>

                {/* Upload image */}
                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={handleUploadImage}
                    activeOpacity={0.75}
                >
                    <Ionicons name="images-outline" size={SIZES.extraLarge + 2} color={COLORS.textLight} />
                </TouchableOpacity>

                {/* Scan button to capture */}
                <TouchableOpacity
                    style={styles.captureBtnOuter}
                    onPress={handleCapture}
                    activeOpacity={0.85}
                >
                    <View style={styles.captureBtnInner}>
                        <Ionicons name="camera" size={SIZES.extraLarge + 6} color={COLORS.textLight} />
                    </View>
                </TouchableOpacity>

                {/* Scan history */}
                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={handleScanHistory}
                    activeOpacity={0.75}
                >
                    <Ionicons name="time-outline" size={SIZES.extraLarge + 2} color={COLORS.textLight} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default ScanControls

const styles = StyleSheet.create({
    bottomSection: {
        alignItems: 'center',
        paddingHorizontal: SIZES.extraLarge,
    },
    controlBar: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    secondaryBtn: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureBtnOuter: {
        width: 78,
        height: 78,
        borderRadius: 39,
        borderWidth: 4,
        borderColor: COLORS.textLight,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        ...SHADOWS.medium,
    },
    captureBtnInner: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
