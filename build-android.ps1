# SmartDesignPro - Build Android APK
# Run this script in PowerShell

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SmartDesignPro - Android APK Builder" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check prerequisites
Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found!" -ForegroundColor Red
    Write-Host "    Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Android Studio
$androidHome = $env:ANDROID_HOME
if ($androidHome -and (Test-Path $androidHome)) {
    Write-Host "  ✓ Android SDK: $androidHome" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Android SDK not configured!" -ForegroundColor Yellow
    Write-Host "    Please install Android Studio and set ANDROID_HOME" -ForegroundColor Yellow
    Write-Host "    See BUILD_APK_GUIDE.md for instructions" -ForegroundColor Yellow
    
    $continue = Read-Host "    Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        exit 1
    }
}

Write-Host ""

# Step 2: Install dependencies
Write-Host "[2/5] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Build Vue app
Write-Host "[3/5] Building Vue application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Vue app built successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Sync with Android
Write-Host "[4/5] Syncing with Android project..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Android project synced" -ForegroundColor Green
Write-Host ""

# Step 5: Check Android build files
Write-Host "[5/5] Verifying Android files..." -ForegroundColor Yellow

$manifestPath = "android\app\src\main\AndroidManifest.xml"
$buildGradlePath = "android\app\build.gradle"

if (Test-Path $manifestPath) {
    Write-Host "  ✓ AndroidManifest.xml found" -ForegroundColor Green
} else {
    Write-Host "  ✗ AndroidManifest.xml missing!" -ForegroundColor Red
}

if (Test-Path $buildGradlePath) {
    Write-Host "  ✓ build.gradle found" -ForegroundColor Green
} else {
    Write-Host "  ✗ build.gradle missing!" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Build Preparation Complete! ✓" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open Android Studio:" -ForegroundColor White
Write-Host "   npx cap open android" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. In Android Studio:" -ForegroundColor White
Write-Host "   • Build → Build Bundle(s) / APK(s) → Build APK(s)" -ForegroundColor Cyan
Write-Host "   • Wait for build to complete" -ForegroundColor Cyan
Write-Host "   • Click 'locate' to find your APK" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. APK Location:" -ForegroundColor White
Write-Host "   android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed instructions, see: BUILD_APK_GUIDE.md" -ForegroundColor Yellow
Write-Host ""

# Ask if user wants to open Android Studio
$openStudio = Read-Host "Open Android Studio now? (y/n)"
if ($openStudio -eq 'y') {
    Write-Host "Opening Android Studio..." -ForegroundColor Yellow
    npx cap open android
}
