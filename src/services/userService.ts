import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/config';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  phoneNumber?: string;
  medicalHistory?: string[];
}

export interface ScanResult {
  id: string;
  userId: string;
  result: string; // 'normal' | 'high_pressure'
  pressure: number;
  date: string; // ISO string
  imagePath?: string;
  notes?: string;
}

// Create a new user profile in Firestore
export const createUserProfile = async (userData: UserProfile): Promise<void> => {
  try {
    const userRef = doc(firestore, 'users', userData.uid);
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('User profile created successfully');
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(firestore, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    } else {
      console.log('No user profile found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile in Firestore
export const updateUserProfile = async (uid: string, userData: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(firestore, 'users', uid);
    
    // Clean up the userData object by removing any undefined values
    const cleanedData: Record<string, any> = {};
    
    Object.keys(userData).forEach(key => {
      const value = userData[key as keyof Partial<UserProfile>];
      // Only include properties that are not undefined
      if (value !== undefined) {
        cleanedData[key] = value;
      }
    });
    
    // Add timestamp
    cleanedData.updatedAt = new Date().toISOString();
    
    await updateDoc(userRef, cleanedData);
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user scan history
export const getUserScanHistory = async (userId: string): Promise<ScanResult[]> => {
  try {
    const scansRef = collection(firestore, 'scans');
    const q = query(scansRef, where('userId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    const scanHistory: ScanResult[] = [];
    
    querySnapshot.forEach((doc) => {
      scanHistory.push({ id: doc.id, ...doc.data() } as ScanResult);
    });
    
    // Sort by date, newest first
    return scanHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error getting scan history:', error);
    throw error;
  }
};

// Add a new scan result
export const addScanResult = async (scanData: Omit<ScanResult, 'id'>): Promise<string> => {
  try {
    const scansRef = collection(firestore, 'scans');
    const newScanRef = doc(scansRef);
    
    await setDoc(newScanRef, {
      ...scanData,
      createdAt: new Date().toISOString()
    });
    
    console.log('Scan result added successfully');
    return newScanRef.id;
  } catch (error) {
    console.error('Error adding scan result:', error);
    throw error;
  }
}; 