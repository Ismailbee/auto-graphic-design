#!/usr/bin/env pwsh
# ================================================================
# SmartDesignPro - Android APK Build Script
# ================================================================
# 
# Description: Automated script to build Android APK
# Usage: 
#   .\build-android-apk.ps1              # Build debug APK
#   .\build-android-apk.ps1 -Release     # Build release APK  
#   .\build-android-apk.ps1 -Install     # Build and install on device
#   .\build-android-apk.ps1 -Clean       # Clean build
#
# ================================================================

param(
    [switch]$Release,
    [switch]$Install,
    [switch]$Clean,
    [switch]$OpenStudio
)

# Color output functions
function Write-Step {
    param([string]$Message)
    Write-Host "`n🔷 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Banner
Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        📱 SmartDesignPro - Android APK Builder 📱        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

# Check prerequisites
Write-Step "Checking prerequisites..."

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion detected"
} catch {
    Write-Error-Custom "Node.js not found. Please install Node.js first."
    exit 1
}

# Check if android folder exists
if (-not (Test-Path "android")) {
    Write-Error-Custom "Android folder not found. Run 'npx cap add android' first."
    exit 1
}

Write-Success "All prerequisites met"

# Clean build if requested
if ($Clean) {
    Write-Step "Cleaning previous builds..."
    
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
        Write-Success "Cleaned dist folder"
    }
    
    if (Test-Path "android/app/build") {
        Remove-Item -Recurse -Force "android/app/build"
        Write-Success "Cleaned Android build folder"
    }
}

# Step 1: Build Vue app
Write-Step "Building Vue application..."
Write-Info "This may take a few minutes..."

$buildResult = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Vue build failed. Check the error above."
    exit 1
}

Write-Success "Vue app built successfully"

# Step 2: Sync with Android
Write-Step "Syncing assets to Android..."

$syncResult = npx cap sync android 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Capacitor sync failed."
    exit 1
}

Write-Success "Assets synced to Android"

# Step 3: Build APK
if ($OpenStudio) {
    Write-Step "Opening Android Studio..."
    npx cap open android
    Write-Info "Build the APK manually in Android Studio:"
    Write-Info "  Build → Build Bundle(s) / APK(s) → Build APK(s)"
    exit 0
}

Write-Step "Building Android APK..."

# Change to android directory
Push-Location android

try {
    if ($Release) {
        Write-Info "Building RELEASE APK (signed)..."
        
        # Check if keystore exists
        if (-not (Test-Path "app/smartdesignpro.keystore")) {
            Write-Warning-Custom "Keystore not found at app/smartdesignpro.keystore"
            Write-Info "Building unsigned release APK instead..."
            Write-Info "To create a signed APK, generate a keystore first:"
            Write-Info "  keytool -genkey -v -keystore app/smartdesignpro.keystore -alias smartdesignpro -keyalg RSA -keysize 2048 -validity 10000"
            
            # Build unsigned release
            if ($IsWindows) {
                .\gradlew.bat assembleRelease
            } else {
                ./gradlew assembleRelease
            }
        } else {
            # Build signed release
            if ($IsWindows) {
                .\gradlew.bat assembleRelease
            } else {
                ./gradlew assembleRelease
            }
        }
        
        $apkPath = "app/build/outputs/apk/release/app-release.apk"
        $buildType = "RELEASE"
        
    } else {
        Write-Info "Building DEBUG APK..."
        
        if ($IsWindows) {
            .\gradlew.bat assembleDebug
        } else {
            ./gradlew assembleDebug
        }
        
        $apkPath = "app/build/outputs/apk/debug/app-debug.apk"
        $buildType = "DEBUG"
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Gradle build failed."
        Pop-Location
        exit 1
    }
    
    # Check if APK was created
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Success "$buildType APK built successfully!"
        Write-Info "APK Location: android/$apkPath"
        Write-Info "APK Size: $([math]::Round($apkSize, 2)) MB"
        
        # Copy to root for easy access
        $rootApkName = "SmartDesignPro-$buildType-v1.0.apk"
        Copy-Item $apkPath "../$rootApkName" -Force
        Write-Success "APK copied to: $rootApkName"
        
        # Install on device if requested
        if ($Install) {
            Write-Step "Installing APK on connected device..."
            
            # Check if device is connected
            $devices = adb devices
            if ($devices -match "device$") {
                adb install -r $apkPath
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "APK installed on device!"
                    Write-Info "Launch the app: com.smartdesignpro.app"
                } else {
                    Write-Error-Custom "Installation failed. Make sure USB debugging is enabled."
                }
            } else {
                Write-Warning-Custom "No Android device detected."
                Write-Info "Connect your device via USB and enable USB debugging."
            }
        }
        
    } else {
        Write-Error-Custom "APK not found at expected location: $apkPath"
        Pop-Location
        exit 1
    }
    
} finally {
    Pop-Location
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║                  ✅ BUILD SUCCESSFUL! ✅                  ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📱 Your Android APK is ready!" -ForegroundColor Cyan

if (-not $Install) {
    Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Install on device: .\build-android-apk.ps1 -Install" -ForegroundColor White
    Write-Host "  2. Or manually: adb install SmartDesignPro-$buildType-v1.0.apk" -ForegroundColor White
    Write-Host "  3. Or transfer APK to device and install" -ForegroundColor White
}

Write-Host ""
