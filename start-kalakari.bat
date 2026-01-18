@echo off
echo ========================================
echo    KALAKARI SERVER STARTUP SCRIPT
echo ========================================
echo.

echo [1/4] Checking environment...
if not exist .env (
    echo ERROR: .env file not found!
    echo Creating from template...
    copy env.example .env
    echo .env file created from template
)

echo [2/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [3/4] Starting server...
echo Server will start on http://localhost:5000
echo.
echo LOGIN CREDENTIALS:
echo Email: admin@kalakari.com
echo Password: password123
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm start

pause

