import apiService from './api.service';
import { User } from './auth.service';

export interface UserStats {
  postsCount: number;
  friendsCount: number;
  connectionsCount: number;
}

class UserService {
  async getUserById(id: string): Promise<User> {
    return apiService.get<User>(`/users/${id}`);
  }

  async searchUsers(query: string): Promise<User[]> {
    return apiService.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  }

  async getSuggestedUsers(): Promise<User[]> {
    return apiService.get<User[]>('/users/suggested');
  }

  async getUserStats(id: string): Promise<UserStats> {
    return apiService.get<UserStats>(`/users/${id}/stats`);
  }
}

export default new UserService();
