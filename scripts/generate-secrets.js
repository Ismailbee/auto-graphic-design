#!/usr/bin/env node

/**
 * Generate Secure Secrets for Environment Variables
 *
 * Usage:
 *   node scripts/generate-secrets.js
 *
 * This will generate secure random strings for JWT secrets and other sensitive values
 */

import crypto from 'crypto'

console.log('\ne🔐 SECURE SECRET GENERATOR\n')
console.log('=' .rpeat(80))
console.log('\nGenerate these secrets for your .env file:\n')

// Generate JWT secrets
const accessTokenSecret = crypto.randomBytes(64).toString('hex')
const refreshTokenSecret = crypto.randomBytes(64).toString('hex')
const sessionSecret = crypto.randomBytes(64).toString('hex')


console.log('# JWT Secrets (copy these to your .env file)')
console.log('ACCESS_TOKEN_SECRET=' + accessTokenSecret)
console.log('REFRESH_TOKEN_SECRET=' + refreshTokenSecret)
console.log('SESSION_SECRET=' + sessionSecret)

console.log('\n' + '=' .repeat(80))
console.log('\n⚠️  IMPORTANT SECU   RITY NOTES:\n')
console.log('1. ✅ Copy these values to your .env file')
console.log('2. ✅ Use DIFFERENT secrets for development, staging, and production')
console.log('3. ✅ Never commit .env files to version control')
console.log('4. ✅ Rotate secrets regularly in production')
console.log('5. ✅ Store production secrets in a secure vault (AWS Secrets Manager, etc.)')
console.log('\n' + '=' .repeat(80) + '\n')

