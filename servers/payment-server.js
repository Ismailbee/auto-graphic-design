/**
 * Payment Server for SmartDesignPro
 * Handles Paystack payment verification
 * Deploy to: Render.com (FREE)
 */

import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'

const app = express()
const PORT = process.env.PORT || 3006

// Middleware
app.use(cors())
app.use(express.json())

// Environment variables
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_API_URL = 'https://api.paystack.co'

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SmartDesignPro Payment Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// ============================================================================
// VERIFY PAYMENT
// ============================================================================

app.post('/verifyPayment', async (req, res) => {
  try {
    const { reference } = req.body

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      })
    }

    console.log('Verifying payment:', reference)

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      console.error('Paystack verification failed:', paystackData)
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
      amount: paymentData.amount / 100, // Convert from kobo to naira
      currency: paymentData.currency,
      email: paymentData.customer.email,
      status: paymentData.status,
      paidAt: paymentData.paid_at,
      channel: paymentData.channel,
      metadata: paymentData.metadata || {}
    }

    console.log('Payment verified successfully:', payment.reference)

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      data: payment
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
})

// ============================================================================
// PAYSTACK WEBHOOK
// ============================================================================

app.post('/webhook/paystack', async (req, res) => {
  try {
    const event = req.body
    console.log('Webhook received:', event.event)

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        console.log('Successful payment:', event.data.reference)
        break

      case 'subscription.create':
        console.log('Subscription created:', event.data)
        break

      case 'subscription.disable':
        console.log('Subscription disabled:', event.data)
        break

      default:
        console.log('Unhandled webhook event:', event.event)
    }

    res.status(200).send('Webhook processed')

  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).send('Webhook processing failed')
  }
})

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('============================================================')
  console.log('✨ SmartDesignPro Payment Server')
  console.log('============================================================')
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log('============================================================')
  console.log('Endpoints:')
  console.log(`  POST   /verifyPayment`)
  console.log(`  POST   /webhook/paystack`)
  console.log('============================================================')
})
