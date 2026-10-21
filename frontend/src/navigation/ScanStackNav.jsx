import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScanScreen from '../screens/scan/ScanScreen';
import ProductInfoDetailScreen from '../screens/scan/ProductInfoDetailScreen';
import AddProductScreen from '../screens/scan/AddProductScreen';

const Stack = createNativeStackNavigator();

const ScanStackNav = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Scan" component={ScanScreen} />
            <Stack.Screen name="ProductInfoDetail" component={ProductInfoDetailScreen} />
            <Stack.Screen name="AddProductScreen" component={AddProductScreen} />
        </Stack.Navigator>
    );
}

export default ScanStackNav;