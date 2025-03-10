declare module '../firebase/config' {
  import { Auth } from 'firebase/auth';
  import { Firestore } from 'firebase/firestore';
  import { Storage as FirebaseStorage } from 'firebase/storage';

  export const auth: Auth;
  export const firestore: Firestore;
  export const storage: FirebaseStorage;
} 