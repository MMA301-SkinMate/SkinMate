import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import routineApi from '../../api/routineApi';
import { COLORS } from '../../constants/colors';
import { getProductIcon } from '../../constants/product-icons';

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function DailyRoutineWidget({ navigation, refreshKey = 0, conditions = ['Binh_Thuong'] }) {
    const date = useMemo(todayKey, []);
    const [routine, setRoutine] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        routineApi.getByDate(date).then(async (value) => {
            if (!mounted) return;
            setRoutine(value);
            if (!value) {
                const suggested = await routineApi.recommend({ conditions });
                if (mounted) setRecommendation(suggested);
            }
        }).catch(() => { if (mounted) { setRoutine(null); setRecommendation(null); } }).finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [date, refreshKey, conditions]);

    if (loading) return <ActivityIndicator style={styles.loader} color={COLORS.primary} />;
    if (!routine) return (
        <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}><Ionicons name="sparkles-outline" size={23} color={COLORS.primary} /></View>
            <Text style={styles.emptyTitle}>Find your skincare routine</Text>
            <Text style={styles.emptyText}>{recommendation?.message || 'Create a routine for SkinMate to track and adjust to your skin every day.'}</Text>
            {recommendation?.explanation && <Text style={styles.aiExplanation}>{recommendation.explanation}</Text>}
            {recommendation?.morningProducts?.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionShelf}>{recommendation.morningProducts.map((product) => <View key={product._id} style={styles.product}><View style={styles.productIcon}><Image source={getProductIcon(product.productIcon, product.productType).image} style={styles.productImage} /></View><Text numberOfLines={2} style={styles.productName}>{product.productName}</Text></View>)}</ScrollView>}
            {recommendation?.missingProducts?.length > 0 && <Text style={styles.missing}>Missing: {recommendation.missingProducts.map((item) => item.requiredIngredients?.join(', ')).filter(Boolean).join(' · ')}</Text>}
            {recommendation?.externalSuggestions?.length > 0 && <Text style={styles.external}>Outside-collection suggestions: {recommendation.externalSuggestions.map((item) => item.suggestedIngredients?.join(', ')).filter(Boolean).join(' · ')}</Text>}
            <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('RoutineSetup')}><Text style={styles.primaryText}>Get routine suggestions</Text></Pressable>
        </View>
    );

    const products = routine.morningProducts || [];
    return (
        <View style={styles.container}>
            <View style={styles.heading}><View><Text style={styles.kicker}>YOUR PLAN</Text><Text style={styles.title}>Today&apos;s routine</Text><Text style={styles.subtitle}>Day {routine.dayNumber || 1}{routine.totalDays ? ` of ${routine.totalDays}` : ''}</Text></View><View style={styles.doneIcon}><Ionicons name="checkmark" size={18} color={COLORS.primary} /></View></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelf}>
                {products.length ? products.map((product, index) => <View key={`${product._id || product.id}-${index}`} style={styles.product}><View style={styles.productIcon}><Image source={getProductIcon(product.productIcon, product.productType).image} style={styles.productImage} /></View><Text numberOfLines={2} style={styles.productName}>{product.productName || product.name}</Text></View>) : <Text style={styles.emptyText}>No morning products scheduled.</Text>}
            </ScrollView>
            <View style={styles.actions}><Pressable style={styles.detailButton} onPress={() => navigation.navigate('RoutineDetail')}><Text style={styles.detailText}>View routine details</Text></Pressable><Pressable style={styles.chainButton} onPress={() => navigation.navigate('RoutineChainDetail')}><Ionicons name="layers-outline" size={18} color={COLORS.primary} /></Pressable></View>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.82)' },
    kicker: { color: COLORS.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    doneIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5f5ee' },
    container: { marginTop: 18, padding: 18, borderRadius: 24, backgroundColor: COLORS.card, borderWidth: 1, borderColor: '#e4eee9', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.045, shadowRadius: 12, elevation: 2 },
    loader: { marginTop: 24 }, emptyCard: { marginTop: 20, padding: 18, borderRadius: 20, backgroundColor: '#effcf9', alignItems: 'center', borderWidth: 1, borderColor: '#b8e8dd' }, emptyTitle: { marginTop: 8, color: COLORS.textMain, fontSize: 16, fontWeight: '700', textAlign: 'center' }, emptyText: { marginTop: 6, color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center' }, primaryButton: { marginTop: 14, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: COLORS.primary }, primaryText: { color: COLORS.textLight, fontWeight: '700' }, heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { color: COLORS.textMain, fontSize: 18, fontWeight: '700' }, subtitle: { marginTop: 4, color: COLORS.textSecondary, fontSize: 12 }, shelf: { gap: 12, paddingVertical: 16 }, product: { width: 78, alignItems: 'center' }, productIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }, productName: { marginTop: 6, color: COLORS.textMain, fontSize: 11, lineHeight: 15, textAlign: 'center' }, actions: { flexDirection: 'row', alignItems: 'center', gap: 8 }, detailButton: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.primary }, detailText: { color: COLORS.textLight, fontSize: 12, fontWeight: '700' }, chainButton: { width: 42, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#d7f3ed' },
    suggestionShelf: { gap: 12, paddingTop: 14 },
    missing: { marginTop: 10, color: COLORS.warning, fontSize: 12, lineHeight: 17, textAlign: 'center' }, external: { marginTop: 8, color: COLORS.primary, fontSize: 12, lineHeight: 17, textAlign: 'center' }, aiExplanation: { marginTop: 8, color: COLORS.textSecondary, fontSize: 12, lineHeight: 17, textAlign: 'center' }, productImage: { width: 44, height: 48, resizeMode: 'contain' },
});
