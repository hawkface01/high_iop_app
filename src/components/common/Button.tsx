import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  titleStyle,
}) => {
  const getButtonStyle = (): StyleProp<ViewStyle> => {
    const baseStyle = [styles.button, style];
    
    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.secondaryButton];
      case 'outline':
        return [...baseStyle, styles.outlineButton];
      default:
        return [...baseStyle, styles.primaryButton];
    }
  };

  const getTitleStyle = (): StyleProp<TextStyle> => {
    const baseStyle = [styles.title, titleStyle];
    
    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.secondaryTitle];
      case 'outline':
        return [...baseStyle, styles.outlineTitle];
      default:
        return [...baseStyle, styles.primaryTitle];
    }
  };

  const getButtonHeight = (): number => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 56;
      default:
        return 48;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        { height: getButtonHeight() },
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} />
      ) : (
        <>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={getTitleStyle()}>{title}</Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.medium,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
  },
  primaryTitle: {
    color: colors.white,
  },
  secondaryTitle: {
    color: colors.white,
  },
  outlineTitle: {
    color: colors.primary,
  },
  leftIcon: {
    marginRight: spacing.small,
  },
  rightIcon: {
    marginLeft: spacing.small,
  },
});

export default Button; 