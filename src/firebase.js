// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBznxgj2tx_nVHAHP7LLmM1zbBqRFtD_PM",
  authDomain: "auto-grahic-design.firebaseapp.com",
  projectId: "auto-grahic-design",
  storageBucket: "auto-grahic-design.appspot.com",
  messagingSenderId: "571103136248",
  appId: "1:571103136248:web:cb6567215760aeafcdee0d",
  measurementId: "G-9830F8LZZQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics;

// Only initialize analytics in the browser
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Export services
export { 
  app, 
  auth, 
  analytics, 
  db, 
  storage 
};