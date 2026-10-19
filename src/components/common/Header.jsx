import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon } from './Icon';
import { useSkinApp } from '../../context/SkinAppContext';

export const Header = ({ title, subtitle, showBack = false, onBack }) => {
  const {
    userProfile,
    currentScreen,
    setCurrentScreen,
    setIsNotificationOpen,
    setIsGuideOpen,
  } = useSkinApp();

  const isHome = currentScreen === 'Home';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBack || !isHome ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack || (() => setCurrentScreen('Home'))}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={20} color="#1e293b" />
          </TouchableOpacity>
        ) : (
          <View style={styles.userProfileGroup}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greetingText}>Chào {userProfile.name} ✨</Text>
              <View style={styles.skinTypeBadge}>
                <View style={styles.skinTypeDot} />
                <Text style={styles.skinTypeText}>Da hỗn hợp thiên dầu</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action icons on right */}
        <View style={styles.actionsGroup}>
          {/* Guide FAB / button (Cẩm nang Do's & Don'ts) */}
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => setIsGuideOpen(true)}
            activeOpacity={0.75}
          >
            <Icon name="book" size={18} color="#0f766e" />
          </TouchableOpacity>

          {/* Notification Button (12. Thông báo checkin da hằng ngày) */}
          <TouchableOpacity
            style={[styles.actionIconBtn, styles.bellBtn]}
            onPress={() => setIsNotificationOpen(true)}
            activeOpacity={0.75}
          >
            <Icon name="bell" size={19} color="#1e293b" />
            <View style={styles.unreadBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Title & Subtitle when not on Home */}
      {!isHome && title && (
        <View style={styles.titleWrapper}>
          <Text style={styles.screenTitle}>{title}</Text>
          {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
        </View>
      )}

      {/* Ambient weather / UV bar when on Home */}
      {isHome && (
        <View style={styles.ambientBar}>
          <View style={styles.ambientItem}>
            <Icon name="sun" size={14} color="#f59e0b" />
            <Text style={styles.ambientText}>Chỉ số UV: <Text style={styles.boldText}>6.2 (Cao)</Text></Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.ambientItem}>
            <Icon name="flame" size={14} color="#e11d48" />
            <Text style={styles.ambientText}>Chuỗi: <Text style={styles.boldText}>{userProfile.streakDays} ngày liên tiếp</Text></Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userProfileGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#fda4af',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  skinTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    marginTop: 2,
    gap: 5,
  },
  skinTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  skinTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bellBtn: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e11d48',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  titleWrapper: {
    marginTop: 10,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  ambientBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ambientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ambientText: {
    fontSize: 11,
    color: '#64748b',
  },
  boldText: {
    fontWeight: '700',
    color: '#1e293b',
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: '#cbd5e1',
  },
});
