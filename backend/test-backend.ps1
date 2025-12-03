# Test backend locally
Write-Host "🧪 Testing GrowNet Backend..." -ForegroundColor Cyan

# Check if in backend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run from backend directory" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "`n⚠️  .env file not found, creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file. Please update MONGODB_URI if needed." -ForegroundColor Green
}

# Run TypeScript compiler check
Write-Host "`n🔍 Checking TypeScript compilation..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript compilation failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ All checks passed!" -ForegroundColor Green
Write-Host "`n🚀 Starting development server..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Gray

npm run dev
