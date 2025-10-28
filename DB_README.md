# 🗄️ Quản lý Database GrowNet

## Tóm tắt nhanh

Bạn có **3 cách** để quản lý database MongoDB của GrowNet:

### ⚡ 1. Command Line (Nhanh)
```powershell
.\connect-mongodb.ps1
```
Kết nối trực tiếp vào MongoDB shell trên VPS.

### 🎨 2. MongoDB Compass (Khuyên dùng - GUI đẹp)
```powershell
# Bước 1: Tạo tunnel (giữ terminal này mở)
.\tunnel-mongodb.ps1

# Bước 2: Mở MongoDB Compass, connect với:
mongodb://admin:changethispassword123@localhost:27017/grownet?authSource=admin
```
**Download:** https://www.mongodb.com/try/download/compass

### 🌐 3. Mongo Express (Web UI)
- Truy cập: http://202.92.6.223:8081
- Username: `admin`
- Password: `admin123`

*(Cần enable bằng cách upload `docker-compose.with-ui.yml`)*

---

## 🚀 Khởi tạo Database

Tạo collections, indexes và dữ liệu mẫu:
```powershell
.\init-db.ps1
```

Sẽ tạo:
- ✅ 6 collections (users, posts, chats, messages, connections, notifications)
- ✅ Indexes để tối ưu performance
- ✅ 3 users mẫu (John, Jane, Mike)
- ✅ Posts, chats, messages mẫu

---

## 📖 Hướng dẫn chi tiết

Đọc file **`DB_MANAGEMENT_GUIDE.md`** để biết:
- Cách tạo/sửa/xóa documents
- Queries phức tạp (Aggregation)
- Backup & Restore
- Best practices

---

## 🎯 Workflow đề xuất

### Khi phát triển
1. Dùng **MongoDB Compass** (giao diện đẹp, dễ dùng)
2. Test queries trước khi đưa vào code
3. Xem dữ liệu trực quan

### Khi production
1. Dùng **Mongo Express** để quick check
2. Backup tự động hàng ngày
3. Monitor logs

---

## 📋 Các lệnh hữu ích

```javascript
// Trong MongoDB shell (sau khi chạy .\connect-mongodb.ps1)

// Xem collections
show collections

// Đếm users
db.users.countDocuments()

// Xem tất cả users
db.users.find().pretty()

// Tìm user theo email
db.users.findOne({ email: "john@grownet.com" })

// Tạo user mới
db.users.insertOne({
  username: "new_user",
  email: "new@example.com",
  fullName: "New User",
  createdAt: new Date()
})

// Update user
db.users.updateOne(
  { email: "new@example.com" },
  { $set: { bio: "Updated bio" } }
)

// Xóa user
db.users.deleteOne({ email: "new@example.com" })
```

---

## 🔐 Bảo mật

⚠️ **Quan trọng:**
1. Đổi password MongoDB trong `docker-compose.yml`
2. Đổi password Mongo Express nếu dùng
3. Không expose port 27017 ra internet
4. Backup định kỳ

---

## 🆘 Troubleshooting

### Không kết nối được MongoDB
```powershell
# Kiểm tra container đang chạy
.\debug-vps.ps1

# Hoặc SSH vào VPS
ssh root@202.92.6.223 -p 24700
docker ps | grep mongodb
docker logs grownet-mongodb
```

### Quên password
Password mặc định: `changethispassword123`
Xem trong file `docker-compose.yml`

---

## 📚 Xem thêm

- `DB_MANAGEMENT_GUIDE.md` - Hướng dẫn chi tiết đầy đủ
- `DATABASE_GUIDE.md` - Schema design & advanced queries
- `DEPLOY_GUIDE.md` - Hướng dẫn deploy

---

**Chạy `.\help.ps1` để xem menu nhanh!**
