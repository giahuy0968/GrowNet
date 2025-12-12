import apiService, { ApiResponse } from './api.service';
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

export interface ChatListResult {
  chats: Chat[];
  count: number;
}

export interface MessageListResult {
  messages: Message[];
  count: number;
}

class ChatService {
  async getAllChats(): Promise<ChatListResult> {
    const response = await apiService.get<ApiResponse<Chat[], { count: number }>>('/chats');
    return {
      chats: response.data,
      count: response.meta?.count ?? response.data.length
    };
  }

  async getOrCreateChat(userId: string): Promise<Chat> {
    const response = await apiService.get<ApiResponse<Chat>>(`/chats/with/${userId}`);
    return response.data;
  }

  async getMessages(chatId: string, page: number = 1): Promise<MessageListResult> {
    const response = await apiService.get<ApiResponse<Message[], { count: number }>>(
      `/chats/${chatId}/messages?page=${page}`
    );

    return {
      messages: response.data,
      count: response.meta?.count ?? response.data.length
    };
  }

  async sendMessage(chatId: string, data: SendMessageData): Promise<Message> {
    const response = await apiService.post<ApiResponse<Message>>(`/chats/${chatId}/messages`, data);
    return response.data;
  }

  async markAsRead(chatId: string): Promise<string> {
    const response = await apiService.put<ApiResponse<null>>(`/chats/${chatId}/read`);
    return response.message || 'Messages marked as read';
  }
}

export default new ChatService();
