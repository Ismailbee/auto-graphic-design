# Start Development Server - OneDrive Workaround
# This script works around OneDrive sync issues with Vite

Write-Host "🔧 SmartDesignPro - Development Server Starter" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Step 1: Clean up any existing cache
Write-Host "📦 Cleaning Vite cache..." -ForegroundColor Yellow
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".vite" -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Filter "*.timestamp-*" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force
Write-Host "✅ Cache cleaned`n" -ForegroundColor Green

# Step 2: Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Yellow
$env:NODE_ENV = "development"
$env:VITE_CJS_TRACE = "true"
Write-Host "✅ Environment configured`n" -ForegroundColor Green

# Step 3: Start Vite
Write-Host "🚀 Starting Vite development server..." -ForegroundColor Cyan
Write-Host "   URL: http://localhost:8100" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to stop`n" -ForegroundColor Gray

# Run Vite with force flag
vite --force --host=localhost --port=8100

