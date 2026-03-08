#!/bin/bash

# ============================================================================
# Install Security and Testing Packages
# ============================================================================

echo "🔒 Installing security packages..."

# Security packages
npm install express-rate-limit helmet express-validator dotenv

# Testing packages
npm install -D vitest @vue/test-utils jsdom @testing-library/vue @testing-library/jest-dom happy-dom

# Monitoring packages
npm install @sentry/vue @sentry/node

# Development tools
npm install -D @types/node

echo "✅ All packages installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Run: node scripts/generate-secrets.js"
echo "2. Copy .env.example to .env and fill in your secrets"
echo "3. Update your servers to use the new security middleware"
echo ""

