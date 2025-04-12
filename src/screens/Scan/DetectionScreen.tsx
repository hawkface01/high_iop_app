import React, { useState, useEffect } from 'react';
import { View, Text, Image, Alert, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { formatISO } from 'date-fns';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/AuthContext';

import { InferenceService } from '../../services/inferenceService';
import { colors, typography } from '../../utils/theme';
import { ScanStackScreenProps, ScanStackParamList } from '../../navigation/types';

type DetectionScreenRouteProp = RouteProp<ScanStackParamList, 'Detection'>;

const DetectionScreen = () => {
  const route = useRoute<DetectionScreenRouteProp>();
  const navigation = useNavigation();
  const { user } = useAuth();

  const imageUriFromParam = route.params?.imageUri;

  const [imageUri, setImageUri] = useState<string | null>(imageUriFromParam || null);
  const [isLoadingModel, setIsLoadingModel] = useState(!InferenceService.isModelLoaded());
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ probability?: number; prediction?: string; error?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: 'Run IOP Detection' });

    if (!imageUriFromParam) {
        Alert.alert('Error', 'No image was provided for detection.');
        console.error('DetectionScreen: imageUri parameter missing in route params.');
        return;
    }

    if (!InferenceService.isModelLoaded()) {
        const initializeModel = async () => {
            console.log('DetectionScreen: Initializing model...');
            setIsLoadingModel(true);
            const loaded = await InferenceService.loadModel();
            if (!loaded) {
                console.error('DetectionScreen: Model loading failed.');
                Alert.alert(
                    'Model Load Error',
                    'Could not load the detection model. Please try restarting the app.',
                    [{ text: 'OK' }]
                );
            } else {
                console.log("DetectionScreen: Model ready.");
            }
            setIsLoadingModel(false);
        };
        initializeModel();
    } else {
        setIsLoadingModel(false);
    }
  }, [navigation, imageUriFromParam]);

  const handleDetection = async () => {
    if (!imageUri) {
      Alert.alert('Image Error', 'No image available for detection.');
      return;
    }
    if (!InferenceService.isModelLoaded()) {
       Alert.alert('Model Not Ready', 'The model is still loading or failed to load.');
       return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      console.log('DetectionScreen: Starting detection for:', imageUri);
      const inputTensor = await InferenceService.preprocessImageToTensor(imageUri);
      if (!inputTensor) throw new Error('Image preprocessing failed.');

      console.log('DetectionScreen: Starting inference...');
      const startTime = performance.now();
      const rawOutput = await InferenceService.runInference(inputTensor);
      const endTime = performance.now();
      console.log(`DetectionScreen: Inference finished in ${(endTime - startTime).toFixed(2)} ms.`);

      if (!rawOutput) throw new Error('Model inference failed.');

      const finalResult = InferenceService.postprocessOutput(rawOutput);
      console.log('DetectionScreen: Detection complete.');
      setResult(finalResult);

    } catch (error: any) {
      console.error('DetectionScreen: Detection pipeline error:', error);
      setResult({ error: error.message || 'An unknown error occurred.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveScan = async () => {
    if (!user || !result || result.error || !imageUri || result.probability === undefined) {
      Alert.alert('Error', 'Cannot save scan. Missing required information.');
      return;
    }

    // --- TEST NETWORK --- 
    try {
      console.log('Testing network connection...');
      const testResponse = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      if (!testResponse.ok) {
        throw new Error(`Test fetch failed with status: ${testResponse.status}`);
      }
      const testJson = await testResponse.json();
      console.log('Network test successful:', testJson.title);
    } catch (networkTestError: any) {
      console.error('Network test failed:', networkTestError);
      Alert.alert('Network Error', `Could not connect to the internet. Please check your connection. Details: ${networkTestError.message}`);
      setIsSaving(false); // Stop the saving process if network test fails
      return;
    }
    // --- END TEST NETWORK ---

    setIsSaving(true);
    try {
      let imageUrl = imageUri;
      if (imageUrl.startsWith('file://') || imageUrl.startsWith('content://')) {
        console.log('Uploading image to storage...');
        try {
          const fileName = imageUrl.split('/').pop() || `scan-${Date.now()}.jpg`;
          const filePath = `${user.id}/${fileName}`;
          const response = await fetch(imageUrl);
          const blob = await response.blob();

          const { data: fileData, error: uploadError } = await supabase.storage
            .from('eye_scans')
            .upload(filePath, blob, {
              contentType: 'image/jpeg',
              cacheControl: '3600'
            });

          if (uploadError) {
            throw new Error(`Failed to upload image: ${uploadError.message}`); 
          }

          const { data: urlData } = await supabase.storage
            .from('eye_scans')
            .getPublicUrl(filePath);

          imageUrl = urlData.publicUrl;
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadErr: any) { 
          console.log('Continuing with local image URI (upload failed silently)');
        }
      }

      const scanResultType: 'Normal' | 'High' = result.prediction === 'High IOP Risk' ? 'High' : 'Normal';
      const pressureValue = result.probability * 100; 
      const currentDate = formatISO(new Date());

      const scanRecord = {
        user_id: user.id,
        result: scanResultType,
        pressure: pressureValue,
        image_url: imageUrl,
        created_at: currentDate,
      };

      const { error: insertError } = await supabase
        .from('scan_results')
        .insert([scanRecord]);

      if (insertError) {
        throw insertError;
      }

      Alert.alert(
        'Success',
        'Scan saved successfully to your history!',
        [{ text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'History' }) }] 
      );

    } catch (error: any) {
      console.error('Error saving scan:', error);
      Alert.alert('Save Failed', `Could not save scan: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 100 }]}>
      <Text style={styles.title}>Analyze Fundus Image</Text>

      {isLoadingModel && (
         <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading AI Model (Large)...</Text>
            <Text style={styles.loadingSubText}>This may take a moment, especially on first launch.</Text>
         </View>
      )}

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}

      {!imageUri && !isLoadingModel && (
          <Text style={styles.errorText}>No image received.</Text>
      )}

      {imageUri && !isLoadingModel && (
        <TouchableOpacity
          style={[styles.detectButton, (isProcessing || isLoadingModel) && styles.disabledButton]}
          onPress={handleDetection}
          disabled={isProcessing || isLoadingModel}
        >
          <Ionicons name="eye-outline" size={24} color={colors.background} />
          <Text style={styles.detectButtonText}>{isProcessing ? 'Analyzing...' : 'Run Analysis'}</Text>
        </TouchableOpacity>
      )}

      {isProcessing && !isLoadingModel && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Analyzing Image...</Text>
          </View>
      )}

      {result && (
        <View style={[styles.resultContainer, result.error ? styles.errorContainer : (result.prediction === 'High IOP Risk' ? styles.highRiskContainer : styles.lowRiskContainer)]}>
          <Text style={styles.resultTitle}>Analysis Result:</Text>
          {result.error && (
            <View style={styles.resultContent}>
              <Ionicons name="alert-circle-outline" size={30} color={colors.error} />
              <Text style={styles.errorText}>Error: {result.error}</Text>
            </View>
          )}
          {result.prediction && (
            <View style={styles.resultContent}>
               <Ionicons
                  name={result.prediction === 'High IOP Risk' ? "warning-outline" : "checkmark-circle-outline"}
                  size={30}
                  color={result.prediction === 'High IOP Risk' ? colors.warning : colors.success}
                />
                <View>
                    <Text style={styles.predictionText}>
                      {result.prediction === 'High IOP Risk' ? 'High IOP' : 'Normal IOP'}
                    </Text>
                    {result.probability !== undefined && (
                        <Text style={styles.probabilityText}>
                            Probability: {(result.probability * 100).toFixed(1)}%
                        </Text>
                    )}
                </View>
            </View>
          )}
          <Text style={styles.disclaimer}>Disclaimer: This is not a medical diagnosis. Consult a healthcare professional.</Text>

          {!result.error && (
            <PaperButton
              mode="contained"
              onPress={handleSaveScan}
              loading={isSaving}
              disabled={isSaving || isProcessing}
              style={styles.saveButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="content-save-outline"
            >
              Save Scan to History
            </PaperButton>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    marginVertical: 30,
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 8,
    width: '90%',
  },
  loadingText: {
    ...typography.titleMedium,
    marginTop: 10,
    color: colors.primary,
  },
   loadingSubText: {
    ...typography.bodySmall,
    marginTop: 5,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  imageContainer: {
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 5,
    backgroundColor: colors.surface,
  },
  image: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
    borderRadius: 6,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  detectButtonText: {
    ...typography.labelLarge,
    color: colors.background,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  resultContainer: {
    marginTop: 25,
    padding: 20,
    borderWidth: 1,
    borderRadius: 8,
    width: '95%',
    alignItems: 'center',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    ...typography.titleLarge,
    marginBottom: 15,
    color: colors.text,
    fontWeight: 'bold',
  },
  predictionText: {
    ...typography.headlineSmall,
    marginLeft: 10,
  },
  probabilityText: {
      ...typography.bodyMedium,
      marginLeft: 10,
      color: colors.textSecondary,
  },
  errorText: {
      ...typography.bodyLarge,
      color: colors.error,
      marginLeft: 10,
      textAlign: 'center',
      flexShrink: 1,
  },
  disclaimer: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: 15,
      textAlign: 'center',
  },
  errorContainer: {
      borderColor: colors.error,
      backgroundColor: colors.error + '10',
  },
  highRiskContainer: {
      borderColor: colors.warning,
      backgroundColor: colors.warning + '10',
  },
  lowRiskContainer: {
      borderColor: colors.success,
      backgroundColor: colors.success + '10',
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default DetectionScreen; 