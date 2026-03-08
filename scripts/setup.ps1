# Design Editor Setup Script
Write-Host "Setting up Design Editor project..." -ForegroundColor Green

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Check if installation was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    
    # Start development server
    Write-Host "Starting development server..." -ForegroundColor Yellow
    Write-Host "The application will be available at http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
    
    npm run dev
} else {
    Write-Host "Failed to install dependencies. Please check the error messages above." -ForegroundColor Red
    Write-Host "You can try running 'npm install' manually." -ForegroundColor Yellow
}
