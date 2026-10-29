
import AsyncStorage from '@react-native-async-storage/async-storage';

const INTRO_KEY = "skinmate.intro.completed"

export const introStorage = {
    async getHasSeenIntro() {
        const value = await AsyncStorage.getItem(INTRO_KEY);
        return value === 'true';
    },

    async setHasSeenIntro() {
        await AsyncStorage.setItem(INTRO_KEY, 'true');
    }
};