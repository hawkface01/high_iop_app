import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal as RNModal,
  Animated,
  TouchableWithoutFeedback,
  ViewStyle,
  StyleProp,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, layout } from '../../utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ModalPosition = 'center' | 'bottom';
export type ModalAnimation = 'slide' | 'fade' | 'none';

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  position?: ModalPosition;
  animation?: ModalAnimation;
  dismissable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  avoidKeyboard?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Modal: React.FC<ModalProps> = ({
  visible,
  onDismiss,
  children,
  position = 'center',
  animation = 'slide',
  dismissable = true,
  style,
  contentContainerStyle,
  avoidKeyboard = true,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      show();
    } else {
      hide();
    }
  }, [visible]);

  const show = () => {
    if (animation === 'slide') {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    } else if (animation === 'fade') {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 0,
        }),
      ]).start();
    }
  };

  const hide = () => {
    if (animation === 'slide') {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        onDismiss();
      });
    } else if (animation === 'fade') {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss();
      });
    }
  };

  const getAnimatedStyle = () => {
    if (animation === 'slide') {
      return {
        transform: [{ translateY }],
      };
    } else if (animation === 'fade') {
      return {
        opacity,
        transform: [{ scale }],
      };
    }
    return {};
  };

  const containerStyle = [
    styles.container,
    position === 'bottom' && styles.containerBottom,
    style,
  ];

  const modalStyle = [
    styles.modal,
    position === 'bottom' && styles.modalBottom,
    position === 'bottom' && {
      paddingBottom: insets.bottom,
    },
    contentContainerStyle,
  ];

  const renderContent = () => (
    <Animated.View style={[modalStyle, getAnimatedStyle()]}>
      {children}
    </Animated.View>
  );

  return (
    <RNModal
      visible={visible}
      transparent
      statusBarTranslucent
      onRequestClose={dismissable ? onDismiss : undefined}
    >
      <TouchableWithoutFeedback onPress={dismissable ? onDismiss : undefined}>
        <View style={containerStyle}>
          <TouchableWithoutFeedback>
            {avoidKeyboard ? (
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
              >
                {renderContent()}
              </KeyboardAvoidingView>
            ) : (
              renderContent()
            )}
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerBottom: {
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
    ...Platform.select({
      ios: {
        ...shadows.large,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  modalBottom: {
    width: '100%',
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
});

export default Modal; 