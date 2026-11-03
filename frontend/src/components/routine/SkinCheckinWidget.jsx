import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/theme';
import { CHECKIN_OPTIONS } from '../../constants/skinDictionary';

/**
 * 13. Checkin tình trạng da hàng ngày
 * Widget "Nhật ký làn da"
 * Title: "Da bạn hôm nay thế nào ?"
 * Icons: Bình thường, khô rát, kích ứng, nổi mụn, bóng dầu
 * => Có thể chọn nhiều icon, nếu chọn 'bình thường' thì bỏ các lựa chọn khác
 * => Sau khi chọn xong => hiển thị thông báo bé 10s cho phép người dùng undo
 * => User chọn xong => cập nhật lại Daily Routine
 */
export const SkinCheckinWidget = ({
  currentConditions = ['Bình thường'],
  onCheckinSubmit,
  onCheckinUndo,
  isSubmitting = false,
}) => {
  const [selectedConditions, setSelectedConditions] = useState(currentConditions);
  const [undoCountdown, setUndoCountdown] = useState(0);
  const [showUndoBanner, setShowUndoBanner] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setSelectedConditions(currentConditions);
  }, [currentConditions]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSelectCondition = (conditionId) => {
    if (isSubmitting) return;

    let updated = [];
    if (conditionId === 'Bình thường') {
      // Nếu chọn 'bình thường' thì bỏ các lựa chọn khác
      updated = ['Bình thường'];
    } else {
      // Nếu chọn các trạng thái xấu -> bỏ 'Bình thường'
      const withoutNormal = selectedConditions.filter((c) => c !== 'Bình thường');
      if (withoutNormal.includes(conditionId)) {
        updated = withoutNormal.filter((c) => c !== conditionId);
        if (updated.length === 0) {
          updated = ['Bình thường'];
        }
      } else {
        updated = [...withoutNormal, conditionId];
      }
    }

    setSelectedConditions(updated);

    // Kích hoạt callback cập nhật Daily Routine
    if (onCheckinSubmit) {
      onCheckinSubmit(updated);
    }

    // Bắt đầu đếm ngược 10s cho phép Undo
    startUndoTimer();
  };

  const startUndoTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setUndoCountdown(10);
    setShowUndoBanner(true);

    timerRef.current = setInterval(() => {
      setUndoCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShowUndoBanner(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleUndo = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowUndoBanner(false);
    setSelectedConditions(['Bình thường']);
    if (onCheckinUndo) {
      onCheckinUndo();
    }
  };

  return (
    <View style={styles.container}>
      {/* Widget Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Ionicons name="sparkles" size={18} color={COLORS.primary} style={styles.headerIcon} />
          <Text style={styles.widgetTag}>NHẬT KÝ LÀN DA</Text>
        </View>
        {isSubmitting && <ActivityIndicator size="small" color={COLORS.primary} />}
      </View>

      <Text style={styles.title}>Da bạn hôm nay thế nào ?</Text>
      <Text style={styles.subtitle}>Chọn cảm giác của da để SkinMate tối ưu hóa chu trình dưỡng hôm nay</Text>

      {/* 5 Chips / Icons */}
      <View style={styles.iconsRow}>
        {CHECKIN_OPTIONS.map((item) => {
          const isSelected = selectedConditions.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.iconCard,
                isSelected && styles.iconCardSelected,
                isSelected && { borderColor: item.color },
              ]}
              onPress={() => handleSelectCondition(item.id)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.iconCircle,
                  isSelected && { backgroundColor: item.color + '22' },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={isSelected ? item.color : COLORS.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.iconLabel,
                  isSelected && { color: item.color, fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 10-Second Undo Banner */}
      {showUndoBanner && (
        <View style={styles.undoBanner}>
          <View style={styles.undoLeft}>
            <Ionicons name="time-outline" size={18} color="#ffffff" />
            <Text style={styles.undoText}>
              Đã cập nhật Routine ({undoCountdown}s)
            </Text>
          </View>
          <TouchableOpacity style={styles.undoButton} onPress={handleUndo} activeOpacity={0.8}>
            <Text style={styles.undoButtonText}>Hoàn tác</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 6,
  },
  widgetTag: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginHorizontal: 3,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  iconCardSelected: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#ffffff',
  },
  iconLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMain,
    textAlign: 'center',
  },
  undoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
  },
  undoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  undoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  undoButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  undoButtonText: {
    color: '#042f2e',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default SkinCheckinWidget;
