import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Grid, Camera, Users, User } from 'lucide-react-native';
import { Colors } from '../constants/theme';

import HomeScreen from '../screens/home/HomeScreen';
import MyCollectionScreen from '../screens/collection/MyCollectionScreen';
import CommunityFeedScreen from '../screens/community/CommunityFeedScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

function CustomTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity style={styles.fabContainer} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.fabButton}>{children}</View>
    </TouchableOpacity>
  );
}

export default function BottomTabNavigator({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: Colors.border,
        },
      }}
    >
      <Tab.Screen
        name="TabHome"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="TabCollection"
        component={MyCollectionScreen}
        options={{
          tabBarLabel: 'Tủ đồ',
          tabBarIcon: ({ color }) => <Grid size={22} color={color} />,
        }}
      />
      {/* Nút FAB Camera nổi: Nhấn vào sẽ đẩy màn hình Scanner lên */}
      <Tab.Screen
        name="TabScan"
        component={View}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Scanner');
          },
        }}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => <Camera size={26} color="#FFFFFF" />,
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen
        name="TabCommunity"
        component={CommunityFeedScreen}
        options={{
          tabBarLabel: 'Cộng đồng',
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="TabProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});