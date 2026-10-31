import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { INTRO_DATA } from '../../data/introData';
import IntroHeader from '../../components/intro/IntroHeader';
import IntroFooter from '../../components/intro/IntroFooter';
import SlideItem from '../../components/intro/SlideItem';
import { COLORS } from '../../constants/colors';
import SkinGuideModal from '../../components/routine/SkinGuideModal';
import QuickAddToClosetModal from '../../components/routine/QuickAddToClosetModal';
import { updateSkinProfile } from '../../api/routineApi';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

const SKIN_TYPES = [
  { id: 'oily', label: 'Da Dầu', desc: 'Đổ nhiều dầu, dễ bí tắc', icon: 'water-outline' },
  { id: 'dry', label: 'Da Khô', desc: 'Khô ráp, bong tróc', icon: 'sunny-outline' },
  { id: 'combination', label: 'Da Hỗn Hợp', desc: 'Dầu vùng chữ T, khô 2 má', icon: 'contrast-outline' },
  { id: 'sensitive', label: 'Da Nhạy Cảm', desc: 'Dễ ửng đỏ, châm chích', icon: 'shield-outline' },
  { id: 'normal', label: 'Da Thường', desc: 'Cân bằng, khỏe mạnh', icon: 'sparkles-outline' },
];

const SKIN_CONCERNS = [
  'Mụn ẩn & đầu đen',
  'Lỗ chân lông to',
  'Hàng rào phục hồi',
  'Da khô thiếu nước',
  'Thâm sạm & không đều màu',
  'Lão hóa & nếp nhăn',
];

const ALLERGIES_LIST = [
  'Alcohol Denat (Cồn khô)',
  'Fragrance / Parfum (Hương liệu)',
  'Tea Tree Oil (Tràm trà)',
  'Dầu khoáng (Mineral Oil)',
  'Parabens',
];

const IntroScreen = ({ navigation, onFinish }) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSkinProfileStep, setIsSkinProfileStep] = useState(false);

  // State hồ sơ da (UC 5)
  const [selectedSkinType, setSelectedSkinType] = useState('oily');
  const [selectedConcerns, setSelectedConcerns] = useState(['Mụn ẩn & đầu đen', 'Lỗ chân lông to']);
  const [selectedAllergies, setSelectedAllergies] = useState(['Alcohol Denat (Cồn khô)']);

  // Modals (UC 6, UC 7)
  const [guideModalVisible, setGuideModalVisible] = useState(false);
  const [closetModalVisible, setClosetModalVisible] = useState(false);

  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < INTRO_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      return;
    }

    // Chuyển sang bước Thiết lập Hồ sơ da (UC 5)
    setIsSkinProfileStep(true);
  };

  const handleBack = () => {
    if (isSkinProfileStep) {
      setIsSkinProfileStep(false);
      return;
    }
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    setIsSkinProfileStep(true);
  };

  const toggleConcern = (item) => {
    if (selectedConcerns.includes(item)) {
      setSelectedConcerns(selectedConcerns.filter(c => c !== item));
    } else {
      setSelectedConcerns([...selectedConcerns, item]);
    }
  };

  const toggleAllergy = (item) => {
    if (selectedAllergies.includes(item)) {
      setSelectedAllergies(selectedAllergies.filter(a => a !== item));
    } else {
      setSelectedAllergies([...selectedAllergies, item]);
    }
  };

  const handleSaveProfileAndOpenGuide = async () => {
    try {
      if (user) {
        await updateSkinProfile({
          skinType: selectedSkinType,
          allergies: selectedAllergies,
          currentConcerns: selectedConcerns,
          forceReset: true,
        });
      }
    } catch (e) {
      // Bỏ qua lỗi mạng nếu đang chạy ở chế độ offline intro
    }
    // Mở popup cẩm nang da (UC 6)
    setGuideModalVisible(true);
  };

  const handleFinishAll = () => {
    if (onFinish) {
      onFinish();
    } else if (navigation) {
      navigation.navigate('Login');
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const getItemLayout = useCallback(
    (_, index) => ({
      length: width,
      offset: width * index,
      index,
    }),
    []
  );

  const renderSlideItem = ({ item }) => <SlideItem item={item} />;
  const isLastSlide = currentIndex === INTRO_DATA.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9f9ff" />

      {/* HEADER */}
      <IntroHeader
        currentIndex={currentIndex}
        handleBack={handleBack}
        handleSkip={handleSkip}
      />

      {!isSkinProfileStep ? (
        <>
          {/* SLIDER CAROUSEL */}
          <FlatList
            ref={flatListRef}
            data={INTRO_DATA}
            keyExtractor={(item) => item.id}
            renderItem={renderSlideItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewConfig}
            getItemLayout={getItemLayout}
            scrollEventThrottle={16}
          />

          {/* FOOTER CONTROLS */}
          <IntroFooter
            currentIndex={currentIndex}
            totalCount={INTRO_DATA.length}
            handleNext={handleNext}
            isLastSlide={isLastSlide}
          />
        </>
      ) : (
        /* UC 5: MÀN HÌNH THIẾT LẬP HỒ SƠ DA */
        <ScrollView style={styles.profileContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.badgeRow}>
            <View style={styles.ecoBadge}>
              <Ionicons name="leaf-outline" size={14} color="#006c49" />
              <Text style={styles.ecoBadgeText}>SKIN PROFILE SETUP</Text>
            </View>
          </View>

          <Text style={styles.screenHeading}>Thiết lập Hồ sơ da</Text>
          <Text style={styles.screenSubHeading}>
            Cung cấp thông tin để SkinMate tra cứu cẩm nang hoạt chất và gợi ý chuỗi routine chuẩn xác.
          </Text>

          {/* 1. Chọn loại da */}
          <Text style={styles.sectionTitle}>1. Loại da nền tảng *</Text>
          <View style={styles.skinTypeGrid}>
            {SKIN_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.skinTypeCard,
                  selectedSkinType === type.id && styles.skinTypeCardActive,
                ]}
                onPress={() => setSelectedSkinType(type.id)}
              >
                <View style={[
                  styles.typeIconBox,
                  selectedSkinType === type.id && styles.typeIconBoxActive,
                ]}>
                  <Ionicons
                    name={type.icon}
                    size={20}
                    color={selectedSkinType === type.id ? '#ffffff' : '#006c49'}
                  />
                </View>
                <Text style={[
                  styles.skinTypeLabel,
                  selectedSkinType === type.id && styles.skinTypeLabelActive,
                ]}>
                  {type.label}
                </Text>
                <Text style={styles.skinTypeDesc}>{type.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 2. Tình trạng hiện tại */}
          <Text style={styles.sectionTitle}>2. Tình trạng da cần cải thiện hiện tại</Text>
          <View style={styles.chipGroup}>
            {SKIN_CONCERNS.map((c, i) => {
              const active = selectedConcerns.includes(c);
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleConcern(c)}
                >
                  <Ionicons
                    name={active ? 'checkmark-circle' : 'add-circle-outline'}
                    size={16}
                    color={active ? '#ffffff' : '#006c49'}
                  />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 3. Thành phần dị ứng */}
          <Text style={styles.sectionTitle}>3. Thành phần dị ứng / Cần tránh</Text>
          <View style={styles.chipGroup}>
            {ALLERGIES_LIST.map((a, i) => {
              const active = selectedAllergies.includes(a);
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.allergyChip, active && styles.allergyChipActive]}
                  onPress={() => toggleAllergy(a)}
                >
                  <Ionicons
                    name={active ? 'close-circle' : 'alert-circle-outline'}
                    size={16}
                    color={active ? '#ffffff' : '#ba1a1a'}
                  />
                  <Text style={[styles.allergyChipText, active && styles.allergyChipTextActive]}>
                    {a}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaGroup}>
            {/* UC 6: Nút xem Cẩm nang da Do's & Don'ts */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSaveProfileAndOpenGuide}
            >
              <Ionicons name="book-outline" size={20} color="#ffffff" />
              <Text style={styles.primaryBtnText}>Lưu & Xem Cẩm Nang Da (Do/Don't)</Text>
            </TouchableOpacity>

            {/* UC 7: Nút mở popup thêm vào tủ đồ */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setClosetModalVisible(true)}
            >
              <Ionicons name="file-tray-full-outline" size={18} color="#006c49" />
              <Text style={styles.secondaryBtnText}>Thêm sản phẩm đầu tiên vào Tủ đồ</Text>
            </TouchableOpacity>

            {/* Hoàn tất Intro */}
            <TouchableOpacity
              style={styles.textBtn}
              onPress={handleFinishAll}
            >
              <Text style={styles.textBtnTitle}>Tiếp tục vào ứng dụng →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* UC 6: POPUP CẨM NANG DA */}
      <SkinGuideModal
        visible={guideModalVisible}
        onClose={() => setGuideModalVisible(false)}
        skinType={selectedSkinType}
        allergies={selectedAllergies}
      />

      {/* UC 7: POPUP THÊM VÀO TỦ ĐỒ */}
      <QuickAddToClosetModal
        visible={closetModalVisible}
        onClose={() => setClosetModalVisible(false)}
        onSuccess={() => {
          Alert.alert('Thành công', 'Đã thêm vào tủ đồ! Bạn có thể tiếp tục vào app.');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },
  profileContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ecoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#97f5cc',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ecoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005236',
    letterSpacing: 0.5,
  },
  screenHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#141b2b',
    marginBottom: 6,
  },
  screenSubHeading: {
    fontSize: 13,
    color: '#6c7a71',
    lineHeight: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00422b',
    marginTop: 14,
    marginBottom: 10,
  },
  skinTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skinTypeCard: {
    width: (width - 50) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#e9edff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  skinTypeCardActive: {
    borderColor: '#10b981',
    backgroundColor: '#f1f3ff',
  },
  typeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e9edff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  typeIconBoxActive: {
    backgroundColor: '#10b981',
  },
  skinTypeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141b2b',
  },
  skinTypeLabelActive: {
    color: '#006c49',
  },
  skinTypeDesc: {
    fontSize: 11,
    color: '#6c7a71',
    marginTop: 2,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bbcabf',
  },
  chipActive: {
    backgroundColor: '#006c49',
    borderColor: '#006c49',
  },
  chipText: {
    fontSize: 12,
    color: '#006c49',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ffdad6',
  },
  allergyChipActive: {
    backgroundColor: '#ba1a1a',
    borderColor: '#ba1a1a',
  },
  allergyChipText: {
    fontSize: 12,
    color: '#ba1a1a',
    fontWeight: '600',
  },
  allergyChipTextActive: {
    color: '#ffffff',
  },
  ctaGroup: {
    marginTop: 24,
    marginBottom: 40,
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#97f5cc',
    borderRadius: 16,
    paddingVertical: 13,
  },
  secondaryBtnText: {
    color: '#005236',
    fontSize: 14,
    fontWeight: '700',
  },
  textBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  textBtnTitle: {
    color: '#006c49',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default IntroScreen;