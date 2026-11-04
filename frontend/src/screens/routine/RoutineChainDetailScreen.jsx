import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import routineApi from '../../api/routineApi';
import { getProductIcon } from '../../constants/product-icons';
import { COLORS } from '../../constants/colors';

export default function RoutineChainDetailScreen({ navigation, route }) {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (route.params?.plan) {
            setPlan(route.params.plan);
            setLoading(false);
            return undefined;
        }
        routineApi.getActivePlan().then(setPlan).catch(() => setPlan(null)).finally(() => setLoading(false));
    }, [route.params?.plan]);

    if (loading) return <ScreenWrapper><ActivityIndicator style={styles.loader} color={COLORS.primary} /></ScreenWrapper>;
    if (!plan) return <ScreenWrapper><Text style={styles.empty}>You don’t have an active routine plan yet.</Text></ScreenWrapper>;

    const startDate = new Date(`${plan.startDate}T00:00:00.000Z`);
    const dateForDay = (dayNumber) => { const date = new Date(startDate); date.setUTCDate(date.getUTCDate() + dayNumber - 1); return date.toISOString().slice(0, 10); };

    return <ScreenWrapper scroll>
        <View style={styles.header}><Pressable onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.textMain} /></Pressable><Text style={styles.title}>Routine plan</Text><Pressable onPress={() => navigation.navigate('RoutineSetup')}><Text style={styles.edit}>Create new</Text></Pressable></View>
        <Text style={styles.planTitle}>{getPlanTitle(plan.title)}</Text>
        <Text style={styles.progress}>Day {plan.currentDay} of {plan.totalDays}</Text>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.round((plan.currentDay / plan.totalDays) * 100)}%` }]} /></View>
        <View style={styles.days}>{(plan.days || []).map((day) => { const current = day.dayNumber === plan.currentDay; return <Pressable key={day.dayNumber} onPress={() => navigation.navigate('RoutineEdit', { date: dateForDay(day.dayNumber), dayNumber: day.dayNumber })} style={[styles.dayCard, current && styles.currentDay]}><View style={styles.dayHeader}><Text style={[styles.dayTitle, current && styles.currentText]}>Day {day.dayNumber}</Text><View style={styles.dayActions}>{current && <Text style={styles.currentBadge}>Today</Text>}<Ionicons name="create-outline" size={18} color={current ? COLORS.primary : COLORS.textMuted} /></View></View><Text style={styles.sessionLabel}>Morning</Text><ProductRow products={day.morningProducts} /><Text style={styles.sessionLabel}>Evening</Text><ProductRow products={day.eveningProducts} />{current && <View style={styles.detailButton}><Text style={styles.detailText}>View today’s routine</Text></View>}</Pressable>; })}</View>
    </ScreenWrapper>;
}

function getPlanTitle(title) {
    if (!title || /routine cá nhân|routine cĂ¡ nhĂ¢n/i.test(title)) return 'Personal routine';
    return title;
}

function ProductRow({ products = [] }) {
    if (!products.length) return <Text style={styles.muted}>No products added</Text>;
    return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.products}>{products.map((product) => <View key={product._id} style={styles.product}><ImageIcon product={product} /><Text numberOfLines={2} style={styles.productName}>{product.productName}</Text></View>)}</ScrollView>;
}

function ImageIcon({ product }) {
    const { image } = getProductIcon(product.productIcon, product.productType);
    return <View style={styles.icon}><Image source={image} style={styles.productImage} /></View>;
}

const styles = StyleSheet.create({ loader: { marginTop: 40 }, empty: { marginTop: 40, textAlign: 'center', color: COLORS.textSecondary }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }, title: { color: COLORS.textMain, fontSize: 20, fontWeight: '700' }, edit: { color: COLORS.primary, fontWeight: '700' }, planTitle: { marginTop: 12, color: COLORS.textMain, fontSize: 18, fontWeight: '700' }, progress: { marginTop: 5, color: COLORS.textSecondary }, progressTrack: { height: 8, marginTop: 12, borderRadius: 4, backgroundColor: COLORS.borderDark, overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: 4, backgroundColor: COLORS.primary }, days: { gap: 12, marginTop: 20 }, dayCard: { padding: 14, borderRadius: 18, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.borderDark }, currentDay: { borderColor: COLORS.primary, backgroundColor: '#effcf9' }, dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, dayActions: { flexDirection: 'row', alignItems: 'center', gap: 8 }, dayTitle: { color: COLORS.textMain, fontSize: 16, fontWeight: '700' }, currentText: { color: COLORS.primary }, currentBadge: { color: COLORS.primary, fontSize: 12, fontWeight: '700' }, sessionLabel: { marginTop: 13, color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' }, products: { gap: 12, paddingVertical: 10 }, product: { width: 70, alignItems: 'center' }, icon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#d7f3ed' }, productImage: { width: 40, height: 44, resizeMode: 'contain' }, productName: { marginTop: 5, color: COLORS.textMain, fontSize: 11, textAlign: 'center' }, muted: { marginTop: 8, color: COLORS.textMuted, fontSize: 12 }, detailButton: { marginTop: 12, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.primary }, detailText: { color: COLORS.textLight, fontWeight: '700' } });
