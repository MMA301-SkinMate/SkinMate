import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import SkinCheckInWidget from '../../components/routine/SkinCheckInWidget';
import DailyRoutineWidget from '../../components/routine/DailyRoutineWidget';
import { useCommunity } from '../../context/CommunityContext';
import { COLORS } from '../../constants/colors';
import { AppText } from '../../components/common/AppText';
import { Card } from '../../components/common/Card';
import { RADIUS, SPACING } from '../../constants/theme';

const HomeScreen = ({ navigation }) => {
    const [routineVersion, setRoutineVersion] = useState(0);
    const [conditions, setConditions] = useState(['Binh_Thuong']);
    const { posts } = useCommunity();
    return (
        <ScreenWrapper scroll>
            <View style={styles.hero}>
                <View style={styles.heroGlow} />
                <View style={styles.heading}>
                    <View><AppText variant="caption" color="primaryDark" style={styles.eyebrow}>YOUR DAILY SKINCARE</AppText><AppText variant="title" color="textMain">Your skin space</AppText><AppText variant="caption" color="textSecondary">A little care, every day.</AppText></View>
                    <View style={styles.heroIcon}><Ionicons name="flower-outline" size={27} color={COLORS.primary} /></View>
                </View>
                <Pressable onPress={() => navigation.navigate('RoutineSetup')} style={({ pressed }) => [styles.setupButton, pressed && styles.pressed]}>
                    <Ionicons name="sparkles-outline" size={16} color={COLORS.textLight} />
                    <AppText variant="caption" color="textLight" style={styles.setupText}>Build my routine</AppText>
                    <Ionicons name="arrow-forward" size={15} color={COLORS.textLight} />
                </Pressable>
            </View>
            <SkinCheckInWidget onSaved={(nextConditions) => { setConditions(nextConditions); setRoutineVersion((version) => version + 1); }} />
            <DailyRoutineWidget navigation={navigation} refreshKey={routineVersion} conditions={conditions} />
            <View style={styles.communityHeader}><AppText variant="section" color="textMain">Recommended for you</AppText><Ionicons name="people-outline" size={20} color={COLORS.primary} /></View>
            {(posts || []).slice(0, 3).map((post) => <Card key={post.id} onPress={() => navigation.navigate('PostDetail', { postId: post.id })} style={styles.postCard}><AppText variant="label" color="textMain">{post.title || 'Skincare routine from the community'}</AppText><AppText variant="bodySmall" color="textSecondary" numberOfLines={2} style={styles.postText}>{post.note || post.content || 'Discover a routine that matches your skin.'}</AppText></Card>)}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    hero: { overflow: 'hidden', padding: SPACING.lg, marginTop: SPACING.sm, marginBottom: SPACING.xs, borderRadius: 28, backgroundColor: '#e3f5ef', borderWidth: 1, borderColor: '#d0ebe3' },
    heroGlow: { position: 'absolute', width: 150, height: 150, top: -76, right: -25, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.48)' },
    heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    eyebrow: { fontWeight: '700', letterSpacing: 1.1, marginBottom: 4 },
    heroIcon: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)' },
    setupButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: SPACING.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.pill, backgroundColor: COLORS.primary },
    setupText: { fontWeight: '700' }, pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
    communityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.xl, marginBottom: SPACING.sm },
    postCard: { marginBottom: SPACING.sm },
    postText: { marginTop: SPACING.xs },
});

export default HomeScreen;
