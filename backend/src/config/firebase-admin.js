// Firebase Admin SDK Configuration
// This file initializes Firebase Admin for backend token verification

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Service account credentials should be stored securely in environment variables
// Never commit service account JSON files to version control

let firebaseApp;

try {
  // Option 1: Using service account JSON file (for local development)
  // Download from Firebase Console > Project Settings > Service Accounts
  // Store outside of public directories
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'divtrack-6a09d'
    });
  } 
  // Option 2: Using individual environment variables (recommended for production)
  else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }
  // Option 3: Auto-detect credentials (works in Google Cloud environments)
  else {
    firebaseApp = admin.initializeApp({
      projectId: 'divtrack-6a09d'
    });
  }
  
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  throw error;
}

module.exports = {
  admin,
  firebaseApp
};
