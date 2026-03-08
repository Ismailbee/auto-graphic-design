# Setup Auto Design Server
Write-Host "🚀 Setting up Auto Design Server..." -ForegroundColor Cyan

# Check if package.json exists
if (Test-Path "auto-design-server-package.json") {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    
    # Copy package.json
    Copy-Item "auto-design-server-package.json" "package-auto-design.json" -Force
    
    # Install dependencies
    npm install --prefix . express cors socket.io multer
    npm install --prefix . --save-dev nodemon
    
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "❌ auto-design-server-package.json not found!" -ForegroundColor Red
    exit 1
}

# Create uploads directory
if (!(Test-Path "auto-design-uploads")) {
    New-Item -ItemType Directory -Path "auto-design-uploads" | Out-Null
    Write-Host "📁 Created uploads directory" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the server, run:" -ForegroundColor Cyan
Write-Host "  node servers/auto-design-server.js" -ForegroundColor Yellow
Write-Host ""
Write-Host "Or for development with auto-reload:" -ForegroundColor Cyan
Write-Host "  npx nodemon servers/auto-design-server.js" -ForegroundColor Yellow
Write-Host ""

