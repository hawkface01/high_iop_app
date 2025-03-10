import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../utils/theme';
import Card from '../../components/common/Card';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.lastUpdated}>Last Updated: March 10, 2023</Text>
          
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            Thank you for choosing the High IOP Detection App. We are committed to protecting your privacy and ensuring you understand how your data is used.
          </Text>
          <Text style={styles.paragraph}>
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
          </Text>

          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Personal Information:</Text> Name, email address, date of birth, gender, and optional phone number.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Medical Information:</Text> Fundus images, scan results, and any medical history you provide.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Device Information:</Text> Device model, operating system, and app version for troubleshooting.
          </Text>

          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.bulletPoint}>• To provide and maintain our Service</Text>
          <Text style={styles.bulletPoint}>• To detect and analyze high intraocular pressure</Text>
          <Text style={styles.bulletPoint}>• To store your scan history and track changes over time</Text>
          <Text style={styles.bulletPoint}>• To improve our algorithm and application</Text>
          <Text style={styles.bulletPoint}>• To communicate with you about your account and results</Text>
          <Text style={styles.bulletPoint}>• To send important notifications about your eye health</Text>

          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures to protect your personal information:
          </Text>
          <Text style={styles.bulletPoint}>• End-to-end encryption for all user data</Text>
          <Text style={styles.bulletPoint}>• HIPAA-compliant storage practices</Text>
          <Text style={styles.bulletPoint}>• Regular security audits and updates</Text>
          <Text style={styles.bulletPoint}>• Strict access controls for all staff</Text>

          <Text style={styles.sectionTitle}>Data Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share data with:
          </Text>
          <Text style={styles.bulletPoint}>• Healthcare providers (with your explicit consent)</Text>
          <Text style={styles.bulletPoint}>• Service providers who assist in operating our app</Text>
          <Text style={styles.bulletPoint}>• Legal authorities when required by law</Text>

          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text style={styles.bulletPoint}>• Access your personal information</Text>
          <Text style={styles.bulletPoint}>• Update or correct your data</Text>
          <Text style={styles.bulletPoint}>• Delete your account and associated data</Text>
          <Text style={styles.bulletPoint}>• Opt out of communications</Text>
          <Text style={styles.bulletPoint}>• Export your data in a portable format</Text>

          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>

          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>support@example.com</Text>
          <Text style={styles.contactInfo}>1-800-123-4567</Text>
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
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
    padding: spacing.medium,
  },
  section: {
    borderRadius: 16,
    padding: spacing.large,
    marginBottom: spacing.medium,
    backgroundColor: colors.surface,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.medium,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.medium,
    marginBottom: spacing.small,
  },
  paragraph: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.medium,
  },
  bulletPoint: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.small,
    paddingLeft: spacing.small,
  },
  bold: {
    fontWeight: 'bold',
  },
  contactInfo: {
    fontSize: 16,
    color: colors.primary,
    lineHeight: 24,
    marginBottom: spacing.small,
  },
});

export default PrivacyPolicyScreen; 