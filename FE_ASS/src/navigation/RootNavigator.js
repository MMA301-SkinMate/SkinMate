import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNavigator from './BottomTabNavigator';
import SkinProfileSetup from '../screens/auth/SkinProfileSetup';
import RoutineHistoryScreen from '../screens/profile/RoutineHistoryScreen';
import ProductFormScreen from '../screens/collection/ProductFormScreen';
import ShareRoutineScreen from '../screens/community/ShareRoutineScreen';
import RoutineDetailScreen from '../screens/home/RoutineDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="SkinProfileSetup" component={SkinProfileSetup} />
      <Stack.Screen name="RoutineHistory" component={RoutineHistoryScreen} />
      <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ShareRoutine" component={ShareRoutineScreen} />
    </Stack.Navigator>
  );
}