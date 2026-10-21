import { NavigationContainer } from '@react-navigation/native';
import BottomTabNav from './BottomTabNav';

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <BottomTabNav />
        </NavigationContainer>
    );
}

export default AppNavigator;