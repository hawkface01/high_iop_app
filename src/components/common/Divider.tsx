import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, spacing } from '../../utils/theme';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerStyle = 'solid' | 'dashed' | 'dotted';

interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerStyle;
  color?: string;
  thickness?: number;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  color = colors.border,
  thickness = 1,
  spacing: spacingProp = 0,
  style,
}) => {
  const getDividerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: variant === 'solid' ? color : 'transparent',
    };

    if (orientation === 'horizontal') {
      baseStyle.width = '100%';
      baseStyle.height = thickness;
      baseStyle.marginVertical = spacingProp;
    } else {
      baseStyle.height = '100%';
      baseStyle.width = thickness;
      baseStyle.marginHorizontal = spacingProp;
    }

    if (variant === 'dashed') {
      baseStyle.borderStyle = 'dashed';
      baseStyle.borderWidth = thickness;
      baseStyle.borderColor = color;
    } else if (variant === 'dotted') {
      baseStyle.borderStyle = 'dotted';
      baseStyle.borderWidth = thickness;
      baseStyle.borderColor = color;
    }

    return baseStyle;
  };

  return (
    <View
      style={[
        styles.container,
        getDividerStyle(),
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
});

export default Divider; 