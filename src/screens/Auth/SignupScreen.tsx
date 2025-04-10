import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, ActivityIndicator, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../utils/theme';
import { useAuth } from '../../store/AuthContext';
// Import navigation prop type - adjust if needed based on your navigator
// import type { StackNavigationProp } from '@react-navigation/stack'; 

// Adjust ParamList based on your actual Auth Navigator
// type AuthStackParamList = {
//   Login: undefined;
//   Signup: undefined;
//   CheckEmail: undefined;
// };

// Temporarily using any for navigation prop type due to import issues
// type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;
type SignupScreenNavigationProp = any; // Use any temporarily

const SignupScreen = () => {
  console.log("[UI] SignupScreen functional component body executing.");
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { signup, user } = useAuth();
  const theme = useTheme();

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
    console.log("[UI] handleSignup function entered!");
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      console.log("[UI] Calling signup context function with:", { email: '***', name: fullName });
      const result = await signup(email, password, fullName);
      console.log("[UI] Received result from signup context:", JSON.stringify(result));

      if (result.success && result.needsConfirmation) {
        console.log("[UI] Condition met: success && needsConfirmation");
        navigation.navigate('CheckEmail', { email });
      } else if (result.userExists) {
        console.log("[UI] Condition met: userExists. Showing alert...");
        Alert.alert(
          'Signup Failed',
          'An account with this email already exists. Please log in or use a different email.',
          [{ text: 'OK' }]
        );
      } else if (!result.success && result.error) {
        console.log("[UI] Condition met: !success && error");
        Alert.alert('Signup Failed', result.error?.message || 'An unknown error occurred.');
      } else if (result.success) {
        console.log("[UI] Condition met: success (no confirmation needed)");
      } else {
        console.log("[UI] No standard condition met. Result was:", JSON.stringify(result));
      }

    } catch (error) {
      console.error("[UI] Unexpected error in handleSignup catch block:", error);
      Alert.alert('Signup Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- Restore KeyboardAvoidingView and ScrollView ---
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Optional: Adjust offset if needed
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled' // <<< Add this prop
        showsVerticalScrollIndicator={false} // Optional: Hide scrollbar
      >
    {/* --- Remove the temporary simple View --- */}
    {/* <View style={[styles.container, styles.scrollContent]}> */}
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

          {/* Correctly log loading state within JSX */}
          {((): null => { 
              console.log("[UI] Rendering button/loader. Loading state:", loading); 
              return null; 
          })()}
          {loading ? (
            <ActivityIndicator animating={true} color={theme.colors.primary} size="large" style={styles.loader} />
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                console.log("[UI] Sign Up TouchableOpacity Pressed!"); 
                handleSignup();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonLabel}>Sign Up</Text>
            </TouchableOpacity>
          )}

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
     {/* </View> */}
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
    alignItems: 'center',
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
    color: '#FFFFFF',
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
  loader: {
    marginTop: 20,
  },
});

export default SignupScreen; 
