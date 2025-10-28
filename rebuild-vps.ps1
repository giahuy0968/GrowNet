# Quick rebuild script for VPS
# Run this after uploading new Dockerfile

param(
    [string]$VpsIp = "202.92.6.223",
    [int]$SshPort = 24700,
    [string]$User = "root"
)

Write-Host "=== Rebuilding GrowNet on VPS ===" -ForegroundColor Cyan

# Execute build on VPS
$sshTarget = "$User@$VpsIp"
$commands = "cd /var/www/GrowNet && chmod +x build-on-vps.sh && ./build-on-vps.sh"

Write-Host "Connecting to VPS and building..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget $commands

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Build completed!" -ForegroundColor Green
    Write-Host "Frontend: http://$VpsIp" -ForegroundColor Cyan
    Write-Host "Backend: http://$VpsIp/api/health" -ForegroundColor Cyan
} else {
    Write-Host "`n[ERROR] Build failed! Check logs above." -ForegroundColor Red
}
