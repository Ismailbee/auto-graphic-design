/**
 * Firebase Cloud Functions for SmartDesignPro
 * Handles Paystack payment verification and webhooks
 * 
 * FREE TIER LIMITS:
 * - 2M invocations/month
 * - 400K GB-seconds/month
 * - 200K CPU-seconds/month
 */

import { onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { defineBoolean, defineSecret, defineString } from 'firebase-functions/params'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import fetch from 'node-fetch'

// Initialize Firebase Admin
initializeApp()
const db = getFirestore()

// ============================================================================
// RAILWAY NLP (spaCy) PROXY CONFIGURATION
// ============================================================================

// Prefer Firebase Params/Secrets. Fall back to process.env for local/dev.
const RAILWAY_NLP_BASE_URL = defineString('RAILWAY_NLP_BASE_URL')
const RAILWAY_NLP_API_KEY = defineSecret('RAILWAY_NLP_API_KEY')
const NLP_REQUIRE_AUTH = defineBoolean('NLP_REQUIRE_AUTH')

const PAYSTACK_SECRET_KEY = defineSecret('PAYSTACK_SECRET_KEY')

function getEnv(name, fallback = '') {
  const v = process.env[name]
  return (v ?? fallback).toString().trim()
}

function truthyEnv(name, fallback = 'false') {
  const v = getEnv(name, fallback).toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}

async function maybeVerifyFirebaseAuth(req) {
  // Param value takes precedence, then env fallback
  let requireAuth
  if (typeof NLP_REQUIRE_AUTH.value === 'function') {
    const v = NLP_REQUIRE_AUTH.value()
    if (typeof v === 'boolean') {
      requireAuth = v
    } else if (typeof v === 'string') {
      requireAuth = ['1', 'true', 'yes'].includes(v.toLowerCase())
    }
  }
  if (typeof requireAuth !== 'boolean') {
    requireAuth = truthyEnv('NLP_REQUIRE_AUTH', 'true')
  }

  if (!requireAuth) return null

  const authHeader = req.get('authorization') || ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    throw Object.assign(new Error('Missing Authorization Bearer token'), { statusCode: 401 })
  }

  const token = match[1]
  try {
    return await getAuth().verifyIdToken(token)
  } catch (e) {
    logger.warn('NLP proxy auth failed', e)
    throw Object.assign(new Error('Invalid auth token'), { statusCode: 401 })
  }
}

function joinUrl(baseUrl, path) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const p = path.startsWith('/') ? path.slice(1) : path
  return new URL(p, base).toString()
}

// ============================================================================
// PAYSTACK CONFIGURATION
// ============================================================================

const PAYSTACK_API_URL = 'https://api.paystack.co'

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const health = onRequest(
  {
    cors: true
  },
  (req, res) => {
    res.json({
      status: 'ok',
      service: 'SmartDesignPro Cloud Functions',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    })
  }
)

// ============================================================================
// NLP EXTRACT (Proxy to Railway spaCy)
// ============================================================================

export const extractWeddingEntities = onRequest(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
    secrets: [RAILWAY_NLP_API_KEY]
  },
  async (req, res) => {
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).send('')
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
      await maybeVerifyFirebaseAuth(req)

      const baseFromParam = (typeof RAILWAY_NLP_BASE_URL.value === 'function')
        ? (RAILWAY_NLP_BASE_URL.value() || '').trim()
        : ''

      const railwayBaseUrl = baseFromParam || getEnv('RAILWAY_NLP_BASE_URL')

      // Secret takes precedence, then env fallback for local/dev
      const railwayApiKey = (typeof RAILWAY_NLP_API_KEY.value === 'function')
        ? (RAILWAY_NLP_API_KEY.value() || '').trim()
        : getEnv('RAILWAY_NLP_API_KEY')

      if (!railwayBaseUrl) {
        return res.status(500).json({ error: 'Missing RAILWAY_NLP_BASE_URL' })
      }

      const text = (req.body?.text ?? '').toString()
      if (!text.trim()) {
        return res.status(400).json({ error: 'text is required' })
      }

      const url = joinUrl(railwayBaseUrl, '/extract')

      const railwayResp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(railwayApiKey ? { 'x-api-key': railwayApiKey } : {})
        },
        body: JSON.stringify({ text })
      })

      const raw = await railwayResp.text()
      let parsed
      try {
        parsed = raw ? JSON.parse(raw) : null
      } catch {
        parsed = { raw }
      }

      if (!railwayResp.ok) {
        logger.warn('Railway NLP error', { status: railwayResp.status, body: parsed })
        return res.status(502).json({ error: 'NLP service failed', details: parsed })
      }

      return res.json(parsed)
    } catch (err) {
      const status = err?.statusCode || 500
      logger.error('extractWeddingEntities failed', err)
      return res.status(status).json({ error: err?.message || 'Internal error' })
    }
  }
)

// ============================================================================
// INITIALIZE PAYMENT
// ============================================================================

export const initializePayment = onRequest(
  {
    cors: true,
    secrets: [PAYSTACK_SECRET_KEY]
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
      const { email, amount, userId, type, tokens, plan, planId } = req.body
      const paystackSecretKey = (typeof PAYSTACK_SECRET_KEY.value === 'function')
        ? PAYSTACK_SECRET_KEY.value()
        : process.env.PAYSTACK_SECRET_KEY

      // Construct metadata
      const metadata = {
        userId,
        type,
        tokens,
        plan,
        planId,
        custom_fields: [
          {
            display_name: "User ID",
            variable_name: "user_id",
            value: userId
          },
          {
            display_name: "Type",
            variable_name: "type",
            value: type
          }
        ]
      }

      const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Convert to kobo
          metadata
        })
      })

      const data = await response.json()
      
      if (!data.status) {
        logger.error('Paystack initialization failed:', data)
        return res.status(400).json({ error: data.message || 'Payment initialization failed' })
      }

      return res.json(data.data)
    } catch (error) {
      logger.error('Error initializing payment:', error)
      return res.status(500).json({ error: 'Failed to initialize payment' })
    }
  }
)

// ============================================================================
// VERIFY PAYSTACK PAYMENT
// ============================================================================

export const verifyPayment = onRequest(
  { 
    cors: true,
    secrets: [PAYSTACK_SECRET_KEY]
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      })
    }

    try {
      const { reference } = req.body
      const paystackSecretKey = (typeof PAYSTACK_SECRET_KEY.value === 'function')
        ? PAYSTACK_SECRET_KEY.value()
        : process.env.PAYSTACK_SECRET_KEY

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: 'Payment reference is required'
        })
      }

      logger.info('Verifying payment:', { reference })

      // Verify payment with Paystack
      const paystackResponse = await fetch(
        `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const paystackData = await paystackResponse.json()

      if (!paystackData.status) {
        logger.error('Paystack verification failed:', paystackData)
        return res.status(400).json({
          success: false,
          message: paystackData.message || 'Payment verification failed'
        })
      }

      const paymentData = paystackData.data

      // Check if payment was successful
      if (paymentData.status !== 'success') {
        return res.status(400).json({
          success: false,
          message: 'Payment was not successful'
        })
      }

      // Return payment details
      const payment = {
        reference: paymentData.reference,
        amount: paymentData.amount / 100,
        currency: paymentData.currency,
        email: paymentData.customer.email,
        status: paymentData.status,
        paidAt: paymentData.paid_at,
        channel: paymentData.channel,
        metadata: paymentData.metadata || {}
      }

      logger.info('Payment verified successfully:', { reference })

      // UPDATE USER TOKENS IN DATABASE AFTER SUCCESSFUL PAYMENT
      const metadata = paymentData.metadata || {}
      const userId = metadata.userId

      if (userId) {
        const userRef = db.collection('users').doc(userId)
        
        // Check if transaction already recorded to prevent double crediting
        const txSnapshot = await db.collection('transactions').where('reference', '==', reference).get()
        
        if (txSnapshot.empty) {
          // Record transaction
          await db.collection('transactions').add({
            reference,
            userId,
            amount: paymentData.amount / 100,
            type: metadata.type || 'purchase',
            status: 'success',
            createdAt: new Date().toISOString(),
            metadata
          })

          // Update user balance for token purchase
          if (metadata.type === 'token_purchase' && metadata.tokens) {
            const tokensToAdd = parseInt(metadata.tokens)
            await db.runTransaction(async (t) => {
              const doc = await t.get(userRef)
              if (!doc.exists) {
                logger.warn('User not found for token update:', userId)
                return
              }
              const currentTokens = doc.data().tokens || 0
              t.update(userRef, { 
                tokens: currentTokens + tokensToAdd,
                updatedAt: new Date().toISOString()
              })
              logger.info(`Tokens updated for user ${userId}: ${currentTokens} + ${tokensToAdd} = ${currentTokens + tokensToAdd}`)
            })
          }
          
          // Handle plan upgrade
          if (metadata.type === 'plan_upgrade' && metadata.plan) {
            const expiryDate = new Date()
            expiryDate.setMonth(expiryDate.getMonth() + 1)
            
            await userRef.update({
              plan: metadata.plan,
              planExpiry: expiryDate.toISOString(),
              updatedAt: new Date().toISOString()
            })
            logger.info(`Plan upgraded for user ${userId}: ${metadata.plan}`)
          }
        } else {
          logger.info('Transaction already processed, skipping duplicate:', reference)
        }
      }

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        data: payment
      })

    } catch (error) {
      logger.error('Payment verification error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      })
    }
  }
)

// ============================================================================
// PAYSTACK WEBHOOK
// ============================================================================

export const paystackWebhook = onRequest(
  {
    cors: true
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method not allowed')
    }

    try {
      const event = req.body
      logger.info('Webhook received:', { event: event.event })

      // Handle different webhook events
      switch (event.event) {
        case 'charge.success':
          logger.info('Successful payment:', event.data.reference)
          break

        case 'subscription.create':
          logger.info('Subscription created:', event.data)
          break

        case 'subscription.disable':
          logger.info('Subscription disabled:', event.data)
          break

        default:
          logger.info('Unhandled webhook event:', event.event)
      }

      res.status(200).send('Webhook processed')

    } catch (error) {
      logger.error('Webhook error:', error)
      res.status(500).send('Webhook processing failed')
    }
  }
)

// ============================================================================
// USER API - Get user data
// ============================================================================

export const api = onRequest(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
    secrets: [PAYSTACK_SECRET_KEY]
  },
  async (req, res) => {
    const path = req.path.replace('/api', '')
    
    // ========================================================================
    // PAYMENT ROUTES
    // ========================================================================

    // POST /api/payments/initialize
    if (req.method === 'POST' && path === '/payments/initialize') {
      try {
        const { email, amount, userId, type, tokens, plan, planId } = req.body
        const paystackSecretKey = (typeof PAYSTACK_SECRET_KEY.value === 'function')
          ? PAYSTACK_SECRET_KEY.value()
          : process.env.PAYSTACK_SECRET_KEY

        // Construct metadata
        const metadata = {
          userId,
          type,
          tokens,
          plan,
          planId,
          custom_fields: [
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: userId
            },
            {
              display_name: "Type",
              variable_name: "type",
              value: type
            }
          ]
        }

        const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            amount: amount * 100, // Convert to kobo
            metadata,
            callback_url: `${req.protocol}://${req.get('host')}/api/payments/callback` // Optional
          })
        })

        const data = await response.json()
        
        if (!data.status) {
          logger.error('Paystack initialization failed:', data)
          return res.status(400).json({ error: data.message || 'Payment initialization failed' })
        }

        return res.json(data.data)
      } catch (error) {
        logger.error('Error initializing payment:', error)
        return res.status(500).json({ error: 'Failed to initialize payment' })
      }
    }

    // GET /api/payments/verify/:reference
    if (req.method === 'GET' && path.startsWith('/payments/verify/')) {
      const reference = path.split('/')[3]
      const paystackSecretKey = (typeof PAYSTACK_SECRET_KEY.value === 'function')
        ? PAYSTACK_SECRET_KEY.value()
        : process.env.PAYSTACK_SECRET_KEY

      try {
        const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`
          }
        })

        const data = await response.json()

        if (!data.status || data.data.status !== 'success') {
          return res.status(400).json({ error: 'Payment verification failed' })
        }

        const paymentData = data.data
        const metadata = paymentData.metadata || {}
        const userId = metadata.userId

        // Update user tokens/plan if successful and not already processed
        if (userId) {
             const userRef = db.collection('users').doc(userId)
             
             // Check if transaction already recorded to prevent double crediting
             const txSnapshot = await db.collection('transactions').where('reference', '==', reference).get()
             
             if (txSnapshot.empty) {
                 // Record transaction
                 await db.collection('transactions').add({
                     reference,
                     userId,
                     amount: paymentData.amount / 100,
                     type: metadata.type || 'purchase',
                     status: 'success',
                     createdAt: new Date().toISOString(),
                     metadata
                 })

                 // Update user balance for token purchase
                 if (metadata.type === 'token_purchase' && metadata.tokens) {
                     const tokensToAdd = parseInt(metadata.tokens)
                     await db.runTransaction(async (t) => {
                         const doc = await t.get(userRef)
                         if (!doc.exists) return
                         const currentTokens = doc.data().tokens || 0
                         t.update(userRef, { 
                             tokens: currentTokens + tokensToAdd,
                             updatedAt: new Date().toISOString()
                         })
                     })
                 }
                 
                 // Handle plan upgrade
                 if (metadata.type === 'plan_upgrade' && metadata.plan) {
                     const expiryDate = new Date()
                     // Default to 1 month if not specified
                     expiryDate.setMonth(expiryDate.getMonth() + 1)
                     
                     await userRef.update({
                         plan: metadata.plan,
                         planExpiry: expiryDate.toISOString(),
                         updatedAt: new Date().toISOString()
                     })
                 }
             }
        }

        return res.json({ success: true, data: paymentData })

      } catch (error) {
        logger.error('Error verifying payment:', error)
        return res.status(500).json({ error: 'Failed to verify payment' })
      }
    }

    // GET /api/users/:userId
    if (req.method === 'GET' && path.startsWith('/users/')) {
      const userId = path.split('/')[2]
      const { email, name } = req.query
      
      try {
        // Get user from Firestore
        const userDoc = await db.collection('users').doc(userId).get()
        
        if (!userDoc.exists) {
          // Create new user with referral code and FREE STARTER TOKENS
          const newUser = {
            id: userId,
            email: email || '',
            name: name || 'User',
            tokens: 100, // FREE starting tokens for new users!
            plan: 'Basic',
            totalDesignsGenerated: 0,
            referralCode: generateReferralCode(userId),
            totalReferrals: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          await db.collection('users').doc(userId).set(newUser)
          return res.json(newUser)
        }
        
        return res.json(userDoc.data())
        
      } catch (error) {
        logger.error('Error getting user:', error)
        return res.status(500).json({ error: 'Failed to get user' })
      }
    }
    
    // POST /api/users/:userId/deduct-tokens
    if (req.method === 'POST' && path.includes('/deduct-tokens')) {
      const userId = path.split('/')[2]
      const { amount, reason } = req.body
      
      try {
        const userRef = db.collection('users').doc(userId)
        const userDoc = await userRef.get()
        
        if (!userDoc.exists) {
          return res.status(404).json({ error: 'User not found' })
        }
        
        const userData = userDoc.data()
        const newBalance = userData.tokens - amount
        
        if (newBalance < 0) {
          return res.status(400).json({ 
            success: false,
            error: 'Insufficient tokens',
            currentBalance: userData.tokens
          })
        }
        
        await userRef.update({
          tokens: newBalance,
          totalDesignsGenerated: (userData.totalDesignsGenerated || 0) + 1,
          updatedAt: new Date().toISOString()
        })
        
        return res.json({
          success: true,
          newBalance,
          deducted: amount,
          reason
        })
        
      } catch (error) {
        logger.error('Error deducting tokens:', error)
        return res.status(500).json({ error: 'Failed to deduct tokens' })
      }
    }
    
    // POST /api/referral/validate - Validate referral code
    if (req.method === 'POST' && path === '/referral/validate') {
      const { referralCode } = req.body
      
      try {
        // Find user with this referral code
        const usersSnapshot = await db.collection('users')
          .where('referralCode', '==', referralCode)
          .limit(1)
          .get()
        
        if (usersSnapshot.empty) {
          return res.status(404).json({
            valid: false,
            error: 'Invalid referral code'
          })
        }
        
        const referrerData = usersSnapshot.docs[0].data()
        
        return res.json({
          valid: true,
          referrerName: referrerData.name || 'User',
          referrerEmail: referrerData.email
        })
        
      } catch (error) {
        logger.error('Error validating referral:', error)
        return res.status(500).json({ error: 'Failed to validate referral code' })
      }
    }
    
    // POST /api/referral/apply - Apply referral code
    if (req.method === 'POST' && path === '/referral/apply') {
      const { referralCode, userId, email, name } = req.body
      
      try {
        // Find referrer
        const usersSnapshot = await db.collection('users')
          .where('referralCode', '==', referralCode)
          .limit(1)
          .get()
        
        if (usersSnapshot.empty) {
          return res.status(404).json({
            success: false,
            error: 'Invalid referral code'
          })
        }
        
        const referrerDoc = usersSnapshot.docs[0]
        const referrerData = referrerDoc.data()
        const referrerId = referrerDoc.id
        
        // Can't refer yourself
        if (referrerId === userId) {
          return res.status(400).json({
            success: false,
            error: 'You cannot use your own referral code'
          })
        }
        
        // Award tokens to both users
        const newUserRef = db.collection('users').doc(userId)
        const referrerRef = db.collection('users').doc(referrerId)
        
        // Give 750 tokens to new user
        await newUserRef.update({
          tokens: (await newUserRef.get()).data()?.tokens + 750 || 750,
          referredBy: referralCode,
          updatedAt: new Date().toISOString()
        })
        
        // Give 500 tokens to referrer
        await referrerRef.update({
          tokens: referrerData.tokens + 500,
          totalReferrals: (referrerData.totalReferrals || 0) + 1,
          updatedAt: new Date().toISOString()
        })
        
        // Create referral record
        await db.collection('referrals').add({
          referrerId,
          referredUserId: userId,
          referredUserEmail: email,
          referredUserName: name || 'User',
          referralCode,
          tokensAwarded: {
            referrer: 500,
            referred: 750
          },
          status: 'completed',
          createdAt: new Date().toISOString()
        })
        
        return res.json({
          success: true,
          message: 'Referral applied successfully',
          tokensAwarded: 750
        })
        
      } catch (error) {
        logger.error('Error applying referral:', error)
        return res.status(500).json({ error: 'Failed to apply referral code' })
      }
    }
    
    // GET /api/referral/stats/:userId - Get referral stats
    if (req.method === 'GET' && path.startsWith('/referral/stats/')) {
      const userId = path.split('/')[3]
      
      try {
        // Get user's referral code
        const userDoc = await db.collection('users').doc(userId).get()
        
        if (!userDoc.exists) {
          return res.status(404).json({ error: 'User not found' })
        }
        
        const userData = userDoc.data()
        const referralCode = userData.referralCode
        
        // Get referrals made by this user
        const referralsSnapshot = await db.collection('referrals')
          .where('referrerId', '==', userId)
          .orderBy('createdAt', 'desc')
          .get()
        
        const referrals = referralsSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.referredUserName,
            email: data.referredUserEmail,
            date: data.createdAt,
            tokensEarned: data.tokensAwarded.referrer,
            status: data.status
          }
        })
        
        const totalReferrals = referrals.length
        const totalTokensEarned = referrals.reduce((sum, ref) => sum + ref.tokensEarned, 0)
        
        return res.json({
          referralCode,
          totalReferrals,
          totalTokensEarned,
          referrals,
          tier: getTier(totalReferrals),
          nextMilestone: getNextMilestone(totalReferrals)
        })
        
      } catch (error) {
        logger.error('Error getting referral stats:', error)
        return res.status(500).json({ error: 'Failed to get referral stats' })
      }
    }
    
    return res.status(404).json({ error: 'Endpoint not found' })
  }
)

// Helper functions for referral tiers
function getTier(count) {
  if (count >= 100) return 'diamond'
  if (count >= 50) return 'platinum'
  if (count >= 25) return 'gold'
  if (count >= 10) return 'silver'
  if (count >= 5) return 'bronze'
  return 'starter'
}

function getNextMilestone(count) {
  const milestones = [5, 10, 25, 50, 100]
  for (const milestone of milestones) {
    if (count < milestone) return milestone
  }
  return count + 50
}

// Generate unique referral code
function generateReferralCode(userId) {
  // Create a code from userId + random string
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  const userPart = userId.substring(0, 4).toUpperCase()
  return `${userPart}${randomPart}`
}
