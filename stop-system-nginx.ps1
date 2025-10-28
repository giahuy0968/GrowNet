# Stop system nginx and start Docker nginx

param(
    [string]$VpsIp = "202.92.6.223",
    [int]$SshPort = 24700,
    [string]$User = "root"
)

Write-Host "=== Stopping System Nginx ===" -ForegroundColor Cyan

$sshTarget = "$User@$VpsIp"

Write-Host "[1] Stopping system Nginx service..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "systemctl stop nginx && systemctl disable nginx"

Write-Host "`n[2] Verifying port 80 is free..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "lsof -i :80 || echo 'Port 80 is free'"

Write-Host "`n[3] Starting Docker Nginx..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "cd /var/www/GrowNet && docker-compose up -d nginx"

Write-Host "`n[4] Checking all containers..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "cd /var/www/GrowNet && docker-compose ps"

Write-Host "`n[5] Testing endpoints..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "sleep 2 && curl -s http://localhost/api/health && echo ''"

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Frontend: http://$VpsIp" -ForegroundColor Green
Write-Host "Backend API: http://$VpsIp/api/health" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
