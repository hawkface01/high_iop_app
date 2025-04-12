import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, shadows } from "../../utils/theme";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Icon from "../../components/common/Icon";
import { useAuth } from "../../store/AuthContext";
import { supabase } from "../../lib/supabase";
import { formatDistanceToNow } from "date-fns";

interface ScanHistory {
  id: string;
  user_id: string;
  result: 'Normal' | 'High';
  pressure: number;
  created_at: string;
  image_url?: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [Profile, setProfile] = useState<Profile | null>(null);
  const [lastScan, setLastScan] = useState<ScanHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    fetchProfile();
    fetchLastScan();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLastScan = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('scan_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching last scan:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setLastScan(data[0]);
      }
    } catch (error) {
      console.error('Error fetching last scan:', error);
    }
  };

  const handleReadPaper = () => {
    // TODO: Replace with actual research paper URL
    Linking.openURL("https://example.com/research-paper");
  };

  const renderActivityCard = () => {
    if (loading) {
      return (
        <Card variant="elevated" style={styles.activityCard}>
          <Text style={styles.activityText}>Loading...</Text>
        </Card>
      );
    }

    if (error) {
      return (
        <Card variant="elevated" style={styles.activityCard}>
          <Text style={styles.activityText}>Error: {error}</Text>
          <Button
            title="Retry"
            onPress={fetchProfile}
            style={styles.retryButton}
          />
        </Card>
      );
    }

    if (!lastScan) {
      return (
        <Card variant="elevated" style={styles.activityCard}>
          <Text style={styles.activityText}>No scans yet</Text>
          <Text style={styles.activityDate}>Start your first scan now!</Text>
        </Card>
      );
    }

    return (
      <Card variant="elevated" style={styles.activityCard}>
        <Text style={styles.activityText}>Last Eye Scan</Text>
        <Text style={[styles.activityResult, { 
          color: lastScan.result === 'Normal' ? colors.success : colors.error 
        }]}>
          {lastScan.result}
        </Text>
        <Text style={styles.activityDate}>
          {formatDistanceToNow(new Date(lastScan.created_at), {
            addSuffix: true,
          })}
        </Text>
        <Button
          title="View History"
          variant="outline"
          onPress={() => navigation.navigate("History")}
          style={styles.historyButton}
        />
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>
            {getGreeting()},{" "}
            {loading ? "..." : Profile?.name?.split(" ")[0] || "User"}
          </Text>
        </View>

        {/* Recent Activity */}
        {renderActivityCard()}

        {/* Primary Action */}
        <Button
          title="Scan Now"
          onPress={() => navigation.navigate("MainTabs", { screen: "Scan" })}
          leftIcon={<Icon name="camera" size="medium" color={colors.white} />}
          style={styles.scanButton}
        />

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Card variant="elevated" style={styles.infoCard}>
            <Text style={styles.infoText}>
              This app is designed to test an innovative deep learning model
              that detects high intraocular pressure (IOP) using a fundus image
              scan of the eye.
            </Text>
            <Text style={[styles.infoText, styles.marginTop]}>
              Developed by students at MSA University, this tool aims to make
              early detection of high IOP more accessible and convenient.
            </Text>
            <Button
              title="Read the Paper"
              variant="outline"
              onPress={handleReadPaper}
              style={styles.paperButton}
            />
          </Card>

          <Card variant="elevated" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Icon
                name="information-circle"
                size="large"
                color={colors.primary}
              />
              <Text style={styles.infoTitle}>What is High IOP?</Text>
            </View>
            <Text style={styles.infoText}>
              High Intraocular Pressure (IOP) is when the fluid pressure inside
              the eye is higher than normal. It is a major risk factor for
              glaucoma, which can lead to vision loss if not treated early.
            </Text>
          </Card>

          <Card variant="elevated" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Icon name="warning" size="large" color={colors.warning} />
              <Text style={styles.infoTitle}>Warning Signs</Text>
            </View>
            <Text style={styles.infoText}>
              • Blurred vision{"\n"}• Eye pain or discomfort{"\n"}• Headaches
              {"\n"}• Halos around lights{"\n"}• Nausea or vomiting
            </Text>
          </Card>

          <Card variant="elevated" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Icon name="medkit" size="large" color={colors.error} />
              <Text style={styles.infoTitle}>Prevention Tips</Text>
            </View>
            <Text style={styles.infoText}>
              • Regular eye check-ups{"\n"}• Exercise regularly{"\n"}• Maintain
              a healthy diet{"\n"}• Limit caffeine intake{"\n"}• Protect eyes
              from injury
            </Text>
          </Card>
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
  content: {
    flex: 1,
  },
  greetingSection: {
    padding: spacing.large,
    paddingTop: spacing.xl + spacing.large,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
  },
  activityCard: {
    marginHorizontal: spacing.large,
    marginBottom: spacing.large,
    padding: spacing.medium,
  },
  activityText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  activityDate: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textSecondary,
    marginTop: spacing.tiny,
  },
  activityResult: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: spacing.small,
  },
  scanButton: {
    marginHorizontal: spacing.large,
    marginBottom: spacing.large,
    height: 56,
  },
  infoSection: {
    padding: spacing.large,
  },
  infoCard: {
    marginBottom: spacing.medium,
    padding: spacing.medium,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.medium,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginLeft: spacing.small,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.textSecondary,
    lineHeight: 24,
  },
  marginTop: {
    marginTop: spacing.medium,
  },
  paperButton: {
    marginTop: spacing.large,
  },
  retryButton: {
    marginTop: spacing.large,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.small,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: spacing.medium,
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textSecondary,
    marginBottom: spacing.large,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.medium,
  },
  sectionDescription: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.textSecondary,
    marginBottom: spacing.medium,
    lineHeight: 24,
  },
  pressureText: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.text,
    marginTop: spacing.tiny,
  },
  unitText: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textSecondary,
  },
  historyButton: {
    marginTop: spacing.medium,
    alignSelf: 'flex-end',
  },
});

export default HomeScreen;
