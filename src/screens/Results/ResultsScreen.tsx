import React from 'react';
import { View, StyleSheet, Text, Image, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/theme';

const ResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri } = route.params || {};
  
  // This would come from the ML model
  const result = {
    isHighIOP: true,
    confidence: 0.92,
    timestamp: new Date(),
  };

  const handleScheduleAppointment = () => {
    // Implement appointment scheduling
    console.log('Schedule appointment');
  };

  const handleBackToHome = () => {
    navigation.navigate('MainTabs');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }) + ' - ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Scan Results</Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.timestamp}>{formatDate(result.timestamp)}</Text>

        <View style={[
          styles.resultCard,
          result.isHighIOP ? styles.highIOPCard : styles.normalIOPCard
        ]}>
          <View style={styles.resultIconContainer}>
            <Ionicons 
              name={result.isHighIOP ? "warning" : "checkmark-circle"} 
              size={40} 
              color="white" 
            />
          </View>
          <Text style={styles.resultTitle}>
            {result.isHighIOP ? 'High IOP Detected' : 'IOP is Normal'}
          </Text>
          <Text style={styles.resultDescription}>
            {result.isHighIOP 
              ? 'High intraocular pressure detected – please consult an eye care professional as soon as possible.'
              : 'Your intraocular pressure appears to be within normal range. Continue regular monitoring.'
            }
          </Text>
          <Text style={styles.confidenceText}>
            Confidence: {(result.confidence * 100).toFixed(1)}%
          </Text>
        </View>

        {imageUri && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>Fundus Image</Text>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
        )}

        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationItem}>
            <Ionicons name="calendar" size={24} color={colors.primary} style={styles.recommendationIcon} />
            <Text style={styles.recommendationText}>
              {result.isHighIOP 
                ? 'Schedule an appointment with an ophthalmologist within the next 7 days.'
                : 'Continue regular eye check-ups every 6-12 months.'
              }
            </Text>
          </View>
          <View style={styles.recommendationItem}>
            <Ionicons name="eye" size={24} color={colors.primary} style={styles.recommendationIcon} />
            <Text style={styles.recommendationText}>
              {result.isHighIOP 
                ? 'Monitor for symptoms like eye pain, headaches, or vision changes.'
                : 'Maintain a healthy lifestyle with regular exercise and a balanced diet.'
              }
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {result.isHighIOP && (
            <Button
              mode="contained"
              onPress={handleScheduleAppointment}
              style={styles.scheduleButton}
              labelStyle={styles.buttonLabel}
            >
              Schedule Appointment
            </Button>
          )}
          <Button
            mode={result.isHighIOP ? "outlined" : "contained"}
            onPress={handleBackToHome}
            style={styles.homeButton}
            labelStyle={styles.buttonLabel}
          >
            Back to Home
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 30,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    
  },
  placeholder: {
    width: 40,
  },
  timestamp: {
    fontSize: 14,
    color: colors.placeholder,
    marginBottom: 20,
    
  },
  resultCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  highIOPCard: {
    backgroundColor: colors.error,
  },
  normalIOPCard: {
    backgroundColor: colors.success,
  },
  resultIconContainer: {
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    
  },
  resultDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
    
  },
  confidenceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    
  },
  imageContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  recommendationsContainer: {
    marginBottom: 24,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  recommendationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    
  },
  buttonContainer: {
    marginTop: 8,
  },
  scheduleButton: {
    marginBottom: 12,
    height: 50,
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  homeButton: {
    height: 50,
    justifyContent: 'center',
    borderColor: colors.primary,
  },
  buttonLabel: {
    fontSize: 16,
    
  },
});

export default ResultsScreen; 
