# GrowNet Frontend API Integration

## 📦 Cấu trúc API Services

```
frontend/src/
├── config/
│   └── api.ts                 # API configuration
├── services/
│   ├── api.service.ts         # Base API service
│   ├── auth.service.ts        # Authentication
│   ├── user.service.ts        # User management
│   ├── post.service.ts        # Posts & comments
│   ├── chat.service.ts        # Chat & messages
│   ├── connection.service.ts  # Friend connections
│   ├── notification.service.ts # Notifications
│   └── index.ts              # Export all services
└── contexts/
    ├── AuthContext.tsx        # Auth state management
    ├── SocketContext.tsx      # Socket.IO connection
    └── index.ts              # Export all contexts
```

## 🚀 Cách sử dụng

### 1. Authentication

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login('email@example.com', 'password');
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>Welcome {user?.fullName}</div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 2. Gọi API trực tiếp

```tsx
import { authService, postService, userService } from '../services';

// Get current user
const user = await authService.getCurrentUser();

// Create a post
const newPost = await postService.createPost({
  content: 'Hello world!',
  images: []
});

// Search users
const users = await userService.searchUsers('John');

// Get all posts
const posts = await postService.getAllPosts();

// Like a post
await postService.toggleLike(postId);

// Add comment
await postService.addComment(postId, 'Nice post!');
```

### 3. Socket.IO Real-time

```tsx
import { useSocket } from '../contexts/SocketContext';

function ChatComponent() {
  const { socket, isConnected, onlineUsers } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Join chat room
    socket.emit('chat:join', chatId);

    // Listen for new messages
    socket.on('message:new', (message) => {
      console.log('New message:', message);
      // Update UI
    });

    // Listen for typing
    socket.on('typing:user', (userId) => {
      console.log('User typing:', userId);
    });

    return () => {
      socket.off('message:new');
      socket.off('typing:user');
    };
  }, [socket]);

  const sendMessage = (content: string) => {
    if (socket) {
      socket.emit('message:send', {
        chatId,
        content,
        senderId: user._id
      });
    }
  };

  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnected'}
      {/* Chat UI */}
    </div>
  );
}
```

### 4. Connection Management

```tsx
import { connectionService } from '../services';

// Send friend request
await connectionService.sendRequest(userId);

// Accept request
await connectionService.acceptRequest(connectionId);

// Get friends list
const friends = await connectionService.getFriends();

// Get pending requests
const pending = await connectionService.getPendingRequests();
```

### 5. Chat & Messages

```tsx
import { chatService } from '../services';

// Get all chats
const chats = await chatService.getAllChats();

// Get or create chat with user
const chat = await chatService.getOrCreateChat(userId);

// Get messages
const messages = await chatService.getMessages(chatId);

// Send message
const message = await chatService.sendMessage(chatId, {
  content: 'Hello!',
  type: 'text'
});

// Mark as read
await chatService.markAsRead(chatId);
```

### 6. Notifications

```tsx
import { notificationService } from '../services';

// Get notifications
const notifications = await notificationService.getNotifications();

// Mark as read
await notificationService.markAsRead(notificationId);

// Mark all as read
await notificationService.markAllAsRead();

// Delete notification
await notificationService.deleteNotification(notificationId);
```

## 🔧 Configuration

### Environment Variables (`.env`)

```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
VITE_ENV=development
```

### Vite Proxy (Development)

File `vite.config.ts` đã được cấu hình proxy tự động:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

## 🔐 Token Management

Token JWT được tự động lưu trong `localStorage` và gửi trong header của mỗi request.

```typescript
// Get token
const token = localStorage.getItem('token');

// All API calls automatically include:
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 📝 TypeScript Types

Tất cả services đều có TypeScript types đầy đủ:

```typescript
interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  interests?: string[];
  // ...
}

interface Post {
  _id: string;
  authorId: User | string;
  content: string;
  images?: string[];
  likes: string[];
  comments: Comment[];
  // ...
}
```

## 🎯 Socket Events

### Emit (Client -> Server)
- `user:online` - User đăng nhập
- `chat:join` - Join chat room
- `message:send` - Gửi tin nhắn
- `typing:start` - Bắt đầu typing
- `typing:stop` - Dừng typing

### Listen (Server -> Client)
- `user:status` - User online/offline status
- `message:new` - Tin nhắn mới
- `typing:user` - User đang typing
- `typing:stop` - Dừng typing

## 🚦 Error Handling

```tsx
try {
  const result = await postService.createPost(data);
} catch (error) {
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    authService.logout();
    navigate('/login');
  } else {
    // Show error message
    setError(error.message);
  }
}
```

## ✅ Đã hoàn thành

- ✅ API Service layer với TypeScript
- ✅ Authentication Context với auto-login
- ✅ Socket.IO Context với real-time connection
- ✅ Proxy configuration cho development
- ✅ Token management tự động
- ✅ Error handling
- ✅ TypeScript types đầy đủ
- ✅ Cập nhật Login & Register pages với API integration

## 🎯 Next Steps

Bạn có thể bắt đầu integrate API vào các pages khác:
- Dashboard: Get posts, create posts
- Chat: Real-time messaging
- Profile: Update user info
- Connections: Friend management

Chúc bạn code vui vẻ! 🚀
