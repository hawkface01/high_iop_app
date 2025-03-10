import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Image, TouchableOpacity, Platform } from 'react-native';
import { TextInput, Button, Text, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store/AuthContext';
import { supabase } from '../../lib/supabase';
import { colors } from '../../utils/theme';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
}

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setName(data.name);
        setAvatar(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Get file extension
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Read file as base64
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to Uint8Array using Buffer
      const buffer = Buffer.from(base64Data, 'base64');
      const arrayBuffer = new Uint8Array(buffer);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduced quality for smaller file size
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const avatarUrl = await uploadAvatar(uri);
        setAvatar(avatarUrl);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setLoading(true);
      if (!user) throw new Error('No user logged in');

      const updates = {
        id: user.id,
        name: name.trim(),
        avatar_url: avatar,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          icon="arrow-left"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Back
        </Button>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={pickImage}
          disabled={uploading}
        >
          {avatar ? (
            <Avatar.Image
              size={100}
              source={{ uri: avatar }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={100}
              label={name.charAt(0).toUpperCase()}
              style={styles.avatar}
            />
          )}
          <View style={styles.editIconContainer}>
            <Text style={styles.editIcon}>📷</Text>
          </View>
        </TouchableOpacity>

        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
        />

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          loading={loading}
          disabled={loading || uploading}
        >
          Save Changes
        </Button>
      </View>
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginLeft: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  editIcon: {
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.background,
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
    backgroundColor: colors.primary,
  },
});

export default EditProfileScreen; 
