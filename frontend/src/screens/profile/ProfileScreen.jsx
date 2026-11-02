import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { updateSkinProfile, getMyRoutine, getRoutineHistory, suggestRoutine, getCurrentSkinProfile } from '../../api/routineApi';
import GuideFab from '../../components/routine/GuideFab';
import SkinGuideModal from '../../components/routine/SkinGuideModal';
import { Colors, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const SKIN_TYPES = [
    { id: 'oily', label: 'Oily', desc: 'More shine and congestion' },
    { id: 'dry', label: 'Dry', desc: 'Tight or rough feeling' },
    { id: 'combination', label: 'Combination', desc: 'Oily T-zone, dry cheeks' },
    { id: 'sensitive', label: 'Sensitive', desc: 'Easily flushed or reactive' },
    { id: 'normal', label: 'Normal', desc: 'Balanced and comfortable' },
];

const CONCERNS_LIST = [
    'Hidden acne & blackheads',
    'Visible pores',
    'Skin barrier',
    'Dark spots',
    'Early signs of aging',
];

const ALLERGIES_LIST = [
    'Alcohol Denat',
    'Fragrance',
    'Tea Tree Oil',
    'Mineral Oil',
];

const SKIN_TYPE_ALIASES = {
    da_dau: 'oily',
    da_kho: 'dry',
    da_hon_hop: 'combination',
    da_nhay_cam: 'sensitive',
    da_thuong: 'normal',
};

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(user?.skinProfile || {});
    const [loading, setLoading] = useState(false);
    const [myRoutines, setMyRoutines] = useState([]);
    const [routineHistory, setRoutineHistory] = useState([]);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedSkinType, setSelectedSkinType] = useState('normal');
    const [selectedConcerns, setSelectedConcerns] = useState([]);
    const [selectedAllergies, setSelectedAllergies] = useState([]);
    const [activePlanWarningVisible, setActivePlanWarningVisible] = useState(false);
    const [warningMsg, setWarningMsg] = useState('');
    const [reEvaluatePopupVisible, setReEvaluatePopupVisible] = useState(false);
    const [reEvaluateCount, setReEvaluateCount] = useState(0);
    const [guideModalVisible, setGuideModalVisible] = useState(false);

    const loadRoutines = useCallback(async (isCurrent = () => true) => {
        try {
            const [myRoutineResponse, historyResponse] = await Promise.all([getMyRoutine(), getRoutineHistory()]);
            if (!isCurrent()) return;
            setMyRoutines(myRoutineResponse?.data || []);
            setRoutineHistory(historyResponse?.data || []);
        } catch (error) {
            if (isCurrent()) Alert.alert('Unable to load routines', error.message || 'Please try again.');
        }
    }, []);

    useFocusEffect(useCallback(() => {
        let cancelled = false;
        loadRoutines(() => !cancelled);
        getCurrentSkinProfile().then(res => {
            if (!cancelled && res?.data?.skinProfile) setProfile(res.data.skinProfile);
        }).catch(() => {});
        return () => { cancelled = true; };
    }, [user, loadRoutines]));

    useEffect(() => {
        const skinType = SKIN_TYPE_ALIASES[profile.skinType] || profile.skinType || 'normal';
        setSelectedSkinType(skinType);
        setSelectedConcerns(profile.currentConcerns || []);
        setSelectedAllergies(profile.allergies || []);
    }, [profile]);

    const handleGenerateNewSuggestion = async () => {
        setLoading(true);
        try {
            const res = await suggestRoutine();
            if (res?.data?.plan) {
                navigation.navigate('RoutineDetail', { routineId: res.data.plan._id, mode: 'suggestion' });
            }
        } catch (error) {
            Alert.alert('Unable to build routine', error.message || 'Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (forceReset = false) => {
        setLoading(true);
        try {
            const res = await updateSkinProfile({
                skinType: selectedSkinType,
                allergies: selectedAllergies,
                currentConcerns: selectedConcerns,
                forceReset,
            });
            if (res?.data?.hasActivePlan) {
                setWarningMsg(res.data.warningMessage);
                setActivePlanWarningVisible(true);
                return;
            }
            if (res?.data?.user?.skinProfile) setProfile(res.data.user.skinProfile);
            setEditModalVisible(false);
            setActivePlanWarningVisible(false);
            setReEvaluateCount(res?.data?.reEvaluatedProductsCount || 0);
            setReEvaluatePopupVisible(true);
            loadRoutines();
        } catch (error) {
            Alert.alert('Unable to update profile', error.message || 'Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleValue = (value, setter) => setter(current => current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]);

    const skinType = SKIN_TYPES.find(item => item.id === selectedSkinType) || SKIN_TYPES[4];
    const concerns = profile.currentConcerns?.length ? profile.currentConcerns : selectedConcerns;
    const allergies = profile.allergies?.length ? profile.allergies : selectedAllergies;

    return (
        <View style={styles.screenWrapper}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.eyebrow}>SKINMATE</Text>
                    <Text style={styles.headerTitle}>Profile & Settings</Text>
                </View>
                <TouchableOpacity style={styles.guideIconBtn} onPress={() => setGuideModalVisible(true)} accessibilityLabel="Open skin guide">
                    <Ionicons name="book-outline" size={20} color={Colors.primaryDark} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.userBar} onPress={() => navigation.navigate('EditProfile')} accessibilityLabel="Edit personal profile">
                    <View style={styles.avatarBox}>
                        {user?.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={styles.accountAvatar} /> : <Ionicons name="person" size={40} color={Colors.primaryDark} />}
                        <View style={styles.accountCamera}><Ionicons name="camera" size={15} color={Colors.textLight} /></View>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.fullName || 'SkinMate member'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'No email available'}</Text>
                    </View>
                    <View style={styles.editAccountPill}><Ionicons name="create-outline" size={15} color={Colors.primaryDark} /><Text style={styles.editAccountText}>Edit profile</Text></View>
                </TouchableOpacity>

                <View style={styles.profileCard}>
                    <View style={styles.profileCardAccent} />
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.profileBadge}><Ionicons name="sparkles" size={14} color={Colors.primaryDark} /><Text style={styles.profileBadgeText}>CORE SKIN PROFILE</Text></View>
                        <TouchableOpacity onPress={() => setGuideModalVisible(true)}><Text style={styles.viewGuideText}>View Do/Don't</Text></TouchableOpacity>
                    </View>
                    <View style={styles.attributeBlock}>
                        <Text style={styles.attrLabel}>Base skin type</Text>
                        <View style={styles.skinTypePill}><Text style={styles.skinTypePillText}>{skinType.label}</Text></View>
                    </View>
                    <View style={styles.attributeBlock}>
                        <Text style={styles.attrLabel}>Skin concerns</Text>
                        <View style={styles.chipRow}>
                            {concerns.length ? concerns.map(item => <View key={item} style={styles.concernTag}><View style={styles.concernDot} /><Text style={styles.concernTagText}>{item}</Text></View>) : <Text style={styles.emptyAttribute}>No concerns added yet</Text>}
                        </View>
                    </View>
                    {allergies.length > 0 && <View style={styles.attributeBlock}>
                        <Text style={styles.attrLabel}>Allergies to avoid</Text>
                        <View style={styles.chipRow}>{allergies.map(item => <View key={item} style={styles.allergyTag}><Text style={styles.allergyTagText}>Avoid · {item}</Text></View>)}</View>
                    </View>}
                    <View style={styles.aiNoticeBox}><Ionicons name="information-circle" size={18} color={Colors.primaryDark} /><Text style={styles.aiNoticeText}><Text style={styles.boldText}>How this helps: </Text>your profile guides ingredient checks and routine suggestions for your personal collection.</Text></View>
                    <TouchableOpacity style={styles.resetProfileBtn} onPress={() => setEditModalVisible(true)}><Ionicons name="options-outline" size={18} color={Colors.textLight} /><Text style={styles.resetProfileBtnText}>Update skin profile</Text></TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateNewSuggestion} disabled={loading}><Ionicons name="bulb-outline" size={20} color={Colors.textLight} /><Text style={styles.generateBtnText}>Build my 7-day routine</Text></TouchableOpacity>

            <View style={styles.historySection}>
                    <View style={styles.sectionTitleRow}><Ionicons name="repeat-outline" size={20} color={Colors.primaryDark} /><Text style={styles.sectionHeading}>My routine</Text><Text style={styles.historyCount}>{myRoutines.length}</Text></View>
                    {myRoutines.length === 0 ? <View style={styles.emptyHistoryBox}><Text style={styles.emptyHistoryText}>No active or saved routines yet. Build a 7-day routine to get started.</Text></View> : myRoutines.map(item => <TouchableOpacity key={item._id} style={styles.historyCard} onPress={() => navigation.navigate('RoutineDetail', { routineId: item._id, mode: item.status === 'active' ? 'history' : 'suggestion' })}>
                        <View style={styles.historyCardTop}><Text style={styles.historyTitle} numberOfLines={2}>{item.title}</Text><View style={[styles.statusBadge, item.status === 'active' && styles.statusBadgeActive]}><Text style={[styles.statusBadgeText, item.status === 'active' && styles.statusBadgeTextActive]}>{item.status === 'active' ? 'Active' : 'Draft'}</Text></View></View>
                        <Text style={styles.historyGoal} numberOfLines={2}>{item.goal || 'A routine built around your current skin goals.'}</Text>
                        <View style={styles.historyFooter}><Text style={styles.historyDays}>{item.durationDays || 7} days · {item.skinTypeTarget || 'personalized'}</Text><View style={styles.viewDetailLink}><Text style={styles.viewDetailText}>{item.status === 'active' ? 'View routine' : 'Review draft'}</Text><Ionicons name="chevron-forward" size={14} color={Colors.primary} /></View></View>
                    </TouchableOpacity>)}
                </View>

                <View style={styles.historySection}>
                    <View style={styles.sectionTitleRow}><Ionicons name="time-outline" size={20} color={Colors.primaryDark} /><Text style={styles.sectionHeading}>Routine history</Text><Text style={styles.historyCount}>{routineHistory.length}</Text></View>
                    {routineHistory.length === 0 ? <View style={styles.emptyHistoryBox}><Text style={styles.emptyHistoryText}>Completed and cancelled routines will appear here.</Text></View> : routineHistory.map(item => <TouchableOpacity key={item._id} style={styles.historyCard} onPress={() => navigation.navigate('RoutineDetail', { routineId: item._id, mode: 'history' })}>
                        <View style={styles.historyCardTop}><Text style={styles.historyTitle} numberOfLines={2}>{item.title}</Text><View style={[styles.statusBadge, styles.statusBadgeCancelled]}><Text style={styles.statusBadgeText}>{['cancelled', 'canceled'].includes(item.status) ? 'Cancelled' : 'Completed'}</Text></View></View>
                        <Text style={styles.historyGoal} numberOfLines={2}>{item.goal || 'A routine built around your previous skin goals.'}</Text>
                        <View style={styles.historyFooter}><Text style={styles.historyDays}>{item.durationDays || 7} days · {item.skinTypeTarget || 'personalized'}</Text><View style={styles.viewDetailLink}><Text style={styles.viewDetailText}>View & copy</Text><Ionicons name="chevron-forward" size={14} color={Colors.primary} /></View></View>
                    </TouchableOpacity>)}
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}><Ionicons name="log-out-outline" size={18} color={Colors.error} /><Text style={styles.logoutBtnText}>Sign out</Text></TouchableOpacity>
            </ScrollView>

            <GuideFab customSkinType={profile?.skinType || selectedSkinType} customAllergies={profile?.allergies || selectedAllergies} />
            <SkinGuideModal visible={guideModalVisible} onClose={() => setGuideModalVisible(false)} skinType={profile?.skinType || selectedSkinType} allergies={profile?.allergies || selectedAllergies} />

            <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
                <View style={styles.modalOverlay}><View style={styles.modalSheet}><View style={styles.modalHeader}><Text style={styles.modalSheetTitle}>Update skin profile</Text><TouchableOpacity onPress={() => setEditModalVisible(false)}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity></View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.sheetSectionTitle}>New skin type</Text><View style={styles.skinTypeChoiceWrap}>{SKIN_TYPES.map(item => <TouchableOpacity key={item.id} style={[styles.choicePill, selectedSkinType === item.id && styles.choicePillActive]} onPress={() => setSelectedSkinType(item.id)}><Text style={[styles.choicePillText, selectedSkinType === item.id && styles.choicePillTextActive]}>{item.label}</Text></TouchableOpacity>)}</View>
                        <Text style={styles.sheetSectionTitle}>Skin concerns to improve</Text><View style={styles.chipWrap}>{CONCERNS_LIST.map(item => <TouchableOpacity key={item} style={[styles.smallChip, selectedConcerns.includes(item) && styles.smallChipActive]} onPress={() => toggleValue(item, setSelectedConcerns)}><Text style={[styles.smallChipText, selectedConcerns.includes(item) && styles.smallChipTextActive]}>{item}</Text></TouchableOpacity>)}</View>
                        <Text style={styles.sheetSectionTitle}>Ingredients to avoid</Text><View style={styles.chipWrap}>{ALLERGIES_LIST.map(item => <TouchableOpacity key={item} style={[styles.smallAllergyChip, selectedAllergies.includes(item) && styles.smallAllergyChipActive]} onPress={() => toggleValue(item, setSelectedAllergies)}><Text style={[styles.smallAllergyChipText, selectedAllergies.includes(item) && styles.smallAllergyChipTextActive]}>{item}</Text></TouchableOpacity>)}</View>
                    </ScrollView>
                    <TouchableOpacity style={styles.saveSheetBtn} onPress={() => handleSaveProfile(false)} disabled={loading}>{loading ? <ActivityIndicator size="small" color={Colors.textLight} /> : <Text style={styles.saveSheetBtnText}>Save & re-check my collection</Text>}</TouchableOpacity>
                </View></View>
            </Modal>

            <Modal visible={activePlanWarningVisible} transparent animationType="fade" onRequestClose={() => setActivePlanWarningVisible(false)}><View style={styles.alertOverlay}><View style={styles.alertCard}><View style={styles.alertIconBox}><Ionicons name="warning" size={32} color={Colors.error} /></View><Text style={styles.alertHeading}>Routine needs an update</Text><Text style={styles.alertMessage}>{warningMsg}</Text><View style={styles.alertBtnGroup}><TouchableOpacity style={styles.alertConfirmBtn} onPress={() => handleSaveProfile(true)}><Text style={styles.alertConfirmBtnText}>Cancel it and update my profile</Text></TouchableOpacity><TouchableOpacity style={styles.alertCancelBtn} onPress={() => setActivePlanWarningVisible(false)}><Text style={styles.alertCancelBtnText}>Keep current routine</Text></TouchableOpacity></View></View></View></Modal>
            <Modal visible={reEvaluatePopupVisible} transparent animationType="fade" onRequestClose={() => setReEvaluatePopupVisible(false)}><View style={styles.alertOverlay}><View style={styles.alertCard}><View style={styles.successIconBox}><Ionicons name="checkmark-done" size={32} color={Colors.primary} /></View><Text style={styles.alertHeading}>Collection re-checked</Text><Text style={styles.alertMessage}>Your skin profile changed. We re-checked {reEvaluateCount} products and refreshed your Do/Don't guide.</Text><TouchableOpacity style={styles.alertOkBtn} onPress={() => setReEvaluatePopupVisible(false)}><Text style={styles.alertOkBtnText}>Done</Text></TouchableOpacity></View></View></Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    screenWrapper: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.screen, paddingTop: 18, paddingBottom: 14, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
    eyebrow: { ...TYPOGRAPHY.caption, color: Colors.primary, fontWeight: '700', letterSpacing: 1.2 },
    headerTitle: { ...TYPOGRAPHY.section, color: Colors.textMain, fontSize: 20 },
    guideIconBtn: { width: 42, height: 42, borderRadius: RADIUS.pill, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
    contentScroll: { flex: 1 },
    contentContainer: { padding: SPACING.screen, paddingTop: SPACING.md, paddingBottom: 100 },
    userBar: { alignItems: 'center', backgroundColor: Colors.card, padding: SPACING.lg, borderRadius: RADIUS.card, marginBottom: SPACING.md, borderWidth: 1, borderColor: Colors.border, ...SHADOWS.light },
    avatarBox: { width: 88, height: 88, borderRadius: RADIUS.pill, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.primaryLight },
    accountAvatar: { width: 82, height: 82, borderRadius: RADIUS.pill },
    accountCamera: { position: 'absolute', right: -2, bottom: -2, width: 27, height: 27, borderRadius: RADIUS.pill, backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
    userInfo: { alignSelf: 'stretch', alignItems: 'center', marginTop: SPACING.md },
    userName: { ...TYPOGRAPHY.label, color: Colors.textMain, fontSize: 20, textAlign: 'center' },
    userEmail: { ...TYPOGRAPHY.caption, color: Colors.textSecondary, marginTop: SPACING.xs, textAlign: 'center' },
    editAccountPill: { flexDirection: 'row', gap: SPACING.xs, alignItems: 'center', justifyContent: 'center', minHeight: 44, paddingHorizontal: SPACING.md, marginTop: SPACING.sm, backgroundColor: Colors.surface, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: Colors.border },
    editAccountText: { ...TYPOGRAPHY.caption, color: Colors.primaryDark, fontWeight: '600' },
    accountDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.success },
    profileCard: { backgroundColor: Colors.card, borderRadius: RADIUS.cardLarge, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: Colors.borderDark, overflow: 'hidden', ...SHADOWS.light },
    profileCardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: Colors.primaryLight },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
    profileBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
    profileBadgeText: { color: Colors.primaryDark, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
    viewGuideText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
    attributeBlock: { marginBottom: SPACING.sm },
    attrLabel: { ...TYPOGRAPHY.caption, color: Colors.textSecondary, marginBottom: 5, fontWeight: '600' },
    skinTypePill: { alignSelf: 'flex-start', backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: Colors.borderDark },
    skinTypePillText: { color: Colors.primaryDark, fontWeight: '700', fontSize: 13 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    emptyAttribute: { ...TYPOGRAPHY.caption, color: Colors.textMuted },
    concernTag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fffbeb', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.small, borderWidth: 1, borderColor: '#fef3c7' },
    concernDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.warning },
    concernTagText: { color: '#92400e', fontSize: 11, fontWeight: '600' },
    allergyTag: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.small },
    allergyTagText: { color: '#991b1b', fontSize: 11, fontWeight: '600' },
    aiNoticeBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#ecfdf5', padding: 10, borderRadius: RADIUS.input, marginTop: 4, marginBottom: SPACING.md },
    aiNoticeText: { ...TYPOGRAPHY.caption, color: '#065f46', flex: 1, lineHeight: 17 },
    boldText: { fontWeight: '800' },
    resetProfileBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: RADIUS.input, minHeight: 48, paddingHorizontal: SPACING.md },
    resetProfileBtnText: { color: Colors.textLight, ...TYPOGRAPHY.button, fontSize: 14 },
    generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.success, borderRadius: RADIUS.pill, minHeight: 50, paddingHorizontal: SPACING.md, marginBottom: SPACING.lg },
    generateBtnText: { color: Colors.textLight, ...TYPOGRAPHY.button, fontSize: 14 },
    historySection: { marginBottom: SPACING.lg },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
    sectionHeading: { ...TYPOGRAPHY.label, color: Colors.textMain, fontSize: 17, flex: 1 },
    historyCount: { minWidth: 24, textAlign: 'center', color: Colors.primaryDark, backgroundColor: Colors.primaryLight, borderRadius: RADIUS.pill, paddingVertical: 3, fontSize: 11, fontWeight: '800' },
    emptyHistoryBox: { backgroundColor: Colors.card, borderRadius: RADIUS.input, padding: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
    emptyHistoryText: { ...TYPOGRAPHY.bodySmall, color: Colors.textSecondary, textAlign: 'center' },
    historyCard: { backgroundColor: Colors.card, borderRadius: RADIUS.input, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: Colors.border, ...SHADOWS.light },
    historyCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 5 },
    historyTitle: { ...TYPOGRAPHY.label, color: Colors.textMain, flex: 1 },
    statusBadge: { backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.pill },
    statusBadgeActive: { backgroundColor: Colors.primaryLight },
    statusBadgeCancelled: { backgroundColor: '#fee2e2' },
    statusBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary },
    statusBadgeTextActive: { color: Colors.primaryDark },
    historyGoal: { ...TYPOGRAPHY.caption, color: Colors.textSecondary, marginBottom: SPACING.sm },
    historyFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: SPACING.sm },
    historyDays: { ...TYPOGRAPHY.caption, color: Colors.textSecondary },
    viewDetailLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    viewDetailText: { ...TYPOGRAPHY.caption, color: Colors.primary, fontWeight: '800' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff1f2', borderRadius: RADIUS.input, minHeight: 48, marginTop: SPACING.sm },
    logoutBtnText: { color: Colors.error, fontWeight: '700', fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: Colors.card, borderTopLeftRadius: RADIUS.cardLarge, borderTopRightRadius: RADIUS.cardLarge, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: 32, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
    modalSheetTitle: { ...TYPOGRAPHY.title, color: Colors.textMain, fontSize: 20 },
    sheetSectionTitle: { ...TYPOGRAPHY.label, color: Colors.primaryDark, marginTop: SPACING.sm, marginBottom: SPACING.sm },
    skinTypeChoiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    choicePill: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: RADIUS.pill, backgroundColor: Colors.surface },
    choicePillActive: { backgroundColor: Colors.primary },
    choicePillText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
    choicePillTextActive: { color: Colors.textLight },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    smallChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: RADIUS.pill, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderDark },
    smallChipActive: { backgroundColor: Colors.success, borderColor: Colors.success },
    smallChipText: { fontSize: 11, color: Colors.textSecondary },
    smallChipTextActive: { color: Colors.textLight, fontWeight: '700' },
    smallAllergyChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: RADIUS.pill, backgroundColor: '#fff1f2' },
    smallAllergyChipActive: { backgroundColor: Colors.error },
    smallAllergyChipText: { fontSize: 11, color: '#991b1b' },
    smallAllergyChipTextActive: { color: Colors.textLight, fontWeight: '700' },
    saveSheetBtn: { backgroundColor: Colors.primary, borderRadius: RADIUS.input, minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.lg },
    saveSheetBtnText: { color: Colors.textLight, ...TYPOGRAPHY.button, fontSize: 14 },
    alertOverlay: { flex: 1, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg },
    alertCard: { backgroundColor: Colors.card, borderRadius: RADIUS.cardLarge, padding: SPACING.lg, width: '100%', maxWidth: 360, alignItems: 'center' },
    alertIconBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
    successIconBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
    alertHeading: { ...TYPOGRAPHY.title, fontSize: 19, color: Colors.textMain, marginBottom: 8, textAlign: 'center' },
    alertMessage: { ...TYPOGRAPHY.bodySmall, color: Colors.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
    alertBtnGroup: { width: '100%', gap: 10 },
    alertConfirmBtn: { backgroundColor: Colors.error, paddingVertical: 13, borderRadius: RADIUS.input, alignItems: 'center', paddingHorizontal: 10 },
    alertConfirmBtnText: { color: Colors.textLight, fontWeight: '700', fontSize: 13, textAlign: 'center' },
    alertCancelBtn: { backgroundColor: Colors.surface, paddingVertical: 13, borderRadius: RADIUS.input, alignItems: 'center' },
    alertCancelBtnText: { color: Colors.textMain, fontWeight: '600', fontSize: 13 },
    alertOkBtn: { backgroundColor: Colors.primary, paddingVertical: 13, borderRadius: RADIUS.input, alignItems: 'center', width: '100%' },
    alertOkBtnText: { color: Colors.textLight, fontWeight: '700', fontSize: 14 },
});

export default ProfileScreen;
