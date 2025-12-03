# Backend API Documentation

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (requires auth)
- `PUT /profile` - Update profile (requires auth)
- `PUT /password` - Change password (requires auth)

### Users (`/api/users`)
- `GET /search?q=keyword` - Search users
- `GET /suggested` - Get suggested users
- `GET /:id` - Get user by ID
- `GET /:id/stats` - Get user statistics

### Posts (`/api/posts`)
- `POST /` - Create post
- `GET /` - Get all posts (feed)
- `GET /:id` - Get post by ID
- `GET /user/:userId` - Get user's posts
- `PUT /:id` - Update post
- `DELETE /:id` - Delete post
- `POST /:id/like` - Like/unlike post
- `POST /:id/comment` - Add comment
- `DELETE /:postId/comment/:commentId` - Delete comment

### Connections (`/api/connections`)
- `POST /request/:userId` - Send friend request
- `PUT /accept/:id` - Accept friend request
- `DELETE /reject/:id` - Reject friend request
- `GET /friends` - Get friends list
- `GET /pending` - Get pending requests
- `DELETE /remove/:userId` - Remove friend

### Chats (`/api/chats`)
- `GET /` - Get all chats
- `GET /with/:userId` - Get or create private chat
- `GET /:chatId/messages` - Get messages
- `POST /:chatId/messages` - Send message
- `PUT /:chatId/read` - Mark messages as read

### Notifications (`/api/notifications`)
- `GET /` - Get notifications
- `PUT /:id/read` - Mark as read
- `PUT /read-all` - Mark all as read
- `DELETE /:id` - Delete notification

## 🔌 Socket.IO Events

### Client → Server
- `user:online` - User comes online
- `chat:join` - Join chat room
- `message:send` - Send message
- `typing:start` - User starts typing
- `typing:stop` - User stops typing

### Server → Client
- `user:status` - User online/offline status
- `message:new` - New message received
- `typing:user` - User is typing
- `typing:stop` - User stopped typing

## 🚀 Running the Backend

```bash
# Install dependencies
cd backend
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## 📦 Tech Stack

- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Socket.IO** - Real-time chat
- **bcryptjs** - Password hashing
- **express-validator** - Request validation
