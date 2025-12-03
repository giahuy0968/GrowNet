import apiService from './api.service';
import { User } from './auth.service';

export interface Message {
  _id: string;
  chatId: string;
  senderId: User | string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  readBy: string[];
  createdAt: string;
}

export interface Chat {
  _id: string;
  type: 'private' | 'group';
  participants: (User | string)[];
  name?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageData {
  content: string;
  type?: 'text' | 'image' | 'file';
}

class ChatService {
  async getAllChats(): Promise<Chat[]> {
    return apiService.get<Chat[]>('/chats');
  }

  async getOrCreateChat(userId: string): Promise<Chat> {
    return apiService.get<Chat>(`/chats/with/${userId}`);
  }

  async getMessages(chatId: string, page: number = 1): Promise<Message[]> {
    return apiService.get<Message[]>(`/chats/${chatId}/messages?page=${page}`);
  }

  async sendMessage(chatId: string, data: SendMessageData): Promise<Message> {
    return apiService.post<Message>(`/chats/${chatId}/messages`, data);
  }

  async markAsRead(chatId: string): Promise<{ message: string }> {
    return apiService.put(`/chats/${chatId}/read`);
  }
}

export default new ChatService();
