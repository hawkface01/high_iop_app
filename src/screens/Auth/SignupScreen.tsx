import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../utils/theme';
import { useAuth } from '../../store/AuthContext';

const SignupScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { signup, user } = useAuth();

  // Auto navigate when user is authenticated
  useEffect(() => {
    if (user) {
      console.log('User is authenticated after signup, navigating to Main screen');
      // Navigate to the main screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [user, navigation]);

  const handleSignup = async () => {
    // Validate inputs
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting signup with:', email);
      const newUser = await signup(email, password, fullName);
      console.log('Signup successful:', newUser?.email);
      
      // Navigation will happen in the useEffect above when user state updates
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Could not create account. Please try again.');
      console.error('Signup error:', error);
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

          <Button
            mode="contained"
            onPress={handleSignup}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            loading={loading}
            disabled={loading}
          >
            Sign Up
          </Button>
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
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    
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
