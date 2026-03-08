@echo off
echo ========================================
echo SmartDesignPro - Development Server
echo ========================================
echo.

echo [1/3] Cleaning cache...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" 2>nul
if exist ".vite" rmdir /s /q ".vite" 2>nul
echo       Done!
echo.

echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo       Installing dependencies...
    call npm install
) else (
    echo       Dependencies OK!
)
echo.

echo [3/3] Starting server...
echo       URL: http://localhost:8100
echo       Press Ctrl+C to stop
echo.

call npm run dev

pause

