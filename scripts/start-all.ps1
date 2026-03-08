#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start all SmartDesignPro servers (frontend + backend)
.DESCRIPTION
    This script starts the frontend development server and all backend services
    in the correct order with proper error handling.
#>

Write-Host "🚀 Starting SmartDesignPro Complete Development Environment" -ForegroundColor Green
Write-Host "=" * 60

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect('localhost', $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to start a server in background
function Start-BackgroundServer {
    param(
        [string]$Name,
        [string]$Command,
        [int]$Port,
        [string]$WorkingDir = $PWD
    )
    
    if (Test-Port -Port $Port) {
        Write-Host "⚠️  $Name already running on port $Port" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🔧 Starting $Name on port $Port..." -ForegroundColor Cyan
    
    $job = Start-Job -ScriptBlock {
        param($cmd, $dir)
        Set-Location $dir
        Invoke-Expression $cmd
    } -ArgumentList $Command, $WorkingDir
    
    Write-Host "✅ $Name started (Job ID: $($job.Id))" -ForegroundColor Green
    Start-Sleep -Seconds 1
}

# Kill any existing Node.js processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "`n📡 Starting Backend Services..." -ForegroundColor Magenta

# Start all backend servers (from servers/ directory)
Start-BackgroundServer -Name "Auth Server" -Command "node servers/auth-server.js" -Port 3003
Start-BackgroundServer -Name "Admin Server" -Command "node servers/admin-server.js" -Port 3006  
Start-BackgroundServer -Name "Collaboration Server" -Command "node servers/collaboration-server.js" -Port 3000
Start-BackgroundServer -Name "Auto Design Server" -Command "node servers/auto-design-server.js" -Port 3003
Start-BackgroundServer -Name "ICAN SSO Server" -Command "node servers/ican-sso-server.js" -Port 3007

# Start ICAN Backend
$icanBackendDir = Join-Path $PWD "src\views\micro-apps\Ican\backend"
if (Test-Path $icanBackendDir) {
    Start-BackgroundServer -Name "ICAN Backend" -Command "npm start" -Port 4000 -WorkingDir $icanBackendDir
} else {
    Write-Host "⚠️  ICAN Backend directory not found: $icanBackendDir" -ForegroundColor Yellow
}

Write-Host "`n🌐 Starting Frontend Development Server..." -ForegroundColor Magenta
Start-Sleep -Seconds 2

# Start frontend server
Write-Host "🔧 Starting Vite Frontend Server on port 5173..." -ForegroundColor Cyan
npm run ionic:serve

Write-Host "`n🎉 SmartDesignPro Development Environment Started!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "🔐 Auth Server: http://localhost:3003" -ForegroundColor White  
Write-Host "👑 Admin Server: http://localhost:3006" -ForegroundColor White
Write-Host "🤝 Collaboration: http://localhost:3000" -ForegroundColor White
Write-Host "🎨 Auto Design: http://localhost:3003" -ForegroundColor White
Write-Host "🔑 ICAN SSO: http://localhost:3007" -ForegroundColor White
Write-Host "📊 ICAN Backend: http://localhost:4000" -ForegroundColor White
Write-Host "`nPress Ctrl+C to stop all servers" -ForegroundColor Yellow