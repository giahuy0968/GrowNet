# Connect to MongoDB on VPS and open interactive shell

param(
    [string]$VpsIp = "202.92.6.223",
    [int]$SshPort = 24700,
    [string]$User = "root"
)

Write-Host "=== Connecting to MongoDB on VPS ===" -ForegroundColor Cyan
Write-Host "Password: changethispassword123" -ForegroundColor Yellow
Write-Host ""

$sshTarget = "$User@$VpsIp"
$mongoCommand = "docker exec -it grownet-mongodb mongosh 'mongodb://admin:changethispassword123@localhost:27017/grownet?authSource=admin'"

ssh -p $SshPort -t $sshTarget $mongoCommand
