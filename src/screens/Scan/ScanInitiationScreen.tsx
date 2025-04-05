import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal as RNModal,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../utils/theme"; // Assuming theme file path
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'; // Import the hook
import {
  loadModel,
  preprocessImage,
  runInference,
  postprocessResult,
  IOPResult,
  testModelUrl,  // Import the new test function
  clearModelCache,  // Import the new clearModelCache function
} from "../../services/ml/mlService"; // Import ML service functions

// Define proper navigation types if available, e.g., using StackNavigationProp
// type ScanInitiationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ScanInitiation'>;

const ScanInitiationScreen = () => {
  // Use the specific navigation type if defined
  // const navigation = useNavigation<ScanInitiationScreenNavigationProp>();
  const navigation = useNavigation<any>(); // Using any for now
  const isFocused = useIsFocused(); // Check if the screen is focused

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // State for loading indicator
  const cameraRef = useRef<CameraView>(null);
  const tabBarHeight = useBottomTabBarHeight(); // Get tab bar height

  // Effect to turn off camera when screen loses focus
  useEffect(() => {
    if (!isFocused) {
      if (showCamera) {
        console.log("Screen lost focus, turning off camera.");
        setShowCamera(false);
      }
      if (isProcessing) {
        console.log("Screen lost focus during processing, resetting state.");
        setIsProcessing(false);
      }
    }
  }, [isFocused, showCamera, isProcessing]);

  // Function to navigate after getting an image URI
  const handleImageCaptured = async (imageUri: string) => {
    console.log("Processing image URI:", imageUri);
    setShowCamera(false);
    setIsProcessing(true);

    let finalResult: IOPResult | null = null;

    try {
      // First test if the model URL is accessible
      const isModelUrlAccessible = await testModelUrl();
      if (!isModelUrlAccessible) {
        throw new Error("Model URL is not accessible. Please check your connection and Supabase settings.");
      }

      // Clear any potentially corrupted cache first
      console.log("Clearing any existing model cache...");
      await clearModelCache();

      console.log("Loading model with force reload...");
      const model = await loadModel(true); // Force a fresh download
      if (!model) throw new Error("Failed to load the ML model.");

      console.log("Preprocessing image...");
      const tensor = await preprocessImage(imageUri);
      if (!tensor) throw new Error("Failed to preprocess the image.");

      console.log("Running inference...");
      const prediction = await runInference(model, tensor);
      if (!prediction) throw new Error("Failed to run inference.");

      console.log("Postprocessing result...");
      finalResult = await postprocessResult(prediction);
      if (finalResult.classification === 'Error') {
        throw new Error("Failed to process the model output.");
      }

      console.log("ML Processing successful:", finalResult);

      // Navigate to Results Screen (Ensure 'Results' matches your stack navigator's screen name)
      navigation.navigate("Results", { 
        scanResult: finalResult,
        imageUri: imageUri,
      });

    } catch (error: any) {
      console.error("ML Processing Error:", error);
      Alert.alert(
        "Processing Failed",
        `An error occurred during analysis: ${error.message || "Unknown error"}. Please try again.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle image upload from library
  const handleUpload = async () => {
    let permission = mediaLibraryPermission;
    if (!permission?.granted) {
      permission = await requestMediaLibraryPermission();
    }

    if (!permission?.granted) {
      Alert.alert(
        "Permission Required",
        "Media library access is needed to upload photos."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for fundus images
        quality: 0.8, // Slightly reduced quality for faster processing
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleImageCaptured(result.assets[0].uri); // Use the updated handler
      }
    } catch (error) {
      console.error("ImagePicker Error:", error);
      Alert.alert("Error", "Could not open image library. Please try again.");
    }
  };

  // Function to handle pressing the 'Use Camera' button
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

  // Function to take a picture using the camera
  const takePicture = async () => {
    if (!cameraRef.current) {
      console.warn("Camera ref not available.");
      return;
    }
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        // Consider adding base64: false if not needed, potentially faster
      });

      if (photo?.uri) {
        handleImageCaptured(photo.uri); // Use the updated handler
      } else {
        Alert.alert("Capture Failed", "Could not capture image. Please try again.");
        setShowCamera(false); // Hide camera on failure
      }
    } catch (error) {
      console.error("Camera Error:", error);
      Alert.alert("Camera Error", "Could not take picture. Please try again.");
      setShowCamera(false); // Hide camera on error
    }
  };

  // Render Camera View
  const renderCameraView = () => {
    if (!cameraPermission?.granted) {
      // This should ideally not be reached due to checks in handleCameraPress,
      // but serves as a fallback.
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
          style={StyleSheet.absoluteFill} // Use absoluteFill for simplicity
          facing="back"
          ref={cameraRef}
          onCameraReady={() => console.log("Camera hardware is ready")}
        />

        {/* Overlay with alignment guide */}
        <View style={[StyleSheet.absoluteFill, styles.overlayContainer]}>
          <View style={styles.focusFrame} />
        </View>

        {/* Controls at the bottom */}
        <View style={[styles.controlsContainer, { bottom: tabBarHeight }]}>
          {/* Close Button */}
          <TouchableOpacity
            onPress={() => setShowCamera(false)}
            style={styles.controlButton}
          >
            <Ionicons name="close" size={35} color="white" />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          {/* Spacer to balance layout */}
          <View style={styles.controlButton} />
        </View>
      </View>
    );
  };

  // Render Initial Screen View
  const renderInitialView = () => (
    <SafeAreaView style={styles.container}>
      {/* Loading Modal using standard RN Modal */}
      <RNModal
        transparent={true}
        animationType="fade"
        visible={isProcessing}
        onRequestClose={() => { /* Prevent closing via back button */ }}
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating={true} size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Analyzing image...</Text>
            <Text style={styles.loadingSubText}>This may take a moment.</Text>
          </View>
        </View>
      </RNModal>

      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Start Eye Scan
        </Text>
        <Text variant="bodyLarge" style={styles.instruction}>
          Position your eye within the guide or upload a fundus image.
        </Text>

        {/* Placeholder for alignment guide preview */}
        <View style={styles.guidePlaceholder}>
           <Ionicons name="eye-outline" size={80} color={colors.primaryLight} />
        </View>

        <Button
          mode="contained"
          icon="camera"
          onPress={handleCameraPress}
          style={styles.actionButton}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent} // Ensure icon and label are spaced
          disabled={isProcessing} // Disable while processing
        >
          Use Camera
        </Button>
        <Button
          mode="outlined"
          icon="upload"
          onPress={handleUpload}
          style={[styles.actionButton, styles.uploadButton]}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          disabled={isProcessing} // Disable while processing
        >
          Upload Photo
        </Button>
      </View>
    </SafeAreaView>
  );

  // Main render logic
  return showCamera ? renderCameraView() : renderInitialView();
};

const styles = StyleSheet.create({
  // General & Initial View Styles
  container: {
    flex: 1,
    backgroundColor: colors.background ?? '#f5f5f5', // Fallback color
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.large ?? 20,
  },
  centered: { // For permission messages or errors
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.large,
  },
  title: {
    marginBottom: spacing.medium ?? 15,
    color: colors.text ?? '#000000',
    textAlign: 'center',
  },
  instruction: {
    marginBottom: spacing.large ?? 20,
    textAlign: "center",
    color: colors.textSecondary ?? '#555555',
    fontSize: 16, // Ensure readability
  },
  guidePlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90, // Make it circular
    borderWidth: 2,
    borderColor: colors.primaryLight ?? colors.primary ?? '#cccccc',
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: (spacing.large ?? 20) * 2,
    backgroundColor: colors.surface ?? '#eeeeee', // Using surface as fallback for surfaceVariant
  },
  actionButton: {
    marginTop: spacing.medium ?? 15,
    width: "80%", // Ensure buttons have good width
    paddingVertical: spacing.small ?? 10, // Add padding for better touch area
  },
  uploadButton: {
    borderColor: colors.primary ?? '#6200ee', // Match primary color for outlined
  },
  buttonLabel: {
    fontSize: 16, // Larger text for accessibility
    fontWeight: "bold",
  },
  buttonContent: {
    height: 50, // Ensure consistent button height
    justifyContent: 'center',
  },

  // Camera View Styles
  fullScreen: {
    flex: 1,
    backgroundColor: "black", // Background for camera view
  },
  overlayContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent", // Make overlay transparent
  },
  focusFrame: {
    width: 300, // Match the expected input size of the model
    height: 300,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.7)", // White, semi-transparent
    borderStyle: "dashed",
    borderRadius: 10, // Slightly rounded corners
    backgroundColor: "rgba(0, 0, 0, 0.2)", // Dim the area outside the frame slightly
  },
  controlsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    // bottom: 0, // Removed - now dynamically set using tabBarHeight
    height: 100, // Fixed height for control area
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    paddingBottom: spacing.medium ?? 15, // Add some padding at the very bottom
  },
  controlButton: {
    padding: spacing.medium ?? 15,
    width: 70, // Give buttons some width for easier pressing
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Slightly visible background
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "white",
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "white",
  },

  // Loading Modal Styles (Added Here)
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: colors.background ?? 'white',
    padding: (spacing.large ?? 20) * 1.5,
    borderRadius: 10,
    alignItems: 'center',
    width: '70%',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingText: {
    marginTop: spacing.medium ?? 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text ?? '#000000',
    textAlign: 'center',
  },
  loadingSubText: {
    marginTop: spacing.small ?? 10,
    fontSize: 14,
    color: colors.textSecondary ?? '#555555',
    textAlign: 'center',
  },
});

export default ScanInitiationScreen;
