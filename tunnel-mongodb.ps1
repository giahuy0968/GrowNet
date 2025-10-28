# Create SSH tunnel to connect MongoDB Compass from Windows

param(
    [string]$VpsIp = "202.92.6.223",
    [int]$SshPort = 24700,
    [string]$User = "root",
    [int]$LocalPort = 27017
)

Write-Host "=== Creating SSH Tunnel for MongoDB ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 1: This terminal will create SSH tunnel..." -ForegroundColor Yellow
Write-Host "Step 2: Keep this window open!" -ForegroundColor Red
Write-Host "Step 3: Open MongoDB Compass in another window" -ForegroundColor Yellow
Write-Host ""
Write-Host "MongoDB Compass Connection String:" -ForegroundColor Green
Write-Host "mongodb://admin:changethispassword123@localhost:$LocalPort/grownet?authSource=admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Download MongoDB Compass: https://www.mongodb.com/try/download/compass" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop tunnel when done" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Gray

$sshTarget = "$User@$VpsIp"
ssh -p $SshPort -L ${LocalPort}:localhost:27017 -N $sshTarget
