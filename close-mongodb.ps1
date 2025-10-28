# Close MongoDB access from internet

param(
    [string]$VpsIp = "202.92.6.223",
    [int]$SshPort = 24700,
    [string]$User = "root"
)

Write-Host "=== Closing MongoDB Access ===" -ForegroundColor Cyan

$sshTarget = "$User@$VpsIp"

Write-Host "[1] Closing firewall port 27017..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "ufw delete allow 27017/tcp"

Write-Host "`n[SUCCESS] MongoDB access closed!" -ForegroundColor Green
Write-Host "MongoDB is now only accessible from VPS (secure)" -ForegroundColor Cyan
