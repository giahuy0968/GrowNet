import apiService from './api.service';
import { User } from './auth.service';

export interface Connection {
  _id: string;
  userId1: User | string;
  userId2: User | string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

class ConnectionService {
  async sendRequest(userId: string): Promise<Connection> {
    return apiService.post<Connection>(`/connections/request/${userId}`);
  }

  async acceptRequest(connectionId: string): Promise<Connection> {
    return apiService.put<Connection>(`/connections/accept/${connectionId}`);
  }

  async rejectRequest(connectionId: string): Promise<{ message: string }> {
    return apiService.delete(`/connections/reject/${connectionId}`);
  }

  async getFriends(): Promise<User[]> {
    return apiService.get<User[]>('/connections/friends');
  }

  async getPendingRequests(): Promise<Connection[]> {
    return apiService.get<Connection[]>('/connections/pending');
  }

  async removeFriend(userId: string): Promise<{ message: string }> {
    return apiService.delete(`/connections/remove/${userId}`);
  }
}

export default new ConnectionService();
