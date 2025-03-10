import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  TextStyle,
  StyleProp,
  ImageSourcePropType,
} from 'react-native';
import { colors, borderRadius } from '../../utils/theme';

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
export type AvatarVariant = 'circle' | 'rounded' | 'square';

interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  style?: StyleProp<ViewStyle>;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getBackgroundColor = (name: string): string => {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEEAD', // Yellow
    '#D4A5A5', // Pink
    '#9B59B6', // Purple
    '#3498DB', // Light Blue
    '#E67E22', // Orange
    '#1ABC9C', // Turquoise
  ];

  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  variant = 'circle',
  style,
}) => {
  const sizeStyle = styles[size];
  const variantStyle = styles[variant];
  
  const containerStyle = [
    styles.container,
    sizeStyle,
    variantStyle,
    style,
  ];

  const imageStyle: StyleProp<ImageStyle> = [
    sizeStyle,
    variantStyle,
    { backgroundColor: colors.placeholder },
  ];

  const textStyle: StyleProp<TextStyle> = [
    styles.text,
    styles[`${size}Text`],
  ];

  if (source) {
    return (
      <Image
        source={source}
        style={imageStyle}
        resizeMode="cover"
      />
    );
  }

  if (name) {
    return (
      <View style={[containerStyle, { backgroundColor: getBackgroundColor(name) }]}>
        <Text style={textStyle}>
          {getInitials(name)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[containerStyle, styles.placeholder]}>
      <Text style={textStyle}>?</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.placeholder,
    overflow: 'hidden',
  },
  // Sizes
  small: {
    width: 32,
    height: 32,
  },
  medium: {
    width: 40,
    height: 40,
  },
  large: {
    width: 48,
    height: 48,
  },
  xlarge: {
    width: 64,
    height: 64,
  },
  // Variants
  circle: {
    borderRadius: 999,
  },
  rounded: {
    borderRadius: borderRadius.medium,
  },
  square: {
    borderRadius: borderRadius.small,
  },
  // Text sizes
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediumText: {
    fontSize: 16,
    lineHeight: 24,
  },
  largeText: {
    fontSize: 20,
    lineHeight: 28,
  },
  xlargeText: {
    fontSize: 24,
    lineHeight: 32,
  },
  // Text base style
  text: {
    color: colors.white,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Placeholder style
  placeholder: {
    backgroundColor: colors.placeholder,
  },
});

export default Avatar; 