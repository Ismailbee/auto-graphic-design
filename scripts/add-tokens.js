/**
 * Script to add missing tokens to a user's account
 * Run with: node scripts/add-tokens.js <userId> <tokensToAdd>
 * 
 * Or run interactively to list all users first
 */

import admin from 'firebase-admin'
import { readFileSync } from 'fs'

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./functions/serviceAccountKey.json', 'utf8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})


const db = admin.firestore()

async function listUsers() {
  console.log('\n📋 Listing all users:\n')
  const usersSnapshot = await db.collection('users').get()
  
  if (usersSnapshot.empty) {
    console.log('No users found in database.')
    return
  }
  
  usersSnapshot.forEach((doc) => {
    const user = doc.data()
    console.log(`ID: ${doc.id}`)
    console.log(`  Email: ${user.email || 'N/A'}`)
    console.log(`  Name: ${user.name || 'N/A'}`)
    console.log(`  Tokens: ${user.tokens || 0}`)
    console.log(`  Plan: ${user.plan || 'Basic'}`)
    console.log('---')
  })
}

async function addTokens(userId, tokensToAdd) {
  console.log(`\n💎 Adding ${tokensToAdd} tokens to user ${userId}...\n`)
  
  const userRef = db.collection('users').doc(userId)
  const userDoc = await userRef.get()
  
  if (!userDoc.exists) {
    console.error('❌ User not found!')
    return false
  }
  
  const userData = userDoc.data()
  const currentTokens = userData.tokens || 0
  const newTokens = currentTokens + tokensToAdd
  
  await userRef.update({
    tokens: newTokens,
    updatedAt: new Date().toISOString()
  })
  
  console.log(`✅ Success!`)
  console.log(`   Previous balance: ${currentTokens} tokens`)
  console.log(`   Added: ${tokensToAdd} tokens`)
  console.log(`   New balance: ${newTokens} tokens`)
  
  // Also record this as a transaction
  await db.collection('transactions').add({
    userId,
    type: 'manual_credit',
    amount: 300, // 300 Naira purchase
    tokensAdded: tokensToAdd,
    reason: 'Manual credit - payment verified but tokens not added automatically',
    createdAt: new Date().toISOString()
  })
  
  console.log(` Transaction recorded in database.`)
  
  return true
}

// Main execution
const args = process.argv.slice(2)

if (args.length === 0) {
  // List users if no arguments
  await listUsers()
  console.log('\nUsage: node scripts/add-tokens.js <userId> <tokensToAdd>')
  console.log('Example: node scripts/add-tokens.js abc123xyz 300')
} else if (args.length === 2) {
  const [userId, tokens] = args
  await addTokens(userId, parseInt(tokens))
}

process.exit(0)
