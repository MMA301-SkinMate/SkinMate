import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNav';
import AddProductScreen from '../screens/collection/AddProductScreen';
import ProductDetailModal from '../screens/collection/ProductDetailModal';
import ExpiryCalendarScreen from '../screens/collection/ExpiryCalendarScreen';
import CreatePostScreen from '../screens/community/CreatePostScreen';
import PostDetailScreen from '../screens/community/PostDetailScreen';
import SkinProfileSetup from '../screens/auth/SkinProfileSetup';
import EditProfileScreen from '../screens/profile/edit-profile-screen';
import RoutineHistoryScreen from '../screens/profile/RoutineHistoryScreen';
import ProfileRoutineDetailScreen from '../screens/home/RoutineDetailScreen';
import RoutineDetailScreen from '../screens/routine/RoutineDetailScreen';
import DailyRoutineDetailScreen from '../screens/home/DailyRoutineDetailScreen';
import TreatmentPlanDetailScreen from '../screens/home/TreatmentPlanDetailScreen';
import SuggestedPlansScreen from '../screens/home/SuggestedPlansScreen';
import EditPlanScreen from '../screens/home/EditPlanScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="DailyRoutineDetail" component={DailyRoutineDetailScreen} />
      <Stack.Screen name="TreatmentPlanDetail" component={TreatmentPlanDetailScreen} />
      <Stack.Screen name="SuggestedPlans" component={SuggestedPlansScreen} />
      <Stack.Screen name="EditPlan" component={EditPlanScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
      <Stack.Screen
        name="ProductDetailModal"
        component={ProductDetailModal}
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen name="SkinProfileSetup" component={SkinProfileSetup} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="RoutineHistory" component={RoutineHistoryScreen} />
      <Stack.Screen name="ProfileRoutineDetail" component={ProfileRoutineDetailScreen} />
      <Stack.Screen name="ExpiryCalendar" component={ExpiryCalendarScreen} />
    </Stack.Navigator>
  );
}
