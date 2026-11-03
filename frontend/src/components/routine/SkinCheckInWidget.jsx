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
            onSaved?.();
            if (result.missingReplacement) {
                Alert.alert('Routine đã điều chỉnh', 'Bạn chưa có sản phẩm phục hồi B5/Panthenol hoặc Ceramide trong tủ đồ.');
            } else if (result.applied) {
                Alert.alert('Routine đã điều chỉnh', 'Đã tạm thay treatment bằng sản phẩm phục hồi phù hợp.');
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Không thể lưu nhật ký làn da.');
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
            setError(requestError.response?.data?.message || 'Không thể hoàn tác check-in.');
        }
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Nhật ký làn da</Text>
            <Text style={styles.subtitle}>Hôm nay da bạn đang như thế nào?</Text>
            <View style={styles.options}>
                {OPTIONS.map((option) => {
                    const active = selected.includes(option.value);
                    return (
                        <Pressable key={option.value} onPress={() => toggle(option.value)} style={[styles.option, active && styles.optionActive]}>
                            <Ionicons name={option.icon} size={22} color={active ? COLORS.primary : COLORS.textSecondary} />
                            <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
                        </Pressable>
                    );
                })}
            </View>
            <View style={styles.actions}>
                <Pressable disabled={saving} onPress={submit} style={styles.saveButton}>
                    <Text style={styles.saveText}>{saving ? 'Đang lưu...' : 'Lưu check-in'}</Text>
                </Pressable>
                {undoVisible && <Pressable onPress={undo}><Text style={styles.undo}>Hoàn tác</Text></Pressable>}
            </View>
            {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 16, marginTop: 20, borderWidth: 1, borderColor: COLORS.borderDark },
    title: { fontSize: 18, fontWeight: '700', color: COLORS.textMain },
    subtitle: { marginTop: 4, color: COLORS.textSecondary },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
    option: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 14, backgroundColor: COLORS.surface },
    optionActive: { backgroundColor: '#d7f3ed', borderColor: COLORS.primary, borderWidth: 1 },
    optionText: { fontSize: 12, color: COLORS.textSecondary },
    optionTextActive: { color: COLORS.primary, fontWeight: '700' },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 16 },
    saveButton: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
    saveText: { color: COLORS.textLight, fontWeight: '700' },
    undo: { color: COLORS.primary, fontWeight: '700' },
    error: { color: COLORS.error, marginTop: 10, fontSize: 12 },
});
