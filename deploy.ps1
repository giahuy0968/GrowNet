# PowerShell Script to deploy GrowNet to VPS
# Run this script from Windows machine

param(
    [string]$VpsIp = "202.92.6.223",
    [int]$SshPort = 24700,
    [string]$User = "root",
    [switch]$SkipBuild
)

Write-Host "=== GrowNet Deployment Script ===" -ForegroundColor Cyan
Write-Host "VPS: $User@$($VpsIp):$SshPort" -ForegroundColor Green

# Check ssh command
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: SSH is not installed. Install OpenSSH from Windows Features." -ForegroundColor Red
    exit 1
}

# Check scp command
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: SCP is not installed." -ForegroundColor Red
    exit 1
}

# Create zip file
Write-Host "`n[1/5] Compressing project..." -ForegroundColor Yellow
$zipFile = "d:\GrowNet-deploy.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

# Compress project
Compress-Archive -Path "d:\GrowNet\*" -DestinationPath $zipFile -Force
Write-Host "[OK] Project compressed: $zipFile" -ForegroundColor Green

# Upload to VPS
Write-Host "`n[2/5] Uploading to VPS..." -ForegroundColor Yellow
$scpTarget = "$User@$($VpsIp):/tmp/"
scp -P $SshPort $zipFile $scpTarget

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Upload failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Upload successful" -ForegroundColor Green

# Execute deployment on VPS
Write-Host "`n[3/5] Extracting and setting up on VPS..." -ForegroundColor Yellow
$sshTarget = "$User@$VpsIp"
$remoteCommands = "cd /var/www; rm -rf GrowNet; mkdir -p GrowNet; unzip -o /tmp/GrowNet-deploy.zip -d GrowNet; cd GrowNet; cp .env.example .env; echo 'Setup completed'"

ssh -p $SshPort $sshTarget $remoteCommands

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Setup failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Setup successful" -ForegroundColor Green

# Build and start Docker containers
if (-not $SkipBuild) {
    Write-Host "`n[4/5] Building and starting containers..." -ForegroundColor Yellow
    $sshTarget = "$User@$VpsIp"
    $dockerCommands = "cd /var/www/GrowNet; docker-compose down; docker-compose up -d --build; echo 'Docker containers started'"
    
    ssh -p $SshPort $sshTarget $dockerCommands
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Containers are running" -ForegroundColor Green
}

# Check status
Write-Host "`n[5/5] Checking deployment..." -ForegroundColor Yellow
$sshTarget = "$User@$VpsIp"
ssh -p $SshPort $sshTarget "cd /var/www/GrowNet; docker-compose ps"

Write-Host "`n=== Deployment Complete! ===" -ForegroundColor Cyan
Write-Host "Frontend: http://$VpsIp" -ForegroundColor Green
Write-Host "Backend API: http://$VpsIp/api/health" -ForegroundColor Green
Write-Host "`nTo view logs:" -ForegroundColor Yellow
Write-Host "  ssh -p $SshPort $User@$VpsIp" -ForegroundColor White
Write-Host "  cd /var/www/GrowNet; docker-compose logs -f" -ForegroundColor White

# Cleanup
Remove-Item $zipFile -Force
Write-Host "`n[OK] Cleaned up temporary zip file" -ForegroundColor Green
