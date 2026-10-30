import { useRef, useState } from 'react';
import { Alert, Text, StyleSheet } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';
import { SIZES, SPACING } from '../../constants/theme';

const ProfileScreen = () => {
    const { logout } = useAuth();
    const [busy, setBusy] = useState(false);
    const inFlight = useRef(false);

    const handleLogout = async () => {
        if (inFlight.current) return;
        inFlight.current = true;
        setBusy(true);
        try {
            await logout();
        } catch {
            setBusy(false);
            Alert.alert('Unable to sign out', 'Could not clear the device session. Please try again.');
        } finally {
            inFlight.current = false;
        }
    };

    return (
        <ScreenWrapper>
            <Text style={styles.title}>Profile</Text>
            <Button
                title="Sign out"
                variant="danger"
                leftIcon="log-out-outline"
                loading={busy}
                onPress={handleLogout}
                style={styles.logout}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: SIZES.title,
        fontWeight: 'bold',
        color: COLORS.textMain,
        marginTop: SIZES.base * 1.5,
    },
    logout: { marginTop: SPACING.xl },
});

export default ProfileScreen;
