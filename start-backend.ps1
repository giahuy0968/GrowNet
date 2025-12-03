# Start Backend Server Script
Write-Host "=== Starting GrowNet Backend ===" -ForegroundColor Cyan
Write-Host ""

Set-Location D:\GrowNet\backend

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Green
npm run dev

Write-Host ""
Write-Host "Backend stopped. Press any key to exit..." -ForegroundColor Red
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
