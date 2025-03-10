import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../utils/theme';
import { useAuth } from '../../store/AuthContext';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      Alert.alert(
        'Password Reset Email Sent',
        'Check your email for instructions to reset your password',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive reset instructions</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            placeholder="Enter your email"
            outlineColor={colors.disabled}
            activeOutlineColor={colors.primary}
          />

          <Button
            mode="contained"
            onPress={handleResetPassword}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            loading={loading}
            disabled={loading}
          >
            Send Reset Link
          </Button>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    
  },
  subtitle: {
    fontSize: 16,
    color: colors.placeholder,
    
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 24,
    backgroundColor: colors.background,
    fontSize: 16,
    height: 56,
  },
  button: {
    height: 56,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    
  },
  footer: {
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    
  },
});

export default ForgotPasswordScreen; 
