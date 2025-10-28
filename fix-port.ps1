# Fix port 80 conflict

param(
    [string]$VpsIp = "202.92.6.223",
    [int]$SshPort = 24700,
    [string]$User = "root"
)

Write-Host "=== Fixing Port 80 Conflict ===" -ForegroundColor Cyan

$sshTarget = "$User@$VpsIp"

Write-Host "[1] Finding what's using port 80..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "lsof -i :80 || netstat -tuln | grep :80"

Write-Host "`n[2] Stopping all Docker containers..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "docker stop `$(docker ps -aq) 2>/dev/null || echo 'No containers running'"

Write-Host "`n[3] Removing old containers..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "docker rm `$(docker ps -aq) 2>/dev/null || echo 'No containers to remove'"

Write-Host "`n[4] Starting GrowNet..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "cd /var/www/GrowNet && docker-compose up -d"

Write-Host "`n[5] Checking status..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "cd /var/www/GrowNet && docker-compose ps"

Write-Host "`n[SUCCESS] Done!" -ForegroundColor Green
