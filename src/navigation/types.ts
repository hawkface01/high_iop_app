import type { StackScreenProps, StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';

// --- Param List Definitions ---

// App stack (used by AppNavigator)
export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  EditProfile: undefined;
  Result: { scanId: string };
  ScanDetail: { scanId: string };
  // Add other App-level screens here (e.g., settings details)
};

// Bottom Tab navigator screens
export type MainTabParamList = {
  Home: undefined;
  ScanStack: NavigatorScreenParams<ScanStackParamList>; // Nests the Scan stack
  History: undefined;
  Settings: undefined;
};

// Scan stack navigator screens (nested under Scan tab)
export type ScanStackParamList = {
  ScanInitiation: undefined;
  Detection: { imageUri: string };
};

// --- Screen Prop Type Helpers ---

// Use this for screens directly in AppStack (e.g., EditProfileScreen)
export type AppStackScreenProps<T extends keyof AppStackParamList> =
  StackScreenProps<AppStackParamList, T>;

// Use this for screens directly in MainTabs (e.g., HomeScreen, HistoryScreen)
// Note: Provides navigation prop typed for BottomTabNavigator combined with parent AppStack
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    StackScreenProps<AppStackParamList> // Parent is AppStack
  >;

// Use this for screens in ScanStack (e.g., ScanInitiationScreen, DetectionScreen)
// Note: Provides navigation prop typed for ScanStack combined with parent MainTabs
export type ScanStackScreenProps<T extends keyof ScanStackParamList> =
  CompositeScreenProps<
    StackScreenProps<ScanStackParamList, T>,
    MainTabScreenProps<'ScanStack'> // Parent is MainTabScreenProps for the 'ScanStack' tab
  >;

// Use this with the useNavigation hook inside ScanStack screens
// Provides type safety for navigating within ScanStack (Detection <-> ScanInitiation)
// For navigating outside (e.g., to Home), type safety might be reduced depending on usage.
export type ScanStackNavigationProp = StackNavigationProp<ScanStackParamList>; 