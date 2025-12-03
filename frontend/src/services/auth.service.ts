import apiService from './api.service';
import { setAuthToken, removeAuthToken } from '../config/api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  interests?: string[];
  location?: {
    city?: string;
    country?: string;
  };
  age?: number;
  gender?: string;
  createdAt: string;
  lastActive: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', data);
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', data);
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/auth/me');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiService.put<User>('/auth/profile', data);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiService.put('/auth/password', { currentPassword, newPassword });
  }

  logout(): void {
    removeAuthToken();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();
