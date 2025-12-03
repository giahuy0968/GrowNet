import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect socket if user is not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      // Notify server that user is online
      newSocket.emit('user:online', user._id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('user:status', ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        if (status === 'online') {
          updated.add(userId);
        } else {
          updated.delete(userId);
        }
        return updated;
      });
    });

    newSocket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
