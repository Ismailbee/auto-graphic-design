# ============================================================================
# Install Security and Testing Packages (PowerShell)
# ============================================================================

Write-Host "🔒 Installing security packages..." -ForegroundColor Cyan

# Security packages
npm install express-rate-limit helmet express-validator dotenv

# Testing packages
npm install -D vitest @vue/test-utils jsdom @testing-library/vue @testing-library/jest-dom happy-dom

# Monitoring packages
npm install @sentry/vue @sentry/node

# Development tools
npm install -D @types/node

Write-Host "✅ All packages installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: node scripts/generate-secrets.js"
Write-Host "2. Copy .env.example to .env and fill in your secrets"
Write-Host "3. Update your servers to use the new security middleware"
Write-Host ""

