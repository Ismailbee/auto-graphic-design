/**
 * Authentication Server
 * Handles user registration, login, session management, and password reset
 */

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const Database = require('better-sqlite3')
const { body, validationResult } = require('express-validator')
const crypto = require('crypto')

const app = express()
const PORT = process.env.AUTH_PORT || 3003

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

// JWT Secret Keys - MUST be set via environment variables in production
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET

// Validate that secrets are set
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  console.error('\n❌ CRITICAL SECURITY ERROR: JWT secrets not configured!')
  console.error('📝 Please set ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET in your .env file')
  console.error('🔧 Run: node scripts/generate-secrets.js to generate secure secrets\n')

  if (process.env.NODE_ENV === 'production') {
    // In production, fail immediately
    throw new Error('Missing required JWT secrets. Cannot start server.')
  } else {
    // In development, warn but allow with temporary secrets
    console.warn('⚠️  WARNING: Using temporary development secrets. DO NOT use in production!')
    // These will be reassigned below for development only
  }
}

// Use environment variables or secure defaults for development
const FINAL_ACCESS_SECRET = ACCESS_TOKEN_SECRET || crypto.randomBytes(64).toString('hex')
const FINAL_REFRESH_SECRET = REFRESH_TOKEN_SECRET || crypto.randomBytes(64).toString('hex')

// Token Expiry
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m'
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d'

// Security Settings
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5
const LOCKOUT_DURATION = parseInt(process.env.LOCKOUT_DURATION) || 15 * 60 * 1000
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10

// CORS Configuration - Use environment variable for allowed origins
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000']

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))
app.use(express.json())

// Initialize SQLite Database
const db = new Database('auth.db')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    password TEXT NOT NULL,
    firstName TEXT,
    lastName TEXT,
    role TEXT DEFAULT 'editor',
    status TEXT DEFAULT 'active',
    emailVerified INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    lastLoginAt TEXT,
    failedLoginAttempts INTEGER DEFAULT 0,
    lockedUntil TEXT
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`)

// Helper Functions
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    },
    FINAL_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  )
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex')
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, FINAL_ACCESS_SECRET)
  } catch (error) {
    return null
  }
}

// Middleware: Authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  const user = verifyAccessToken(token)
  if (!user) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }

  req.user = user
  next()
}

// Validation Rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('username').optional().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 })
]

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
]

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Register new user
 */
app.post('/api/auth/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, username, firstName, lastName } = req.body

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    if (username) {
      const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    // Create user
    const userId = uuidv4()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO users (id, email, username, password, firstName, lastName, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, email, username || null, hashedPassword, firstName || null, lastName || null, now, now)

    // Get created user
    const user = db.prepare('SELECT id, email, username, firstName, lastName, role, status FROM users WHERE id = ?').get(userId)

    // Generate tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken()

    // Store refresh token
    const tokenId = uuidv4()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    db.prepare(`
      INSERT INTO refresh_tokens (id, userId, token, expiresAt, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(tokenId, userId, refreshToken, expiresAt, now)

    res.status(201).json({
      message: 'Registration successful',
      user,
      accessToken,
      refreshToken
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Registration failed', error: error.message })
  }
})

/**
 * Login user
 */
app.post('/api/auth/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, rememberMe } = req.body

    // Get user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Check if account is locked
    if (user.lockedUntil) {
      const lockExpiry = new Date(user.lockedUntil)
      if (lockExpiry > new Date()) {
        const minutesLeft = Math.ceil((lockExpiry - new Date()) / 60000)
        return res.status(423).json({
          message: `Account locked due to too many failed login attempts. Try again in ${minutesLeft} minutes.`
        })
      } else {
        // Unlock account
        db.prepare('UPDATE users SET lockedUntil = NULL, failedLoginAttempts = 0 WHERE id = ?').run(user.id)
      }
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account suspended. Contact administrator.' })
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      // Increment failed attempts
      const newAttempts = user.failedLoginAttempts + 1
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCKOUT_DURATION).toISOString()
        db.prepare('UPDATE users SET failedLoginAttempts = ?, lockedUntil = ? WHERE id = ?')
          .run(newAttempts, lockUntil, user.id)
        return res.status(423).json({
          message: `Account locked due to too many failed login attempts. Try again in 15 minutes.`
        })
      } else {
        db.prepare('UPDATE users SET failedLoginAttempts = ? WHERE id = ?').run(newAttempts, user.id)
        return res.status(401).json({
          message: `Invalid email or password. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`
        })
      }
    }

    // Reset failed attempts and update last login
    const now = new Date().toISOString()
    db.prepare('UPDATE users SET failedLoginAttempts = 0, lockedUntil = NULL, lastLoginAt = ? WHERE id = ?')
      .run(now, user.id)

    // Generate tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken()

    // Store refresh token
    const tokenId = uuidv4()
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000).toISOString()
    db.prepare(`
      INSERT INTO refresh_tokens (id, userId, token, expiresAt, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(tokenId, user.id, refreshToken, expiresAt, now)

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified === 1
    }

    res.json({
      message: 'Login successful',
      user: userData,
      accessToken,
      refreshToken
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
})

/**
 * Refresh access token
 */
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' })
    }

    // Verify refresh token exists and is valid
    const tokenRecord = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(refreshToken)
    
    if (!tokenRecord) {
      return res.status(403).json({ message: 'Invalid refresh token' })
    }

    // Check if token expired
    if (new Date(tokenRecord.expiresAt) < new Date()) {
      db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(tokenRecord.id)
      return res.status(403).json({ message: 'Refresh token expired' })
    }

    // Get user
    const user = db.prepare('SELECT id, email, username, role FROM users WHERE id = ?').get(tokenRecord.userId)
    
    if (!user) {
      return res.status(403).json({ message: 'User not found' })
    }

    // Generate new access token
    const accessToken = generateAccessToken(user)

    res.json({ accessToken })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({ message: 'Token refresh failed', error: error.message })
  }
})

/**
 * Logout user
 */
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken)
    }

    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Logout failed', error: error.message })
  }
})

/**
 * Get current user profile
 */
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, email, username, firstName, lastName, role, status, emailVerified, createdAt, lastLoginAt
      FROM users WHERE id = ?
    `).get(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user: { ...user, emailVerified: user.emailVerified === 1 } })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Failed to get profile', error: error.message })
  }
})

/**
 * Request password reset
 */
app.post('/api/auth/password-reset/request', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email required' })
    }

    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email)

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link will be sent' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const tokenId = uuidv4()
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

    // Delete old reset tokens for this user
    db.prepare('DELETE FROM password_resets WHERE userId = ?').run(user.id)

    // Store reset token
    db.prepare(`
      INSERT INTO password_resets (id, userId, token, expiresAt, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(tokenId, user.id, resetToken, expiresAt, now)

    // In production, send email here
    // For development, log the token
    console.log('='.repeat(60))
    console.log('PASSWORD RESET TOKEN (Development Only)')
    console.log('='.repeat(60))
    console.log(`Email: ${user.email}`)
    console.log(`Reset Token: ${resetToken}`)
    console.log(`Expires: ${expiresAt}`)
    console.log('='.repeat(60))

    res.json({
      message: 'If the email exists, a reset link will be sent',
      // Only include token in development
      ...(process.env.NODE_ENV !== 'production' && { resetToken })
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    res.status(500).json({ message: 'Failed to process request', error: error.message })
  }
})

/**
 * Reset password with token
 */
app.post('/api/auth/password-reset/confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password required' })
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    // Get reset token
    const resetRecord = db.prepare('SELECT * FROM password_resets WHERE token = ? AND used = 0').get(token)

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or already used reset token' })
    }

    // Check if expired
    if (new Date(resetRecord.expiresAt) < new Date()) {
      db.prepare('DELETE FROM password_resets WHERE id = ?').run(resetRecord.id)
      return res.status(400).json({ message: 'Reset token expired' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    // Update password
    const now = new Date().toISOString()
    db.prepare('UPDATE users SET password = ?, updatedAt = ? WHERE id = ?')
      .run(hashedPassword, now, resetRecord.userId)

    // Mark token as used
    db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(resetRecord.id)

    // Invalidate all refresh tokens for this user (force re-login)
    db.prepare('DELETE FROM refresh_tokens WHERE userId = ?').run(resetRecord.userId)

    res.json({ message: 'Password reset successful' })
  } catch (error) {
    console.error('Password reset confirm error:', error)
    res.status(500).json({ message: 'Failed to reset password', error: error.message })
  }
})

/**
 * Change password (authenticated)
 */
app.post('/api/auth/password-change', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password required' })
    }

    // Get user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password)
    if (!validPassword) {
      return res.status(401).json({ message: 'Current password incorrect' })
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    // Update password
    const now = new Date().toISOString()
    db.prepare('UPDATE users SET password = ?, updatedAt = ? WHERE id = ?')
      .run(hashedPassword, now, user.id)

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Password change error:', error)
    res.status(500).json({ message: 'Failed to change password', error: error.message })
  }
})

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Authentication Server',
    timestamp: new Date().toISOString()
  })
})

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60))
  console.log('🔐 Authentication Server')
  console.log('='.repeat(60))
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`💾 Database: auth.db`)
  console.log('='.repeat(60))
  console.log('Endpoints:')
  console.log('  POST /api/auth/register')
  console.log('  POST /api/auth/login')
  console.log('  POST /api/auth/logout')
  console.log('  POST /api/auth/refresh')
  console.log('  GET  /api/auth/me')
  console.log('  POST /api/auth/password-reset/request')
  console.log('  POST /api/auth/password-reset/confirm')
  console.log('  POST /api/auth/password-change')
  console.log('='.repeat(60))
})

