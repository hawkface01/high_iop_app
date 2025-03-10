// Theme colors for the High IOP Detection App
// Designed with accessibility in mind, particularly for elderly users

import { Platform, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0056B3',
  primaryLight: '#E5F1FF',

  // Secondary colors
  secondary: '#5856D6',
  secondaryDark: '#3634A3',
  secondaryLight: '#E5E5FF',

  // Status colors
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#5856D6',

  // Grayscale
  text: '#000000',
  textSecondary: '#6B7280',
  placeholder: '#A0A0A0',
  border: '#E5E5EA',
  surface: '#FFFFFF',
  background: '#F2F2F7',
  white: '#FFFFFF',
  black: '#000000',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: 'rgba(0, 0, 0, 0.4)',

  // Other UI colors
  divider: '#E0E0E0',    // Very light gray for dividers
  disabled: '#BDBDBD',   // Gray for disabled elements
  scanButton: '#2196F3', // Same as primary for consistency
  historyItem: '#F5F5F5', // White background for history items
};

// Spacing values for consistent layout
export const spacing = {
  // Base spacing units
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xl: 32,
  xxl: 40,

  // Specific spacing
  screenPadding: 16,
  cardPadding: 16,
  sectionSpacing: 32,
};

// Border radius values
export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
  round: 999, // For circular elements
};

// Shadows for elevation
export const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
  }),
};

// Default theme object
export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
};

export const layout = {
  // Screen dimensions
  maxWidth: 428, // Max width for iPhone 12 Pro Max
  maxContentWidth: 396, // MaxWidth - 2 * screenPadding

  // Component sizes
  buttonHeight: 48,
  inputHeight: 48,
  headerHeight: Platform.OS === 'ios' ? 88 : 64,
  tabBarHeight: Platform.OS === 'ios' ? 83 : 64,
  
  // Z-index
  zIndex: {
    base: 0,
    card: 1,
    header: 2,
    modal: 3,
    overlay: 4,
    toast: 5,
  },
};

interface CommonStyles {
  row: ViewStyle;
  center: ViewStyle;
  card: ViewStyle;
  input: TextStyle;
  button: ViewStyle;
}

// Common styles that can be reused across components
export const commonStyles: CommonStyles = {
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    padding: spacing.cardPadding,
    ...shadows.medium,
  },
  input: {
    height: layout.inputHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.medium,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    height: layout.buttonHeight,
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default theme; 