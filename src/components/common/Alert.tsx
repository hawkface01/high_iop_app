import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../utils/theme';
import Button from './Button';
import Icon from './Icon';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface AlertProps {
  type?: AlertType;
  title?: string;
  message: string;
  actions?: AlertAction[];
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  messageStyle?: StyleProp<TextStyle>;
  showIcon?: boolean;
}

const getAlertIcon = (type: AlertType) => {
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

const getAlertColor = (type: AlertType) => {
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

const getAlertBackground = (type: AlertType) => {
  switch (type) {
    case 'success':
      return 'rgba(52, 199, 89, 0.1)';
    case 'error':
      return 'rgba(255, 59, 48, 0.1)';
    case 'warning':
      return 'rgba(255, 149, 0, 0.1)';
    case 'info':
      return 'rgba(88, 86, 214, 0.1)';
  }
};

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  actions,
  style,
  titleStyle,
  messageStyle,
  showIcon = true,
}) => {
  return (
    <View style={[
      styles.container,
      { backgroundColor: getAlertBackground(type) },
      style,
    ]}>
      <View style={styles.content}>
        {showIcon && (
          <Icon
            name={getAlertIcon(type)}
            size="large"
            color={getAlertColor(type)}
            style={styles.icon}
          />
        )}
        <View style={styles.textContainer}>
          {title && (
            <Text style={[styles.title, { color: getAlertColor(type) }, titleStyle]}>
              {title}
            </Text>
          )}
          <Text style={[styles.message, messageStyle]}>
            {message}
          </Text>
        </View>
      </View>

      {actions && actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((action, index) => (
            <Button
              key={index}
              title={action.label}
              onPress={action.onPress}
              variant={action.variant || 'primary'}
              style={[
                styles.action,
                index < actions.length - 1 && styles.actionSpacing,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: spacing.medium,
  },
  icon: {
    marginRight: spacing.medium,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: spacing.tiny,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.medium,
    paddingTop: 0,
  },
  action: {
    flex: 1,
  },
  actionSpacing: {
    marginRight: spacing.small,
  },
});

export default Alert; 