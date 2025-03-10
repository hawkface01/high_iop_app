declare module '@react-navigation/native' {
  export function useNavigation(): any;
  export function useRoute(): any;
  export type NavigationProp<T> = any;
  export type ParamListBase = any;
  export type RouteProp<T, K extends keyof T> = any;
}

declare module '@react-navigation/stack' {
  export function createStackNavigator(): any;
}

declare module '@react-navigation/bottom-tabs' {
  export function createBottomTabNavigator(): any;
} 