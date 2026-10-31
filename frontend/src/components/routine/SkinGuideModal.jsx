import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSkinGuide } from '../../api/routineApi';
import { COLORS } from '../../constants/colors';

const SkinGuideModal = ({ visible, onClose, skinType, allergies }) => {
    const [loading, setLoading] = useState(false);
    const [guideData, setGuideData] = useState(null);
    const [activeTab, setActiveTab] = useState('dos'); // 'dos' | 'donts'

    useEffect(() => {
        if (visible) {
            fetchGuide();
        }
    }, [visible, skinType, allergies]);

    const fetchGuide = async () => {
        setLoading(true);
        try {
            const res = await getSkinGuide(skinType, allergies);
            if (res?.data?.data) {
                setGuideData(res.data.data);
            }
        } catch (err) {
            console.error('Lỗi lấy cẩm nang da:', err);
        } finally {
            setLoading(false);
        }
    };

    const skinTypeLabels = {
        oily: 'Da dầu',
        dry: 'Da khô',
        combination: 'Da hỗn hợp',
        sensitive: 'Da nhạy cảm',
        normal: 'Da thường',
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleRow}>
                            <View style={styles.iconBadge}>
                                <Ionicons name="book-outline" size={20} color="#006c49" />
                            </View>
                            <View>
                                <Text style={styles.title}>Cẩm Nang Làn Da</Text>
                                <Text style={styles.subTitle}>
                                    {skinTypeLabels[skinType?.toLowerCase()] || 'Hồ sơ da'} • Hoạt chất tương thích
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <Ionicons name="close" size={22} color="#6c7a71" />
                        </TouchableOpacity>
                    </View>

                    {/* Segment Tabs Do's vs Don'ts */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'dos' && styles.tabActiveDo]}
                            onPress={() => setActiveTab('dos')}
                        >
                            <Ionicons
                                name="checkmark-circle"
                                size={18}
                                color={activeTab === 'dos' ? '#006c49' : '#6c7a71'}
                            />
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'dos' && styles.tabTextActiveDo,
                                ]}
                            >
                                Khuyên dùng (Do's) ({guideData?.dos?.length || 0})
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'donts' && styles.tabActiveDont]}
                            onPress={() => setActiveTab('donts')}
                        >
                            <Ionicons
                                name="alert-circle"
                                size={18}
                                color={activeTab === 'donts' ? '#ba1a1a' : '#6c7a71'}
                            />
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'donts' && styles.tabTextActiveDont,
                                ]}
                            >
                                Cấm kỵ (Don'ts) ({guideData?.donts?.length || 0})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content List */}
                    {loading ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="large" color="#006c49" />
                            <Text style={styles.loadingText}>Đang tra cứu từ điển hoạt chất...</Text>
                        </View>
                    ) : (
                        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            {activeTab === 'dos' ? (
                                guideData?.dos?.length > 0 ? (
                                    guideData.dos.map((item, idx) => (
                                        <View key={idx} style={styles.cardDo}>
                                            <View style={styles.cardHeader}>
                                                <Text style={styles.cardTitle}>{item.name}</Text>
                                                <View style={styles.badgeDo}>
                                                    <Text style={styles.badgeTextDo}>Nên dùng</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.cardDesc}>{item.description}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>Chưa có hoạt chất khuyên dùng cụ thể.</Text>
                                )
                            ) : guideData?.donts?.length > 0 ? (
                                guideData.donts.map((item, idx) => (
                                    <View key={idx} style={styles.cardDont}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.cardTitleDont}>{item.name}</Text>
                                            <View style={styles.badgeDont}>
                                                <Text style={styles.badgeTextDont}>Tránh dùng</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.cardDesc}>{item.description}</Text>
                                        {item.reason && (
                                            <Text style={styles.reasonText}>⚠️ {item.reason}</Text>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>Tuyệt vời! Không có hoạt chất cấm kỵ nào.</Text>
                            )}
                        </ScrollView>
                    )}

                    {/* Footer Close */}
                    <TouchableOpacity style={styles.understandBtn} onPress={onClose}>
                        <Text style={styles.understandBtnText}>Đã hiểu cẩm nang</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(20, 27, 43, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#f9f9ff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 32,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#97f5cc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#141b2b',
    },
    subTitle: {
        fontSize: 12,
        color: '#6c7a71',
        marginTop: 2,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e9edff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#e9edff',
        borderRadius: 16,
        padding: 4,
        marginBottom: 16,
        gap: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    tabActiveDo: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    tabActiveDont: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6c7a71',
    },
    tabTextActiveDo: {
        color: '#006c49',
    },
    tabTextActiveDont: {
        color: '#ba1a1a',
    },
    scrollContent: {
        maxHeight: 380,
    },
    cardDo: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    cardDont: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#ba1a1a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#00422b',
        flex: 1,
    },
    cardTitleDont: {
        fontSize: 15,
        fontWeight: '700',
        color: '#93000a',
        flex: 1,
    },
    badgeDo: {
        backgroundColor: '#97f5cc',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeTextDo: {
        fontSize: 11,
        fontWeight: '600',
        color: '#005236',
    },
    badgeDont: {
        backgroundColor: '#ffdad6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeTextDont: {
        fontSize: 11,
        fontWeight: '600',
        color: '#93000a',
    },
    cardDesc: {
        fontSize: 13,
        color: '#3c4a42',
        lineHeight: 18,
    },
    reasonText: {
        fontSize: 12,
        color: '#ba1a1a',
        marginTop: 6,
        fontWeight: '500',
    },
    loadingBox: {
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 13,
        color: '#6c7a71',
        marginTop: 10,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6c7a71',
        marginVertical: 30,
        fontSize: 14,
    },
    understandBtn: {
        backgroundColor: '#10b981',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    understandBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default SkinGuideModal;
