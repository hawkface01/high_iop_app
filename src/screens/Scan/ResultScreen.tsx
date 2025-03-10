import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Share } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase, RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { colors } from '../../utils/theme';

// Define the route params type
type ResultScreenParams = {
  result: string;
  pressure: number;
  date: string;
};

type ResultRouteProps = RouteProp<{ Result: ResultScreenParams }, 'Result'>;

const ResultScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<ResultRouteProps>();
  
  // Get params from route
  const { result, pressure, date } = route.params;
  
  // Format date for display
  const formattedDate = new Date(date).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
  
  // Determine result color and message
  const resultColor = result === 'High' ? '#F44336' : '#4CAF50';
  const resultMessage = result === 'High' 
    ? 'Your scan indicates high intraocular pressure. We recommend consulting with an eye care professional.'
    : 'Your scan indicates normal intraocular pressure. Continue regular monitoring.';
  
  // Determine pressure status text
  const getPressureStatusText = (pressure: number) => {
    if (pressure < 12) return 'Low Normal';
    if (pressure <= 21) return 'Normal';
    if (pressure <= 25) return 'Slightly Elevated';
    if (pressure <= 30) return 'Moderately High';
    return 'Very High';
  };
  
  const pressureStatus = getPressureStatusText(pressure);
  
  // Share result
  const handleShare = async () => {
    try {
      await Share.share({
        message: `My High IOP Detection App scan result: ${result} (${pressure} mmHg) on ${formattedDate}. ${resultMessage}`,
      });
    } catch (error) {
      console.error('Error sharing result:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Result</Text>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Result Card */}
        <View style={styles.resultCard}>
          <View style={[styles.resultBadge, { backgroundColor: resultColor }]}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
          
          <Text style={styles.dateText}>{formattedDate}</Text>
          
          <View style={styles.pressureContainer}>
            <Text style={styles.pressureValue}>{pressure}</Text>
            <Text style={styles.pressureUnit}>mmHg</Text>
          </View>
          
          <Text style={styles.pressureStatus}>{pressureStatus}</Text>
          
          <Text style={styles.resultMessage}>{resultMessage}</Text>
        </View>
        
        {/* Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What does this mean?</Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoItemTitle}>Normal Range</Text>
              <Text style={styles.infoItemText}>
                Normal intraocular pressure typically ranges from 10 to 21 mmHg. 
                Pressure above this range may indicate a risk for glaucoma.
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="warning-outline" size={24} color="#FFC107" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoItemTitle}>Accuracy Note</Text>
              <Text style={styles.infoItemText}>
                This app provides an initial screening with approximately 85% accuracy compared to clinical measurements. 
                It is not a replacement for professional medical diagnosis.
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="medkit-outline" size={24} color="#F44336" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoItemTitle}>Next Steps</Text>
              <Text style={styles.infoItemText}>
                {result === 'High' 
                  ? 'Schedule an appointment with an eye care professional for a comprehensive examination.'
                  : 'Continue regular monitoring and maintain your eye health with regular check-ups.'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button 
            mode="contained" 
            style={styles.actionButton}
            labelStyle={styles.actionButtonLabel}
            onPress={() => navigation.navigate('History')}
          >
            View History
          </Button>
          
          <Button 
            mode="outlined" 
            style={styles.actionButton}
            labelStyle={styles.actionButtonOutlineLabel}
            onPress={() => navigation.navigate('Scan')}
          >
            New Scan
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  resultText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  pressureContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  pressureValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  pressureUnit: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  pressureStatus: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  resultMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoItemText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionButton: {
    marginBottom: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtonOutlineLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
});

export default ResultScreen; 