import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Get credentials from expo-constants (loaded from .env via app.config.js)
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

// Validate that credentials are set
if (!supabaseUrl) {
  console.error('Supabase URL is not set in environment variables.');
  // Alert.alert('Config Error', 'Supabase URL is not configured. Please check environment variables.');
}

if (!supabaseAnonKey) {
  console.error('Supabase Anon Key is not set in environment variables.');
  // Alert.alert('Config Error', 'Supabase Anon Key is not configured. Please check environment variables.');
}

// Expo SecureStore adapter for Supabase Auth
// See: https://supabase.com/docs/guides/getting-started/tutorials/with-react-native#initialize-a-supabase-client-with-localstorage
class SupabaseStorageAdapter {
  getItem(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  }
  setItem(key: string, value: string): Promise<void> {
    return SecureStore.setItemAsync(key, value);
  }
  removeItem(key: string): Promise<void> {
    return SecureStore.deleteItemAsync(key);
  }
}

// Initialize Supabase only if credentials are valid
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new SupabaseStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for React Native
  },
}) : null; // Set to null or handle error appropriately if keys are missing

// Optional: Export the keys themselves if needed elsewhere, though importing `supabase` is preferred
export { supabaseUrl, supabaseAnonKey }; 