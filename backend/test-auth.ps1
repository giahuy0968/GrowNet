# ================== CẤU HÌNH CƠ BẢN ==================
$baseUrl = "http://localhost:4000"

Write-Host "Base URL: $baseUrl"
Write-Host ""

# ================== HÀM TIỆN ÍCH ==================

function Show-Response($title, $data) {
    Write-Host "=== $title ==="
    try {
        $json = $data | ConvertTo-Json -Depth 10
        Write-Host $json
    } catch {
        Write-Host $data
    }
    Write-Host ""
}

# ================== 1. ĐĂNG KÝ NGƯỜI DÙNG ==================

# 1.1. Đăng ký mentor
$mentorBody = @{
    name     = "Mentor One"
    email    = "mentor1@example.com"
    password = "Password123!"
    role     = "mentor"
} | ConvertTo-Json

$mentorRegisterResponse = Invoke-RestMethod `
    -Uri "$baseUrl/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $mentorBody

Show-Response "Register MENTOR" $mentorRegisterResponse

# 1.2. Đăng ký mentee
$menteeBody = @{
    name     = "Mentee One"
    email    = "mentee1@example.com"
    password = "Password123!"
    role     = "mentee"
} | ConvertTo-Json

$menteeRegisterResponse = Invoke-RestMethod `
    -Uri "$baseUrl/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $menteeBody

Show-Response "Register MENTEE" $menteeRegisterResponse

# ================== 2. ĐĂNG NHẬP LẤY TOKEN ==================

# 2.1. Login mentor
$mentorLoginBody = @{
    email    = "mentor1@example.com"
    password = "Password123!"
} | ConvertTo-Json

$mentorLoginResponse = Invoke-RestMethod `
    -Uri "$baseUrl/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $mentorLoginBody

Show-Response "Login MENTOR" $mentorLoginResponse

$mentorToken = $mentorLoginResponse.token
Write-Host "Mentor token: $($mentorToken.Substring(0, 20))..."
Write-Host ""

# 2.2. Login mentee
$menteeLoginBody = @{
    email    = "mentee1@example.com"
    password = "Password123!"
} | ConvertTo-Json

$menteeLoginResponse = Invoke-RestMethod `
    -Uri "$baseUrl/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $menteeLoginBody

Show-Response "Login MENTEE" $menteeLoginResponse

$menteeToken = $menteeLoginResponse.token
Write-Host "Mentee token: $($menteeToken.Substring(0, 20))..."
Write-Host ""

# ================== 3. KIỂM TRA PHÂN QUYỀN ==================

# 3.1. MENTEE gọi /api/users/mentors  → PHẢI ĐƯỢC
Write-Host ">>> MENTEE call GET /api/users/mentors (expected: OK)"
try {
    $res = Invoke-RestMethod `
        -Uri "$baseUrl/api/users/mentors" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $menteeToken" }
    Show-Response "Mentee -> /users/mentors" $res
} catch {
    Write-Host "Error:" $_.Exception.Message
    Write-Host ""
}

# 3.2. MENTEE gọi /api/users/mentees  → PHẢI BỊ 403
Write-Host ">>> MENTEE call GET /api/users/mentees (expected: 403)"
try {
    $res = Invoke-RestMethod `
        -Uri "$baseUrl/api/users/mentees" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $menteeToken" }
    Show-Response "Mentee -> /users/mentees" $res
} catch {
    Write-Host "Error:" $_.Exception.Message
    if ($_.Exception.Response -ne $null) {
        $body = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
        $bodyStr = $body.ReadToEnd()
        Write-Host "Response body:" $bodyStr
    }
    Write-Host ""
}

# 3.3. MENTOR gọi /api/users/mentees  → PHẢI ĐƯỢC
Write-Host ">>> MENTOR call GET /api/users/mentees (expected: OK)"
try {
    $res = Invoke-RestMethod `
        -Uri "$baseUrl/api/users/mentees" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $mentorToken" }
    Show-Response "Mentor -> /users/mentees" $res
} catch {
    Write-Host "Error:" $_.Exception.Message
    Write-Host ""
}

# 3.4. MENTOR gọi /api/users/mentors  → PHẢI BỊ 403
Write-Host ">>> MENTOR call GET /api/users/mentors (expected: 403)"
try {
    $res = Invoke-RestMethod `
        -Uri "$baseUrl/api/users/mentors" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $mentorToken" }
    Show-Response "Mentor -> /users/mentors" $res
} catch {
    Write-Host "Error:" $_.Exception.Message
    if ($_.Exception.Response -ne $null) {
        $body = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
        $bodyStr = $body.ReadToEnd()
        Write-Host "Response body:" $bodyStr
    }
    Write-Host ""
}

Write-Host "=== DONE ==="
