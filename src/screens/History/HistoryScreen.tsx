import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, SectionList, RefreshControl, Platform } from 'react-native';
import { Text, Surface, ActivityIndicator, IconButton } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/AuthContext';
import { colors, spacing, shadows } from '../../utils/theme';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useFocusEffect } from '@react-navigation/core';
import { useNavigation } from '@react-navigation/native';

interface ScanResult {
  id: string;
  user_id: string;
  result: 'Normal' | 'High';
  pressure: number;
  created_at: string;
  image_url?: string;
}

interface Section {
  title: string;
  data: ScanResult[];
}

const HistoryScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);

  const groupResultsByDate = (results: ScanResult[]): Section[] => {
    const grouped = results.reduce((acc: { [key: string]: ScanResult[] }, result) => {
      const date = parseISO(result.created_at);
      let title = format(date, 'MMMM d, yyyy');
      
      if (isToday(date)) {
        title = 'Today';
      } else if (isYesterday(date)) {
        title = 'Yesterday';
      }

      if (!acc[title]) {
        acc[title] = [];
      }
      acc[title].push(result);
      return acc;
    }, {});

    return Object.entries(grouped).map(([title, data]) => ({
      title,
      data
    }));
  };

  const fetchHistory = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('scan_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        return;
      }
      
      const groupedData = groupResultsByDate(data || []);
      setSections(groupedData);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const renderItem = ({ item }: { item: ScanResult }) => (
    <Surface style={[styles.resultCard, shadows.medium]}>
      <View style={styles.cardContent}>
        <View style={styles.leftContent}>
          <View style={[styles.resultIndicator, { 
            backgroundColor: item.result === 'Normal' ? colors.success : colors.error 
          }]} />
          <View style={styles.textContainer}>
            <Text style={styles.timeText}>
              {format(parseISO(item.created_at), 'h:mm a')}
            </Text>
            <Text style={styles.pressureText}>
              {item.pressure} <Text style={styles.unitText}>mmHg</Text>
            </Text>
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={[styles.resultText, { 
            color: item.result === 'Normal' ? colors.success : colors.error 
          }]}>
            {item.result}
          </Text>
          <IconButton
            icon="chevron-right"
            size={24}
            iconColor={colors.placeholder}
            onPress={() => {
              // Navigate to detail view
              navigation.navigate('ScanDetail', { scanId: item.id });
            }}
          />
        </View>
      </View>
    </Surface>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (sections.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No scan history available</Text>
        <Text style={styles.emptySubtext}>
          Your scan results will appear here after you perform a scan
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.medium,
    paddingTop: Platform.OS === 'ios' ? spacing.xl + spacing.medium : spacing.large,
    paddingBottom: spacing.medium,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.text,
    
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  listContent: {
    padding: spacing.medium,
  },
  sectionHeader: {
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.small,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    
  },
  resultCard: {
    marginBottom: spacing.medium,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.medium,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.medium,
  },
  textContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    
  },
  pressureText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    
  },
  unitText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.textSecondary,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: spacing.small,
    
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.medium,
    textAlign: 'center',
    
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    
    maxWidth: '80%',
  },
});

export default HistoryScreen; 
