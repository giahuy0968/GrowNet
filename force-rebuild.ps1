# Force rebuild without cache

param(
    [string]$VpsIp = "202.92.6.223",
    [int]$SshPort = 24700,
    [string]$User = "root"
)

Write-Host "=== Force Rebuild (No Cache) ===" -ForegroundColor Cyan

$sshTarget = "$User@$VpsIp"
$commands = "cd /var/www/GrowNet && docker-compose down && docker-compose build --no-cache && docker-compose up -d && docker-compose ps"

ssh -p $SshPort $sshTarget $commands
