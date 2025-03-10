import React, { ComponentType } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewProps,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../utils/theme';
import Icon, { IconName } from './Icon';

export type ChipVariant = 'filled' | 'outlined' | 'ghost';
export type ChipSize = 'small' | 'medium' | 'large';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onClose?: () => void;
  leftIcon?: IconName;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const getChipHeight = (size: ChipSize): number => {
  switch (size) {
    case 'small':
      return 24;
    case 'medium':
      return 32;
    case 'large':
      return 40;
  }
};

const getChipPadding = (size: ChipSize): number => {
  switch (size) {
    case 'small':
      return spacing.small;
    case 'medium':
      return spacing.medium;
    case 'large':
      return spacing.large;
  }
};

const getTextStyle = (size: ChipSize): TextStyle => {
  switch (size) {
    case 'small':
      return { fontSize: 12 };
    case 'large':
      return { fontSize: 16 };
    default:
      return { fontSize: 14 };
  }
};

const getIconSize = (size: ChipSize): 'small' | 'medium' | 'large' => {
  switch (size) {
    case 'small':
      return 'small';
    case 'medium':
      return 'medium';
    case 'large':
      return 'large';
  }
};

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'filled',
  size = 'medium',
  selected = false,
  disabled = false,
  onPress,
  onClose,
  leftIcon,
  style,
  labelStyle,
}) => {
  const height = getChipHeight(size);
  const padding = getChipPadding(size);
  const textStyle = getTextStyle(size);
  const iconSize = getIconSize(size);

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    if (selected) {
      switch (variant) {
        case 'filled':
          return colors.primary;
        case 'outlined':
        case 'ghost':
          return colors.primaryLight;
      }
    }
    switch (variant) {
      case 'filled':
        return colors.background;
      case 'outlined':
      case 'ghost':
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.placeholder;
    if (selected) {
      switch (variant) {
        case 'filled':
          return colors.white;
        case 'outlined':
        case 'ghost':
          return colors.primary;
      }
    }
    return colors.text;
  };

  const getBorderColor = () => {
    if (disabled) return colors.border;
    if (selected) return colors.primary;
    return colors.border;
  };

  const renderContent = () => (
    <>
      {leftIcon && (
        <Icon
          name={leftIcon}
          size={iconSize}
          color={getTextColor()}
          style={styles.leftIcon}
        />
      )}

      <Text
        style={[
          styles.label,
          {
            color: getTextColor(),
          },
          labelStyle,
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {onClose && (
        <TouchableOpacity
          onPress={disabled ? undefined : onClose}
          disabled={disabled}
          style={styles.closeButton}
        >
          <Icon
            name="close-circle"
            size={iconSize}
            color={getTextColor()}
          />
        </TouchableOpacity>
      )}
    </>
  );

  const containerStyle = [
    styles.container,
    {
      height,
      paddingHorizontal: padding,
      backgroundColor: getBackgroundColor(),
      borderColor: variant === 'outlined' ? getBorderColor() : undefined,
      borderWidth: variant === 'outlined' ? 1 : 0,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: borderRadius.round,
  },
  label: {
    fontWeight: '500',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: spacing.tiny,
  },
  closeButton: {
    marginLeft: spacing.tiny,
  },
});

export default Chip; 