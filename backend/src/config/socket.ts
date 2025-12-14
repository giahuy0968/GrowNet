import { Server } from 'socket.io';

let ioInstance: Server | null = null;
const onlineUsers = new Map<string, string>();

export const initSocketServer = (server: Server): void => {
  ioInstance = server;
};

export const getSocketServer = (): Server => {
  if (!ioInstance) {
    throw new Error('Socket.IO server is not initialized');
  }
  return ioInstance;
};

export const registerOnlineUser = (userId: string, socketId: string): void => {
  onlineUsers.set(userId, socketId);
};

export const removeOnlineUserBySocket = (socketId: string): string | undefined => {
  for (const [userId, storedSocketId] of onlineUsers.entries()) {
    if (storedSocketId === socketId) {
      onlineUsers.delete(userId);
      return userId;
    }
  }
  return undefined;
};

export const getOnlineUsers = (): Map<string, string> => onlineUsers;

export const emitToUser = (userId: string, event: string, payload: unknown): void => {
  if (!ioInstance) {
    return;
  }

  const socketId = onlineUsers.get(userId);
  if (socketId) {
    ioInstance.to(socketId).emit(event, payload);
  }
};
