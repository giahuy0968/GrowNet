# Hướng dẫn quản lý Database cho GrowNet

## 1. Kiến trúc Database

GrowNet sử dụng **MongoDB** với các collections chính:

```
grownet/
├── users           # Thông tin người dùng
├── posts           # Bài viết
├── chats           # Phòng chat
├── messages        # Tin nhắn
└── connections     # Kết nối giữa users
```

## 2. Schema Collections

### Collection: users
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  fullName: String,
  bio: String,
  avatar: String,
  interests: [String],
  location: {
    city: String,
    country: String
  },
  age: Number,
  gender: String,
  createdAt: Date,
  updatedAt: Date,
  lastActive: Date
}
```

### Collection: posts
```javascript
{
  _id: ObjectId,
  authorId: ObjectId (ref: users),
  content: String,
  images: [String],
  likes: [ObjectId],
  comments: [{
    userId: ObjectId,
    content: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: chats
```javascript
{
  _id: ObjectId,
  type: String, // 'private' or 'group'
  participants: [ObjectId],
  name: String, // for group chats
  lastMessage: {
    content: String,
    senderId: ObjectId,
    timestamp: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: messages
```javascript
{
  _id: ObjectId,
  chatId: ObjectId (ref: chats),
  senderId: ObjectId (ref: users),
  content: String,
  type: String, // 'text', 'image', 'file'
  fileUrl: String,
  readBy: [ObjectId],
  createdAt: Date
}
```

### Collection: connections
```javascript
{
  _id: ObjectId,
  userId1: ObjectId (ref: users),
  userId2: ObjectId (ref: users),
  status: String, // 'pending', 'accepted', 'blocked'
  createdAt: Date,
  updatedAt: Date
}
```

## 3. Kết nối Database

### 3.1. Từ VPS (trực tiếp)
```bash
# SSH vào VPS
ssh root@202.92.6.223 -p 24700

# Vào MongoDB shell
docker exec -it grownet-mongodb mongosh "mongodb://admin:your-password@localhost:27017/grownet?authSource=admin"
```

### 3.2. Từ máy local (port forwarding)
```bash
# Tạo SSH tunnel
ssh -L 27017:localhost:27017 root@202.92.6.223 -p 24700 -N

# Ở terminal khác, kết nối MongoDB
mongosh "mongodb://admin:your-password@localhost:27017/grownet?authSource=admin"
```

### 3.3. Dùng MongoDB Compass (GUI)
1. Tạo SSH tunnel (như trên)
2. Mở MongoDB Compass
3. Connection string: `mongodb://admin:your-password@localhost:27017/grownet?authSource=admin`

## 4. Các thao tác Database phổ biến

### 4.1. Quản lý Users

```javascript
// Tạo user mới
db.users.insertOne({
  username: "john_doe",
  email: "john@example.com",
  password: "$2b$10$hashed_password", // Nhớ hash password!
  fullName: "John Doe",
  bio: "Hello, I'm John!",
  interests: ["technology", "travel", "photography"],
  createdAt: new Date(),
  updatedAt: new Date()
})

// Tìm user theo email
db.users.findOne({ email: "john@example.com" })

// Cập nhật profile
db.users.updateOne(
  { email: "john@example.com" },
  { 
    $set: { 
      bio: "Updated bio",
      updatedAt: new Date()
    }
  }
)

// Xóa user
db.users.deleteOne({ email: "john@example.com" })

// Tìm users theo interests
db.users.find({ interests: "technology" })

// Đếm tổng số users
db.users.countDocuments()

// Lấy 10 users mới nhất
db.users.find().sort({ createdAt: -1 }).limit(10)
```

### 4.2. Quản lý Posts

```javascript
// Tạo post mới
db.posts.insertOne({
  authorId: ObjectId("user_id_here"),
  content: "This is my first post!",
  images: ["https://example.com/image.jpg"],
  likes: [],
  comments: [],
  createdAt: new Date(),
  updatedAt: new Date()
})

// Lấy posts của user
db.posts.find({ authorId: ObjectId("user_id_here") }).sort({ createdAt: -1 })

// Like post
db.posts.updateOne(
  { _id: ObjectId("post_id_here") },
  { $addToSet: { likes: ObjectId("user_id_here") } }
)

// Unlike post
db.posts.updateOne(
  { _id: ObjectId("post_id_here") },
  { $pull: { likes: ObjectId("user_id_here") } }
)

// Comment vào post
db.posts.updateOne(
  { _id: ObjectId("post_id_here") },
  { 
    $push: { 
      comments: {
        userId: ObjectId("user_id_here"),
        content: "Great post!",
        createdAt: new Date()
      }
    }
  }
)

// Xóa post
db.posts.deleteOne({ _id: ObjectId("post_id_here") })

// Lấy posts có nhiều likes nhất
db.posts.find().sort({ "likes.length": -1 }).limit(10)
```

### 4.3. Quản lý Chats & Messages

```javascript
// Tạo chat private
db.chats.insertOne({
  type: "private",
  participants: [
    ObjectId("user1_id"),
    ObjectId("user2_id")
  ],
  lastMessage: null,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Gửi message
const message = {
  chatId: ObjectId("chat_id_here"),
  senderId: ObjectId("user_id_here"),
  content: "Hello!",
  type: "text",
  readBy: [ObjectId("user_id_here")],
  createdAt: new Date()
}
db.messages.insertOne(message)

// Cập nhật lastMessage của chat
db.chats.updateOne(
  { _id: ObjectId("chat_id_here") },
  { 
    $set: { 
      lastMessage: {
        content: "Hello!",
        senderId: ObjectId("user_id_here"),
        timestamp: new Date()
      },
      updatedAt: new Date()
    }
  }
)

// Lấy messages của chat
db.messages.find({ chatId: ObjectId("chat_id_here") }).sort({ createdAt: 1 })

// Đánh dấu đã đọc
db.messages.updateMany(
  { 
    chatId: ObjectId("chat_id_here"),
    readBy: { $ne: ObjectId("user_id_here") }
  },
  { $addToSet: { readBy: ObjectId("user_id_here") } }
)

// Lấy tất cả chats của user
db.chats.find({ 
  participants: ObjectId("user_id_here") 
}).sort({ updatedAt: -1 })
```

### 4.4. Quản lý Connections

```javascript
// Gửi friend request
db.connections.insertOne({
  userId1: ObjectId("sender_id"),
  userId2: ObjectId("receiver_id"),
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date()
})

// Chấp nhận friend request
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

// Lấy danh sách bạn bè
db.connections.find({
  $or: [
    { userId1: ObjectId("user_id_here") },
    { userId2: ObjectId("user_id_here") }
  ],
  status: "accepted"
})

// Hủy kết bạn
db.connections.deleteOne({
  $or: [
    { userId1: ObjectId("user1_id"), userId2: ObjectId("user2_id") },
    { userId1: ObjectId("user2_id"), userId2: ObjectId("user1_id") }
  ]
})

// Block user
db.connections.updateOne(
  {
    $or: [
      { userId1: ObjectId("user1_id"), userId2: ObjectId("user2_id") },
      { userId1: ObjectId("user2_id"), userId2: ObjectId("user1_id") }
    ]
  },
  { 
    $set: { 
      status: "blocked",
      updatedAt: new Date()
    }
  }
)
```

## 5. Queries nâng cao

### 5.1. Aggregation Pipeline

```javascript
// Thống kê posts theo user
db.posts.aggregate([
  {
    $group: {
      _id: "$authorId",
      totalPosts: { $sum: 1 },
      totalLikes: { $sum: { $size: "$likes" } }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user"
    }
  },
  { $sort: { totalPosts: -1 } }
])

// Tìm users phổ biến nhất (nhiều connections)
db.connections.aggregate([
  { $match: { status: "accepted" } },
  {
    $group: {
      _id: null,
      allUsers: { 
        $push: { $concatArrays: [["$userId1"], ["$userId2"]] }
      }
    }
  },
  { $unwind: "$allUsers" },
  { $unwind: "$allUsers" },
  {
    $group: {
      _id: "$allUsers",
      connectionCount: { $sum: 1 }
    }
  },
  { $sort: { connectionCount: -1 } },
  { $limit: 10 }
])

// Lấy feed posts từ bạn bè
db.posts.aggregate([
  {
    $lookup: {
      from: "connections",
      let: { authorId: "$authorId" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $or: [
                    { $eq: ["$userId1", ObjectId("current_user_id")] },
                    { $eq: ["$userId2", ObjectId("current_user_id")] }
                  ]
                },
                {
                  $or: [
                    { $eq: ["$userId1", "$$authorId"] },
                    { $eq: ["$userId2", "$$authorId"] }
                  ]
                },
                { $eq: ["$status", "accepted"] }
              ]
            }
          }
        }
      ],
      as: "connection"
    }
  },
  { $match: { connection: { $ne: [] } } },
  { $sort: { createdAt: -1 } },
  { $limit: 20 }
])
```

### 5.2. Text Search

```javascript
// Tạo text index
db.users.createIndex({ 
  username: "text", 
  fullName: "text", 
  bio: "text" 
})

db.posts.createIndex({ content: "text" })

// Tìm kiếm users
db.users.find({ $text: { $search: "john photographer" } })

// Tìm kiếm posts
db.posts.find({ $text: { $search: "travel adventure" } })
```

## 6. Backup & Restore

### 6.1. Backup Database

```bash
# Backup toàn bộ database
docker exec grownet-mongodb mongodump \
  --username admin \
  --password your-password \
  --authenticationDatabase admin \
  --db grownet \
  --out /backup

# Copy backup ra host
docker cp grownet-mongodb:/backup ./backup-$(date +%Y%m%d-%H%M%S)

# Backup chỉ 1 collection
docker exec grownet-mongodb mongodump \
  --username admin \
  --password your-password \
  --authenticationDatabase admin \
  --db grownet \
  --collection users \
  --out /backup
```

### 6.2. Restore Database

```bash
# Restore toàn bộ database
docker exec -i grownet-mongodb mongorestore \
  --username admin \
  --password your-password \
  --authenticationDatabase admin \
  --db grownet \
  /backup/grownet

# Restore 1 collection
docker exec -i grownet-mongodb mongorestore \
  --username admin \
  --password your-password \
  --authenticationDatabase admin \
  --db grownet \
  --collection users \
  /backup/grownet/users.bson
```

### 6.3. Export/Import JSON

```bash
# Export collection sang JSON
docker exec grownet-mongodb mongoexport \
  --username admin \
  --password your-password \
  --authenticationDatabase admin \
  --db grownet \
  --collection users \
  --out /tmp/users.json

# Copy ra host
docker cp grownet-mongodb:/tmp/users.json ./users.json

# Import từ JSON
docker cp ./users.json grownet-mongodb:/tmp/
docker exec grownet-mongodb mongoimport \
  --username admin \
  --password your-password \
  --authenticationDatabase admin \
  --db grownet \
  --collection users \
  --file /tmp/users.json
```

## 7. Maintenance & Optimization

### 7.1. Kiểm tra Index

```javascript
// Xem indexes của collection
db.users.getIndexes()
db.posts.getIndexes()

// Tạo index mới
db.messages.createIndex({ chatId: 1, createdAt: -1 })
db.posts.createIndex({ authorId: 1, createdAt: -1 })

// Xóa index không dùng
db.users.dropIndex("index_name")
```

### 7.2. Analyze Performance

```javascript
// Explain query
db.users.find({ email: "test@example.com" }).explain("executionStats")

// Xem slow queries
db.system.profile.find().sort({ ts: -1 })

// Enable profiling
db.setProfilingLevel(1, { slowms: 100 })
```

### 7.3. Database Stats

```javascript
// Thống kê database
db.stats()

// Thống kê collection
db.users.stats()
db.posts.stats()

// Xem kích thước storage
db.users.storageSize()
db.users.totalIndexSize()
```

## 8. Security Best Practices

1. **Luôn hash passwords** trước khi lưu vào database
2. **Không expose MongoDB port** ra ngoài (chỉ internal network)
3. **Sử dụng strong passwords** cho MongoDB admin
4. **Regular backups** - backup hàng ngày
5. **Limit privileges** - tạo users với quyền hạn phù hợp
6. **Enable audit logs** cho production

```javascript
// Tạo user với quyền hạn giới hạn
use admin
db.createUser({
  user: "grownet_app",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "grownet" }
  ]
})
```

## 9. Monitoring

```bash
# Monitor MongoDB status
docker exec grownet-mongodb mongosh --eval "db.serverStatus()"

# Check connections
docker exec grownet-mongodb mongosh --eval "db.currentOp()"

# Database size
docker exec grownet-mongodb mongosh --eval "db.stats()"
```

## 10. Troubleshooting

### Connection refused
```bash
# Kiểm tra MongoDB đang chạy
docker ps | grep mongodb
docker logs grownet-mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Out of memory
```bash
# Check memory usage
docker stats grownet-mongodb

# Tăng memory limit trong docker-compose.yml
services:
  mongodb:
    mem_limit: 2g
```

### Slow queries
```javascript
// Enable profiling
db.setProfilingLevel(1, { slowms: 100 })

// Analyze
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 })

// Fix: Tạo indexes phù hợp
```

---

**Tài liệu tham khảo**:
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [MongoDB University](https://university.mongodb.com/)
