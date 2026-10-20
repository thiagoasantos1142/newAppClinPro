import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import AppNavigator from './src/navigation/AppNavigator';
import store from './src/store';
import AuthBootstrap from './src/components/AuthBootstrap.jsx';
import OTAUpdateManager from './src/components/OTAUpdateManager.jsx';
import { Text, TextInput } from 'react-native';
import { useFonts } from 'expo-font';
import { typography } from './src/theme/tokens';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = [{ fontFamily: typography.fontFamily.regular }, Text.defaultProps.style];
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.style = [{ fontFamily: typography.fontFamily.regular, fontSize: 16 }, TextInput.defaultProps.style];

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <AuthBootstrap />
      <OTAUpdateManager />
      <StatusBar style="light" />
      <AppNavigator />
    </Provider>
  );
}
