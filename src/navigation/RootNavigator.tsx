import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../store/AuthContext';
import { colors } from '../utils/theme';

const RootNavigator = () => {
  const { user, loading } = useAuth();

  // Debug auth state changes
  useEffect(() => {
    console.log('RootNavigator - Auth State:', { 
      isAuthenticated: !!user,
      userEmail: user?.email ?? 'No user', 
      loading 
    });
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator; 