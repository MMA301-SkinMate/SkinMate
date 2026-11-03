import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNav';
import ProductDetailModal from '../screens/collection/ProductDetailModal';
import ExpiryCalendarScreen from '../screens/collection/ExpiryCalendarScreen';
import PostDetailScreen from '../screens/community/PostDetailScreen';
import RoutineSetupScreen from '../screens/routine/RoutineSetupScreen.jsx';
import RoutineDetailScreen from '../screens/routine/RoutineDetailScreen.jsx';
import RoutineEditScreen from '../screens/routine/RoutineEditScreen.jsx';
import RoutineChainDetailScreen from '../screens/routine/RoutineChainDetailScreen.jsx';
import RoutineHistoryScreen from '../screens/routine/RoutineHistoryScreen.jsx';
import EditProfileScreen from '../screens/profile/EditProfileScreen.jsx';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen.jsx';
import SkinProfileScreen from '../screens/profile/SkinProfileScreen.jsx';
import ShareRoutineScreen from '../screens/profile/ShareRoutineScreen.jsx';
import GuideFab from '../components/GuideFab';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="RoutineSetup" component={RoutineSetupScreen} />
      <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
      <Stack.Screen name="RoutineEdit" component={RoutineEditScreen} />
      <Stack.Screen name="RoutineChainDetail" component={RoutineChainDetailScreen} />
      <Stack.Screen name="RoutineHistory" component={RoutineHistoryScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="SkinProfile" component={SkinProfileScreen} />
      <Stack.Screen name="ShareRoutine" component={ShareRoutineScreen} />
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
    <GuideFab />
    </>
  );
}
