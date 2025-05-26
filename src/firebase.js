// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your Firebase config (from your Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyBznxgj2tx_nVHAHP7LLmM1zbBqRFtD_PM",
  authDomain: "auto-grahic-design.firebaseapp.com",
  projectId: "auto-grahic-design",
  storageBucket: "auto-grahic-design.firebasestorage.app",
  messagingSenderId: "571103136248",
  appId: "1:571103136248:web:cb6567215760aeafcdee0d",
  measurementId: "G-9830F8LZZQ"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// (Optional) Initialize Analytics if you want to use it
const analytics = getAnalytics(app);

export { app, auth, analytics };
