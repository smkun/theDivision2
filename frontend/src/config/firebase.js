// Firebase Client SDK Configuration
// This file initializes Firebase Authentication for the frontend

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSqLD2vxKHMXAF6u5PJPQL8j6InK51OMc",
  authDomain: "divtrack-6a09d.firebaseapp.com",
  projectId: "divtrack-6a09d",
  storageBucket: "divtrack-6a09d.firebasestorage.app",
  messagingSenderId: "724643843704",
  appId: "1:724643843704:web:f19b41fe820db14f73a78d",
  measurementId: "G-YX5GK4WW6B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Analytics (optional, can be disabled if not needed)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
