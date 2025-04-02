import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  Image,
  TouchableOpacity,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing } from "../../utils/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

// This is a placeholder screen for initiating a scan.
// It should contain the UI described in CONTEXT.md for the "Eye Scan Screen"
// (e.g., alignment guide, upload button, camera button).

const ScanInitiationScreen = () => {
  const navigation = useNavigation<any>(); // Define proper navigation types later
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const navigateToProcessing = (imageUri: string) => {
    console.log("Navigating with image URI:", imageUri);
    // Navigate to a processing or result screen (replace 'Result' as needed)
    navigation.navigate("Result", {
      imageUrl: imageUri,
      result: "PENDING", // Placeholder values
      pressure: 0,
      date: new Date().toISOString(),
    });
  };

  const handleUpload = async () => {
    // Request permission if not granted
    if (!mediaLibraryPermission?.granted) {
      const { status } = await requestMediaLibraryPermission();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Media library access is needed to upload photos."
        );
        return;
      }
    }

    // Launch image library
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        navigateToProcessing(result.assets[0].uri);
      }
    } catch (error) {
      console.error("ImagePicker Error:", error);
      Alert.alert("Error", "Could not open image library.");
    }
  };

  const handleCameraPress = async () => {
    // Request permission if not granted
    if (!cameraPermission?.granted) {
      const { status } = await requestCameraPermission();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera access is needed to take photos."
        );
        return;
      }
    }
    // Show camera view
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

        if (photo?.uri) {
          setShowCamera(false);
          navigateToProcessing(photo.uri);
        } else {
          Alert.alert("Error", "Could not capture image. Please try again.");
          setShowCamera(false);
        }
      } catch (error) {
        console.error("Camera Error:", error);
        Alert.alert("Error", "Could not take picture.");
        setShowCamera(false);
      }
    }
  };

  // Render Camera View if showCamera is true
  if (showCamera) {
    console.log("Rendering CameraView. Permission granted:", cameraPermission?.granted);
    return (
      <View style={styles.fullScreenCameraContainer}>
        <CameraView
          style={styles.cameraPreview}
          facing="back"
          ref={cameraRef}
          // autofocus={'off'} // Temporarily removed
          // flash={'off'} // Temporarily removed
          onCameraReady={() => console.log("Camera hardware is ready")}
        />
        {/* Camera UI Overlay */}
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraFramePlaceholder} />
        </View>
        {/* Camera Controls */}
        <View style={styles.cameraControls}>
          <TouchableOpacity
            onPress={() => setShowCamera(false)}
            style={styles.cameraButton}
          >
            <Ionicons name="close" size={40} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={takePicture} style={styles.cameraButton}>
            <Ionicons name="ellipse-outline" size={80} color="white" />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>
      </View>
    );
  }

  // Render Initial Screen View
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Eye Scan
        </Text>
        <Text variant="bodyLarge" style={styles.instruction}>
          Center your fundus image in the frame or upload one.
        </Text>

        {/* Alignment frame placeholder */}
        <View style={styles.framePlaceholder} />

        <Button
          mode="contained"
          icon="camera"
          onPress={handleCameraPress}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Use Camera
        </Button>
        <Button
          mode="outlined"
          icon="upload"
          onPress={handleUpload}
          style={[styles.button, styles.uploadButton]}
          labelStyle={styles.buttonLabel}
        >
          Upload Photo
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.large,
  },
  title: {
    marginBottom: spacing.medium,
    color: colors.text,
  },
  instruction: {
    marginBottom: spacing.large,
    textAlign: "center",
    color: colors.textSecondary,
  },
  framePlaceholder: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    marginBottom: spacing.large,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "80%",
    marginVertical: spacing.small,
    paddingVertical: spacing.small,
  },
  uploadButton: {
    borderColor: colors.primary,
  },
  buttonLabel: {
    fontSize: 16,
  },
  fullScreenCameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  cameraPreview: {
    ...StyleSheet.absoluteFillObject, // Force fill container
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraFramePlaceholder: {
    width: "80%",
    aspectRatio: 1,
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.7)",
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  cameraControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  cameraButton: {
    // Style for touch targets if needed, e.g., padding
  },
});

export default ScanInitiationScreen;
