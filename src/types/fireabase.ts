// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7Vi3H3r9UuJCm99gq66hXb7yHVSRqA4s",
  authDomain: "designpro-5169c.firebaseapp.com",
  projectId: "designpro-5169c",
  storageBucket: "designpro-5169c.firebasestorage.app",
  messagingSenderId: "87682923615",
  appId: "1:87682923615:web:cfd236c77189e47f84afea",
  measurementId: "G-TMQFM3CCCH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);