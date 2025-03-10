import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../utils/theme';

export type IconName = keyof typeof Ionicons.glyphMap;
export type IconSize = 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' | number;

interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const getIconSize = (size: IconSize): number => {
  switch (size) {
    case 'tiny':
      return 16;
    case 'small':
      return 20;
    case 'medium':
      return 24;
    case 'large':
      return 28;
    case 'xlarge':
      return 32;
    default:
      return typeof size === 'number' ? size : 24;
  }
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'medium',
  color = colors.text,
  style,
}) => {
  return (
    <Ionicons
      name={name}
      size={getIconSize(size)}
      color={color}
      style={style}
    />
  );
};

// Common icon names used in the app
export const AppIcons = {
  // Navigation icons
  home: 'home-outline',
  homeActive: 'home',
  history: 'time-outline',
  historyActive: 'time',
  scan: 'scan-outline',
  scanActive: 'scan',
  settings: 'settings-outline',
  settingsActive: 'settings',

  // Action icons
  back: 'chevron-back',
  forward: 'chevron-forward',
  close: 'close',
  add: 'add',
  edit: 'pencil',
  delete: 'trash-outline',
  camera: 'camera-outline',
  image: 'image-outline',
  upload: 'cloud-upload-outline',
  download: 'cloud-download-outline',
  share: 'share-outline',
  menu: 'menu-outline',
  more: 'ellipsis-horizontal',

  // Status icons
  success: 'checkmark-circle-outline',
  warning: 'warning-outline',
  error: 'alert-circle-outline',
  info: 'information-circle-outline',

  // Profile icons
  person: 'person-outline',
  personActive: 'person',
  email: 'mail-outline',
  phone: 'call-outline',
  calendar: 'calendar-outline',
  location: 'location-outline',

  // Common icons
  search: 'search-outline',
  notification: 'notifications-outline',
  notificationActive: 'notifications',
  favorite: 'heart-outline',
  favoriteActive: 'heart',
  refresh: 'refresh-outline',
  filter: 'filter-outline',
  sort: 'funnel-outline',
} as const;

export type AppIconName = keyof typeof AppIcons;

export default Icon; 