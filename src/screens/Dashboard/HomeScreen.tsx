import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Card, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../utils/theme';

const HomeScreen = () => {
  const navigation = useNavigation();
  const userName = 'John'; // This would come from user profile

  const handleScanPress = () => {
    navigation.navigate('Scan');
  };

  const handleReadPaper = () => {
    // Open research paper link
    console.log('Opening research paper');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning, {userName}</Text>
        </View>

        <Surface style={styles.recentActivity}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Recent Activity</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="eye-outline" size={24} color={colors.primary} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Eye scan completed</Text>
              <Text style={styles.activityDate}>2 days ago</Text>
            </View>
          </View>
        </Surface>

        <Button
          mode="contained"
          onPress={handleScanPress}
          style={styles.scanButton}
          labelStyle={styles.scanButtonText}
          icon={({ size, color }) => (
            <Ionicons name="camera" size={size} color={color} />
          )}
        >
          Scan Now
        </Button>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>About This App</Text>
            <Text style={styles.infoText}>
              This app is designed to test an innovative deep learning model that detects high intraocular pressure (IOP) using a fundus image scan of the eye.
            </Text>
            <Text style={styles.infoText}>
              Developed by students at MSA University, this tool aims to make early detection of high IOP more accessible and convenient.
            </Text>
            <TouchableOpacity onPress={handleReadPaper} style={styles.paperLink}>
              <Text style={styles.paperLinkText}>
                Read the Paper
              </Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </Card.Content>
        </Card>
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
  },
  header: {
    marginTop: 40,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: spacing.medium,
  },
  recentActivity: {
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  activityHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.small,
  },
  activityContent: {
    marginLeft: 12,
  },
  activityText: {
    fontSize: 16,
    color: colors.text,
  },
  activityDate: {
    fontSize: 14,
    color: colors.placeholder,
    marginTop: 4,
  },
  scanButton: {
    backgroundColor: colors.scanButton,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.large,
    ...shadows.medium,
  },
  scanButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 12,
  },
  paperLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  paperLinkText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    ...shadows.small,
  },
});

export default HomeScreen; 