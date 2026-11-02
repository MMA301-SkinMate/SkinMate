import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SkinGuideModal from './SkinGuideModal';
import { useAuth } from '../../hooks/useAuth';

const GuideFab = ({ customSkinType, customAllergies }) => {
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);

    const activeSkinType = customSkinType || user?.skinProfile?.skinType || 'normal';
    const activeAllergies = customAllergies || user?.skinProfile?.allergies || [];

    return (
        <>
            <TouchableOpacity
                style={styles.fabContainer}
                activeOpacity={0.85}
                onPress={() => setModalVisible(true)}
            >
                <View style={styles.fabInner}>
                    <Ionicons name="book" size={22} color="#ffffff" />
                    <Text style={styles.fabLabel}>Guide</Text>
                </View>
            </TouchableOpacity>

            <SkinGuideModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                skinType={activeSkinType}
                allergies={activeAllergies}
            />
        </>
    );
};

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        right: 20,
        bottom: 85,
        zIndex: 999,
        elevation: 8,
        shadowColor: '#006c49',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },
    fabInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#10b981',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: '#97f5cc',
    },
    fabLabel: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

export default GuideFab;
