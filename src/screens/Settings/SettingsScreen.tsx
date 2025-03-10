import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text, Button, List, Avatar, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/core';
import { useAuth } from '../../store/AuthContext';
import { supabase } from '../../lib/supabase';
import { colors } from '../../utils/theme';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [user])
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.profileSection}>
        {profile?.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.avatar}
          />
        ) : (
          <Avatar.Text
            size={80}
            label={profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            style={styles.avatar}
          />
        )}
        <Text style={styles.name}>{profile?.name || 'User'}</Text>
        <Text style={styles.email}>{profile?.email || user?.email}</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editButton}
        >
          Edit Profile
        </Button>
      </View>

      <Divider />

      <List.Section>
        <List.Item
          title="App Version"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
        />
        <List.Item
          title="Change Password"
          left={props => <List.Icon {...props} icon="lock" />}
          onPress={() => navigation.navigate('ChangePassword')}
        />
        <List.Item
          title="Help & Support"
          left={props => <List.Icon {...props} icon="help-circle" />}
          onPress={() => navigation.navigate('HelpSupport')}
        />
        <List.Item
          title="Privacy Policy"
          left={props => <List.Icon {...props} icon="shield-account" />}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />
        <List.Item
          title="Terms of Service"
          left={props => <List.Icon {...props} icon="file-document" />}
          onPress={() => navigation.navigate('TermsOfService')}
        />
      </List.Section>

      <View style={styles.logoutSection}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={colors.error}
        >
          Log Out
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    backgroundColor: colors.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    
  },
  email: {
    fontSize: 16,
    color: colors.placeholder,
    marginBottom: 16,
    
  },
  editButton: {
    marginTop: 8,
  },
  logoutSection: {
    padding: 16,
    marginTop: 8,
  },
  logoutButton: {
    borderColor: colors.error,
  },
});

export default SettingsScreen; 
