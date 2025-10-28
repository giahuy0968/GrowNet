# Initialize database with schema and sample data

param(
    [string]$VpsIp = "202.92.6.223",
    [int]$SshPort = 24700,
    [string]$User = "root"
)

Write-Host "=== Initializing GrowNet Database ===" -ForegroundColor Cyan

$sshTarget = "$User@$VpsIp"

Write-Host "[1] Uploading database init script..." -ForegroundColor Yellow
scp -P $SshPort d:\GrowNet\init-database.js ${sshTarget}:/var/www/GrowNet/

Write-Host "`n[2] Running database initialization..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "cd /var/www/GrowNet && docker exec -i grownet-mongodb mongosh --username admin --password changethispassword123 --authenticationDatabase admin < init-database.js"

Write-Host "`n[3] Verifying data..." -ForegroundColor Yellow
ssh -p $SshPort $sshTarget "docker exec grownet-mongodb mongosh --username admin --password changethispassword123 --authenticationDatabase admin --eval 'use grownet; db.users.countDocuments()' --quiet"

Write-Host "`n[SUCCESS] Database initialized!" -ForegroundColor Green
Write-Host "You can now connect to explore the data." -ForegroundColor Cyan
