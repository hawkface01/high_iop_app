import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { colors, spacing, shadows, layout } from '../../utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

interface ToastProps {
  visible: boolean;
  type?: ToastType;
  message: string;
  position?: ToastPosition;
  duration?: number;
  onDismiss?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: StyleProp<ViewStyle>;
  messageStyle?: StyleProp<TextStyle>;
}

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'checkmark-circle-outline';
    case 'error':
      return 'alert-circle-outline';
    case 'warning':
      return 'warning-outline';
    case 'info':
      return 'information-circle-outline';
  }
};

const getToastColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return colors.success;
    case 'error':
      return colors.error;
    case 'warning':
      return colors.warning;
    case 'info':
      return colors.info;
  }
};

export const Toast: React.FC<ToastProps> = ({
  visible,
  type = 'info',
  message,
  position = 'bottom',
  duration = 3000,
  onDismiss,
  action,
  style,
  messageStyle,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      show();
    } else {
      hide();
    }
  }, [visible]);

  const show = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    if (duration > 0) {
      setTimeout(hide, duration);
    }
  };

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const toastStyle = [
    styles.container,
    position === 'top' ? { top: insets.top + spacing.medium } : { bottom: insets.bottom + spacing.medium },
    style,
  ];

  return (
    <Animated.View
      style={[
        toastStyle,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.content, { borderLeftColor: getToastColor(type) }]}>
        <Icon
          name={getToastIcon(type)}
          size="medium"
          color={getToastColor(type)}
          style={styles.icon}
        />
        <Text style={[styles.message, messageStyle]} numberOfLines={2}>
          {message}
        </Text>
        {action && (
          <TouchableOpacity
            onPress={() => {
              action.onPress();
              hide();
            }}
            style={styles.action}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.medium,
    right: spacing.medium,
    zIndex: layout.zIndex.toast,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.medium,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        ...shadows.medium,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  icon: {
    marginRight: spacing.small,
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    flex: 1,
  },
  action: {
    marginLeft: spacing.medium,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: spacing.medium,
  },
});

export default Toast; 