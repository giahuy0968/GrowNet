# Quick Deploy Script - Run from local machine
$VPS_IP = "202.92.6.223"

Write-Host "`n=== QUICK DEPLOY TO VPS ===" -ForegroundColor Cyan

# Step 1: Upload deploy script
Write-Host "`n[1] Uploading script..." -ForegroundColor Green
scp deploy-to-vps.sh root@${VPS_IP}:/root/GrowNet/

# Step 2: Execute on VPS
Write-Host "`n[2] Deploying on VPS..." -ForegroundColor Green
ssh root@$VPS_IP "cd /root/GrowNet && chmod +x deploy-to-vps.sh && bash deploy-to-vps.sh"

# Step 3: Test
Write-Host "`n[3] Testing..." -ForegroundColor Green
Start-Sleep 3
.\test-api.ps1
