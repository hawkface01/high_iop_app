import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../utils/theme';
import { IOPResult } from '../../services/ml/mlService'; // Import the type
import { supabase } from '../../services/supabaseClient'; // Import Supabase client
import { useAuth } from '../../store/AuthContext'; // Adjusted path assumption

// Define the expected route parameters
type ResultsScreenRouteProp = RouteProp<
  { Params: { scanResult: IOPResult; imageUri: string } },
  'Params'
>;

const ResultsScreen = () => {
  const navigation = useNavigation<any>(); // Use specific type if available
  const route = useRoute<ResultsScreenRouteProp>();
  const { user } = useAuth(); // Get authenticated user

  // Get data from route parameters
  const { scanResult, imageUri } = route.params || {};

  // Use current timestamp for display and saving
  const timestamp = React.useRef(new Date()).current;

  // --- Add useEffect for saving results to Firestore ---
  useEffect(() => {
    const saveScanResult = async () => {
      // Add null check for supabase client
      if (!supabase) {
        console.error('Supabase client is not initialized.');
        return;
      }
      if (!scanResult || !user || !imageUri) {
        console.warn('Missing data required to save scan result.');
        return;
      }

      console.log('Attempting to save scan result to Firestore...');

      try {
        const { data, error } = await supabase
          .from('scans') // Ensure this table name matches your schema
          .insert([
            {
              user_id: user.id,
              image_uri: imageUri, // Storing local URI for now
              classification: scanResult.classification,
              confidence: scanResult.confidence,
              scan_timestamp: timestamp.toISOString(), // Use consistent ISO format
              // Add other fields as needed based on your schema
            },
          ])
          .select(); // Optionally select to confirm insert

        if (error) {
          throw error;
        }

        console.log('Scan result saved successfully:', data);
      } catch (error: any) {
        console.error('Error saving scan result to Firestore:', error);
        // Optionally show an alert to the user, but avoid blocking UI
        // Alert.alert("Save Error", "Could not save scan results to your history.");
      }
    };

    saveScanResult();

    // Run effect only once when component mounts with valid data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount
  // --- End of useEffect ---

  // Handle cases where data might be missing
  if (!scanResult) {
    // Show a loading or error state if data is not available
    return (
      <SafeAreaView style={styles.containerCentered}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.errorText}>Result data not found.</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </SafeAreaView>
    );
  }

  // Determine display values based on scanResult
  const isHighIOP = scanResult.classification === 'High IOP';
  const confidence = scanResult.confidence;

  const handleScheduleAppointment = () => {
    // TODO: Implement actual navigation or linking to appointment scheduling
    console.log('Schedule appointment action triggered');
    alert('Appointment scheduling feature coming soon!');
  };

  const handleBackToHome = () => {
    // Navigate back to the main tab screen (adjust 'MainTabs' if needed)
    navigation.navigate('MainTabs');
  };

  const formatDate = (date: Date) => {
    return (
      date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }) +
      ' - ' +
      date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Scan Results</Text>
          {/* Placeholder to balance the title */}
          <View style={styles.placeholder} />
        </View>

        {/* Timestamp */}
        <Text style={styles.timestamp}>{formatDate(timestamp)}</Text>

        {/* Result Card */}
        <View
          style={[
            styles.resultCard,
            isHighIOP ? styles.highIOPCard : styles.normalIOPCard,
          ]}
        >
          <View style={styles.resultIconContainer}>
            <Ionicons
              name={isHighIOP ? 'warning-outline' : 'checkmark-circle-outline'}
              size={50} // Larger icon
              color="white"
            />
          </View>
          <Text style={styles.resultTitle}>
            {isHighIOP ? 'High IOP Detected' : 'Normal IOP Detected'}
          </Text>
          <Text style={styles.resultDescription}>
            {isHighIOP
              ? 'Your scan suggests high intraocular pressure. Please consult an eye care professional soon for a comprehensive examination.'
              : 'Your scan suggests intraocular pressure is within the normal range. Continue with your regular eye check-ups.'}
          </Text>
          {/* Confidence Score */}
          <Text style={styles.confidenceText}>
            Confidence Score: {(confidence * 100).toFixed(1)}%
          </Text>
        </View>

        {/* Display Scanned Image */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>Scanned Image</Text>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationItem}>
            <Ionicons
              name="calendar-outline"
              size={28}
              color={colors.primary}
              style={styles.recommendationIcon}
            />
            <Text style={styles.recommendationText}>
              {isHighIOP
                ? 'Schedule an appointment with an ophthalmologist promptly.'
                : 'Continue with regular eye check-ups as advised by your doctor.'}
            </Text>
          </View>
          <View style={styles.recommendationItem}>
            <Ionicons
              name="eye-outline"
              size={28}
              color={colors.primary}
              style={styles.recommendationIcon}
            />
            <Text style={styles.recommendationText}>
              {isHighIOP
                ? 'Monitor for symptoms like persistent eye pain, blurred vision, or severe headaches.'
                : 'Maintain a healthy lifestyle. Discuss any vision changes with your doctor.'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isHighIOP && (
            <Button
              mode="contained"
              icon="calendar"
              onPress={handleScheduleAppointment}
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
            >
              Schedule Appointment
            </Button>
          )}
          <Button
            mode={isHighIOP ? "outlined" : "contained"}
            icon="home"
            onPress={handleBackToHome}
            style={[styles.actionButton, styles.homeButton]}
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
          >
            Back to Home
          </Button>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Disclaimer: This app provides preliminary screening results and is not a substitute for a professional medical diagnosis. Always consult an eye care professional for any health concerns.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background ?? '#FFFFFF',
  },
  containerCentered: { // For loading/error state
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.large ?? 20,
    backgroundColor: colors.background ?? '#FFFFFF',
  },
  scrollContent: {
    padding: spacing.medium ?? 15,
    paddingBottom: spacing.large ?? 20, // Ensure space at bottom
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.small ?? 10,
    paddingTop: spacing.medium ?? 15, // Adjust top padding if needed
  },
  backButton: {
    padding: spacing.small ?? 10, // Increase touch area
    marginRight: spacing.small ?? 10,
  },
  title: {
    fontSize: 22, // Slightly larger title
    fontWeight: 'bold',
    color: colors.text ?? '#000000',
    textAlign: 'center',
    flex: 1, // Allow title to take space
  },
  placeholder: { // Used to balance the header title
    width: 40, // Approx width of back button touch area
  },
  timestamp: {
    fontSize: 14,
    color: colors.textSecondary ?? '#555555',
    textAlign: 'center',
    marginBottom: spacing.large ?? 20,
  },
  resultCard: {
    borderRadius: 15, // More rounded corners
    padding: spacing.large ?? 20,
    marginBottom: spacing.large ?? 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  highIOPCard: {
    backgroundColor: colors.error ?? '#D32F2F', // Fallback error color
  },
  normalIOPCard: {
    backgroundColor: colors.success ?? '#388E3C', // Fallback success color
  },
  resultIconContainer: {
    marginBottom: spacing.medium ?? 15,
  },
  resultTitle: {
    fontSize: 24, // Larger result title
    fontWeight: 'bold',
    color: 'white',
    marginBottom: spacing.medium ?? 15,
    textAlign: 'center',
  },
  resultDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.medium ?? 15,
    lineHeight: 24,
  },
  confidenceText: {
    fontSize: 16, // Slightly larger confidence text
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  imageContainer: {
    marginBottom: spacing.large ?? 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text ?? '#000000',
    marginBottom: spacing.medium ?? 15,
    alignSelf: 'flex-start',
  },
  image: {
    width: '100%',
    height: 250, // Slightly larger image display
    borderRadius: 15,
    backgroundColor: colors.surface ?? '#f0f0f0',
  },
  recommendationsContainer: {
    marginBottom: spacing.large ?? 20,
    padding: spacing.medium ?? 15,
    backgroundColor: colors.surface ?? '#f9f9f9',
    borderRadius: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: spacing.medium ?? 15,
    alignItems: 'center', // Align icon and text better
  },
  recommendationIcon: {
    marginRight: spacing.medium ?? 15,
  },
  recommendationText: {
    flex: 1,
    fontSize: 16,
    color: colors.text ?? '#000000',
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: spacing.medium ?? 15,
  },
  actionButton: {
    marginBottom: spacing.medium ?? 15,
    height: 55, // Slightly larger button height
    justifyContent: 'center',
  },
  homeButton: {
     // Add specific styles if needed, e.g., border color for outlined
     borderColor: colors.primary ?? '#6200ee',
  },
  buttonLabel: {
    fontSize: 16, // Ensure readable button text
    fontWeight: 'bold',
  },
  buttonContent: {
    height: '100%', // Ensure content fills button height
    alignItems: 'center',
  },
  disclaimer: {
    marginTop: spacing.large ?? 20,
    fontSize: 12,
    color: colors.textSecondary ?? '#777777',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.small ?? 10,
  },
   errorText: { // Style for error message when data is missing
    marginTop: spacing.medium ?? 15,
    fontSize: 16,
    color: colors.error ?? 'red',
    textAlign: 'center',
    marginBottom: spacing.medium ?? 15,
  },
});

export default ResultsScreen; 
