# HƯỚNG DẪN KẾT NỐI MONGODB TRỰC TIẾP

## ✅ Đã hoàn tất!

MongoDB đã được expose và có thể kết nối trực tiếp từ máy Windows.

---

## 🔌 CÁCH KẾT NỐI

### Dùng MongoDB Compass (GUI):

1. **Mở MongoDB Compass**
   - Download: https://www.mongodb.com/try/download/compass

2. **Nhập Connection String:**
   ```
   mongodb://admin:changethispassword123@202.92.6.223:27017/grownet?authSource=admin
   ```

3. **Click "Connect"** - Xong!

### Dùng mongosh (Command Line):

```powershell
mongosh "mongodb://admin:changethispassword123@202.92.6.223:27017/grownet?authSource=admin"
```

### Từ code (Node.js):

```javascript
const { MongoClient } = require('mongodb');

const uri = "mongodb://admin:changethispassword123@202.92.6.223:27017/grownet?authSource=admin";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('grownet');
    const users = database.collection('users');
    
    // Query
    const user = await users.findOne({ email: "john@grownet.com" });
    console.log(user);
  } finally {
    await client.close();
  }
}

run();
```

---

## ⚠️ BẢO MẬT

**QUAN TRỌNG:** MongoDB đang mở ra internet!

### Rủi ro:
- ❌ Bất kỳ ai cũng có thể thử connect
- ❌ Có thể bị brute force password
- ❌ Có thể bị DDoS

### Khuyến nghị:

1. **Chỉ dùng tạm thời** để test/phát triển
2. **Đổi password mạnh** trong `docker-compose.yml`
3. **Đóng port sau khi xong:**
   ```powershell
   .\close-mongodb.ps1
   ```

### Cho Production:
- ✅ Dùng SSH tunnel thay vì expose trực tiếp
- ✅ Hoặc dùng VPN
- ✅ Hoặc IP whitelist

---

## 🔒 ĐÓNG PORT KHI XONG

Khi không cần nữa, đóng port lại:

```powershell
.\close-mongodb.ps1
```

Hoặc manual:
```bash
ssh root@202.92.6.223 -p 24700
ufw delete allow 27017/tcp
```

---

## 🔄 MỞ LẠI KHI CẦN

```powershell
.\expose-mongodb.ps1
```

---

## 🆚 SO SÁNH CÁC CÁCH KẾT NỐI

| Cách | Bảo mật | Dễ dùng | Khuyên dùng |
|------|---------|---------|-------------|
| **SSH Tunnel** (`.\tunnel-mongodb.ps1`) | ✅✅✅ Rất cao | ⚠️ Cần giữ terminal | ✅ Production |
| **Expose Port** (`.\expose-mongodb.ps1`) | ❌ Thấp | ✅✅✅ Rất dễ | ⚠️ Chỉ dev/test |
| **Mongo Express** (Web UI) | ✅✅ Cao | ✅✅ Dễ | ✅ Quick check |

---

## 🎯 WORKFLOW ĐỀ XUẤT

### Khi phát triển (1-2 giờ):
1. `.\expose-mongodb.ps1` - Mở port
2. Dùng MongoDB Compass làm việc
3. `.\close-mongodb.ps1` - Đóng port khi xong

### Khi production:
- Luôn dùng SSH tunnel: `.\tunnel-mongodb.ps1`

---

## 📊 KIỂM TRA KẾT NỐI

Test xem đã connect được chưa:

```powershell
# Test từ Windows
mongosh "mongodb://admin:changethispassword123@202.92.6.223:27017/grownet?authSource=admin" --eval "db.serverStatus().ok"
```

Nếu trả về `1` = Thành công! ✅

---

## 🆘 TROUBLESHOOTING

### Lỗi: Connection timeout
```powershell
# Kiểm tra firewall
ssh root@202.92.6.223 -p 24700
ufw status | grep 27017
```

### Lỗi: Authentication failed
- Kiểm tra password trong `docker-compose.yml`
- Password mặc định: `changethispassword123`

### Lỗi: Cannot connect
```powershell
# Kiểm tra MongoDB đang chạy
ssh root@202.92.6.223 -p 24700
docker ps | grep mongodb
docker logs grownet-mongodb
```

---

**Connection String đã copy sẵn để dùng:**
```
mongodb://admin:changethispassword123@202.92.6.223:27017/grownet?authSource=admin
```
