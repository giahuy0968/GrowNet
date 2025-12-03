# Update backend code on VPS
param(
    [string]$VPS_IP = "202.92.6.223",
    [int]$VPS_PORT = 24700
)

Write-Host "🚀 Updating Backend on VPS..." -ForegroundColor Cyan

# Build locally first
Write-Host "`n📦 Building backend..." -ForegroundColor Yellow
cd backend
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

cd ..

# Copy backend files to VPS
Write-Host "`n📤 Uploading files to VPS..." -ForegroundColor Yellow
scp -P $VPS_PORT -r backend/src backend/package.json backend/tsconfig.json "root@${VPS_IP}:/root/grownet/backend/"

# Restart containers
Write-Host "`n🔄 Restarting containers..." -ForegroundColor Yellow
ssh -p $VPS_PORT "root@${VPS_IP}" "cd /root/grownet && docker-compose restart backend"

Write-Host "`n✅ Backend updated successfully!" -ForegroundColor Green
Write-Host "Check logs: docker-compose logs -f backend" -ForegroundColor Gray
