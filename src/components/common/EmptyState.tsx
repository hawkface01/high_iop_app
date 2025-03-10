import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { colors, spacing } from '../../utils/theme';
import Button from './Button';
import Icon, { AppIconName, AppIcons } from './Icon';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: AppIconName;
  illustration?: ImageSourcePropType;
  action?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  illustration,
  action,
  secondaryAction,
  style,
  titleStyle,
  descriptionStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {illustration ? (
        <Image
          source={illustration}
          style={styles.illustration}
          resizeMode="contain"
        />
      ) : icon ? (
        <View style={styles.iconContainer}>
          <Icon
            name={AppIcons[icon]}
            size="xlarge"
            color={colors.textSecondary}
          />
        </View>
      ) : null}

      <Text style={[styles.title, titleStyle]}>
        {title}
      </Text>

      {description && (
        <Text style={[styles.description, descriptionStyle]}>
          {description}
        </Text>
      )}

      {action && (
        <View style={styles.actionsContainer}>
          <Button
            title={action.label}
            onPress={action.onPress}
            variant="primary"
          />
          {secondaryAction && (
            <Button
              title={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant="outline"
              style={styles.secondaryAction}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.large,
  },
  illustration: {
    width: 200,
    height: 200,
    marginBottom: spacing.large,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.large,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.medium,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.small,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 300,
  },
  secondaryAction: {
    marginTop: spacing.medium,
  },
});

export default EmptyState; 