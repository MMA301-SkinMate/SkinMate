import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNav from './BottomTabNav';
import DailyRoutineDetailScreen from '../screens/routine/DailyRoutineDetailScreen';
import TreatmentPlanDetailScreen from '../screens/routine/TreatmentPlanDetailScreen';
import SuggestRoutineScreen from '../screens/routine/SuggestRoutineScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* 5 Main Tabs (Home, Collection, Scan, Community, Profile) */}
      <Stack.Screen name="MainTabs" component={BottomTabNav} />

      {/* 16. View Daily Routine Detail (5 bước dạng card ngang) */}
      <Stack.Screen name="DailyRoutineDetail" component={DailyRoutineDetailScreen} />

      {/* 17 & 18. View chuỗi routine detail & Add/Edit có check xung đột */}
      <Stack.Screen name="TreatmentPlanDetail" component={TreatmentPlanDetailScreen} />

      {/* 15. Gợi ý chuỗi routine */}
      <Stack.Screen name="SuggestRoutine" component={SuggestRoutineScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
