import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
  Text,
} from 'react-native';
import { colors, spacing } from '../../utils/theme';

export type LoadingSize = 'small' | 'medium' | 'large';

type LoadingVariant = 'default' | 'overlay' | 'inline';

interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  message?: string;
  style?: StyleProp<ViewStyle>;
}

const getIndicatorSize = (size: LoadingSize): number => {
  switch (size) {
    case 'small':
      return 24;
    case 'large':
      return 48;
    default:
      return 36;
  }
};

const getContainerStyle = (variant: LoadingVariant): StyleProp<ViewStyle> => {
  switch (variant) {
    case 'overlay':
      return styles.overlayContainer;
    case 'inline':
      return styles.inlineContainer;
    default:
      return styles.defaultContainer;
  }
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  variant = 'default',
  message,
  style,
}) => {
  const containerStyle = [
    styles.container,
    getContainerStyle(variant),
    style,
  ];

  return (
    <View style={containerStyle}>
      <ActivityIndicator
        size={getIndicatorSize(size)}
        color={variant === 'overlay' ? colors.white : colors.primary}
      />
      {message && (
        <Text style={[
          styles.message,
          variant === 'overlay' && styles.overlayMessage,
        ]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.modalBackground,
    zIndex: 999,
  },
  inlineContainer: {
    flexDirection: 'row',
    padding: spacing.medium,
  },
  message: {
    marginTop: spacing.small,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  overlayMessage: {
    color: colors.white,
  },
});

export default Loading; 