import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../utils/theme';
import Card from '../../components/common/Card';

const TermsOfServiceScreen = () => {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.lastUpdated}>Last Updated: March 10, 2023</Text>
          
          <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using the High IOP Detection App, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
          </Text>

          <Text style={styles.sectionTitle}>Medical Disclaimer</Text>
          <Text style={styles.paragraph}>
            The High IOP Detection App is designed to be a screening tool only and is not intended to replace professional medical advice, diagnosis, or treatment.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Always seek the advice of your ophthalmologist or other qualified healthcare provider</Text> with any questions you may have regarding a medical condition or treatment and before undertaking a new healthcare regimen.
          </Text>
          <Text style={styles.paragraph}>
            The app's scan results are not a definitive diagnosis. High intraocular pressure detection requires proper clinical evaluation by a healthcare professional.
          </Text>

          <Text style={styles.sectionTitle}>User Accounts</Text>
          <Text style={styles.paragraph}>
            To use certain features of the app, you must register for an account. You must provide accurate and complete information and keep your account information updated.
          </Text>
          <Text style={styles.paragraph}>
            You are responsible for safeguarding the password and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
          </Text>

          <Text style={styles.sectionTitle}>User Responsibilities</Text>
          <Text style={styles.paragraph}>
            As a user of the High IOP Detection App, you agree to:
          </Text>
          <Text style={styles.bulletPoint}>• Follow all instructions for proper use of the app</Text>
          <Text style={styles.bulletPoint}>• Take clear fundus images as directed</Text>
          <Text style={styles.bulletPoint}>• Not rely solely on the app for medical decisions</Text>
          <Text style={styles.bulletPoint}>• Seek prompt medical attention when advised</Text>
          <Text style={styles.bulletPoint}>• Not share your account credentials with others</Text>
          <Text style={styles.bulletPoint}>• Not use the app for any illegal purpose</Text>

          <Text style={styles.sectionTitle}>Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The app and its original content, features, and functionality are owned by the High IOP Detection App Team and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </Text>

          <Text style={styles.sectionTitle}>Data Usage and Privacy</Text>
          <Text style={styles.paragraph}>
            Your use of the app is also governed by our Privacy Policy, which is incorporated into these Terms of Service by reference. Please review our Privacy Policy for information on how we collect, use, and share your data.
          </Text>

          <Text style={styles.sectionTitle}>Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the maximum extent permitted by law, the High IOP Detection App Team shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the service.
          </Text>

          <Text style={styles.sectionTitle}>Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time. We will provide notice of significant changes by updating the "Last Updated" date at the top of this page.
          </Text>
          <Text style={styles.paragraph}>
            Your continued use of the app after any changes constitutes your acceptance of the new Terms of Service.
          </Text>

          <Text style={styles.sectionTitle}>Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
          </Text>

          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms of Service, please contact us at:
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

export default TermsOfServiceScreen; 