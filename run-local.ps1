# AI Disaster Management System - Local Development Script

Write-Host "🚀 AI Disaster Management System - Local Development" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "   Please create a .env file with your MongoDB connection string." -ForegroundColor Yellow
    Write-Host "   You can copy from .env.example and update the values." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📋 Available Commands:" -ForegroundColor Cyan
Write-Host "  1. 🔧 First time setup (install dependencies)" -ForegroundColor White
Write-Host "  2. 🔄 Development mode (auto-reload, recommended)" -ForegroundColor White
Write-Host "  3. 🏗️ Production build + run locally" -ForegroundColor White
Write-Host "  4. 🚀 Quick start (if already set up)" -ForegroundColor White
Write-Host "  5. 🏥 Health check only" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔧 Setting up project..." -ForegroundColor Yellow
        npm run setup
        Write-Host ""
        Write-Host "✅ Setup complete! Run this script again and choose option 2." -ForegroundColor Green
        Read-Host "Press Enter to continue"
    }
    "2" {
        Write-Host ""
        Write-Host "🔄 Starting development server..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📍 URLs:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost:10000" -ForegroundColor White
        Write-Host "   API: http://localhost:10000/api" -ForegroundColor White
        Write-Host "   Health: http://localhost:10000/health" -ForegroundColor White
        Write-Host ""
        Write-Host "🔑 Default Credentials:" -ForegroundColor Cyan
        Write-Host "   Admin: admin@disaster.com / admin123" -ForegroundColor White
        Write-Host "   Operator: operator@disaster.com / operator123" -ForegroundColor White
        Write-Host ""
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        npm run local
    }
    "3" {
        Write-Host ""
        Write-Host "🏗️ Building production version..." -ForegroundColor Yellow
        npm run serve
    }
    "4" {
        Write-Host ""
        Write-Host "🚀 Quick starting server..." -ForegroundColor Yellow
        npm run dev
    }
    "5" {
        Write-Host ""
        Write-Host "🏥 Checking server health..." -ForegroundColor Yellow
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:10000/health" -Method Get -TimeoutSec 5
            Write-Host "✅ Server is healthy!" -ForegroundColor Green
            Write-Host "Status: $($response.status)" -ForegroundColor White
            Write-Host "Database: $($response.database)" -ForegroundColor White
            Write-Host "Uptime: $($response.uptime) seconds" -ForegroundColor White
        }
        catch {
            Write-Host "❌ Server is not running or not healthy" -ForegroundColor Red
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        Read-Host "Press Enter to continue"
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        Read-Host "Press Enter to continue"
    }
}
