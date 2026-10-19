import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Icon } from './Icon';
import { useSkinApp } from '../../context/SkinAppContext';

export const FABGuide = () => {
  const {
    isGuideOpen,
    setIsGuideOpen,
    SKIN_DICTIONARY,
    CONDITION_DICTIONARY,
    selectedConditions,
  } = useSkinApp();

  const profileData = SKIN_DICTIONARY.Da_Hon_Hop;

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fabBtn}
        onPress={() => setIsGuideOpen(true)}
        activeOpacity={0.85}
      >
        <Icon name="book" size={20} color="#ffffff" />
        <Text style={styles.fabText}>Cẩm nang da</Text>
      </TouchableOpacity>

      {/* Guide Modal (Popup Cẩm nang da Do's & Don'ts) */}
      <Modal
        visible={isGuideOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsGuideOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerIcon}>
                <Icon name="book" size={20} color="#0f766e" />
              </View>
              <View style={styles.headerTitleCol}>
                <Text style={styles.modalTitle}>Cẩm Nang Chăm Sóc Da</Text>
                <Text style={styles.modalSubtitle}>Quy tắc Vàng Do's & Don'ts Y Khoa</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsGuideOpen(false)}
                activeOpacity={0.7}
              >
                <Icon name="x" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
              {/* Profile Guidelines */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTag}>HỒ SƠ DA CỦA BẠN</Text>
                  <Text style={styles.skinName}>{profileData.name}</Text>
                </View>
                <Text style={styles.skinDesc}>{profileData.description}</Text>

                {/* DO's */}
                <View style={[styles.guideBox, styles.dosBox]}>
                  <View style={styles.guideBadgeDos}>
                    <Icon name="check" size={14} color="#059669" />
                    <Text style={styles.dosTitle}>NÊN DÙNG (DO'S)</Text>
                  </View>
                  <View style={styles.chipsRow}>
                    {profileData.dos.map((item, idx) => (
                      <View key={idx} style={styles.dosChip}>
                        <Text style={styles.dosChipText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* DON'Ts */}
                <View style={[styles.guideBox, styles.dontsBox]}>
                  <View style={styles.guideBadgeDonts}>
                    <Icon name="x" size={14} color="#dc2626" />
                    <Text style={styles.dontsTitle}>CẤM KỴ (DON'TS)</Text>
                  </View>
                  <View style={styles.chipsRow}>
                    {profileData.donts.map((item, idx) => (
                      <View key={idx} style={styles.dontsChip}>
                        <Text style={styles.dontsChipText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Today's Condition Rules */}
              <View style={[styles.sectionBlock, styles.conditionBlock]}>
                <Text style={styles.sectionTag}>QUY TẮC THEO TÌNH TRẠNG HÔM NAY</Text>
                {selectedConditions.map((cKey) => {
                  const cond = CONDITION_DICTIONARY[cKey];
                  if (!cond) return null;
                  return (
                    <View key={cKey} style={styles.condItem}>
                      <View style={styles.condTitleRow}>
                        <Text style={styles.condEmoji}>{cond.emoji}</Text>
                        <Text style={styles.condName}>Tình trạng: {cond.label}</Text>
                      </View>
                      <Text style={styles.condGuideDesc}>{cond.description}</Text>
                      
                      <View style={styles.rulePair}>
                        <View style={styles.ruleHalf}>
                          <Text style={styles.ruleHeaderGreen}>Ưu tiên phục hồi:</Text>
                          <Text style={styles.ruleContent}>{cond.treatment.join(', ')}</Text>
                        </View>
                        {cond.taboo.length > 0 && (
                          <View style={styles.ruleHalf}>
                            <Text style={styles.ruleHeaderRed}>Tạm dừng ngay:</Text>
                            <Text style={styles.ruleContent}>{cond.taboo.join(', ')}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Conflict rules */}
              <View style={styles.conflictRuleCard}>
                <View style={styles.conflictRow}>
                  <Icon name="alert-triangle" size={16} color="#d97706" />
                  <Text style={styles.conflictTitle}>Quy tắc xung đột hoạt chất</Text>
                </View>
                <Text style={styles.conflictItem}>• <Text style={styles.bold}>AHA</Text> không dùng chung với Retinol, BHA, Vitamin C trong cùng một buổi.</Text>
                <Text style={styles.conflictItem}>• <Text style={styles.bold}>BHA</Text> không dùng chung với Retinol, AHA cùng lúc.</Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.gotItBtn}
              onPress={() => setIsGuideOpen(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.gotItBtnText}>Đã hiểu & Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fabBtn: {
    position: 'absolute',
    right: 16,
    bottom: 84,
    backgroundColor: '#0f766e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#0f766e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 90,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitleCol: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    marginBottom: 16,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  skinName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f766e',
  },
  skinDesc: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 18,
  },
  guideBox: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  dosBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  dontsBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  guideBadgeDos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  dosTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  guideBadgeDonts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  dontsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#dc2626',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dosChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  dosChipText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600',
  },
  dontsChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  dontsChipText: {
    fontSize: 11,
    color: '#b91c1c',
    fontWeight: '600',
  },
  conditionBlock: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
  },
  condItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  condTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  condEmoji: {
    fontSize: 16,
  },
  condName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  condGuideDesc: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8,
  },
  rulePair: {
    gap: 6,
  },
  ruleHalf: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
  },
  ruleHeaderGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  ruleHeaderRed: {
    fontSize: 10,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 2,
  },
  ruleContent: {
    fontSize: 11,
    color: '#334155',
  },
  conflictRuleCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginTop: 6,
  },
  conflictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  conflictTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  conflictItem: {
    fontSize: 11,
    color: '#78350f',
    marginBottom: 4,
    lineHeight: 16,
  },
  bold: {
    fontWeight: '700',
  },
  gotItBtn: {
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  gotItBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
