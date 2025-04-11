import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { useNavigation, useIsFocused, RouteProp } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "../../utils/theme";
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ScanStackNavigationProp } from '../../navigation/types';

const ScanInitiationScreen = () => {
  const navigation = useNavigation<ScanStackNavigationProp>();
  const isFocused = useIsFocused();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    if (!isFocused && showCamera) {
        console.log("ScanInitiationScreen lost focus, turning off camera.");
        setShowCamera(false);
    }
  }, [isFocused, showCamera]);

  const navigateToDetection = (imageUri: string) => {
    console.log("Navigating to Detection screen with URI:", imageUri);
    navigation.navigate('Detection', { imageUri: imageUri });
  };

  const handleUpload = async () => {
    let permission = mediaLibraryPermission;
    if (!permission?.granted) {
      permission = await requestMediaLibraryPermission();
    }
    if (!permission?.granted) {
      Alert.alert("Permission Required", "Media library access is needed to upload photos.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        navigateToDetection(result.assets[0].uri);
      }
    } catch (error) {
      console.error("ImagePicker Error:", error);
      Alert.alert("Error", "Could not open image library. Please try again.");
    }
  };

  const handleCameraPress = async () => {
    let permission = cameraPermission;
    if (!permission?.granted) {
      permission = await requestCameraPermission();
    }
    if (!permission?.granted) {
      Alert.alert("Permission Required", "Camera access is needed to take photos.");
      return;
    }
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      if (photo?.uri) {
        setShowCamera(false);
        navigateToDetection(photo.uri);
      } else {
        Alert.alert("Capture Failed", "Could not capture image. Please try again.");
        setShowCamera(false);
      }
    } catch (error) {
      console.error("Camera Error:", error);
      Alert.alert("Camera Error", "Could not take picture. Please try again.");
      setShowCamera(false);
    }
  };

  const renderCameraView = () => {
    if (!cameraPermission?.granted) {
      return (
        <View style={styles.centered}>
          <Text>Camera permission is required.</Text>
          <Button onPress={requestCameraPermission}>Grant Permission</Button>
          <Button onPress={() => setShowCamera(false)}>Back</Button>
        </View>
      );
    }

    return (
      <View style={styles.fullScreen}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          ref={cameraRef}
          onCameraReady={() => console.log("Camera hardware is ready")}
        />

        <View style={[StyleSheet.absoluteFill, styles.overlayContainer]}>
          <View style={styles.focusFrame} />
        </View>

        <View style={[styles.controlsContainer, { bottom: tabBarHeight }]}>
          <TouchableOpacity
            onPress={() => setShowCamera(false)}
            style={styles.controlButton}
          >
            <Ionicons name="close" size={35} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <View style={styles.controlButton} />
        </View>
      </View>
    );
  };

  const renderInitialView = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="scan-circle-outline" size={80} color={colors.primary} style={styles.icon} />
        <Text style={styles.title}>Scan Fundus Image</Text>
        <Text style={styles.description}>
          Use your phone's camera or upload an existing image of the fundus (back of the eye)
          to analyze it for potential signs related to high intraocular pressure.
        </Text>

        <Button
          mode="contained"
          icon="camera"
          onPress={handleCameraPress}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          disabled={showCamera}
        >
          Use Camera
        </Button>

        <Button
          mode="outlined"
          icon="cloud-upload-outline"
          onPress={handleUpload}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          disabled={showCamera}
        >
          Upload Image
        </Button>
      </View>
    </SafeAreaView>
  );

  return showCamera ? renderCameraView() : renderInitialView();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingBottom: spacing.large,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.large,
  },
  icon: {
    marginBottom: spacing.medium,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.small,
  },
  description: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.small,
  },
  button: {
    width: '90%',
    marginVertical: spacing.small,
    borderRadius: 30,
  },
  buttonLabel: {
    ...typography.labelLarge,
    paddingVertical: 5,
  },
  buttonContent: {
    height: 50,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlayContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  focusFrame: {
    width: '85%',
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  controlsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  controlButton: {
    padding: 10,
    width: 60,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
  },
});

export default ScanInitiationScreen;
