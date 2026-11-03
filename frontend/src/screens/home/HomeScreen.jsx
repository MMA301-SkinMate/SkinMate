import { useState } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import SkinCheckInWidget from '../../components/routine/SkinCheckInWidget';
import RoutineDetail from '../../components/routine/RoutineDetail';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/theme';

const HomeScreen = ({ navigation }) => {
    const [routineVersion, setRoutineVersion] = useState(0);
    return (
        <ScreenWrapper>
            <View style={styles.heading}>
                <Text style={styles.title}>Home</Text>
                <Pressable onPress={() => navigation.navigate('RoutineSetup')} style={styles.setupButton}>
                    <Ionicons name="calendar-outline" size={17} color={COLORS.primary} />
                    <Text style={styles.setupText}>Tạo routine</Text>
                </Pressable>
            </View>
            <SkinCheckInWidget onSaved={() => setRoutineVersion((version) => version + 1)} />
            <RoutineDetail refreshKey={routineVersion} />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SIZES.base * 1.5 },
    title: {
        fontSize: SIZES.title,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    setupButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#d7f3ed' },
    setupText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});

export default HomeScreen;
