import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView, 
  Platform,
  ActivityIndicator,
  Share
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../utils/theme';
import { Text, Button, Surface, Divider } from 'react-native-paper';
import { useAuth } from '../../store/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface ScanDetailParams {
  scanId?: string;
  result?: 'Normal' | 'High';
  pressure?: number;
  date?: string;
  imageUrl?: string;
  fromResult?: boolean;
}

interface ScanData {
  id: string;
  user_id: string;
  result: 'Normal' | 'High';
  pressure: number;
  created_at: string;
  image_url: string;
  notes?: string;
}

const ScanDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const params = route.params as ScanDetailParams;
  
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Load scan data - either from params (new scan) or from database (existing scan)
  useEffect(() => {
    const loadScanData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (params.scanId) {
          // Load existing scan data from database
          const { data, error } = await supabase
            .from('scan_results')
            .select('*')
            .eq('id', params.scanId)
            .single();
          
          if (error) {
            throw error;
          }
          
          if (data) {
            setScanData(data as ScanData);
            setNotes(data.notes || '');
          } else {
            throw new Error('Scan not found');
          }
        } else if (params.result && params.pressure && params.date && params.imageUrl) {
          // Create temporary scan data from params (new scan from result screen)
          const tempScanData: ScanData = {
            id: `temp-${Date.now()}`,
            user_id: user?.id || '',
            result: params.result,
            pressure: params.pressure,
            created_at: params.date,
            image_url: params.imageUrl
          };
          
          setScanData(tempScanData);
        } else {
          throw new Error('Invalid scan parameters');
        }
      } catch (error) {
        console.error('Error loading scan data:', error);
        setError('Failed to load scan data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadScanData();
  }, [params, user]);

  // Save scan data to database
  const saveScan = async () => {
    if (!user || !scanData) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // First upload the image if it's a local file
      let imageUrl = scanData.image_url;
      
      if (imageUrl && (imageUrl.startsWith('file://') || imageUrl.startsWith('content://'))) {
        console.log('Uploading image to storage...');
        
        try {
          // Extract file name from the URI or generate a unique name
          const fileName = imageUrl.split('/').pop() || `scan-${Date.now()}.jpg`;
          const filePath = `${user.id}/${fileName}`;
          
          // Fetch the file as a blob first
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          // Upload file to Supabase Storage
          const { data: fileData, error: uploadError } = await supabase.storage
            .from('eye_scans')
            .upload(filePath, blob, {
              contentType: 'image/jpeg',
              cacheControl: '3600'
            });
          
          if (uploadError) {
            throw new Error(`Failed to upload image: ${uploadError.message}`);
          }
          
          // Get the public URL for the uploaded file
          const { data: urlData } = await supabase.storage
            .from('eye_scans')
            .getPublicUrl(filePath);
          
          imageUrl = urlData.publicUrl;
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
          // Continue with the local image URI if upload fails
          console.log('Continuing with local image URI');
        }
      }
      
      // Now save or update the scan data
      const scanRecord = {
        user_id: user.id,
        result: scanData.result,
        pressure: scanData.pressure,
        image_url: imageUrl,
        created_at: scanData.created_at,
        notes: notes
      };
      
      let response;
      
      if (params.scanId) {
        // Update existing scan
        response = await supabase
          .from('scan_results')
          .update(scanRecord)
          .eq('id', params.scanId);
      } else {
        // Insert new scan
        response = await supabase
          .from('scan_results')
          .insert([scanRecord]);
      }
      
      if (response.error) {
        throw response.error;
      }
      
      Alert.alert(
        'Success',
        'Scan saved successfully',
        [{ text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'History' }) }]
      );
    } catch (error) {
      console.error('Error saving scan:', error);
      setError('Failed to save scan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Delete scan from database
  const deleteScan = async () => {
    if (!user || !scanData || !params.scanId) return;
    
    // Show confirmation dialog
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              setError(null);
              
              // First, try to delete the image from storage if it's stored in Supabase
              if (scanData.image_url && scanData.image_url.includes('supabase')) {
                try {
                  // Extract the file path from the URL
                  const urlParts = scanData.image_url.split('/');
                  const fileName = urlParts[urlParts.length - 1];
                  const filePath = `${user.id}/${fileName}`;
                  
                  // Delete the file from storage
                  const { error: deleteImageError } = await supabase.storage
                    .from('eye_scans')
                    .remove([filePath]);
                    
                  if (deleteImageError) {
                    console.warn('Error deleting image:', deleteImageError);
                    // Continue with scan deletion even if image deletion fails
                  }
                } catch (imageError) {
                  console.warn('Error processing image deletion:', imageError);
                  // Continue with scan deletion
                }
              }
              
              // Delete the scan record
              const { error: deleteError } = await supabase
                .from('scan_results')
                .delete()
                .eq('id', params.scanId);
                
              if (deleteError) {
                throw deleteError;
              }
              
              setDeleting(false); // Reset deleting state after successful deletion
              
              Alert.alert(
                'Success',
                'Scan deleted successfully',
                [{ 
                  text: 'OK', 
                  onPress: () => navigation.navigate('MainTabs', { screen: 'History' }) 
                }]
              );
            } catch (error) {
              console.error('Error deleting scan:', error);
              setError('Failed to delete scan. Please try again.');
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const shareScan = async () => {
    if (!scanData) return;
    
    try {
      await Share.share({
        message: `IOP Scan Results\nDate: ${format(new Date(scanData.created_at), 'MMM d, yyyy h:mm a')}\nPressure: ${scanData.pressure} mmHg\nResult: ${scanData.result}`
      });
    } catch (error) {
      console.error('Error sharing scan:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading scan details...</Text>
      </View>
    );
  }

  if (error || !scanData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const isNormalPressure = scanData.result === 'Normal';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Details</Text>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={shareScan}
        >
          <Ionicons name="share-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Surface style={styles.resultCard}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.dateText}>
              {format(new Date(scanData.created_at), 'MMMM d, yyyy h:mm a')}
            </Text>
          </View>

          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>IOP Result:</Text>
            <Text style={[
              styles.resultValue, 
              {color: isNormalPressure ? colors.success : colors.error}
            ]}>
              {scanData.result}
            </Text>
          </View>

          <View style={styles.pressureContainer}>
            <Text style={styles.pressureValue}>{scanData.pressure}</Text>
            <Text style={styles.pressureUnit}>mmHg</Text>
          </View>

          <View style={[
            styles.statusIndicator, 
            {backgroundColor: isNormalPressure ? colors.success + '20' : colors.error + '20'}
          ]}>
            <Ionicons 
              name={isNormalPressure ? "checkmark-circle" : "warning"} 
              size={24} 
              color={isNormalPressure ? colors.success : colors.error} 
            />
            <Text style={[
              styles.statusText, 
              {color: isNormalPressure ? colors.success : colors.error}
            ]}>
              {isNormalPressure 
                ? 'Your intraocular pressure is normal.' 
                : 'Your intraocular pressure is elevated.'}
            </Text>
          </View>
        </Surface>

        <Surface style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Fundus Image</Text>
          <View style={styles.imageContainer}>
            {scanData.image_url ? (
              <Image 
                source={{ uri: scanData.image_url }} 
                style={styles.eyeImage} 
                resizeMode="contain"
              />
            ) : (
              <View style={styles.noImageContainer}>
                <Ionicons name="image-outline" size={64} color={colors.textSecondary} />
                <Text style={styles.noImageText}>No image available</Text>
              </View>
            )}
          </View>
        </Surface>

        <Surface style={styles.recommendationSection}>
          <Text style={styles.sectionTitle}>
            {isNormalPressure ? 'Recommendations' : 'Important Actions'}
          </Text>
          
          {isNormalPressure ? (
            <>
              <View style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} style={styles.recommendationIcon} />
                <Text style={styles.recommendationText}>
                  Your eye pressure is within the normal range.
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Ionicons name="calendar" size={24} color={colors.primary} style={styles.recommendationIcon} />
                <Text style={styles.recommendationText}>
                  Continue with regular eye check-ups, generally once a year.
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Ionicons name="fitness" size={24} color={colors.primary} style={styles.recommendationIcon} />
                <Text style={styles.recommendationText}>
                  Maintain a healthy lifestyle including regular exercise and a balanced diet.
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.recommendationItem}>
                <Ionicons name="medkit" size={24} color={colors.error} style={styles.recommendationIcon} />
                <Text style={styles.recommendationText}>
                  <Text style={{fontWeight: 'bold'}}>Consult an eye care professional soon.</Text> Elevated eye pressure may indicate a risk for glaucoma.
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Ionicons name="alarm" size={24} color={colors.error} style={styles.recommendationIcon} />
                <Text style={styles.recommendationText}>
                  Do not delay seeking medical advice. Early detection and treatment can prevent vision loss.
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Ionicons name="documents" size={24} color={colors.primary} style={styles.recommendationIcon} />
                <Text style={styles.recommendationText}>
                  Keep this scan result to share with your doctor during your appointment.
                </Text>
              </View>
            </>
          )}
        </Surface>

        {params.scanId && (
          <View style={styles.actionButtons}>
            <Button 
              mode="contained" 
              onPress={deleteScan}
              loading={deleting}
              disabled={deleting}
              style={styles.deleteButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="trash-can-outline"
            >
              Delete This Scan
            </Button>
          </View>
        )}

        {!params.scanId && (
          <View style={styles.actionButtons}>
            <Button 
              mode="contained" 
              onPress={saveScan} 
              loading={saving}
              disabled={saving}
              style={styles.saveButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Save To History
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: spacing.medium,
  },
  resultCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.medium,
    elevation: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.surface,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  resultContainer: {
    padding: spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
  },
  resultLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pressureContainer: {
    padding: spacing.medium,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  pressureValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  pressureUnit: {
    fontSize: 18,
    color: colors.textSecondary,
    marginLeft: 5,
  },
  statusIndicator: {
    padding: spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  imageSection: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.medium,
    padding: spacing.medium,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.medium,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: colors.textSecondary,
    marginTop: spacing.small,
  },
  recommendationSection: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.medium,
    padding: spacing.medium,
    elevation: 2,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.medium,
  },
  recommendationIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  actionButtons: {
    marginVertical: spacing.large,
  },
  saveButton: {
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.medium,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.large,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginVertical: spacing.medium,
  },
  errorButton: {
    marginTop: spacing.medium,
  },
  deleteButton: {
    borderRadius: 8,
    backgroundColor: colors.error,
    marginTop: spacing.medium,
  },
});

export default ScanDetailScreen; 