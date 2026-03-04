import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import AppNavigator from './src/navigation/AppNavigator';
import store from './src/store';
import AuthBootstrap from './src/components/AuthBootstrap.jsx';
import OTAUpdateManager from './src/components/OTAUpdateManager.jsx';

export default function App() {
  return (
    <Provider store={store}>
      <AuthBootstrap />
      <OTAUpdateManager />
      <StatusBar style="light" />
      <AppNavigator />
    </Provider>
  );
}
