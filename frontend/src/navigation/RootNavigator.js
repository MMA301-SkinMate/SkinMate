import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthSession } from '../context/AuthSessionContext';

import BottomTabNavigator from './BottomTabNavigator';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import NewPasswordScreen from '../screens/auth/NewPasswordScreen';
import PasswordSuccessScreen from '../screens/auth/PasswordSuccessScreen';
import SkinProfileSetup from '../screens/auth/SkinProfileSetup';

import DailyRoutineDetail from '../screens/home/DailyRoutineDetail';
import ProductDetailModal from '../screens/collection/ProductDetailModal';
import AddProductScreen from '../screens/collection/AddProductScreen';

import ScannerScreen from '../screens/scan/ScannerScreen';
import OcrEditScreen from '../screens/scan/OcrEditScreen';
import AnalysisReportScreen from '../screens/scan/AnalysisReportScreen';
import ScanHistoryScreen from '../screens/scan/ScanHistoryScreen';

import PostDetailScreen from '../screens/community/PostDetailScreen';
import CreatePostScreen from '../screens/community/CreatePostScreen';
import RoutineHistoryScreen from '../screens/profile/RoutineHistoryScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { session, isRestoring } = useAuthSession();

  if (isRestoring) return null;

  return (
    <Stack.Navigator
      key={session ? 'authenticated' : 'anonymous'}
      initialRouteName={session ? 'MainTabs' : 'Onboarding'}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      {/* 1. Luồng Auth & Onboarding */}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
      <Stack.Screen name="PasswordSuccess" component={PasswordSuccessScreen} />
      <Stack.Screen name="SkinProfileSetup" component={SkinProfileSetup} />

      {/* 2. Main Tab */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      {/* 3. Màn hình chi tiết Home & Collection */}
      <Stack.Screen name="DailyRoutineDetail" component={DailyRoutineDetail} />
      <Stack.Screen
        name="ProductDetailModal"
        component={ProductDetailModal}
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />

      <Stack.Screen name="AddProduct" component={AddProductScreen} />

      {/* 4. Luồng Scan AI */}
      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen name="OcrEdit" component={OcrEditScreen} />
      <Stack.Screen name="AnalysisReport" component={AnalysisReportScreen} />
      <Stack.Screen name="ScanHistory" component={ScanHistoryScreen} />

      {/* 5. Luồng Community & Profile */}
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="RoutineHistory" component={RoutineHistoryScreen} />
    </Stack.Navigator>
  );
}