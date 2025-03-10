import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../utils/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  statusBarColor?: string;
  unsafe?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  contentContainerStyle,
  scrollable = false,
  refreshing = false,
  onRefresh,
  keyboardShouldPersistTaps = 'handled',
  header,
  footer,
  backgroundColor = colors.background,
  statusBarStyle = 'dark-content',
  statusBarColor = colors.background,
  unsafe = false,
}) => {
  const Container = unsafe ? View : SafeAreaView;
  const contentStyle = [
    styles.content,
    { backgroundColor },
    contentContainerStyle,
  ];

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={contentStyle}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      );
    }

    return <View style={contentStyle}>{children}</View>;
  };

  return (
    <Container style={[styles.container, { backgroundColor }, style]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor}
        translucent
      />
      {header}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {renderContent()}
      </KeyboardAvoidingView>
      {footer}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.medium,
  },
});

export default Screen; 