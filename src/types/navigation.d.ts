// This is a simplified type declaration file to fix TypeScript errors
// In a production app, you would use the proper types from @types packages

declare module '@react-navigation/native' {
  export interface NavigationContainerProps {
    children: React.ReactNode;
  }

  export interface NavigationProp<ParamList> {
    navigate: (routeName: keyof ParamList, params?: any) => void;
    goBack: () => void;
  }

  export interface ParamListBase {
    [key: string]: object | undefined;
  }

  export interface RouteProp<ParamList, RouteName extends keyof ParamList> {
    key: string;
    name: RouteName;
    params: ParamList[RouteName];
  }

  export function NavigationContainer(props: NavigationContainerProps): JSX.Element;
  export function useNavigation<T = NavigationProp<ParamListBase>>(): T;
  export function useRoute<T = RouteProp<ParamListBase, keyof ParamListBase>>(): T;
}

declare module '@react-navigation/stack' {
  import { ComponentType } from 'react';

  export interface StackNavigationOptions {
    headerShown?: boolean;
    [key: string]: any;
  }

  export interface StackNavigatorProps {
    screenOptions?: StackNavigationOptions | ((props: any) => StackNavigationOptions);
    initialRouteName?: string;
    children: React.ReactNode;
  }

  export interface StackScreenProps {
    name: string;
    component: ComponentType<any>;
    options?: StackNavigationOptions | ((props: any) => StackNavigationOptions);
  }

  export function createStackNavigator(): {
    Navigator: ComponentType<StackNavigatorProps>;
    Screen: ComponentType<StackScreenProps>;
  };
}

declare module '@react-navigation/bottom-tabs' {
  import { ComponentType } from 'react';

  export interface TabNavigationOptions {
    tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
    tabBarLabel?: string;
    tabBarActiveTintColor?: string;
    tabBarInactiveTintColor?: string;
    tabBarLabelStyle?: any;
    tabBarStyle?: any;
    headerShown?: boolean;
    [key: string]: any;
  }

  export interface TabNavigatorProps {
    screenOptions?: TabNavigationOptions | ((props: any) => TabNavigationOptions);
    initialRouteName?: string;
    children: React.ReactNode;
  }

  export interface TabScreenProps {
    name: string;
    component: ComponentType<any>;
    options?: TabNavigationOptions | ((props: any) => TabNavigationOptions);
  }

  export function createBottomTabNavigator(): {
    Navigator: ComponentType<TabNavigatorProps>;
    Screen: ComponentType<TabScreenProps>;
  };
} 