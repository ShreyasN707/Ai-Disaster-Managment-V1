@echo off
echo 🚀 Starting AI Disaster Management System Locally...
echo.
echo 📋 Available Commands:
echo   1. First time setup (installs dependencies)
echo   2. Run development server (with auto-reload)
echo   3. Run production build locally
echo   4. Just start the server (if already built)
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🔧 Setting up project for first time...
    npm run setup
    echo.
    echo ✅ Setup complete! You can now run 'npm run local' anytime.
    pause
) else if "%choice%"=="2" (
    echo.
    echo 🔄 Starting development server with auto-reload...
    echo 📍 Frontend will be available at: http://localhost:10000
    echo 📍 API will be available at: http://localhost:10000/api
    echo 📍 Health check: http://localhost:10000/health
    echo.
    echo 🔑 Default Login Credentials:
    echo   Admin: admin@disaster.com / admin123
    echo   Operator: operator@disaster.com / operator123
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    npm run local
) else if "%choice%"=="3" (
    echo.
    echo 🏗️ Building and running production version locally...
    npm run serve
) else if "%choice%"=="4" (
    echo.
    echo 🚀 Starting server (make sure frontend is built)...
    npm run dev
) else (
    echo Invalid choice. Please run the script again.
    pause
)
