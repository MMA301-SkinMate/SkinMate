import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import RoutineDetail from '../../components/routine/RoutineDetail';
import { COLORS } from '../../constants/colors';

export default function RoutineDetailScreen({ navigation }) {
    return <ScreenWrapper scroll><View style={styles.header}><Pressable onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.textMain} /></Pressable><Text style={styles.title}>Routine detail</Text><Pressable onPress={() => navigation.navigate('RoutineEdit')}><Text style={styles.edit}>Edit</Text></Pressable></View><RoutineDetail /></ScreenWrapper>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }, title: { color: COLORS.textMain, fontSize: 20, fontWeight: '700' }, edit: { color: COLORS.primary, fontWeight: '700' } });
