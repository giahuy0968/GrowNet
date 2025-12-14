import apiService, { ApiResponse } from './api.service';
import { User } from './auth.service';

export interface UserStats {
  connections: number;
  posts: number;
}

export interface UserSearchFilters {
  q?: string;
  interests?: string[];
  location?: string;
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

  async filterUsers(filters: UserSearchFilters): Promise<{ users: User[]; count: number }> {
    const params = new URLSearchParams();
    if (filters.q) {
      params.set('q', filters.q);
    }
    if (filters.interests?.length) {
      params.set('interests', filters.interests.join(','));
    }
    if (filters.location) {
      params.set('location', filters.location);
    }

    const queryString = params.toString();
    const response = await apiService.get<ApiResponse<User[], { count: number }>>(
      `/users/search${queryString ? `?${queryString}` : ''}`
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
