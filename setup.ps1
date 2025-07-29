# Mind Beats - Full Stack Setup Script
# This script sets up and runs the complete application

Write-Host "🎵 Welcome to Mind Beats Setup!" -ForegroundColor Magenta
Write-Host "Setting up your full-stack mood-based playlist application..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath

Write-Host "📁 Project root: $rootPath" -ForegroundColor Yellow

# Setup Backend
Write-Host "`n🔧 Setting up Backend..." -ForegroundColor Cyan
Set-Location "$rootPath\server"

if (Test-Path "package.json") {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    
    # Check if .env exists
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  Creating .env file..." -ForegroundColor Yellow
        @"
# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DB_PATH=./db/moodify.sqlite

# JWT Secret (for authentication)
JWT_SECRET=your_super_secret_jwt_key_here
"@ | Out-File -FilePath ".env" -Encoding UTF8
        
        Write-Host "🔑 Please update the .env file with your Spotify API credentials" -ForegroundColor Yellow
    }
    
    Write-Host "✅ Backend setup complete!" -ForegroundColor Green
} else {
    Write-Host "❌ Backend package.json not found!" -ForegroundColor Red
}

# Setup Frontend
Write-Host "`n🔧 Setting up Frontend..." -ForegroundColor Cyan
Set-Location "$rootPath\client"

if (Test-Path "package.json") {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Frontend setup complete!" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend package.json not found!" -ForegroundColor Red
}

# Create start script
Write-Host "`n📝 Creating startup scripts..." -ForegroundColor Cyan

$startScript = @"
# Mind Beats Startup Script
# Starts both backend and frontend servers

Write-Host "🚀 Starting Mind Beats Application..." -ForegroundColor Magenta

# Start Backend Server
Write-Host "🔙 Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\server'; npm start" -WindowStyle Normal

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\client'; npm run dev" -WindowStyle Normal

Write-Host "✅ Both servers started!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "🔗 Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "📊 Analytics: http://localhost:3001/analytics" -ForegroundColor Yellow

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
`$null = `$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
"@

$startScript | Out-File -FilePath "$rootPath\start-app.ps1" -Encoding UTF8

# Create development info file
$devInfo = @"
# Mind Beats - Development Information

## 🚀 Quick Start
1. Run setup: `.\setup.ps1`
2. Start app: `.\start-app.ps1`
3. Open browser: http://localhost:5173

## 📁 Project Structure
```
Mind Beats/
├── client/          # React Frontend (Vite + Tailwind)
├── server/          # Node.js Backend (Express + SQLite)
├── setup.ps1        # Setup script
├── start-app.ps1    # Start script
└── README.md        # This file
```

## 🔗 API Endpoints
- `GET /api/health` - Health check
- `GET /api/playlist/:mood` - Get mood-based playlist
- `POST /api/log-interaction` - Log user interactions
- `GET /api/data` - Get user data
- `GET /api/stats` - Get app statistics
- `GET /api/analytics-json` - Get analytics data

## 🎨 Features
- ✅ Mood-based playlist generation
- ✅ User interaction tracking
- ✅ Analytics dashboard
- ✅ Responsive design with Tailwind CSS
- ✅ Cool animations and effects
- ✅ Error boundaries and loading states
- ✅ SQLite database with auto-creation
- ✅ RESTful API with proper error handling

## 🛠️ Technology Stack
**Frontend:**
- React 19 with Vite
- Tailwind CSS 4
- React Router DOM
- Axios for API calls
- React Icons

**Backend:**
- Node.js with Express 5
- SQLite 3 database
- Axios for Spotify API
- CORS enabled
- Environment variables with dotenv

## 🔧 Development Commands
**Frontend (in /client):**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend (in /server):**
- `npm start` - Start server with auto-restart
- `node server.js` - Start server normally

## 🎯 Environment Variables
Create a `.env` file in the `/server` directory:
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
PORT=3001
JWT_SECRET=your_jwt_secret
```

## 📱 Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Smooth animations and transitions
- Loading states and error handling

## 🎵 Spotify Integration
- OAuth 2.0 client credentials flow
- Dynamic playlist fetching
- Multiple language support
- Mood normalization and mapping

Enjoy building with Mind Beats! 🎧
"@

$devInfo | Out-File -FilePath "$rootPath\README.md" -Encoding UTF8

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "📝 Created files:" -ForegroundColor Yellow
Write-Host "   - start-app.ps1 (run both servers)" -ForegroundColor Gray
Write-Host "   - README.md (development guide)" -ForegroundColor Gray
Write-Host "   - .env (backend configuration)" -ForegroundColor Gray

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update .env with your Spotify API credentials" -ForegroundColor White
Write-Host "2. Run: .\start-app.ps1" -ForegroundColor White
Write-Host "3. Open: http://localhost:5173" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
