import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../utils/theme';
import { useAuth } from '../../store/AuthContext';

const SignupScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const navigation = useNavigation();
  const { signup, user } = useAuth();

  useEffect(() => {
    console.log('SignupScreen useEffect triggered. User:', user ? user.id : 'null');
    if (user) {
      console.log('User detected, attempting navigation to MainTabs...');
      setStatusMessage('Login successful! Redirecting...');
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  }, [user, navigation]);

  const handleSignup = async () => {
    console.log('handleSignup started (Basic Test)');
    setLoading(true);
    setStatusMessage('Button pressed! Testing UI update...');

    setTimeout(() => {
      console.log('Resetting loading state (Basic Test)');
      setLoading(false);
      setStatusMessage('Test complete.');
    }, 2000);

    /* --- Original code temporarily commented out for testing ---
    // Validate inputs
    if (!fullName || !email || !password) {
      setStatusMessage('Error: Please fill in all fields'); // UI Feedback
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setStatusMessage('Error: Password must be at least 6 characters long'); // UI Feedback
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setStatusMessage(''); // Clear previous messages
      setLoading(true);
      setStatusMessage('Creating account...'); // UI Feedback
      console.log('Attempting signup with:', email); // Log attempt
      // Call signup but don't assign the result (it's void)
      await signup(email, password, fullName);
      console.log('Signup function call completed successfully.'); // Log success
      setStatusMessage('Account created. Awaiting login confirmation...'); // UI Feedback
      // Keep loading indicator active until useEffect navigates

    } catch (error: any) {
      console.error('Signup error in handleSignup:', error); // Log error details
      const errorMessage = error.message || 'Could not create account. Please try again.';
      setStatusMessage(`Error: ${errorMessage}`); // UI Feedback with error
      Alert.alert('Signup Failed', errorMessage);
      setLoading(false); // Stop loading on error
    }
    --- End of original code --- */
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign up to continue</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            style={styles.input}
            placeholder="Enter your name"
            outlineColor={colors.disabled}
            activeOutlineColor={colors.primary}
          />

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

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            mode="outlined"
            style={styles.input}
            placeholder="Enter your password"
            outlineColor={colors.disabled}
            activeOutlineColor={colors.primary}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye-off' : 'eye'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />

          <TouchableOpacity 
            onPress={handleSignup} 
            style={[styles.button, loading && styles.buttonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.buttonLabel}>Loading...</Text>
            ) : (
              <Text style={styles.buttonLabel}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {statusMessage ? (
            <Text style={styles.statusText}>{statusMessage}</Text>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Sign in</Text>
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
    marginBottom: 16,
    backgroundColor: colors.background,
    fontSize: 16,
    height: 56,
  },
  button: {
    height: 56,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    color: colors.placeholder,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.text,
  },
  loginText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default SignupScreen; 
