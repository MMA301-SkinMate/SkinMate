import { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import routineApi from '../../api/routineApi';
import { COLORS } from '../../constants/colors';

export default function RoutineHistoryScreen({ navigation }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { routineApi.getHistory().then(setHistory).catch(() => setHistory([])).finally(() => setLoading(false)); }, []);
    const copy = async (plan) => {
        try {
            const firstDay = plan.days?.[0] || {};
            const active = await routineApi.getActivePlan();
            if (active) {
                Alert.alert('Routine đang chạy', 'Copy routine này sẽ thay routine hiện tại. Bạn có muốn tiếp tục?', [{ text: 'Hủy', style: 'cancel' }, { text: 'Tiếp tục', style: 'destructive', onPress: () => copyPlan(plan, firstDay) }]);
            } else await copyPlan(plan, firstDay);
        } catch (error) { Alert.alert('Không thể copy', error.response?.data?.message || 'Vui lòng thử lại.'); }
    };
    const copyPlan = async (plan, firstDay) => {
        try {
            await routineApi.createPlan({
                title: plan.title,
                totalDays: plan.totalDays,
                days: (plan.days || []).map((day, index) => ({
                    dayNumber: day.dayNumber || index + 1,
                    morningProducts: (day.morningProducts || []).map(product => product._id || product),
                    eveningProducts: (day.eveningProducts || []).map(product => product._id || product),
                })),
                morningProducts: (firstDay.morningProducts || []).map(product => product._id || product),
                eveningProducts: (firstDay.eveningProducts || []).map(product => product._id || product),
            });
            Alert.alert('Đã copy', 'Routine cũ đã được dùng lại.', [{ text: 'Xem Home', onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }) }]);
        } catch (error) { Alert.alert('Không thể copy', error.response?.data?.message || 'Vui lòng thử lại.'); }
    };
    const share = (plan) => navigation.navigate('ShareRoutine', { plan });
    if (loading) return <ScreenWrapper><ActivityIndicator style={styles.loader} color={COLORS.primary} /></ScreenWrapper>;
    return <ScreenWrapper scroll><View style={styles.header}><Pressable onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.textMain} /></Pressable><Text style={styles.title}>Routine History</Text><View style={{ width: 24 }} /></View>{!history.length && <Text style={styles.empty}>Chưa có routine history.</Text>}{history.map(plan => <View key={plan._id} style={styles.card}><Pressable onPress={() => navigation.navigate('RoutineChainDetail', { plan })}><Text style={styles.planTitle}>{plan.title || 'Routine cá nhân'}</Text><Text style={styles.meta}>{plan.totalDays} ngày · {plan.status === 'completed' ? 'Đã hoàn thành' : 'Đã kết thúc'}</Text><Text style={styles.detail}>Xem chi tiết</Text></Pressable><View style={styles.actions}><Pressable onPress={() => copy(plan)} style={styles.copy}><Text style={styles.copyText}>Copy</Text></Pressable><Pressable onPress={() => share(plan)} style={styles.share}><Text style={styles.shareText}>Chia sẻ lên Community</Text></Pressable></View></View>)}</ScreenWrapper>;
}

const styles = StyleSheet.create({ loader: { marginTop: 40 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }, title: { color: COLORS.textMain, fontSize: 20, fontWeight: '700' }, empty: { marginTop: 40, textAlign: 'center', color: COLORS.textSecondary }, card: { marginTop: 12, padding: 16, borderRadius: 18, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.borderDark }, planTitle: { color: COLORS.textMain, fontSize: 16, fontWeight: '700' }, meta: { marginTop: 5, color: COLORS.textSecondary, fontSize: 13 }, detail: { marginTop: 8, color: COLORS.primary, fontWeight: '700' }, actions: { flexDirection: 'row', gap: 8, marginTop: 14 }, copy: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, backgroundColor: COLORS.primary }, copyText: { color: COLORS.textLight, fontWeight: '700' }, share: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#d7f3ed' }, shareText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 } });
