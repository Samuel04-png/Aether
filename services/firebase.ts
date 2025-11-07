import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let analytics: any;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  
  // Initialize Analytics only in client-side and if measurementId exists
  if (typeof window !== 'undefined' && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  }
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore - use default database
// IMPORTANT: You MUST create a default database named '(default)' in Firebase Console
// The web SDK requires a default database - custom databases like 'aetherdb' won't work
// Go to: https://console.firebase.google.com/project/aether-db171/firestore
// Click "Create database" and name it "(default)"
export const db = getFirestore(app);
export const storage = getStorage(app);
export { analytics };

// Verify Firebase configuration and log connection status
if (typeof window !== 'undefined') {
  // Check if all required environment variables are set
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];
  
  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.error('❌ Missing Firebase environment variables:', missingVars);
    console.error('⚠️ Please create a .env file with all required Firebase configuration values.');
    console.error('⚠️ See env.template for the required variables.');
  } else {
    console.log('✅ Firebase configuration loaded:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      database: '(default) - REQUIRED for web SDK',
    });
  }
  
  // Log database connection reminder
  console.log('📝 Database: Using default Firestore database named "(default)"');
  console.log('📝 Make sure you have created the "(default)" database in Firebase Console');
  console.log('📝 Go to: https://console.firebase.google.com/project/' + firebaseConfig.projectId + '/firestore');
}

export default app;