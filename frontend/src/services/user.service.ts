import apiService, { ApiResponse } from './api.service';
import { User } from './auth.service';

export interface UserStats {
  connections: number;
  posts: number;
}

class UserService {
  async getUserById(id: string): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  }

  async searchUsers(query: string): Promise<{ users: User[]; count: number }> {
    const response = await apiService.get<ApiResponse<User[], { count: number }>>(
      `/users/search?q=${encodeURIComponent(query)}`
    );

    return {
      users: response.data,
      count: response.meta?.count ?? response.data.length
    };
  }

  async getSuggestedUsers(): Promise<User[]> {
    const response = await apiService.get<ApiResponse<User[]>>('/users/suggested');
    return response.data;
  }

  async getUserStats(id: string): Promise<UserStats> {
    const response = await apiService.get<ApiResponse<UserStats>>(`/users/${id}/stats`);
    return response.data;
  }
}

export default new UserService();
