import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

const ScreenWrapper = ({ children, style }) => {
    return (
        <SafeAreaView style={[styles.container, style]} edges={['top', 'left', 'right']}>
            <View style={styles.inner}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    inner: {
        flex: 1,
        paddingHorizontal: 16,
    },
});

export default ScreenWrapper;