import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNav';
import AddProductScreen from '../screens/collection/AddProductScreen';
import ProductDetailModal from '../screens/collection/ProductDetailModal';
import ExpiryCalendarScreen from '../screens/collection/ExpiryCalendarScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
    <Stack.Screen name="AddProduct" component={AddProductScreen} />
    <Stack.Screen name="ProductDetailModal" component={ProductDetailModal} options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', contentStyle: { backgroundColor: 'transparent' } }} />
    <Stack.Screen name="ExpiryCalendar" component={ExpiryCalendarScreen} />
  </Stack.Navigator>;
}
