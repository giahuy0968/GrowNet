# GrowNet

🌱 **GrowNet** - Nền tảng kết nối và phát triển cộng đồng chuyên nghiệp

## 📋 Giới thiệu

GrowNet là một ứng dụng web full-stack cho phép người dùng:
- 👥 Kết nối với các chuyên gia và đồng nghiệp
- 💬 Trò chuyện real-time với Socket.IO
- 📝 Chia sẻ bài viết và kiến thức
- 🔔 Nhận thông báo thời gian thực
- 📊 Quản lý hồ sơ cá nhân và mạng lưới kết nối

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose**
- **Socket.IO** (Real-time communication)
- **JWT** (Authentication)
- **bcryptjs** (Password hashing)

### Frontend
- **React** + **TypeScript** + **Vite**
- **React Router** (Navigation)
- **Socket.IO Client** (Real-time)
- **MUI** (Material-UI components)
- **Chart.js** (Data visualization)
- **Tailwind CSS** (Styling)

## 🚀 Cài đặt và Chạy dự án

### Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB >= 7.0 (hoặc sử dụng MongoDB Atlas)
- npm hoặc yarn

### 1. Clone repository
```bash
git clone https://github.com/giahuy0968/GrowNet.git
cd GrowNet
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:
```env
# Application
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/grownet

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# File Upload (optional)
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

Chạy backend:
```bash
npm run dev
```

### 3. Cài đặt Frontend

```bash
cd ../frontend
npm install
```

Tạo file `.env` trong thư mục `frontend/`:
```env
# API Configuration
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
VITE_ENV=development
```

Chạy frontend:
```bash
npm run dev
```

### 4. Truy cập ứng dụng

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/api/health

## 📁 Cấu trúc dự án

```
GrowNet/
├── backend/
│   ├── src/
│   │   ├── config/        # Cấu hình (database, env)
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth, error handling
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── config/        # Configuration
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml     # Docker setup
├── Dockerfile            # Docker build
└── README.md
```

## 🔧 Scripts hữu ích

### Backend
```bash
npm run dev      # Chạy development mode
npm run build    # Build production
npm start        # Chạy production build
```

### Frontend
```bash
npm run dev      # Chạy development mode
npm run build    # Build production
npm run preview  # Preview production build
```

## 🐳 Chạy với Docker

```bash
# Build và chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Users
- `GET /api/users/profile` - Lấy thông tin profile
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users/search` - Tìm kiếm users

### Posts
- `GET /api/posts` - Lấy danh sách posts
- `POST /api/posts` - Tạo post mới
- `PUT /api/posts/:id` - Cập nhật post
- `DELETE /api/posts/:id` - Xóa post

### Chats
- `GET /api/chats` - Lấy danh sách chats
- `POST /api/chats` - Tạo chat mới
- `GET /api/chats/:id/messages` - Lấy messages

### Connections
- `GET /api/connections` - Lấy danh sách connections
- `POST /api/connections/request` - Gửi lời mời kết nối
- `PUT /api/connections/:id/accept` - Chấp nhận kết nối

### Notifications
- `GET /api/notifications` - Lấy thông báo
- `PUT /api/notifications/:id/read` - Đánh dấu đã đọc

## 🔌 Socket.IO Events

### Client → Server
- `user:online` - User online
- `chat:join` - Join chat room
- `message:send` - Gửi tin nhắn
- `typing:start` - Bắt đầu typing
- `typing:stop` - Dừng typing

### Server → Client
- `user:status` - User status update
- `message:new` - Tin nhắn mới
- `typing:user` - User đang typing
- `notification:new` - Thông báo mới

## 🔐 Bảo mật

- JWT authentication
- Password hashing với bcryptjs
- CORS protection
- Environment variables cho sensitive data
- Input validation

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📝 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👨‍💻 Tác giả

- GitHub: [@giahuy0968](https://github.com/giahuy0968)

## 📞 Liên hệ

Nếu có bất kỳ câu hỏi nào, vui lòng tạo issue trên GitHub.

---

⭐ Nếu project hữu ích, hãy cho một star nhé!