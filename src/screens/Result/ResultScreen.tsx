import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Text, Button, Surface, IconButton } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../utils/theme';
import { useAuth } from '../../store/AuthContext';
import { supabase } from '../../lib/supabase';

interface ResultScreenParams {
  result: 'Normal' | 'High';
  pressure: number;
  date: string;
  imageUrl?: string;
}

const ResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { result, pressure, date, imageUrl } = route.params as ResultScreenParams;

  const handleSave = async () => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('scan_results')
        .insert([
          {
            user_id: user.id,
            result: result,
            pressure: pressure,
            image_url: imageUrl,
            created_at: date
          }
        ]);

      if (error) throw error;
      
      navigation.navigate('MainTabs', { screen: 'History' });
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  const getResultColor = () => {
    return result === 'Normal' ? colors.success : colors.error;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Scan Result</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.content}>
        <Surface style={styles.resultContainer}>
          <View style={[styles.resultBadge, { backgroundColor: getResultColor() }]}>
            <Text style={styles.resultText}>
              {result === 'Normal' ? 'Normal' : 'High'}
            </Text>
          </View>

          <View style={styles.pressureContainer}>
            <Text style={styles.pressureLabel}>Intraocular Pressure</Text>
            <Text style={[styles.pressureValue, { color: getResultColor() }]}>
              {pressure}
              <Text style={styles.pressureUnit}> mmHg</Text>
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>
              {result === 'Normal' 
                ? 'Your eye pressure is normal'
                : 'Your eye pressure is elevated'}
            </Text>
            <Text style={styles.infoDescription}>
              {result === 'Normal'
                ? 'Your eye pressure is within the normal range. Continue with regular check-ups to monitor your eye health.'
                : 'We recommend consulting an eye care professional for a comprehensive examination. Early detection is key to preventing vision problems.'}
            </Text>
          </View>
        </Surface>

        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Save to History
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('MainTabs')}
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Return to Home
          </Button>
        </View>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    
  },
  content: {
    flex: 1,
    padding: 20,
  },
  resultContainer: {
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: colors.surface,
  },
  resultBadge: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  resultText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    
  },
  pressureContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pressureLabel: {
    fontSize: 16,
    color: colors.placeholder,
    marginBottom: 8,
    
  },
  pressureValue: {
    fontSize: 48,
    fontWeight: 'bold',
    
  },
  pressureUnit: {
    fontSize: 24,
    
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
    
  },
  infoDescription: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    
  },
  actionButtons: {
    marginTop: 32,
    gap: 16,
  },
  primaryButton: {
    borderRadius: 8,
  },
  secondaryButton: {
    borderRadius: 8,
    borderColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    
  },
});

export default ResultScreen; 
