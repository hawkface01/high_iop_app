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
import Icon, { IconName } from './Icon';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  dot?: boolean;
}

const getBadgeColor = (variant: BadgeVariant) => {
  switch (variant) {
    case 'primary':
      return colors.primary;
    case 'secondary':
      return colors.secondary;
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

const getBadgeBackground = (variant: BadgeVariant) => {
  switch (variant) {
    case 'primary':
      return 'rgba(0, 122, 255, 0.1)';
    case 'secondary':
      return 'rgba(88, 86, 214, 0.1)';
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

const getBadgeSize = (size: BadgeSize): number => {
  switch (size) {
    case 'small':
      return 16;
    case 'medium':
      return 20;
    case 'large':
      return 24;
  }
};

const getBadgePadding = (size: BadgeSize): number => {
  switch (size) {
    case 'small':
      return spacing.tiny;
    case 'medium':
      return spacing.small;
    case 'large':
      return spacing.medium;
  }
};

const getTextStyle = (size: BadgeSize): TextStyle => {
  switch (size) {
    case 'small':
      return { fontSize: 12 };
    case 'large':
      return { fontSize: 16 };
    default:
      return { fontSize: 14 };
  }
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  icon,
  style,
  textStyle,
  dot = false,
}) => {
  const badgeColor = getBadgeColor(variant);
  const badgeBackground = getBadgeBackground(variant);
  const badgeSize = getBadgeSize(size);
  const badgePadding = getBadgePadding(size);
  const fontSize = getTextStyle(size);

  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          {
            width: badgeSize / 2,
            height: badgeSize / 2,
            backgroundColor: badgeColor,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: badgeBackground,
          paddingVertical: badgePadding / 2,
          paddingHorizontal: badgePadding,
        },
        style,
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={badgeSize}
          color={badgeColor}
          style={styles.icon}
        />
      )}
      {label && (
        <Text
          style={[
            styles.text,
            {
              color: badgeColor,
              ...fontSize,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
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
  dot: {
    borderRadius: borderRadius.round,
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  icon: {
    marginRight: spacing.tiny,
  },
});

export default Badge; 