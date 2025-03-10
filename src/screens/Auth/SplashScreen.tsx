import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { colors } from '../../utils/theme';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';

const SplashScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>EyeCare</Text>
      <Text style={styles.subtitle}>Early Detection for Healthy Vision</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonLabel}
          onPress={() => navigation.navigate('Login')}
        >
          Login
        </Button>
        
        <Button
          mode="outlined"
          style={[styles.button, styles.signupButton]}
          labelStyle={styles.signupButtonLabel}
          onPress={() => navigation.navigate('Signup')}
        >
          Sign Up
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0FE', // Light grayish-blue
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: 20,
  },
  button: {
    marginVertical: 10,
    height: 50,
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    
  },
  signupButton: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  signupButtonLabel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    
  },
});

export default SplashScreen; 
