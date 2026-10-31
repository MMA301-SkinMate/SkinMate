import React, { useState, useEffect } from 'react';
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
import {
    getRoutineDetail,
    activateRoutine,
    dismissRoutine,
    checkCopyCompatibility,
    executeCopyRoutine,
} from '../../api/routineApi';

const RoutineDetailScreen = ({ route, navigation }) => {
    const { routineId, mode = 'suggestion' } = route.params || {}; // 'suggestion' | 'history'

    const [loading, setLoading] = useState(true);
    const [planData, setPlanData] = useState(null);
    const [dailyRoutines, setDailyRoutines] = useState([]);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('am'); // 'am' | 'pm'

    // Copy Dialog State (UC 43)
    const [copyModalVisible, setCopyModalVisible] = useState(false);
    const [copyCompatibility, setCopyCompatibility] = useState(null);
    const [copying, setCopying] = useState(false);

    useEffect(() => {
        if (routineId) {
            loadDetail();
        }
    }, [routineId]);

    const loadDetail = async () => {
        setLoading(true);
        try {
            const res = await getRoutineDetail(routineId);
            if (res?.data?.data) {
                setPlanData(res.data.data.plan);
                setDailyRoutines(res.data.data.dailyRoutines || []);
            }
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể tải chi tiết chuỗi routine');
        } finally {
            setLoading(false);
        }
    };

    // UC 9: Thêm vào chuỗi routine của tôi
    const handleActivate = async () => {
        try {
            await activateRoutine(routineId);
            Alert.alert('Thành công', 'Đã thêm vào chuỗi routine chính của bạn!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể kích hoạt routine');
        }
    };

    // UC 9: Bỏ qua (Lưu nháp)
    const handleDismiss = async () => {
        try {
            await dismissRoutine(routineId);
            Alert.alert('Đã lưu nháp', 'Chuỗi routine đã được lưu vào bản nháp để bạn có thể xem lại bất kỳ lúc nào.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể lưu nháp');
        }
    };

    // UC 43: Bấm nút Copy từ History Detail
    const handleCheckAndCopy = async () => {
        setCopying(true);
        try {
            const res = await checkCopyCompatibility(routineId);
            if (res?.data?.data) {
                setCopyCompatibility(res.data.data);
                setCopyModalVisible(true);
            }
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể kiểm tra đối chiếu tủ đồ');
        } finally {
            setCopying(false);
        }
    };

    // UC 43: Xác nhận thực thi Copy
    const handleConfirmCopy = async (userChoice) => {
        setCopying(true);
        try {
            const res = await executeCopyRoutine(routineId, userChoice);
            setCopyModalVisible(false);
            Alert.alert('Sao chép thành công', res?.data?.message || 'Đã sao chép chuỗi routine!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể sao chép routine');
        } finally {
            setCopying(false);
        }
    };

    // UC 44: Chuyển qua màn hình Chia sẻ bài đăng
    const handleShareToCommunity = () => {
        navigation.navigate('CreatePost', {
            prefillRoutineId: routineId,
            routineTitle: planData?.title,
            routineGoal: planData?.goal,
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#006c49" />
                <Text style={styles.loadingText}>Đang tải chi tiết phác đồ routine...</Text>
            </View>
        );
    }

    const currentDay = dailyRoutines[selectedDayIndex] || dailyRoutines[0];
    const stepsToShow = activeTab === 'am'
        ? (currentDay?.morningSteps || [])
        : (currentDay?.eveningSteps || []);

    return (
        <View style={styles.screenWrapper}>
            {/* Header bar */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#141b2b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {mode === 'history' ? 'Chi Tiết Lịch Sử Routine' : 'Gợi Ý Chuỗi Routine'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                {/* Routine Card Overview (giống stitch.txt dòng 2110-2160) */}
                <View style={styles.overviewCard}>
                    <View style={styles.badgeRow}>
                        <View style={styles.targetBadge}>
                            <Text style={styles.targetBadgeText}>
                                Da {planData?.skinTypeTarget || 'hỗn hợp'} • {planData?.durationDays || 7} Ngày
                            </Text>
                        </View>
                        {planData?.status === 'active' && (
                            <View style={styles.activePill}>
                                <Text style={styles.activePillText}>Đang chạy</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.routineTitle}>{planData?.title}</Text>
                    <Text style={styles.routineGoal}>🎯 {planData?.goal}</Text>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Quick Metrics */}
                    <View style={styles.metricsRow}>
                        <View style={styles.metricItem}>
                            <Ionicons name="sparkles" size={18} color="#006c49" />
                            <View>
                                <Text style={styles.metricLabel}>Độ phù hợp</Text>
                                <Text style={styles.metricValue}>95% làn da</Text>
                            </View>
                        </View>
                        <View style={styles.metricItem}>
                            <Ionicons name="time-outline" size={18} color="#9b4500" />
                            <View>
                                <Text style={styles.metricLabel}>Thời gian</Text>
                                <Text style={styles.metricValue}>~15 phút/ngày</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Day Selector (Ngày 1..7) */}
                <Text style={styles.daySelectorTitle}>Chọn ngày trong lộ trình:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
                    {dailyRoutines.map((d, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[
                                styles.dayPill,
                                selectedDayIndex === idx && styles.dayPillActive,
                            ]}
                            onPress={() => setSelectedDayIndex(idx)}
                        >
                            <Text style={[
                                styles.dayPillText,
                                selectedDayIndex === idx && styles.dayPillTextActive,
                            ]}>
                                Ngày {d.dayNumber}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Segment Bar AM / PM (stitch.txt dòng 2165) */}
                <View style={styles.segmentContainer}>
                    <TouchableOpacity
                        style={[styles.segmentBtn, activeTab === 'am' && styles.segmentBtnActive]}
                        onPress={() => setActiveTab('am')}
                    >
                        <Ionicons
                            name="sunny"
                            size={18}
                            color={activeTab === 'am' ? '#f5843d' : '#6c7a71'}
                        />
                        <Text style={[styles.segmentText, activeTab === 'am' && styles.segmentTextActive]}>
                            Buổi sáng (AM) ({currentDay?.morningSteps?.length || 0})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.segmentBtn, activeTab === 'pm' && styles.segmentBtnActive]}
                        onPress={() => setActiveTab('pm')}
                    >
                        <Ionicons
                            name="moon"
                            size={18}
                            color={activeTab === 'pm' ? '#006c4e' : '#6c7a71'}
                        />
                        <Text style={[styles.segmentText, activeTab === 'pm' && styles.segmentTextActive]}>
                            Buổi tối (PM) ({currentDay?.eveningSteps?.length || 0})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Steps List (stitch.txt dòng 2195-2415) */}
                <View style={styles.stepsContainer}>
                    {stepsToShow.map((step, idx) => (
                        <View key={idx} style={styles.stepCard}>
                            <View style={styles.stepNumberBadge}>
                                <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <View style={styles.stepTypeRow}>
                                    <Text style={styles.stepName}>{step.stepName}</Text>
                                    {step.isExternalSuggestion && (
                                        <View style={styles.externalTag}>
                                            <Text style={styles.externalTagText}>Gợi ý ngoài tủ</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.productName}>{step.productName}</Text>
                                <View style={styles.tipBox}>
                                    <Ionicons name="bulb-outline" size={15} color="#006c49" />
                                    <Text style={styles.tipText}>{step.instruction}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* STICKY FOOTER ACTION BAR (stitch.txt dòng 2431) */}
            <View style={styles.footerBar}>
                {mode === 'suggestion' ? (
                    /* UC 9: 2 Button: Thêm vào chuỗi routine của tôi & Bỏ qua (lưu nháp) */
                    <View style={styles.actionBtnRow}>
                        <TouchableOpacity
                            style={styles.dismissBtn}
                            onPress={handleDismiss}
                        >
                            <Text style={styles.dismissBtnText}>Bỏ qua</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.activateBtn}
                            onPress={handleActivate}
                        >
                            <Ionicons name="add-circle" size={20} color="#ffffff" />
                            <Text style={styles.activateBtnText}>Thêm vào chuỗi của tôi</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* UC 42: 2 Button: Copy & Chia sẻ lên Cộng đồng */
                    <View style={styles.actionBtnRow}>
                        <TouchableOpacity
                            style={styles.shareBtn}
                            onPress={handleShareToCommunity}
                        >
                            <Ionicons name="share-social-outline" size={18} color="#006c49" />
                            <Text style={styles.shareBtnText}>Chia sẻ bài đăng</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.copyBtn}
                            onPress={handleCheckAndCopy}
                            disabled={copying}
                        >
                            {copying ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <>
                                    <Ionicons name="copy-outline" size={18} color="#ffffff" />
                                    <Text style={styles.copyBtnText}>Sao chép Routine</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* UC 43: MODAL KIỂM TRA ĐỐI CHIẾU & XÁC NHẬN COPY */}
            <Modal
                visible={copyModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCopyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeaderRow}>
                            <Ionicons name="git-branch-outline" size={24} color="#006c49" />
                            <Text style={styles.modalHeading}>Sao Chép Chuỗi Routine</Text>
                        </View>

                        {/* Thông báo quét đối chiếu tủ đồ */}
                        {copyCompatibility?.missingProducts?.length > 0 ? (
                            <View style={styles.missingWarningBox}>
                                <Text style={styles.warningTitle}>⚠️ Quét đối chiếu tủ đồ hiện tại:</Text>
                                {copyCompatibility.missingProducts.map((mp, i) => (
                                    <Text key={i} style={styles.missingMsg}>
                                        • {mp.message}
                                    </Text>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.completeBox}>
                                <Ionicons name="checkmark-circle" size={18} color="#006c49" />
                                <Text style={styles.completeMsg}>
                                    Tất cả sản phẩm trong chuỗi cũ đều sẵn sàng trong tủ đồ của bạn!
                                </Text>
                            </View>
                        )}

                        {/* Cảnh báo rẽ nhánh nếu đang có chuỗi routine chạy */}
                        {copyCompatibility?.hasActiveRoutine ? (
                            <View style={styles.branchBox}>
                                <Text style={styles.branchTitle}>
                                    Bạn đang áp dụng: "{copyCompatibility?.activePlanTitle}". Bạn muốn xử lý như thế nào?
                                </Text>
                                <TouchableOpacity
                                    style={styles.branchActionRed}
                                    onPress={() => handleConfirmCopy('start_now')}
                                >
                                    <Text style={styles.branchActionRedText}>
                                        Hủy routine cũ & Dùng ngay routine này
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.branchActionGreen}
                                    onPress={() => handleConfirmCopy('queue_later')}
                                >
                                    <Text style={styles.branchActionGreenText}>
                                        Dùng xong routine cũ mới chuyển qua
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.singleCopyBox}>
                                <TouchableOpacity
                                    style={styles.activateBtnFull}
                                    onPress={() => handleConfirmCopy('start_now')}
                                >
                                    <Text style={styles.activateBtnText}>Bắt đầu dùng chuỗi routine này ngay</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.cancelModalBtn}
                            onPress={() => setCopyModalVisible(false)}
                        >
                            <Text style={styles.cancelModalBtnText}>Hủy</Text>
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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9ff',
    },
    loadingText: {
        fontSize: 14,
        color: '#6c7a71',
        marginTop: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 14,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9edff',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#141b2b',
        flex: 1,
        textAlign: 'center',
    },
    contentScroll: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    overviewCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    targetBadge: {
        backgroundColor: '#97f5cc',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    targetBadgeText: {
        color: '#005236',
        fontSize: 12,
        fontWeight: '700',
    },
    activePill: {
        backgroundColor: '#10b981',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activePillText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '700',
    },
    routineTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#141b2b',
        marginBottom: 4,
    },
    routineGoal: {
        fontSize: 13,
        color: '#3c4a42',
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: '#e9edff',
        marginVertical: 12,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f1f3ff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        flex: 0.48,
    },
    metricLabel: {
        fontSize: 11,
        color: '#6c7a71',
    },
    metricValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#141b2b',
    },
    daySelectorTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#141b2b',
        marginTop: 16,
        marginBottom: 8,
    },
    dayScroll: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    dayPill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#e9edff',
        marginRight: 8,
    },
    dayPillActive: {
        backgroundColor: '#006c49',
    },
    dayPillText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3c4a42',
    },
    dayPillTextActive: {
        color: '#ffffff',
    },
    segmentContainer: {
        flexDirection: 'row',
        backgroundColor: '#e9edff',
        borderRadius: 24,
        padding: 4,
        marginBottom: 16,
    },
    segmentBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 20,
    },
    segmentBtnActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6c7a71',
    },
    segmentTextActive: {
        color: '#141b2b',
    },
    stepsContainer: {
        paddingBottom: 110,
        gap: 12,
    },
    stepCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    stepNumberBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#97f5cc',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        color: '#005236',
        fontWeight: '700',
        fontSize: 14,
    },
    stepContent: {
        flex: 1,
    },
    stepTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    stepName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#006c4e',
        textTransform: 'uppercase',
    },
    externalTag: {
        backgroundColor: '#ffdbca',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    externalTagText: {
        color: '#763300',
        fontSize: 10,
        fontWeight: '700',
    },
    productName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#141b2b',
        marginBottom: 6,
    },
    tipBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        backgroundColor: '#f1f3ff',
        padding: 8,
        borderRadius: 10,
    },
    tipText: {
        fontSize: 12,
        color: '#3c4a42',
        flex: 1,
        lineHeight: 16,
    },
    footerBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderTopWidth: 1,
        borderTopColor: '#e9edff',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 28,
    },
    actionBtnRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dismissBtn: {
        flex: 0.35,
        backgroundColor: '#e9edff',
        borderRadius: 20,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dismissBtnText: {
        color: '#6c7a71',
        fontWeight: '700',
        fontSize: 14,
    },
    activateBtn: {
        flex: 0.65,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#10b981',
        borderRadius: 20,
        paddingVertical: 14,
    },
    activateBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
    },
    shareBtn: {
        flex: 0.45,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#97f5cc',
        borderRadius: 20,
        paddingVertical: 14,
    },
    shareBtnText: {
        color: '#005236',
        fontWeight: '700',
        fontSize: 13,
    },
    copyBtn: {
        flex: 0.55,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#006c49',
        borderRadius: 20,
        paddingVertical: 14,
    },
    copyBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 13,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(20, 27, 43, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 20,
        width: '100%',
        maxWidth: 380,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
    },
    modalHeading: {
        fontSize: 18,
        fontWeight: '700',
        color: '#141b2b',
    },
    missingWarningBox: {
        backgroundColor: '#fff4e5',
        borderRadius: 14,
        padding: 12,
        marginBottom: 14,
        borderLeftWidth: 4,
        borderLeftColor: '#f5843d',
    },
    warningTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#763300',
        marginBottom: 4,
    },
    missingMsg: {
        fontSize: 12,
        color: '#331200',
        lineHeight: 17,
        marginTop: 4,
    },
    completeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#ecfdf5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 14,
    },
    completeMsg: {
        fontSize: 13,
        color: '#005236',
        flex: 1,
    },
    branchBox: {
        gap: 10,
        marginTop: 4,
    },
    branchTitle: {
        fontSize: 13,
        color: '#141b2b',
        fontWeight: '600',
        lineHeight: 18,
    },
    branchActionRed: {
        backgroundColor: '#ba1a1a',
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
    },
    branchActionRedText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 13,
    },
    branchActionGreen: {
        backgroundColor: '#006c49',
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
    },
    branchActionGreenText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 13,
    },
    singleCopyBox: {
        marginTop: 8,
    },
    activateBtnFull: {
        backgroundColor: '#006c49',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    cancelModalBtn: {
        marginTop: 12,
        alignItems: 'center',
        paddingVertical: 8,
    },
    cancelModalBtnText: {
        color: '#6c7a71',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default RoutineDetailScreen;
