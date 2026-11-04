import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useCollectionContext } from '../../context/CollectionContext';
import routineApi from '../../api/routineApi';
import { COLORS } from '../../constants/colors';
import { FONT_FAMILIES, RADIUS, SPACING, TYPOGRAPHY, getHeadingStyle } from '../../constants/theme';

const DURATIONS = [7, 14, 30];

export default function RoutineSetupScreen({ navigation }) {
  const { activeProducts, loading } = useCollectionContext();
  const [duration, setDuration] = useState(14);
  const [morning, setMorning] = useState([]);
  const [evening, setEvening] = useState([]);
  const [saving, setSaving] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const products = useMemo(() => activeProducts || [], [activeProducts]);

  useEffect(() => { routineApi.recommend({ conditions: ['Binh_Thuong'] }).then(setRecommendation).catch(() => setRecommendation(null)); }, []);

  const toggleProduct = (id, session) => {
    const setter = session === 'morning' ? setMorning : setEvening;
    setter((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const submit = async () => {
    if (saving) return;
    const selectedMorning = morning.length ? morning : (recommendation?.morningProducts || []).map((product) => product._id);
    const selectedEvening = evening.length ? evening : (recommendation?.eveningProducts || []).map((product) => product._id);
    if (!selectedMorning.length && !selectedEvening.length) return Alert.alert('Select products', 'Choose at least one product for your routine.');
    setSaving(true);
    try {
      await routineApi.createPlan({ totalDays: duration, conditions: ['Binh_Thuong'], morningProducts: selectedMorning, eveningProducts: selectedEvening });
      Alert.alert('Routine created', `Your ${duration}-day routine is ready.`, [{ text: 'View routine', onPress: () => navigation.goBack() }]);
    } catch (error) { Alert.alert('Unable to save routine', error?.response?.data?.message || error.message || 'Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <ScreenWrapper scroll>
      <View style={styles.header}><Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.back}><Ionicons name="arrow-back" size={21} color={COLORS.textMain} /></Pressable><View style={styles.headerCopy}><Text style={styles.eyebrow}>YOUR SKINCARE PLAN</Text><Text style={getHeadingStyle('Set up routine', 'title')}>Set up routine</Text></View></View>
      <Text style={styles.intro}>Build a simple plan using products already in your collection.</Text>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Routine duration</Text><Text style={styles.sectionHint}>Choose how long this treatment plan will run.</Text>
        <View style={styles.durationRow}>{DURATIONS.map((value) => <Pressable key={value} onPress={() => setDuration(value)} style={[styles.duration, duration === value && styles.selected]}><Text style={[styles.durationText, duration === value && styles.selectedText]}>{value} days</Text></Pressable>)}</View>
      </View>
      {recommendation?.message ? <View style={styles.recommendation}><Ionicons name="sparkles-outline" size={17} color={COLORS.primary} /><Text style={styles.recommendationText}>{recommendation.message}</Text></View> : null}
      <ProductSection title="Morning routine" subtitle="Select products for your AM routine." products={products} selected={morning} session="morning" onToggle={toggleProduct} loading={loading} />
      <ProductSection title="Evening routine" subtitle="Select products for your PM routine." products={products} selected={evening} session="evening" onToggle={toggleProduct} loading={loading} />
      <Pressable disabled={saving} onPress={submit} style={({ pressed }) => [styles.submit, pressed && styles.pressed, saving && styles.disabled]}><Ionicons name="checkmark-circle-outline" size={20} color={COLORS.textLight} /><Text style={styles.submitText}>{saving ? 'Saving routine...' : 'Start routine'}</Text></Pressable>
    </ScreenWrapper>
  );
}

function ProductSection({ title, subtitle, products, selected, session, onToggle, loading }) {
  return <View style={styles.sectionCard}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionHint}>{subtitle}</Text>
    {loading ? <Text style={styles.muted}>Loading your collection...</Text> : !products.length ? <Text style={styles.muted}>No active products in your collection yet.</Text> : products.map((product) => {
      const id = product._id || product.id; const active = selected.includes(id);
      return <Pressable key={id} onPress={() => onToggle(id, session)} style={[styles.product, active && styles.productSelected]}><Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={21} color={active ? COLORS.primary : COLORS.textMuted} /><View style={styles.productInfo}><Text style={styles.productName} numberOfLines={1}>{product.productName || product.name}</Text><Text style={styles.productType}>{product.productType || 'Skincare product'}</Text></View></Pressable>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, marginBottom: SPACING.sm }, back: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }, headerCopy: { marginLeft: SPACING.sm }, eyebrow: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontFamily: FONT_FAMILIES.interSemiBold, letterSpacing: 0.7 }, intro: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.md },
  sectionCard: { marginTop: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.card, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }, sectionTitle: { ...TYPOGRAPHY.label, color: COLORS.textMain }, sectionHint: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 3, marginBottom: SPACING.sm },
  durationRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.xs }, duration: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: RADIUS.input, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }, selected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary }, durationText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary }, selectedText: { color: COLORS.textLight, fontFamily: FONT_FAMILIES.interSemiBold },
  recommendation: { flexDirection: 'row', gap: SPACING.xs, alignItems: 'flex-start', marginTop: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.input, backgroundColor: COLORS.primaryLight }, recommendationText: { ...TYPOGRAPHY.caption, flex: 1, color: COLORS.primaryDark, lineHeight: 18 },
  product: { flexDirection: 'row', alignItems: 'center', padding: SPACING.sm, marginTop: SPACING.xs, borderRadius: RADIUS.input, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border }, productSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight }, productInfo: { flex: 1, marginLeft: SPACING.sm }, productName: { ...TYPOGRAPHY.label, color: COLORS.textMain }, productType: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 }, muted: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, paddingVertical: SPACING.sm },
  submit: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, marginTop: SPACING.lg, marginBottom: SPACING.xl, borderRadius: RADIUS.input, backgroundColor: COLORS.primary }, submitText: { ...TYPOGRAPHY.button, color: COLORS.textLight }, pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] }, disabled: { opacity: 0.6 },
});
