import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { updateSkinProfile, getRoutineHistory, suggestRoutine } from '../../api/routineApi';
import GuideFab from '../../components/routine/GuideFab';
import SkinGuideModal from '../../components/routine/SkinGuideModal';

const SKIN_TYPES = [
    { id: 'oily', label: 'Da Dầu', desc: 'Nhiều dầu, mụn cám' },
    { id: 'dry', label: 'Da Khô', desc: 'Khô ráp, căng rát' },
    { id: 'combination', label: 'Da Hỗn Hợp', desc: 'Dầu vùng T, khô má' },
    { id: 'sensitive', label: 'Da Nhạy Cảm', desc: 'Dễ ửng đỏ, châm chích' },
    { id: 'normal', label: 'Da Thường', desc: 'Cân bằng khỏe mạnh' },
];

const CONCERNS_LIST = [
    'Mụn ẩn & đầu đen',
    'Lỗ chân lông to',
    'Hàng rào phục hồi',
    'Thâm sạm da',
    'Lão hóa sớm',
];

const ALLERGIES_LIST = [
    'Alcohol Denat (Cồn khô)',
    'Fragrance (Hương liệu)',
    'Tea Tree Oil (Tràm trà)',
    'Mineral Oil (Dầu khoáng)',
];

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [routineHistory, setRoutineHistory] = useState([]);

    // Skin Profile Modal State (UC 40)
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedSkinType, setSelectedSkinType] = useState('oily');
    const [selectedConcerns, setSelectedConcerns] = useState([]);
    const [selectedAllergies, setSelectedAllergies] = useState([]);

    // Warning Active Plan Modal State (UC 40.3)
    const [activePlanWarningVisible, setActivePlanWarningVisible] = useState(false);
    const [warningMsg, setWarningMsg] = useState('');

    // Re-evaluate Success Popup (UC 40.2)
    const [reEvaluatePopupVisible, setReEvaluatePopupVisible] = useState(false);
    const [reEvaluateCount, setReEvaluateCount] = useState(0);

    // Guide Modal
    const [guideModalVisible, setGuideModalVisible] = useState(false);

    useEffect(() => {
        loadHistory();
        if (user?.skinProfile) {
            setSelectedSkinType(user.skinProfile.skinType || 'oily');
            setSelectedConcerns(user.skinProfile.currentConcerns || ['Mụn ẩn & đầu đen']);
            setSelectedAllergies(user.skinProfile.allergies || ['Alcohol Denat (Cồn khô)']);
        }
    }, [user]);

    const loadHistory = async () => {
        try {
            const res = await getRoutineHistory();
            if (res?.data?.data) {
                setRoutineHistory(res.data.data);
            }
        } catch (e) {
            console.log('Chưa có lịch sử hoặc lỗi tải lịch sử');
        }
    };

    // UC 8: Bấm tạo gợi ý chuỗi routine mới từ Home/Profile
    const handleGenerateNewSuggestion = async () => {
        setLoading(true);
        try {
            const res = await suggestRoutine();
            if (res?.data?.data?.plan) {
                navigation.navigate('RoutineDetail', {
                    routineId: res.data.data.plan._id,
                    mode: 'suggestion',
                });
            }
        } catch (err) {
            Alert.alert('Thông báo', err.message || 'Không thể tạo chuỗi routine');
        } finally {
            setLoading(false);
        }
    };

    // UC 40: Lưu thiết lập hồ sơ da
    const handleSaveProfile = async (forceReset = false) => {
        setLoading(true);
        try {
            const res = await updateSkinProfile({
                skinType: selectedSkinType,
                allergies: selectedAllergies,
                currentConcerns: selectedConcerns,
                forceReset,
            });

            if (res?.data?.data?.hasActivePlan) {
                // Có phác đồ đang chạy => Cảnh báo rẽ nhánh (UC 40.3)
                setWarningMsg(res.data.data.warningMessage);
                setActivePlanWarningVisible(true);
                return;
            }

            // Thành công => Hiện popup đánh giá lại tủ đồ (UC 40.2)
            setEditModalVisible(false);
            setActivePlanWarningVisible(false);
            setReEvaluateCount(res?.data?.data?.reEvaluatedProductsCount || 0);
            setReEvaluatePopupVisible(true);
            loadHistory();
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể cập nhật hồ sơ da');
        } finally {
            setLoading(false);
        }
    };

    const toggleConcern = (c) => {
        if (selectedConcerns.includes(c)) {
            setSelectedConcerns(selectedConcerns.filter(i => i !== c));
        } else {
            setSelectedConcerns([...selectedConcerns, c]);
        }
    };

    const toggleAllergy = (a) => {
        if (selectedAllergies.includes(a)) {
            setSelectedAllergies(selectedAllergies.filter(i => i !== a));
        } else {
            setSelectedAllergies([...selectedAllergies, a]);
        }
    };

    const skinTypeDisplay = {
        oily: 'Da Dầu (Oily Skin)',
        dry: 'Da Khô (Dry Skin)',
        combination: 'Da Hỗn Hợp (Combination)',
        sensitive: 'Da Nhạy Cảm (Sensitive)',
        normal: 'Da Thường (Normal)',
    };

    return (
        <View style={styles.screenWrapper}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hồ Sơ & Cài Đặt</Text>
                <TouchableOpacity
                    style={styles.guideIconBtn}
                    onPress={() => setGuideModalVisible(true)}
                >
                    <Ionicons name="book-outline" size={20} color="#006c49" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                {/* User Info Bar */}
                <View style={styles.userBar}>
                    <View style={styles.avatarBox}>
                        <Ionicons name="person" size={28} color="#006c49" />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.fullName || 'Người dùng SkinMate'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'user@skinmate.vn'}</Text>
                    </View>
                </View>

                {/* ================= SECTION 1: CORE AI SKIN PROFILE CARD (stitch.txt dòng 320 - 370) ================= */}
                <View style={styles.profileCard}>
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.profileBadge}>
                            <Ionicons name="sparkles" size={14} color="#005236" />
                            <Text style={styles.profileBadgeText}>HỒ SƠ DA CỐT LÕI</Text>
                        </View>
                        <TouchableOpacity onPress={() => setGuideModalVisible(true)}>
                            <Text style={styles.viewGuideText}>Xem Do/Don't</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Skin Type */}
                    <View style={styles.attributeBlock}>
                        <Text style={styles.attrLabel}>Loại da nền tảng:</Text>
                        <View style={styles.skinTypePill}>
                            <Text style={styles.skinTypePillText}>
                                {skinTypeDisplay[user?.skinProfile?.skinType || selectedSkinType] || 'Da Dầu'}
                            </Text>
                        </View>
                    </View>

                    {/* Concerns */}
                    <View style={styles.attributeBlock}>
                        <Text style={styles.attrLabel}>Vấn đề da cần giải quyết:</Text>
                        <View style={styles.chipRow}>
                            {(user?.skinProfile?.currentConcerns?.length > 0
                                ? user.skinProfile.currentConcerns
                                : selectedConcerns
                            ).map((c, idx) => (
                                <View key={idx} style={styles.concernTag}>
                                    <View style={styles.concernDot} />
                                    <Text style={styles.concernTagText}>{c}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Dị ứng */}
                    {(user?.skinProfile?.allergies?.length > 0 || selectedAllergies.length > 0) && (
                        <View style={styles.attributeBlock}>
                            <Text style={styles.attrLabel}>Thành phần dị ứng:</Text>
                            <View style={styles.chipRow}>
                                {(user?.skinProfile?.allergies?.length > 0
                                    ? user.skinProfile.allergies
                                    : selectedAllergies
                                ).map((a, idx) => (
                                    <View key={idx} style={styles.allergyTag}>
                                        <Text style={styles.allergyTagText}>⛔ {a}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* AI Algorithm Recommendation Notice (stitch.txt dòng 350) */}
                    <View style={styles.aiNoticeBox}>
                        <Ionicons name="information-circle" size={18} color="#006c49" />
                        <Text style={styles.aiNoticeText}>
                            <Text style={styles.boldText}>Tác động thuật toán:</Text> Hồ sơ da định hướng trực tiếp khả năng phát hiện thành phần kỵ nhau & gợi ý chuỗi routine trong Tủ đồ cá nhân của bạn.
                        </Text>
                    </View>

                    {/* UC 40: Nút Primary Action CTA: Thiết lập lại hồ sơ da */}
                    <TouchableOpacity
                        style={styles.resetProfileBtn}
                        onPress={() => setEditModalVisible(true)}
                    >
                        <Ionicons name="sync-outline" size={18} color="#ffffff" />
                        <Text style={styles.resetProfileBtnText}>Thiết lập lại hồ sơ da</Text>
                    </TouchableOpacity>
                </View>

                {/* UC 8: Nút Tạo chuỗi Routine thông minh */}
                <TouchableOpacity
                    style={styles.generateBtn}
                    onPress={handleGenerateNewSuggestion}
                    disabled={loading}
                >
                    <Ionicons name="bulb-outline" size={20} color="#ffffff" />
                    <Text style={styles.generateBtnText}>Gợi ý chuỗi Routine 7 ngày cải thiện da</Text>
                </TouchableOpacity>

                {/* ================= SECTION 2: ROUTINE HISTORY (UC 41) ================= */}
                <View style={styles.historySection}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="time-outline" size={20} color="#00422b" />
                        <Text style={styles.sectionHeading}>Lịch Sử Chuỗi Routine (Routine History)</Text>
                    </View>

                    {routineHistory.length === 0 ? (
                        <View style={styles.emptyHistoryBox}>
                            <Text style={styles.emptyHistoryText}>
                                Bạn chưa có lịch sử chuỗi routine nào. Hãy bấm nút "Gợi ý chuỗi Routine" ở trên để bắt đầu!
                            </Text>
                        </View>
                    ) : (
                        routineHistory.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.historyCard}
                                onPress={() => navigation.navigate('RoutineDetail', {
                                    routineId: item._id,
                                    mode: 'history', // UC 42
                                })}
                            >
                                <View style={styles.historyCardTop}>
                                    <Text style={styles.historyTitle}>{item.title}</Text>
                                    <View style={[
                                        styles.statusBadge,
                                        item.status === 'active' && styles.statusBadgeActive,
                                        item.status === 'cancelled' && styles.statusBadgeCancelled,
                                    ]}>
                                        <Text style={[
                                            styles.statusBadgeText,
                                            item.status === 'active' && styles.statusBadgeTextActive,
                                        ]}>
                                            {item.status === 'active' ? 'Đang dùng' : item.status === 'cancelled' ? 'Đã hủy' : item.status === 'draft' ? 'Bản nháp' : 'Đã xong'}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.historyGoal}>{item.goal}</Text>

                                <View style={styles.historyFooter}>
                                    <Text style={styles.historyDays}>
                                        {item.durationDays || 7} ngày • Dành cho da {item.skinTypeTarget || 'hỗn hợp'}
                                    </Text>
                                    <View style={styles.viewDetailLink}>
                                        <Text style={styles.viewDetailText}>Xem & Copy</Text>
                                        <Ionicons name="chevron-forward" size={14} color="#006c49" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Đăng xuất */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Ionicons name="log-out-outline" size={18} color="#ba1a1a" />
                    <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* UC 10: NÚT FAB GUIDE NỔI TOÀN APP */}
            <GuideFab
                customSkinType={user?.skinProfile?.skinType || selectedSkinType}
                customAllergies={user?.skinProfile?.allergies || selectedAllergies}
            />

            {/* UC 6: Modal Cẩm nang da */}
            <SkinGuideModal
                visible={guideModalVisible}
                onClose={() => setGuideModalVisible(false)}
                skinType={user?.skinProfile?.skinType || selectedSkinType}
                allergies={user?.skinProfile?.allergies || selectedAllergies}
            />

            {/* UC 40: MODAL THIẾT LẬP LẠI HỒ SƠ DA */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalSheetTitle}>Thiết Lập Lại Hồ Sơ Da</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6c7a71" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Loại da */}
                            <Text style={styles.sheetSectionTitle}>Loại da mới:</Text>
                            <View style={styles.skinTypeChoiceWrap}>
                                {SKIN_TYPES.map(st => (
                                    <TouchableOpacity
                                        key={st.id}
                                        style={[
                                            styles.choicePill,
                                            selectedSkinType === st.id && styles.choicePillActive,
                                        ]}
                                        onPress={() => setSelectedSkinType(st.id)}
                                    >
                                        <Text style={[
                                            styles.choicePillText,
                                            selectedSkinType === st.id && styles.choicePillTextActive,
                                        ]}>
                                            {st.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Vấn đề da */}
                            <Text style={styles.sheetSectionTitle}>Vấn đề da cần cải thiện:</Text>
                            <View style={styles.chipWrap}>
                                {CONCERNS_LIST.map((c, i) => {
                                    const active = selectedConcerns.includes(c);
                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            style={[styles.smallChip, active && styles.smallChipActive]}
                                            onPress={() => toggleConcern(c)}
                                        >
                                            <Text style={[styles.smallChipText, active && styles.smallChipTextActive]}>
                                                {c}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Dị ứng */}
                            <Text style={styles.sheetSectionTitle}>Thành phần dị ứng cần loại trừ:</Text>
                            <View style={styles.chipWrap}>
                                {ALLERGIES_LIST.map((a, i) => {
                                    const active = selectedAllergies.includes(a);
                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            style={[styles.smallAllergyChip, active && styles.smallAllergyChipActive]}
                                            onPress={() => toggleAllergy(a)}
                                        >
                                            <Text style={[styles.smallAllergyChipText, active && styles.smallAllergyChipTextActive]}>
                                                {a}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.saveSheetBtn}
                            onPress={() => handleSaveProfile(false)}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text style={styles.saveSheetBtnText}>Lưu & Đánh giá lại hệ thống</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* UC 40.3: POPUP CẢNH BÁO RẼ NHÁNH TÁC ĐỘNG ĐẾN PHÁC ĐỒ ĐANG CHẠY */}
            <Modal
                visible={activePlanWarningVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setActivePlanWarningVisible(false)}
            >
                <View style={styles.alertOverlay}>
                    <View style={styles.alertCard}>
                        <View style={styles.alertIconBox}>
                            <Ionicons name="warning" size={32} color="#ba1a1a" />
                        </View>
                        <Text style={styles.alertHeading}>Cảnh Báo Hủy Phác Đồ</Text>
                        <Text style={styles.alertMessage}>{warningMsg}</Text>

                        <View style={styles.alertBtnGroup}>
                            <TouchableOpacity
                                style={styles.alertConfirmBtn}
                                onPress={() => handleSaveProfile(true)}
                            >
                                <Text style={styles.alertConfirmBtnText}>Chắc chắn, hủy và đổi hồ sơ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.alertCancelBtn}
                                onPress={() => setActivePlanWarningVisible(false)}
                            >
                                <Text style={styles.alertCancelBtnText}>Giữ nguyên phác đồ cũ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* UC 40.2: POPUP THÔNG BÁO ĐÁNH GIÁ LẠI TỦ ĐỒ (RE-EVALUATE CLOSET) */}
            <Modal
                visible={reEvaluatePopupVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setReEvaluatePopupVisible(false)}
            >
                <View style={styles.alertOverlay}>
                    <View style={styles.alertCard}>
                        <View style={styles.successIconBox}>
                            <Ionicons name="checkmark-done" size={32} color="#006c49" />
                        </View>
                        <Text style={styles.alertHeading}>Đánh Giá Lại Tủ Đồ</Text>
                        <Text style={styles.alertMessage}>
                            Hồ sơ da của bạn đã thay đổi. Hệ thống đã đánh giá lại mức độ phù hợp của {reEvaluateCount} sản phẩm trong tủ đồ và cập nhật cẩm nang Do's & Don'ts mới.
                        </Text>
                        <TouchableOpacity
                            style={styles.alertOkBtn}
                            onPress={() => setReEvaluatePopupVisible(false)}
                        >
                            <Text style={styles.alertOkBtnText}>Tuyệt vời</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    screenWrapper: {
        flex: 1,
        backgroundColor: '#f9f9ff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 14,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9edff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#141b2b',
    },
    guideIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e9edff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentScroll: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    userBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#ffffff',
        padding: 14,
        borderRadius: 20,
        marginBottom: 16,
    },
    avatarBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#97f5cc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#141b2b',
    },
    userEmail: {
        fontSize: 12,
        color: '#6c7a71',
        marginTop: 2,
    },
    profileCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: '#bbcabf',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    profileBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#97f5cc',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    profileBadgeText: {
        color: '#005236',
        fontSize: 11,
        fontWeight: '700',
    },
    viewGuideText: {
        color: '#006c49',
        fontSize: 12,
        fontWeight: '700',
    },
    attributeBlock: {
        marginBottom: 12,
    },
    attrLabel: {
        fontSize: 12,
        color: '#6c7a71',
        marginBottom: 4,
        fontWeight: '500',
    },
    skinTypePill: {
        alignSelf: 'flex-start',
        backgroundColor: '#e9edff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    skinTypePillText: {
        color: '#00422b',
        fontWeight: '700',
        fontSize: 13,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    concernTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#fffbeb',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    concernDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#f59e0b',
    },
    concernTagText: {
        color: '#92400e',
        fontSize: 11,
        fontWeight: '600',
    },
    allergyTag: {
        backgroundColor: '#fee2e2',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    allergyTagText: {
        color: '#991b1b',
        fontSize: 11,
        fontWeight: '600',
    },
    aiNoticeBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#ecfdf5',
        padding: 10,
        borderRadius: 12,
        marginTop: 6,
        marginBottom: 14,
    },
    aiNoticeText: {
        fontSize: 11,
        color: '#065f46',
        flex: 1,
        lineHeight: 16,
    },
    boldText: {
        fontWeight: '700',
    },
    resetProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#006c49',
        borderRadius: 16,
        paddingVertical: 13,
        shadowColor: '#006c49',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 2,
    },
    resetProfileBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    generateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#10b981',
        borderRadius: 20,
        paddingVertical: 14,
        marginBottom: 20,
    },
    generateBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    historySection: {
        marginBottom: 24,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionHeading: {
        fontSize: 15,
        fontWeight: '700',
        color: '#141b2b',
    },
    emptyHistoryBox: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    emptyHistoryText: {
        fontSize: 13,
        color: '#6c7a71',
        textAlign: 'center',
        lineHeight: 18,
    },
    historyCard: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    historyCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#141b2b',
        flex: 1,
    },
    statusBadge: {
        backgroundColor: '#e9edff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statusBadgeActive: {
        backgroundColor: '#97f5cc',
    },
    statusBadgeCancelled: {
        backgroundColor: '#fee2e2',
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#6c7a71',
    },
    statusBadgeTextActive: {
        color: '#005236',
    },
    historyGoal: {
        fontSize: 12,
        color: '#6c7a71',
        marginBottom: 8,
    },
    historyFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#f1f3ff',
        paddingTop: 8,
    },
    historyDays: {
        fontSize: 11,
        color: '#3c4a42',
    },
    viewDetailLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    viewDetailText: {
        fontSize: 12,
        color: '#006c49',
        fontWeight: '700',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fee2e2',
        borderRadius: 16,
        paddingVertical: 14,
        marginBottom: 90,
    },
    logoutBtnText: {
        color: '#ba1a1a',
        fontWeight: '700',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(20, 27, 43, 0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 32,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    modalSheetTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#141b2b',
    },
    sheetSectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#00422b',
        marginTop: 12,
        marginBottom: 8,
    },
    skinTypeChoiceWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    choicePill: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: '#e9edff',
    },
    choicePillActive: {
        backgroundColor: '#006c49',
    },
    choicePillText: {
        fontSize: 12,
        color: '#3c4a42',
        fontWeight: '600',
    },
    choicePillTextActive: {
        color: '#ffffff',
    },
    chipWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    smallChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#f1f3ff',
        borderWidth: 1,
        borderColor: '#bbcabf',
    },
    smallChipActive: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    smallChipText: {
        fontSize: 11,
        color: '#3c4a42',
    },
    smallChipTextActive: {
        color: '#ffffff',
        fontWeight: '600',
    },
    smallAllergyChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#fee2e2',
    },
    smallAllergyChipActive: {
        backgroundColor: '#ba1a1a',
    },
    smallAllergyChipText: {
        fontSize: 11,
        color: '#991b1b',
    },
    smallAllergyChipTextActive: {
        color: '#ffffff',
        fontWeight: '600',
    },
    saveSheetBtn: {
        backgroundColor: '#10b981',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    saveSheetBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    alertOverlay: {
        flex: 1,
        backgroundColor: 'rgba(20, 27, 43, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    alertCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
    },
    alertIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    successIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#d1fae5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    alertHeading: {
        fontSize: 18,
        fontWeight: '700',
        color: '#141b2b',
        marginBottom: 8,
        textAlign: 'center',
    },
    alertMessage: {
        fontSize: 13,
        color: '#4b5563',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
    },
    alertBtnGroup: {
        width: '100%',
        gap: 10,
    },
    alertConfirmBtn: {
        backgroundColor: '#ba1a1a',
        paddingVertical: 13,
        borderRadius: 14,
        alignItems: 'center',
    },
    alertConfirmBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 13,
    },
    alertCancelBtn: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 13,
        borderRadius: 14,
        alignItems: 'center',
    },
    alertCancelBtnText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 13,
    },
    alertOkBtn: {
        backgroundColor: '#006c49',
        paddingVertical: 13,
        paddingHorizontal: 32,
        borderRadius: 14,
        alignItems: 'center',
        width: '100%',
    },
    alertOkBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
    },
});

export default ProfileScreen;
