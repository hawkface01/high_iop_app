import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../../utils/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../store/AuthContext';

const CheckEmailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { resendConfirmationEmail } = useAuth();
  
  // State to track the email and loading state
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Try to extract email from route params if available
  useEffect(() => {
    // @ts-ignore - We're ignoring type checking for the route.params
    const routeEmail = route.params?.email;
    if (routeEmail) {
      setEmail(routeEmail);
    }
  }, [route.params]);

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  const handleResendEmail = async () => {
    if (!email.trim()) {
      return; // Don't proceed if email is empty
    }
    
    setLoading(true);
    try {
      await resendConfirmationEmail(email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.message}>
          We've sent a confirmation link to your email address. Please click the link in the email to activate your account.
        </Text>
        <Text style={styles.spamMessage}>
          (Don't forget to check your spam folder!)
        </Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.resendText}>
          If you didn't receive the email or it expired, you can request a new one:
        </Text>
        
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.emailInput}
          placeholderTextColor={colors.placeholder}
        />
        
        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.resendButton]} 
            onPress={handleResendEmail}
            disabled={!email.trim()}
          >
            <Text style={styles.buttonLabel}>Resend Confirmation Email</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.loginButton]} 
          onPress={handleGoToLogin}
        >
          <Text style={styles.buttonLabel}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.text,
  },
  message: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 24,
    color: colors.text,
  },
  spamMessage: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    color: colors.placeholder,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '80%',
    marginVertical: 20,
  },
  resendText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.text,
  },
  emailInput: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  resendButton: {
    backgroundColor: colors.success || '#4CAF50',
  },
  loginButton: {
    backgroundColor: colors.primary,
    marginTop: 10,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 15,
  },
});

export default CheckEmailScreen; 