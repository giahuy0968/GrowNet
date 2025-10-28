# HƯỚNG DẪN QUẢN LÝ DATABASE GROWNET

## 📋 MỤC LỤC

1. [Kết nối Database](#1-kết-nối-database)
2. [Khởi tạo Schema & Sample Data](#2-khởi-tạo-schema--sample-data)
3. [Sử dụng MongoDB Compass (GUI)](#3-sử-dụng-mongodb-compass-gui)
4. [Sử dụng Mongo Express (Web UI)](#4-sử-dụng-mongo-express-web-ui)
5. [Các thao tác Database phổ biến](#5-các-thao-tác-database-phổ-biến)
6. [Backup & Restore](#6-backup--restore)

---

## 1. KẾT NỐI DATABASE

### Cách 1: Từ Windows PowerShell (Command Line)

```powershell
# Kết nối trực tiếp
.\connect-mongodb.ps1
```

Sau đó bạn sẽ vào MongoDB shell, có thể chạy các lệnh:
```javascript
// Xem tất cả collections
show collections

// Xem users
db.users.find().pretty()

// Đếm số users
db.users.countDocuments()
```

### Cách 2: Từ máy Windows (MongoDB Compass - Khuyên dùng!)

**Bước 1:** Tải MongoDB Compass
- Link: https://www.mongodb.com/try/download/compass
- Cài đặt MongoDB Compass

**Bước 2:** Tạo SSH tunnel
```powershell
.\tunnel-mongodb.ps1
```
Giữ cửa sổ này mở!

**Bước 3:** Mở MongoDB Compass, dùng connection string:
```
mongodb://admin:changethispassword123@localhost:27017/grownet?authSource=admin
```

**Bước 4:** Click "Connect" - Xong! Bạn có giao diện đồ họa để quản lý DB

### Cách 3: Web UI (Mongo Express)

**Bước 1:** Upload docker-compose mới:
```powershell
scp -P 24700 d:\GrowNet\docker-compose.with-ui.yml root@202.92.6.223:/var/www/GrowNet/docker-compose.yml
```

**Bước 2:** SSH vào VPS và restart:
```bash
ssh root@202.92.6.223 -p 24700
cd /var/www/GrowNet
docker-compose down
docker-compose up -d
```

**Bước 3:** Truy cập Mongo Express:
- URL: http://202.92.6.223:8081
- Username: `admin`
- Password: `admin123`

---

## 2. KHỞI TẠO SCHEMA & SAMPLE DATA

Chạy script để tạo collections, indexes và dữ liệu mẫu:

```powershell
.\init-db.ps1
```

Script này sẽ tạo:
- ✅ 6 collections: users, posts, chats, messages, connections, notifications
- ✅ Indexes để optimize performance
- ✅ 3 sample users (John, Jane, Mike)
- ✅ 3 sample posts
- ✅ Sample chats & messages
- ✅ Sample connections (friendships)
- ✅ Sample notifications

---

## 3. SỬ DỤNG MONGODB COMPASS (GUI)

### Xem dữ liệu
1. Mở collection (VD: `users`)
2. Xem documents dạng JSON
3. Edit trực tiếp bằng cách click vào document

### Tìm kiếm
```javascript
// Tìm user theo email
{ email: "john@grownet.com" }

// Tìm posts có nhiều likes
{ "likes.1": { $exists: true } }

// Tìm messages trong 1 chat
{ chatId: ObjectId("...") }
```

### Thêm document mới
1. Click "ADD DATA" → "Insert Document"
2. Nhập JSON:
```json
{
  "username": "new_user",
  "email": "new@example.com",
  "fullName": "New User",
  "createdAt": { "$date": "2025-10-28T00:00:00.000Z" }
}
```

### Sửa document
1. Click vào document
2. Edit trực tiếp
3. Click "UPDATE"

### Xóa document
1. Hover vào document
2. Click icon thùng rác

### Aggregation Pipeline
Chuyển tab "Aggregations" để chạy complex queries:
```javascript
[
  {
    $lookup: {
      from: "users",
      localField: "authorId",
      foreignField: "_id",
      as: "author"
    }
  },
  {
    $sort: { createdAt: -1 }
  }
]
```

---

## 4. SỬ DỤNG MONGO EXPRESS (WEB UI)

### Truy cập
- URL: http://202.92.6.223:8081
- User/Pass: admin/admin123

### Chức năng
- ✅ Xem tất cả collections
- ✅ Browse documents
- ✅ Add/Edit/Delete documents
- ✅ Run queries
- ✅ View indexes
- ✅ Export data

### Ưu điểm
- Không cần cài gì trên máy local
- Truy cập từ bất kỳ đâu qua browser
- Giao diện đơn giản, dễ sử dụng

---

## 5. CÁC THAO TÁC DATABASE PHỔ BIẾN

### A. Quản lý Users

```javascript
// Tạo user mới
db.users.insertOne({
  username: "test_user",
  email: "test@example.com",
  password: "$2b$10$hashed_password_here",
  fullName: "Test User",
  bio: "This is a test user",
  interests: ["coding", "music"],
  location: { city: "Hanoi", country: "Vietnam" },
  createdAt: new Date(),
  updatedAt: new Date()
})

// Tìm user
db.users.findOne({ email: "test@example.com" })

// Update user profile
db.users.updateOne(
  { email: "test@example.com" },
  { 
    $set: { 
      bio: "Updated bio",
      updatedAt: new Date()
    }
  }
)

// Xóa user
db.users.deleteOne({ email: "test@example.com" })

// Lấy users theo interests
db.users.find({ interests: "coding" })

// Search users (cần text index)
db.users.find({ 
  $or: [
    { username: /test/i },
    { fullName: /test/i }
  ]
})
```

### B. Quản lý Posts

```javascript
// Tạo post mới
db.posts.insertOne({
  authorId: ObjectId("user_id_here"),
  content: "My first post on GrowNet!",
  images: [],
  likes: [],
  comments: [],
  createdAt: new Date(),
  updatedAt: new Date()
})

// Lấy posts của user
db.posts.find({ 
  authorId: ObjectId("user_id_here") 
}).sort({ createdAt: -1 })

// Like post
db.posts.updateOne(
  { _id: ObjectId("post_id") },
  { $addToSet: { likes: ObjectId("user_id") } }
)

// Unlike post
db.posts.updateOne(
  { _id: ObjectId("post_id") },
  { $pull: { likes: ObjectId("user_id") } }
)

// Comment on post
db.posts.updateOne(
  { _id: ObjectId("post_id") },
  { 
    $push: { 
      comments: {
        userId: ObjectId("user_id"),
        content: "Nice post!",
        createdAt: new Date()
      }
    }
  }
)

// Get posts with author info (JOIN)
db.posts.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "authorId",
      foreignField: "_id",
      as: "author"
    }
  },
  { $unwind: "$author" },
  { $sort: { createdAt: -1 } },
  { $limit: 10 }
])
```

### C. Quản lý Connections (Friendships)

```javascript
// Send friend request
db.connections.insertOne({
  userId1: ObjectId("sender_id"),
  userId2: ObjectId("receiver_id"),
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date()
})

// Accept friend request
db.connections.updateOne(
  {
    userId1: ObjectId("sender_id"),
    userId2: ObjectId("receiver_id"),
    status: "pending"
  },
  { 
    $set: { 
      status: "accepted",
      updatedAt: new Date()
    }
  }
)

// Get user's friends
db.connections.aggregate([
  {
    $match: {
      $or: [
        { userId1: ObjectId("user_id") },
        { userId2: ObjectId("user_id") }
      ],
      status: "accepted"
    }
  },
  {
    $project: {
      friendId: {
        $cond: {
          if: { $eq: ["$userId1", ObjectId("user_id")] },
          then: "$userId2",
          else: "$userId1"
        }
      }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "friendId",
      foreignField: "_id",
      as: "friend"
    }
  },
  { $unwind: "$friend" }
])

// Block user
db.connections.updateOne(
  {
    $or: [
      { userId1: ObjectId("user1"), userId2: ObjectId("user2") },
      { userId1: ObjectId("user2"), userId2: ObjectId("user1") }
    ]
  },
  { $set: { status: "blocked" } }
)
```

### D. Quản lý Chats & Messages

```javascript
// Create private chat
db.chats.insertOne({
  type: "private",
  participants: [ObjectId("user1"), ObjectId("user2")],
  lastMessage: null,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Send message
const chatId = ObjectId("chat_id");
const senderId = ObjectId("sender_id");
const content = "Hello!";

db.messages.insertOne({
  chatId: chatId,
  senderId: senderId,
  content: content,
  type: "text",
  readBy: [senderId],
  createdAt: new Date()
});

// Update chat's lastMessage
db.chats.updateOne(
  { _id: chatId },
  {
    $set: {
      lastMessage: {
        content: content,
        senderId: senderId,
        timestamp: new Date()
      },
      updatedAt: new Date()
    }
  }
)

// Get messages in chat
db.messages.find({ 
  chatId: ObjectId("chat_id") 
}).sort({ createdAt: 1 })

// Mark messages as read
db.messages.updateMany(
  {
    chatId: ObjectId("chat_id"),
    readBy: { $ne: ObjectId("user_id") }
  },
  { $addToSet: { readBy: ObjectId("user_id") } }
)

// Get user's chats with last message
db.chats.find({
  participants: ObjectId("user_id")
}).sort({ updatedAt: -1 })
```

---

## 6. BACKUP & RESTORE

### Backup Database

**Từ Windows:**
```powershell
# SSH vào VPS và backup
ssh root@202.92.6.223 -p 24700

# Backup toàn bộ database
docker exec grownet-mongodb mongodump \
  --username admin \
  --password changethispassword123 \
  --authenticationDatabase admin \
  --db grownet \
  --out /backup

# Copy backup về máy local
docker cp grownet-mongodb:/backup ./backup-$(date +%Y%m%d-%H%M%S)

# Hoặc backup trực tiếp về host
docker exec grownet-mongodb mongodump \
  --username admin \
  --password changethispassword123 \
  --authenticationDatabase admin \
  --db grownet \
  --archive=/backup/grownet-$(date +%Y%m%d).archive

# Download về Windows
exit
scp -P 24700 root@202.92.6.223:/var/www/GrowNet/backup-*.archive ./backups/
```

### Restore Database

```bash
# Upload backup file lên VPS
scp -P 24700 ./backup.archive root@202.92.6.223:/tmp/

# SSH vào VPS
ssh root@202.92.6.223 -p 24700

# Restore
docker cp /tmp/backup.archive grownet-mongodb:/tmp/
docker exec grownet-mongodb mongorestore \
  --username admin \
  --password changethispassword123 \
  --authenticationDatabase admin \
  --archive=/tmp/backup.archive
```

### Script tự động backup

Tạo script `/var/www/GrowNet/backup-db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/www/GrowNet/backups"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

docker exec grownet-mongodb mongodump \
  --username admin \
  --password changethispassword123 \
  --authenticationDatabase admin \
  --db grownet \
  --archive=$BACKUP_DIR/grownet-$DATE.archive

# Xóa backup cũ hơn 7 ngày
find $BACKUP_DIR -name "*.archive" -mtime +7 -delete

echo "Backup completed: grownet-$DATE.archive"
```

Thêm vào crontab để chạy hàng ngày:
```bash
chmod +x /var/www/GrowNet/backup-db.sh
crontab -e

# Thêm dòng này: backup lúc 2h sáng mỗi ngày
0 2 * * * /var/www/GrowNet/backup-db.sh >> /var/log/grownet-backup.log 2>&1
```

---

## 🎯 WORKFLOW ĐỀ XUẤT

### Khi phát triển (Development)
1. Dùng **MongoDB Compass** trên máy local
2. Connect qua SSH tunnel
3. Test queries, xem data trực quan
4. Copy queries vào code

### Khi production
1. Dùng **Mongo Express** để quick check
2. Backup tự động hàng ngày
3. Monitor qua logs: `docker-compose logs -f mongodb`

### Khi thiết kế schema mới
1. Update file `init-database.js`
2. Test trên local/dev database trước
3. Run `.\init-db.ps1` để apply

---

## 🔐 BẢO MẬT

1. **Đổi password MongoDB** trong `docker-compose.yml`
2. **Không expose port 27017** ra internet (chỉ dùng internal)
3. **Đổi password Mongo Express** nếu dùng
4. **Enable firewall** chỉ cho phép SSH
5. **Backup định kỳ**

---

## 📚 TÀI LIỆU THAM KHẢO

- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [MongoDB Compass Docs](https://docs.mongodb.com/compass/)
- [Aggregation Pipeline](https://docs.mongodb.com/manual/aggregation/)

---

**Câu hỏi thường gặp trong `DATABASE_GUIDE.md`**
