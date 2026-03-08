/**
 * ICAN SSO Server
 * Handles SSO token generation for ICAN Portal integration
 * Port: 3007 (to avoid conflicts with existing servers)
 */

const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = 3007

// Configuration
const ICAN_CONFIG = {
  SECRET_KEY: 'your-ican-shared-secret-key', // Change this in production
  TOKEN_EXPIRY: '1h',
  ALLOWED_ORIGINS: [
    'http://localhost:8100',
    'http://localhost:3000',
    'http://127.0.0.1:8100',
    'https://your-smartdesignpro-domain.com' // Add your production domain
  ]
}

// Middleware
app.use(cors({
  origin: ICAN_CONFIG.ALLOWED_ORIGINS,
  credentials: true
}))
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

/**
 * Generate SSO token for ICAN Portal
 */
app.post('/api/ican/generate-token', async (req, res) => {
  try {
    const { user_id, email, name, role, branch, permissions } = req.body

    // Validate required fields
    if (!user_id || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id and email'
      })
    }

    console.log(`🔐 Generating ICAN SSO token for user: ${email}`)

    // Check if user has ICAN access (implement your logic here)
    const hasICANAccess = await validateICANAccess({ user_id, email, role })
    
    if (!hasICANAccess) {
      console.log(`❌ Access denied for user: ${email}`)
      return res.status(403).json({
        success: false,
        error: 'User does not have ICAN access permissions'
      })
    }

    // Create JWT payload
    const payload = {
      user_id,
      email,
      name: name || email.split('@')[0],
      role: role || 'user',
      branch: branch || 'main',
      permissions: permissions || ['read'],
      origin: 'smartdesignpro',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    }

    // Generate JWT token
    const token = jwt.sign(payload, ICAN_CONFIG.SECRET_KEY, {
      algorithm: 'HS256',
      expiresIn: ICAN_CONFIG.TOKEN_EXPIRY
    })

    console.log(`✅ SSO token generated successfully for user: ${email}`)

    res.json({
      success: true,
      token,
      expires_in: 3600 // 1 hour in seconds
    })

  } catch (error) {
    console.error('❌ Error generating ICAN SSO token:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Validate ICAN access permissions
 */
async function validateICANAccess(user) {
  // Implement your access validation logic here
  // This is a simplified example - customize based on your requirements
  
  const { user_id, email, role } = user

  // Allow admins and moderators
  if (role === 'admin' || role === 'moderator') {
    return true
  }

  // Allow specific email domains
  const allowedDomains = ['your-company.com'] // Add your allowed domains
  if (allowedDomains.some(domain => email.endsWith(`@${domain}`))) {
    return true
  }

  // Check database for specific ICAN access permission
  // const userPermissions = await getUserPermissions(user_id)
  // return userPermissions.includes('ican_access')

  // For development - allow all users (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  Development mode: Allowing ICAN access for all users')
    return true
  }

  return false
}

/**
 * Verify ICAN token (for testing)
 */
app.post('/api/ican/verify-token', (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      })
    }

    // Verify JWT token
    const payload = jwt.verify(token, ICAN_CONFIG.SECRET_KEY)

    console.log(`✅ Token verified for user: ${payload.email}`)

    res.json({
      success: true,
      payload,
      valid: true
    })

  } catch (error) {
    console.error('❌ Token verification failed:', error.message)
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    })
  }
})

/**
 * Get ICAN service status
 */
app.get('/api/ican/status', (req, res) => {
  res.json({
    success: true,
    service: 'ICAN SSO Server',
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' })
})

/**
 * Error handling middleware
 */
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
})

/**
 * 404 handler
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  })
})

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log('🚀 ICAN SSO Server started successfully!')
  console.log(`📍 Server running on: http://localhost:${PORT}`)
  console.log('🔗 Available endpoints:')
  console.log(`   POST /api/ican/generate-token - Generate SSO token`)
  console.log(`   POST /api/ican/verify-token   - Verify SSO token`)
  console.log(`   GET  /api/ican/status        - Service status`)
  console.log(`   GET  /health                 - Health check`)
  console.log('🛡️  CORS enabled for:', ICAN_CONFIG.ALLOWED_ORIGINS.join(', '))
  console.log('')
  console.log('💡 To test the server:')
  console.log(`   curl http://localhost:${PORT}/api/ican/status`)
})

module.exports = app