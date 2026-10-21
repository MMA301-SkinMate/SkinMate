import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SIZES } from '../../../constants/theme';

const ScreenHeader = ({ title, onGoBack }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={onGoBack}>
                <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 40 }} />
        </View>
    );
};

export default ScreenHeader;

const styles = StyleSheet.create({
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.medium,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textMain,
    },
});
