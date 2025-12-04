# Quick Backend Health Check
$VPS_IP = "202.92.6.223"
$BACKEND_URL = "http://${VPS_IP}:4000"

Write-Host "`n=== QUICK BACKEND STATUS CHECK ===" -ForegroundColor Cyan
Write-Host "VPS IP: $VPS_IP" -ForegroundColor Yellow
Write-Host ""

# Test Health
Write-Host "✓ Testing Health Endpoint..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/health" -Method GET
    Write-Host "  Status: $($response.status)" -ForegroundColor Green
    Write-Host "  ✅ Backend is RUNNING!" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Backend is DOWN!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Testing Available Routes..." -ForegroundColor Green

# List of endpoints to test
$endpoints = @(
    @{Path="/api/health"; Method="GET"; Description="Health Check"},
    @{Path="/api/auth/register"; Method="POST"; Description="User Registration"},
    @{Path="/api/auth/login"; Method="POST"; Description="User Login"},
    @{Path="/api/users/profile"; Method="GET"; Description="Get Profile"},
    @{Path="/api/posts"; Method="GET"; Description="Get Posts"},
    @{Path="/api/chats"; Method="GET"; Description="Get Chats"},
    @{Path="/api/connections"; Method="GET"; Description="Get Connections"},
    @{Path="/api/notifications"; Method="GET"; Description="Get Notifications"}
)

foreach ($endpoint in $endpoints) {
    try {
        $test = Invoke-WebRequest -Uri "$BACKEND_URL$($endpoint.Path)" -Method $endpoint.Method -ErrorAction Stop
        $status = $test.StatusCode
        Write-Host "  [$status] $($endpoint.Description) - ✅" -ForegroundColor Green
    } catch {
        $errorCode = $_.Exception.Response.StatusCode.value__
        if ($errorCode -eq 401) {
            Write-Host "  [401] $($endpoint.Description) - ⚠️  (Requires Auth)" -ForegroundColor Yellow
        } elseif ($errorCode -eq 404) {
            Write-Host "  [404] $($endpoint.Description) - ❌ (Not Found)" -ForegroundColor Red
        } else {
            Write-Host "  [$errorCode] $($endpoint.Description) - ⚠️" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== MongoDB Connection ===" -ForegroundColor Cyan
Write-Host "MongoDB URI: mongodb://***:***@202.92.6.223:27017/grownet" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Green
Write-Host "Frontend should use: http://$VPS_IP:3000" -ForegroundColor Green
