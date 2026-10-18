import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/theme';

const ScanLoadingOverlay = ({ visible }) => {
    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.card}>
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primaryLight} />
                </View>
                <Text style={styles.message}>AI is scanning ingredients...</Text>
            </View>
        </View>
    );
};

export default ScanLoadingOverlay;

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        paddingHorizontal: SIZES.extraLarge,
    },
    card: {
        width: '86%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerContainer: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        marginTop: SIZES.base,
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
});