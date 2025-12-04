# Backend API Test
$VPS = "202.92.6.223:4000"
$URL = "http://$VPS"
$TOKEN = ""
$OK = 0
$FAIL = 0

function Test-API {
    param([string]$Name, [string]$Method, [string]$Path, $Body, [string]$Token)
    Write-Host "Test: $Name" -ForegroundColor Cyan
    try {
        $h = @{"Content-Type"="application/json"}
        if ($Token) { $h["Authorization"] = "Bearer $Token" }
        $p = @{Uri="$URL$Path"; Method=$Method; Headers=$h; TimeoutSec=10}
        if ($Body) { $p["Body"] = ($Body | ConvertTo-Json) }
        $r = Invoke-RestMethod @p
        Write-Host "  [OK]" -ForegroundColor Green
        $script:OK++
        return $r
    } catch {
        Write-Host "  [FAIL] $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        $script:FAIL++
    }
}

Write-Host "`n=== BACKEND API TEST ===`n" -ForegroundColor Yellow
Test-API -Name "Health" -Method "GET" -Path "/api/health"

$ts = Get-Date -Format "HHmmss"
$u = @{username="t$ts"; email="t$ts@test.com"; password="Test123"; fullName="Test"}
$reg = Test-API -Name "Register" -Method "POST" -Path "/api/auth/register" -Body $u
if ($reg.token) { $TOKEN = $reg.token; Write-Host "Token saved" -ForegroundColor Green }

Test-API -Name "Get User" -Method "GET" -Path "/api/auth/me" -Token $TOKEN
Test-API -Name "Create Post" -Method "POST" -Path "/api/posts" -Body @{content="Test"} -Token $TOKEN
Test-API -Name "Get Posts" -Method "GET" -Path "/api/posts" -Token $TOKEN
Test-API -Name "Get Chats" -Method "GET" -Path "/api/chats" -Token $TOKEN

Write-Host "`n=== RESULT ===" -ForegroundColor Yellow
Write-Host "OK: $OK | FAIL: $FAIL" -ForegroundColor White
