import { Text, StyleSheet } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/theme';


const ProfileScreen = () => {
    return (
        <ScreenWrapper>
            <Text style={styles.title}>ProfileScreen</Text>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: SIZES.title,
        fontWeight: 'bold',
        color: COLORS.textMain,
        marginTop: SIZES.base * 1.5,
    },
});

export default ProfileScreen
