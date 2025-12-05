import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import connectionRoutes from './routes/connectionRoutes';
import chatRoutes from './routes/chatRoutes';
import notificationRoutes from './routes/notificationRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

const corsOptions: cors.CorsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://202.92.6.223:3000',
    'http://202.92.6.223:5173',
    'http://202.92.6.223',
    process.env.CLIENT_URL || 'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.IO connection handling
const onlineUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket: any) => {
  console.log('User connected:', socket.id);

  // User joins
  socket.on('user:online', (userId: string) => {
    onlineUsers.set(userId, socket.id);
    io.emit('user:status', { userId, status: 'online' });
  });

  // Join chat room
  socket.on('chat:join', (chatId: string) => {
    socket.join(`chat:${chatId}`);
  });

  // Send message
  socket.on('message:send', (data: any) => {
    io.to(`chat:${data.chatId}`).emit('message:new', data);
  });

  // Typing indicator
  socket.on('typing:start', (data: { chatId: string; userId: string }) => {
    socket.to(`chat:${data.chatId}`).emit('typing:user', data.userId);
  });

  socket.on('typing:stop', (data: { chatId: string }) => {
    socket.to(`chat:${data.chatId}`).emit('typing:stop');
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and remove user from online list
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('user:status', { userId, status: 'offline' });
        break;
      }
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO is ready for connections`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
