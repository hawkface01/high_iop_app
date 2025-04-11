import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScanInitiationScreen from '../screens/Scan/ScanInitiationScreen';
import DetectionScreen from '../screens/Scan/DetectionScreen';
import { ScanStackParamList } from './types'; // Import the param list type
import { colors } from '../utils/theme';

const Stack = createStackNavigator();

const ScanNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ScanInitiation"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false, // Hide back button text on iOS
        cardStyle: { backgroundColor: colors.background }, // Background for the screen area
      }}
    >
      <Stack.Screen
        name="ScanInitiation"
        component={ScanInitiationScreen}
        options={{ title: 'Start Scan' }} // Set screen title
      />
      <Stack.Screen
        name="Detection"
        component={DetectionScreen}
        options={{ title: 'Run IOP Detection' }} // Title can also be set in the screen component
      />
    </Stack.Navigator>
  );
};

export default ScanNavigator; 