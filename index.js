import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

// Ignore certain warnings
LogBox.ignoreLogs([
  'Possible Unhandled Promise Rejection',
  'Warning: componentWillReceiveProps',
  'Setting a timer'
]);

// Clear cache in development
if (__DEV__) {
  // Clear AsyncStorage on app start during development
  import('@react-native-async-storage/async-storage').then(AsyncStorage => {
    AsyncStorage.default.clear().catch(err => {
      console.warn('AsyncStorage clear error:', err);
    });
  });
}

AppRegistry.registerComponent(appName, () => App); 