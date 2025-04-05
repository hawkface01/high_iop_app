import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// App Screens
import HomeScreen from '../screens/Home/HomeScreen';
import ScanInitiationScreen from '../screens/Scan/ScanInitiationScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import EditProfileScreen from '../screens/Settings/EditProfileScreen';
import HelpSupportScreen from '../screens/Settings/HelpSupportScreen';
import PrivacyPolicyScreen from '../screens/Settings/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/Settings/TermsOfServiceScreen';
import ChangePasswordScreen from '../screens/Settings/ChangePasswordScreen';
import ResultScreen from '../screens/Result/ResultScreen';
import ScanDetailScreen from '../screens/Scan/ScanDetailScreen';
import { colors } from '../utils/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  History: undefined;
  Settings: undefined;
};

const MainTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: keyof MainTabParamList } }) => ({
        tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.disabled,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          backgroundColor: colors.surface,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="Scan" 
        component={ScanInitiationScreen}
        options={{
          title: 'Scan',
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          title: 'History',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // You might want to show a loading screen here
    return null;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      {!user ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // App Stack
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="ScanDetail" component={ScanDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 
