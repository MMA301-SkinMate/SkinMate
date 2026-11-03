import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNav';
import ProductDetailModal from '../screens/collection/ProductDetailModal';
import ExpiryCalendarScreen from '../screens/collection/ExpiryCalendarScreen';
import CreatePostScreen from '../screens/community/CreatePostScreen';
import PostDetailScreen from '../screens/community/PostDetailScreen';
import RoutineSetupScreen from '../screens/routine/RoutineSetupScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="RoutineSetup" component={RoutineSetupScreen} />
      <Stack.Screen
        name="ProductDetailModal"
        component={ProductDetailModal}
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen name="ExpiryCalendar" component={ExpiryCalendarScreen} />
    </Stack.Navigator>
  );
}
