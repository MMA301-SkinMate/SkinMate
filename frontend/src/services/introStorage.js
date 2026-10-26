import AsyncStorage from "@react-native-async-storage/async-storage";

export const INTRO_COMPLETED_KEY = "skinmate.intro.completed";

export const loadIntroCompleted = async () =>
  (await AsyncStorage.getItem(INTRO_COMPLETED_KEY)) === "true";

export const markIntroCompleted = () =>
  AsyncStorage.setItem(INTRO_COMPLETED_KEY, "true");
