import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IntroScreen from '../screens/intro/IntroScreen';
import BottomTabNav from './BottomTabNav';
import Login from '../screens/auth/Login';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ initialRouteName = 'Intro' }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Main" component={BottomTabNav} />
    </Stack.Navigator>
  );
}
