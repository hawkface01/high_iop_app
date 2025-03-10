import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { colors, shadows, borderRadius, spacing } from '../../utils/theme';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  style,
  contentStyle,
  onPress,
  disabled,
  ...props
}) => {
  const cardStyles = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'filled' && styles.filled,
    style,
  ];

  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        {...props}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles}>
      {content}
    </View>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => (
  <View style={[styles.header, style]}>
    {children}
  </View>
);

interface CardContentProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => (
  <View style={[styles.mainContent, style]}>
    {children}
  </View>
);

interface CardFooterProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => (
  <View style={[styles.footer, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.large,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  elevated: {
    ...shadows.medium,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  filled: {
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mainContent: {
    padding: spacing.medium,
  },
  footer: {
    padding: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default Object.assign(Card, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
}); 