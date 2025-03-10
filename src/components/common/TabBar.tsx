import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
  Animated,
} from 'react-native';
import { colors, spacing, layout, shadows } from '../../utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabItem {
  key: string;
  title: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

interface TabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
  navigation: any;
  descriptors: any;
  tabs: TabItem[];
  style?: StyleProp<ViewStyle>;
}

export const TabBar: React.FC<TabBarProps> = ({
  state,
  navigation,
  descriptors,
  tabs,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      { paddingBottom: insets.bottom },
      style,
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const tab = tabs.find(t => t.key === route.name);
        
        if (!tab) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            <View style={styles.tabContent}>
              {isFocused ? tab.activeIcon : tab.icon}
              <Text style={[
                styles.label,
                isFocused ? styles.labelFocused : styles.labelUnfocused,
              ]}>
                {tab.title}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: layout.tabBarHeight,
    ...Platform.select({
      ios: {
        ...shadows.small,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  labelFocused: {
    color: colors.primary,
  },
  labelUnfocused: {
    color: colors.textSecondary,
  },
});

export default TabBar; 