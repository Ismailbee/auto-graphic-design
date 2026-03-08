@echo off
echo Stopping any existing imposition server processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting imposition server...
cd /d "d:\SmartDesignPro"
node imposition-server.js