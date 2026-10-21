import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';

import HomeScreen from '../screens/home/HomeScreen';
import CollectionScreen from '../screens/collection/CollectionScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ScanStackNav from './ScanStackNav';

const Tab = createBottomTabNavigator();

const CustomScanButton = ({ onPress }) => (
    <TouchableOpacity
        style={styles.scanButtonContainer}
        onPress={onPress}
        activeOpacity={0.85}
    >
        <View style={styles.scanButtonInner}>
            <Ionicons name="scan-outline" size={26} color={COLORS.textLight} />
        </View>
        <Text style={styles.scanLabel}>Scan</Text>
    </TouchableOpacity>
);

const BottomTabNav = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Collection"
                component={CollectionScreen}
                options={{
                    tabBarLabel: 'Collection',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="albums-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="ScanTab"
                component={ScanStackNav}
                options={{
                    tabBarLabel: () => null,
                    tabBarButton: (props) => <CustomScanButton {...props} />,
                }}
            />
            <Tab.Screen
                name="Community"
                component={CommunityScreen}
                options={{
                    tabBarLabel: 'Community',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        height: Platform.OS === 'ios' ? 88 : 68,
        paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        paddingTop: 8,
        elevation: 8,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: -2,
    },
    scanButtonContainer: {
        top: -16,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    scanButtonInner: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    scanLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: COLORS.textSecondary,
        marginTop: 4,
    },
});

export default BottomTabNav;