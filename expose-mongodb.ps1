# Enable direct MongoDB access (NOT RECOMMENDED for production)

param(
    [string]$VpsIp = "202.92.6.223",
    [int]$SshPort = 24700,
    [string]$User = "root"
)

Write-Host "=== Enabling Direct MongoDB Access ===" -ForegroundColor Cyan
Write-Host "WARNING: This exposes MongoDB to internet!" -ForegroundColor Red
Write-Host "Only do this temporarily for testing!" -ForegroundColor Yellow
Write-Host ""

$sshTarget = "$User@$VpsIp"

Write-Host "[1] Opening firewall port 27017..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "ufw allow 27017/tcp"

Write-Host "`n[2] Updating MongoDB to listen on all interfaces..." -ForegroundColor Yellow
$commands = "cd /var/www/GrowNet; docker-compose down; docker-compose up -d"

ssh -p $SshPort $sshTarget $commands

Write-Host "`n[SUCCESS] MongoDB is now accessible!" -ForegroundColor Green
Write-Host ""
Write-Host "Connection String for MongoDB Compass:" -ForegroundColor Cyan
Write-Host "mongodb://admin:changethispassword123@${VpsIp}:27017/grownet?authSource=admin" -ForegroundColor White
Write-Host ""
Write-Host "WARNING: Remember to close port when done:" -ForegroundColor Red
Write-Host "ssh root@${VpsIp} -p ${SshPort}" -ForegroundColor Yellow
Write-Host "ufw delete allow 27017/tcp" -ForegroundColor Yellow
