#!/usr/bin/env pwsh
# ================================================================
# Android Build Verification Script
# ================================================================
# Quick check to verify Android build is ready
# ================================================================

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🔍 Android Build Verification Check 🔍            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

$checks = @()
$warnings = @()
$errors = @()

# Check 1: Node.js
Write-Host "Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    Write-Host " ✅ $nodeVersion" -ForegroundColor Green
    $checks += "Node.js installed"
} catch {
    Write-Host " ❌ Not found" -ForegroundColor Red
    $errors += "Node.js not installed"
}

# Check 2: NPM packages
Write-Host "Checking npm packages..." -NoNewline
if (Test-Path "node_modules") {
    Write-Host " ✅ Installed" -ForegroundColor Green
    $checks += "NPM packages installed"
} else {
    Write-Host " ⚠️  Not installed" -ForegroundColor Yellow
    $warnings += "Run 'npm install' first"
}

# Check 3: Android folder
Write-Host "Checking Android platform..." -NoNewline
if (Test-Path "android") {
    Write-Host " ✅ Found" -ForegroundColor Green
    $checks += "Android platform exists"
} else {
    Write-Host " ❌ Not found" -ForegroundColor Red
    $errors += "Android platform missing (run: npx cap add android)"
}

# Check 4: Capacitor config
Write-Host "Checking Capacitor config..." -NoNewline
if (Test-Path "capacitor.config.ts") {
    Write-Host " ✅ Found" -ForegroundColor Green
    $checks += "Capacitor configured"
} else {
    Write-Host " ❌ Not found" -ForegroundColor Red
    $errors += "capacitor.config.ts missing"
}

# Check 5: Android SDK (ANDROID_HOME)
Write-Host "Checking Android SDK..." -NoNewline
$androidHome = $env:ANDROID_HOME
if ($androidHome -and (Test-Path $androidHome)) {
    Write-Host " ✅ $androidHome" -ForegroundColor Green
    $checks += "Android SDK configured"
} else {
    Write-Host " ⚠️  Not configured" -ForegroundColor Yellow
    $warnings += "ANDROID_HOME not set (Android Studio needed for building)"
}

# Check 6: Java/JDK
Write-Host "Checking Java..." -NoNewline
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Host " ✅ Found" -ForegroundColor Green
    $checks += "Java installed"
} catch {
    Write-Host " ⚠️  Not found" -ForegroundColor Yellow
    $warnings += "Java/JDK needed for Gradle builds"
}

# Check 7: Build directory
Write-Host "Checking dist folder..." -NoNewline
if (Test-Path "dist") {
    Write-Host " ✅ Found" -ForegroundColor Green
    $checks += "Web app built"
} else {
    Write-Host " ⚠️  Not found" -ForegroundColor Yellow
    $warnings += "Run 'npm run build' first"
}

# Check 8: AndroidManifest.xml
Write-Host "Checking AndroidManifest..." -NoNewline
if (Test-Path "android/app/src/main/AndroidManifest.xml") {
    Write-Host " ✅ Found" -ForegroundColor Green
    $checks += "AndroidManifest configured"
} else {
    Write-Host " ❌ Not found" -ForegroundColor Red
    $errors += "AndroidManifest.xml missing"
}

# Check 9: Build scripts
Write-Host "Checking build scripts..." -NoNewline
if (Test-Path "build-android-apk.ps1") {
    Write-Host " ✅ Found" -ForegroundColor Green
    $checks += "Build scripts ready"
} else {
    Write-Host " ⚠️  Not found" -ForegroundColor Yellow
    $warnings += "Build script missing (optional)"
}

# Check 10: Capacitor plugins
Write-Host "Checking Capacitor plugins..." -NoNewline
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$capacitorPlugins = @(
    "@capacitor/app",
    "@capacitor/camera",
    "@capacitor/browser",
    "@capacitor/share"
)
$allPluginsFound = $true
foreach ($plugin in $capacitorPlugins) {
    if (-not $packageJson.dependencies.$plugin) {
        $allPluginsFound = $false
        break
    }
}
if ($allPluginsFound) {
    Write-Host " ✅ All installed" -ForegroundColor Green
    $checks += "Capacitor plugins installed"
} else {
    Write-Host " ⚠️  Some missing" -ForegroundColor Yellow
    $warnings += "Some Capacitor plugins may be missing"
}

# Summary
Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "✅ Passed Checks: $($checks.Count)" -ForegroundColor Green
foreach ($check in $checks) {
    Write-Host "   • $check" -ForegroundColor Green
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  Warnings: $($warnings.Count)" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   • $warning" -ForegroundColor Yellow
    }
}

if ($errors.Count -gt 0) {
    Write-Host "`n❌ Errors: $($errors.Count)" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   • $error" -ForegroundColor Red
    }
}

# Final verdict
Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host @"

✅ YOUR APP IS READY TO BUILD! ✅

Run one of these commands to build:

  1. npm run build:android
  2. .\build-android-apk.ps1

"@ -ForegroundColor Green

    if ($warnings.Count -gt 0) {
        Write-Host "Note: Warnings above are optional but recommended.`n" -ForegroundColor Yellow
    }
} else {
    Write-Host @"

❌ SETUP INCOMPLETE

Please fix the errors above before building.
See BUILD_ANDROID_APK.md for detailed instructions.

"@ -ForegroundColor Red
}
