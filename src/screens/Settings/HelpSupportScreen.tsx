import React from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  ParamListBase,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../utils/theme";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

const HelpSupportScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const handleCall = () => {
    Linking.openURL("tel:18001234567");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@example.com");
  };

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* FAQs Section */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              How do I take a good fundus image scan?
            </Text>
            <Text style={styles.faqAnswer}>
              Find a well-lit area, hold your device at eye level, and ensure
              your scan is centered in the frame. Keep steady and follow the
              on-screen guidelines.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What do the results mean?</Text>
            <Text style={styles.faqAnswer}>
              Your results provide an assessment of your eye health. Green
              indicates normal, yellow suggests monitoring, and red requires
              immediate attention.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              How often should I perform a scan?
            </Text>
            <Text style={styles.faqAnswer}>
              We recommend monthly scans for regular monitoring. If you notice
              any changes, perform additional scans as needed.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What is High IOP?</Text>
            <Text style={styles.faqAnswer}>
              High Intraocular Pressure (IOP) is when the fluid pressure inside
              the eye is higher than normal. It is a major risk factor for
              glaucoma, which can lead to vision loss if not treated early.
            </Text>
          </View>
        </Card>

        {/* Contact Support Section */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleCall}
            accessibilityLabel="Call support"
            accessibilityHint="Call our support team at 1-800-123-4567"
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="call" size={28} color={colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Call Support</Text>
              <Text style={styles.contactDetail}>1-800-123-4567</Text>
              <Text style={styles.contactSubDetail}>
                Available Mon-Fri, 9AM-5PM
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleEmail}
            accessibilityLabel="Email support"
            accessibilityHint="Email our support team at support@example.com"
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail" size={28} color={colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactDetail}>support@example.com</Text>
              <Text style={styles.contactSubDetail}>
                We typically respond within 24 hours
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* About Section */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            The High IOP Detection App provides a non-invasive solution for
            detection of high intraocular pressure using fundus images. Designed
            with accessibility in mind, particularly for elderly users, the app
            features a simple interface with large text and clear instructions.
          </Text>
          <Text style={styles.aboutText}>
            Developed by students at MSA University, this tool aims to make
            early detection of high IOP more accessible and convenient.
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.medium,
  },
  faqItem: {
    marginBottom: spacing.large,
  },
  faqQuestion: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.small,
  },
  faqAnswer: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  contactItem: {
    flexDirection: "row",
    marginBottom: spacing.medium,
    padding: spacing.medium,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: "center",
  },
  contactIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.medium,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 17,
    color: colors.primary,
    marginBottom: 4,
  },
  contactSubDetail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tutorialItem: {
    flexDirection: "row",
    marginBottom: spacing.medium,
    padding: spacing.medium,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: "center",
  },
  tutorialIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.medium,
  },
  tutorialInfo: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  tutorialDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  aboutText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.medium,
  },
  versionText: {
    fontSize: 14,
    color: colors.placeholder,
    textAlign: "center",
    marginTop: spacing.medium,
  },
});

export default HelpSupportScreen;
