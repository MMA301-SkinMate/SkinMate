import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useCollectionContext } from '../../context/CollectionContext';
import routineApi from '../../api/routineApi';
import { COLORS } from '../../constants/colors';

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function RoutineEditScreen({ navigation, route }) {
    const { activeProducts } = useCollectionContext();
    const [routine, setRoutine] = useState(null);
    const [morning, setMorning] = useState([]);
    const [evening, setEvening] = useState([]);
    const [session, setSession] = useState('morning');
    const [saving, setSaving] = useState(false);
    const editDate = route.params?.date || todayKey();
    const editDayNumber = route.params?.dayNumber;

    useEffect(() => {
        routineApi.getByDate(editDate).then((value) => {
            setRoutine(value);
            setMorning((value?.morningProducts || []).map((product) => product._id || product));
            setEvening((value?.eveningProducts || []).map((product) => product._id || product));
        }).catch(() => Alert.alert('Error', 'Unable to load today’s routine.'));
    }, [editDate]);

    const selected = session === 'morning' ? morning : evening;
    const setSelected = session === 'morning' ? setMorning : setEvening;
    const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

    const save = async () => {
        if (!routine || saving) return;
        setSaving(true);
        try {
            const payload = {
                date: editDate,
                morningProducts: morning,
                eveningProducts: evening,
                skinConditions: routine.skinConditions || [routine.skinCondition || 'Binh_Thuong'],
                routinePlanId: routine.routinePlanId,
                routineGroupId: routine.routineGroupId,
                dayNumber: routine.dayNumber,
                totalDays: routine.totalDays,
            };
            const validation = await routineApi.validate(payload);
            if (!validation.valid) {
                setSaving(false);
                Alert.alert(
                    'Routine conflict',
                    validation.conflicts.map((conflict) => `• ${conflict.message}`).join('\n'),
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Save anyway', style: 'destructive', onPress: () => saveValidated(payload) },
                    ],
                );
                return;
            }
            await saveValidated(payload);
        } catch (error) {
            Alert.alert('Unable to save', error.response?.data?.message || 'Please try again.');
        } finally { setSaving(false); }
    };

    const saveValidated = async (payload) => {
        try {
            await routineApi.save(payload);
            Alert.alert('Changes saved', 'Today’s routine has been updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (error) {
            Alert.alert('Unable to save', error.response?.data?.message || 'Please try again.');
        } finally { setSaving(false); }
    };

    return <ScreenWrapper scroll>
        <View style={styles.header}><Pressable onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.textMain} /></Pressable><Text style={styles.title}>{editDayNumber ? `Edit day ${editDayNumber}` : 'Edit today’s routine'}</Text><View style={{ width: 24 }} /></View>
        <View style={styles.switch}><Pressable onPress={() => setSession('morning')} style={[styles.switchItem, session === 'morning' && styles.active]}><Text style={[styles.switchText, session === 'morning' && styles.activeText]}>Morning</Text></Pressable><Pressable onPress={() => setSession('evening')} style={[styles.switchItem, session === 'evening' && styles.active]}><Text style={[styles.switchText, session === 'evening' && styles.activeText]}>Evening</Text></Pressable></View>
        <Text style={styles.hint}>Choose products from your active collection for this day.</Text>
        <View style={styles.products}>{(activeProducts || []).map((product) => { const id = product._id || product.id; const isSelected = selected.includes(id); return <Pressable key={id} onPress={() => toggle(id)} style={[styles.product, isSelected && styles.productActive]}><Ionicons name={isSelected ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={isSelected ? COLORS.primary : COLORS.textMuted} /><View style={styles.info}><Text style={styles.name}>{product.productName || product.name}</Text><Text style={styles.type}>{product.productType || 'Skincare product'}</Text></View></Pressable>; })}</View>
        <Pressable disabled={saving || !routine} onPress={save} style={styles.save}><Text style={styles.saveText}>{saving ? 'Saving...' : 'Save changes'}</Text></Pressable>
    </ScreenWrapper>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }, title: { color: COLORS.textMain, fontSize: 19, fontWeight: '700' }, switch: { flexDirection: 'row', gap: 8, marginTop: 12 }, switchItem: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 12, backgroundColor: COLORS.surface }, active: { backgroundColor: COLORS.primary }, switchText: { color: COLORS.textSecondary, fontWeight: '600' }, activeText: { color: COLORS.textLight }, hint: { marginTop: 14, color: COLORS.textSecondary, fontSize: 13 }, products: { gap: 8, marginTop: 14 }, product: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: COLORS.borderDark, backgroundColor: COLORS.card }, productActive: { borderColor: COLORS.primary, backgroundColor: '#effcf9' }, info: { marginLeft: 10 }, name: { color: COLORS.textMain, fontWeight: '600' }, type: { color: COLORS.textSecondary, fontSize: 12, marginTop: 3 }, save: { marginVertical: 28, alignItems: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: COLORS.primary }, saveText: { color: COLORS.textLight, fontWeight: '700', fontSize: 16 } });
