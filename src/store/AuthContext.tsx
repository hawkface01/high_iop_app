import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';

// Define return types for signup function
type SignupResult = {
  success: boolean;
  needsConfirmation?: boolean;
  userExists?: boolean;
  error?: Error | null;
};

// Add a result type for the resend function
type ResendResult = {
  success: boolean;
  error?: Error | null;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<SignupResult>;
  logout: () => Promise<void>;
  updateProfile: (profile: { name: string; email?: string; photoURL?: string }) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<ResendResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<SignupResult> => {
    try {
      // --- Pre-check if user exists --- 
      console.log(`Checking database for existing email: ${email}`);
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles') // Use your actual profiles table name
        .select('email')
        .eq('email', email)
        .single(); // Use .maybeSingle() if email might not be unique or you expect multiple

      if (checkError && checkError.code !== 'PGRST116') { // Ignore 'PGRST116' (No rows found)
        console.error('Error checking for existing user:', checkError);
        Alert.alert('Signup Error', 'Failed to check existing user. Please try again.');
        return { success: false, error: new Error('Failed to check existing user.') }; 
      }

      if (existingUser) {
        console.log('Signup error: User already exists (detected by pre-check).');
        Alert.alert(
          'Signup Failed',
          'An account with this email already exists. Please log in or use a different email.',
          [{ text: 'OK' }]
        );
        return { success: false, userExists: true, error: new Error('User already exists') };
      }
      console.log('Email not found in DB, proceeding with signup.');
      // --- End of Pre-check ---

      // Now, sign up the user (only if pre-check passed)
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
           data: {
              name: name
           }
        }
      });

      if (signUpError) {
         // Check for specific Supabase error indicating user exists
         // Prioritize checking status code (e.g., 400, 422 are common for this)
         const isUserExistsError = 
           (signUpError instanceof AuthError && 
             (signUpError.status === 400 || signUpError.status === 422 || signUpError.status === 409)) ||
           (signUpError.message && 
             (signUpError.message.toLowerCase().includes("user already registered") || 
              signUpError.message.toLowerCase().includes("already exists")));

         if (isUserExistsError) {
           console.log('Signup error: User already exists (detected by status or message).');
           return { success: false, userExists: true, error: signUpError };
         }
         
         // Check for database errors (status 500)
         const isDatabaseError = 
           signUpError.status === 500 || 
           (signUpError.message && signUpError.message.includes("Database error saving new user"));
         
         if (isDatabaseError) {
           // Add more detailed logging to diagnose the exact database issue
           console.error('Database error details:', {
             status: signUpError.status,
             message: signUpError.message,
             name: signUpError.name,
             // Use optional chaining and type check for details
             details: (signUpError as any).details || 'No details available',
             stack: signUpError.stack
           });
           
           console.log('Signup error: Database issue when creating user.');
           Alert.alert(
             'Service Unavailable',
             'We\'re having trouble creating your account due to a temporary server issue. Please try again later.',
             [{ text: 'OK' }]
           );
           return { success: false, error: signUpError };
         }
         
        // If it's a different error, throw it to be caught below
        console.warn('Signup error (other):', signUpError.message, signUpError.status);
        throw signUpError;
      }

      // Check if email confirmation is required (session is null but user exists)
      if (authData.user && !authData.session) {
         console.log('Signup successful, email confirmation needed.');
         // Show alert for email verification
         Alert.alert(
           'Email Verification Required',
           'Please check your email inbox for a verification link. You need to verify your email before you can login.',
           [{ text: 'OK' }]
         );
         return { success: true, needsConfirmation: true };
      }

       // If session exists immediately (email confirmation might be disabled in Supabase settings)
      if (authData.user && authData.session) {
          console.log('Signup successful and session created.');
         // The onAuthStateChange listener WILL fire here, updating context state.
         return { success: true };
      }

      // Fallback case: Should not happen in standard Supabase email/password flow
      console.warn('Signup completed but inconsistent user/session data returned.');
      return { success: false, error: new Error('Signup completed with unexpected result.') };

    } catch (error: any) {
      console.error('Signup error caught in catch block:', error);
       // Also check status code in the catch block for robustness
       const isUserExistsError = 
           (error instanceof AuthError && 
             (error.status === 400 || error.status === 422 || error.status === 409)) ||
           (error.message && 
             (error.message.toLowerCase().includes("user already registered") || 
              error.message.toLowerCase().includes("already exists")));

       if (isUserExistsError) {
           console.log('Signup error: User already exists (detected in catch block).');
           return { success: false, userExists: true, error };
       }
       
       // Check for database errors in catch block
       const isDatabaseError = 
         (error instanceof AuthError && error.status === 500) || 
         (error.message && error.message.includes("Database error saving new user"));
       
       if (isDatabaseError) {
         // Add more detailed logging here too
         console.error('Database error details (catch block):', {
           status: error.status,
           message: error.message,
           name: error.name,
           // Use optional chaining and type check for details
           details: (error as any).details || 'No details available',
           stack: error.stack || 'No stack available'
         });
         
         console.log('Signup error: Database issue when creating user (caught in catch block).');
         Alert.alert(
           'Service Unavailable',
           'We\'re having trouble creating your account due to a temporary server issue. Please try again later.',
           [{ text: 'OK' }]
         );
         return { success: false, error };
       }
       
      // Return a generic error status for other caught errors
      console.error('Returning generic signup error from catch block.')
      return { success: false, error: error instanceof Error ? error : new Error('An unknown signup error occurred') };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const updateProfile = async (profile: { name: string; email?: string; photoURL?: string }) => {
    try {
      if (!user) throw new Error('No user logged in');

      const updates = {
        id: user.id,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.photoURL,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  // Add the resendConfirmationEmail function
  const resendConfirmationEmail = async (email: string): Promise<ResendResult> => {
    try {
      console.log(`Attempting to resend confirmation email to: ${email}`);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('Error resending confirmation email:', error);
        Alert.alert(
          'Error',
          'Unable to resend confirmation email. Please try again later.',
          [{ text: 'OK' }]
        );
        return { success: false, error };
      }

      // Success
      console.log('Confirmation email resent successfully');
      Alert.alert(
        'Email Sent',
        'A new confirmation email has been sent. Please check your inbox.',
        [{ text: 'OK' }]
      );
      return { success: true };
    } catch (error: any) {
      console.error('Unexpected error resending confirmation email:', error);
      Alert.alert(
        'Error',
        'Something went wrong while trying to resend the email. Please try again later.',
        [{ text: 'OK' }]
      );
      return { success: false, error: error instanceof Error ? error : new Error('Unknown error resending email') };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        resendConfirmationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
