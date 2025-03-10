import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Platform, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  Image,
  ScrollView,
  LogBox,
  Linking
} from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../utils/theme';
import Card from '../../components/common/Card';

// Ignore warnings that might be related to the image picker or camera
LogBox.ignoreLogs([
  'EventEmitter.removeListener',
  'Possible Unhandled Promise Rejection',
  'Non-serializable values were found in the navigation state'
]);

const CaptureScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<string | null>(null);
  const [galleryPermission, setGalleryPermission] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      try {
        console.log('🔍 Checking initial permissions...');
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        setCameraPermission(cameraStatus.status);
        console.log('📷 Initial camera permission:', cameraStatus.status);
        
        const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setGalleryPermission(galleryStatus.status);
        console.log('🖼️ Initial gallery permission:', galleryStatus.status);
      } catch (error) {
        console.error('❌ Error checking permissions:', error);
      }
    })();
  }, []);

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Camera capture with multiple fallback strategies
  const takePhoto = async () => {
    console.log('📸 Camera capture initiated');
    setIsLaunching(true);
    setErrorMessage(null);
    
    try {
      // First, check/request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermission(status);
      console.log('📷 Camera permission status:', status);
      
      if (status !== 'granted') {
        console.log('❌ Camera permission denied');
        Alert.alert(
          'Camera Permission Required',
          'We need camera access to take photos. Would you like to grant permission in settings?',
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Open Settings', onPress: openAppSettings }
          ]
        );
        setErrorMessage('Camera permission denied. Please enable camera access in your device settings.');
        setIsLaunching(false);
        return;
      }
      
      console.log('✅ Camera permission granted, launching camera...');
      
      // Try the first camera capture strategy (minimal configuration)
      try {
        console.log('Strategy 1: Minimal configuration');
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
          allowsEditing: false,
        });
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          console.log('📱 Image captured with Strategy 1:', result.assets[0].uri.substring(0, 50) + '...');
          setSelectedImage(result.assets[0].uri);
          setIsLaunching(false);
          return;
        } else if (result.canceled) {
          console.log('User canceled camera capture');
          setIsLaunching(false);
          return;
        }
      } catch (error) {
        console.log('Strategy 1 failed, trying Strategy 2', error);
      }
      
      // Try second strategy with different options
      try {
        console.log('Strategy 2: With editing');
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          console.log('📱 Image captured with Strategy 2:', result.assets[0].uri.substring(0, 50) + '...');
          setSelectedImage(result.assets[0].uri);
          setIsLaunching(false);
          return;
        }
      } catch (error) {
        console.log('Strategy 2 failed, trying final strategy', error);
      }
      
      // Last resort strategy
      try {
        console.log('Strategy 3: Basic capture');
        const result = await ImagePicker.launchCameraAsync({});
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          console.log('📱 Image captured with Strategy 3:', result.assets[0].uri.substring(0, 50) + '...');
          setSelectedImage(result.assets[0].uri);
          setIsLaunching(false);
          return;
        }
      } catch (finalError) {
        console.error('❌ All camera strategies failed:', finalError);
        throw new Error('All camera capture methods failed');
      }
      
      throw new Error('Could not capture image after trying all methods');
    } catch (error) {
      console.error('❌ Camera error:', error);
      setErrorMessage('Could not access camera. Please check your device permissions or try uploading an image instead.');
    } finally {
      setIsLaunching(false);
    }
  };

  // Gallery selection with fallback strategies
  const selectImage = async () => {
    console.log('🖼️ Gallery selection initiated');
    setIsLaunching(true);
    setErrorMessage(null);
    
    try {
      // Check/request media library permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setGalleryPermission(status);
      console.log('🖼️ Gallery permission status:', status);
      
      if (status !== 'granted') {
        console.log('❌ Gallery permission denied');
        Alert.alert(
          'Gallery Access Required',
          'We need access to your photo library. Would you like to grant permission in settings?',
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Open Settings', onPress: openAppSettings }
          ]
        );
        setErrorMessage('Gallery permission denied. Please enable photo library access in your device settings.');
        setIsLaunching(false);
        return;
      }
      
      console.log('✅ Gallery permission granted, launching picker...');
      
      // Try the first gallery selection strategy
      try {
        console.log('Strategy 1: Full configuration');
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          console.log('📱 Image selected with Strategy 1:', result.assets[0].uri.substring(0, 50) + '...');
          setSelectedImage(result.assets[0].uri);
          setIsLaunching(false);
          return;
        } else if (result.canceled) {
          console.log('User canceled gallery selection');
          setIsLaunching(false);
          return;
        }
      } catch (error) {
        console.log('Strategy 1 failed, trying Strategy 2', error);
      }
      
      // Second strategy with minimal options
      try {
        console.log('Strategy 2: Minimal configuration');
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.5,
        });
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          console.log('📱 Image selected with Strategy 2:', result.assets[0].uri.substring(0, 50) + '...');
          setSelectedImage(result.assets[0].uri);
          setIsLaunching(false);
          return;
        }
      } catch (error) {
        console.log('Strategy 2 failed, trying final strategy', error);
      }
      
      // Last resort strategy
      try {
        console.log('Strategy 3: Basic selection');
        const result = await ImagePicker.launchImageLibraryAsync({});
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          console.log('📱 Image selected with Strategy 3:', result.assets[0].uri.substring(0, 50) + '...');
          setSelectedImage(result.assets[0].uri);
          setIsLaunching(false);
          return;
        }
      } catch (finalError) {
        console.error('❌ All gallery strategies failed:', finalError);
        throw new Error('All gallery selection methods failed');
      }
      
      throw new Error('Could not select image after trying all methods');
    } catch (error) {
      console.error('❌ Gallery error:', error);
      setErrorMessage('Could not access photo library. Please check your device permissions or try taking a photo instead.');
    } finally {
      setIsLaunching(false);
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;
    
    console.log('🔍 Processing image:', selectedImage.substring(0, 50) + '...');
    setIsProcessing(true);
    
    try {
      // Check if image exists and is accessible
      const fileInfo = await Image.getSize(selectedImage, 
        (width, height) => {
          console.log(`✅ Image validated - dimensions: ${width}x${height}`);
        },
        (error) => {
          console.error('❌ Image validation failed:', error);
          throw new Error('Selected image is invalid or inaccessible');
        }
      );
      
      // Continue with processing...
      // Simulate processing delay (in a real app, this would be ML model inference)
      setTimeout(() => {
        // Mock result generation
        const result = Math.random() > 0.5 ? 'High' : 'Normal';
        const pressure = result === 'High' ? 
          Math.floor(Math.random() * 10) + 22 : // 22-31 mmHg for high
          Math.floor(Math.random() * 7) + 10;   // 10-16 mmHg for normal
        
        console.log('✅ Analysis complete:', { result, pressure });
        
        // Navigate to ScanDetail screen directly with scan data
        navigation.navigate('ScanDetail', {
          result,
          pressure,
          date: new Date().toISOString(),
          imageUrl: selectedImage,
          fromResult: false
        });
        
        // Reset state
        setSelectedImage(null);
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error('❌ Error processing image:', error);
      Alert.alert(
        'Processing Error',
        'There was a problem analyzing the selected image. Please try again with a different image.',
        [{ text: 'OK' }]
      );
      setIsProcessing(false);
    }
  };

  const handleGoBack = () => {
    if (selectedImage) {
      setSelectedImage(null);
      setErrorMessage(null);
    } else {
      navigation.goBack();
    }
  };

  const renderCaptureOptions = () => (
    <>
      <Card variant="elevated" style={styles.card}>
        <Text style={styles.title}>How would you like to capture your eye image?</Text>
        
        <TouchableOpacity 
          style={[
            styles.option, 
            isLaunching && styles.disabledOption
          ]}
          onPress={takePhoto}
          activeOpacity={0.7}
          disabled={isLaunching || isProcessing}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={40} color={colors.primary} />
          </View>
          <Text style={styles.optionTitle}>Take Photo</Text>
          <Text style={styles.optionDescription}>
            Use your camera to take a new fundus image
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.option, 
            isLaunching && styles.disabledOption
          ]}
          onPress={selectImage}
          activeOpacity={0.7}
          disabled={isLaunching || isProcessing}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="images" size={40} color={colors.primary} />
          </View>
          <Text style={styles.optionTitle}>Upload Image</Text>
          <Text style={styles.optionDescription}>
            Select an existing fundus image from your device
          </Text>
        </TouchableOpacity>
      </Card>
      
      {errorMessage && (
        <Card variant="elevated" style={styles.errorCard}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color={colors.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={openAppSettings}
          >
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </Card>
      )}
      
      <Card variant="elevated" style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Tips for Good Eye Images</Text>
        
        <View style={styles.tipItem}>
          <Ionicons name="sunny-outline" size={24} color={colors.primary} style={styles.tipIcon} />
          <Text style={styles.tipText}>
            Ensure good lighting - avoid glare or shadows
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <Ionicons name="eye-outline" size={24} color={colors.primary} style={styles.tipIcon} />
          <Text style={styles.tipText}>
            Keep your eye centered in the frame
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <Ionicons name="hand-left-outline" size={24} color={colors.primary} style={styles.tipIcon} />
          <Text style={styles.tipText}>
            Hold your device steady to avoid blurry images
          </Text>
        </View>
      </Card>
    </>
  );

  const renderImagePreview = () => (
    <View style={styles.previewSection}>
      <Image 
        source={{ uri: selectedImage as string }} 
        style={styles.previewImage} 
        resizeMode="contain"
      />
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => setSelectedImage(null)}
          disabled={isProcessing}
        >
          <Ionicons name="close" size={24} color="white" />
          <Text style={styles.actionButtonText}>Retake</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            styles.confirmButton,
            isProcessing && styles.disabledButton
          ]}
          onPress={processImage}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark" size={24} color="white" />
              <Text style={styles.actionButtonText}>Analyze</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {isProcessing && (
        <View style={styles.processingIndicator}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.processingText}>
            Analyzing your eye image...
          </Text>
        </View>
      )}
    </View>
  );

  const renderLoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {cameraPermission === 'granted' || galleryPermission === 'granted' 
            ? 'Opening...' 
            : 'Requesting permissions...'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
          accessibilityLabel="Go back"
          accessibilityHint={selectedImage ? "Clear selected image" : "Return to previous screen"}
        >
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedImage ? "Preview" : "Capture Eye Image"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={selectedImage ? styles.previewContainer : {}}
        showsVerticalScrollIndicator={false}
      >
        {selectedImage ? renderImagePreview() : renderCaptureOptions()}
      </ScrollView>
      
      {isLaunching && renderLoadingOverlay()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  backButton: {
    padding: 10,
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
    padding: spacing.medium,
  },
  previewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    padding: spacing.large,
    marginBottom: spacing.medium,
    backgroundColor: colors.surface,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorCard: {
    borderRadius: 16,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.small,
    flex: 1,
  },
  settingsButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.small,
    alignItems: 'center',
    marginTop: 10,
  },
  settingsButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.large,
    textAlign: 'center',
  },
  option: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.large,
    alignItems: 'center',
    marginBottom: spacing.large,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    marginHorizontal: 10,
  },
  disabledOption: {
    backgroundColor: colors.disabled,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: spacing.small,
  },
  optionDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  tipsCard: {
    borderRadius: 16,
    padding: spacing.large,
    backgroundColor: colors.surface,
    marginBottom: spacing.large,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.medium,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.medium,
    backgroundColor: 'rgba(240, 240, 250, 0.6)',
    padding: spacing.small,
    borderRadius: 8,
  },
  tipIcon: {
    marginRight: spacing.small,
  },
  tipText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  previewSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: 350,
    borderRadius: 16,
    marginBottom: spacing.large,
    backgroundColor: 'black',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.large,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
  },
  cancelButton: {
    backgroundColor: colors.error,
    marginRight: spacing.small,
  },
  confirmButton: {
    backgroundColor: colors.success,
    marginLeft: spacing.small,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  processingIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.large,
  },
  processingText: {
    marginTop: spacing.small,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
});

export default CaptureScreen; 