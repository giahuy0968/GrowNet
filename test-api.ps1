# Test API endpoints
$BASE_URL = "http://202.92.6.223/api"

Write-Host "🧪 Testing GrowNet API Endpoints...`n" -ForegroundColor Cyan

# Test health
Write-Host "1️⃣ Health Check..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get
Write-Host "   Status: $($response.status)" -ForegroundColor Green

# Register test user
Write-Host "`n2️⃣ Register User..." -ForegroundColor Yellow
$registerBody = @{
    username = "testuser_$(Get-Random -Maximum 9999)"
    email = "test_$(Get-Random -Maximum 9999)@example.com"
    password = "password123"
    fullName = "Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody
    
    $token = $registerResponse.token
    Write-Host "   ✅ User registered" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get current user
Write-Host "`n3️⃣ Get Current User..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $meResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/me" `
        -Method Get `
        -Headers $headers
    
    Write-Host "   ✅ User: $($meResponse.user.username)" -ForegroundColor Green
    $userId = $meResponse.user._id
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Create post
Write-Host "`n4️⃣ Create Post..." -ForegroundColor Yellow
try {
    $postBody = @{
        content = "Hello from API test! 🚀"
    } | ConvertTo-Json
    
    $postResponse = Invoke-RestMethod -Uri "$BASE_URL/posts" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $postBody
    
    Write-Host "   ✅ Post created" -ForegroundColor Green
    $postId = $postResponse.post._id
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Get posts feed
Write-Host "`n5️⃣ Get Posts Feed..." -ForegroundColor Yellow
try {
    $feedResponse = Invoke-RestMethod -Uri "$BASE_URL/posts" `
        -Method Get `
        -Headers $headers
    
    Write-Host "   ✅ Found $($feedResponse.count) posts" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Search users
Write-Host "`n6️⃣ Search Users..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-RestMethod -Uri "$BASE_URL/users/search?q=test" `
        -Method Get `
        -Headers $headers
    
    Write-Host "   ✅ Found $($searchResponse.count) users" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ All tests completed!`n" -ForegroundColor Green
