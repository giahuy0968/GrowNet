# Test Backend API Script
$VPS_IP = "202.92.6.223"
$BACKEND_URL = "http://${VPS_IP}:4000"

Write-Host "`n=== TESTING GROWNET BACKEND ===" -ForegroundColor Cyan
Write-Host "Testing Backend at: $BACKEND_URL" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Green
try {
    $health = Invoke-RestMethod -Uri "$BACKEND_URL/api/health" -Method GET -TimeoutSec 5
    Write-Host "   ✅ Health Check: PASS" -ForegroundColor Green
    Write-Host "   Response: $($health | ConvertTo-Json)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Health Check: FAIL" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Register User
Write-Host "2. Testing User Registration..." -ForegroundColor Green
$registerBody = @{
    username = "testuser_$(Get-Random -Maximum 9999)"
    email = "test_$(Get-Random -Maximum 9999)@example.com"
    password = "Test123456"
    fullName = "Test User"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -TimeoutSec 5
    Write-Host "   ✅ Registration: PASS" -ForegroundColor Green
    $token = $register.token
    Write-Host "   Token received: $($token.Substring(0, 20))..." -ForegroundColor White
} catch {
    Write-Host "   ⚠️  Registration: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Login
Write-Host "3. Testing Login..." -ForegroundColor Green
$loginBody = @{
    email = "test@example.com"
    password = "Test123456"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 5
    Write-Host "   ✅ Login: PASS" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Login: Expected (no test user yet)" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Socket.IO Connection
Write-Host "4. Testing Socket.IO..." -ForegroundColor Green
try {
    $socket = Invoke-WebRequest -Uri "$BACKEND_URL/socket.io/" -Method GET -TimeoutSec 5
    if ($socket.StatusCode -eq 200) {
        Write-Host "   ✅ Socket.IO: PASS" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Socket.IO: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Test 5: CORS Headers
Write-Host "5. Testing CORS Configuration..." -ForegroundColor Green
try {
    $cors = Invoke-WebRequest -Uri "$BACKEND_URL/api/health" -Method OPTIONS -TimeoutSec 5
    $corsHeaders = $cors.Headers["Access-Control-Allow-Origin"]
    if ($corsHeaders) {
        Write-Host "   ✅ CORS: PASS" -ForegroundColor Green
        Write-Host "   Allowed Origins: $corsHeaders" -ForegroundColor White
    }
} catch {
    Write-Host "   ⚠️  CORS: Could not verify" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== TEST COMPLETED ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check Postman collection: GrowNet-API.postman_collection.json" -ForegroundColor Yellow
Write-Host "Backend logs: Check terminal running 'npm run dev'" -ForegroundColor Yellow
