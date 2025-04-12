import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
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
import { colors, spacing, typography } from '../../utils/theme';
import { Text, Button, Card, List, Title, Paragraph, Caption } from 'react-native-paper';
import { useAuth } from '../../store/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';

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

  useEffect(() => {
    const loadScanData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (params.scanId) {
          const { data, error } = await supabase
            .from('scan_results')
            .select('*')
            .eq('id', params.scanId)
            .single();
          
          if (error) throw error;
          if (data) setScanData(data as ScanData);
          else throw new Error('Scan not found');

        } else if (params.result && params.pressure !== undefined && params.date && params.imageUrl) {
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
      } catch (error: any) {
        console.error('Error loading scan data:', error);
        setError(`Failed to load scan data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadScanData();
  }, [params, user]);

  const saveScan = async () => {
    if (!user || !scanData || scanData.id.startsWith('temp-')) return;
    
    try {
      setSaving(true);
      setError(null);
      
      let imageUrl = scanData.image_url;
      
      if (imageUrl && (imageUrl.startsWith('file://') || imageUrl.startsWith('content://'))) {
        console.log('Uploading image to storage...');
        try {
          const fileName = imageUrl.split('/').pop() || `scan-${Date.now()}.jpg`;
          const filePath = `${user.id}/${fileName}`;
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          const { data: fileData, error: uploadError } = await supabase.storage
            .from('eye_scans')
            .upload(filePath, blob, { contentType: 'image/jpeg', cacheControl: '3600'});
          
          if (uploadError) throw new Error(`Failed to upload image: ${uploadError.message}`);
          
          const { data: urlData } = await supabase.storage
            .from('eye_scans')
            .getPublicUrl(filePath);
          
          imageUrl = urlData.publicUrl;
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadErr: any) {
          console.error('Error uploading image:', uploadErr);
          console.log('Continuing with local image URI (upload failed silently)');
        }
      }
      
      const scanRecord = {
        user_id: user.id,
        result: scanData.result,
        pressure: scanData.pressure,
        image_url: imageUrl,
        created_at: scanData.created_at,
      };
      
      const { error: insertError } = await supabase
          .from('scan_results')
          .insert([scanRecord]);
          
      if (insertError) throw insertError;
      
      Alert.alert('Success', 'Scan saved successfully',
        [{ text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'History' }) }]
      );
    } catch (error: any) {
      console.error('Error saving scan:', error);
      setError(`Failed to save scan: ${error.message}`);
      Alert.alert('Save Error', `Could not save scan: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteScan = async () => {
    if (!user || !scanData || !params.scanId) return;
    
    Alert.alert( 'Delete Scan', 'Are you sure? This cannot be undone.',
      [ { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              console.log('Attempting to delete scan with ID:', params.scanId);
              
              setDeleting(true); setError(null);
              if (scanData.image_url && scanData.image_url.includes('supabase')) {
                 try {
                    const urlParts = scanData.image_url.split('/');
                    const filePath = `${user.id}/${urlParts[urlParts.length - 1]}`;
                    await supabase.storage.from('eye_scans').remove([filePath]);
                 } catch (imgErr) { console.warn('Warn deleting image:', imgErr); }
              }
              const { error: deleteError } = await supabase.from('scan_results').delete().eq('id', params.scanId);
              if (deleteError) throw deleteError;
              setDeleting(false);
              Alert.alert('Success', 'Scan deleted',
                [{ text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'History' }) }]
              );
            } catch (error: any) {
              console.error('Error deleting scan:', error);
              setError(`Failed to delete scan: ${error.message}`);
              Alert.alert('Delete Error', `Could not delete scan: ${error.message}`);
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
        message: `IOP Scan Results\nDate: ${format(parseISO(scanData.created_at), 'MMM d, yyyy h:mm a')}\nResult: ${scanData.result === 'Normal' ? 'Normal IOP' : 'High IOP'}`
      });
    } catch (error) { console.error('Error sharing scan:', error); }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !scanData) {
    return (
      <SafeAreaView style={styles.container}>
         <View style={styles.header}> 
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitleError}>Error</Text>
             <View style={styles.headerButton} />
         </View>
         <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            <Paragraph style={styles.errorText}>{error || 'Scan data not found.'}</Paragraph>
            <Button mode="contained" onPress={() => navigation.goBack()} style={styles.buttonSpacing}>
              Go Back
            </Button>
         </View>
      </SafeAreaView>
    );
  }

  const isNormalPressure = scanData.result === 'Normal';
  const resultColor = isNormalPressure ? colors.success : colors.error;

  return (
    <SafeAreaView style={styles.container}>
       <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Details</Text>
            <TouchableOpacity style={styles.headerButton} onPress={shareScan}>
              <Ionicons name="share-outline" size={26} color={colors.primary} />
            </TouchableOpacity>
        </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Caption style={styles.dateText}>
              {format(parseISO(scanData.created_at), 'MMMM d, yyyy • h:mm a')}
            </Caption>
            
            <Title style={[styles.resultValue, { color: resultColor }]}>
              {isNormalPressure ? 'Normal IOP' : 'High IOP'}
            </Title>
            <Paragraph style={styles.statusText}>
              {isNormalPressure 
                ? 'Your intraocular pressure is within the normal range.' 
                : 'Your intraocular pressure appears elevated.'}
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Fundus Image" titleStyle={styles.cardTitle}/>
          {scanData.image_url ? (
            <Card.Cover 
              source={{ uri: scanData.image_url }} 
              style={styles.imageStyle} 
              resizeMode="contain"
            />
          ) : (
            <Card.Content style={styles.placeholderContainer}>
               <Ionicons name="image-outline" size={64} color={colors.placeholder} />
               <Caption>No image available</Caption>
            </Card.Content>
          )}
        </Card>

        <Card style={styles.card}>
          <Card.Title 
             title={isNormalPressure ? 'Recommendations' : 'Important Actions'} 
             titleStyle={styles.cardTitle}
          />
          <Card.Content>
            {isNormalPressure ? (
              <>
                <List.Item
                  title="Continue with regular eye check-ups (annually recommended)."
                  titleNumberOfLines={2}
                  left={props => <List.Icon {...props} icon="calendar-check-outline" color={colors.primary} />}
                  style={styles.listItem} titleStyle={styles.listTitle}
                />
                <List.Item
                  title="Maintain a healthy lifestyle (diet, exercise)."
                   titleNumberOfLines={2}
                  left={props => <List.Icon {...props} icon="heart-pulse" color={colors.primary} />}
                   style={styles.listItem} titleStyle={styles.listTitle}
                />
              </>
            ) : (
              <>
                <List.Item
                  titleStyle={[styles.listTitle, styles.boldText]}
                  title="Consult an eye care professional soon."
                  description="Elevated pressure may indicate glaucoma risk."
                  descriptionNumberOfLines={2}
                  left={props => <List.Icon {...props} icon="alert-circle" color={colors.error} />}
                   style={styles.listItem}
                />
                 <List.Item
                   titleStyle={styles.listTitle}
                  title="Do not delay seeking medical advice."
                  description="Early detection prevents vision loss."
                   descriptionNumberOfLines={2}
                  left={props => <List.Icon {...props} icon="clock-alert-outline" color={colors.error} />}
                   style={styles.listItem}
                />
                 <List.Item
                  titleStyle={styles.listTitle}
                  title="Share this result with your doctor."
                   titleNumberOfLines={1}
                  left={props => <List.Icon {...props} icon="share-variant-outline" color={colors.primary} />}
                   style={styles.listItem}
                />
              </>
            )}
          </Card.Content>
        </Card>
        
        <View style={styles.actionButtonsContainer}>
          {params.scanId ? (
            <Button 
              mode="contained" 
              onPress={deleteScan}
              loading={deleting}
              disabled={deleting || saving}
              style={styles.deleteButton}
              labelStyle={[styles.buttonLabel, { color: '#fff' }]}
              icon="trash-can-outline"
              color={colors.error}
            >
              Delete Scan
            </Button>
          ) : (
             <Button 
               mode="contained" 
               onPress={saveScan} 
               loading={saving}
               disabled={saving || deleting}
               style={styles.saveButton}
               labelStyle={styles.buttonLabel}
               icon="content-save-outline"
             >
               Save To History
             </Button>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.small,
    paddingTop: Platform.OS === 'ios' ? spacing.large : spacing.medium,
    paddingBottom: spacing.small,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerButton: {
     padding: spacing.small,
  },
  headerTitle: {
     ...typography.titleLarge,
     color: colors.text,
     fontWeight: 'bold',
  },
   headerTitleError: {
     ...typography.titleLarge,
     color: colors.error,
     fontWeight: 'bold',
  },
  scrollContent: {
    padding: spacing.medium,
    paddingBottom: spacing.large,
  },
  card: {
    marginBottom: spacing.medium,
    elevation: 0,
    borderWidth: 0,
    backgroundColor: colors.background,
  },
  cardTitle: {
      ...typography.titleMedium,
      color: colors.text,
      marginLeft: spacing.small,
      lineHeight: 22,
  },
  dateText: {
    marginBottom: spacing.medium,
    color: colors.textSecondary,
  },
  resultValue: {
    ...typography.headlineMedium,
    fontWeight: 'bold',
    marginBottom: spacing.small,
  },
  statusText: {
    ...typography.bodyLarge,
    color: colors.text,
    lineHeight: 22,
  },
  imageStyle: {
    backgroundColor: colors.border,
    height: 200,
  },
   placeholderContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border,
  },
  listItem: {
     paddingVertical: spacing.small,
     paddingHorizontal: 0,
  },
   listTitle: {
      ...typography.bodyLarge,
      color: colors.text,
   },
   boldText: {
      fontWeight: 'bold',
   },
  actionButtonsContainer: {
    marginTop: spacing.medium,
    paddingHorizontal: spacing.medium,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: spacing.small,
  },
  deleteButton: {
     borderRadius: 8,
     paddingVertical: spacing.small,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSpacing: {
      marginTop: spacing.large,
  },
   errorText: {
      ...typography.bodyLarge,
      color: colors.error,
      textAlign: 'center',
      marginTop: spacing.medium,
   },
});

export default ScanDetailScreen; 