import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../utils/theme';
import Icon, { IconName } from './Icon';
import Divider from './Divider';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
}

interface ListProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showDividers?: boolean;
  showShadow?: boolean;
  rounded?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  disabled = false,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  const renderContent = () => (
    <>
      {leftIcon && (
        <View style={styles.leftIcon}>
          <Icon
            name={leftIcon}
            size="medium"
            color={disabled ? colors.placeholder : colors.text}
          />
        </View>
      )}

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            disabled && styles.textDisabled,
            titleStyle,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              disabled && styles.textDisabled,
              subtitleStyle,
            ]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {rightIcon && (
        <View style={styles.rightIcon}>
          <Icon
            name={rightIcon}
            size="medium"
            color={disabled ? colors.placeholder : colors.textSecondary}
          />
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[
          styles.item,
          disabled && styles.itemDisabled,
          style,
        ]}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.item,
        disabled && styles.itemDisabled,
        style,
      ]}
    >
      {renderContent()}
    </View>
  );
};

export const List: React.FC<ListProps> = ({
  children,
  style,
  contentContainerStyle,
  showDividers = true,
  showShadow = false,
  rounded = true,
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <View
      style={[
        styles.container,
        rounded && styles.rounded,
        showShadow && styles.shadow,
        style,
      ]}
    >
      <View style={[styles.contentContainer, contentContainerStyle]}>
        {childrenArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {showDividers && index < childrenArray.length - 1 && (
              <Divider spacing={0} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
  },
  rounded: {
    borderRadius: borderRadius.large,
    overflow: 'hidden',
  },
  shadow: {
    ...shadows.medium,
  },
  contentContainer: {
    width: '100%',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
    backgroundColor: colors.surface,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  leftIcon: {
    marginRight: spacing.medium,
  },
  rightIcon: {
    marginLeft: spacing.medium,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: 2,
  },
  textDisabled: {
    color: colors.placeholder,
  },
});

export default Object.assign(List, {
  Item: ListItem,
}); 