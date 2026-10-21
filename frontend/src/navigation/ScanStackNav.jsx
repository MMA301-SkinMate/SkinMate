import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScanScreen from '../screens/scan/ScanScreen';
import ProductInfoDetailScreen from '../screens/scan/ProductInfoDetailScreen';

const Stack = createNativeStackNavigator();

const ScanStackNav = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Scan" component={ScanScreen} />
            <Stack.Screen name="ProductInfoDetail" component={ProductInfoDetailScreen} />
        </Stack.Navigator>
    );
}

export default ScanStackNav;