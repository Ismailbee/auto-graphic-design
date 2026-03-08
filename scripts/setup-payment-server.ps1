# Payment Server Setup Script
# This script sets up the payment server with all required dependencies

Write-Host "🚀 Setting up Payment Server..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing payment server dependencies..." -ForegroundColor Yellow
npm install --prefix . express@^5.1.0 cors@^2.8.5 better-sqlite3@^12.4.1 express-validator@^7.2.1 uuid@^13.0.0 axios@^1.6.0

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
Write-Host "🔐 Checking environment configuration..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    
    $envContent = @"
# Payment Server Configuration
PAYMENT_PORT=3006

# Paystack Configuration
# Get your keys from https://dashboard.paystack.com/#/settings/developer
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here

# Application URL
APP_URL=http://localhost:8100

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:8100,http://localhost:3000

# Node Environment
NODE_ENV=development
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created. Please update with your Paystack keys." -ForegroundColor Green
} else {
    Write-Host "✅ .env file found" -ForegroundColor Green
}
Write-Host ""

# Create database directory if it doesn't exist
Write-Host "💾 Setting up database..." -ForegroundColor Yellow
if (!(Test-Path "payments.db")) {
    Write-Host "✅ Database will be created on first run" -ForegroundColor Green
} else {
    Write-Host "✅ Database already exists" -ForegroundColor Green
}
Write-Host ""

# Display next steps
Write-Host "✅ Payment Server setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your Paystack keys" -ForegroundColor White
Write-Host "2. Get Paystack keys from: https://dashboard.paystack.com/#/settings/developer" -ForegroundColor White
Write-Host "3. Start the server: node servers/payment-server.js" -ForegroundColor White
Write-Host "4. Test the server: http://localhost:3006/health" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Useful Links:" -ForegroundColor Cyan
Write-Host "- Paystack Dashboard: https://dashboard.paystack.com" -ForegroundColor White
Write-Host "- Paystack API Docs: https://paystack.com/docs/api" -ForegroundColor White
Write-Host "- Test Cards: https://paystack.com/docs/payments/test-payments" -ForegroundColor White
Write-Host ""

