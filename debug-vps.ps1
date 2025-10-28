# Debug script for VPS
# Run this to diagnose issues

param(
    [string]$VpsIp = "202.92.6.223",
    [int]$SshPort = 24700,
    [string]$User = "root"
)

Write-Host "=== Debugging GrowNet on VPS ===" -ForegroundColor Cyan

$sshTarget = "$User@$VpsIp"

Write-Host "`n[1] Checking Docker service..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "systemctl status docker --no-pager | head -20"

Write-Host "`n[2] Checking docker-compose.yml exists..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "cd /var/www/GrowNet && ls -la docker-compose.yml Dockerfile"

Write-Host "`n[3] Checking container status..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "cd /var/www/GrowNet && docker-compose ps -a"

Write-Host "`n[4] Checking recent logs..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "cd /var/www/GrowNet && docker-compose logs --tail=50"

Write-Host "`n[5] Trying to build..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "cd /var/www/GrowNet && docker-compose build 2>&1 | tail -30"
