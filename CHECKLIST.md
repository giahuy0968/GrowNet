# GROWNET - CHECKLIST LOCALHOST → VPS (202.92.6.223:27017)

## 📋 TỔNG QUAN
- **VPS IP**: 202.92.6.223
- **MongoDB Port**: 27017
- **Backend Port**: 4000
- **Frontend Port**: 3000
- **Tổng số vị trí dùng localhost**: 27 chỗ

---

## 🔴 CẦN SỬA ĐỔI NGAY (CRITICAL - Production Code)

### 1. Backend CORS Configuration ⚠️ QUAN TRỌNG
**File**: `backend/src/index.ts` (lines 34-41)
- [x] Line 36: `'http://localhost:3000'` → Đã có VPS IP
- [x] Line 37: `'http://localhost:5173'` → Đã có VPS IP  
- [x] Line 41: `process.env.CLIENT_URL || 'http://localhost:3000'` → Có fallback localhost
- **Trạng thái**: ✅ Đã có VPS trong CORS, nhưng vẫn giữ localhost cho dev

### 2. Frontend API Configuration ⚠️ QUAN TRỌNG
**File**: `frontend/src/config/api.ts` (lines 2-3)
- [x] Line 2: `export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'`
- [x] Line 3: `export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'`
- **Trạng thái**: ✅ Đã thêm fallback thông minh (dev = localhost, prod = VPS)

### 3. Frontend Vite Proxy Configuration
**File**: `frontend/vite.config.ts` (line 10)
- [x] Line 10: `target: 'http://localhost:4000'`
- **Trạng thái**: ✅ Cho phép cấu hình qua biến `VITE_PROXY_TARGET`

### 4. Environment Files (Templates)
**File**: `backend/.env.example` (line 8)
- [x] `MONGODB_URI=mongodb://admin:changethispassword123@localhost:27017/grownet?authSource=admin`
- **Trạng thái**: ✅ Mặc định trỏ VPS, giữ dòng localhost comment cho dev

**File**: `.env.example` (line 6)
- [x] `MONGODB_URI=mongodb://localhost:27017/grownet`
- **Trạng thái**: ✅ Template mặc định dùng VPS, kèm tùy chọn localhost

---

## 🟡 TÀI LIỆU & HƯỚNG DẪN (Documentation)

### 5. README.md
**File**: `README.md`
- [x] Line 56: `CLIENT_URL=http://localhost:5173`
- [x] Line 59: `MONGODB_URI=mongodb://localhost:27017/grownet`
- [x] Line 85: `VITE_API_URL=http://localhost:4000/api`
- [x] Line 86: `VITE_SOCKET_URL=http://localhost:4000`
- [x] Line 97-99: URLs trong phần hướng dẫn
- **Trạng thái**: ✅ README phân biệt Production vs Local

### 6. API Integration Guide
**File**: `frontend/API_INTEGRATION_GUIDE.md`
- [x] Line 197: `VITE_API_URL=http://localhost:4000/api`
- [x] Line 198: `VITE_SOCKET_URL=http://localhost:4000`
- [x] Line 213: `target: 'http://localhost:4000'`
- **Trạng thái**: ✅ Guide hiển thị giá trị VPS + hướng dẫn dev

---

## 🟢 CÔNG CỤ & SCRIPTS (Tools - OK để giữ localhost)

### 7. PowerShell Scripts (Development Tools)
Các file này **CÓ THỂ GIỮ LOCALHOST** vì dùng cho SSH tunnel hoặc Docker local:

- ✅ `connect-mongodb.ps1` - Dùng docker exec vào container local
- ✅ `tunnel-mongodb.ps1` - Tạo SSH tunnel, localhost là đúng
- ✅ `help.ps1` - Hướng dẫn dev
- ✅ `stop-system-nginx.ps1` - Test sau khi deploy

### 8. Postman Environment
**File**: `GrowNet-Local.postman_environment.json`
- ✅ Line 7: `"value": "http://localhost:4000/api"` 
- **Trạng thái**: OK - Đây là env LOCAL, đã có Production env riêng

### 9. VS Code Launch Config
**File**: `.vscode/launch.json`
- ✅ Lines 10-11: Chrome debug config
- **Trạng thái**: OK - Dùng cho debug local

---

## 🔵 DOCKER & DEPLOYMENT (Container Config)

### 10. Docker Compose
**File**: `docker-compose.yml`
- ✅ Line 29: `MONGODB_URI=mongodb://admin:changethispassword123@mongodb:27017/...`
- **Trạng thái**: OK - Dùng service name `mongodb` (không phải localhost)

### 11. Deploy Scripts
**File**: `deploy-to-vps.sh`
- ✅ Line 86: `echo "Test it: curl http://localhost:4000/api/health"`
- **Trạng thái**: OK - Test command trên VPS local

---

## ✅ ĐÃ CẤU HÌNH ĐÚNG (HOÀN THÀNH)

### 1. Cấu hình môi trường
- [x] Backend `.env` - Đã cấu hình với MongoDB VPS
- [x] Frontend `.env` - Đã cấu hình với API VPS
- [x] CORS - Đã thêm IP VPS vào allowed origins
- [x] MongoDB Connection - Đã kết nối thành công đến 202.92.6.223:27017

### 2. Code Structure
- [x] Models - Tất cả 6 models đã implement (User, Post, Chat, Message, Connection, Notification)
- [x] Controllers - Tất cả 6 controllers đã implement đầy đủ
- [x] Routes - Tất cả 6 route files đã tạo
- [x] Middleware - Auth và ErrorHandler đã có
- [x] Socket.IO - Đã setup trong index.ts

### 3. Build & Deploy
- [x] Dependencies installed
- [x] No merge conflicts
- [x] Code pushed to GitHub
- [x] MongoDB URI configured


---

## 📊 HÀNH ĐỘNG ƯU TIÊN (TODO)

### 🔴 Mức 1 - KHẨN CẤP (Phải sửa cho Production)
1. [x] **Sửa frontend/src/config/api.ts**
   - ✅ Đã thêm fallback tự động (dev = localhost, prod = VPS)

2. [ ] **Kiểm tra file .env thực tế trên VPS**
   ```bash
   # Trên VPS
   cat /root/GrowNet/backend/.env
   cat /root/GrowNet/frontend/.env
   ```

3. [ ] **Verify CORS origins**
   - Đảm bảo backend chấp nhận requests từ domain production
   - Check nếu dùng domain name thay vì IP

### 🟡 Mức 2 - QUAN TRỌNG (Cập nhật tài liệu)
4. [x] **Cập nhật README.md**
   - ✅ Phân biệt rõ Production vs Local

5. [x] **Cập nhật API_INTEGRATION_GUIDE.md**
   - ✅ Ví dụ env và proxy đã phản ánh VPS

6. [x] **Cập nhật .env.example files**
   - ✅ backend/.env.example
   - ✅ .env.example ở root

### 🟢 Mức 3 - TỐT NÊN CÓ (Nice to have)
7. [ ] **Tạo Postman environment mới**
   - File: GrowNet-VPS.postman_environment.json
   - Base URL: http://202.92.6.223:4000/api

8. [x] **Cập nhật vite.config.ts**
   - ✅ Cấu hình qua biến `VITE_PROXY_TARGET`

---

## 🎯 TỔNG KẾT & KHUYẾN NGHỊ

### Chiến lược tiếp cận:
1. **Environment Variables** (Tốt nhất) ✅
   - Dùng `.env` files khác nhau cho dev/prod
   - Code giữ localhost làm fallback cho dev local
   - Production deploy với env variables đúng

2. **Code Changes** (Nếu cần)
   - Chỉ sửa fallback values trong `frontend/src/config/api.ts`
   - Để lại localhost trong dev tools (PowerShell scripts, Postman Local, etc.)

3. **Documentation** (Nên làm)
   - Cập nhật README với ví dụ VPS
   - Phân biệt rõ local dev vs production setup

### Files KHÔNG CẦN SỬA (Giữ nguyên):
- ✅ PowerShell scripts (dev tools)
- ✅ docker-compose.yml (dùng service names)
- ✅ tunnel-mongodb.ps1 (SSH tunnel concept)
- ✅ GrowNet-Local.postman_environment.json (đã có Production env)
- ✅ .vscode/launch.json (debug config)
- ✅ deploy scripts (localhost đúng khi test trên VPS)

### Files CẦN REVIEW:
- ⚠️ backend/src/index.ts (đảm bảo CLIENT_URL cập nhật nếu đổi domain)
- 📝 `.env` trên VPS (cần kiểm tra thủ công)
- 📝 Postman environments (cân nhắc thêm bản VPS)

---

## 🔍 COMMAND ĐỂ KIỂM TRA

### Kiểm tra file .env hiện tại:
```powershell
# Local
Get-Content .\.env
Get-Content .\backend\.env
Get-Content .\frontend\.env
```

### Kiểm tra trên VPS:
```bash
ssh root@202.92.6.223
cd /root/GrowNet
cat backend/.env | grep MONGODB_URI
cat frontend/.env | grep VITE_
```

### Test API sau khi sửa:
```powershell
.\test-api.ps1
```

---

## 📞 CHECKLIST CHO LẦN SAU DEPLOY

- [ ] Pull code mới nhất trên VPS
- [ ] Verify .env files có đúng VPS settings
- [ ] Rebuild frontend: `npm run build`
- [ ] Restart backend: `pm2 restart grownet-backend`
- [ ] Test API endpoints
- [ ] Test Socket.IO real-time features
- [ ] Check browser console không có CORS errors
- [ ] Check MongoDB connection successful

---

*Cập nhật lần cuối: 2025-12-05*
*VPS: 202.92.6.223 | MongoDB: 27017 | Backend: 4000 | Frontend: 3000*
- **Health Check**: ✅ PASS
- **API Routes**: ❌ FAIL (404 errors)

### Tỷ lệ thành công
- Tests Passed: 1/6 (16.7%)
- Tests Failed: 5/6 (83.3%)

### Phân tích
Backend **server đang chạy** nhưng **routes không hoạt động** → Có thể code trên VPS chưa được update

## 🎯 BƯỚC TIẾP THEO ƯU TIÊN

**TỨ C CÂN LÀM NGAY:**

1. **Truy cập VPS và kiểm tra:**
   ```bash
   ssh root@202.92.6.223
   cd /root/GrowNet
   git status
   git log --oneline -5
   ```

2. **Pull code mới:**
   ```bash
   git pull origin main
   ```

3. **Rebuild backend:**
   ```bash
   cd backend
   npm install
   npm run build
   ```

4. **Restart với PM2:**
   ```bash
   pm2 restart grownet-backend
   pm2 logs grownet-backend
   ```

5. **Test lại:**
   ```powershell
   # Từ máy local
   .\test-api.ps1
   ```

## 📝 NOTES

- Backend code đã được fix conflicts và push lên GitHub
- Local development environment đã sẵn sàng
- Cần SSH vào VPS để deploy code mới
- Port 22 (SSH) có thể bị block hoặc cần key authentication

## 🔗 QUICK LINKS

- GitHub Repo: https://github.com/giahuy0968/GrowNet
- Backend URL: http://202.92.6.223:4000
- Health Check: http://202.92.6.223:4000/api/health
- MongoDB: mongodb://***@202.92.6.223:27017/grownet

---

**Status**: 🟡 Backend running but routes not working - Need to deploy latest code to VPS
**Priority**: 🔴 HIGH - Cannot register/login users
**Next**: Deploy latest code to VPS and restart backend service
