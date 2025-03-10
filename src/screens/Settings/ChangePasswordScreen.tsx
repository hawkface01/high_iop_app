import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, ScrollView, Alert, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../utils/theme';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { supabase } from '../../lib/supabase';

const ChangePasswordScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validatePassword = (password: string): boolean => {
    // Password should be at least 8 characters, include a number and a special character
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasMinLength && hasNumber && hasSpecialChar;
  };

  const handleChangePassword = async () => {
    try {
      setErrorMessage('');
      setLoading(true);

      // Validate inputs
      if (!currentPassword || !newPassword || !confirmPassword) {
        setErrorMessage('All fields are required');
        return;
      }

      if (newPassword !== confirmPassword) {
        setErrorMessage('New passwords do not match');
        return;
      }

      if (!validatePassword(newPassword)) {
        setErrorMessage(
          'Password must be at least 8 characters and include at least one number and one special character'
        );
        return;
      }

      // Get current user email
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email;
      
      if (!userEmail) {
        setErrorMessage('Unable to retrieve user information');
        return;
      }

      // First sign in with the current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        console.error('Error verifying current password:', signInError);
        setErrorMessage('Current password is incorrect');
        return;
      }

      // Now update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        setErrorMessage(updateError.message);
        return;
      }

      Alert.alert(
        'Success',
        'Your password has been changed successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Change password error:', error);
      setErrorMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.sectionTitle}>Update Your Password</Text>
          <Text style={styles.description}>
            Your password must be at least 8 characters long and include at least one number and one special character.
          </Text>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              right={
                <TextInput.Icon
                  icon={showCurrentPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              }
              accessibilityLabel="Current password input field"
              accessibilityHint="Enter your current password"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              right={
                <TextInput.Icon
                  icon={showNewPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                />
              }
              accessibilityLabel="New password input field"
              accessibilityHint="Enter your new password"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              accessibilityLabel="Confirm new password input field"
              accessibilityHint="Reenter your new password to confirm"
            />
          </View>

          <Button
            title="Update Password"
            onPress={handleChangePassword}
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            style={styles.button}
            loading={loading}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
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
  card: {
    borderRadius: 16,
    padding: spacing.large,
    marginBottom: spacing.medium,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.small,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.large,
  },
  inputContainer: {
    marginBottom: spacing.medium,
  },
  input: {
    backgroundColor: colors.surface,
    fontSize: 16,
  },
  button: {
    marginTop: spacing.medium,
  },
  errorContainer: {
    backgroundColor: colors.error + '15',
    padding: spacing.medium,
    borderRadius: 8,
    marginBottom: spacing.medium,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
});

export default ChangePasswordScreen; 