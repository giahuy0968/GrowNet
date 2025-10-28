# Quick reference for all database management scripts

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   GROWNET DATABASE MANAGEMENT" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[DOCUMENTATION]" -ForegroundColor Yellow
Write-Host "  Read: DB_MANAGEMENT_GUIDE.md" -ForegroundColor White
Write-Host ""

Write-Host "[CONNECTION OPTIONS]" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Command Line (Quick)" -ForegroundColor Green
Write-Host "     .\connect-mongodb.ps1" -ForegroundColor White
Write-Host ""
Write-Host "  2. MongoDB Compass (Recommended)" -ForegroundColor Green
Write-Host "     Step 1: .\tunnel-mongodb.ps1 (keep running)" -ForegroundColor White
Write-Host "     Step 2: Open MongoDB Compass" -ForegroundColor White
Write-Host "     Step 3: mongodb://admin:changethispassword123@localhost:27017/grownet?authSource=admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Web UI (Mongo Express)" -ForegroundColor Green
Write-Host "     http://202.92.6.223:8081 (admin/admin123)" -ForegroundColor Cyan
Write-Host ""

Write-Host "[DATABASE OPERATIONS]" -ForegroundColor Yellow
Write-Host "  Initialize Schema: .\init-db.ps1" -ForegroundColor White
Write-Host ""

Write-Host "[DEPLOYMENT]" -ForegroundColor Yellow
Write-Host "  Full Deploy:       .\deploy.ps1" -ForegroundColor White
Write-Host "  Rebuild:           .\rebuild-vps.ps1" -ForegroundColor White
Write-Host "  Force Rebuild:     .\force-rebuild.ps1" -ForegroundColor White
Write-Host ""

Write-Host "[TROUBLESHOOTING]" -ForegroundColor Yellow
Write-Host "  Debug:             .\debug-vps.ps1" -ForegroundColor White
Write-Host "  Fix Port 80:       .\fix-port.ps1" -ForegroundColor White
Write-Host ""

Write-Host "[QUICK ACCESS]" -ForegroundColor Yellow
Write-Host "  Frontend:  http://202.92.6.223" -ForegroundColor Cyan
Write-Host "  API:       http://202.92.6.223/api/health" -ForegroundColor Cyan
Write-Host "  Mongo UI:  http://202.92.6.223:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
