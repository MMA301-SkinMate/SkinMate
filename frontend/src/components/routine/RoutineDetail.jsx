import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import routineApi from '../../api/routineApi';
import { COLORS } from '../../constants/colors';

const STEPS = [
    { key: 'cleanser', title: 'Làm sạch', icon: 'water-outline', types: ['cleanser'] },
    { key: 'toner', title: 'Cân bằng', icon: 'flask-outline', types: ['toner', 'essences'] },
    { key: 'treatment', title: 'Đặc trị', icon: 'medkit-outline', types: ['treatment', 'serum', 'exfoliant', 'mask'] },
    { key: 'moisturizer', title: 'Dưỡng / Phục hồi', icon: 'heart-outline', types: ['moisturizer', 'cream', 'oil'] },
    { key: 'sunscreen', title: 'Bảo vệ', icon: 'sunny-outline', types: ['sunscreen'] },
];

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function RoutineDetail({ refreshKey = 0 }) {
    const date = useMemo(todayKey, []);
    const [routine, setRoutine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState('morning');

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        routineApi.getByDate(date)
            .then((value) => { if (mounted) setRoutine(value); })
            .catch(() => { if (mounted) setRoutine(null); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [date, refreshKey]);

    if (loading) return <ActivityIndicator style={styles.loader} color={COLORS.primary} />;
    if (!routine) return null;

    const products = session === 'morning' ? (routine.morningProducts || []) : (routine.eveningProducts || []);
    const conditions = routine.skinConditions || [routine.skinCondition || 'Binh_Thuong'];

    return (
        <View style={styles.container}>
            <View style={styles.headingRow}>
                <View>
                    <Text style={styles.title}>Routine hôm nay</Text>
                    <Text style={styles.subtitle}>{conditions.map(formatCondition).join(' · ')}</Text>
                    {routine.routinePlanId?.explanation && <Text style={styles.explanation}>{routine.routinePlanId.explanation}</Text>}
                </View>
                {routine.isOverridden && <View style={styles.badge}><Text style={styles.badgeText}>Đã điều chỉnh</Text></View>}
            </View>
            <View style={styles.sessionSwitch}>
                {['morning', 'evening'].map((value) => (
                    <Text key={value} onPress={() => setSession(value)} style={[styles.session, session === value && styles.sessionActive]}>
                        {value === 'morning' ? 'Buổi sáng' : 'Buổi tối'}
                    </Text>
                ))}
            </View>
            <View style={styles.cards}>
                {STEPS.map((step, index) => {
                    const product = products.find((item) => step.types.includes(item.productType));
                    return (
                        <View key={step.key} style={[styles.card, index === 2 && styles.treatmentCard]}>
                            <View style={styles.stepHeader}>
                                <View style={styles.iconCircle}><Ionicons name={step.icon} size={20} color={COLORS.primary} /></View>
                                <Text style={styles.stepNumber}>Bước {index + 1}</Text>
                            </View>
                            <Text style={styles.stepTitle}>BƯỚC {index + 1} - {step.title.toUpperCase()}</Text>
                            <Text style={styles.productName}>{product?.productName || 'Chưa có sản phẩm'}</Text>
                            <Text style={styles.instruction}>{getInstruction(step.key, product, conditions)}</Text>
                            {product && <Text style={styles.reason}>{getReason(product, conditions, routine.routinePlanId?.stepReasons)}</Text>}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

function formatCondition(value) {
    return ({ Binh_Thuong: 'Bình thường', Kho_Rat: 'Khô rát', Kich_Ung: 'Kích ứng', Noi_Mun: 'Nổi mụn', Bong_Dau: 'Bóng dầu' })[value] || value;
}

function getInstruction(step, product, conditions) {
    if (!product) return 'Thêm sản phẩm vào tủ đồ để hoàn thiện bước này.';
    if (step === 'treatment' && conditions.some((value) => ['Kho_Rat', 'Kich_Ung'].includes(value))) return 'Ưu tiên phục hồi, dùng một lớp mỏng và theo dõi phản ứng của da.';
    if (step === 'sunscreen') return 'Dùng vào buổi sáng và thoa lại khi cần.';
    return 'Dùng sau bước trước, theo dõi phản ứng của da.';
}

function getReason(product, conditions, stepReasons = {}) {
    const generatedReason = stepReasons[product.productType] || stepReasons.treatment;
    if (generatedReason) return generatedReason;
    const condition = conditions[0];
    const conditionLabel = ({ Kho_Rat: 'khô rát', Kich_Ung: 'kích ứng', Noi_Mun: 'nổi mụn', Bong_Dau: 'bóng dầu', Binh_Thuong: 'ổn định' })[condition] || 'hôm nay';
    const ingredients = (product.ingredients || []).slice(0, 2).join(' và ');
    return ingredients
        ? `${product.productName} có ${ingredients}, phù hợp với nền da ${conditionLabel} của bạn.`
        : `Sản phẩm được chọn dựa trên tình trạng da ${conditionLabel} hôm nay.`;
}

const styles = StyleSheet.create({
    container: { marginTop: 24 },
    loader: { marginTop: 24 },
    headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 18, fontWeight: '700', color: COLORS.textMain },
    subtitle: { marginTop: 4, color: COLORS.textSecondary, fontSize: 13 },
    explanation: { marginTop: 6, color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
    badge: { backgroundColor: '#d7f3ed', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
    badgeText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
    sessionSwitch: { flexDirection: 'row', gap: 8, marginTop: 14 },
    session: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 12, backgroundColor: COLORS.surface, color: COLORS.textSecondary, fontSize: 12 },
    sessionActive: { backgroundColor: COLORS.primary, color: COLORS.textLight, fontWeight: '700' },
    cards: { flexDirection: 'column', gap: 12, paddingVertical: 14 },
    card: { width: '100%', minHeight: 170, padding: 14, borderRadius: 18, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.borderDark },
    treatmentCard: { borderColor: COLORS.primaryLight },
    stepHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#d7f3ed' },
    stepNumber: { color: COLORS.textMuted, fontSize: 11 },
    stepTitle: { marginTop: 12, color: COLORS.textMain, fontWeight: '700' },
    productName: { marginTop: 8, color: COLORS.primary, fontWeight: '700' },
    instruction: { marginTop: 8, color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
    reason: { marginTop: 8, color: COLORS.primary, fontSize: 11, lineHeight: 16, fontWeight: '600' },
});
