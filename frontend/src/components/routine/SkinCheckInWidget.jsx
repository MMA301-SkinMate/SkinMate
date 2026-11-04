import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import routineApi from '../../api/routineApi';
import { COLORS } from '../../constants/colors';

const OPTIONS = [
    { value: 'Binh_Thuong', label: 'Bình thường', icon: 'happy-outline' },
    { value: 'Kho_Rat', label: 'Khô rát', icon: 'water-outline' },
    { value: 'Kich_Ung', label: 'Kích ứng', icon: 'warning-outline' },
    { value: 'Noi_Mun', label: 'Nổi mụn', icon: 'ellipse-outline' },
    { value: 'Bong_Dau', label: 'Bóng dầu', icon: 'sunny-outline' },
];

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function SkinCheckInWidget({ onSaved }) {
    const date = useMemo(todayKey, []);
    const [selected, setSelected] = useState(['Binh_Thuong']);
    const [previous, setPrevious] = useState(null);
    const [saving, setSaving] = useState(false);
    const [undoVisible, setUndoVisible] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        routineApi.getByDate(date).then((routine) => {
            if (!mounted || !routine) return;
            setSelected(routine.skinConditions?.length ? routine.skinConditions : [routine.skinCondition || 'Binh_Thuong']);
        }).catch(() => { /* A missing routine is a valid first-use state. */ });
        return () => { mounted = false; };
    }, [date]);

    useEffect(() => {
        if (!undoVisible) return undefined;
        const timer = setTimeout(() => setUndoVisible(false), 10000);
        return () => clearTimeout(timer);
    }, [undoVisible]);

    const toggle = (value) => {
        setSelected((current) => {
            if (value === 'Binh_Thuong') return ['Binh_Thuong'];
            const next = current.filter((item) => item !== 'Binh_Thuong');
            const updated = next.includes(value)
                ? next.filter((item) => item !== value)
                : [...next, value];
            return updated.length ? updated : ['Binh_Thuong'];
        });
    };

    const submit = async () => {
        if (saving) return;
        setSaving(true);
        setError('');
        try {
            const result = await routineApi.checkIn({ date, conditions: selected });
            setPrevious(result.previousConditions || ['Binh_Thuong']);
            setUndoVisible(true);
            onSaved?.(selected);
            if (result.missingReplacement) {
                Alert.alert('Routine adjusted', 'Your collection does not have a B5/Panthenol or Ceramide recovery product.');
            } else if (result.applied) {
                Alert.alert('Routine adjusted', 'The treatment was temporarily replaced with a suitable recovery product.');
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to save your skin check-in.');
        } finally {
            setSaving(false);
        }
    };

    const undo = async () => {
        if (!previous) return;
        try {
            await routineApi.undoCheckIn({ date, previousConditions: previous });
            setSelected(previous);
            setUndoVisible(false);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to undo the check-in.');
        }
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Nhật ký làn da</Text>
            <Text style={styles.subtitle}>Da bạn hôm nay thế nào?</Text>
            <View style={styles.options}>
                {OPTIONS.map((option) => {
                    const active = selected.includes(option.value);
                    return (
                        <Pressable key={option.value} onPress={() => toggle(option.value)} style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && styles.optionPressed]}>
                            <View style={[styles.optionIcon, active && styles.optionIconActive]}><Ionicons name={option.icon} size={20} color={active ? COLORS.primary : COLORS.textSecondary} /></View>
                            <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
                        </Pressable>
                    );
                })}
            </View>
            <View style={styles.actions}>
                <Pressable disabled={saving} onPress={submit} style={styles.saveButton}>
                    <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save check-in'}</Text>
                </Pressable>
                {undoVisible && <Pressable onPress={undo}><Text style={styles.undo}>Undo</Text></Pressable>}
            </View>
            {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: COLORS.card, borderRadius: 24, padding: 18, marginTop: 18, borderWidth: 1, borderColor: '#e4eee9', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.045, shadowRadius: 12, elevation: 2 },
    title: { fontSize: 18, fontWeight: '700', color: COLORS.textMain },
    subtitle: { marginTop: 4, color: COLORS.textSecondary, fontSize: 13 },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 16 },
    option: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 15, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'transparent' },
    optionActive: { backgroundColor: '#e7f7f2', borderColor: '#b8e5d8' },
    optionPressed: { transform: [{ scale: 0.96 }] }, optionIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.card }, optionIconActive: { backgroundColor: 'rgba(255,255,255,0.8)' },
    optionText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
    optionTextActive: { color: COLORS.primary, fontWeight: '700' },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 16 },
    saveButton: { backgroundColor: COLORS.primary, paddingVertical: 11, paddingHorizontal: 18, borderRadius: 14 },
    saveText: { color: COLORS.textLight, fontWeight: '700' },
    undo: { color: COLORS.primary, fontWeight: '700' },
    error: { color: COLORS.error, marginTop: 10, fontSize: 12 },
});
