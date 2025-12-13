import apiService, { ApiResponse } from './api.service';
import { User } from './auth.service';
import { Chat } from './chat.service';

export interface Connection {
  _id: string;
  userId1: User | string;
  userId2: User | string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface FriendsResult {
  friends: User[];
  count: number;
}

export interface PendingRequestsResult {
  requests: Connection[];
  count: number;
}

export interface ConnectionMatchResult {
  connection: Connection;
  matched: boolean;
  chat?: Chat;
}

class ConnectionService {
  async sendRequest(userId: string): Promise<ConnectionMatchResult> {
    const response = await apiService.post<ApiResponse<ConnectionMatchResult>>(`/connections/request/${userId}`);
    return response.data;
  }

  async acceptRequest(connectionId: string): Promise<ConnectionMatchResult> {
    const response = await apiService.put<ApiResponse<ConnectionMatchResult>>(`/connections/accept/${connectionId}`);
    return response.data;
  }

  async rejectRequest(connectionId: string): Promise<string> {
    const response = await apiService.delete<ApiResponse<null>>(`/connections/reject/${connectionId}`);
    return response.message || 'Friend request rejected';
  }

  async getFriends(): Promise<FriendsResult> {
    const response = await apiService.get<ApiResponse<User[], { count: number }>>('/connections/friends');
    return {
      friends: response.data,
      count: response.meta?.count ?? response.data.length
    };
  }

  async getPendingRequests(): Promise<PendingRequestsResult> {
    const response = await apiService.get<ApiResponse<Connection[], { count: number }>>('/connections/pending');
    return {
      requests: response.data,
      count: response.meta?.count ?? response.data.length
    };
  }

  async removeFriend(userId: string): Promise<string> {
    const response = await apiService.delete<ApiResponse<null>>(`/connections/remove/${userId}`);
    return response.message || 'Friend removed successfully';
  }
}

export default new ConnectionService();
