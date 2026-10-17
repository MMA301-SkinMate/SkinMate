import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { INTRO_DATA } from '../../data/introData';
import IntroHeader from '../../components/intro/IntroHeader';
import IntroFooter from '../../components/intro/IntroFooter';
import SlideItem from '../../components/intro/SlideItem';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

const IntroScreen = ({ navigation, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
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

    if (onFinish) {
      onFinish();
      return;
    }

    if (navigation) {
      navigation.navigate('Login');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <IntroHeader
        currentIndex={currentIndex}
        handleBack={handleBack}
        handleSkip={handleSkip}
      />

      {/* SLIDER */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default IntroScreen;