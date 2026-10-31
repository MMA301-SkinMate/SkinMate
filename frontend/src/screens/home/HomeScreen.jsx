import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../hooks/useAuth';
import { suggestRoutine, getRoutineHistory } from '../../api/routineApi';
import GuideFab from '../../components/routine/GuideFab';

const HomeScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activePlan, setActivePlan] = useState(null);

    useEffect(() => {
        loadActiveRoutine();
    }, []);

    const loadActiveRoutine = async () => {
        try {
            const res = await getRoutineHistory();
            if (res?.data?.data) {
                const active = res.data.data.find(p => p.status === 'active');
                setActivePlan(active || null);
            }
        } catch (e) {
            // bỏ qua
        }
    };

    // UC 8: Gợi ý chuỗi routine
    const handleGenerateRoutine = async () => {
        setLoading(true);
        try {
            const res = await suggestRoutine();
            if (res?.data?.data?.plan) {
                navigation.navigate('RoutineDetail', {
                    routineId: res.data.data.plan._id,
                    mode: 'suggestion', // UC 9
                });
            }
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể tạo gợi ý chuỗi routine');
        } finally {
            setLoading(false);
        }
    };

    const skinProfile = user?.skinProfile || {};
    const skinTypeLabel = skinProfile.skinType
        ? (skinProfile.skinType === 'oily' ? 'Da Dầu' : skinProfile.skinType === 'dry' ? 'Da Khô' : skinProfile.skinType === 'combination' ? 'Da Hỗn Hợp' : skinProfile.skinType === 'sensitive' ? 'Da Nhạy Cảm' : 'Da Thường')
        : 'Chưa thiết lập';

    return (
        <ScreenWrapper>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header Welcome */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greeting}>Xin chào,</Text>
                        <Text style={styles.userName}>{user?.fullName || 'SkinMate Member'} 👋</Text>
                    </View>
                    <View style={styles.skinTypeBadge}>
                        <Ionicons name="sparkles" size={14} color="#005236" />
                        <Text style={styles.skinTypeBadgeText}>{skinTypeLabel}</Text>
                    </View>
                </View>

                {/* Banner Active Routine nếu có */}
                {activePlan ? (
                    <TouchableOpacity
                        style={styles.activeBanner}
                        onPress={() => navigation.navigate('RoutineDetail', {
                            routineId: activePlan._id,
                            mode: 'history',
                        })}
                    >
                        <View style={styles.activeBannerHeader}>
                            <View style={styles.runningBadge}>
                                <Text style={styles.runningBadgeText}>PHÁC ĐỒ ĐANG CHẠY</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                        </View>
                        <Text style={styles.activeBannerTitle}>{activePlan.title}</Text>
                        <Text style={styles.activeBannerGoal}>🎯 {activePlan.goal}</Text>
                        <Text style={styles.activeBannerDays}>Chu kỳ {activePlan.durationDays || 7} ngày • Bấm để xem chi tiết</Text>
                    </TouchableOpacity>
                ) : (
                    /* Banner gợi ý tạo chuỗi routine */
                    <View style={styles.suggestCard}>
                        <View style={styles.suggestCardContent}>
                            <View style={styles.cardIconBox}>
                                <Ionicons name="fitness-outline" size={24} color="#006c49" />
                            </View>
                            <Text style={styles.cardTitle}>Chuỗi Routine Cải Thiện Da</Text>
                            <Text style={styles.cardDesc}>
                                Hệ thống sẽ phân tích các sản phẩm trong tủ đồ và gợi ý lộ trình 7 ngày sáng/tối tối ưu cho da bạn.
                            </Text>

                            <TouchableOpacity
                                style={styles.generateBtn}
                                onPress={handleGenerateRoutine}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <>
                                        <Ionicons name="sparkles-outline" size={18} color="#ffffff" />
                                        <Text style={styles.generateBtnText}>Gợi ý chuỗi Routine ngay</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Quick Shortcuts */}
                <View style={styles.shortcutsSection}>
                    <Text style={styles.shortcutsTitle}>Truy cập nhanh</Text>
                    <View style={styles.shortcutsRow}>
                        <TouchableOpacity
                            style={styles.shortcutCard}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <View style={[styles.shortcutIcon, { backgroundColor: '#e9edff' }]}>
                                <Ionicons name="person-outline" size={22} color="#006c49" />
                            </View>
                            <Text style={styles.shortcutLabel}>Hồ sơ da</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.shortcutCard}
                            onPress={() => navigation.navigate('Collection')}
                        >
                            <View style={[styles.shortcutIcon, { backgroundColor: '#fff3e0' }]}>
                                <Ionicons name="albums-outline" size={22} color="#9b4500" />
                            </View>
                            <Text style={styles.shortcutLabel}>Tủ đồ Skincare</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.shortcutCard}
                            onPress={() => navigation.navigate('Community')}
                        >
                            <View style={[styles.shortcutIcon, { backgroundColor: '#e0f2fe' }]}>
                                <Ionicons name="people-outline" size={22} color="#0284c7" />
                            </View>
                            <Text style={styles.shortcutLabel}>Cộng đồng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* UC 10: NÚT FAB GUIDE NỔI TRÊN TOÀN APP */}
            <GuideFab />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    greeting: {
        fontSize: 13,
        color: '#6c7a71',
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#141b2b',
    },
    skinTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#97f5cc',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
    },
    skinTypeBadgeText: {
        color: '#005236',
        fontSize: 12,
        fontWeight: '700',
    },
    activeBanner: {
        backgroundColor: '#006c49',
        borderRadius: 22,
        padding: 18,
        marginBottom: 20,
        shadowColor: '#006c49',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
    },
    activeBannerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    runningBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    runningBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
    },
    activeBannerTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    activeBannerGoal: {
        color: '#d1fae5',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8,
    },
    activeBannerDays: {
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 11,
    },
    suggestCard: {
        backgroundColor: '#ffffff',
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: '#bbcabf',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    suggestCardContent: {
        alignItems: 'flex-start',
    },
    cardIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#97f5cc',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#141b2b',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 13,
        color: '#6c7a71',
        lineHeight: 18,
        marginBottom: 16,
    },
    generateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#10b981',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 18,
        width: '100%',
    },
    generateBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    shortcutsSection: {
        marginTop: 6,
        marginBottom: 90,
    },
    shortcutsTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#141b2b',
        marginBottom: 12,
    },
    shortcutsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    shortcutCard: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 14,
        alignItems: 'center',
        flex: 0.31,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    shortcutIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    shortcutLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#141b2b',
    },
});

export default HomeScreen;