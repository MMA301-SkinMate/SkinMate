import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { CameraView } from 'expo-camera';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');
const CAMERA_FRAME_WIDTH = width * 0.88;
const CAMERA_FRAME_HEIGHT = height * 0.52;

const CameraViewfinder = ({ cameraRef, facing, flash, capturedImageUri }) => {
    return (
        <View style={styles.centerSection}>
            <View style={styles.cameraFrameWrapper}>
                {capturedImageUri ? (

                    <Image source={{ uri: capturedImageUri }} style={styles.cameraView} />
                ) : (
                    <CameraView
                        ref={cameraRef}
                        style={styles.cameraView}
                        facing={facing}
                        flash={flash}
                    >
                        {/* Corner focus brackets */}
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />
                    </CameraView>
                )}

            </View>
            <Text style={styles.guideText}>Align cosmetic ingredients within the frame</Text>
        </View>
    );
}

export default CameraViewfinder;

const styles = StyleSheet.create({
    centerSection: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraFrameWrapper: {
        width: CAMERA_FRAME_WIDTH,
        height: CAMERA_FRAME_HEIGHT,
        borderRadius: SIZES.radiusLarge,
        borderWidth: 2.5,
        borderColor: COLORS.primaryLight,
        overflow: 'hidden',
        backgroundColor: COLORS.shadow,
        position: 'relative',
        ...SHADOWS.medium,
    },
    cameraView: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    guideText: {
        fontSize: SIZES.font,
        color: COLORS.textMuted,
        fontWeight: '500',
        marginTop: SIZES.medium,
        textAlign: 'center',
    },
    corner: {
        position: 'absolute',
        width: 28,
        height: 28,
        borderColor: COLORS.primaryLight,
    },
    cornerTL: {
        top: SIZES.base,
        left: SIZES.base,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderTopLeftRadius: SIZES.radius,
    },
    cornerTR: {
        top: SIZES.base,
        right: SIZES.base,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderTopRightRadius: SIZES.radius,
    },
    cornerBL: {
        bottom: SIZES.base,
        left: SIZES.base,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderBottomLeftRadius: SIZES.radius,
    },
    cornerBR: {
        bottom: SIZES.base,
        right: SIZES.base,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderBottomRightRadius: SIZES.radius,
    },

});