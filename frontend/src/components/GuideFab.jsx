import { useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/theme';
import { profileApi } from '../api/profileApi';

export default function GuideFab() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState({ dos: [], donts: [] });
  const { width, height } = useWindowDimensions();
  const size = 46;
  const position = useRef(new Animated.ValueXY({ x: Math.max(SPACING.md, width - size - SPACING.md), y: Math.max(70, height - 150) })).current;
  const moved = useRef(false);
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3,
    onPanResponderGrant: () => {
      moved.current = false;
      position.setOffset({ x: position.x.__getValue(), y: position.y.__getValue() });
      position.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: (_event, gesture) => {
      moved.current = Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4;
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: () => {
      position.flattenOffset();
      const x = Math.min(Math.max(SPACING.md, position.x.__getValue()), width - size - SPACING.md);
      const y = Math.min(Math.max(70, position.y.__getValue()), height - size - SPACING.md);
      Animated.spring(position, { toValue: { x, y }, useNativeDriver: true, bounciness: 5 }).start();
    },
  })).current;

  const openGuide = async () => {
    setVisible(true);
    setLoading(true);
    try {
      const profile = await profileApi.get();
      setGuide({ dos: profile?.skinProfile?.customDos || [], donts: profile?.skinProfile?.customDonts || [] });
    } catch {
      setGuide({ dos: [], donts: [] });
    } finally {
      setLoading(false);
    }
  };

  return <>
    <Animated.View {...panResponder.panHandlers} style={[styles.fab, { width: size, height: size, borderRadius: size / 2 }, { transform: position.getTranslateTransform() }]}><Pressable accessible accessibilityRole="button" accessibilityLabel="Open skincare guide" onPress={openGuide} style={styles.button}><Ionicons name="book-open-outline" size={20} color={COLORS.textLight} /></Pressable></Animated.View>
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
        <Pressable style={styles.guideCard} onPress={(event) => event.stopPropagation()}>
          <View style={styles.guideHeader}><View><Text style={styles.guideTitle}>Skincare guide</Text><Text style={styles.guideSubtitle}>Your personalized Dos and Don'ts</Text></View><Pressable onPress={() => setVisible(false)}><Ionicons name="close" size={23} color={COLORS.textSecondary} /></Pressable></View>
          {loading ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : <View style={styles.columns}><GuideColumn title="Dos" values={guide.dos} color={COLORS.success} icon="checkmark-circle-outline" /><GuideColumn title="Don'ts" values={guide.donts} color={COLORS.error} icon="close-circle-outline" /></View>}
        </Pressable>
      </Pressable>
    </Modal>
  </>;
}

function GuideColumn({ title, values, color, icon }) {
  return <View style={styles.column}><Text style={[styles.columnTitle, { color }]}>{title}</Text>{values.length ? values.map((value) => <View key={value} style={styles.ingredient}><Ionicons name={icon} size={15} color={color} /><Text style={styles.ingredientText}>{value}</Text></View>) : <Text style={styles.empty}>No items yet</Text>}</View>;
}

const styles = StyleSheet.create({ fab: { position: 'absolute', left: 0, top: 0, backgroundColor: COLORS.primary, elevation: 5, shadowColor: COLORS.shadow, shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: { width: 0, height: 3 } }, button: { flex: 1, alignItems: 'center', justifyContent: 'center' }, modalOverlay: { flex: 1, justifyContent: 'center', padding: SPACING.lg, backgroundColor: COLORS.overlay }, guideCard: { borderRadius: 22, padding: SPACING.lg, backgroundColor: COLORS.background }, guideHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, guideTitle: { color: COLORS.textMain, fontSize: 20, fontWeight: '700' }, guideSubtitle: { marginTop: 4, color: COLORS.textSecondary, fontSize: 13 }, loader: { marginVertical: SPACING.xxl }, columns: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl }, column: { flex: 1, padding: SPACING.sm, borderRadius: 14, backgroundColor: COLORS.surface }, columnTitle: { fontSize: 15, fontWeight: '700', marginBottom: SPACING.sm }, ingredient: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginBottom: SPACING.xs }, ingredientText: { flex: 1, color: COLORS.textMain, fontSize: 12, lineHeight: 17 }, empty: { color: COLORS.textMuted, fontSize: 12 } });
