import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { getFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
let app: FirebaseApp;
let storage: FirebaseStorage;
let db: Firestore;

try {
  // Log full config for debugging (without sensitive values)
  const debugConfig = {
    apiKey: firebaseConfig.apiKey ? '✓ present' : '✗ missing',
    authDomain: firebaseConfig.authDomain ? '✓ present' : '✗ missing',
    projectId: firebaseConfig.projectId ? '✓ present' : '✗ missing',
    storageBucket: firebaseConfig.storageBucket ? '✓ present' : '✗ missing',
    messagingSenderId: firebaseConfig.messagingSenderId ? '✓ present' : '✗ missing',
    appId: firebaseConfig.appId ? '✓ present' : '✗ missing',
  };
  console.log('Firebase config details:', debugConfig);
  
  if (!firebaseConfig.projectId) {
    throw new Error('Firebase Project ID is missing. Check your .env.local file.');
  }

  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  console.log('Firebase app initialized');
  
  db = getFirestore(app);
  console.log('Firestore initialized');
  
  storage = getStorage(app);
  console.log('Storage initialized');

  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
} catch (error: any) {
  console.error('Firebase initialization error:', error);
  console.error('Error details:', {
    name: error.name,
    message: error.message,
    code: error.code,
    stack: error.stack
  });
  throw error;
}

export { app, storage, db } 