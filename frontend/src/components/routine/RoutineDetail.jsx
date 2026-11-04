import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import routineApi from '../../api/routineApi';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const STEPS = [
  { key: 'cleanser', title: 'CLEANSE', icon: 'water-outline', types: ['cleanser'] },
  { key: 'toner', title: 'TONE', icon: 'flask-outline', types: ['toner', 'essences'] },
  { key: 'treatment', title: 'TREAT', icon: 'medkit-outline', types: ['treatment', 'serum', 'exfoliant', 'mask'] },
  { key: 'moisturizer', title: 'MOISTURIZE & REPAIR', icon: 'heart-outline', types: ['moisturizer', 'cream', 'oil'] },
  { key: 'sunscreen', title: 'PROTECT', icon: 'sunny-outline', types: ['sunscreen'] },
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
    routineApi.getByDate(date).then((value) => { if (mounted) setRoutine(value); })
      .catch(() => { if (mounted) setRoutine(null); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [date, refreshKey]);

  if (loading) return <ActivityIndicator style={styles.loader} color={COLORS.primary} />;
  if (!routine) return null;
  const products = session === 'morning' ? (routine.morningProducts || []) : (routine.eveningProducts || []);
  const conditions = routine.skinConditions || [routine.skinCondition || 'Binh_Thuong'];

  return <View style={styles.container}>
    <View style={styles.headingRow}><View style={styles.headingCopy}><Text style={styles.title}>Today's routine</Text><Text style={styles.subtitle}>{conditions.map(formatCondition).join(' · ')}</Text>{routine.routinePlanId?.explanation ? <Text style={styles.explanation}>{routine.routinePlanId.explanation}</Text> : null}</View>{routine.isOverridden ? <View style={styles.badge}><Text style={styles.badgeText}>Adjusted</Text></View> : null}</View>
    <View style={styles.sessionSwitch}>{['morning', 'evening'].map((value) => <Pressable key={value} onPress={() => setSession(value)} style={[styles.session, session === value && styles.sessionActive]}><Text style={[styles.sessionText, session === value && styles.sessionTextActive]}>{value === 'morning' ? 'Morning' : 'Evening'}</Text></Pressable>)}</View>
    <View style={styles.cards}>{STEPS.map((step, index) => {
      const product = products.find((item) => step.types.includes(item.productType));
      return <View key={step.key} style={[styles.card, index === 2 && styles.treatmentCard]}>
        <View style={styles.stepHeader}><View style={styles.iconCircle}><Ionicons name={step.icon} size={19} color={COLORS.primary} /></View><Text style={styles.stepNumber}>STEP {index + 1}</Text></View>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={[styles.productName, !product && styles.noProduct]}>{product?.productName || 'No product selected'}</Text>
        <Text style={styles.instruction}>{getInstruction(step.key, product, conditions)}</Text>
        {product ? <Text style={styles.reason}>{getReason(product, conditions, routine.routinePlanId?.stepReasons)}</Text> : null}
      </View>;
    })}</View>
  </View>;
}

function formatCondition(value) {
  return ({ Binh_Thuong: 'Bình thường', Kho_Rat: 'Khô rát', Kich_Ung: 'Kích ứng', Noi_Mun: 'Nổi mụn', Bong_Dau: 'Bóng dầu' })[value] || value;
}
function getInstruction(step, product, conditions) {
  if (!product) return 'Add a suitable product to your collection to complete this step.';
  if (step === 'treatment' && conditions.some((value) => ['Kho_Rat', 'Kich_Ung'].includes(value))) return 'Prioritize barrier care, apply a thin layer, and monitor your skin.';
  if (step === 'sunscreen') return 'Apply in the morning and reapply as needed.';
  return 'Apply after the previous step and follow the product directions.';
}
function getReason(product, conditions, stepReasons = {}) {
  const generatedReason = stepReasons[product.productType] || stepReasons.treatment;
  if (generatedReason) return generatedReason;
  const condition = conditions[0];
  const label = ({ Kho_Rat: 'khô rát', Kich_Ung: 'kích ứng', Noi_Mun: 'nổi mụn', Bong_Dau: 'bóng dầu', Binh_Thuong: 'ổn định' })[condition] || 'tình trạng da hôm nay';
  const ingredients = (product.ingredients || []).slice(0, 2).join(' and ');
  return ingredients ? `${product.productName} contains ${ingredients}, selected for ${label} skin.` : `Selected to support your skin condition today (${label}).`;
}

const styles = StyleSheet.create({
  container: { marginTop: SPACING.lg }, loader: { marginTop: SPACING.lg }, headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headingCopy: { flex: 1, marginRight: SPACING.sm },
  title: { ...TYPOGRAPHY.section, color: COLORS.textMain }, subtitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 3 }, explanation: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 5 }, badge: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 5 }, badgeText: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: '700' },
  sessionSwitch: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.md }, session: { paddingVertical: 9, paddingHorizontal: SPACING.md, borderRadius: RADIUS.pill, backgroundColor: COLORS.surface }, sessionActive: { backgroundColor: COLORS.primary }, sessionText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary }, sessionTextActive: { color: COLORS.textLight, fontWeight: '700' },
  cards: { flexDirection: 'column', gap: SPACING.sm, paddingVertical: SPACING.md }, card: { width: '100%', minHeight: 160, padding: SPACING.md, borderRadius: RADIUS.card, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }, treatmentCard: { borderColor: COLORS.primary }, stepHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, iconCircle: { width: 38, height: 38, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryLight }, stepNumber: { ...TYPOGRAPHY.caption, color: COLORS.textMuted }, stepTitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 0.6, marginTop: SPACING.sm }, productName: { ...TYPOGRAPHY.label, color: COLORS.primary, marginTop: 5 }, noProduct: { color: COLORS.textMuted }, instruction: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 5, lineHeight: 18 }, reason: { ...TYPOGRAPHY.caption, color: COLORS.primary, marginTop: 7, fontWeight: '600' },
});
