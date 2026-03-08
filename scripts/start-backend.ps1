# Auto Design Backend Startup Script
Write-Host "Starting Auto Design Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (!(Test-Path "node_modules\express")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Write-Host ""

    # Install dependencies
    npm install express cors socket.io multer

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
}

# Create uploads directory if it doesn't exist
if (!(Test-Path "auto-design-uploads")) {
    New-Item -ItemType Directory -Path "auto-design-uploads" | Out-Null
    Write-Host "Created uploads directory" -ForegroundColor Green
}

# Start the server
Write-Host "Starting server on http://localhost:3003..." -ForegroundColor Cyan
Write-Host ""
node servers/auto-design-server.cjs

