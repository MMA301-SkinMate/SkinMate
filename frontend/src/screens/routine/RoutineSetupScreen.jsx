import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useCollectionContext } from '../../context/CollectionContext';
import routineApi from '../../api/routineApi';
import { COLORS } from '../../constants/colors';

const DURATIONS = [7, 14, 30];

export default function RoutineSetupScreen({ navigation }) {
    const { activeProducts, loading } = useCollectionContext();
    const [duration, setDuration] = useState(14);
    const [morning, setMorning] = useState([]);
    const [evening, setEvening] = useState([]);
    const [saving, setSaving] = useState(false);
    const [recommendation, setRecommendation] = useState(null);

    const products = useMemo(() => activeProducts || [], [activeProducts]);
    useEffect(() => {
        routineApi.recommend({ conditions: ['Binh_Thuong'] }).then(setRecommendation).catch(() => setRecommendation(null));
    }, []);
    const toggleProduct = (id, session) => {
        const setter = session === 'morning' ? setMorning : setEvening;
        setter((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    };

    const submit = async () => {
        if (saving) return;
        const suggestedMorning = (recommendation?.morningProducts || []).map((product) => product._id);
        const suggestedEvening = (recommendation?.eveningProducts || []).map((product) => product._id);
        const selectedMorning = morning.length ? morning : suggestedMorning;
        const selectedEvening = evening.length ? evening : suggestedEvening;
        if (!selectedMorning.length && !selectedEvening.length) {
            Alert.alert('Chưa chọn sản phẩm', 'Hãy chọn ít nhất một sản phẩm cho routine.');
            return;
        }
        setSaving(true);
        try {
            await routineApi.createPlan({ totalDays: duration, conditions: ['Binh_Thuong'], morningProducts: selectedMorning, eveningProducts: selectedEvening });
            Alert.alert('Đã tạo routine', `Routine ${duration} ngày đã được lưu.`, [
                { text: 'Xem routine', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('Không thể lưu routine', error.response?.data?.message || 'Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScreenWrapper scroll>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Ionicons name="arrow-back" size={24} color={COLORS.textMain} /></Pressable>
                <Text style={styles.title}>Thiết lập routine</Text>
                <View style={{ width: 24 }} />
            </View>
            <Text style={styles.label}>Thời lượng routine</Text>
            <View style={styles.durationRow}>
                {DURATIONS.map((value) => <Pressable key={value} onPress={() => setDuration(value)} style={[styles.duration, duration === value && styles.selected]}><Text style={[styles.durationText, duration === value && styles.selectedText]}>{value} ngày</Text></Pressable>)}
            </View>
            <Text style={styles.label}>Sản phẩm buổi sáng</Text>
            {recommendation?.message && <Text style={styles.recommendation}>{recommendation.message}</Text>}
            <ProductPicker products={products} selected={morning} session="morning" onToggle={toggleProduct} loading={loading} />
            <Text style={styles.label}>Sản phẩm buổi tối</Text>
            <ProductPicker products={products} selected={evening} session="evening" onToggle={toggleProduct} loading={loading} />
            <Pressable disabled={saving} onPress={submit} style={[styles.submit, saving && styles.disabled]}><Text style={styles.submitText}>{saving ? 'Đang lưu...' : 'Bắt đầu routine'}</Text></Pressable>
        </ScreenWrapper>
    );
}

function ProductPicker({ products, selected, session, onToggle, loading }) {
    if (loading) return <Text style={styles.muted}>Đang tải sản phẩm...</Text>;
    if (!products.length) return <Text style={styles.muted}>Tủ đồ chưa có sản phẩm đang sử dụng.</Text>;
    return <View style={styles.products}>{products.map((product) => {
        const id = product._id || product.id;
        const active = selected.includes(id);
        return <Pressable key={id} onPress={() => onToggle(id, session)} style={[styles.product, active && styles.productSelected]}>
            <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={active ? COLORS.primary : COLORS.textMuted} />
            <View style={styles.productInfo}><Text style={styles.productName}>{product.productName || product.name}</Text><Text style={styles.productType}>{product.productType || 'Sản phẩm'}</Text></View>
        </Pressable>;
    })}</View>;
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
    title: { fontSize: 20, fontWeight: '700', color: COLORS.textMain },
    label: { marginTop: 20, marginBottom: 10, fontSize: 16, fontWeight: '700', color: COLORS.textMain },
    durationRow: { flexDirection: 'row', gap: 10 },
    duration: { paddingVertical: 11, paddingHorizontal: 16, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderDark },
    selected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    durationText: { color: COLORS.textSecondary, fontWeight: '600' },
    selectedText: { color: COLORS.textLight },
    products: { gap: 8 },
    product: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.borderDark },
    productSelected: { borderColor: COLORS.primary, backgroundColor: '#effcf9' },
    productInfo: { marginLeft: 10, flex: 1 },
    productName: { color: COLORS.textMain, fontWeight: '600' },
    productType: { marginTop: 2, color: COLORS.textSecondary, fontSize: 12 },
    muted: { color: COLORS.textSecondary, paddingVertical: 12 },
    recommendation: { color: COLORS.primary, fontSize: 12, lineHeight: 17, marginBottom: 6 },
    submit: { alignItems: 'center', marginVertical: 28, paddingVertical: 14, borderRadius: 14, backgroundColor: COLORS.primary },
    disabled: { opacity: 0.6 },
    submitText: { color: COLORS.textLight, fontWeight: '700', fontSize: 16 },
});
