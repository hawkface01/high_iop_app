import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from './utils/theme';
import { AuthProvider } from './store/AuthContext';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <RootNavigator />
          <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
} 