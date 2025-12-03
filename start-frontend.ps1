# Start Frontend Server Script
Write-Host "=== Starting GrowNet Frontend ===" -ForegroundColor Cyan
Write-Host ""

Set-Location D:\GrowNet\frontend

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Green
npm run dev

Write-Host ""
Write-Host "Frontend stopped. Press any key to exit..." -ForegroundColor Red
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
