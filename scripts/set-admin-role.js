/**
 * Script to set user role to admin in Firestore
 * 
 * Usage:
 * 1. Make sure you're logged in to the app first
 * 2. Run: node set-admin-role.js YOUR_EMAIL@example.com
 * 
 * Or use the browser console method:
 * 1. Login to your app at http://localhost:8100
 * 2. Open browser console (F12)
 * 3. Run this code:
 * 
 *    import { db, doc, updateDoc } from './src/config/firebase'
 *    import { getAuth } from 'firebase/auth'
 *    
 *    const auth = getAuth()
 *    const userId = auth.currentUser?.uid
 *    if (userId) {
 *      await updateDoc(doc(db, 'users', userId), { role: 'admin' })
 *      console.log('✅ Role updated to admin!')
 *      window.location.reload()
 *    }
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// Go to: Project Settings > Service Accounts > Generate New Private Key

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('✅ Firebase Admin initialized');

  const db = admin.firestore();

  // Get email from command line argument
  const userEmail = process.argv[2];

  if (!userEmail) {
    console.log('❌ Please provide user email as argument');
    console.log('Usage: node set-admin-role.js YOUR_EMAIL@example.com');
    process.exit(1);
  }

  // Find user by email and update role
  async function setAdminRole(email) {
    try {
      // Get user from Firebase Auth
      const userRecord = await admin.auth().getUserByEmail(email);
      console.log('✅ Found user:', userRecord.email);
      console.log('   User ID:', userRecord.uid);

      // Update user document in Firestore
      await db.collection('users').doc(userRecord.uid).update({
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('✅ Role updated to admin!');
      console.log('   Please logout and login again to see changes');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  setAdminRole(userEmail);

} catch (error) {
  console.error('❌ Could not load service account key');
  console.error('   Please download your Firebase service account key from:');
  console.error('   Firebase Console > Project Settings > Service Accounts > Generate New Private Key');
  console.error('   Save it as: firebase-service-account.json');
  console.log('\n');
  console.log('=== ALTERNATIVE METHOD (EASIER) ===');
  console.log('Use browser console instead:');
  console.log('1. Login to your app at http://localhost:8100');
  console.log('2. Open browser console (F12)');
  console.log('3. Paste and run this code:');
  console.log('\n');
  console.log(`
// Import Firebase modules
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Get current user
const auth = getAuth()
const db = getFirestore()
const userId = auth.currentUser?.uid

if (userId) {
  // Update role to admin
  await updateDoc(doc(db, 'users', userId), { 
    role: 'admin',
    updatedAt: new Date()
  })
  console.log('✅ Role updated to admin! Reloading page...')
  setTimeout(() => window.location.reload(), 1000)
} else {
  console.log('❌ Please login first')
}
  `);
  process.exit(1);
}
