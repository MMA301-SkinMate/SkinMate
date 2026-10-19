import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Switch, ScrollView } from 'react-native';
import { Icon } from '../common/Icon';
import { useSkinApp } from '../../context/SkinAppContext';

export const NotificationModal = () => {
  const {
    isNotificationOpen,
    setIsNotificationOpen,
    setCurrentScreen,
    notificationConfig,
    setNotificationConfig,
  } = useSkinApp();

  const [simulatedToast, setSimulatedToast] = useState(false);

  const handleTestPushNotification = () => {
    setSimulatedToast(true);
    setTimeout(() => {
      setSimulatedToast(false);
    }, 6000);
  };

  const handleGoToCheckin = () => {
    setIsNotificationOpen(false);
    setSimulatedToast(false);
    setCurrentScreen('Checkin');
  };

  return (
    <>
      {/* Real simulated Push Notification Banner at top of screen */}
      {simulatedToast && (
        <View style={styles.pushBannerContainer}>
          <View style={styles.pushBannerCard}>
            <View style={styles.appIconBox}>
              <Icon name="sparkles" size={16} color="#ffffff" />
            </View>
            <View style={styles.pushTextCol}>
              <View style={styles.pushHeaderRow}>
                <Text style={styles.pushAppName}>SKINCARE AI • Vừa xong</Text>
              </View>
              <Text style={styles.pushTitle}>⏰ Đã đến giờ check-in làn da hôm nay!</Text>
              <Text style={styles.pushBody}>
                Dành 1 phút ghi nhận tình trạng da để AI điều chỉnh chu trình skincare tối nay nhé.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.pushActionBtn}
              onPress={handleGoToCheckin}
              activeOpacity={0.8}
            >
              <Text style={styles.pushActionText}>Check-in</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Settings Modal (12. Thông báo checkin da hằng ngày) */}
      <Modal
        visible={isNotificationOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsNotificationOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.bellIconWrap}>
                  <Icon name="bell" size={20} color="#e11d48" />
                </View>
                <View>
                  <Text style={styles.title}>Thông Báo Check-in Da</Text>
                  <Text style={styles.subtitle}>Nhắc nhở chăm sóc da hàng ngày</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsNotificationOpen(false)}
                activeOpacity={0.7}
              >
                <Icon name="x" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
              {/* Active Push Preview Banner */}
              <View style={styles.previewBanner}>
                <View style={styles.previewTop}>
                  <Icon name="zap" size={14} color="#e11d48" />
                  <Text style={styles.previewBadge}>MẪU THÔNG BÁO GỬI VỀ THIẾT BỊ</Text>
                </View>
                <Text style={styles.previewTitle}>
                  "Chào Linh, đã 20:00 tối! Hãy check-in làn da hôm nay để tối ưu phác đồ nhé ✨"
                </Text>
                <TouchableOpacity
                  style={styles.simulateBtn}
                  onPress={handleTestPushNotification}
                  activeOpacity={0.8}
                >
                  <Icon name="bell" size={14} color="#e11d48" />
                  <Text style={styles.simulateBtnText}>Bấm để mô phỏng nhận thông báo đẩy</Text>
                </TouchableOpacity>
              </View>

              {/* Setting Toggles */}
              <View style={styles.sectionCard}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>Bật thông báo check-in hàng ngày</Text>
                    <Text style={styles.settingDesc}>Nhận nhắc nhở định kỳ để duy trì chuỗi chăm da</Text>
                  </View>
                  <Switch
                    value={notificationConfig.enabled}
                    onValueChange={(val) =>
                      setNotificationConfig((prev) => ({ ...prev, enabled: val }))
                    }
                    trackColor={{ false: '#cbd5e1', true: '#fca5a5' }}
                    thumbColor={notificationConfig.enabled ? '#e11d48' : '#f8fafc'}
                  />
                </View>

                {notificationConfig.enabled && (
                  <View style={styles.timeScheduleGroup}>
                    {/* Morning Reminder */}
                    <View style={styles.timeItem}>
                      <View style={styles.timeIconWrap}>
                        <Icon name="sun" size={16} color="#d97706" />
                      </View>
                      <View style={styles.timeTextCol}>
                        <Text style={styles.timeLabel}>Nhắc nhở Buổi Sáng</Text>
                        <Text style={styles.timeSub}>Chuẩn bị chu trình trước khi ra ngoài</Text>
                      </View>
                      <View style={styles.timeBadge}>
                        <Text style={styles.timeValue}>{notificationConfig.morningTime}</Text>
                      </View>
                    </View>

                    {/* Evening Reminder */}
                    <View style={styles.timeItem}>
                      <View style={styles.timeIconWrapNight}>
                        <Icon name="moon" size={16} color="#6366f1" />
                      </View>
                      <View style={styles.timeTextCol}>
                        <Text style={styles.timeLabel}>Nhắc nhở Buổi Tối</Text>
                        <Text style={styles.timeSub}>Ghi nhận tình trạng da và skincare đêm</Text>
                      </View>
                      <View style={styles.timeBadge}>
                        <Text style={styles.timeValue}>{notificationConfig.eveningTime}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Expiry alerts (Item 24 from sheet) */}
              <View style={styles.sectionCard}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>Báo mỹ phẩm sắp hết hạn</Text>
                    <Text style={styles.settingDesc}>
                      Báo trước 7 ngày và khi hết hạn vào mỗi 8h sáng
                    </Text>
                  </View>
                  <Switch
                    value={notificationConfig.expiryAlerts}
                    onValueChange={(val) =>
                      setNotificationConfig((prev) => ({ ...prev, expiryAlerts: val }))
                    }
                    trackColor={{ false: '#cbd5e1', true: '#a7f3d0' }}
                    thumbColor={notificationConfig.expiryAlerts ? '#059669' : '#f8fafc'}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.primaryCheckinBtn}
                onPress={handleGoToCheckin}
                activeOpacity={0.85}
              >
                <Icon name="checkin" size={18} color="#ffffff" />
                <Text style={styles.primaryCheckinBtnText}>Vào Check-in Da Ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pushBannerContainer: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    zIndex: 9999,
  },
  pushBannerCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  appIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e11d48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pushTextCol: {
    flex: 1,
  },
  pushHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  pushAppName: {
    fontSize: 9,
    fontWeight: '800',
    color: '#cbd5e1',
    letterSpacing: 0.5,
  },
  pushTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  pushBody: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 14,
  },
  pushActionBtn: {
    backgroundColor: '#e11d48',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  pushActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    marginVertical: 14,
  },
  previewBanner: {
    backgroundColor: '#fff1f2',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fecdd3',
    marginBottom: 14,
  },
  previewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  previewBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#e11d48',
    letterSpacing: 0.8,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#881337',
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 10,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#fda4af',
  },
  simulateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e11d48',
  },
  sectionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  settingDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15,
  },
  timeScheduleGroup: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 10,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 12,
    gap: 10,
  },
  timeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeIconWrapNight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeTextCol: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  timeSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  timeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalActions: {
    paddingTop: 10,
  },
  primaryCheckinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e11d48',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryCheckinBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
